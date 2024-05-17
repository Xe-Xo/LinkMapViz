import {
    Container,
    Graphics,
    Sprite,
    Point,
} from 'pixi.js';

class Notification {
    constructor(app,container,alias){
        this.app = app;
        this.parent = container;
        this.container = new Container();
        this.graphics = new Graphics();
        try {
            this.sprite = Sprite.from(alias);
        } catch (e){
            console.log(`Error loading sprite ${alias}`);
        }
        
        this.container.addChild(this.sprite);
        this.parent.addChild(this.container);
        this.container.x = 0;
        this.container.y = 0;
        this.container.zIndex = 2;
        this.container.scale.set(1.5, 1.5);
    }
}


class SidePanel {

    constructor(app, windowWidth, windowHeight) {
        this.app = app;
        this.container = new Container();
        this.graphics = new Graphics();

        this.zIndex = 1;
        this.size_x = 50;
        this.size_y = windowHeight;
        this.position_x = 0;
        this.position_y = 0;

        this.container.width = this.size_x;
        this.container.height = this.size_y;

        this.container.x = this.position_x;
        this.container.y = this.position_y;

        this.setup();
        this.notifications = []
        this.app.stage.addChild(this.container);

    }


    addNewNotification(alias){

        const notification = new Notification(this.app, this.container, alias);
        this.notifications.push(notification);
    }

    moveNotifications(){
        this.notifications.forEach((notification, index) => {
            notification.container.y += 1;
            
            if (notification.container.y > this.size_y){
                this.container.removeChild(notification.container);
                this.notifications.splice(index, 1);
            }
        });
    }




    setup() {
        console.log("setup side panel");
        this.graphics.clear();
        this.graphics.rect(0, 0, this.size_x, this.size_y);
        this.graphics.fill(0x000000);
        this.graphics.alpha = 0.5;
        this.graphics.zIndex = 1;
        this.container.addChild(this.graphics);
    }

    resize(windowWidth, windowHeight){
        console.log("resize side panel");
        this.size_x = 50;
        this.size_y = windowHeight;
        this.position_x = 0;
        this.position_y = 0;

        this.container.width = this.size_x;
        this.container.height = this.size_y;

        this.container.x = this.position_x;
        this.container.y = this.position_y;

    }
}


export default SidePanel;


