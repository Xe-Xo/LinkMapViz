import {
    Container,
    Graphics,
    Sprite,
    Point,
} from 'pixi.js';

const time_to_live = 120000; // ms


class PosSeen{

    // Represents a Single Rectangle on the Map to show the agent passed over the position
    // Handles the fading of the color from green to red over time to create a heatmap effect


    constructor(mapPanel, worldX, worldY, worldZ, notable){
        this.mapPanel = mapPanel;
        this.container = new Container();
        this.graphics = new Graphics();
        this.worldX = worldX;
        this.worldY = worldY;
        this.worldZ = worldZ;
        this.created = Date.now();
        this.lastseen = Date.now();
        this.notable = notable;

        this.graphics.rect(0,0, 16, 16);
        this.graphics.fill({color: this.getColor(), alpha:0.5});
        this.container.addChild(this.graphics);
        this.container.x = this.worldX * 16
        this.container.y = this.worldY * 16


        this.mapPanel.container.addChild(this.container);
        if (this.notable != ''){
            this.sprite = Sprite.from(this.notable);
            this.sprite.setSize(16,16)
            this.container.addChild(this.sprite)
        } else {
           this.sprite = null; 
        }
        
        this.mapPanel.posSeenMap.set(`${worldX}_${worldY}_${worldZ}`, this);

    }

    updateSeen(notable) {
        this.lastseen = Date.now();
        if (notable != ''){
            this.notable = notable

            if (this.sprite == null){
                this.sprite = Sprite.from(this.notable);
                this.sprite.setSize(16,16)
                this.container.addChild(this.sprite)
            } else {
                this.container.removeChild(this.sprite);
                this.sprite = Sprite.from(this.notable);
                this.sprite.setSize(16,16)
                this.container.addChild(this.sprite)
            }

        }



    }

    check(){

        const curTime = Date.now();
        const progress = (curTime - this.lastseen) / time_to_live;
        this.graphics.clear();
        this.graphics.rect(0, 0, 16, 16);
        this.graphics.fill({color: this.getColor(), alpha:0.5+(progress*-0.5)});
        if (this.sprite != null){
            this.sprite.y = 0 - 16 * progress;
            this.sprite.alpha = 1 - progress;
        }
        return curTime - this.lastseen < time_to_live;
    }

    destroy() {
        this.container.removeChild(this.graphics);
        if (this.sprite != null){
            this.container.removeChild(this.sprite);
            this.sprite.destroy();
        }
        
        this.graphics.destroy();
    }

    getColor() {

        const curTime = Date.now();
        const progress = (curTime - this.lastseen) / time_to_live;
        const color = `rgb(${Math.floor(255 * (progress))}, ${Math.floor(255 * (1-progress))}, 0)`;
        return color;
    }


}


class MapPanel {
    constructor(app) {
        this.app = app;
        this.container = new Container();
        this.graphics = new Graphics();
        this.size_x = 0;
        this.size_y = 0;
        this.position_x = 0;
        this.position_y = 0;
        this.container.width = 2560;
        this.container.height = 2048;

        this.renderWidth = window.innerWidth;
        this.renderHeight = window.innerHeight;
        this.desiredCenterX = this.renderWidth / 2;
        this.desiredCenterY = this.renderHeight / 2;

        this.dragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragOffset = { x: 0, y: 0 };
        this.containerStart = { x: 0, y: 0 };
        this.dragTarget = null;
        this.lastTouchDistance = null;

        this.container.x = this.desiredCenterX;
        this.container.y = this.desiredCenterY;
        this.container.pivot.x = this.container.width / 2;
        this.container.pivot.y = this.container.height / 2;
        this.container.scale.set(1, 1);
        this.container.x = 0;
        this.container.y = 0;
        this.zoomSpeed = 0.0015;
        this.backgrounds = []
        this.visible = [];

        this.posSeenMap = new Map();
        


        this.setup();
        this.app.stage.addChild(this.container);
        this.overground = null;
    }

    setup() {
        console.log("setup map panel");

    }

    addbackground(alias){

        const background = Sprite.from(alias);
        this.container.addChild(background);
        for (let i = 0; i < this.backgrounds.length; i++){
            this.backgrounds[i].visible = false;
        }

        this.backgrounds.push(background);

        return background;
    }

