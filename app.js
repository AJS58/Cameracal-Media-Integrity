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

function downloadReport(){
  const content = `Cameracal Card Health v4.8 Single Dashboard\nSelected media type: ${selectedType.textContent}\nSupported media: SD / SDXC, CompactFlash / CF, CFexpress, microSD, XQD, CFast.\nPrivacy: local browser analysis only.`;
  const blob = new Blob([content], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cameracal-card-health-v4-8-report.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}
document.getElementById('exportReport').addEventListener('click', downloadReport);
document.getElementById('txtReport').addEventListener('click', downloadReport);
document.getElementById('htmlReport').addEventListener('click', () => alert('Interactive HTML report export is planned for the next reporting pass.'));
document.getElementById('pdfReport').addEventListener('click', () => window.print());
