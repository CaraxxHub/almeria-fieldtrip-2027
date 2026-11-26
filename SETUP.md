# Almería 2027 – go-live checklist
1. Gmail account: create a Google Sheet "Almeria2027" > Extensions > Apps Script > paste backend/Code.gs.
2. Run `testMail_` once (grant permissions). Check the mail reaches your FAU inbox via your Gmail forwarding rule.
   If it does not, put your FAU address in CONFIG.EXTRA_NOTIFY.
3. Deploy > New deployment > Web app > Execute as: Me; Access: Anyone. Copy the /exec URL.
4. Paste it into index.html (CONFIG.ENDPOINT). Re-deploy as "New version" after any Code.gs edit.
5. Create a PUBLIC GitHub repo (e.g. almeria-fieldtrip-2027), upload index.html + assets/, enable Pages (main, root).
6. Rebuild the flyer with the final URL: python3 flyer/build_flyer.py "<final URL>"; scan the printed QR before printing.
7. Fill in the privacy note placeholder in index.html.