    addPosSeenRect(x,y,z, notable){
        if(this.posSeenMap.has(`${x}_${y}_${z}`)){
            const posSeen = this.posSeenMap.get(`${x}_${y}_${z}`);
            posSeen.updateSeen(notable);
            return;
        }

        const newPosSeen = new PosSeen(this,x,y,z,notable);

    }

    updatePosSeenRect(){
        this.posSeenMap.forEach((posSeen, key) => {
            if (!posSeen.check()){
                posSeen.destroy();
                this.posSeenMap.delete(key);
            }
        });
    }


    resize(){

    }

    mouseWheel(event){
        console.log("Mouse Wheel");
        event.preventDefault();
        const scaleFactor = 1.0 - (event.deltaY * this.zoomSpeed)
        const rect = this.app.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * this.app.renderer.width / rect.width;
        const y = (event.clientY - rect.top) * this.app.renderer.height / rect.height;
    
        const point = new Point(x, y);
        const localPoint = this.container.toLocal(point);
    
        this.container.scale.x *= scaleFactor;
        this.container.scale.y *= scaleFactor;
    
        const newPoint = this.container.toGlobal(localPoint);
        this.container.x -= newPoint.x - point.x;
        this.container.y -= newPoint.y - point.y;
    }

    mouseDown(event){
        console.log("Mouse Down");
        this.dragging = true;
        // Get the position of the mouse relative to the container's position
        this.dragStart = event.data.getLocalPosition(this.container.parent);
        // Calculate the offset
        this.dragOffset.x = this.container.x - this.dragStart.x;
        this.dragOffset.y = this.container.y - this.dragStart.y;
    
    }
    
    mouseUp(event){
        console.log("Mouse Up");
        this.dragging = false;
    }
    
    mouseMove(event){
        if(this.dragging){
            console.log("Mouse Move");
    
            // Get the new position of the mouse relative to the container's parent
            const newPosition = event.data.getLocalPosition(this.container.parent);
            // Apply the offset to get the new container position
            this.container.x = newPosition.x + this.dragOffset.x;
            this.container.y = newPosition.y + this.dragOffset.y;
            
    
        }
    }

    getTouchDistance(touch1, touch2) {
        const dx = touch1.pageX - touch2.pageX;
        const dy = touch1.pageY - touch2.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getMidpoint(touch1, touch2) {
        return {
            x: (touch1.pageX + touch2.pageX) / 2,
            y: (touch1.pageY + touch2.pageY) / 2,
        };
    }


    touchStart(event){
        console.log("Touch Start");

        if (event.touches.length == 1){

            this.dragging = true;
            const touch = e.touches[0];
            // Get the position of the mouse relative to the container's position
            this.dragStart = {x: touch.pageX, y: touch.pageY};
            // Calculate the offset
            this.dragOffset.x = this.container.x - this.dragStart.x;
            this.dragOffset.y = this.container.y - this.dragStart.y;
        
        }

    }

    touchEnd(event){
        console.log("Touch End");
        this.dragging = false;
        this.lastTouchDistance = null; 
    }

    touchMove(event){

        console.log(event)
        if(this.dragging && event.touches.length == 1){
            console.log("Touch Move");
            const touch = e.touches[0]
            // Get the new position of the mouse relative to the container's parent
            const newPosition = {x: touch.pageX, y: touch.pageY};
            // Apply the offset to get the new container position
            this.container.x = newPosition.x + this.dragOffset.x;
            this.container.y = newPosition.y + this.dragOffset.y;
            
        }

        else if (event.touches.length == 2){
            const touchDistance = getTouchDistance(e.touches[0], e.touches[1]);
            const screenMidpoint = getMidpoint(e.touches[0], e.touches[1]);
            if (this.lastTouchDistance !== null){
                const scaleFactor = touchDistance / this.lastTouchDistance;
                const newScale = this.container.scale.x * scaleFactor;
                // Convert to the container's local coordinate space
                const rect = app.canvas.getBoundingClientRect();
                const localMidpoint = this.container.toLocal(new Point(screenMidpoint.x - rect.left, screenMidpoint.y - rect.top));
                this.container.scale.x = newScale;
                this.container.scale.y = newScale;
                const newLocalMidpoint = this.container.toGlobal(localMidpoint);
                this.container.x += screenMidpoint.x - rect.left - newLocalMidpoint.x;
                this.container.y += screenMidpoint.y - rect.top - newLocalMidpoint.y;
            }
            this.lastTouchDistance = touchDistance;
        }
    }


}

export default MapPanel;


