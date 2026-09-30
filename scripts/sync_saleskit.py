"""Fetch public Sales Kit pages; parse supported offers without guessing complex rules."""
import argparse, hashlib, json, re, sys
from datetime import date, datetime
from zoneinfo import ZoneInfo
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

BASE = 'https://sites.google.com/view/samsungsaleskit/'
PAGES = ['s-series','z-series','a-series','tablets','wearables','edusmb','accessories','loyalty','eol']
class TextParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.skip=0
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style'): self.skip+=1
        if tag in ('p','div','br','h1','h2','h3','li'): self.parts.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.skip-=1
        if tag in ('p','div'): self.parts.append('\n')
    def handle_data(self, text):
        if not self.skip: self.parts.append(text)
def text_of(html):
    p=TextParser(); p.feed(html)
    return '\n'.join(re.sub(r'\s+',' ',s).strip() for s in ''.join(p.parts).splitlines() if s.strip())
def norm(s): return re.sub(r'[^a-z0-9]','',s.lower())
def iso_date(s):
    d,m,y=map(int,s.split('/')); y=y+2000 if y<100 else y
    return date(y,m,d).isoformat()
def blocks(text):
    # Ignore the historical changelog; expired offers are never imported as live promotions.
    text=re.split(r'(?im)^.*Changelog.*$',text)[0]
    lines=text.splitlines(); out=[]
    for i,line in enumerate(lines):
        match=re.fullmatch(r'\(\s*Ends\s+(\d{1,2}/\d{1,2}/\d{2,4})\s*\)',line,re.I)
        if not match: continue
        if i==0: raise ValueError('Offer missing heading')
        following=lines[i+1:]; end=next((j for j,l in enumerate(following) if 'Bulletin Code:' in l),None)
        if end is None: raise ValueError('Offer missing bulletin: '+lines[i-1])
        body='\n'.join(following[:end+1]); code=re.search(r'Bulletin Code:\s*(A\d+|RTL\d+|RPG\d+)',body)
        if not code: raise ValueError('Unrecognised bulletin')
        out.append(dict(name=lines[i-1],end=iso_date(match[1]),body=body,bulletin=code[1]))
    return out

def parse_education(text, existing):
    offers=blocks(text); result=[]
    for category in ['Mobile','Tablet','Wearable']:
        matches=[o for o in offers if norm(o['name'])==norm(category+' Education Offer')]
        if len(matches)!=1: raise ValueError('Missing or ambiguous '+category+' Education offer')
        o=matches[0]; rates=set(re.findall(r'(\d+(?:\.\d+)?)%\s*OFF',o['body'],re.I))
        if len(rates)!=1: raise ValueError('Mixed Education rates need review')
        rate=float(next(iter(rates)))
        if not 0<rate<=100: raise ValueError('Invalid Education rate')
        # Coverage/stacking wording must match a reviewed baseline. Date, rate and bulletin can change.
        scope=re.sub(r'\d+(?:\.\d+)?%','RATE%',o['body'])
        scope=re.sub(r'Bulletin Code:.*','',scope).strip()
        baseline=existing[category]
        if norm(scope)!=norm(baseline['scope']): raise ValueError(category+' Education coverage or stacking changed; review required')
        result.append(dict(id='synced-edu-'+category.lower(),name=category+' Education Offer',type='percent',value=rate,
          targets=baseline['targets'],note=o['body'],start=None,end=o['end'],kind='education',stack='all',bulletin=o['bulletin']))
    return result

def retail_offers(text, devices, warnings):
    result=[]
    for o in blocks(text):
        heading=re.fullmatch(r'(.+?)\s+SAVE\s+(?:\$(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)%)',o['name'],re.I)
        if not heading:
            warnings.append('Manual review: '+o['name']); continue
        target=norm(heading[1]); matches=[]
        for d in devices:
            names=[d['n'].replace('Galaxy ','').replace('Samsung ','').replace(' 5G',''),d['n'].replace('Galaxy Z ','')]
            if target in map(norm,names): matches.append('model:'+d['m'])
        matches=sorted(set(matches))
        if len(matches)!=1:
            warnings.append('Device mapping requires review: '+o['name']); continue
        if 'STACKABLE WITH ALL OFFERS EXCLUDING EDUCATION & SMB' not in o['body']:
            warnings.append('Stacking requires review: '+o['name']); continue
        kind='fixed' if heading[2] else 'percent'; amount=float(heading[2] or heading[3])
        if amount<=0 or (kind=='percent' and amount>100): raise ValueError('Invalid retail amount')
        # Require the purchase description to confirm the advertised amount.
        token=(r'\$'+re.escape(heading[2])) if heading[2] else (re.escape(heading[3])+r'%')
        if not re.search(token,o['body']): raise ValueError('Retail headline/body amount mismatch')
        start_match=re.search(r'Available:\s*(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Za-z]+)\s+(\d{4})',o['body'],re.I)
        if not start_match:
            warnings.append('Start date requires review: '+o['name']); continue
        start=datetime.strptime(' '.join(start_match.groups()),'%d %B %Y').date().isoformat()
        if start>o['end']: raise ValueError('Offer ends before it starts')
        result.append(dict(id='synced-'+o['bulletin'].lower()+'-'+norm(o['name']),name=o['name'],type=kind,value=amount,
            targets=matches,note=o['body'],start=start,end=o['end'],kind='retail',stack='exclude-education-smb',bulletin=o['bulletin']))
    return result

