const cards = {
  sd: {
    selected: 'SD / SDXC',
    cls: 'media sd',
    html: `<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">SDXC</div><div class="speed">V90 • UHS-II</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`
  },
  compactflash: {
    selected: 'CompactFlash / CF',
    cls: 'media cf',
    html: `<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">CompactFlash</div><div class="speed">160 MB/s</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`
  },
  cfexpress: {
    selected: 'CFexpress',
    cls: 'media cfexpress',
    html: `<div class="brandline">Lexar</div><div class="series">PROFESSIONAL</div><div class="format">CFexpress</div><div class="speed">1700 MB/s</div><div class="capacity">256<span>GB</span></div>`
  },
  microsd: {
    selected: 'microSD',
    cls: 'media micro',
    html: `<div class="brandline">Samsung</div><div class="series">PRO</div><div class="format">microSD</div><div class="capacity">64<span>GB</span></div><div class="contacts"></div>`
  },
  xqd: {
    selected: 'XQD',
    cls: 'media xqd',
    html: `<div class="brandline">SONY</div><div class="series">G Series</div><div class="format">XQD</div><div class="speed">440 MB/s</div><div class="capacity">64<span>GB</span></div>`
  },
  cfast: {
    selected: 'CFast',
    cls: 'media cfast',
    html: `<div class="brandline">SanDisk</div><div class="series">Extreme PRO</div><div class="format">CFast 2.0</div><div class="speed">530 MB/s</div><div class="capacity">512<span>GB</span></div>`
  }
};

const buttons = document.querySelectorAll('.tabs button');
const graphic = document.getElementById('cardGraphic');
const selected = document.getElementById('selectedType');
const map = document.getElementById('map');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const data = cards[button.dataset.type];
    graphic.className = data.cls;
    graphic.innerHTML = data.html;
    selected.textContent = data.selected;
  });
});

function renderMap(){
  map.innerHTML = '';
  for(let i=0;i<72;i++){
    const b=document.createElement('div');
    b.className='block';
    if(i%17===0)b.classList.add('error');
    else if(i%9===0)b.classList.add('warn');
    map.appendChild(b);
  }
}
renderMap();

document.getElementById('reportBtn').addEventListener('click', () => {
  const content = `Cameracal Card Health v4.5\nSelected media type: ${selected.textContent}\nSupported media: SD, microSD, CompactFlash / CF, CFexpress, XQD, CFast.\nPrivacy: local browser analysis only.`;
  const blob = new Blob([content], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cameracal-card-health-v4-5-report.txt';
  a.click();
  URL.revokeObjectURL(a.href);
});
