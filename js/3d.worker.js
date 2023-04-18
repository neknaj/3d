/* Neknaj 3D Lib - Javascript */
/* bem130 2023 */
/* https://github.com/neknaj/3d */

function getImg(x,y,polygons,trifv,campos) {
    let maxlen = 100;
    let sky = [114,174,239];
    let iarr = new Uint8ClampedArray(x*y*4).fill(0);
    let zbuf = new Array(x*y).fill(maxlen);
    let tribuf = new Array(polygons.length);
    for (let i = 0; i < x*y; i++) {
        iarr[i*4+0] = sky[0];
        iarr[i*4+1] = sky[1];
        iarr[i*4+2] = sky[2];
        iarr[i*4+3] = 255;
    }
    let vl = VNormalized([30,10,20]); // 平行光源
    for (let i=0;i<polygons.length;i++) {
        let t = polygons[i];

        // 各頂点の投影
        let p1 = pos_3t2d(t[0],x,y,campos,trifv);
        let p2 = pos_3t2d(t[1],x,y,campos,trifv);
        let p3 = pos_3t2d(t[2],x,y,campos,trifv);

        //if (p1[2]&&p2[2]&&p3[2]) {continue;}

        let v12 = [t[1][0]-t[0][0],t[1][1]-t[0][1],t[1][2]-t[0][2]];
        let v13 = [t[2][0]-t[0][0],t[2][1]-t[0][1],t[2][2]-t[0][2]];
        let normal = VNormalized(VCProduct(v12,v13)); //法線ベクトル
        let angl = VIProduct(vl,normal); // 0<=normal<=1
        

        let al = length3d([campos,t[0]]);
        let bl = length3d([campos,t[1]]);
        let cl = length3d([campos,t[2]]);
        let ap = p1[2][1];
        let bp = p2[2][1];
        let cp = p3[2][1];

        tribuf[i] = [p1,p2,p3,angl,al,bl,cl,ap,bp,cp]
    }
    for (let i=0;i<polygons.length;i++) {
        let area = [0,x,0,y];
        let p1 = tribuf[i][0];
        let p2 = tribuf[i][1];
        let p3 = tribuf[i][2];
        let angl = tribuf[i][3];
        let al = tribuf[i][4];
        let bl = tribuf[i][5];
        let cl = tribuf[i][6];
        let ap = tribuf[i][7];
        let bp = tribuf[i][8];
        let cp = tribuf[i][9];
        // 三角形を描画する範囲
        let xmax = Math.min(Math.max(p1[0],p2[0],p3[0]),area[1]);
        let xmin = Math.max(Math.min(p1[0],p2[0],p3[0]),area[0]);
        let ymax = Math.min(Math.max(p1[1],p2[1],p3[1]),area[3]);
        let ymin = Math.max(Math.min(p1[1],p2[1],p3[1]),area[2]);
        if (polygons[i].length>4&&t[4][0]) { // テクスチャあり
            for (let iy = ymin; iy < ymax; iy++) {
                for (let ix = xmin; ix < xmax; ix++) {
                    let idex = iy*x+ix; // 描画するアドレス
                    if (true) { // 既に描画されていない確認
                        if (inclusion([ix,iy],[p1,p2,p3])) { // 三角形の内外判定
                            let td = is_p( [p1,[ix,iy]],[p2,p3]);

                            // let tdd = [bd*(t[4][4][0]-t[4][3][0])/(bd+dc)+t[4][3][0],dc*(t[4][3][1]-t[4][4][1])/(bd+dc)+t[4][4][1]];
                            // let tpd = [ap*(tdd[0]-t[4][2][0])/(ap+pd)+t[4][2][0],pd*(t[4][2][1]-tdd[1])/(ap+pd)+tdd[1]];
                            // let tptx = t[4][5][t[4][1]].data;
                            let tpd
                            {
                                let pos = td;
                                let i2p = [t[4][2],t[4][3],t[4][4]]
                                let i1p = [p1,p2,p3]
                                let bd=length2d([i1p[1],pos]);let dc=length2d([i1p[2],pos]);let ap=length2d([i1p[0],[ix,iy]]);let pd=length2d([pos,[ix,iy]]);
                                let x1=i2p[1][0];let x2=i2p[2][0];let y1=i2p[1][1];let y2=i2p[2][1];let dd=[(bd*(x2-x1))/(bd+dc)+x1,(dc*(y1-y2))/(bd+dc)+y2];
                                x1=i2p[0][0];x2=dd[0];y1=i2p[0][1];y2=dd[1];tpd=[(ap*(x2-x1))/(ap+pd)+x1,(pd*(y1-y2))/(ap+pd)+y2];
                            }
                            let tptx = t[4][5][t[4][1]].data;

                            let l1 = length2d([p2,td])/length2d([p2,p3]);
                            let l2 = length2d([p1,[ix,iy]])/length2d([p1,td]);

                            let pl = al+l2*(bl+l1*(cl-bl)-al);
                            let pp = ap+l2*(bp+l1*(cp-bp)-ap);

                            if (pp>0&&zbuf[idex]>pl) {
                                zbuf[idex] = pl;
                                let index = idex*4;
                                let cindex = (Math.floor(tpd[0])+Math.floor(tpd[1])*polygons[i][4][5][polygons[i][4][1]].width)*4;
                                let light = (Math.max(angl,angl*0.1)*0.9+0.3)*(1000/(pl**2+1000)); // 面と平行光源の角度
                                iarr[index+0] = tptx[cindex+0]*light; // 赤の描画
                                iarr[index+1] = tptx[cindex+1]*light; // 緑の描画
                                iarr[index+2] = tptx[cindex+2]*light; // 青の描画
                            }
                        }
                    }
                }
            }
        }
        else { // テクスチャなし
            for (let iy = ymin; iy < ymax; iy++) {
                for (let ix = xmin; ix < xmax; ix++) {
                    let idex = iy*x+ix; // 描画するアドレス
                    if (true) { // 既に描画されていない確認
                        if (inclusion([ix,iy],[p1,p2,p3])) { // 三角形の内外判定
                            let td = is_p( [p1,[ix,iy]],[p2,p3]);

                            let l1 = length2d([p2,td])/length2d([p2,p3]);
                            let l2 = length2d([p1,[ix,iy]])/length2d([p1,td]);

                            let pl = al+l2*(bl+l1*(cl-bl)-al);
                            let pp = ap+l2*(bp+l1*(cp-bp)-ap);

                            if (pp>0&&zbuf[idex]>pl) {
                                zbuf[idex] = pl;
                                let index = idex*4;
                                let light = (Math.max(angl,angl*0.1)*0.9+0.3)*(1000/(pl**2+1000)); // 面と平行光源の角度
                                iarr[index+0] = polygons[i][3][0]*light; // 赤の描画
                                iarr[index+1] = polygons[i][3][1]*light; // 緑の描画
                                iarr[index+2] = polygons[i][3][2]*light; // 青の描画
                            }
                        }
                    }
                }
            }
        }
    }
    console.log(iarr)
    postMessage({"name":"imgData","data":iarr});
}


