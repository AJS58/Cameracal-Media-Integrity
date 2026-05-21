const cardTypes = [
  {id:'sd', name:'SD / SDXC', cls:'media sd', html:`<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">SDXC</div><div class="speed">V90 • UHS-II</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`},
  {id:'cf', name:'CompactFlash / CF', cls:'media cf', html:`<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">CompactFlash</div><div class="speed">160 MB/s</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`},
  {id:'cfexpress', name:'CFexpress', cls:'media cfexpress', html:`<div class="brandline">Lexar</div><div class="series">PROFESSIONAL</div><div class="format">CFexpress</div><div class="speed">1700 MB/s</div><div class="capacity">256<span>GB</span></div>`},
  {id:'xqd', name:'XQD', cls:'media xqd', html:`<div class="brandline">SONY</div><div class="series">G Series</div><div class="format">XQD</div><div class="speed">440 MB/s</div><div class="capacity">64<span>GB</span></div>`},
  {id:'cfast', name:'CFast', cls:'media cfast', html:`<div class="brandline">SanDisk</div><div class="format">CFast 2.0</div><div class="speed">530 MB/s</div><div class="capacity">512<span>GB</span></div>`},
  {id:'microsd', name:'microSD', cls:'media micro', html:`<div class="brandline">Samsung</div><div class="series">PRO</div><div class="format">microSD</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`}
];

function mapHtml(){
  let out='';
  for(let i=0;i<48;i++){
    let cls='block';
    if(i%19===0) cls+=' err';
    else if(i%9===0) cls+=' warn';
    out+=`<span class="${cls}"></span>`;
  }
  return out;
}

function module(card, index){
  const tabs = cardTypes.map(c=>`<button class="${c.id===card.id?'active':''}" data-target="${c.id}">${c.name}</button>`).join('');
  return `<section class="module" data-module="${index}">
    <div class="left">
      <h2>Card type selector</h2>
      <div class="tabs">${tabs}</div>
      <div class="card-body">
        <div class="${card.cls}">${card.html}</div>
        <div class="details">
          <div class="row"><span>Selected card type</span><strong>${card.name}</strong></div>
          <div class="row"><span>Supported checks</span><strong>JPEG, RAW, video, file-size and preview checks</strong></div>
          <div class="row"><span>RAW support</span><strong>CR2, CR3, NEF, ARW, RAF, RW2, ORF, DNG</strong></div>
        </div>
      </div>
    </div>
    <div class="right integrity">
      <h2>Integrity overview</h2>
      <div class="score">—%</div>
      <p>No files analysed yet.</p>
      <div class="map">${mapHtml()}</div>
      <div class="legend"><span><i class="good"></i>Good</span><span><i class="warn"></i>Warnings</span><span><i class="error"></i>Errors</span></div>
    </div>
  </section>`;
}

const dash = document.getElementById('dashboard');
dash.innerHTML = cardTypes.map(module).join('');

dash.addEventListener('click', e => {
  const btn = e.target.closest('.tabs button');
  if(!btn) return;
  const mod = btn.closest('.module');
  const idx = [...dash.children].indexOf(mod);
  const card = cardTypes.find(c=>c.id===btn.dataset.target);
  mod.outerHTML = module(card, idx);
});

document.getElementById('exportReport').addEventListener('click', () => {
  const content = 'Cameracal Card Health v4.7 Text Polish\nSupported media: SD / SDXC, CompactFlash / CF, CFexpress, XQD, CFast, microSD.\nPrivacy: local browser analysis only.';
  const blob = new Blob([content], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cameracal-card-health-v4-7-report.txt';
  a.click();
  URL.revokeObjectURL(a.href);
});
