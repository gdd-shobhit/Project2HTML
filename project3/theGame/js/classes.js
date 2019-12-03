class Player extends PIXI.Graphics{
    constructor (radius, color=0x000000, x=0, y=0){
        super();
        this.beginFill(color),
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.angle = 0;
        this.speed = 50;
    }

    move(angle){
        this.angle += angle;
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
    }
}