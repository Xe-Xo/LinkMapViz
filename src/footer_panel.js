import {
    Container,
    Graphics,
} from 'pixi.js';

class FooterPanel {
    constructor(app, windowWidth, windowHeight) {
        this.app = app;
        this.container = new Container();
        this.graphics = new Graphics();
        this.size_x = windowWidth;
        this.size_y = 16;
        this.position_x = 0;
        this.position_y = windowHeight - this.size_y;

        this.container.width = this.size_x;
        this.container.height = this.size_y;

        this.container.x = this.position_x;
        this.container.y = this.position_y;

        this.setup();
        this.app.stage.addChild(this.container);
    }

    setup() {
        console.log("setup footer panel");
        this.graphics.rect(0, 0, this.size_x, this.size_y);
        this.graphics.fill(0x000000);
        this.graphics.alpha = 1;
        this.graphics.zIndex = 1;
        this.container.addChild(this.graphics);
    }

    resize(windowWidth, windowHeight){
        console.log("resize footer panel");
        this.size_x = windowWidth;
        this.size_y = 16;
        this.position_x = 0;
        this.position_y = windowHeight - this.size_y;

        this.container.width = this.size_x;
        this.container.height = this.size_y;

        this.container.x = this.position_x;
        this.container.y = this.position_y;

        this.graphics.clear();
        this.container.removeChild(this.graphics);
        this.setup();
    }
}

export default FooterPanel;


