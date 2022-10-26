/* bem130 2022 */

class tdDRAW {
    constructor() {
        this.campos = [0,0,0];
        this.camangle = [0,0];
        this.display = [1920,1080];
        this.obj = [];
        this.frame = 0;
    }
    setObj(obj) {
        this.obj = obj;
    }
    setCamera(camera) {
        this.campos = camera[0];
        this.camangle = [camera[1][0]*(Math.PI/180),camera[1][1]*(Math.PI/180)];
        this.display = camera[2];
    }

    getImg() {
        this.sortPolygon();
        this.frame++;
        let x = this.display[0];
        let y = this.display[1];
        let iarr = new Uint8ClampedArray(x*y*4).fill(0);
        let zbuf = new Uint8Array(x*y).fill(0);
        for (let i = 0; i < x*y; i++) {
            iarr[i*4+3] = 255;
        }
        let polygons = this.obj;
        let vl = this.VNormalized([40,50,50]); // 平行光源
        for (let i=0;i<polygons.length;i++) {
            let t = polygons[i];

            // 各頂点の投影
            let p1 = this.pos_3t2d(t[0]);
            let p2 = this.pos_3t2d(t[1]);
            let p3 = this.pos_3t2d(t[2]);

            if (p1[2]&&p2[2]&&p3[2]) {continue;}

            let v12 = [t[1][0]-t[0][0],t[1][1]-t[0][1],t[1][2]-t[0][2]];
            let v13 = [t[2][0]-t[0][0],t[2][1]-t[0][1],t[2][2]-t[0][2]];
            let normal = this.VNormalized(this.VCProduct(v12,v13)); //法線ベクトル
            let angl = this.VIProduct(vl,normal); // 0<=normal<=1
            let light = (Math.max(angl,angl*0.1)*0.9+0.3)*(1000/(polygons[i][4]+1000)); // 面と平行光源の角度
            
            // 三角形を描画する範囲
            let xmax = Math.min(Math.max(p1[0],p2[0],p3[0]),this.display[0]);
            let xmin = Math.max(Math.min(p1[0],p2[0],p3[0]),0);
            let ymax = Math.min(Math.max(p1[1],p2[1],p3[1]),this.display[1]);
            let ymin = Math.max(Math.min(p1[1],p2[1],p3[1]),0);

            for (let iy = ymin; iy < ymax; iy++) {
                for (let ix = xmin; ix < xmax; ix++) {
                    let idex = iy*x+ix; // 描画するアドレス
                    if (zbuf[idex]==0) { // 既に描画されていない確認
                        if (this.inclusion([ix,iy],[p1,p2,p3])) { // 三角形の内外判定
                            zbuf[idex] = 1; // ピクセルの描画済みフラグ
                            let index = idex*4;
                            iarr[index+0] = t[3][0]*light; // 赤の描画
                            iarr[index+1] = t[3][1]*light; // 緑の描画
                            iarr[index+2] = t[3][2]*light; // 青の描画
                        }
                    }
                }
            }
        }
        return new ImageData(iarr,x,y);
    }

    sortPolygon() {
        this.obj = this.updateLengthToPolygon(this.obj);
        this.obj = this.sortP(this.obj);
    }
    pos_3t2d(pos) {
        let cp = this.campos;let ca = this.camangle;
        let p1 = [pos[0]-cp[0],pos[1]-cp[1],pos[2]-cp[2]];
        p1 = this.rotate3d_z(p1,ca[0]);
        p1 = this.rotate3d_x(p1,-ca[1]);
        let l = Math.abs(14/(p1[1]));
        let s = this.display[0]/10;
        let d = [p1[0]*l*s+this.display[0]/2,-p1[2]*l*s+this.display[1]/2];
        let infront = false;
        if (p1[1]<0) {infront = true };
        return [Math.floor(d[0]),Math.floor(d[1]),infront];
    }
    sortP(ps) {
        let psl = ps.length;
        let sorted = false;
        let bu;let i=0;
        while (i<psl) {
            let j=0;let jm = psl-i-1;
            while (j<jm) {
                if (ps[j][7]>ps[j+1][7]) {
                    bu = ps[j+1];
                    ps[j+1] = ps[j];
                    ps[j] = bu;
                    sorted = true;
                }
                j++;
            }
            if (!sorted) {
                break;
            }
            i++;
        }
        return ps;
    }
    updateLengthToPolygon(ps) {
        for (let i=0;i<ps.length;i++) {
            ps[i][4] = this.squared_length3d([this.campos,this.gcot([ps[i][0],ps[i][1],ps[i][2]])]);
        }
        return ps;
    }
    gcot(t3ds) {
        return [(t3ds[0][0]+t3ds[1][0]+t3ds[2][0])/3,(t3ds[0][1]+t3ds[1][1]+t3ds[2][1])/3,(t3ds[0][2]+t3ds[1][2]+t3ds[2][2])/3];
    }
    squared_length3d(pos) {
        return (pos[0][0]-pos[1][0])**2+(pos[0][1]-pos[1][1])**2+(pos[0][2]-pos[1][2])**2;
    }
    length3d(pos) {
        return Math.sqrt((pos[0][0]-pos[1][0])**2+(pos[0][1]-pos[1][1])**2+(pos[0][2]-pos[1][2])**2);
    }

