const scene=new THREE.Scene();
scene.background=new THREE.Color(0x101827);
scene.fog=new THREE.Fog(0x101827,35,180);

const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.getElementById("game").appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xbfd8ff,0x202030,1.8));

const sun=new THREE.DirectionalLight(0xffffff,2.2);
sun.position.set(40,70,25);
sun.castShadow=true;
scene.add(sun);

const ground=new THREE.Mesh(
 new THREE.PlaneGeometry(400,400),
 new THREE.MeshStandardMaterial({color:0x292c33,roughness:.9})
);
ground.rotation.x=-Math.PI/2;
ground.receiveShadow=true;
scene.add(ground);

function building(x,z,w,h,d){
 const b=new THREE.Mesh(
  new THREE.BoxGeometry(w,h,d),
  new THREE.MeshStandardMaterial({
   color:new THREE.Color(.08+Math.random()*.08,.1+Math.random()*.08,.15+Math.random()*.1),
   roughness:.8
  })
 );
 b.position.set(x,h/2,z);
 b.castShadow=true;
 scene.add(b);

 for(let y=4;y<h-1;y+=4){
  for(let xx=-w/2+1;xx<w/2-1;xx+=2){
   const win=new THREE.Mesh(
    new THREE.PlaneGeometry(.7,1.1),
    new THREE.MeshBasicMaterial({color:Math.random()>.35?0xffd36b:0x172034})
   );
   win.position.set(x+xx,y,z-d/2-.02);
   scene.add(win);
  }
 }
}

for(let x=-100;x<=100;x+=20){
 for(let z=-100;z<=100;z+=20){
  if(Math.abs(x)<30&&Math.abs(z)<30)continue;
  building(x+(Math.random()-.5)*5,z+(Math.random()-.5)*5,13+Math.random()*5,12+Math.random()*35,13+Math.random()*5);
 }
}

function mat(color,metal=0,rough=.6){
 return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough});
}

const spy={
 group:new THREE.Group(),
 yaw:0,
 pitch:0,
 velocity:new THREE.Vector3(),
 shooting:false,
 shootTimer:0,
 ammo:12,
 maxAmmo:12,
 reload:0,
 combo:0,
 comboTimer:0,
 adrenaline:0,
 adrenalineMode:false,
 adrenalineTime:0,
 level:1,
 xp:0,
 guns:[]
};

scene.add(spy.group);

function createSpy(){

 spy.group.clear();
 spy.guns=[];

 const suit=mat(0x10141d,.1,.35);
 const shirt=mat(0x202633,0,.5);
 const skin=mat(0xc98768,0,.65);
 const metal=mat(0x657080,1,.2);
 const pistolMat=mat(0x17191d,.8,.2);
 const gripMat=mat(0x08090d,0,.5);

 const torso=new THREE.Mesh(
  new THREE.CapsuleGeometry(.55,.9,6,12),
  suit
 );
 torso.scale.set(1,.95,.62);
 torso.position.y=1.6;
 torso.castShadow=true;
 spy.group.add(torso);

 const shirtFront=new THREE.Mesh(
  new THREE.BoxGeometry(.55,.55,.08),
  shirt
 );
 shirtFront.position.set(0,1.7,-.38);
 spy.group.add(shirtFront);

 const neck=new THREE.Mesh(
  new THREE.CylinderGeometry(.18,.2,.22,12),
  skin
 );
 neck.position.y=2.25;
 spy.group.add(neck);

 const head=new THREE.Mesh(
  new THREE.SphereGeometry(.47,24,18),
  skin
 );
 head.position.y=2.62;
 spy.group.add(head);

 const glasses=new THREE.Mesh(
  new THREE.BoxGeometry(.7,.13,.04),
  mat(0x080b12,.5,.15)
 );
 glasses.position.set(0,2.68,-.45);
 spy.group.add(glasses);

 const hair=new THREE.Mesh(
  new THREE.SphereGeometry(.49,20,12),
  mat(0x171719,0,.7)
 );
 hair.scale.set(1,.45,1);
 hair.position.y=2.88;
 spy.group.add(hair);

 for(const side of[-1,1]){

  const shoulder=new THREE.Mesh(
   new THREE.SphereGeometry(.27,16,12),
   suit
  );
  shoulder.position.set(side*.62,2.02,0);
  spy.group.add(shoulder);

  const arm=new THREE.Mesh(
   new THREE.CapsuleGeometry(.18,.75,5,10),
   shirt
  );
  arm.position.set(side*.72,1.5,-.05);
  arm.rotation.z=side*.12;
  spy.group.add(arm);

  const hand=new THREE.Mesh(
   new THREE.SphereGeometry(.18,14,10),
   skin
  );
  hand.position.set(side*.78,1.05,-.18);
  spy.group.add(hand);

  const gun=new THREE.Group();

  const barrel=new THREE.Mesh(
   new THREE.BoxGeometry(.13,.13,.65),
   pistolMat
  );
  barrel.position.z=-.38;
  gun.add(barrel);

  const body=new THREE.Mesh(
   new THREE.BoxGeometry(.24,.18,.4),
   metal
  );
  body.position.z=.02;
  gun.add(body);

  const grip=new THREE.Mesh(
   new THREE.BoxGeometry(.16,.35,.16),
   gripMat
  );
  grip.position.set(0,-.2,.08);
  grip.rotation.x=-.2;
  gun.add(grip);

  gun.position.set(side*.8,1.05,-.48);
  gun.rotation.y=side*.04;

  spy.group.add(gun);
  spy.guns.push(gun);

  const leg=new THREE.Mesh(
   new THREE.CapsuleGeometry(.22,.8,5,10),
   suit
  );
  leg.position.set(side*.29,.55,0);
  spy.group.add(leg);

  const boot=new THREE.Mesh(
   new THREE.BoxGeometry(.38,.22,.7),
   mat(0x08090c,.1,.5)
  );
  boot.position.set(side*.29,.08,-.16);
  spy.group.add(boot);
 }

 spy.group.position.set(0,0,8);
}

