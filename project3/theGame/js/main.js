"use strict";
const app = new PIXI.Application({
	width: 600,
	height: 600,
	backgroundColor: 0xF5F5F5,
});

document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// adding cursor

app.renderer.plugins.interaction.cursorStyles.default = "url('images/cursor.png'),auto";
PIXI.loader.
	add(["images/cursor.png"]).
	on("progress", e => { console.log(`progress=${e.progress}`) }).
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

let score=0;
let container, particles, numberOfParticles = 100;
let particleTexture
let lifetime = 0;
let life= 0;
let fpsLabel = document.querySelector('#fps');
let enableLateralForce = false, enableVerticalForce = true;
let startLabel1 = new PIXI.Text("Pentagon");
let startLabel2 = new PIXI.Text("Can you Survive..?");
let startButton = new PIXI.Text("Play Now!");
let gameLabel1 = new PIXI.Text("Score : "+ score);
let gameLabel2 = new PIXI.Text("Life : "+ life);
let colorButton = new PIXI.Text("Dark Mode!");
let lightmode= true;


//Setup an array with points to be used with walls
let startPoints = [];
CalcStartPoints(sceneWidth, sceneHeight);

//variables for delay between wall spawns
let walls = [];
let wallTimer = 0;
let wallTimer_Max = 3;

// Captures the keyboard arrow keys
document.addEventListener("keydown", (e) => {
	if (e.code === "ArrowLeft") {
		player.moveAnticlockwise(distance,centerVoid);
	}
	if (e.code === "ArrowRight") {
		player.moveClockwise(distance,centerVoid);
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
	stage.cursor = "url('images/cursor.png'),auto";
	particleTexture = PIXI.Texture.fromImage('images/particle-6x6.png');

	// #1 - Create the `start` scene
	startScene = new PIXI.Container();
	// startScene.filters.push(vignetteFilter);
	stage.addChild(startScene);

	// #2 - Create the main `game` scene and make it invisible
	gameScene = new PIXI.Container();
	// gameScene.filters.push(vignetteFilter);
	gameScene.visible = false;
	stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
	// gameOverScene.filters.push(vignetteFilter);
	gameOverScene.visible = false;
	stage.addChild(gameOverScene);

	// #4 - Create labels for all 3 scenes
	createLabelsAndButtons();

	// #5 - Create the player
	centerVoid = new Player(5, 0x696969, 305, 305);
	gameScene.addChild(centerVoid);

	player = new Player(10, 0x424242, 320, 320);
	gameScene.addChild(player);

	// distance between player and center
	distance = DistanceBetweenPoints(centerVoid.center.x, centerVoid.center.y, player.center.x, player.center.y);

	// #8 - Start update loop
	app.ticker.add(gameLoop);

	// #9 - Start listening for click events on the canvas
	//app.view.onclick = fireBullet;
	createParticles();

	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createParticles() {
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
}

//Main loop for the game, all functionality here
function gameLoop() {
	let dt = 1 / app.ticker.FPS;
	if (dt > 1 / 12) dt = 1 / 12;

	//Update any particles
	updateParticle(dt);
	
	//wall functionality
	if (wallTimer == 0) {
		walls.push(CreateWall());
	}
	for (let i = 0; i < walls.length; i++) {
		walls[i].Shrink();
		if (walls[i].scale.x <= 0.01) {
			walls.shift();
			return;
		}
	}

	wallTimer += dt;
	if (wallTimer > wallTimer_Max) {
		wallTimer = 0;
	}
}

function updateParticle (dt){
	let sin = Math.sin(lifetime / 60);
	let cos = Math.cos(lifetime / 60);

	let xForce = enableLateralForce ? sin * (120 * dt) : 0;
	let yForce = enableVerticalForce ? cos * (120 * dt) : 0;

	for (let p of particles) {
		p.update(dt, xForce, yForce);
	}

	lifetime++;
}

//Setup all UI elements
function createLabelsAndButtons() {

	let buttonStyle = new PIXI.TextStyle({
		fill: 0x696969,
		fontSize: 24,
		fontFamily: 'Verdana'
	});
	let buttonStyle2= new PIXI.TextStyle({
		fill: 0xa450a6,
		fontSize: 24,
		fontFamily: 'Verdana'
	});

	// 1 - set up 'startScene'
	// 1A = make top start label
	startLabel1.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 40,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 4
	});
	startLabel1.x = 200;
	startLabel1.y = 200;
	startScene.addChild(startLabel1);

	// label 2
	startLabel2.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 30,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 4
	});
	startLabel2.x = 160;
	startLabel2.y = 260;
	startScene.addChild(startLabel2);

	// start button
	startButton.style = buttonStyle;
	startButton.x = 235;
	startButton.y = sceneHeight - 100;
	startButton.interactive = true;
	startButton.buttonMode = true;
	startButton.on("pointerup", startGame); // startGame function referance
	startButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
	startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
	startScene.addChild(startButton);

	// 2 - set up 'gameScene'
	// gamaeLabel Score
	gameLabel1.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 20,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 4
	});
	gameLabel1.x = 10;
	gameLabel1.y = 10;
	startScene.addChild(gameLabel1);

	// Life

	
	gameLabel2.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 20,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 4
	});
	gameLabel2.x = 10;
	gameLabel2.y = 40;
	startScene.addChild(gameLabel2);

	// button to change color
	
	colorButton.style = buttonStyle2;
	colorButton.x = 400;
	colorButton.y = 30;
	colorButton.interactive = true;
	colorButton.buttonMode = true;
	colorButton.on("pointerup", changeColor); // colorGame function referance
	colorButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
	colorButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
	stage.addChild(colorButton);
	


}

//Make sure the game scene is visible and others are not
function startGame() {
	startScene.visible = false;
	gameOverScene.visible = false;
	gameScene.visible = true;

}
function changeColor(){
	if(lightmode){
		app.renderer.backgroundColor=0xF5F5F5;
		startLabel1.style.fill=0x00000;
		colorButton.text="Dark Mode!";
		colorButton.style.fill=0xa450a6;
		startLabel2.style.fill=0x000000;
		startLabel1.style.stroke=0xC0C0C0;
	
	}
	else{
		app.renderer.backgroundColor=0x1e1e32;
		startLabel1.style.stroke=0xfff9a6;
		startLabel1.style.fill=0xa450a6;
		startLabel2.style.fill=0xa450a6;
		colorButton.text="Light Mode!";
		colorButton.style.fill=0xFFFFFF;
	}
	
	lightmode=!lightmode;
}


function DistanceBetweenPoints(point1x, point1y, point2x, point2y) {
	return Math.pow(Math.pow(point2x - point1x, 2) + Math.pow(point2y - point1y, 2), 0.5);
}

//Calculate all the starting points that a wall could stem from
function CalcStartPoints(width, height) {
	startPoints.push(new Point(width / 2, 0));
	for (let i = 1; i < 5; i++) {
		let angle = DegreeToRad(90) + (DegreeToRad(72) * i)
		startPoints.push(new Point((width / 2) + (Math.cos(angle) * width / 2), Math.abs(Math.sin(angle) * height)));
	}
}

//Create a wall to be added to the game scene
function CreateWall() {
	let wall = new Wall(0xC0C0C0, sceneWidth / 2, sceneHeight / 2, startPoints);
	gameScene.addChild(wall);
	return wall;
}

function DegreeToRad(degrees) {
	return (Math.PI / 180) * degrees;
}