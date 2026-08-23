const scene=new THREE.Scene();

scene.background=new THREE.Color(0x111827);
scene.fog=new THREE.Fog(0x111827,35,180);

const camera=new THREE.PerspectiveCamera(
70,
innerWidth/innerHeight,
.1,
500
);

const renderer=new THREE.WebGLRenderer({
antialias:true
});

renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

document.getElementById("game").appendChild(renderer.domElement);


/* LIGHTING */

scene.add(
new THREE.HemisphereLight(
0xbfd8ff,
0x202030,
1.8
)
);

const sun=new THREE.DirectionalLight(
0xffffff,
2.3
);

sun.position.set(40,70,25);
sun.castShadow=true;
sun.shadow.mapSize.width=2048;
sun.shadow.mapSize.height=2048;

scene.add(sun);


/* GROUND */

const ground=new THREE.Mesh(
new THREE.PlaneGeometry(400,400),
new THREE.MeshStandardMaterial({
color:0x292c33,
roughness:.9
})
);

ground.rotation.x=-Math.PI/2;
ground.receiveShadow=true;

scene.add(ground);


/* BUILDINGS */

function building(x,z,w,h,d){

const material=new THREE.MeshStandardMaterial({
color:new THREE.Color(
.08+Math.random()*.08,
.1+Math.random()*.08,
.15+Math.random()*.1
),
roughness:.8
});

const b=new THREE.Mesh(
new THREE.BoxGeometry(w,h,d),
material
);

b.position.set(x,h/2,z);
b.castShadow=true;
b.receiveShadow=true;

scene.add(b);

for(let y=4;y<h-1;y+=4){

for(let xx=-w/2+1;xx<w/2-1;xx+=2){

const window=new THREE.Mesh(
new THREE.PlaneGeometry(.7,1.1),
new THREE.MeshBasicMaterial({
color:Math.random()>.35?
0xffd36b:
0x162034
})
);

window.position.set(
x+xx,
y,
z-d/2-.02
);

scene.add(window);

}

}

}

for(let x=-100;x<=100;x+=20){

for(let z=-100;z<=100;z+=20){

if(Math.abs(x)<30&&Math.abs(z)<30)continue;

building(
x+(Math.random()-.5)*5,
z+(Math.random()-.5)*5,
13+Math.random()*5,
12+Math.random()*35,
13+Math.random()*5
);

}

}


/* MATERIAL */

function material(color,metal=.0,rough=.6){

return new THREE.MeshStandardMaterial({
color:color,
metalness:metal,
roughness:rough
});

}


/* SUITS */

const suits={

classic:{
name:"Classic Yellow & Blue",
body:0x2455a4,
accent:0xe4c52c,
boots:0x151a25
},

winter:{
name:"Winter Soldier",
body:0x171b24,
accent:0x8c1d2c,
boots:0x090b10,
metal:0xbfc7cf
},

oldlogan:{
name:"Old Man Logan",
body:0x704d35,
accent:0xa87b4f,
boots:0x25201d
},

stealth:{
name:"Stealth",
body:0x111318,
accent:0x343943,
boots:0x08090b
},

arctic:{
name:"Arctic",
body:0xdde8ee,
accent:0x3b7cae,
boots:0x26313c
},

future:{
name:"Future",
body:0x4b4f58,
accent:0x19a9c7,
boots:0x161a22
}

};


/* PLAYER */

const player={
group:new THREE.Group(),
suit:"classic",
yaw:0,
pitch:0,
velocity:new THREE.Vector3(),
attacking:false,
attackTime:0,
combo:0,
comboTimer:0,
rage:0,
rageMode:false,
rageTime:0,
xp:0,
level:1,
claws:[]
};

scene.add(player.group);


/* PLAYER MODEL */

