"use strict";
const app = new PIXI.Application({
	width:600,
	height:600,
	backgroundColor:0xF5F5F5
	// background: new URL("images/backGround.png")
});
document.body.appendChild(app.view);
app.backgroundColor= 0x000000;

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

PIXI.loader.
add(["images/cursor.png"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene;
let gameOverScene;
let player;
let centerVoid;
let distance;

let container, particles, numberOfParticles = 100;
	let particleTexture
  	let lifetime = 0;
	let fpsLabel = document.querySelector('#fps');
	let enableLateralForce = false, enableVerticalForce = true;

// Captures the keyboard arrow keys
	  document.addEventListener("keydown",(e)=>{
		if(e.code==="ArrowLeft"){
			player.moveAnticlockwise(distance);
		}
		if(e.code==="ArrowRight"){
			player.moveClockwise(distance);
		} 
	  })
	
// var vignetteFilter = new VignetteFilter({
// 	size: 0.5,
// 	amount: 0.5,
// 	focalPointX: 0.5,
// 	focalPointY: 0.5
// });

/** Assuming container is a Pixi Container */

function setup() {
	stage = app.stage;
	particleTexture = PIXI.Texture.fromImage('images/particle-6x6.png');
    // #1 - Create the `start` scene
	startScene= new PIXI.Container();
	// startScene.filters.push(vignetteFilter);
    stage.addChild(startScene);
	
	// #2 - Create the main `game` scene and make it invisible
	gameScene= new PIXI.Container();
	// gameScene.filters.push(vignetteFilter);
    gameScene.visible=false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene= new PIXI.Container();
	// gameOverScene.filters.push(vignetteFilter);
    gameOverScene.visible=false;
	stage.addChild(gameOverScene);
	// #4 - Create labels for all 3 scenes
	createLabelsAndButtons();
	// #5 - Create ship
    centerVoid=new Player(5,0x696969,295,295);
	gameScene.addChild(centerVoid);

	player=new Player(10,0x424242,320,300);
	gameScene.addChild(player);

	// distance between player and center
	distance=DistanceBetweenPoints(centerVoid.x,centerVoid.y,player.x,player.y);

	// #8 - Start update loop
    app.ticker.add(gameLoop);
	
	// #9 - Start listening for click events on the canvas
	//app.view.onclick = fireBullet;
	createParticles();
	
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

const createParticles = ()=>{
    particles = [];
    container = new PIXI.particles.ParticleContainer();
    container.maxSize = 30000;
    stage.addChild(container);
    for (let i = 0; i < numberOfParticles; i++) {
	    let p = new Particle(
      	  Math.random() * 2 + 1,
      	  Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          Math.random() * 180 - 90,
		  Math.random() * 180 - 90);
		  
      	particles.push(p);
     	container.addChild(p);
    }
    
    // Animate the rotation
    app.ticker.add(updateParticle);
  }

function gameLoop(){
	let dt=1/app.ticker.FPS;
	if(dt>1/12)dt=1/12;
	
}

const updateParticle=()=>{
	let dt=1/app.ticker.FPS;
	if(dt>1/12)dt=1/12;

	let sin = Math.sin(lifetime / 60);
    let cos = Math.cos(lifetime / 60);
    
    let xForce = enableLateralForce ? sin * (120 * dt) : 0;
    let yForce = enableVerticalForce ? cos * (120 * dt) : 0;
 
    for (let p of particles){
      p.update(dt, xForce, yForce);
    }
    
    lifetime++;
   
}

function createLabelsAndButtons(){

	let buttonStyle = new PIXI.TextStyle({
        fill:0x696969,
        fontSize:24,
        fontFamily:'Verdana'
	});
	
	// 1 - set up 'startScene'
    // 1A = make top start label
    let startLabel1= new PIXI.Text("Pentagon");
    startLabel1.style= new PIXI.TextStyle({
        fill: 0x000000,
        fontSize:40,
        fontFamily: 'Verdana',
        stroke: 0xC0C0C0,
        strokeThickness:4
    });
    startLabel1.x=200;
    startLabel1.y=200;
	startScene.addChild(startLabel1);
	
	// label 2
	let startLabel2= new PIXI.Text("Can you Survive..?");
    startLabel2.style= new PIXI.TextStyle({
        fill: 0x000000,
        fontSize:30,
        fontFamily: 'Verdana',
        stroke: 0xC0C0C0,
        strokeThickness:4
    });
    startLabel2.x=160;
    startLabel2.y=260;
	startScene.addChild(startLabel2);
	
	// start button

	let startButton= new PIXI.Text("Play Now!");
    startButton.style=buttonStyle;
    startButton.x=235;
    startButton.y=sceneHeight- 100;
    startButton.interactive= true;
    startButton.buttonMode= true;
    startButton.on("pointerup",startGame); // startGame function referance
    startButton.on('pointerover',e=>e.target.alpha=0.7); // concise arrow function with no brackets
    startButton.on('pointerout',e=>e.currentTarget.alpha= 1.0);
	startScene.addChild(startButton);
	
}

function startGame(){
    startScene.visible=false;
    gameOverScene.visible=false;
    gameScene.visible= true;

}

function keyboard(value) {
	let key = {};
	key.value = value;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`
	key.downHandler = event => {
	  if (event.key === key.value) {
		if (key.isUp && key.press) key.press();
		key.isDown = true;
		key.isUp = false;
		event.preventDefault();
	  }
	};
  
	//The `upHandler`
	key.upHandler = event => {
	  if (event.key === key.value) {
		if (key.isDown && key.release) key.release();
		key.isDown = false;
		key.isUp = true;
		event.preventDefault();
	  }
	};
  
	//Attach event listeners
	const downListener = key.downHandler.bind(key);
	const upListener = key.upHandler.bind(key);
	
	window.addEventListener(
	  "keydown", downListener, false
	);
	window.addEventListener(
	  "keyup", upListener, false
	);
	
	// Detach event listeners
	key.unsubscribe = () => {
	  window.removeEventListener("keydown", downListener);
	  window.removeEventListener("keyup", upListener);
	};
	
	return key;
  }

  function DistanceBetweenPoints(point1x,point1y,point2x,point2y){
	  return Math.pow(Math.pow(point2x-point1x,2)+Math.pow(point2y-point1y,2),0.5);
  }