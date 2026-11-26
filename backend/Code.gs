/**
 * Almería Field Trip 2027 - registration + contact backend (Google Apps Script)
 *
 * Runs under the Gmail account that deploys it. Gmail then forwards to the FAU
 * account via a normal Gmail forwarding rule (see SETUP.md).
 *
 * Sheet "Registrations": timestamp | status | name | email | programme | semester | notes | lang
 * Sheet "Contact":       timestamp | name | email | message
 */
const CONFIG = {
  MAX_PLACES: 14,
  // Where notifications go. '' = the Gmail account that owns this script.
  // To skip Gmail forwarding and ALSO mail the FAU account directly, add it to EXTRA_NOTIFY.
  OWNER_EMAIL: '',
  EXTRA_NOTIFY: [],               // e.g. ['luca.caracciolo@fau.de']
  TRIP_TITLE: 'Almería Field Trip 2027 (15–24 March 2027)',
  ALLOWED_DOMAINS: ['fau.de', 'fau.eu', 'fauad.fau.de'],
  MIN_SECONDS_BETWEEN_CONTACTS_PER_EMAIL: 60,
  // false = no automatic mail to students, so the Gmail address is never exposed
  SEND_STUDENT_CONFIRMATION: false
};

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name, header) {
  let sh = ss_().getSheetByName(name);
  if (!sh) { sh = ss_().insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); }
  return sh;
}
function reg_()  { return sheet_('Registrations', ['timestamp','status','name','email','programme','semester','notes','lang']); }
function cont_() { return sheet_('Contact', ['timestamp','name','email','message']); }
function owner_() { return CONFIG.OWNER_EMAIL || Session.getEffectiveUser().getEmail(); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
// Neutralise spreadsheet formula injection
function cell_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }

function counts_() {
  const rows = reg_().getDataRange().getValues().slice(1);
  let confirmed = 0, waitlist = 0;
  rows.forEach(r => { if (r[1] === 'confirmed') confirmed++; else if (r[1] === 'waitlist') waitlist++; });
  return { confirmed: confirmed, waitlist: waitlist, max: CONFIG.MAX_PLACES };
}

/** GET ?action=status -> seat counts only (no personal data) */
function doGet(e) {
  return json_(counts_());
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad-request' }); }
  if (d.website) return json_({ ok: true });            // honeypot: pretend success
  if (d.action === 'register') return register_(d);
  if (d.action === 'contact')  return contact_(d);
  return json_({ ok: false, error: 'bad-action' });
}

function validEmail_(m) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m); }

