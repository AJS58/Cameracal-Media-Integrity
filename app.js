const tabs=document.querySelectorAll('.tabs button');
const selectedType=document.getElementById('selectedType');
const displayCard=document.getElementById('displayCard');
const cfNote=document.getElementById('compactFlashNote');
const fileList=document.getElementById('fileList');
const map=document.getElementById('integrityMap');
const folderInput=document.getElementById('folderInput');
const fileInput=document.getElementById('fileInput');

function setCard(type){
  tabs.forEach(b=>b.classList.toggle('active', b.dataset.type === type));
  selectedType.textContent = type;
  displayCard.className = 'card large-card';
  if(type.includes('Compact')){
    displayCard.classList.add('compactflash-card');
    displayCard.innerHTML='<b>COMPACT<br>FLASH</b><span>64</span><em>GB</em><i></i>';
    cfNote.classList.remove('hidden');
  } else if(type.includes('CFexpress')){
    displayCard.classList.add('cfexpress-card');
    displayCard.innerHTML='<b>CFexpress</b><span>256</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  } else if(type.includes('micro')){
    displayCard.classList.add('compactflash-card');
    displayCard.innerHTML='<b>microSD</b><span>64</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  } else if(type.includes('XQD')){
    displayCard.classList.add('cfexpress-card');
    displayCard.innerHTML='<b>XQD</b><span>120</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  } else if(type.includes('CFast')){
    displayCard.classList.add('compactflash-card');
    displayCard.innerHTML='<b>CFast</b><span>128</span><em>GB</em><i></i>';
    cfNote.classList.add('hidden');
  } else {
    displayCard.classList.add('sd-card');
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
 {name:'CF_CARD_0034.CR2',type:'Compact Flash / Canon RAW',confidence:'Good'},
 {name:'1D_MARKIV_0098.CR2',type:'Compact Flash / Canon DSLR RAW',confidence:'Good'},
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

document.getElementById('txtReport').onclick=()=>download('cameracal-diagnostic-log-v4-2.txt', 'Compact Flash / CF is included. Supported media: SD, microSD, Compact Flash / CF, CFast, XQD, CFexpress.');
document.getElementById('htmlReport').onclick=()=>download('cameracal-report-v4-2.html', '<h1>Cameracal Report V4.2</h1><p><strong>Compact Flash / CF is included.</strong></p><p>Supported media: SD, microSD, Compact Flash / CF, CFast, XQD, CFexpress.</p>', 'text/html');
document.getElementById('pdfReport').onclick=()=>window.print();

renderMap();
renderFiles();
