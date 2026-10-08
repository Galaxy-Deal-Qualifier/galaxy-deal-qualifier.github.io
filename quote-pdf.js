/* Customer PDF layout. All prices come from the existing quote calculation. */
window.renderGalaxyQuotePdf = function ({ quote, options, date, valid, servedBy, fmt, gstIn, quoteSale }) {
  const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const fonts = window.galaxyQuoteFonts;
  if (fonts) {
    pdf.addFileToVFS('GalaxyQuote-Regular.ttf', fonts.regular);
    pdf.addFileToVFS('GalaxyQuote-Bold.ttf', fonts.bold);
    pdf.addFont('GalaxyQuote-Regular.ttf', 'GalaxyQuote', 'normal');
    pdf.addFont('GalaxyQuote-Bold.ttf', 'GalaxyQuote', 'bold');
  }
  const font = fonts ? 'GalaxyQuote' : 'helvetica';
  const left = 17, right = 193, width = right - left, bottom = 251;
  let y = 0;
  const clean = value => String(value == null ? '' : value).replace(/[−–—]/g, '-').replace(/\u00a0/g, ' ');
  function style(size = 11, bold = false, grey = 31) {
    pdf.setFont(font, bold ? 'bold' : 'normal'); pdf.setFontSize(size);
    pdf.setCharSpace(0); pdf.setTextColor(grey, grey, grey);
  }
  function text(value, x, baseline, size = 11, bold = false, grey = 31, align = 'left') {
    style(size, bold, grey); pdf.text(clean(value), x, baseline, { align });
  }
  function rule(at) { pdf.setDrawColor(223, 226, 229); pdf.setLineWidth(.3); pdf.line(left, at, right, at); }
  function header(first) {
    text('GALAXY DEALS', left, 25, 19, true);
    text('Customer quote', left, 32, 11, false, 103);
    text(date, right, 24, 10, true, 31, 'right');
    rule(44);
    y = 58;
    if (first) {
      text('Your Galaxy quote', left, y, 25, true); y += 9;
      text('A clear breakdown of your device, discount and total.', left, y, 10.5, false, 103); y += 14;
      if (valid) note(valid);
      if (servedBy) note('Served by ' + servedBy);
      y += 4;
    }
  }
  function ensure(height) { if (y + height > bottom) { pdf.addPage(); header(false); } }
  function note(value, size = 9, grey = 103) {
    style(size, false, grey);
    const lines = pdf.splitTextToSize(clean(value), width);
    for (const line of lines) { ensure(5); text(line, left, y, size, false, grey); y += 5; }
  }
  function paragraph(value, size, bold, grey = 31) {
    style(size, bold, grey); const lines = pdf.splitTextToSize(clean(value), width);
    const step = size * .42 + 1;
    lines.forEach(line => { ensure(step); text(line, left, y, size, bold, grey); y += step; });
  }
  function tableHeader() {
    ensure(14); pdf.setFillColor(245,245,245); pdf.roundedRect(left, y, width, 11, 2, 2, 'F');
    text('PRICE BREAKDOWN', left + 5, y + 7, 9, true, 103);
    text('AMOUNT', right - 5, y + 7, 9, true, 103, 'right'); y += 22;
  }
  function row(label, amount, bold = false) {
    style(11, bold); const lines = pdf.splitTextToSize(clean(label), width - 54);
    const height = Math.max(options && options.length ? 9 : 12, lines.length * 5 + 4);
    if (y + height > bottom) { pdf.addPage(); header(false); tableHeader(); }
    lines.forEach((line,i) => text(line, left + 5, y + i * 5, 11, bold));
    text(amount, right - 5, y, 11, bold, 31, 'right'); y += height;
  }
  function summary(q, label = 'CUSTOMER TOTAL') {
    const gstText = 'Includes GST of ' + fmt(gstIn(quoteSale(q))) + ' on the sale, before trade-in.';
    style(9); const gstLines = pdf.splitTextToSize(gstText, width - 12);
    const height = 29 + gstLines.length * 4.5;
    ensure(height + (q.savings > 0 ? 17 : 0));
    pdf.setFillColor(242,243,244); pdf.roundedRect(left, y, width, height, 3, 3, 'F');
    text(label, left + 6, y + 9, 10, true);
    text(fmt(q.total), left + 6, y + 23, 30, true);
    gstLines.forEach((line,i) => text(line, left + 6, y + 29 + i * 4.5, 9, false, 103));
    y += height + 9;
    if (q.savings > 0) {
      const label = 'You save ' + fmt(q.savings); style(11, true);
      const pillWidth = Math.min(width, pdf.getTextWidth(label) + 12);
      pdf.setFillColor(242,243,244); pdf.roundedRect(left, y, pillWidth, 11, 5, 5, 'F');
      text(label, left + 6, y + 7, 11, true); y += 19;
    }
  }
  function breakdown(q) {
    q.items.forEach(({ item, result, ecoApplied, lineTotal }, index) => {
      ensure(85);
      text(index ? 'DEVICE ' + (index + 1) : 'DEVICE', left, y, 9, true, 103); y += 10;
      paragraph(item.n, 17, true);
      paragraph([item.v, item.colour].filter(Boolean).join(' | '), 11, false, 103); y += 7;
      tableHeader(); row('Regular price', fmt(item.p));
      result.lines.forEach(d => row(d.name + (d.end ? ' (Ends ' + d.end + ')' : ''), '-' + fmt(d.amount)));
      ecoApplied.forEach(d => row(d.name, '-' + fmt(d.amount)));
      if (q.items.length > 1 || q.ngcLine || q.manualCredit || q.bonuses.length) row('Item price', fmt(lineTotal), true);
      ensure(10); rule(y - 3); y += 8;
    });
    if (q.ngcLine) {
      row('New Galaxy Club (' + q.ngcLine.plan.term + ')', fmt(q.ngcLine.planPrice));
    }
    if (q.manualCredit) row('Trade-in credit', '-' + fmt(q.manualCredit));
    q.bonuses.forEach(b => row(b.name, '-' + fmt(b.amount)));
    y += 3;
  }
  header(!(options && options.length));
  if (options && options.length) {
    note('Separate options - prices are not added together.', 10, 31); y += 5;
    options.forEach((option, index) => {
      if (index) { pdf.addPage(); header(false); }
      ensure(32); paragraph('Option ' + (index + 1) + ': ' + option.name, 14, true); y += 5;
      breakdown(option.q); summary(option.q, 'OPTION ' + (index + 1) + ' TOTAL'); y += 6;
    });
  } else { breakdown(quote); summary(quote); }
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page); rule(258);
    text('QUOTE ONLY', left, 265, 8, true, 103);
    text('Offers and prices may change. Confirm the final price in POS at purchase.', left, 271, 9, false, 103);
    text('Galaxy Deals', left, 282, 9, true, 103);
    text(page + ' / ' + pages, right, 282, 9, false, 103, 'right');
  }
  pdf.setProperties({ title: 'Galaxy Deals - Customer Quote', author: 'Galaxy Deals' });
  return pdf;
};