function register_(d) {
  const name = clean_(d.name, 120), email = clean_(d.email, 160).toLowerCase();
  const prog = clean_(d.programme, 80), sem = clean_(d.semester, 20), notes = clean_(d.notes, 500);
  const lang = d.lang === 'de' ? 'de' : 'en';
  if (!name || !validEmail_(email) || !prog || !sem) return json_({ ok: false, error: 'invalid' });
  const domain = email.split('@')[1];
  if (CONFIG.ALLOWED_DOMAINS.indexOf(domain) < 0) return json_({ ok: false, error: 'domain' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);                                   // serialises concurrent sign-ups: no over-booking
  let status;
  try {
    const sh = reg_();
    const rows = sh.getDataRange().getValues().slice(1);
    if (rows.some(r => String(r[3]).toLowerCase() === email)) return json_({ ok: false, error: 'duplicate' });
    const c = counts_();
    status = c.confirmed < CONFIG.MAX_PLACES ? 'confirmed' : 'waitlist';
    sh.appendRow([new Date(), status, cell_(name), email, cell_(prog), cell_(sem), cell_(notes), lang]);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }

  // Mail failures must not undo the registration
  if (CONFIG.SEND_STUDENT_CONFIRMATION) try { mailStudent_(name, email, status, lang); } catch (err) { console.error('student mail', err); }
  try {
    const c2 = counts_();
    MailApp.sendEmail({
      to: [owner_()].concat(CONFIG.EXTRA_NOTIFY).join(','),
      subject: '[Almería 2027] New registration (' + status + ', ' + c2.confirmed + '/' + CONFIG.MAX_PLACES + '): ' + name,
      body: 'Name: ' + name + '\nEmail: ' + email + '\nProgramme: ' + prog + '\nSemester: ' + sem +
            '\nNotes: ' + (notes || '-') + '\nStatus: ' + status + '\nConfirmed: ' + c2.confirmed + '/' + CONFIG.MAX_PLACES +
            '  Waiting list: ' + c2.waitlist,
      replyTo: email
    });
  } catch (err) { console.error('owner mail', err); }
  return json_({ ok: true, status: status });
}

function mailStudent_(name, email, status, lang) {
  const de = lang === 'de';
  let subject, body;
  if (status === 'confirmed') {
    subject = de ? 'Anmeldung bestätigt: ' + CONFIG.TRIP_TITLE : 'Registration confirmed: ' + CONFIG.TRIP_TITLE;
    body = de
      ? 'Hallo ' + name + ',\n\ndeine Anmeldung ist eingegangen und du hast einen Platz.\n\nDer genaue Betrag (max. 450 €, abzüglich Flugticket) und die Zahlungsanweisungen folgen, sobald das Budget bestätigt ist. Im Flug ist nur 10 kg Handgepäck enthalten; aufgegebenes Gepäck zahlst du selbst.\n\nBei Fragen antworte einfach auf diese E-Mail.\n\nGeoZentrum Nordbayern'
      : 'Hello ' + name + ',\n\nyour registration has been received and you have a place.\n\nThe exact amount (max. EUR 450, minus the plane ticket) and payment instructions follow once the budget is confirmed. The flight includes 10 kg hand luggage only; a checked bag is at your own cost.\n\nIf you have questions, just reply to this e-mail.\n\nGeoZentrum Nordbayern';
  } else {
    subject = de ? 'Warteliste: ' + CONFIG.TRIP_TITLE : 'Waiting list: ' + CONFIG.TRIP_TITLE;
    body = de
      ? 'Hallo ' + name + ',\n\nalle ' + CONFIG.MAX_PLACES + ' Plätze sind vergeben. Du stehst auf der Warteliste und wir melden uns, falls ein Platz frei wird.\n\nGeoZentrum Nordbayern'
      : 'Hello ' + name + ',\n\nall ' + CONFIG.MAX_PLACES + ' places are taken. You are on the waiting list and we will contact you if a place becomes free.\n\nGeoZentrum Nordbayern';
  }
  MailApp.sendEmail({ to: email, subject: subject, body: body, replyTo: owner_(), name: 'GeoZentrum Nordbayern - Field Trip' });
}

function contact_(d) {
  const name = clean_(d.name, 120), email = clean_(d.email, 160), msg = clean_(d.message, 3000);
  if (!name || !validEmail_(email) || msg.length < 5) return json_({ ok: false, error: 'invalid' });

  // light per-address throttle
  const cache = CacheService.getScriptCache(), key = 'ct:' + email.toLowerCase();
  if (cache.get(key)) return json_({ ok: false, error: 'rate' });
  cache.put(key, '1', CONFIG.MIN_SECONDS_BETWEEN_CONTACTS_PER_EMAIL);

  cont_().appendRow([new Date(), cell_(name), email, cell_(msg)]);
  MailApp.sendEmail({
    to: [owner_()].concat(CONFIG.EXTRA_NOTIFY).join(','),
    subject: '[Almería 2027] Question from ' + name,
    body: msg + '\n\n--\nFrom: ' + name + ' <' + email + '>',
    replyTo: email,
    name: 'Almería 2027 web form'
  });
  return json_({ ok: true });
}

/** Run once from the editor to test mail permissions. */
function testMail_() {
  MailApp.sendEmail(owner_(), '[Almería 2027] Test', 'Backend mail works. Check that it is forwarded to the FAU account.');
}
