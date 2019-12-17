//calculate the distance between two points using
//the distance formula
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
	CreatePoints(wall, 0xfff9a6);
	return wall;
}

//Add visuals for points to the game scene
//for degbugging purposes
function CreatePoints(wall, color) {
	for (let i = 0; i < wall.points.length; i++) {
		gameScene.addChild(wall.points[i]);
		wall.points[i].distance = DistanceBetweenPoints(wall.points[i].center.x, wall.points[i].center.y, 300, 300);
		let slope = (wall.points[i].y - 300) / (wall.points[i].x - 300);
		wall.points[i].angle = Math.atan(slope);
	}
}

//Convert degree measurements to radians for
//cosine and sine functions
function DegreeToRad(degrees) {
	return (Math.PI / 180) * degrees;
}

//Function that changes the display to show the game over
//scene once the player has run out of life
function end() {
	// paused=true;
	startScreen=true;
	backgroundSound.stop();
	if (walls[0] != null) {
		gameScene.removeChild(walls[0]);
	}
	if (highScore < score) {
		localStorage.setItem(hsKey, score);
	}
	if (highLevel < level) {
		localStorage.setItem(hsLevel, level);
	}
	gameOverLabel1.text = `Highscore: ${localStorage.getItem(hsKey)}`;
	gameOverLabel2.text = `Highest Level: ${localStorage.getItem(hsLevel)}`;
	gameOverScene.visible = true;
	gameScene.visible = false;
	if(darkMode){
		inGameSoundDarkMode.stop();
	}
	else{
		inGameSoundLightMode.stop();
	}
	gameOverSound.play();
}

//function to test if the player is colliding with a particular wall
function CollisionTest(p1, p2, center, r) {
	//Check if it's next to the end points
	if (DistanceBetweenPoints(p1.x, p1.y, center.x, center.y) < r
		|| DistanceBetweenPoints(p2.x, p2.y, center.x, center.y) < r) {
		return true;
	}

	//Get the closest point
	let magnitude = DistanceBetweenPoints(p1.x, p1.y, p2.x, p2.y);
	let dot = (((center.x - p1.x) * (p2.x - p1.x)) + ((center.y - p1.y) * (p2.y - p1.y))) / Math.pow(magnitude, 2);
	let closest = new Point(p1.x + (dot * (p2.x - p1.x)), p1.y + (dot * (p2.y - p1.y)));

	if (!PointOnLine(p1, p2, closest)) { //Check if the point is on the line
		return false;
	}

	let distance = DistanceBetweenPoints(center.x, center.y, closest.x, closest.y);

	//See if the distance between the point and the player is less than the radius
	if (distance < r) {
		return true;
    }
    
	return false;
}

//function to test if a given point is actually
//on a line
function PointOnLine(p1, p2, point) {
	let d1 = DistanceBetweenPoints(p1.x, p1.y, point.x, point.y);
	let d2 = DistanceBetweenPoints(p2.x, p2.y, point.x, point.y);

	let magnitude = DistanceBetweenPoints(p1.x, p1.y, p2.x, p2.y);

	if (d1 + d2 >= magnitude - 0.1 && d1 + d2 <= magnitude + 0.1) {
		return true;
	}
	return false;
}