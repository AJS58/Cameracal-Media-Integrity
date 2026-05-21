Cameracal Card Health v5.5 Diagnostic Scan Fix

This build adds a hard diagnostic scan override to identify and fix the problem where the browser reports selected files but the UI does not continue.

Changes:
- Adds visible Choose card/folder button inside the dashboard.
- Adds visible Choose files button.
- Adds Run test scan button.
- Adds scan status/debug panel.
- Overrides the file input onchange handlers with a metadata-only scan.
- Does not read image data or generate previews.
- Does not upload anything.
- Uses only filename, extension and file size to avoid browser freezes.
- Shows first 30 results after scan.
- Keeps V5.4 styling/reporting foundations.

Testing:
1. Upload this version after deleting old files.
2. Click Run test scan first.
3. If test scan works, click Choose card/folder.
4. You should see the scan status update immediately after browser selection.
