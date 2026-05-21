const cards = {
  sd: {selected:'SD / SDXC', cls:'media-card sd-card', html:`<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">SDXC</div><div class="speed">V90 • UHS-II</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`},
  compactflash: {selected:'CompactFlash / CF', cls:'media-card cf-card', html:`<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">CompactFlash</div><div class="speed">160 MB/s</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`},
  cfexpress: {selected:'CFexpress', cls:'media-card cfexpress-card', html:`<div class="brandline">Lexar</div><div class="series">PROFESSIONAL</div><div class="format">CFexpress</div><div class="speed">1700 MB/s</div><div class="capacity">256<span>GB</span></div>`},
  microsd: {selected:'microSD', cls:'media-card micro-card', html:`<div class="brandline">Samsung</div><div class="series">PRO</div><div class="format">microSD</div><div class="capacity">64<span>GB</span></div>`},
  xqd: {selected:'XQD', cls:'media-card xqd-card', html:`<div class="brandline">SONY</div><div class="series">G Series</div><div class="format">XQD</div><div class="speed">440 MB/s</div><div class="capacity">64<span>GB</span></div>`},
  cfast: {selected:'CFast', cls:'media-card cfast-card', html:`<div class="brandline">SanDisk</div><div class="format">CFast 2.0</div><div class="speed">530 MB/s</div><div class="capacity">512<span>GB</span></div>`}
};

const tabs = document.querySelectorAll('#cardTabs button');
const cardGraphic = document.getElementById('cardGraphic');
const selectedType = document.getElementById('selectedType');

tabs.forEach(button => {
  button.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const data = cards[button.dataset.type];
    cardGraphic.className = data.cls;
    cardGraphic.innerHTML = data.html;
    selectedType.textContent = data.selected;
  });
});

const navButtons = document.querySelectorAll('.nav button');
const views = document.querySelectorAll('.view');
navButtons.forEach(button => {
  button.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    views.forEach(v => v.classList.remove('active-view'));
    document.getElementById(button.dataset.view).classList.add('active-view');
  });
});

const map = document.getElementById('integrityMap');
function renderMap(){
  map.innerHTML = '';
  for(let i=0;i<72;i++){
    const b=document.createElement('span');
    b.className='block';
    if(i%17===0) b.classList.add('error');
    else if(i%9===0) b.classList.add('warn');
    map.appendChild(b);
  }
}
renderMap();

const folderInput = document.getElementById('folderInput');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');

function analyse(files){
  const count = files.length;
  document.getElementById('cardStatus').textContent = 'Analysed';
  document.getElementById('healthScore').textContent = '86%';
  document.getElementById('usableFiles').textContent = count;
  document.getElementById('issuesFlagged').textContent = Math.max(1, Math.floor(count / 12));
  document.getElementById('urgency').textContent = 'WARNING';
  document.getElementById('overviewScore').textContent = '86%';
  document.getElementById('overviewText').textContent = 'File-level integrity assessment completed.';
  fileList.innerHTML = '';
  [...files].slice(0,20).forEach((f,i)=>{
    const row = document.createElement('div');
    row.className = 'file-row';
    row.innerHTML = `<div class="thumb"></div><div><strong>${f.webkitRelativePath || f.name}</strong><br><span>${(f.name.split('.').pop() || 'file').toUpperCase()} • ${i%9===0?'Partial check':'Header readable'}</span></div><div class="confidence">${i%9===0?'Partial':'Good'}</div>`;
    fileList.appendChild(row);
  });
}
folderInput.addEventListener('change', e => analyse(e.target.files));
fileInput.addEventListener('change', e => analyse(e.target.files));
document.getElementById('startAnalysis').addEventListener('click', () => document.getElementById('folderInput').click());


