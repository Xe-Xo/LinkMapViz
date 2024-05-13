import PosSeen from './pos_seen.js';
import RoomSeen from './room_seen.js';

// Create the application helper and add its render target to the page
const app = new PIXI.Application();

//globalThis.__PIXI_APP__ = app;
await app.init({ resizeTo: window, eventMode: "static", eventFeatures: {
    wheel: true,
    mouse: true,
} })


let socket = null;

let currentStats = {envs: 0, viewers: 0};

let backgroundSharp = null;
let backgroundSmooth = null;

const container = new PIXI.Container();
const renderWidth = window.innerWidth;
const renderHeight = window.innerHeight;
const desiredCenterX = renderWidth / 2;
const desiredCenterY = renderHeight / 2;

container.x = desiredCenterX;
container.y = desiredCenterY;
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;
container.scale.set(1, 1);


app.stage.addChild(container);

document.body.appendChild(app.canvas);

const zoomSpeed = 0.0015;
let dragging = false;
let dragStart = { x: 0, y: 0 };
let dragOffset = { x: 0, y: 0 };
let containerStart = { x: 0, y: 0 };
let dragTarget = null;

function mouseDown(event){
    dragging = true;
    // Get the position of the mouse relative to the container's position
    dragStart = event.data.getLocalPosition(container.parent);
    // Calculate the offset
    dragOffset.x = container.x - dragStart.x;
    dragOffset.y = container.y - dragStart.y;

}

function mouseUp(event){
    dragging = false;
}

function mouseMove(event){
    if(dragging){

        // Get the new position of the mouse relative to the container's parent
        const newPosition = event.data.getLocalPosition(container.parent);
        // Apply the offset to get the new container position
        container.x = newPosition.x + dragOffset.x;
        container.y = newPosition.y + dragOffset.y;
        

    }
}

function mouseWheel(event){
    event.preventDefault();
    const scaleFactor = 1.0 - (event.deltaY * zoomSpeed)
    const rect = app.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * app.renderer.width / rect.width;
    const y = (event.clientY - rect.top) * app.renderer.height / rect.height;

    const point = new PIXI.Point(x, y);
    const localPoint = container.toLocal(point);

    container.scale.x *= scaleFactor;
    container.scale.y *= scaleFactor;

    const newPoint = container.toGlobal(localPoint);
    container.x -= newPoint.x - point.x;
    container.y -= newPoint.y - point.y;

}

app.canvas.addEventListener('wheel', (e) => {mouseWheel(e)});
container.on('mousedown', (e) => {mouseDown(e)});
container.on('mouseup', (e) => {mouseUp(e)});
container.on('mouseupoutside', (e) => {mouseUp(e)});
container.on('mousemove', (e) => {mouseMove(e)});


async function preload()
{
    const assets = [
        { alias: 'overground', src: 'assets/overground.png', data: { scaleMode: PIXI.linear }, },
        { alias: 'caves_houses', src: 'assets/caves_houses.png', data: { scaleMode: PIXI.linear }, },
    ];
    await PIXI.Assets.load(assets);
    console.log('Assets loaded!')
}


function addBackground(container, alias){

    const smoothbackground = PIXI.smoothbackground;
    const background = PIXI.Sprite.from(alias);
    
    
    //background.width = 1280;
    //background.height = 1280;
    //console.log(container);
    //background.pivot(-0.5, -0.5);
    container.addChild(background);

    return background;
}


function addText(app, text, x, y, style){
    const message = new PIXI.Text({text: text, style});
    message.x = x;
    message.y = y;
    app.stage.addChild(message);
}


function initWebsocket(){

    const ws = new WebSocket("wss://arcade-numeric.bnr.la:3344/receive");
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
  

        if ("posCoords" in data){
            const posCoords = data.posCoords;
            posCoords.forEach(element => {
                addPosSeenRect(container, element[0], element[1], element[2], 0x00FF00);
                addRoomSeenRect(container, Math.floor(element[0]/10) , Math.floor(element[1]/8), element[2], 0xFF0000);
            
            });
        }
    
    };

    return ws;
}

function refreshWebsocket(){
    console.log("Refreshing websocket connection");

    if(socket !== null){
        socket.close(); // Close the connection
    }

    socket = initWebsocket();
}

function animate(time) {
    lastFrameTime = Date.now();
    requestAnimationFrame(animate);
}


