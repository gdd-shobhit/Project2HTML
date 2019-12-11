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

    moveAnticlockwise(distance,centerVoid) {

        this.angle -= 0.15;
        // this.angle += angle;
        this.x = centerVoid.center.x+Math.cos(this.angle)*distance;
        this.y = centerVoid.center.y+Math.sin(this.angle)*distance;
        this.moveCenter();
        if (Math.abs(this.angle) >= 2 * Math.PI) {
            this.angle = 0;
        }

    }
    moveClockwise(distance,centerVoid) {
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

class Wall extends PIXI.Graphics {
    constructor(color = 0x00000, centerX, centerY, startPoints) {
        super();
        this.pivot.set(centerX, centerY);

        this.lineStyle(4, color, 1);
        let lines = Math.floor(Math.random() * 5);
        let index = Math.floor(Math.random() * 5);
        for (let i = 0; i < lines; i++) {
            if (index > 4)
                index = 0;
            this.moveTo(startPoints[index].x, startPoints[index].y);
            if (index == 4)
                this.lineTo(startPoints[0].x, startPoints[0].y);
            else
                this.lineTo(startPoints[index + 1].x, startPoints[index + 1].y);
            index++;
        }

        this.x = centerX;
        this.y = centerY;
    }

    Shrink() {
        this.scale.set(this.scale.x * 0.99, this.scale.y * 0.99);
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

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
        this.tint = 0xA9A9A9;
    }

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
