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

let score = 0;
let container, particles, numberOfParticles = 100;
let particleTexture
let lifetime = 0;
let life = 0;
let level = 1;
let timer = 0;
let fpsLabel = document.querySelector('#fps');
let enableLateralForce = false, enableVerticalForce = true;
let startLabel1 = new PIXI.Text("Polygons");
let startLabel2 = new PIXI.Text("Can you Survive..?");
let startLabel3 = new PIXI.Text("Left/Right Arrow \nfor Anti/Clockwise Movement");
let startButton = new PIXI.Text("Play Now!");
let gameLabel1 = new PIXI.Text("Score : " + score);
let gameLabel2 = new PIXI.Text("Life : " + life);
let gameLabel3 = new PIXI.Text("Level: " + life);
let gameOverLabel1 = new PIXI.Text("Final Score : " + score);
let gameOverLabel2 = new PIXI.Text("Level : " + level);
let colorButton = new PIXI.Text("Dark Mode!");
let restartButton = new PIXI.Text("Play Again!");
let darkMode = false;
let finalScore = 0;
let highScore=0;
let debugPoints=[];
let paused=false;
const hsKey= "sd5936-hs";
const hsLevel="sd5936-hsL";
let startScreen = true;
let highLevel=1;
let backgroundSound,inGameSound;



//Setup an array with points to be used with walls
let startPoints = [];
CalcStartPoints(sceneWidth, sceneHeight);

//variables for delay between wall spawns
let walls = [];
let wallTimer = 0;
let wallTimer_Max = 10;

// Captures the keyboard arrow keys
document.addEventListener("keydown", (e) => {
	if (e.code === "ArrowLeft") {
		player.moveAnticlockwise(distance, centerVoid);
	}
	if (e.code === "ArrowRight") {
		player.moveClockwise(distance, centerVoid);
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
	centerVoid = new Player(4, 0xa450a6, 305, 305);
	gameScene.addChild(centerVoid);

	player = new Player(7, 0xded237, 315, 315);
	gameScene.addChild(player);

	// #6 - Load Sounds
    backgroundSound = new Howl({
		src: ['../sounds/background.mp3'],
		loop:true
	});
	inGameSound= new Howl({
		src:['../sounds/inGame.mp3'],
		loop:true
	})

	backgroundSound.play();
	// distance between player and center
	distance = DistanceBetweenPoints(centerVoid.center.x, centerVoid.center.y, player.center.x, player.center.y);

	// #8 - Start update loop
	app.ticker.add(gameLoop);

	// set highscore

	if(localStorage.getItem(hsKey)!=null){
		highScore=localStorage.getItem(hsKey);
	}
	if(localStorage.getItem(hsLevel)!=null){
		highLevel=localStorage.getItem(hsLevel);
	}
	// Create Particles
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
		p.tint = 0xa450a6;
		particles.push(p);
		container.addChild(p);
	}
}


//Main loop for the game, all functionality here
function gameLoop() {
	if(paused)
	return;


	let dt = 1 / app.ticker.FPS;
	if (dt > 1 / 12) dt = 1 / 12;
	if(life<0){
		end();
		paused=true;
	}
	//Update any particles
	updateParticle(dt);
	timer++;
	if (timer > 1000) {
		timer = 0;
		level += 1;
	}
	if(startScreen==true){

	}
	else{
		if (wallTimer == 0) {
			if (darkMode) {
				walls.push(CreateWall(0xa450a6));
			}
			else {
				walls.push(CreateWall(0xC0C0C0));
			}
	
		}
		for (let i = 0; i < walls.length; i++) {
			walls[i].Shrink();
			if (walls[i].scale.x <= 0.1){
					if (CollisionTest(walls[i], player.center, player.radius))
						{
							console.log("hit");
							gameScene.removeChild(walls[i]);		
							}
					else{
							// console.log("nope");
					}
						
				}
				if (walls[i].scale.x <= 0.02) {
					gameScene.removeChild(walls[i]);	
					walls.shift();
				}
			}
	
			
		
			// gains life every 1000pts
		if (score % 1000 == 0) {
			life += 1;
		}
	
		// walls increase every level
		wallTimer_Max = 10 / level;
		wallTimer += dt;
		if (wallTimer > wallTimer_Max) {
			wallTimer = 0;
		}
		score += 1;
		changeFields();
	
		}
	}
	//wall functionality
	

function updateParticle(dt) {
	let sin = Math.sin(lifetime / 60);
	let cos = Math.cos(lifetime / 60);

	let xForce = enableLateralForce ? sin * (120 * dt) : 0;
	let yForce = enableVerticalForce ? cos * (120 * dt) : 0;

	for (let p of particles) {
		p.update(dt, xForce, yForce);
	}

	lifetime++;
}

function changeFields() {
	gameLabel1.text = "Score : " + score;
	gameLabel2.text = "Life : " + life;
	gameLabel3.text = "Level : " + level;
}

//Setup all UI elements
function createLabelsAndButtons() {

	let buttonStyle = new PIXI.TextStyle({
		fill: 0x696969,
		fontSize: 24,
		fontFamily: 'Verdana'
	});
	let buttonStyle2 = new PIXI.TextStyle({
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

	// label 3

	startLabel3.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 16,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 3
	});
	startLabel3.x = 10;
	startLabel3.y = 30;
	startScene.addChild(startLabel3);

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
		strokeThickness: 3
	});
	gameLabel1.x = 10;
	gameLabel1.y = 10;
	gameScene.addChild(gameLabel1);

	// Life

	gameLabel2.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 20,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 3
	});
	gameLabel2.x = 10;
	gameLabel2.y = 40;
	gameScene.addChild(gameLabel2);

	// level
	gameLabel3.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 20,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 3
	});
	gameLabel3.x = 10;
	gameLabel3.y = 70;
	gameScene.addChild(gameLabel3);

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

	// GameOver Scene

	//Score
	gameOverLabel1.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 30,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 3
	});
	gameOverLabel1.x = 170;
	gameOverLabel1.y = 180;
	gameOverScene.addChild(gameOverLabel1);

	// Level

	gameOverLabel2.style = new PIXI.TextStyle({
		fill: 0x000000,
		fontSize: 25,
		fontFamily: 'Verdana',
		stroke: 0xC0C0C0,
		strokeThickness: 3
	});
	gameOverLabel2.x = 210;
	gameOverLabel2.y = 250;
	gameOverScene.addChild(gameOverLabel2);

	// button to change color

	restartButton.style = buttonStyle2;
	restartButton.x = 205;
	restartButton.y = 350;
	restartButton.interactive = true;
	restartButton.buttonMode = true;
	restartButton.on("pointerup", startGame); // colorGame function referance
	restartButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
	restartButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
	gameOverScene.addChild(restartButton);

}