def read_array(html,name):
    m=re.search(r'const '+name+r' = (\[.*?\]);',html)
    if not m: raise ValueError('Missing '+name)
    return m,json.loads(m[1])

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]);args=parser.parse_args();root=args.root
    html=(root/'index.html').read_text(); pm,promos=read_array(html,'PROMOS');_,devices=read_array(html,'DEVICES')
    config=json.loads((root/'scripts/saleskit-baseline.json').read_text()); pages={};warnings=[]
    for slug in PAGES:
        r=urlopen(Request(BASE+slug,headers={'User-Agent':'GalaxyDealQualifier-SalesKitSync/1.0'}),timeout=30)
        if 'sites.google.com/view/samsungsaleskit/' not in r.url: raise ValueError('Source redirected to sign-in')
        text=text_of(r.read().decode('utf-8'))
        if 'Sales Kit' not in text or len(text)<200: raise ValueError('Source unavailable: '+slug)
        pages[slug]=text
    updated=parse_education(pages['edusmb'],config['education'])
    for slug in ['s-series','z-series','a-series','tablets','wearables']:
        updated.extend(retail_offers(pages[slug],devices,warnings))
    # Keep expired history but replace live simple retail offers from the inspected category pages.
    today=datetime.now(ZoneInfo('Australia/Melbourne')).date().isoformat()
    keep=[o for o in promos if o['kind'] not in ('education','retail') or (o['kind']=='retail' and o.get('end') and o['end']<today)]
    for slug in ['accessories','loyalty','eol']:
        if hashlib.sha256(norm(pages[slug]).encode()).hexdigest()!=config['pageHashes'][slug]:
            warnings.append(slug+' page changed; complex rules require manual review')
    # Complex sections on product pages need review if content other than supported simple offers changes.
    for slug in ['s-series','z-series','a-series','tablets','wearables']:
        complex_text=re.split(r'(?im)^.*Changelog.*$',pages[slug])[0]
        for o in blocks(complex_text):
            complex_text=complex_text.replace(o['name'],'').replace('(Ends '+date.fromisoformat(o['end']).strftime('%d/%m/%y')+')','').replace(o['body'],'')
        # Full-page changes are reported; parsing still only applies explicitly supported simple offers.
        if hashlib.sha256(norm(pages[slug]).encode()).hexdigest()!=config['pageHashes'][slug]:
            warnings.append(slug+' changed since review; check trade-in, MBO and other complex sections')
    # SMB membership/rates remain reviewed, not guessed from family prose.
    smb_text='\n'.join(o['body'] for o in blocks(pages['edusmb']) if o['name'].startswith('SMB'))
    if norm(smb_text)!=norm(config['smbText']):warnings.append('SMB coverage/rules changed; manual review required')
    updated_ids={o['id'] for o in updated}
    new_promos=[o for o in keep if o['id'] not in updated_ids]+updated
    html=html[:pm.start(1)]+json.dumps(new_promos,ensure_ascii=True).replace('<',r'\u003c').replace('>',r'\u003e').replace('&',r'\u0026')+html[pm.end(1):]
    status=dict(checkedAt=datetime.now(ZoneInfo('Australia/Melbourne')).isoformat(),source=BASE+'home',warnings=warnings,
      scope='Education and simple retail offers; complex rules require manual review',offerCount=len(updated))
    html=re.sub(r'const SALESKIT_SYNC_STATUS = [^\n]*;', 'const SALESKIT_SYNC_STATUS = '+json.dumps(status)+';',html,count=1)
    # Avoid a half-written update if any source/parser fails: only write after all validations succeed.
    (root/'index.html').write_text(html)
    (root/'saleskit-sync-status.json').write_text(json.dumps(status,indent=2)+'\n')
    print(json.dumps(status,indent=2))
if __name__=='__main__':
    try:main()
    except Exception as e:print('Sync stopped; previous offers retained: '+str(e),file=sys.stderr);sys.exit(1)
