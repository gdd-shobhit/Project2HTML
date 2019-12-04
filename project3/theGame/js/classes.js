class Player extends PIXI.Graphics{
    constructor (radius, color=0x000000, x=0, y=0,){
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.angle = 0;
        this.speed = 50;
        this.pivot.set(this.width/2,this.height/2);
        this.anchor={x:0.5,y:0.5};
        
    }

    move(angle){
        
        this.angle += angle;
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
        
    }
}

class Wall extends PIXI.Graphics{
    constructor(color=0x00000,lines=1,startPoint =50){
        super();
        this.center=center;
    }
}

function Shrink(){
    this.scale*=0.9;
}