let roomSeenRectMap = new Map();
let posSeenRectMap = new Map();

function addPosSeen(container, worldX, worldY, worldZ, color){
    new PosSeen(rect, worldX, worldY, worldZ)
}


function addPosSeenRect(container, worldX, worldY, worldZ, color){


    //console.log("Pos Seen " + worldX + " " + worldY + " " + worldZ)
    if (posSeenRectMap.has(`${worldX}_${worldY}_${worldZ}`)){
        
        const posSeen = posSeenRectMap.get(`${worldX}_${worldY}_${worldZ}`)
        posSeen.updateSeen();
        //const rect = posSeenRectMap.get([worldX, worldY, worldZ]);
        //container.removeChild(rect);
        //rect.destroy();
        //console.log(posSeen)
        return;
    }
    const rect = new PIXI.Graphics();
    let xOffset = 0;
    if (worldZ == 12){
        xOffset = 1280;
    } 

    rect.rect(worldX * 16 + xOffset, worldY * 16, 16, 16);
    rect.fill({color: color, alpha:0.5});
    container.addChild(rect);
    const posSeen = new PosSeen(rect, worldX, worldY, worldZ);
    posSeenRectMap.set(`${worldX}_${worldY}_${worldZ}`, posSeen );

}

function addPosinRoomRect(container, mapX, mapY, mapZ, mapPosX, mapPosY, color){
    addPosSeenRect(container, mapX * 10 + mapPosX, mapY * 8 + mapPosY, mapZ, color);
}


function addRoomSeenRect(container, mapX, mapY, mapZ, color){

    if (mapZ != 0) {
        return;
    }

    //console.log("Room Seen " + mapX + " " + mapY + " " + mapZ)
    if (roomSeenRectMap.has(`${mapX},${mapY},${mapZ}`)){
        const roomSeen = roomSeenRectMap.get(`${mapX},${mapY},${mapZ}`)
        roomSeen.updateSeen();
        //console.log(roomSeen)
        return;
        //const rect = roomSeenRectMap.get([mapX, mapY, mapZ]);
        //container.removeChild(rect);
        //rect.destroy();
    } else {
        //console.log(roomSeenRectMap)
    }
    const rect = new PIXI.Graphics();
    rect.rect(mapX * 10 *16, mapY * 8 * 16, 16 * 10, 16 * 8);
    rect.fill({color: 0xFFFFFF, alpha:0.1});
    rect.stroke({ width: 2, color: color });

    let text = `(${mapX},${mapY})`
    let style =  {fill: color, fontSize: 12}
    const message = new PIXI.Text({text: text, style: style});
    message.x = mapX * 10 * 16;
    message.y = mapY * 8 * 16;


    container.addChild(rect);
    rect.addChild(message);
    const roomSeen = new RoomSeen(rect, message, mapX, mapY, mapZ);
    roomSeenRectMap.set(`${mapX},${mapY},${mapZ}`, roomSeen);

}

function checkAllGraphics(){

    checkPosSeen();
    checkRoomSeen();
    //console.log("Checking graphics")

}


function checkPosSeen(){
    posSeenRectMap.forEach((value, key, map) => {
        if (!value.check()){
            container.removeChild(value.rect);
            value.destroy();
            map.delete(key);
        }
    });

}

function checkRoomSeen(){
    roomSeenRectMap.forEach((value, key, map) => {
        if (!value.check()){
            container.removeChild(value);
            value.destroy();
            map.delete(key);
        }
    });
}

let overground = null;
let caves_houses = null;


(async () => {
    await preload();
    overground = addBackground(container, "overground");
    caves_houses = addBackground(container, "caves_houses");
    caves_houses.x = 1280;
    //addRoomSeenRect(container, 0, 15, 0, 0xFF0000)
    //addRoomSeenRect(container, 2, 11, 0, 0xFF0000)
    //addPosSeenRect(container, 25, 85, 0,  0x00FF00)
    //addPosSeenRect(container, 25, 85, 0,  0x00FF00)
    //addPosinRoomRect(container, 0, 15, 0, 3, 3, 0xFF0000)
    //addText(app, "Hello World!", 100, 100, {fill: 0xFFFFFF, fontSize: 24})
    refreshWebsocket();

    setInterval(refreshWebsocket, 120000);
    setInterval(checkAllGraphics,  1000);
    //requestAnimationFrame(animate);
})();

