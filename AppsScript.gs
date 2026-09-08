/**
 * Splid – Google Sheets Backend
 * Anleitung:
 *  1. Neues Google Sheet anlegen (sheets.new) – im Google-Konto, das ihr nutzen wollt.
 *  2. Menü: Erweiterungen → Apps Script.
 *  3. Den kompletten Standard-Code löschen und DIESEN Code einfügen.
 *  4. Oben rechts: Bereitstellen → Neue Bereitstellung.
 *     - Typ: Web-App
 *     - Ausführen als: Ich
 *     - Zugriff: Jeder  (wichtig, damit die Webseite es aufrufen darf)
 *     - Bereitstellen → Zugriff autorisieren (dein Konto wählen, „Erweitert" →
 *       „Zu … (unsicher)" → Zulassen).
 *  5. Die „Web-App-URL" kopieren (endet auf /exec) und an Marvin/Claude geben.
 */

var HEADERS = ['id','room','descr','price','paid','for_whom','date','created_at'];

function getSheet() {
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (s.getLastRow() === 0) s.appendRow(HEADERS);
  return s;
}

function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var p = e.parameter || {};
    var s = getSheet();
    var action = p.action || 'list';

    if (action === 'add') {
      s.appendRow([p.id, p.room, p.descr || '', Number(p.price),
                   p.paid, p.for_whom, p.date || '', p.created_at || '']);
      return json({ ok: true });
    }

    if (action === 'del') {
      var vals = s.getDataRange().getValues();
      for (var i = vals.length - 1; i >= 1; i--) {
        if (String(vals[i][0]) === String(p.id)) s.deleteRow(i + 1);
      }
      return json({ ok: true });
    }

    // list
    var rows = s.getDataRange().getValues();
    var head = rows.shift() || HEADERS;
    var data = rows
      .filter(function (r) { return String(r[1]) === String(p.room); })
      .map(function (r) {
        var o = {};
        head.forEach(function (h, i) { o[h] = r[i]; });
        return o;
      });
    return json({ ok: true, data: data });
  } finally {
    lock.releaseLock();
  }
}

function json(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
