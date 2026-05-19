import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const LINE_HEIGHT = 16;

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCurrency(value) {
  if (value === undefined || value === null) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function wrapText(text, maxWidth, font, size) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width <= maxWidth) {
      line = testLine;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawTextBlock(page, font, size, text, x, y, maxWidth) {
  const lines = wrapText(text, maxWidth, font, size);
  let offsetY = y;
  for (const line of lines) {
    page.drawText(line, { x, y: offsetY, size, font, color: rgb(0, 0, 0) });
    offsetY -= LINE_HEIGHT;
  }
  return offsetY;
}

async function createPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  return { pdfDoc, page, helvetica, helveticaBold };
}

function drawTitle(page, font, text, y) {
  page.drawText(text, { x: MARGIN, y, size: 16, font, color: rgb(0.1, 0.1, 0.5) });
}

function drawHeader(page, font, title, subtitle, y) {
  page.drawText(title, { x: MARGIN, y, size: 14, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(subtitle, { x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(subtitle, 10), y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
}

export async function generateRentAgreement(booking) {
  const { pdfDoc, page: firstPage, helvetica, helveticaBold } = await createPdf();
  let page = firstPage;
  let y = PAGE_HEIGHT - MARGIN;
  drawHeader(page, helvetica, 'India Non Judicial Stamp Paper (Rs.100)', 'SUBLEASE AGREEMENT / VIRTUAL OFFICE AGREEMENT', y);
  y -= 30;
  page.drawText('This Agreement is made on this day between the following parties:', { x: MARGIN, y, size: 11, font: helvetica });
  y -= 24;

  const landlordText = 'FIRST PARTY (Landlord): Mr. KRISHNAN.K, S/O Late Pacher.K, Aadhar No. 7729 7791 2707, aged 75 years, No. 19/35, Mount Road, Little Mount, Chennai - 600015.';
  y = drawTextBlock(page, helvetica, 10, landlordText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 10;

  const tenantName = booking?.user?.name || booking?.user?.email || 'Customer';
  const tenantCompany = booking?.user?.company_name || 'FL Smartech Private Limited';
  const tenantText = `SECOND PARTY (Tenant): ${tenantCompany} represented by ${tenantName}. Address: ${booking?.user?.company_name || 'Address not available'}.`;
  y = drawTextBlock(page, helvetica, 10, tenantText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 20;

  drawTitle(page, helveticaBold, 'PROPERTY DETAILS', y);
  y -= 20;
  const propertyText = 'First Floor, 450 sq.ft, No. 19/35, Mount Road, Little Mount, Chennai - 600015. Property Tax card: 13/170/04276/000.';
  y = drawTextBlock(page, helvetica, 10, propertyText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 20;

  drawTitle(page, helveticaBold, 'FINANCIAL TERMS', y);
  y -= 20;
  const monthlyRent = booking?.total_amount || booking?.space?.price_per_month || 33000;
  const advanceAmount = booking?.paid_amount || 200000;
  const durationText = 'Duration: 11 months from 1st October 2024. Renewal: minimum 10% increment every 2 years.';
  page.drawText(`Monthly Rent: ${formatCurrency(monthlyRent)} /-`, { x: MARGIN, y, size: 10, font: helvetica });
  y -= 16;
  page.drawText(`Advance: ${formatCurrency(advanceAmount)} /-`, { x: MARGIN, y, size: 10, font: helvetica });
  y -= 16;
  page.drawText(durationText, { x: MARGIN, y, size: 10, font: helvetica });
  y -= 22;

  drawTitle(page, helveticaBold, 'TERMS & CLAUSES', y);
  y -= 20;
  const clauses = [
    '1. Monthly rent is payable on or before the 7th of every month for official purposes only.',
    '2. Advance amount has been paid via NEFT and is not interest bearing.',
    '3. Rental period commences 1st October 2024 for eleven months and may be extended by mutual consent.',
    '4. Tenant shall pay electricity charges as per meter; landlord shall pay property tax and water tax.',
    '5. Landlord or authorized agent may inspect the premises during reasonable hours for repair or inspection.',
    '6. Tenant must deliver vacant possession upon termination; early vacation requires two months written notice.',
    '7. Landlord consents to tenancy by Eva Info Marketing Solutions OPC Private Limited and its associated co-working companies.',
    '8. Premises shall be used for office purposes only; no alterations without prior written consent.',
    '9. Tenant shall comply with all local authority rules and shall not perform illegal, offensive, or dangerous activities.',
    '10. Tenant shall not damage or reduce the value of the premises.',
    '11. Landlord shall return the advance amount at the time of vacating upon handing over keys.',
    '12. After termination, tenant shall vacate peacefully and hand over vacant possession.',
    '13. Tenant shall keep the premises clean and not create a nuisance for neighbors.',
    '14. Premises are provided with AC, room partition, and working lights.',
  ];
  for (const clause of clauses) {
    y = drawTextBlock(page, helvetica, 9.5, clause, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 8;
    if (y < 120) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }
  y -= 10;

  drawTitle(page, helveticaBold, 'WITNESS', y);
  y -= 18;
  const witnessText = '1. BALAJI, 3-B Radhanagar, Velachery, Chennai-42. 2. BHARATH KUMAR SN, Sri Mathru Nilay, 2nd Cross, Varthur Block, Mobile: 9108968843 / 950627462002.';
  y = drawTextBlock(page, helvetica, 10, witnessText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 20;

  page.drawText(`Booking No: ${booking?.booking_number || 'N/A'}`, { x: MARGIN, y, size: 9, font: helvetica });
  page.drawText(`Date: ${formatDate(new Date())}`, { x: PAGE_WIDTH - MARGIN - helvetica.widthOfTextAtSize(formatDate(new Date()), 9), y, size: 9, font: helvetica });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateNOC(nocRequest, booking) {
  const { pdfDoc, page, helvetica, helveticaBold } = await createPdf();
  let y = PAGE_HEIGHT - MARGIN;

  drawHeader(page, helvetica, 'Eva Info Marketing Solutions OPC Private Limited', 'No Objection Certificate', y);
  y -= 30;
  page.drawText(`Date: ${formatDate(nocRequest?.issued_at || new Date())}`, { x: PAGE_WIDTH - MARGIN - helvetica.widthOfTextAtSize(formatDate(nocRequest?.issued_at || new Date()), 10), y, size: 10, font: helvetica });
  y -= 24;

  const fromText = 'From: Mr. K. KRISHNAN, No. 19/35, Mount Road, Little Mount, Chennai-600015';
  y = drawTextBlock(page, helvetica, 10, fromText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 10;
  const toText = `To: ${booking?.user?.name || 'Customer'}, ${booking?.user?.company_name || 'Company Name'}, ${booking?.user?.company_name || ''}`;
  y = drawTextBlock(page, helvetica, 10, toText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 20;

  const subjectText = 'Subject: No objection / permission for use of address as registered office of the company.';
  y = drawTextBlock(page, helveticaBold, subjectText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 18;

  const bodyText = `I hereby declare that I am the owner of the premises located at Building No. 19/35, First Floor, Mount Road, Little Mount, Chennai-600015 and have no objection to ${booking?.user?.company_name || 'the company'} using the same as its registered office address and for receiving any correspondence from Government Authorities. I further allow Eva Info Marketing Solutions OPC Private Limited to issue NOC to its clients for the purpose of registered office.`;
  y = drawTextBlock(page, helvetica, 10, bodyText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 20;

  const gstText = 'GST Compliance Declaration: The premises shall comply with CGST Rule 18 and display registration certificate and GSTIN on the name board at the principal place of business.';
  y = drawTextBlock(page, helvetica, 10, gstText, MARGIN, y, PAGE_WIDTH - 2 * MARGIN) - 30;

  page.drawText('For Eva Info Marketing Solutions OPC Private Limited', { x: MARGIN, y, size: 10, font: helveticaBold });
  y -= 24;
  page.drawText('Signature: ______________________', { x: MARGIN, y, size: 10, font: helvetica });
  y -= 18;
  page.drawText('Name: Krishnan', { x: MARGIN, y, size: 10, font: helvetica });
  y -= 18;
  page.drawText('Place: Chennai', { x: MARGIN, y, size: 10, font: helvetica });
  y -= 18;
  page.drawText(`Valid From: ${formatDate(nocRequest?.issued_at || new Date())}`, { x: MARGIN, y, size: 10, font: helvetica });
  y -= 18;
  page.drawText(`Valid Until: ${formatDate(nocRequest?.valid_until || new Date(new Date().setFullYear(new Date().getFullYear() + 1)))}`, { x: MARGIN, y, size: 10, font: helvetica });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateReceipt(payment, booking) {
  const { pdfDoc, page, helvetica, helveticaBold } = await createPdf();
  let y = PAGE_HEIGHT - MARGIN;

  page.drawText('FL SMARTECH SPACES', { x: MARGIN, y, size: 16, font: helveticaBold, color: rgb(0.1, 0.1, 0.4) });
  y -= 20;
  page.drawText('Payment Receipt', { x: MARGIN, y, size: 14, font: helveticaBold });
  y -= 24;

  page.drawText(`Receipt No: ${payment?.receipt_number || 'N/A'}`, { x: MARGIN, y, size: 10, font: helvetica });
  page.drawText(`Date: ${formatDate(payment?.payment_date || new Date())}`, { x: PAGE_WIDTH - MARGIN - helvetica.widthOfTextAtSize(formatDate(payment?.payment_date || new Date()), 10), y, size: 10, font: helvetica });
  y -= 20;

  const customerName = booking?.user?.name || booking?.user?.email || 'Customer';
  const company = booking?.user?.company_name || 'Company';
  const gst = booking?.user?.gst_number || 'N/A';
  const details = [`Customer: ${customerName}`, `Company: ${company}`, `GST: ${gst}`, `Space: ${booking?.space?.name || 'N/A'}`, `Booking Period: ${formatDate(booking?.start_date)} - ${formatDate(booking?.end_date)}`];
  for (const detail of details) {
    page.drawText(detail, { x: MARGIN, y, size: 10, font: helvetica });
    y -= 16;
  }
  y -= 6;

  page.drawText('Amount Breakdown', { x: MARGIN, y, size: 11, font: helveticaBold });
  y -= 18;
  const rentAmount = booking?.total_amount || payment?.amount || 0;
  const taxAmount = 0;
  const totalAmount = payment?.amount || rentAmount;
  const breakdown = [
    `Rent: ${formatCurrency(rentAmount)}`,
    `Taxes: ${formatCurrency(taxAmount)}`,
    `Total Paid: ${formatCurrency(totalAmount)}`,
  ];
  for (const line of breakdown) {
    page.drawText(line, { x: MARGIN + 10, y, size: 10, font: helvetica });
    y -= 16;
  }
  y -= 10;

  page.drawText(`Payment Mode: ${payment?.payment_mode || 'N/A'}`, { x: MARGIN, y, size: 10, font: helvetica });
  y -= 16;
  page.drawText(`Transaction Reference: ${payment?.transaction_reference || 'N/A'}`, { x: MARGIN, y, size: 10, font: helvetica });
  y -= 30;

  const footer = 'Thank you for your payment. Please retain this receipt for your records.';
  drawTextBlock(page, helvetica, 10, footer, MARGIN, y, PAGE_WIDTH - 2 * MARGIN);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
