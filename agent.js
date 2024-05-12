class Agent{
    constructor(user, envID, stackID, extraInfo, color, spriteID, path){
        this.user = user;
        this.envID = Math.abs(parseInt(envID) || 0);

        const curstackID = Math.abs(parseInt(stackID));
        this.stackID = isNaN(curstackID)? Math.floor(Math.random()*2048) : curstackID;
        
        this.spriteID = 0;
        this.dataBatchIdx = -1;
        this.dataBatches = [];
        this.waitingDelete = false;
        this.animationDuration = animationDuration;
        this.color = color;
        this.sprite = null;
        this.changeSprite(spriteID);

    }
}