    VCProduct(a,b) { // Vector-Cross-Product ベクトルの外積
        return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    }

    VIProduct(a,b) { // ベクトルの内積
        return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
    }
    VMM3(a) { // ベクトルのマイナス1倍
        return [-a[0],-a[1],-a[2]];
    }

    VNormalized(a) { // ベクトルの正規化
        let l = this.length3d([[0,0,0],a]);
        return [a[0]/l,a[1]/l,a[2]/l];
    }
    inclusion(p1, carr) { // 三角形の内外判定
        let a = [carr[0][0]-p1[0],carr[0][1]-p1[1]];
        let b = [carr[1][0]-p1[0],carr[1][1]-p1[1]];
        let c = [carr[2][0]-p1[0],carr[2][1]-p1[1]];
        let ab = a[0]*b[1]-a[1]*b[0];
        let bc = b[0]*c[1]-b[1]*c[0];
        let ca = c[0]*a[1]-c[1]*a[0];
        return ab<=0&&bc<=0&&ca<=0;
    };
    rotate3d_x(pos,r_x) { // x軸のみの回転
        let _x1 = pos[0];let _y1 = pos[1];let _z1 = pos[2];
        let _x3 = _x1;
        let cosrx = Math.cos(r_x);let sinrx = Math.sin(r_x);
        let _y3 = _y1*cosrx-_z1*sinrx;let _z3 = _y1*sinrx+_z1*cosrx;
        return [_x3,_y3,_z3];
    }
    rotate3d_z(pos,r_z) { // z軸のみの回転
        let _x1 = pos[0];let _y1 = pos[1];let _z1 = pos[2];
        let _z3 = _z1;
        let cosrz = Math.cos(r_z);let sinrz = Math.sin(r_z);
        let _x3 = _x1*cosrz-_y1*sinrz;let _y3 = _x1*sinrz+_y1*cosrz;
        return [_x3,_y3,_z3];
    }
    rotate3d(pos,r_x,r_y,r_z) { // 回転
        let _x1 = pos[0];let _y1 = pos[1];let _z1 = pos[2];
        let cosrx = Math.cos(r_x);let sinrx = Math.sin(r_x);
        let cosry = Math.cos(r_y);let sinry = Math.sin(r_y);
        let cosrz = Math.cos(r_z);let sinrz = Math.sin(r_z);
        let _y2 = _y*cosrx-_z*sinrx;_z1 = _y*sinrx+_z*cosrx;
        let _x2 = _x1*cosry+_z1*sinry;let _z3 = -_x1*sinry+_z1*cosry;
        let _x3 = _x2*cosrz-_y2*sinrz;let _y3 = _x2*sinrz+_y2*cosrz;
        return [_x3,_y3,_z3];
    }
    rotate2d(pos,r) {
        var _x = pos[0];_y = pos[1];
        let cosr = Math.cos(r);let sinr = Math.sin(r);
        var x = _x*cosr-_y*sinr;var y = _x*sinr+_y*cosr;
        return [x,y];
    }
    factonal(n) {
        let res = 1;
        for (let i = 2; i <= n; i++) { res *= i;}
        return res;
    }
}