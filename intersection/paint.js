// bem130 2022 paint.js //
// require "2d.js", by bem130
/*

*/

class Paint {
    constructor(canvas_id) {
        this.m2d = new m2D()
        this.canvas = canvas_id
        this.data
        this.x
        this.y
    }
    loadimg(img) {
        let co = document.createElement("canvas");
        co.height = img.naturalHeight;
        co.width = img.naturalWidth;
        let ctx = cco.getContext("2d");
        ctx.drawImage(img,0,0);
        this.data = ctx.getImageData(0,0,img.naturalWidth,img.naturalHeight);
        this.x = img.naturalWidth
        this.y = img.naturalHeight
    }
    makeimg() {
        let co = document.createElement("canvas");
        co.height = this.y;
        co.width = this.x;
        co.getContext('2d').putImageData(new ImageData(this.data,this.x,this.y),0,0);
        return co.toDataURL('image/png');
    }
    output_img(img_id) {
        document.getElementById(img_id).src = mkimg()
    }
    update() {
        let co = document.getElementById(this.canvas);
        co.height = this.y;
        co.width = this.x;
        co.getContext('2d').putImageData(new ImageData(this.data,this.x,this.y),0,0);
    }
    setup(x,y) {
        this.data = new Uint8ClampedArray(x*y*4).fill(255)
        this.x = x
        this.y = y
    }
    paintLine(p1,p2,rgbcolor) { // 参考: https://ja.wikipedia.org/wiki/%E3%83%96%E3%83%AC%E3%82%BC%E3%83%B3%E3%83%8F%E3%83%A0%E3%81%AE%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0
        if (p1[0]>p2[0]) {
            let tmp = p1; p1 = p2; p2 = tmp;
        };
        let tx = Math.abs(p2[0]-p1[0]);
        let ty = Math.abs(p2[1]-p1[1]);
        let swapf = false;
        if (tx/ty<1) {;
            swapf = true;
            p1 = this.m2d.swapxy(p1);
            p2 = this.m2d.swapxy(p2);
            if (p1[0]>p2[0]) {
                let tmp = p1; p1 = p2; p2 = tmp;
            }
            tx = Math.abs(p2[0]-p1[0]);
            ty = Math.abs(p2[1]-p1[1]);
        }
        let err = tx-ty; let sx,sy;
        let dx = p1[0]; let dy = p1[1];
        let e2;
        if (p1[0]<p2[0]) {sx=1} else {sx=-1};
        if (p1[1]<p2[1]) {sy=1} else {sy=-1};
        if (true) {
            while (true){
                if (swapf) {
                    this.paintDot(dy,dx,rgbcolor);
                }
                else {
                    this.paintDot(dx,dy,rgbcolor);
                };
                if (dx>=p2[0]&dy>=p2[1]) {break};
                e2 = 2*err;
                if (e2>-ty) {
                    err = err - ty; dx = dx + sx;
                };
                if (e2<tx) {
                    err = err + tx; dy = dy + sy;
                };
            }
        }
    }

    paintDot(x,y,rgbcolor) {
        let idx = (y*this.x+x)*4;
        this.data[idx+0] = rgbcolor[0]; // Red
        this.data[idx+1] = rgbcolor[1]; // Green
        this.data[idx+2] = rgbcolor[2]; // Blue
    }
    paintFilledCircle(x,y,r,rgbcolor) {
        for (let iy=-r;iy<r;iy++) {
            for (let ix=-r;ix<r;ix++) {
                if (this.m2d.length([0,0],[iy,ix])<=r) {
                    this.paintDot(x+ix,y+iy,rgbcolor)
                }
            }
        }
    }
    paintFilledPoligon(points,rgbcolor) {
        let lines = [];
        for (let i=0;i<points.length-1;i++) {
            lines.push([points[i],points[i+1]]);
        }
        lines.push([points[points.length-1],points[0]]);
        console.log(lines)
    }

    paintBezierCurve(points,rgbcolor) {
        let cps = []
        for (let t=0;t<=1;t+=0.1) {
            let s = 1
            let pts = [points]
            for (s=1;s<pts[0].length;s++) {
                pts.push([])
                for (let p=0;p<pts[s-1].length-1;p++) {
                    pts[s].push(this.m2d.linesplitpoint(pts[s-1][p],pts[s-1][p+1],t))
                }
            }
            let dot = this.m2d.floor(pts[pts[0].length-1][0])
            cps.push(dot)
        }
        for (let i=0;i<cps.length-1;i++) {
            this.paintLine(cps[i],cps[i+1],rgbcolor)
        }
    }
}