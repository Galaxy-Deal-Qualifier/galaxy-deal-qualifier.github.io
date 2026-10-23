import json, unittest
from pathlib import Path
from sync_saleskit import blocks, iso_date, parse_education, retail_offers, keep_reviewed_offer, read_array

ROOT=Path(__file__).resolve().parents[1]
class SyncTests(unittest.TestCase):
    def test_standing_watch_clearance_survives_sync(self):
        _,promos=read_array((ROOT/'index.html').read_text(),'PROMOS')
        clearance=next(o for o in promos if o['id']=='saleskit_eol_watch8')
        self.assertIn('model:m25',clearance['targets'])
        self.assertEqual(clearance['value'],50)
        self.assertTrue(keep_reviewed_offer(clearance,'2026-10-23'))
        self.assertTrue(keep_reviewed_offer(clearance,'2027-01-01'))
        # A normal dated live offer is still replaced, and expired history is retained.
        dated=dict(clearance,end='2026-10-23')
        self.assertFalse(keep_reviewed_offer(dated,'2026-10-23'))
        self.assertTrue(keep_reviewed_offer(dated,'2026-10-24'))
        self.assertFalse(keep_reviewed_offer(dict(clearance,kind='education'),'2026-10-23'))
        self.assertTrue(keep_reviewed_offer(dict(clearance,kind='smb'),'2026-10-23'))
    def test_dates(self):
        self.assertEqual(iso_date('02/11/2026'),'2026-11-02')
        self.assertEqual(iso_date('07/10/26'),'2026-10-07')
        with self.assertRaises(ValueError):iso_date('31/02/26')
    def fixture(self):
        config=json.loads((ROOT/'scripts/saleskit-baseline.json').read_text())['education']
        text='\n'.join(k.upper()+' EDUCATION OFFER\n(Ends 02/11/2026)\n'+v['scope'].replace('RATE%','20%')+'\nBulletin Code: A260006390' for k,v in config.items())
        return config,text
    def test_education_and_coverage_guard(self):
        c,t=self.fixture(); self.assertEqual(len(parse_education(t,c)),3)
        with self.assertRaises(ValueError):parse_education(t.replace('A Series Family','All products'),c)
        with self.assertRaises(ValueError):parse_education(t.replace('20% OFF Watch','25% OFF Watch'),c)
    def test_retail_mapping_and_history(self):
        text='FLIP8 SAVE $300\n(Ends 07/10/26)\nPurchase any FLIP8 and save $300.\nAvailable: 17TH September 2026 - 7TH October 2026\nSTACKABLE WITH ALL OFFERS EXCLUDING EDUCATION & SMB\nBulletin Code: A260005825\nZ Series Changelog\nFLIP8 SAVE $900\n(Ends 07/10/26)\nBulletin Code: A260000000'
        warnings=[];o=retail_offers(text,[dict(m='m6',n='Galaxy Z Flip8')],warnings)
        self.assertEqual(len(o),1);self.assertEqual(o[0]['value'],300);self.assertEqual(o[0]['start'],'2026-09-17')
        self.assertEqual(o[0]['targets'],['model:m6']);self.assertFalse(warnings)
        warnings=[];self.assertFalse(retail_offers(text.replace('FLIP8 SAVE','UNKNOWN SAVE'),[dict(m='m6',n='Galaxy Z Flip8')],warnings));self.assertTrue(warnings)
    def test_unavailable_and_missing_bulletin(self):
        c,_=self.fixture()
        with self.assertRaises(ValueError):parse_education('Sign in',c)
        with self.assertRaises(ValueError):blocks('OFFER\n(Ends 02/11/26)\n20% OFF')
if __name__=='__main__':unittest.main()
