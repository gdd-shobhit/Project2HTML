//Player class that displays the player as a sphere and
//contains method for moving the player about the screen with keyboard
//input
class Player extends PIXI.Graphics {
    constructor(radius, color = 0x000000, x = 0, y = 0, ) {
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.center = { x: this.x + radius, y: this.y + radius };
        this.angle = 0;
        this.speed = 50;
        this.pivot.set(this.width / 2, this.height / 2);
        // this.anchor={x:0.5,y:0.5};
        this.angle = 0;
    }

    //Move the player about the center with a given distance from a point
    //in a counterclockwise motion
    moveAnticlockwise(distance, centerVoid) {
        this.angle -= 0.15;
        // this.angle += angle;
        this.x = centerVoid.center.x + Math.cos(this.angle) * distance;
        this.y = centerVoid.center.y + Math.sin(this.angle) * distance;
        this.moveCenter();
        if (Math.abs(this.angle) >= 2 * Math.PI) {
            this.angle = 0;
        }
    }

    //Move in a clockwise motion
    moveClockwise(distance, centerVoid) {
        this.angle += 0.15;
        this.x = centerVoid.center.x + Math.cos(this.angle) * distance;
        this.y = centerVoid.center.y + Math.sin(this.angle) * distance;
        this.moveCenter();
        if (this.angle >= 2 * Math.PI) {
            this.angle = 0;
        }
    }

    moveCenter() {
        this.center.x = this.x + this.radius;
        this.center.y = this.y + this.radius;

    }
}

//Class that holds functionality for the walls the 
//player must avoid
class Wall extends PIXI.Graphics {
    constructor(color = 0x00000, centerX, centerY, startPoints) {
        super();
        this.pivot.set(centerX, centerY);
        this.points = [];

        //Using the points generated at the start of the game, 
        //create a wall and store the points for later use with collisions
        this.lineStyle(12, color, 1);
        let lines = 1 + Math.floor(Math.random() * 4);
        let index = Math.floor(Math.random() * 5);
        for (let i = 0; i < lines; i++) {
            if (index > 4)
                index = 0;

            this.moveTo(startPoints[index].x, startPoints[index].y);
            if (i == 0)
                this.points.push(new Point(startPoints[index].x, startPoints[index].y, 0xded237));

            if (index == 4) {
                this.lineTo(startPoints[0].x, startPoints[0].y);
                this.points.push(new Point(startPoints[0].x, startPoints[0].y, 0xded237));
            }
            else {
                this.lineTo(startPoints[index + 1].x, startPoints[index + 1].y);
                this.points.push(new Point(startPoints[index + 1].x, startPoints[index + 1].y, 0xded237));
            }

            index++;
        }


        this.color = color;
        this.x = centerX;
        this.y = centerY;
    }

    //Shrink down the walls and move the points accordingly
    Shrink() {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].distance = this.points[i].distance * 0.99;
            if (this.points[i].distance < 16) {
                gameScene.removeChild(this.points[i]);
            }
            UpdatePoints(this.points[i], this.points[i].distance);
        }

        this.scale.set(this.scale.x * 0.99, this.scale.y * 0.99);
    }

}

//Function that updates the positions of points within each wall,
//for the purposes of calculating collisions
function UpdatePoints(point, distance) {
    if (point.x > 300) {
        point.x = 300 + Math.abs(distance * Math.cos(point.angle));
    }
    else if (point.x < 300){
        point.x = 300 - Math.abs(distance * Math.cos(point.angle));
    }

    if (point.y > 300) {
        point.y = 300 + Math.abs(distance * Math.sin(point.angle));
    }
    else if (point.y < 300) {
        point.y = 300 - Math.abs(distance * Math.sin(point.angle));
    }
}

//Simple point container class that has information
//for debgugging purposes and to move about the screen when prompted
class Point extends PIXI.Graphics {
    constructor(x, y, fill) {
        super();
        // 0xded237
        this.beginFill(fill);
        this.drawCircle(0, 0, 5);
        this.endFill();
        this.x = x;
        this.y = y;
        this.center
        this.center = { x: this.x, y: this.y };
        this.distance = 0;
        this.angle = 0;
    }
}

//Particle class that simply moves about the screen and is 
//displayed as a sphere
class Particle extends PIXI.Sprite {
    constructor(radius, x, y, xSpeed, ySpeed) {
        super(particleTexture);
        this.x = x;
        this.y = y;
        this.anchor.set(.5, .5);
        this.width = radius * 2;
        this.height = radius * 2;
        this.radius = radius;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        // this.tint = 0xA9A9A9;
    }

    //Update method that applies a given force to the particle to move it about
    //the screen in a smooth manner
    update(dt, xForce, yForce) {
        this.x += this.xSpeed * dt;
        this.y += this.ySpeed * dt;

        this.x += xForce;
        this.y += yForce;

        if (this.x < this.radius || this.x > (window.innerWidth - this.radius)) {
            this.xSpeed *= -1;
        }

        if (this.y < this.radius || this.y > (window.innerHeight - this.radius)) {
            this.ySpeed *= -1;
        }
    }
}
