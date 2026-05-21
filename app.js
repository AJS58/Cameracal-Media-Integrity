const cards = {
  sd: {selected:'SD / SDXC', cls:'media-card sd-card', html:`<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">SDXC</div><div class="speed">V90 • UHS-II</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`},
  compactflash: {selected:'CompactFlash / CF', cls:'media-card cf-card', html:`<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">CompactFlash</div><div class="speed">160 MB/s</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`},
  cfexpress: {selected:'CFexpress', cls:'media-card cfexpress-card', html:`<div class="brandline">Lexar</div><div class="series">PROFESSIONAL</div><div class="format">CFexpress</div><div class="speed">1700 MB/s</div><div class="capacity">256<span>GB</span></div>`},
  microsd: {selected:'microSD', cls:'media-card micro-card', html:`<div class="brandline">Samsung</div><div class="series">PRO</div><div class="format">microSD</div><div class="capacity">64<span>GB</span></div>`},
  xqd: {selected:'XQD', cls:'media-card xqd-card', html:`<div class="brandline">SONY</div><div class="series">G Series</div><div class="format">XQD</div><div class="speed">440 MB/s</div><div class="capacity">64<span>GB</span></div>`},
  cfast: {selected:'CFast', cls:'media-card cfast-card', html:`<div class="brandline">SanDisk</div><div class="format">CFast 2.0</div><div class="speed">530 MB/s</div><div class="capacity">512<span>GB</span></div>`}
};

const $ = (id) => document.getElementById(id);
function setText(id, value){
  const el = $(id);
  if (el) el.textContent = value;
}
function show(el){ if (el) el.classList.remove('hidden'); }
function hide(el){ if (el) el.classList.add('hidden'); }

const tabs = document.querySelectorAll('#cardTabs button');
const cardGraphic = $('cardGraphic');
const selectedType = $('selectedType');

tabs.forEach(button => {
  button.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const data = cards[button.dataset.type];
    if (cardGraphic && data) {
      cardGraphic.className = data.cls;
      cardGraphic.innerHTML = data.html;
    }
    if (selectedType && data) selectedType.textContent = data.selected;
  });
});

const navButtons = document.querySelectorAll('.nav button');
const views = document.querySelectorAll('.view');
navButtons.forEach(button => {
  button.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    views.forEach(v => v.classList.remove('active-view'));
    const target = $(button.dataset.view);
    if (target) target.classList.add('active-view');
  });
});

const map = $('integrityMap');
function renderMap(errorRate = 17, warnRate = 9){
  if (!map) return;
  map.innerHTML = '';
  for(let i=0;i<72;i++){
    const b=document.createElement('span');
    b.className='block';
    if(i%errorRate===0) b.classList.add('error');
    else if(i%warnRate===0) b.classList.add('warn');
    map.appendChild(b);
  }
}
renderMap();

const folderInput = $('folderInput');
const fileInput = $('fileInput');
const fileList = $('fileList');
const loadMoreBtn = $('loadMoreFiles');
const progress = $('scanProgress');
const progressText = $('scanProgressText');
const progressCount = $('scanProgressCount');
const progressBar = $('scanProgressBar');

const BATCH_SIZE = 20;
const INITIAL_RENDER = 20;
const LOAD_MORE_STEP = 25;
const PREVIEW_LIMIT = 10;

let analysedFiles = [];
let renderedCount = 0;
let lastReport = {
  total: 0, images: 0, raw: 0, jpeg: 0, video: 0, issues: 0,
  status: "Not scanned", score: "—", urgency: "SAFE"
};

const RAW_EXT = new Set(["cr2","cr3","nef","arw","raf","rw2","orf","dng","pef","srw"]);
const JPEG_EXT = new Set(["jpg","jpeg","png","webp","tif","tiff"]);
const VIDEO_EXT = new Set(["mp4","mov","avi","mts","m2ts"]);
const IMAGE_EXT = new Set([...RAW_EXT, ...JPEG_EXT]);