createSpy();

const enemies=[];

function createEnemy(x,z){

 const g=new THREE.Group();

 const armor=mat(0x722727,0,.65);
 const dark=mat(0x16191f,0,.6);
 const skin=mat(0x8f5b48,0,.7);

 const body=new THREE.Mesh(
  new THREE.CapsuleGeometry(.43,.7,5,10),
  armor
 );
 body.position.y=1.45;
 g.add(body);

 const head=new THREE.Mesh(
  new THREE.SphereGeometry(.36,18,14),
  skin
 );
 head.position.y=2.25;
 g.add(head);

 for(const side of[-1,1]){
  const arm=new THREE.Mesh(
   new THREE.CapsuleGeometry(.15,.7,5,10),
   armor
  );
  arm.position.set(side*.55,1.45,0);
  g.add(arm);

  const leg=new THREE.Mesh(
   new THREE.CapsuleGeometry(.18,.7,5,10),
   dark
  );
  leg.position.set(side*.22,.55,0);
  g.add(leg);
 }

 g.position.set(x,0,z);
 scene.add(g);

 enemies.push({
  group:g,
  health:100,
  alive:true,
  speed:1.4+Math.random()*1.4,
  hitTimer:0
 });
}

for(let i=0;i<12;i++){
 const a=Math.random()*Math.PI*2;
 const d=20+Math.random()*40;
 createEnemy(Math.cos(a)*d,10+Math.sin(a)*d);
}

const keys={};

addEventListener("keydown",e=>{
 keys[e.code]=true;

 if(e.code==="Space")jump();
 if(e.code==="KeyR")reload();
 if(e.code==="KeyF")adrenaline();
});

addEventListener("keyup",e=>keys[e.code]=false);

let lastX=null;
let lastY=null;

addEventListener("mousemove",e=>{
 if(lastX!==null){
  spy.yaw-=(e.clientX-lastX)*.006;
  spy.pitch-=(e.clientY-lastY)*.003;
  spy.pitch=Math.max(-.35,Math.min(.5,spy.pitch));
 }
 lastX=e.clientX;
 lastY=e.clientY;
});

addEventListener("mouseleave",()=>{
 lastX=null;
 lastY=null;
});

addEventListener("mousedown",e=>{
 if(e.button===0)shoot();
});

function shoot(){

 if(spy.reload>0)return;

 if(spy.ammo<=0){
  reload();
  return;
 }

 spy.ammo--;

 spy.shooting=true;
 spy.shootTimer=.12;

 const forward=new THREE.Vector3(
  -Math.sin(spy.yaw),
  0,
  -Math.cos(spy.yaw)
 );

 const origin=spy.group.position.clone();
 origin.y+=1.4;

 let closest=null;
 let closestDistance=999;

 enemies.forEach(enemy=>{
  if(!enemy.alive)return;

  const target=enemy.group.position.clone();
  target.y+=1.3;

  const toTarget=target.clone().sub(origin);
  const distance=toTarget.length();
  toTarget.normalize();

  if(forward.dot(toTarget)>.97 && distance<35 && distance<closestDistance){
   closest=enemy;
   closestDistance=distance;
  }
 });

 if(closest){

  closest.health-=35;
  closest.hitTimer=.15;

  closest.group.position.add(
   forward.clone().multiplyScalar(.8)
  );

  spy.combo++;
  spy.comboTimer=2;
  spy.adrenaline=Math.min(100,spy.adrenaline+8);

  if(closest.health<=0){
   closest.alive=false;
   scene.remove(closest.group);
   spy.xp+=25;

   if(spy.xp>=100){
    spy.xp-=100;
    spy.level++;
    message("LEVEL UP!");
   }
  }
 }

 updateUI();
}

