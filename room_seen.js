export default class RoomSeen{
    constructor(rect,text, mapX, mapY, mapZ){
        this.rect = rect;
        this.text = text;
        this.mapX = mapX;
        this.mapY = mapY;
        this.mapZ = mapZ;
        this.created = Date.now();
        this.lastseen = Date.now();
    }

    updateSeen() {
        this.lastseen = Date.now();
    }

    check(){
        return Date.now() - this.lastseen < 60000;
    }

    destroy() {
        this.rect.removeChild(this.text);
        this.rect.destroy();
        
    }

}