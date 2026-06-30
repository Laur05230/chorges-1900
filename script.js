const p=new URLSearchParams(location.search);
const n=p.get('photo')||'1';
const img=document.getElementById('overlay');
img.src='images/'+n+'.png';
navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
.then(s=>camera.srcObject=s)
.catch(()=>alert("Autorisez la caméra."));
opacity.oninput=e=>img.style.opacity=e.target.value;

// Déplacement simple
let drag=false,sx=0,sy=0,x=0,y=0;
img.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX-x;sy=e.clientY-y;img.setPointerCapture(e.pointerId);});
img.addEventListener('pointermove',e=>{
 if(!drag)return;
 x=e.clientX-sx;y=e.clientY-sy;
 img.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;
});
img.addEventListener('pointerup',()=>drag=false);