function createPlayer(){

player.group.clear();
player.claws=[];

const s=suits[player.suit];

const bodyMat=material(s.body,0,.5);
const accentMat=material(s.accent,.1,.4);
const bootMat=material(s.boots,.05,.5);
const skinMat=material(0xc98768,0,.65);
const metalMat=material(
s.metal||0xdbe5eb,
1,
.15
);


/* HIPS */

const hips=new THREE.Mesh(
new THREE.BoxGeometry(1.05,.45,.65),
accentMat
);

hips.position.y=1.05;

player.group.add(hips);


/* TORSO */

const torso=new THREE.Mesh(
new THREE.CapsuleGeometry(.55,.85,6,12),
bodyMat
);

torso.scale.set(1,.95,.62);
torso.position.y=1.65;
torso.castShadow=true;

player.group.add(torso);


/* CHEST */

const chest=new THREE.Mesh(
new THREE.BoxGeometry(.9,.5,.08),
accentMat
);

chest.position.set(0,1.72,-.38);

player.group.add(chest);


/* WINTER SOLDIER ARMOR */

if(player.suit==="winter"){

const star=new THREE.Mesh(
new THREE.ConeGeometry(.18,0.05,5),
material(0xdfe5eb,1,.2)
);

star.rotation.x=Math.PI/2;
star.position.set(0,1.72,-.45);

player.group.add(star);

}


/* NECK */

const neck=new THREE.Mesh(
new THREE.CylinderGeometry(.18,.2,.22,12),
skinMat
);

neck.position.y=2.25;

player.group.add(neck);


/* HEAD */

const head=new THREE.Mesh(
new THREE.SphereGeometry(.48,24,18),
skinMat
);

head.position.y=2.62;
head.castShadow=true;

player.group.add(head);


/* MASK FOR WINTER SUIT */

if(player.suit==="winter"){

const mask=new THREE.Mesh(
new THREE.SphereGeometry(.5,20,15),
metalMat
);

mask.scale.set(1,.75,.85);
mask.position.set(0,2.64,-.12);

player.group.add(mask);

const visor=new THREE.Mesh(
new THREE.BoxGeometry(.48,.12,.03),
material(0x10131a,1,.15)
);

visor.position.set(0,2.72,-.55);

player.group.add(visor);

}


/* HAIR */

if(player.suit!=="winter"){

const hair=new THREE.Mesh(
new THREE.SphereGeometry(.5,20,12),
bodyMat
);

hair.scale.set(1.03,.45,1.03);
hair.position.y=2.88;

player.group.add(hair);

}


/* OLD MAN LOGAN COAT */

if(player.suit==="oldlogan"){

const coat=new THREE.Mesh(
new THREE.BoxGeometry(1.35,1.6,.72),
material(0x473226,0,.9)
);

coat.position.set(0,1.45,.05);
coat.scale.set(1,.9,1);

player.group.add(coat);

}


/* ARMS */

for(const side of[-1,1]){

const shoulder=new THREE.Mesh(
new THREE.SphereGeometry(.27,16,12),
bodyMat
);

shoulder.position.set(side*.62,2.05,0);

player.group.add(shoulder);


const upper=new THREE.Mesh(
new THREE.CapsuleGeometry(.19,.58,5,10),
bodyMat
);

upper.position.set(side*.72,1.68,0);
upper.rotation.z=side*.12;

player.group.add(upper);


/* METAL WINTER ARM */

const forearmMaterial=
player.suit==="winter"&&side===-1?
metalMat:
skinMat;

const fore=new THREE.Mesh(
new THREE.CapsuleGeometry(.16,.52,5,10),
forearmMaterial
);

fore.position.set(side*.78,1.25,-.05);
fore.rotation.z=side*.08;

player.group.add(fore);


/* CLAWS */

for(let i=0;i<3;i++){

const claw=new THREE.Mesh(
new THREE.ConeGeometry(.045,.75,10),
metalMat
);

claw.rotation.x=Math.PI/2;

claw.position.set(
side*(.82+i*.055),
1.12+i*.035,
-.43
);

player.group.add(claw);

player.claws.push(claw);

}


/* LEGS */

const thigh=new THREE.Mesh(
new THREE.CapsuleGeometry(.23,.65,5,10),
bootMat
);

thigh.position.set(side*.29,.72,0);

player.group.add(thigh);


const shin=new THREE.Mesh(
new THREE.CapsuleGeometry(.18,.58,5,10),
bootMat
);

shin.position.set(side*.29,.25,-.03);

player.group.add(shin);


const foot=new THREE.Mesh(
new THREE.BoxGeometry(.35,.2,.65),
bootMat
);

foot.position.set(side*.29,.05,-.16);

player.group.add(foot);

}

player.group.position.set(0,0,8);

}

