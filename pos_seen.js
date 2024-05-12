export default class PosSeen{
    constructor(rect, worldX, worldY, worldZ){
        this.rect = rect;
        this.worldX = worldX;
        this.worldY = worldY;
        this.worldZ = worldZ;
        this.Xoffset = 0;
        if (worldZ == 12){
            this.Xoffset = 1280;
        }

        this.created = Date.now();
        this.lastseen = Date.now();
    }

    updateSeen() {
        this.lastseen = Date.now();
    }

    check(){
        //console.log("checking")
        const curTime = Date.now();
        const alpha = 0.5 - (curTime - this.lastseen) / 120000;
        this.rect.clear();
        this.rect.rect(this.worldX * 16 + this.Xoffset, this.worldY * 16, 16, 16);
        this.rect.fill({color: this.getColor(), alpha:alpha});

        return curTime - this.lastseen < 60000;
    }

    destroy() {
        this.rect.destroy();
    }

    getColor() {

        // Transition from green to red over 2 minutes
        const curTime = Date.now();
        const alpha = (curTime - this.lastseen) / 12000;
        //
        const color = `rgb(${Math.floor(255 * (alpha))}, ${Math.floor(255 * (1-alpha))}, 0)`;
        //console.log(color)
        //console.log(alpha)
        return color;
    }


}