function reload(){

 if(spy.reload>0||spy.ammo===spy.maxAmmo)return;

 spy.reload=1.2;
 message("RELOADING");
}

function jump(){

 if(spy.group.position.y<=.02){
  spy.velocity.y=9;
 }
}

function adrenaline(){

 if(spy.adrenaline<100||spy.adrenalineMode)return;

 spy.adrenaline=0;
 spy.adrenalineMode=true;
 spy.adrenalineTime=10;
 message("ADRENALINE MODE!");
}

function message(text){

 const m=document.getElementById("message");
 m.textContent=text;
 m.style.opacity=1;

 setTimeout(()=>{
  m.style.opacity=0;
 },900);
}

function updateUI(){

 document.getElementById("level").textContent=spy.level;
 document.getElementById("xp").textContent=Math.floor(spy.xp);
 document.getElementById("rageFill").style.width=spy.adrenaline+"%";
 document.getElementById("combo").textContent=
 "COMBO x"+Math.floor(spy.combo);

}

function update(dt){

 const move=new THREE.Vector3();

 if(keys.KeyW)move.z-=1;
 if(keys.KeyS)move.z+=1;
 if(keys.KeyA)move.x-=1;
 if(keys.KeyD)move.x+=1;

 if(move.length()>0){

  move.normalize();

  const forward=new THREE.Vector3(
   -Math.sin(spy.yaw),0,-Math.cos(spy.yaw)
  );

  const right=new THREE.Vector3(
   Math.cos(spy.yaw),0,-Math.sin(spy.yaw)
  );

  const direction=
   right.clone().multiplyScalar(move.x)
   .add(forward.clone().multiplyScalar(move.z));

  let speed=keys.ShiftLeft||keys.ShiftRight?12:8;

  if(spy.adrenalineMode)speed*=1.5;

  spy.group.position.add(
   direction.multiplyScalar(speed*dt)
  );
 }

 spy.velocity.y-=24*dt;
 spy.group.position.y+=spy.velocity.y*dt;

 if(spy.group.position.y<0){
  spy.group.position.y=0;
  spy.velocity.y=0;
 }

 spy.group.rotation.y=spy.yaw;

 enemies.forEach(enemy=>{

  if(!enemy.alive)return;

  const distance=
   enemy.group.position.distanceTo(spy.group.position);

  if(distance<35&&distance>2.5){

   const direction=
    spy.group.position.clone()
    .sub(enemy.group.position)
    .normalize();

   enemy.group.position.add(
    direction.multiplyScalar(enemy.speed*dt)
   );

   enemy.group.lookAt(spy.group.position);
  }

  if(enemy.hitTimer>0){
   enemy.hitTimer-=dt;
  }
 });

 if(spy.shooting){

  spy.shootTimer-=dt;

  if(spy.shootTimer<=0){
   spy.shooting=false;
  }
 }

 if(spy.reload>0){

  spy.reload-=dt;

  if(spy.reload<=0){
   spy.ammo=spy.maxAmmo;
   message("RELOADED");
  }
 }

 if(spy.comboTimer>0){
  spy.comboTimer-=dt;
 }else{
  spy.combo=0;
 }

 if(spy.adrenalineMode){

  spy.adrenalineTime-=dt;

  if(spy.adrenalineTime<=0){
   spy.adrenalineMode=false;
   message("ADRENALINE ENDED");
  }
 }

 updateUI();
}

function updateCamera(){

 const target=spy.group.position.clone();
 target.y+=1.7;

 const distance=8;

 const offset=new THREE.Vector3(
  Math.sin(spy.yaw)*distance,
  4-spy.pitch*3,
  Math.cos(spy.yaw)*distance
 );

 camera.position.lerp(
  target.clone().add(offset),
  .12
 );

 camera.lookAt(
  target.x,
  target.y+spy.pitch*2,
  target.z
 );
}

document.getElementById("rageButton")?.addEventListener(
 "click",
 adrenaline
);

document.getElementById("attackButton")?.addEventListener(
 "touchstart",
 e=>{
  e.preventDefault();
  shoot();
 }
);

document.getElementById("jumpButton")?.addEventListener(
 "touchstart",
 e=>{
  e.preventDefault();
  jump();
 }
);

document.getElementById("dodgeButton")?.addEventListener(
 "touchstart",
 e=>{
  e.preventDefault();

  const direction=new THREE.Vector3(
   Math.sin(spy.yaw),
   0,
   Math.cos(spy.yaw)
  );

  spy.group.position.add(
   direction.multiplyScalar(-5)
  );
 }
);

addEventListener("resize",()=>{
 camera.aspect=innerWidth/innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
});

let last=performance.now();

function animate(now){

 requestAnimationFrame(animate);

 const dt=Math.min((now-last)/1000,.05);
 last=now;

 update(dt);
 updateCamera();

 renderer.render(scene,camera);
}

updateUI();
animate(performance.now());