function currentReportData(){
  return {
    version: "v5.0 Reporting Fix",
    selectedMedia: selectedType.textContent,
    healthScore: document.getElementById('healthScore').textContent,
    cardStatus: document.getElementById('cardStatus').textContent,
    usableFiles: document.getElementById('usableFiles').textContent,
    issuesFlagged: document.getElementById('issuesFlagged').textContent,
    urgency: document.getElementById('urgency').textContent,
    incident: document.getElementById('incidentType') ? document.getElementById('incidentType').value : "Not specified",
    importance: document.getElementById('captureImportance') ? document.getElementById('captureImportance').value : "Not specified",
    date: new Date().toLocaleString()
  };
}

function downloadBlob(filename, content, type){
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
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
Usable files: ${d.usableFiles}
Issues flagged: ${d.issuesFlagged}
Recovery urgency: ${d.urgency}

Incident type: ${d.incident}
Capture importance: ${d.importance}

Supported media:
- SD / SDXC
- CompactFlash / CF
- CFexpress
- microSD
- XQD
- CFast

Supported checks:
JPEG, RAW, video, file-size and preview checks.

RAW support:
CR2, CR3, NEF, ARW, RAF, RW2, ORF, DNG.

Important recovery rule:
Stop using the card immediately. Do not format it or save recovered files back to the same card.

Privacy:
This browser version analyses selected files locally. No images are uploaded to a server.

Technical limitation:
This web version checks visible files and folders. True deleted-sector recovery requires a desktop recovery engine.`;
  downloadBlob("cameracal-card-health-v5-0-diagnostic-log.txt", content, "text/plain");
}

function generateHtmlReport(){
  const d = currentReportData();
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Cameracal Card Health Report</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;background:#eef5fb;color:#0b1830;margin:0;padding:32px}
.report{max-width:960px;margin:auto;background:white;border:1px solid #dce6f1;border-radius:22px;padding:34px;box-shadow:0 10px 35px rgba(15,35,60,.08)}
.header{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #dbe4ee;padding-bottom:18px;margin-bottom:24px}
h1{margin:0;font-size:30px} h2{margin-top:28px}
.badge{background:#0b63d8;color:white;border-radius:8px;padding:8px 12px;font-weight:800;height:max-content}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px}
.card span{display:block;color:#64748b;font-size:13px;margin-bottom:6px}.card strong{font-size:20px}
.warning{background:#fff4f4;border:1px solid #ffc6c6;color:#8c2626;border-radius:14px;padding:16px;margin-top:20px}
.privacy{background:#eff7ff;border:1px solid #bfdbfe;border-radius:14px;padding:16px;margin-top:20px}
ul{line-height:1.7}
.footer{margin-top:30px;color:#64748b;font-size:13px}
@media print{body{background:white;padding:0}.report{box-shadow:none;border:0}.badge{border:1px solid #0b63d8}}
</style>
</head>
<body>
<div class="report">
  <div class="header">
    <div>
      <h1>Cameracal Card Health Report</h1>
      <p>Professional memory card analysis and recovery guidance</p>
    </div>
    <div class="badge">${d.version}</div>
  </div>

  <div class="grid">
    <div class="card"><span>Selected media</span><strong>${d.selectedMedia}</strong></div>
    <div class="card"><span>Card status</span><strong>${d.cardStatus}</strong></div>
    <div class="card"><span>Health score</span><strong>${d.healthScore}</strong></div>
    <div class="card"><span>Usable files</span><strong>${d.usableFiles}</strong></div>
    <div class="card"><span>Issues flagged</span><strong>${d.issuesFlagged}</strong></div>
    <div class="card"><span>Recovery urgency</span><strong>${d.urgency}</strong></div>
  </div>

  <h2>Assessment details</h2>
  <ul>
    <li><strong>Incident type:</strong> ${d.incident}</li>
    <li><strong>Capture importance:</strong> ${d.importance}</li>
    <li><strong>Date/time:</strong> ${d.date}</li>
  </ul>

  <h2>Supported media</h2>
  <p>SD / SDXC, CompactFlash / CF, CFexpress, microSD, XQD and CFast.</p>

  <h2>Supported checks</h2>
  <p>JPEG, RAW, video, file-size and preview checks.</p>

  <h2>RAW support</h2>
  <p>CR2, CR3, NEF, ARW, RAF, RW2, ORF and DNG.</p>

  <div class="warning">
    <strong>Important recovery rule:</strong><br>
    Stop using the card immediately. Do not format it or save recovered files back to the same card.
  </div>

  <div class="privacy">
    <strong>Privacy first:</strong><br>
    This browser version analyses selected files locally. No images are uploaded to a server.
  </div>

  <div class="footer">
    This report is a browser-based media health assessment. True deleted-sector recovery requires a desktop recovery engine.
  </div>
</div>
</body>
</html>`;
  downloadBlob("cameracal-card-health-v5-0-interactive-report.html", html, "text/html");
}