createPlayer();


/* ENEMIES */

const enemies=[];

function createEnemy(x,z){

const g=new THREE.Group();

const armor=material(0x762525,0,.6);
const dark=material(0x17191f,0,.6);
const skin=material(0x8f5b48,0,.7);


const torso=new THREE.Mesh(
new THREE.CapsuleGeometry(.43,.7,5,10),
armor
);

torso.position.y=1.45;

g.add(torso);


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
arm.rotation.z=side*.2;

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
speed:1.4+Math.random()*1.4
});

}

for(let i=0;i<12;i++){

const angle=Math.random()*Math.PI*2;
const distance=20+Math.random()*40;

createEnemy(
Math.cos(angle)*distance,
10+Math.sin(angle)*distance
);

}


/* INPUT */

const keys={};

addEventListener("keydown",e=>{

keys[e.code]=true;

if(e.code==="Space")jump();
if(e.code==="KeyE")attack();
if(e.code==="KeyQ")dodge();
if(e.code==="KeyR")rage();

});

addEventListener("keyup",e=>{
keys[e.code]=false;
});


/* CAMERA LOOK */

let lastX=null;
let lastY=null;

addEventListener("mousemove",e=>{

if(lastX!==null){

const dx=e.clientX-lastX;
const dy=e.clientY-lastY;

player.yaw-=dx*.006;
player.pitch-=dy*.003;

player.pitch=
Math.max(-.35,
Math.min(.55,player.pitch));

}

lastX=e.clientX;
lastY=e.clientY;

});


addEventListener("mouseleave",()=>{

lastX=null;
lastY=null;

});


/* ATTACK */

function attack(){

if(player.attacking)return;

player.attacking=true;
player.attackTime=.35;

player.combo++;
player.comboTimer=2;

player.rage=
Math.min(100,player.rage+10);

const forward=new THREE.Vector3(
-Math.sin(player.yaw),
0,
-Math.cos(player.yaw)
);

enemies.forEach(enemy=>{

if(!enemy.alive)return;

const distance=
enemy.group.position.distanceTo(
player.group.position
);

if(distance<4){

enemy.health-=
30+(player.combo*5);

enemy.group.position.add(
forward.clone().multiplyScalar(2)
);

if(enemy.health<=0){

enemy.alive=false;

scene.remove(enemy.group);

player.xp+=25;

if(player.xp>=100){

player.xp-=100;
player.level++;

message("LEVEL UP!");

}

}

}

});

updateUI();

}


/* JUMP */

function jump(){

if(player.group.position.y<=.02){

player.velocity.y=9;

}

}


/* DODGE */

function dodge(){

const direction=new THREE.Vector3(
Math.sin(player.yaw),
0,
Math.cos(player.yaw)
);

player.group.position.add(
direction.multiplyScalar(-5)
);

}


/* RAGE */

function rage(){

if(player.rage<100||player.rageMode)return;

player.rage=0;
player.rageMode=true;
player.rageTime=15;

message("RAGE MODE!");

}


/* MESSAGE */

function message(text){

const m=document.getElementById("message");

m.textContent=text;
m.style.opacity=1;

setTimeout(()=>{
m.style.opacity=0;
},1000);

}


/* UI */

function updateUI(){

document.getElementById("level").textContent=
player.level;

document.getElementById("xp").textContent=
Math.floor(player.xp);

document.getElementById("rageFill").style.width=
player.rage+"%";

document.getElementById("combo").textContent=
"COMBO x"+Math.floor(player.combo);

const defeated=
enemies.filter(e=>!e.alive).length;

document.getElementById("missionProgress").textContent=
defeated+" / 10";

}


/* UPDATE */

