/* Neknaj 3D Lib - Javascript */
/* bem130 2022 */
/* https://github.com/neknaj/3d */



class tdDRAW_w {
    constructor() {
        this.campos = [0,0,0];
        this.camangle = [0,0];
        this.display = [1920,1080];
        this.obj = [];
        this.frame = 0;
        this.worker = new Worker('/js/3d.worker.js');
    }
    setObj(obj) {
        this.obj = obj;
    }
    setCamera(camera) {
        this.campos = camera[0];
        this.camangle = [camera[1][0]*(Math.PI/180),camera[1][1]*(Math.PI/180)];
        this.display = camera[2];
    }

    async getImg() {
        //this.sortPolygon();
        this.frame++;
        let x = this.display[0];
        let y = this.display[1];
        let trifv = [Math.sin(this.camangle[0]),Math.cos(this.camangle[0]),Math.sin(-this.camangle[1]),Math.cos(this.camangle[1])];
        const back = new Promise((resolve, reject) =>
            this.worker.addEventListener('message', message => {
                resolve(message.data.data);
            }, {once: true}));
        this.worker.postMessage({"name":"getImg","x":x,"y":y,"polygons":this.obj,"trifv":trifv,"campos":this.campos});
        let iarr = await back;
        console.log(iarr);
        return (new ImageData(iarr,x,y));
    }

    sortPolygon() {
        this.obj = this.updateLengthToPolygon(this.obj);
        this.obj = this.sortP(this.obj);
    }
    sortP(ps) {
        let psl = ps.length;
        let sorted = false;
        let bu;let i=0;
        while (i<psl) {
            let j=0;let jm = psl-i-1;
            while (j<jm||j<100) {
                if (ps[j][5]>ps[j+1][5]) {
                    bu = ps[j+1];
                    ps[j+1] = ps[j];
                    ps[j] = bu;
                    sorted = true;
                }
                j++;
            }
            if (!sorted) { break;}
            i++;
        }
        return ps;
    }
    updateLengthToPolygon(ps) {
        for (let i=0;i<ps.length;i++) {
            ps[i][5] = this.squared_length3d([this.campos,this.gcot([ps[i][0],ps[i][1],ps[i][2]])]);
        }
        return ps;
    }
    gcot(t3ds) {
        return [(t3ds[0][0]+t3ds[1][0]+t3ds[2][0])/3,(t3ds[0][1]+t3ds[1][1]+t3ds[2][1])/3,(t3ds[0][2]+t3ds[1][2]+t3ds[2][2])/3];
    }
    
}