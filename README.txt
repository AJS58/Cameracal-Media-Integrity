Cameracal Card Health v5.4 Scan Stability Fix

This version addresses the real-world SD-card scan stalling after file selection.

Fixes:
- Restores missing dashboard stat cards that scan code depends on.
- Adds null-safe DOM updates so missing UI elements do not crash the scan.
- Adds try/catch error handling with a visible scan error message.
- Keeps batch scanning from V5.2.
- Keeps V5.3 SD and CompactFlash card graphic polish.
- Keeps report exports: HTML, PDF, TXT.
- Keeps no service worker / no PWA cache.

Testing:
1. Delete previous repository files.
2. Upload this version.
3. Open in a private/incognito window for first test.
4. Select a card/folder.
5. You should see progress and then the first 20 results with a Load More button.
