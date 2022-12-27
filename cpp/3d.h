/* Neknaj 3D Lib - C++ */
/* bem130 2022 */
/* https://github.com/neknaj/3d */

#ifndef NeknajtdDraw
#define NeknajtdDraw

#include <cmath>
#include <array>
#include <vector>

struct tdDrawPolygon {
    std::array<long double,3> p1;
    std::array<long double,3> p2;
    std::array<long double,3> p3;
    std::array<unsigned char,3> color;
    long double distance = 0;
};
typedef std::vector<struct tdDrawPolygon> tdDrawObject;
unsigned char* iarr;
const long double pi = 3.14159;

class tdDraw {
    public:
        std::array<long double,3> campos = {0,0,0};
        std::array<long double,2> camangle = {0,0};
        long double trifv[4];
        int display[2];
        tdDrawObject obj;
        int frame;
        typedef tdDrawPolygon poly;
        unsigned char sky[3] = {114, 174, 239};
        tdDraw() {
            frame = 0;
            obj = {};
            return;
        }
        void setObj(tdDrawObject object) {
            obj = object;
        }
        void setCamera(std::array<long double,3> new_campos,std::array<long double,2> new_camangle) {
            campos = new_campos;
            camangle = new_camangle;
        }
        unsigned char* getImg (int width,int height) {
            display[0] = width;display[1] = height;

            frame++;
		    std::cout << "f " << frame << std::endl;
            int x = width;int y = height;
            long double maxlen = 100;

            iarr = new uchar [x*y*4];
            long double* zbuf = new long double [x*y];
            for (int i=0;i<x*y;i++) {zbuf[i]=maxlen;iarr[i*4+2]=sky[0];iarr[i*4+1]=sky[1];iarr[i*4+0]=sky[2];}

            tda vl = VNormalized({30,10,20});

            trifv[0] = std::sin(camangle[0]);
            trifv[1] = std::cos(camangle[0]);
            trifv[2] = std::sin(-camangle[1]);
            trifv[3] = std::cos(camangle[1]);

            int numpolys = obj.size();
            for (int i=0;i<numpolys;i++) {
                poly t = obj[i];

                tda p1 = pos_3t2d(t.p1);
                tda p2 = pos_3t2d(t.p2);
                tda p3 = pos_3t2d(t.p3);

                tda v12 = {t.p2[0]-t.p1[0],t.p2[1]-t.p1[1],t.p2[2]-t.p1[2]};
                tda v13 = {t.p3[0]-t.p1[0],t.p3[1]-t.p1[1],t.p3[2]-t.p1[2]};

                tda normal = VNormalized(VCProduct(v12,v13));
                long double angl = VIProduct(vl,normal);
                long double light = 0;

                int xmax = (int)std::min(std::max(std::max((long double)p1[0],(long double)p2[0]),(long double)p3[0]),(long double)display[0]);
                int xmin = (int)std::max(std::min(std::min((long double)p1[0],(long double)p2[0]),(long double)p3[0]),(long double)0);
                int ymax = (int)std::min(std::max(std::max((long double)p1[1],(long double)p2[1]),(long double)p3[1]),(long double)display[1]);
                int ymin = (int)std::max(std::min(std::min((long double)p1[1],(long double)p2[1]),(long double)p3[1]),(long double)0);

                for (int iy=ymin;iy<ymax;iy++) {
                    for (int ix=xmin;ix<xmax;ix++) {
                        int idex = (height-iy)*x+ix;
                        if (inclusion((t2da){(long double)ix,(long double)iy},{p1,p2,p3})) {
                            tda td = is_p({p1,(tda){(long double)ix,(long double)iy,0.0}},{p2,p3});

                            long double al = length3d({campos,t.p1});
                            long double bl = length3d({campos,t.p2});
                            long double cl = length3d({campos,t.p3});
                            long double dl = bl+(length2d({p2,td})/length2d({p2,p3}))*(cl-bl);
                            long double pl = al+(length2d({p1,{(long double)ix,(long double)iy,0.0}})/length2d({p1,td}))*(dl-al);
                            
                            long double ap = p1[2];
                            long double bp = p2[2];
                            long double cp = p3[2];
                            long double dp = bp+(length2d({p2,td})/length2d({p2,p3}))*(cp-bp);
                            long double pp = ap+(length2d({p1,{(long double)ix,(long double)iy,0.0}})/length2d({p1,td}))*(dp-ap);

                            if (pp>0&&zbuf[idex]>pl) {
                                zbuf[idex] = pl;
                                int index = idex*4;
                                long double light = (std::max(angl,angl*0.1)*0.9+0.3)*(1000/(std::pow(pl,2)+1000));
                                iarr[index+2] = t.color[0]*light;
                                iarr[index+1] = t.color[1]*light;
                                iarr[index+0] = t.color[2]*light;
                            }
                        }
                    }
                }
            }

            delete[] zbuf;
            return iarr;
        }
    private:
        typedef std::array<long double,3> tda;
        typedef std::array<long double,2> t2da;
        typedef unsigned char uchar;
        void sortPolygon() {
        }
        tda pos_3t2d(tda p) {
            tda p1 = rotate3d_x(rotate3d_z({p[0]-campos[0],p[1]-campos[1],p[2]-campos[2]}));
            long double l = std::abs(14/p1[1]);
            long double s = display[0]/40;
            return {std::floor(p1[0]*s*l+display[0]/2),std::floor(-p1[2]*s*l+display[1]/2),p1[1]};
        }
        void sortP() {
        }
        void updateLengthToPolygon() {
        }
        void gcot() {
        }
        tda is_p(std::array<tda,2> l1,std::array<tda,2> l2) {
            // 参考 https://mf-atelier.sakura.ne.jp/mf-atelier2/a1/
            long double div = (l1[1][1]-l1[0][1])*(l2[1][0]-l2[0][0])-(l1[1][0]-l1[0][0])*(l2[1][1]-l2[0][1]);
            if (div==0) {return {NAN,NAN,0};};
            long double d1 = l2[0][1]*l2[1][0]-l2[0][0]*l2[1][1];
            long double d2 = l1[0][1]*l1[1][0]-l1[0][0]*l1[1][1];
            long double x = (d1*(l1[1][0]-l1[0][0])-d2*(l2[1][0]-l2[0][0]))/div;
            long double y = (d1*(l1[1][1]-l1[0][1])-d2*(l2[1][1]-l2[0][1]))/div;
            return {x,y,0};
        }
        long double squared_length3d(std::array<tda,2> p) {
            return std::pow(p[0][0]-p[1][0],2)+std::pow(p[0][1]-p[1][1],2)+std::pow(p[0][2]-p[1][2],2);
        }
        long double length3d(std::array<tda,2> p) {
            return std::sqrt(std::pow(p[0][0]-p[1][0],2)+std::pow(p[0][1]-p[1][1],2)+std::pow(p[0][2]-p[1][2],2));
        }
        long double length2d(std::array<tda,2> p) {
            return std::sqrt(std::pow(p[0][0]-p[1][0],2)+std::pow(p[0][1]-p[1][1],2));
        }
        tda VCProduct(tda a,tda b) {
            return {a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]};
        }
        long double VIProduct(tda a,tda b) {
            return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
        }
        tda VMM3(tda a) {
            return {-a[0],-a[1],-a[2]};
        }
        tda VNormalized(tda a) {
            long double l = length3d({(tda){0,0,0},(tda)a});
            return {a[0]/l,a[1]/l,a[2]/l};
        }
        bool inclusion(t2da p1,std::array<tda,3> carr) {
            t2da a = {carr[0][0]-p1[0],carr[0][1]-p1[1]};
            t2da b = {carr[1][0]-p1[0],carr[1][1]-p1[1]};
            t2da c = {carr[2][0]-p1[0],carr[2][1]-p1[1]};
            long double ab = a[0]*b[1]-a[1]*b[0];
            long double bc = b[0]*c[1]-b[1]*c[0];
            long double ca = c[0]*a[1]-c[1]*a[0];
            return ab<=0&&bc<=0&&ca<=0;
        }
        tda rotate3d_x(tda p) {
            return {p[0],p[1]*trifv[3]-p[2]*trifv[2],p[1]*trifv[2]+p[2]*trifv[3]};
        }
        tda rotate3d_z(tda p) {
            return {p[0]*trifv[1]-p[1]*trifv[0],p[0]*trifv[0]+p[1]*trifv[1],p[2]};
        }
};

#endif