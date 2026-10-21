import * as THREE from 'three';

// No year is fixed: this keeps the birthday calendar reusable every year.
export const calendarDays=Array.from({length:31},(_,i)=>i+1);

export function createCalendarTextures(){
  function surface(width,height){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    return {canvas,texture,ctx:canvas.getContext('2d')};
  }
  const page=surface(840,680),note=surface(1000,400);
  function redraw(){
    const c=page.ctx;c.fillStyle='#fff8e5';c.fillRect(0,0,840,680);
    c.textAlign='center';c.textBaseline='middle';
    c.fillStyle='#637253';c.font='64px "Birthday Hand", KaiTi, sans-serif';c.fillText('10 月',420,68);
    c.strokeStyle='#cfc1a3';c.lineWidth=3;c.beginPath();c.moveTo(45,120);c.lineTo(795,120);c.stroke();
    for(const day of calendarDays){
      const x=90+((day-1)%7)*110,y=174+Math.floor((day-1)/7)*88;
      if(day===22){c.fillStyle='#f0d2bf';c.beginPath();c.ellipse(x,y,39,34,-.12,0,Math.PI*2);c.fill();c.strokeStyle='#b46e58';c.lineWidth=5;c.stroke();}
      c.fillStyle=day===22?'#a75e4b':'#667154';c.font='42px "Birthday Hand", KaiTi, sans-serif';c.fillText(String(day),x,y);
    }
    c.fillStyle='#a75e4b';c.font='43px "Birthday Hand", KaiTi, sans-serif';c.fillText('10.22 · 重要的日子',420,615);
    const n=note.ctx;n.fillStyle='#fff7df';n.fillRect(0,0,1000,400);
    n.textAlign='center';n.textBaseline='middle';n.fillStyle='#687251';n.font='48px "Birthday Hand", KaiTi, sans-serif';n.fillText('线索：把一天排成一列',500,70);
    for(const [i,color] of ['#93ab88','#d8b16b','#d7a294'].entries()){
      const x=80+i*300;n.fillStyle=color;n.fillRect(x,140,240,100);
      n.fillStyle='#687251';n.font='40px "Birthday Hand", KaiTi, sans-serif';n.fillText(['清晨','午后','傍晚'][i],x+120,300);
    }
    page.texture.needsUpdate=true;note.texture.needsUpdate=true;
  }
  redraw();return {page:page.texture,note:note.texture,redraw};
}