//Make sure the game scene is visible and others are not
function startGame() {
	paused=false;
	backgroundSound.stop();
	startScreen=false;
	startScene.visible = false;
	gameOverScene.visible = false;
	gameScene.visible = true;
	level = 1;
	score = 0;
	life = 500;
	inGameSound.play();


}
function changeColor() {
	if (darkMode) {
		app.renderer.backgroundColor = 0xF5F5F5;
		startLabel1.style.fill = 0x00000;
		colorButton.text = "Dark Mode!";
		colorButton.style.fill = 0xa450a6;
		startLabel2.style.fill = 0x000000;
		startLabel3.style.fill = 0x000000;
		startLabel1.style.stroke = 0xC0C0C0;
		startLabel2.style.stroke = 0xC0C0C0;
		startLabel3.style.stroke = 0xC0C0C0;
		gameLabel1.style.fill = 0x000000;
		gameLabel2.style.fill = 0x000000;
		gameLabel3.style.fill = 0x000000;
		gameLabel1.style.stroke = 0xC0C0C0;
		gameLabel2.style.stroke = 0xC0C0C0;
		gameLabel3.style.stroke = 0xC0C0C0;
		startButton.style.fill = 0x050505;
		gameOverLabel1.style.fill = 0x000000;
		gameOverLabel2.style.fill = 0x000000;
		gameOverLabel1.style.stroke = 0xC0C0C0;
		gameOverLabel2.style.stroke = 0xC0C0C0;

	}
	else {
		app.renderer.backgroundColor = 0x1e1e32;
		startLabel1.style.stroke = 0xfff9a6;
		startLabel1.style.fill = 0xa450a6;
		startLabel2.style.fill = 0xa450a6;
		startLabel3.style.fill = 0xa450a6;
		colorButton.text = "Light Mode!";
		colorButton.style.fill = 0xFFFFFF;
		startLabel2.style.stroke = 0xfff9a6;
		startLabel3.style.stroke = 0xfff9a6;
		startButton.style.fill = 0xfff9a6;
		gameLabel1.style.fill = 0xa450a6;
		gameLabel2.style.fill = 0xa450a6;
		gameLabel3.style.fill = 0xa450a6;
		gameLabel1.style.stroke = 0xfff9a6;
		gameLabel2.style.stroke = 0xfff9a6;
		gameLabel3.style.stroke = 0xfff9a6;
		gameOverLabel1.style.fill = 0xa450a6;
		gameOverLabel2.style.fill = 0xa450a6;
		gameOverLabel1.style.stroke = 0xfff9a6;
		gameOverLabel2.style.stroke = 0xfff9a6;
	}

	darkMode = !darkMode;
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
function CreateWall(color) {
	let wall = new Wall(color, sceneWidth / 2, sceneHeight / 2, startPoints);
	gameScene.addChild(wall);
	CreatePoints(wall,0xfff9a6);
	return wall;
}


function CreatePoints(wall,color){
	for(let i=0;i<wall.points.length;i++){
		gameScene.addChild(wall.points[i]);
	
	}
	Distance(wall);
}

function Distance(wall){
	for(let i=0;i<wall.points.length;i++){
		wall.points[i].distance= DistanceBetweenPoints(wall.points[i].center.x,wall.points[i].center.y,300,300);	
		
	}
	UpdateAngleOnPoints(wall);
}

function UpdateAngleOnPoints(wall){

	let slope;
	for(let i=0;i<wall.points.length;i++){
		let slope= (wall.points[i].y-300)/(wall.points[i].x-300);
		wall.points[i].angle=Math.atan(slope);
	}	
}

// deg to rad
function DegreeToRad(degrees) {
	return (Math.PI / 180) * degrees;
}


function end() {
	// paused=true;
	startScreen=true;
	inGameSound.stop();
	backgroundSound.stop();
	if(walls[0]!=null){
		gameScene.removeChild(walls[0]);
	}
	// console.log(walls.length);
	// console.log(walls[0].points.length);
	if(highScore<score){
		localStorage.setItem(hsKey,score);
	}
	if(highLevel<level){
		localStorage.setItem(hsLevel,level);
	}
	gameOverLabel1.text=`Highscore: ${localStorage.getItem(hsKey)}`;
	gameOverLabel2.text=`Highest Level: ${localStorage.getItem(hsLevel)}`;
    gameOverScene.visible=true;
	gameScene.visible = false;
	
	// score = 0;
	// life = 2;
	// timer = 0;
	// wallTimer = 0;
	// level = 1;
}

function CollisionTest(wall, center, r) {
	// let v1 = new Point(center.x - p1.x, center.y - p1.y);
	// let v2 = new Point(p2.x - p1.x, p2.y - p1.y);
	let magnitude;
	for(let i=0;wall.points.length;i++){
		magnitude = DistanceBetweenPoints(wall.points[i].x,wall.points[i].y,center.x,center.y);
		if(magnitude<18){
			life--;
			gameScene.removeChild(wall.points[i]);
			gameScene.removeChild(wall);
			return true;
		}
		else{
			return false
		}
	}
	// v2.x /= magnitude;
	// v2.y /= magnitude;
	
	// let dot = (v1.x * v2.x) + (v1.y * v2.y);

	// let closest;
	// if (dot < 0) {
	// 	closest = new Point(p1.x, p2.y);
	// }
	// else if (dot > 1) {
	// 	closest = new Point(p2.x, p2.y);
	// }
	// else {
	// 	closest = new Point(p1.x + (v2.x * dot), p1.y + (v2.y * dot));
	// }

	// let distance = Math.sqrt(Math.pow(closest.x - center.x, 2) + Math.pow(closest.y - center.y, 2));
	// //console.log(distance);
	// //console.log(closest);
	// if (distance < 20){
	// 	// console.log(closest);
	// 	// //console.log(center);
	// 	// console.log(distance);
	// 	// //console.log(dot);
	// }

	// if (distance <= r) {
	// 	return true;
	// }
	// else {
	// 	return false;
	// }
}