import sys, base64, io, segno
from playwright.sync_api import sync_playwright
URL = sys.argv[1]
qr = segno.make(URL, error='m')
buf = io.BytesIO(); qr.save(buf, kind='svg', scale=1, border=0, dark='#04316A', xmldecl=False, svgns=True)
qr_svg = buf.getvalue().decode()
import re
w=re.search(r'width="(\d+)"',qr_svg).group(1); h=re.search(r'height="(\d+)"',qr_svg).group(1)
qr_svg=re.sub(r'(<svg[^>]*?) width="\d+" height="\d+"',lambda m:m.group(1)+f' viewBox="0 0 {w} {h}" shape-rendering="crispEdges"',qr_svg,1)
alh = base64.b64encode(open('../assets/alhambra_sierra_nevada.jpg','rb').read()).decode()
gzn = base64.b64encode(open('../assets/geozentrum_logo.png','rb').read()).decode()
logo = base64.b64encode(open('../assets/FAU_NatFak_H_black.png','rb').read()).decode()
short = URL.replace('https://','').rstrip('/')
html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page{{size:A4;margin:0}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:210mm;height:297mm;font-family:Inter,Helvetica,Arial,sans-serif;color:#0F172A;position:relative;overflow:hidden;background:#fff}}
.top{{height:118mm;background:linear-gradient(180deg,rgba(0,33,71,.05) 0%,rgba(0,33,71,.25) 30%,rgba(0,33,71,.92) 72%),url(data:image/jpeg;base64,{alh}) center top/cover;color:#fff;padding:14mm 16mm 0;position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:26mm}}
.top .tag{{align-self:flex-start;display:inline-block;background:rgba(255,255,255,.16);border-radius:20mm;padding:2.2mm 5mm;font-size:10.5pt;font-weight:600;letter-spacing:.02em}}
h1{{text-shadow:0 1mm 3mm rgba(0,0,0,.6);font-family:Georgia,'Times New Roman',serif;font-size:41pt;line-height:1.08;margin-top:7mm;letter-spacing:-.01em}}
.sub{{font-size:13pt;opacity:.92;margin-top:5mm;max-width:150mm;line-height:1.4}}
.bands{{position:absolute;left:0;right:0;bottom:0;height:20mm}}
.dates{{position:absolute;left:16mm;right:16mm;top:98mm;background:#fff;border-radius:4mm;box-shadow:0 2mm 6mm rgba(0,33,71,.25);padding:6mm 8mm;display:flex;justify-content:space-between;align-items:center}}
.dates .big{{font-family:Georgia,serif;font-size:21pt;font-weight:700;color:#04316A}}
.dates .lab{{font-size:9pt;text-transform:uppercase;letter-spacing:.1em;color:#64748B;font-weight:600}}
.dates .r{{text-align:right}}
.mid{{padding:22mm 16mm 0;display:grid;grid-template-columns:1fr 62mm;gap:10mm}}
ul{{list-style:none}}
li{{font-size:11.5pt;margin-bottom:2.2mm;padding-left:7mm;position:relative;line-height:1.35}}
li:before{{content:"";position:absolute;left:0;top:2.2mm;width:3mm;height:3mm;background:#B85042;border-radius:.6mm}}
li b{{color:#04316A}}
.de{{font-size:10pt;color:#475569;margin-top:1mm}}
.qr{{text-align:center}}
.qrbox{{border:1.2mm solid #04316A;border-radius:4mm;padding:4mm;background:#fff}}
.qrbox svg{{width:100%;height:auto;display:block}}
.scan{{margin-top:3mm;font-weight:700;color:#04316A;font-size:12pt}}
.scan small{{display:block;font-weight:500;color:#475569;font-size:9pt;margin-top:.5mm}}
.url{{font-size:8.5pt;color:#475569;margin-top:2mm;word-break:break-all}}
.note{{margin:4mm 16mm 0;padding:3mm 6mm;border-left:1.5mm solid #C99700;background:#FFF8E1;font-size:10.5pt;line-height:1.4}}
.foot{{position:absolute;left:0;right:0;bottom:0;height:24mm;background:#0F172A;color:#fff;padding:0 16mm;display:flex;align-items:center;justify-content:space-between}}
.foot img{{height:11mm;filter:brightness(0) invert(1)}}
.foot div{{font-size:9.5pt;opacity:.85;text-align:right;line-height:1.4}}
</style></head><body>
<div class="top">
  <span class="tag">BASIN ANALYSIS + SEQUENCE STRATIGRAPHY</span>
  <h1>Almería Basin<br>Field Trip 2027</h1>
  <p class="sub">Basin analysis and sequence stratigraphy in the Neogene basins of SE Spain<div class="de" style="color:#fff;opacity:.8">Beckenanalyse und Sequenzstratigraphie in den neogenen Becken Südostspaniens</div></p>
  <svg class="bands" viewBox="0 0 210 20" preserveAspectRatio="none"><path d="M0 9 C40 3 80 14 120 8 S190 4 210 9 V20 H0Z" fill="#B85042"/><path d="M0 13 C45 8 85 17 125 12 S190 9 210 13 V20 H0Z" fill="#C99700"/><path d="M0 16 C50 12 90 19 130 15 S190 13 210 16 V20 H0Z" fill="#43B02A"/></svg>
</div>
<div class="dates">
  <div><div class="lab">Dates · Termin</div><div class="big">15 – 24 March 2027</div></div>
  <div style="text-align:center"><div class="lab">Register by · Anmeldung bis</div><div class="big" style="color:#B85042">15 Dec 2026</div></div>
  <div class="r"><div class="lab">Places · Plätze</div><div class="big">max. 14</div></div>
</div>
<div class="mid">
  <ul>
    <li><b>Direct flight</b> Nuremberg ⇄ Málaga (Ryanair)<div class="de">Direktflug Nürnberg ⇄ Málaga</div></li>
    <li><b>Double rooms</b>, breakfast included<div class="de">Doppelzimmer inkl. Frühstück</div></li>
    <li><b>€ 400 – 450</b> depending on final budget<div class="de">je nach endgültigem Budget</div></li>
    <li><b>Flight: 10 kg hand luggage only</b> — checked bag (20/23 kg) paid by you<div class="de">Nur 10 kg Handgepäck — Aufgabegepäck auf eigene Kosten</div></li>
    <li><b>Buy your flight only after confirmation</b> by the field trip leader<div class="de">Flug erst nach Bestätigung durch die Exkursionsleitung buchen</div></li>
    <li><b>Register online</b> — scan the QR code<div class="de">Online anmelden — QR-Code scannen</div></li>
  </ul>
  <div class="qr"><div class="qrbox">{qr_svg}</div><div class="scan">Register now<small>Jetzt anmelden</small></div><div class="url">{short}</div></div>
</div>
<div class="note"><b>Tabernas · Sorbas · Guadix · Cabo de Gata</b> — fluvial, coastal, shallow-marine and deep-water clastic systems, turbidite architecture, outcrop–subsurface integration.<br><span style="color:#475569;font-size:9.5pt">Led by PD Dr. Luca Caracciolo · registration on a first-come basis</span></div>
<div class="foot"><div style="display:flex;gap:7mm;align-items:center;text-align:left;opacity:1"><img src="data:image/png;base64,{gzn}"><img src="data:image/png;base64,{logo}"></div><div>Friedrich-Alexander-Universität Erlangen-Nürnberg<br>GeoZentrum Nordbayern · Sedimentary Petrology</div></div>
</body></html>'''
open('flyer.html','w',encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':794,'height':1123})
    pg.set_content(html); pg.wait_for_timeout(400)
    pg.pdf(path='Almeria2027_flyer_A4.pdf', width='210mm', height='297mm', print_background=True)
    pg.screenshot(path='flyer_preview.png', full_page=False); b.close()
print('ok', short)