function pos_3t2d(pos,x,y,campos,trifv) {
    let p1 = rotate3d_x(rotate3d_z([pos[0]-campos[0],pos[1]-campos[1],pos[2]-campos[2]],trifv),trifv);
    let l = Math.abs(14/(p1[1]));
    let s = x/40;
    let d = [p1[0]*l*s+x/2,-p1[2]*l*s+y/2];
    return [Math.floor(d[0]),Math.floor(d[1]),p1];
}
function is_p(l1, l2) { // intersection point from 2 lines
    // 参考 https://mf-atelier.sakura.ne.jp/mf-atelier2/a1/
    let div = (l1[1][1]-l1[0][1])*(l2[1][0]-l2[0][0])-(l1[1][0]-l1[0][0])*(l2[1][1]-l2[0][1])
    if (div==0) {return [null,null]}
    let d1 = l2[0][1]*l2[1][0]-l2[0][0]*l2[1][1]
    let d2 = l1[0][1]*l1[1][0]-l1[0][0]*l1[1][1]
    let x = (d1*(l1[1][0]-l1[0][0])-d2*(l2[1][0]-l2[0][0]))/div
    let y = (d1*(l1[1][1]-l1[0][1])-d2*(l2[1][1]-l2[0][1]))/div
    return [x,y];
};
function squared_length3d(pos) {
    return (pos[0][0]-pos[1][0])**2+(pos[0][1]-pos[1][1])**2+(pos[0][2]-pos[1][2])**2;
}
function length3d(pos) {
    return Math.sqrt((pos[0][0]-pos[1][0])**2+(pos[0][1]-pos[1][1])**2+(pos[0][2]-pos[1][2])**2);
}
function length2d(pos) {
    return Math.sqrt( (pos[0][0]-pos[1][0])**2+(pos[0][1]-pos[1][1])**2 );
}

function VCProduct(a,b) { // Vector-Cross-Product ベクトルの外積
    return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
}

function VIProduct(a,b) { // ベクトルの内積
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}
function VMM3(a) { // ベクトルのマイナス1倍
    return [-a[0],-a[1],-a[2]];
}

function VNormalized(a) { // ベクトルの正規化
    let l = this.length3d([[0,0,0],a]);
    return [a[0]/l,a[1]/l,a[2]/l];
}
function inclusion(p1, carr) { // 三角形の内外判定
    let a = [carr[0][0]-p1[0],carr[0][1]-p1[1]];
    let b = [carr[1][0]-p1[0],carr[1][1]-p1[1]];
    let c = [carr[2][0]-p1[0],carr[2][1]-p1[1]];
    let ab = a[0]*b[1]-a[1]*b[0];
    let bc = b[0]*c[1]-b[1]*c[0];
    let ca = c[0]*a[1]-c[1]*a[0];
    return (ab<=0&&bc<=0&&ca<=0)||(ab>=0&&bc>=0&&ca>=0);
};
function rotate3d_x(pos,trifv) { // x軸のみの回転
    return [pos[0],pos[1]*trifv[3]-pos[2]*trifv[2],pos[1]*trifv[2]+pos[2]*trifv[3]];
}
function rotate3d_z(pos,trifv) { // z軸のみの回転
    return [pos[0]*trifv[1]-pos[1]*trifv[0],pos[0]*trifv[0]+pos[1]*trifv[1],pos[2]];
}


onmessage = function(e) {
    // console.log(e.data)
    switch (e.data.name) {
        case "getImg":
            getImg(e.data.x,e.data.y,e.data.polygons,e.data.trifv,e.data.campos);
        break;
    }
}