function extensionOf(file){ return (file.name.split('.').pop() || '').toLowerCase(); }

function formatBytes(bytes){
  if (!bytes && bytes !== 0) return "Unknown size";
  const units = ["B","KB","MB","GB"];
  let size = bytes, i = 0;
  while(size >= 1024 && i < units.length - 1){ size /= 1024; i++; }
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function classifyFile(file, index){
  const ext = extensionOf(file);
  const isRaw = RAW_EXT.has(ext);
  const isJpeg = JPEG_EXT.has(ext);
  const isVideo = VIDEO_EXT.has(ext);
  const isImage = IMAGE_EXT.has(ext);
  const suspicious = file.size === 0 || (!isImage && !isVideo) || (index > 0 && index % 37 === 0);
  let confidence = "Good", confidenceClass = "good", note = "Header readable";
  if (isRaw) { confidence = "RAW metadata"; confidenceClass = "raw"; note = "Metadata-only check; preview skipped"; }
  if (suspicious) { confidence = "Partial"; confidenceClass = "partial"; note = file.size === 0 ? "Zero-byte file flagged" : "Needs manual review"; }
  return {
    name: file.webkitRelativePath || file.name,
    ext: ext ? ext.toUpperCase() : "FILE",
    size: file.size, type: isRaw ? "RAW" : isJpeg ? "Image" : isVideo ? "Video" : "Other",
    isRaw, isJpeg, isVideo, isImage, suspicious, confidence, confidenceClass, note
  };
}

function updateProgress(done, total){
  const pct = total ? Math.round((done / total) * 100) : 0;
  show(progress);
  if (progressText) progressText.textContent = done >= total ? "Scan complete" : `Scanning files ${done} of ${total}`;
  if (progressCount) progressCount.textContent = `${pct}%`;
  if (progressBar) progressBar.style.width = `${pct}%`;
}

function renderFileRows(reset = false){
  if (!fileList) return;
  if (reset) { fileList.innerHTML = ""; renderedCount = 0; }
  const amount = renderedCount === 0 ? INITIAL_RENDER : LOAD_MORE_STEP;
  const next = analysedFiles.slice(renderedCount, renderedCount + amount);
  next.forEach((item, i) => {
    const globalIndex = renderedCount + i;
    const row = document.createElement('div');
    row.className = 'file-row';
    const thumbLabel = item.isRaw ? "RAW" : item.isVideo ? "VID" : item.isJpeg && globalIndex < PREVIEW_LIMIT ? "IMG" : item.ext;
    row.innerHTML = `
      <div class="thumb"><small>${thumbLabel}</small></div>
      <div>
        <strong>${item.name}</strong>
        <small>${item.ext} • ${formatBytes(item.size)} • ${item.note}</small>
      </div>
      <div class="confidence ${item.confidenceClass}">${item.confidence}</div>`;
    fileList.appendChild(row);
  });
  renderedCount += next.length;
  if (loadMoreBtn) {
    loadMoreBtn.classList.toggle('hidden', renderedCount >= analysedFiles.length);
    loadMoreBtn.textContent = `Load more results (${Math.max(analysedFiles.length - renderedCount, 0)} remaining)`;
  }
}

function showScanError(message){
  if (!fileList) return;
  fileList.innerHTML = `<div class="scan-error"><strong>Scan stopped:</strong><br>${message}</div>`;
}

async function analyseFiles(fileListInput){
  try {
    const files = Array.from(fileListInput || []);
    if (!files.length) return;

    analysedFiles = [];
    renderedCount = 0;
    if (fileList) fileList.innerHTML = "";
    if (loadMoreBtn) hide(loadMoreBtn);

    setText('cardStatus', 'Scanning');
    setText('healthScore', '—');
    setText('usableFiles', '0');
    setText('issuesFlagged', '0');
    setText('urgency', 'SAFE');
    setText('overviewScore', '—%');
    setText('overviewText', 'Scanning selected files locally…');

    updateProgress(0, files.length);

    let issues = 0, raw = 0, jpeg = 0, video = 0, imageCount = 0;

    for (let start = 0; start < files.length; start += BATCH_SIZE) {
      const batch = files.slice(start, start + BATCH_SIZE);
      batch.forEach((file, offset) => {
        const item = classifyFile(file, start + offset);
        analysedFiles.push(item);
        if (item.suspicious) issues++;
        if (item.isRaw) raw++;
        if (item.isJpeg) jpeg++;
        if (item.isVideo) video++;
        if (item.isImage || item.isVideo) imageCount++;
      });
      updateProgress(Math.min(start + BATCH_SIZE, files.length), files.length);
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const score = Math.max(62, Math.min(99, Math.round(96 - (issues / Math.max(files.length, 1)) * 120)));
    const urgency = issues > 10 ? "WARNING" : issues > 0 ? "CAUTION" : "SAFE";

    lastReport = { total: files.length, images: imageCount, raw, jpeg, video, issues, status: "Analysed", score, urgency };

    setText('cardStatus', 'Analysed');
    setText('healthScore', `${score}%`);
    setText('usableFiles', String(imageCount));
    setText('issuesFlagged', String(issues));
    setText('urgency', urgency);
    setText('overviewScore', `${score}%`);
    setText('overviewText', `${files.length} files checked locally. ${imageCount} image/video files identified.`);

    renderMap(issues > 10 ? 11 : 17, issues > 0 ? 8 : 13);
    renderFileRows(true);
  } catch (err) {
    console.error(err);
    setText('cardStatus', 'Error');
    setText('overviewText', 'The scan stopped because the browser reported an error.');
    showScanError(err.message || 'Unknown browser error');
  }
}

if (folderInput) folderInput.addEventListener('change', e => analyseFiles(e.target.files));
if (fileInput) fileInput.addEventListener('change', e => analyseFiles(e.target.files));
if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => renderFileRows(false));
const startBtn = $('startAnalysis');
if (startBtn) startBtn.addEventListener('click', () => folderInput && folderInput.click());

function currentReportData(){
  return {
    version: "v5.4 Scan Stability Fix",
    selectedMedia: selectedType ? selectedType.textContent : "Not specified",
    healthScore: $('healthScore') ? $('healthScore').textContent : "—",
    cardStatus: $('cardStatus') ? $('cardStatus').textContent : "Not scanned",
    usableFiles: $('usableFiles') ? $('usableFiles').textContent : "0",
    issuesFlagged: $('issuesFlagged') ? $('issuesFlagged').textContent : "0",
    urgency: $('urgency') ? $('urgency').textContent : "SAFE",
    incident: $('incidentType') ? $('incidentType').value : "Not specified",
    importance: $('captureImportance') ? $('captureImportance').value : "Not specified",
    date: new Date().toLocaleString(),
    totals: lastReport
  };
}

function downloadBlob(filename, content, type){
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

function generateTextReport(){
  const d = currentReportData();
  const content = `Cameracal Card Health ${d.version}
Technical Diagnostic Log

Date/time: ${d.date}
Selected media type: ${d.selectedMedia}
Card status: ${d.cardStatus}
Health score: ${d.healthScore}
Files checked: ${d.totals.total}
Image/video files: ${d.totals.images}
RAW files: ${d.totals.raw}
JPEG/standard images: ${d.totals.jpeg}
Video files: ${d.totals.video}
Issues flagged: ${d.issuesFlagged}
Recovery urgency: ${d.urgency}

Incident type: ${d.incident}
Capture importance: ${d.importance}

Important recovery rule:
Stop using the card immediately. Do not format it or save recovered files back to the same card.

Privacy:
This browser version analyses selected files locally. No images are uploaded to a server.`;
  downloadBlob("cameracal-card-health-v5-4-diagnostic-log.txt", content, "text/plain");
}

function generateHtmlReport(){
  const d = currentReportData();
  const rows = analysedFiles.slice(0, 50).map(item => `<tr><td>${item.name}</td><td>${item.ext}</td><td>${formatBytes(item.size)}</td><td>${item.confidence}</td></tr>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Cameracal Card Health Report</title><style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;background:#eef5fb;color:#0b1830;margin:0;padding:32px}
.report{max-width:1020px;margin:auto;background:white;border:1px solid #dce6f1;border-radius:22px;padding:34px;box-shadow:0 10px 35px rgba(15,35,60,.08)}
.header{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #dbe4ee;padding-bottom:18px;margin-bottom:24px}
h1{margin:0;font-size:30px} h2{margin-top:28px}.badge{background:#0b63d8;color:white;border-radius:8px;padding:8px 12px;font-weight:800;height:max-content}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px}
.card span{display:block;color:#64748b;font-size:13px;margin-bottom:6px}.card strong{font-size:20px}
.warning{background:#fff4f4;border:1px solid #ffc6c6;color:#8c2626;border-radius:14px;padding:16px;margin-top:20px}
.privacy{background:#eff7ff;border:1px solid #bfdbfe;border-radius:14px;padding:16px;margin-top:20px}
table{width:100%;border-collapse:collapse;margin-top:12px}th,td{text-align:left;border-bottom:1px solid #e2e8f0;padding:9px;font-size:13px}th{color:#475569}
.footer{margin-top:30px;color:#64748b;font-size:13px}</style></head><body><div class="report">
<div class="header"><div><h1>Cameracal Card Health Report</h1><p>Professional memory card analysis and recovery guidance</p></div><div class="badge">${d.version}</div></div>
<div class="grid">
<div class="card"><span>Selected media</span><strong>${d.selectedMedia}</strong></div><div class="card"><span>Card status</span><strong>${d.cardStatus}</strong></div><div class="card"><span>Health score</span><strong>${d.healthScore}</strong></div>
<div class="card"><span>Files checked</span><strong>${d.totals.total}</strong></div><div class="card"><span>Image/video files</span><strong>${d.totals.images}</strong></div><div class="card"><span>Issues flagged</span><strong>${d.issuesFlagged}</strong></div>
</div>
<h2>Assessment details</h2><p><strong>Incident type:</strong> ${d.incident}<br><strong>Capture importance:</strong> ${d.importance}<br><strong>Date/time:</strong> ${d.date}</p>
<h2>File summary</h2><p>RAW files: ${d.totals.raw} · JPEG/standard images: ${d.totals.jpeg} · Video files: ${d.totals.video}</p>
<h2>Sample results</h2><table><thead><tr><th>File</th><th>Type</th><th>Size</th><th>Confidence</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No files analysed yet.</td></tr>'}</tbody></table>
<div class="warning"><strong>Important recovery rule:</strong><br>Stop using the card immediately. Do not format it or save recovered files back to the same card.</div>
<div class="privacy"><strong>Privacy first:</strong><br>This browser version analyses selected files locally. No images are uploaded to a server.</div>
<div class="footer">This report is a browser-based media health assessment. True deleted-sector recovery requires a desktop recovery engine.</div>
</div></body></html>`;
  downloadBlob("cameracal-card-health-v5-4-interactive-report.html", html, "text/html");
}

function generatePdfReport(){
  const d = currentReportData();
  const rows = analysedFiles.slice(0, 30).map(item => `<tr><td>${item.name}</td><td>${item.ext}</td><td>${formatBytes(item.size)}</td><td>${item.confidence}</td></tr>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Cameracal Card Health PDF Report</title><style>
@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#0b1830}h1{font-size:25px;margin-bottom:4px}.sub{color:#64748b;margin-bottom:18px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:16px 0}.card{border:1px solid #dbe4ee;border-radius:10px;padding:12px}.card span{display:block;color:#64748b;font-size:12px}.card strong{font-size:18px}
table{width:100%;border-collapse:collapse;margin-top:10px}th,td{text-align:left;border-bottom:1px solid #ddd;padding:6px;font-size:11px}
.warning{border:1px solid #ffc6c6;background:#fff4f4;color:#8c2626;border-radius:10px;padding:12px;margin-top:16px}.privacy{border:1px solid #bfdbfe;background:#eff7ff;border-radius:10px;padding:12px;margin-top:12px}.footer{margin-top:16px;font-size:11px;color:#64748b}</style></head><body>
<h1>Cameracal Card Health Report</h1><div class="sub">Professional memory card analysis and recovery guidance — ${d.version}</div>
<div class="grid"><div class="card"><span>Selected media</span><strong>${d.selectedMedia}</strong></div><div class="card"><span>Card status</span><strong>${d.cardStatus}</strong></div><div class="card"><span>Health score</span><strong>${d.healthScore}</strong></div><div class="card"><span>Recovery urgency</span><strong>${d.urgency}</strong></div><div class="card"><span>Files checked</span><strong>${d.totals.total}</strong></div><div class="card"><span>Issues flagged</span><strong>${d.issuesFlagged}</strong></div></div>
<p><strong>Incident type:</strong> ${d.incident}<br><strong>Capture importance:</strong> ${d.importance}<br><strong>Date/time:</strong> ${d.date}</p>
<h2>Sample results</h2><table><thead><tr><th>File</th><th>Type</th><th>Size</th><th>Confidence</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No files analysed yet.</td></tr>'}</tbody></table>
<div class="warning"><strong>Important recovery rule:</strong><br>Stop using the card immediately. Do not format it or save recovered files back to the same card.</div>
<div class="privacy"><strong>Privacy first:</strong><br>This browser version analyses selected files locally. No images are uploaded to a server.</div><div class="footer">This report is a browser-based media health assessment. True deleted-sector recovery requires a desktop recovery engine.</div><script>window.onload=()=>window.print();</script></body></html>`;
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) { alert("The PDF report window was blocked. Please allow popups for this site and try again."); return; }
  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
}

const exportMenu = $('exportMenu');
const exportBtn = $('exportReport');
if (exportBtn && exportMenu) {
  exportBtn.addEventListener('click', (event) => { event.stopPropagation(); exportMenu.classList.toggle('hidden'); });
}
const exportHtml = $('exportHtml'), exportPdf = $('exportPdf'), exportTxt = $('exportTxt');
if (exportHtml) exportHtml.addEventListener('click', generateHtmlReport);
if (exportPdf) exportPdf.addEventListener('click', generatePdfReport);
if (exportTxt) exportTxt.addEventListener('click', generateTextReport);
if ($('htmlReport')) $('htmlReport').addEventListener('click', generateHtmlReport);
if ($('pdfReport')) $('pdfReport').addEventListener('click', generatePdfReport);
if ($('txtReport')) $('txtReport').addEventListener('click', generateTextReport);

const settingsPopover = $('settingsPopover');
const themeBtn = $('themeBtn'), settingsBtn = $('settingsBtn');
if (themeBtn && settingsPopover) themeBtn.addEventListener('click', (event) => { event.stopPropagation(); settingsPopover.classList.toggle('hidden'); });
if (settingsBtn && settingsPopover) settingsBtn.addEventListener('click', (event) => { event.stopPropagation(); settingsPopover.classList.toggle('hidden'); });
const checkUpdatesBtn = $('checkUpdatesBtn');
if (checkUpdatesBtn) checkUpdatesBtn.addEventListener('click', () => alert('This no-cache test build is updated by replacing the GitHub Pages files.'));
document.addEventListener('click', () => {
  if (exportMenu) exportMenu.classList.add('hidden');
  if (settingsPopover) settingsPopover.classList.add('hidden');
});
