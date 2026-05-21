Cameracal Card Health v5.6 Real Integrity Scoring

Changes:
- Removed random/decorative integrity grid behaviour.
- Each square now represents an actual selected file.
- Green = good file.
- Yellow = warning, e.g. RAW metadata-only browser check.
- Red = error, e.g. zero-byte or unsupported file type.
- Health score now relates to the actual scan result.
- A clean label is shown: Excellent, Good, Caution or High Risk.
- A small 4-file test now produces a logical score instead of a confusing random 71%.
- Existing V5.5 diagnostic scan stability retained.

Notes:
In browser mode, RAW files are treated as warnings because the app avoids heavy RAW preview decoding for performance and stability.