function update(dt){

const move=new THREE.Vector3();

if(keys.KeyW)move.z-=1;
if(keys.KeyS)move.z+=1;
if(keys.KeyA)move.x-=1;
if(keys.KeyD)move.x+=1;

if(move.length()>0){

move.normalize();

const forward=new THREE.Vector3(
-Math.sin(player.yaw),
0,
-Math.cos(player.yaw)
);

const right=new THREE.Vector3(
Math.cos(player.yaw),
0,
-Math.sin(player.yaw)
);

const direction=
right.clone().multiplyScalar(move.x)
.add(
forward.clone().multiplyScalar(move.z)
);

let speed=
keys.ShiftLeft||keys.ShiftRight?
12:8;

if(player.rageMode)
speed*=1.5;

player.group.position.add(
direction.multiplyScalar(speed*dt)
);

}

player.velocity.y-=24*dt;

player.group.position.y+=
player.velocity.y*dt;

if(player.group.position.y<0){

player.group.position.y=0;
player.velocity.y=0;

}

player.group.rotation.y=
player.yaw;


/* ENEMY AI */

enemies.forEach(enemy=>{

if(!enemy.alive)return;

const distance=
enemy.group.position.distanceTo(
player.group.position
);

if(distance<35&&distance>2.5){

const direction=
player.group.position.clone()
.sub(enemy.group.position)
.normalize();

enemy.group.position.add(
direction.multiplyScalar(
enemy.speed*dt
)
);

enemy.group.lookAt(
player.group.position
);

}

});


/* CLAW ANIMATION */

if(player.attacking){

player.attackTime-=dt;

const swing=
Math.sin(
(1-player.attackTime/.35)*Math.PI
)*.7;

player.claws.forEach(claw=>{

claw.rotation.x=
Math.PI/2-swing;

});

if(player.attackTime<=0){

player.attacking=false;

player.claws.forEach(claw=>{
claw.rotation.x=Math.PI/2;
});

}

}


/* RAGE TIMER */

if(player.rageMode){

player.rageTime-=dt;

if(player.rageTime<=0){

player.rageMode=false;

message("RAGE ENDED");

}

}


/* COMBO TIMER */

if(player.comboTimer>0){

player.comboTimer-=dt;

}else{

player.combo=0;

}

updateUI();

}


/* CAMERA */

function updateCamera(){

const target=
player.group.position.clone();

target.y+=1.8;

const distance=8;

const offset=new THREE.Vector3(
Math.sin(player.yaw)*distance,
4-player.pitch*3,
Math.cos(player.yaw)*distance
);

camera.position.lerp(
target.clone().add(offset),
.12
);

camera.lookAt(
target.x,
target.y+player.pitch*2,
target.z
);

}


/* SUIT MENU */

document
.getElementById("suitButton")
.addEventListener("click",()=>{

document.getElementById("suitMenu")
.style.display="block";

});


document
.getElementById("closeSuit")
.addEventListener("click",()=>{

document.getElementById("suitMenu")
.style.display="none";

});


document
.querySelectorAll("[data-suit]")
.forEach(button=>{

button.addEventListener("click",()=>{

const suit=
button.getAttribute("data-suit");

if(suits[suit]){

player.suit=suit;

createPlayer();

message(
suits[suit].name+
" EQUIPPED"
);

}

document.getElementById("suitMenu")
.style.display="none";

});

});


/* BUTTONS */

document
.getElementById("rageButton")
.addEventListener("click",rage);


document
.getElementById("attackButton")
.addEventListener("touchstart",e=>{

e.preventDefault();
attack();

});


document
.getElementById("jumpButton")
.addEventListener("touchstart",e=>{

e.preventDefault();
jump();

});


document
.getElementById("dodgeButton")
.addEventListener("touchstart",e=>{

e.preventDefault();
dodge();

});


/* RESIZE */

addEventListener("resize",()=>{

camera.aspect=
innerWidth/innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
innerWidth,
innerHeight
);

});


/* GAME LOOP */

let last=performance.now();

function animate(now){

requestAnimationFrame(animate);

const dt=
Math.min(
(now-last)/1000,
.05
);

last=now;

update(dt);
updateCamera();

renderer.render(
scene,
camera
);

}

updateUI();

animate(performance.now());
