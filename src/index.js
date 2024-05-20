import * as PIXI from 'pixi.js';


import {
    Application,
    Assets,
    Color,
    Container,
    Texture,
    Sprite,
    Graphics,
    Text,
    TextStyle,
    BlurFilter,
    FillGradient,
} from 'pixi.js';

import FooterPanel from './footer_panel';
import MapPanel from './map_panel';
import SidePanel from './side_panel';


async function preload()
{
    const assets = [
      { alias: 'bg_overground', src: 'assets/overground.png' },
      { alias: 'bg_caveshouses', src: 'assets/caves_houses.png' },
      { alias: 'note_acquire', src: 'assets/acquire.png' },
      { alias: 'note_aware', src: 'assets/aware.png' },
      { alias: 'note_block', src: 'assets/block.png' },
      { alias: 'note_fall', src: 'assets/fall.png' },
      { alias: 'note_hurt', src: 'assets/hurt.png' },
      { alias: 'note_push', src: 'assets/push.png' },
      { alias: 'note_sword', src: 'assets/sword.png' },

    ];
    await Assets.load(assets);
    console.log('Assets loaded!')

}

async function setupPixi(){

    
    await app.init({ 
        background: '#1099bb',
        resizeTo: window,
        eventMode: "static",
        eventFeatures: {
            wheel: true,
            mouse: true,
        }});

}




const app = new Application();
globalThis.__PIXI_STAGE__ = app.stage;
globalThis.__PIXI_RENDERER__ = app.renderer;


window.addEventListener('resize', onResize);
function onResize() {
    console.log('resize', window.innerWidth, window.innerHeight)

    sidepanel_container.resize(window.innerWidth, window.innerHeight);
    footer_container.resize(window.innerWidth, window.innerHeight);
}

let map_container = null
let footer_container = null;
let sidepanel_container = null;

function refreshNotifications(){
    //console.log("refresh notifications");
    map_container.updatePosSeenRect();
    sidepanel_container.moveNotifications();

    if (data_stream.length == 0){
        return;
    }
    else {
        const elements = data_stream.splice(0, Math.min(data_stream.length,Math.max(data_stream.length / 6000, 1)));
        elements.forEach(element => {
            map_container.addPosSeenRect(element.x, element.y, element.z, element.notable);
            if (element.notable != ""){
                sidepanel_container.addNewNotification(element.notable);
            }
        });
        console.log(data_stream.length)
    }


}

// Websocket Stuff

let socket = null;
const data_stream = [];
// Create the websocket
function initWebsocket(){

    const ws = new WebSocket("wss://arcade-numeric.bnr.la:3344/receive");
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if ("pos_data" in data){
            const posData = data.pos_data;
            posData.forEach(element => {
                data_stream.push(element)
            });
        }
    
    };

    ws.onerror = (event) => {
        console.log("Websocket error");
        socket = null;
    }

    ws.onclose = (event) => {
        console.log("Websocket closed");
        socket = null;
    }

    return ws;
}
function refreshWebsocket(){
    console.log("Refreshing websocket connection");

    if(socket === null){
        console.log("Creating new websocket connection")
        socket = initWebsocket();
    };
}

(async () => {
    await preload();
    //overground = addBackground(container, "overground");
    await setupPixi();

    document.body.appendChild(app.canvas);
    map_container = new MapPanel(app);
    map_container.addbackground("bg_caveshouses");
    map_container.addbackground("bg_overground");
    
    footer_container = new FooterPanel(app, innerWidth, innerHeight);
    sidepanel_container = new SidePanel(app, innerWidth, innerHeight);

    sidepanel_container.resize(window.innerWidth, window.innerHeight);
    footer_container.resize(window.innerWidth, window.innerHeight);

    app.canvas.addEventListener('wheel', (e) => {map_container.mouseWheel(e)});
    app.stage.on('mousedown', (e) => {map_container.mouseDown(e)});
    app.stage.on('mouseup', (e) => {map_container.mouseUp(e)});
    app.stage.on('mouseupoutside', (e) => {map_container.mouseUp(e)});
    app.stage.on('mousemove', (e) => {map_container.mouseMove(e)});
    app.stage.on('touchstart', (e) => {
        
        e.preventDefault();
        if (e.touches !== undefined && e.touches.length == 1){
            map_container.touchStart(e);
        } else {
            map_container.mouseDown(e);
        };
    });
        
    app.stage.on('touchend', (e) => {
        
        
        e.preventDefault();
        if (e.touches !== undefined && e.touches.length == 1){
            map_container.touchEnd(e);
        } else {
            map_container.mouseUp(e);
        };
    
    });
    app.stage.on('touchendoutside', (e) => {
        e.preventDefault();
        if (e.touches !== undefined && e.touches.length == 1){
            map_container.touchEnd(e);
        } else {
            map_container.mouseUp(e);
        };
    });
    app.stage.on('touchmove', (e) => {
        e.preventDefault();
        if (e.touches !== undefined && e.touches.length == 1){
            map_container.touchMove(e);
        } else {
            map_container.mouseMove(e);
        };
    });

    setInterval(refreshNotifications, 20);
    setInterval(refreshWebsocket, 1000);


})();