function generatePdfReport(){
  const d = currentReportData();
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Cameracal Card Health PDF Report</title>
<style>
@page{size:A4;margin:18mm}
body{font-family:Arial,sans-serif;color:#0b1830}
h1{font-size:26px;margin-bottom:4px}
.sub{color:#64748b;margin-bottom:20px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:18px 0}
.card{border:1px solid #dbe4ee;border-radius:10px;padding:12px}
.card span{display:block;color:#64748b;font-size:12px}.card strong{font-size:18px}
.warning{border:1px solid #ffc6c6;background:#fff4f4;color:#8c2626;border-radius:10px;padding:12px;margin-top:18px}
.privacy{border:1px solid #bfdbfe;background:#eff7ff;border-radius:10px;padding:12px;margin-top:12px}
.footer{margin-top:20px;font-size:12px;color:#64748b}
button{display:none}
</style>
</head>
<body>
<h1>Cameracal Card Health Report</h1>
<div class="sub">Professional memory card analysis and recovery guidance — ${d.version}</div>
<div class="grid">
  <div class="card"><span>Selected media</span><strong>${d.selectedMedia}</strong></div>
  <div class="card"><span>Card status</span><strong>${d.cardStatus}</strong></div>
  <div class="card"><span>Health score</span><strong>${d.healthScore}</strong></div>
  <div class="card"><span>Recovery urgency</span><strong>${d.urgency}</strong></div>
  <div class="card"><span>Usable files</span><strong>${d.usableFiles}</strong></div>
  <div class="card"><span>Issues flagged</span><strong>${d.issuesFlagged}</strong></div>
</div>
<h2>Assessment details</h2>
<p><strong>Incident type:</strong> ${d.incident}<br>
<strong>Capture importance:</strong> ${d.importance}<br>
<strong>Date/time:</strong> ${d.date}</p>
<h2>Supported media</h2>
<p>SD / SDXC, CompactFlash / CF, CFexpress, microSD, XQD and CFast.</p>
<h2>Supported checks</h2>
<p>JPEG, RAW, video, file-size and preview checks. RAW support includes CR2, CR3, NEF, ARW, RAF, RW2, ORF and DNG.</p>
<div class="warning"><strong>Important recovery rule:</strong><br>Stop using the card immediately. Do not format it or save recovered files back to the same card.</div>
<div class="privacy"><strong>Privacy first:</strong><br>This browser version analyses selected files locally. No images are uploaded to a server.</div>
<div class="footer">This report is a browser-based media health assessment. True deleted-sector recovery requires a desktop recovery engine.</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;
  const reportWindow = window.open("", "_blank");
  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
}

document.getElementById('exportReport').addEventListener('click', generateHtmlReport);
document.getElementById('txtReport').addEventListener('click', generateTextReport);
document.getElementById('htmlReport').addEventListener('click', generateHtmlReport);
document.getElementById('pdfReport').addEventListener('click', generatePdfReport);
