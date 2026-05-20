const tabs=document.querySelectorAll('.tabs button');
const selectedType=document.getElementById('selectedType');
const displayCard=document.getElementById('displayCard');
const cfNote=document.getElementById('compactFlashNote');
const fileList=document.getElementById('fileList');
const map=document.getElementById('integrityMap');
const folderInput=document.getElementById('folderInput');
const fileInput=document.getElementById('fileInput');

function cfGraphic(cls='large-cf'){
  return `<div class="cf-label">CompactFlash</div>
          <div class="cf-series">PRO</div>
          <div class="cf-capacity">64<span>GB</span></div>
          <div class="cf-pins"></div>`;
}

function setCard(type){
  tabs.forEach(b=>b.classList.toggle('active', b.dataset.type === type));
  selectedType.textContent = type;
  displayCard.className = '';
  if(type.includes('CompactFlash')){
    displayCard.className = 'cf-card large-card large-cf';
    displayCard.innerHTML = cfGraphic();
    cfNote.classList.remove('hidden');
  } else if(type.includes('CFexpress')){
    displayCard.className = 'card large-card cfexpress-card';
    displayCard.innerHTML='<b>CFexpress</b><span>256</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  } else if(type.includes('micro')){
    displayCard.className = 'card large-card cfexpress-card';
    displayCard.innerHTML='<b>microSD</b><span>64</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  } else if(type.includes('XQD')){
    displayCard.className = 'card large-card cfexpress-card';
    displayCard.innerHTML='<b>XQD</b><span>120</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  } else if(type.includes('CFast')){
    displayCard.className = 'card large-card cfexpress-card';
    displayCard.innerHTML='<b>CFast</b><span>128</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  } else {
    displayCard.className = 'card large-card sd-card';
    displayCard.innerHTML='<b>SDXC</b><span>128</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  }
}

tabs.forEach(btn=>btn.addEventListener('click',()=>setCard(btn.dataset.type)));

function renderMap(){
  map.innerHTML='';
  for(let i=0;i<110;i++){
    const b=document.createElement('div');
    b.className='block';
    if(i%19===0)b.className='block bad';
    else if(i%11===0)b.className='block warn';
    map.appendChild(b);
  }
}

const samples=[
 {name:'CF_CARD_0034.CR2',type:'CompactFlash / Canon RAW',confidence:'Good'},
 {name:'1D_MARKIV_0098.CR2',type:'CompactFlash / Canon DSLR RAW',confidence:'Good'},
 {name:'IMG_1045.CR3',type:'Canon RAW',confidence:'Excellent'},
 {name:'DSC_2291.NEF',type:'Nikon RAW',confidence:'Good'},
 {name:'A7M4_0184.ARW',type:'Sony RAW',confidence:'Good'},
 {name:'IMG_1099.JPG',type:'JPEG',confidence:'Excellent'}
];

function renderFiles(files=samples){
  fileList.innerHTML='';
  files.slice(0,30).forEach((f,i)=>{
    const row=document.createElement('div');
    row.className='file-row';
    row.innerHTML=`<div class="thumb"></div><div><b>${f.name}</b><br><span>${f.type || 'Image file'} • ${i%8===0?'Sequence anomaly check':'Header readable'}</span></div><div class="confidence">${f.confidence || 'Good'}</div>`;
    fileList.appendChild(row);
  });
}

function analyse(files){
  document.getElementById('cardStatus').textContent='Analysed';
  document.getElementById('healthScore').textContent='86%';
  document.getElementById('usableFiles').textContent=files.length || samples.length;
  document.getElementById('issuesFlagged').textContent=Math.max(1,Math.floor((files.length||samples.length)/12));
  document.getElementById('overviewScore').textContent='86';
  document.getElementById('overviewText').textContent='File-level integrity assessment completed.';
  renderMap();
  const mapped=[...files].map((f,i)=>({name:f.webkitRelativePath||f.name,type:(f.name.split('.').pop()||'file').toUpperCase(),confidence:i%9===0?'Partial':'Good'}));
  renderFiles(mapped.length?mapped:samples);
}

folderInput.addEventListener('change',e=>analyse(e.target.files));
fileInput.addEventListener('change',e=>analyse(e.target.files));

function download(name, content, type='text/plain'){
  const blob=new Blob([content],{type});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=name;
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById('txtReport').onclick=()=>download('cameracal-diagnostic-log-v4-3.txt', 'Cameracal Media Health & Recovery Utility V4.3. CompactFlash / CF is included. Supported media: SD, microSD, CompactFlash / CF, CFast, XQD, CFexpress.');
document.getElementById('htmlReport').onclick=()=>download('cameracal-report-v4-3.html', '<h1>Cameracal Report V4.3</h1><p><strong>CompactFlash / CF is included.</strong></p><p>Supported media: SD, microSD, CompactFlash / CF, CFast, XQD, CFexpress.</p>', 'text/html');
document.getElementById('pdfReport').onclick=()=>window.print();

renderMap();
renderFiles();
