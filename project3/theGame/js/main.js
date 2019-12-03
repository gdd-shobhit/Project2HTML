"use strict";
const app = new PIXI.Application(600,600);
let container= new PIXI.Container();
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// aliases
let stage;

// game variables
let startScene;
let gameScene;
let gameOverScene;

var vignetteFilter = new VignetteFilter({
	size: 0.5,
	amount: 0.5,
	focalPointX: 0.5,
	focalPointY: 0.5
});

/** Assuming container is a Pixi Container */
container.filters.push(vignetteFilter);