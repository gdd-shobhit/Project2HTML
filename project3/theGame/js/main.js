"use strict";
const app = new PIXI.Application(600, 600);
document.body.appendChild(app.view);
app.backgroundColor = 0x000000;

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

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

//Setup an array with points to be used with walls
let startPoints = [];
CalcStartPoints(sceneWidth, sceneHeight);

//variables for delay between wall spawns
let walls = [];
let wallTimer = 0; 
let wallTimer_Max = 3;

// Captures the keyboard arrow keys

let left = keyboard("ArrowLeft"),
	right = keyboard("ArrowRight");

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
	// #5 - Create ship
	centerVoid = new Player(5, 0xF5F5F5, 300, 300);
	gameScene.addChild(centerVoid);

	player = new Player(10, 0xF5F5F5, 280, 280);
	gameScene.addChild(player);

	// distance between player and center
	distance = DistanceBetweenPoints(centerVoid.x, centerVoid.y, player.x, player.y);

	// #8 - Start update loop
	app.ticker.add(gameLoop);

	// #9 - Start listening for click events on the canvas
	//app.view.onclick = fireBullet;
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

//Main loop for the game, all functionality here
function gameLoop() {
	let dt = 1 / app.ticker.FPS;
	if (dt > 1 / 12) dt = 1 / 12;
	left.press = () => {
		player.moveAnticlockwise(distance);
	}
	right.press = () => {
		player.moveClockwise(distance);
	}
	left.release = () => {
		player.movement = 0;
	}

	//wall functionality
	if (wallTimer == 0){
		walls.push(CreateWall());
	}
	for (let i = 0; i < walls.length; i++){
		walls[i].Shrink();
		if (walls[i].scale.x <= 0.01){
			walls.shift();
			return;
		}
	}

	wallTimer += dt;
	if (wallTimer > wallTimer_Max){
		wallTimer = 0;
	}
}

//Setup all UI elements
function createLabelsAndButtons() {

	let buttonStyle = new PIXI.TextStyle({
		fill: 0xFFFFFF,
		fontSize: 24,
		fontFamily: 'Verdana'
	});

	// 1 - set up 'startScene'
	// 1A = make top start label
	let startLabel1 = new PIXI.Text("Pentagon");
	startLabel1.style = new PIXI.TextStyle({
		fill: 0xFFFFFF,
		fontSize: 40,
		fontFamily: 'Verdana',
		stroke: 0xF9F9F9,
		strokeThickness: 6
	});
	startLabel1.x = 200;
	startLabel1.y = 200;
	startScene.addChild(startLabel1);

	// label 2
	let startLabel2 = new PIXI.Text("Can you Survive..?");
	startLabel2.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 30,
		fontFamily: 'Verdana',
		stroke: 0xF5F5F5,
		strokeThickness: 6
	});
	startLabel2.x = 160;
	startLabel2.y = 260;
	startScene.addChild(startLabel2);

	// start button

	let startButton = new PIXI.Text("Play Now!");
	startButton.style = buttonStyle;
	startButton.x = 235;
	startButton.y = sceneHeight - 100;
	startButton.interactive = true;
	startButton.buttonMode = true;
	startButton.on("pointerup", startGame); // startGame function referance
	startButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
	startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
	startScene.addChild(startButton);

}

//Make sure the game scene is visible and others are not
function startGame() {
	startScene.visible = false;
	gameOverScene.visible = false;
	gameScene.visible = true;

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

function DistanceBetweenPoints(point1x, point1y, point2x, point2y) {
	return Math.pow(Math.pow(point2x - point1x, 2) + Math.pow(point2y - point1y, 2), 0.5);
}

//Calculate all the starting points that a wall could stem from
function CalcStartPoints(width, height){
	startPoints.push(new Point(width/2, 0));
	for (let i = 1; i < 5; i++){
		let angle = DegreeToRad(90) + (DegreeToRad(72) * i)
		startPoints.push(new Point((width/2) + (Math.cos(angle) * width/2), Math.abs(Math.sin(angle) * height)));
	}
}

//Create a wall to be added to the game scene
function CreateWall(){
	let wall = new Wall(0xFFFFFF, sceneWidth/2, sceneHeight/2, startPoints);
	gameScene.addChild(wall);
	return wall;
}

function DegreeToRad(degrees){
	return (Math.PI/180) * degrees;
}