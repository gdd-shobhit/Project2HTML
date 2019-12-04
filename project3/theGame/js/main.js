"use strict";
const app = new PIXI.Application(600,600);
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
    centerVoid=new Player(5,0xF5F5F5,300,300);
	gameScene.addChild(centerVoid);

	player=new Player(10,0xF5F5F5,280,280);
	gameScene.addChild(player);
	


	// #8 - Start update loop
    //app.ticker.add(gameLoop);
	
	// #9 - Start listening for click events on the canvas
    //app.view.onclick = fireBullet;
	
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function gameLoop(){
	let dt=1/app.ticker.FPS;
	if(dt>1/12)dt=1/12;	
}

function createLabelsAndButtons(){

	let buttonStyle = new PIXI.TextStyle({
        fill:0xFFFFFF,
        fontSize:24,
        fontFamily:'Verdana'
	});
	
	// 1 - set up 'startScene'
    // 1A = make top start label
    let startLabel1= new PIXI.Text("Pentagon");
    startLabel1.style= new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize:40,
        fontFamily: 'Verdana',
        stroke: 0xF9F9F9,
        strokeThickness:6
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
        stroke: 0xF5F5F5,
        strokeThickness:6
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