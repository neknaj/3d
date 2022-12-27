/* Neknaj 3D Lib - C++ */
/* bem130 2022 */
/* https://github.com/neknaj/3d */

#ifndef NeknajtdDraw
#define NeknajtdDraw

#include <cmath>
#include <array>
#include <vector>

struct tdDrawPolygon {
    std::array<double,3> p1;
    std::array<double,3> p2;
    std::array<double,3> p3;
    std::array<unsigned char,3> color;
    double distance = 0;
};
typedef std::vector<struct tdDrawPolygon> tdDrawObject;
unsigned char* iarr;
const double pi = 3.14159;

class tdDraw {
    public:
        std::array<double,3> campos = {0,0,0};
        std::array<double,2> camangle = {0,0};
        double trifv[4];
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
        void setCamera(std::array<double,3> new_campos,std::array<double,2> new_camangle) {
            campos = new_campos;
            camangle = new_camangle;
        }
        unsigned char* getImg (int width,int height) {
            display[0] = width;display[1] = height;

            frame++;
		    std::cout << "f " << frame << std::endl;
            int x = width;int y = height;
            double maxlen = 100;

            iarr = new uchar [x*y*4];
            double* zbuf = new double [x*y];
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
                double angl = VIProduct(vl,normal);
                double light = 0;

                int xmax = (int)std::min(std::max(std::max((double)p1[0],(double)p2[0]),(double)p3[0]),(double)display[0]);
                int xmin = (int)std::max(std::min(std::min((double)p1[0],(double)p2[0]),(double)p3[0]),(double)0);
                int ymax = (int)std::min(std::max(std::max((double)p1[1],(double)p2[1]),(double)p3[1]),(double)display[1]);
                int ymin = (int)std::max(std::min(std::min((double)p1[1],(double)p2[1]),(double)p3[1]),(double)0);

                double al = length3d({campos,t.p1});
                double bl = length3d({campos,t.p2});
                double cl = length3d({campos,t.p3});
                double ap = p1[2];
                double bp = p2[2];
                double cp = p3[2];
                for (int iy=ymin;iy<ymax;iy++) {
                    for (int ix=xmin;ix<xmax;ix++) {
                        int idex = (height-iy)*x+ix;
                        if (inclusion((t2da){(double)ix,(double)iy},{p1,p2,p3})) {
                            tda td = is_p({p1,(tda){(double)ix,(double)iy,0.0}},{p2,p3});

                            double l1 = length2d({p2,td})/length2d({p2,p3});
                            double l2 = length2d({p1,{(double)ix,(double)iy,0.0}})/length2d({p1,td});

                            double pl = al+l2*(bl+l1*(cl-bl)-al);
                            double pp = ap+l2*(bp+l1*(cp-bp)-ap);

                            if (pp>0&&zbuf[idex]>pl) {
                                zbuf[idex] = pl;
                                int index = idex*4;
                                double light = (std::max(angl,angl*0.1)*0.9+0.3)*(1000/(std::pow(pl,2)+1000));
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
        typedef std::array<double,3> tda;
        typedef std::array<double,2> t2da;
        typedef unsigned char uchar;
        void sortPolygon() {
        }
        tda pos_3t2d(tda p) {
            tda p1 = rotate3d_x(rotate3d_z({p[0]-campos[0],p[1]-campos[1],p[2]-campos[2]}));
            double l = std::abs(14/p1[1]);
            double s = display[0]/40;
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
            double div = (l1[1][1]-l1[0][1])*(l2[1][0]-l2[0][0])-(l1[1][0]-l1[0][0])*(l2[1][1]-l2[0][1]);
            if (div==0) {return {NAN,NAN,0};};
            double d1 = l2[0][1]*l2[1][0]-l2[0][0]*l2[1][1];
            double d2 = l1[0][1]*l1[1][0]-l1[0][0]*l1[1][1];
            double x = (d1*(l1[1][0]-l1[0][0])-d2*(l2[1][0]-l2[0][0]))/div;
            double y = (d1*(l1[1][1]-l1[0][1])-d2*(l2[1][1]-l2[0][1]))/div;
            return {x,y,0};
        }
        double squared_length3d(std::array<tda,2> p) {
            return std::pow(p[0][0]-p[1][0],2)+std::pow(p[0][1]-p[1][1],2)+std::pow(p[0][2]-p[1][2],2);
        }
        double length3d(std::array<tda,2> p) {
            return std::sqrt(std::pow(p[0][0]-p[1][0],2)+std::pow(p[0][1]-p[1][1],2)+std::pow(p[0][2]-p[1][2],2));
        }
        double length2d(std::array<tda,2> p) {
            return std::sqrt(std::pow(p[0][0]-p[1][0],2)+std::pow(p[0][1]-p[1][1],2));
        }
        tda VCProduct(tda a,tda b) {
            return {a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]};
        }
        double VIProduct(tda a,tda b) {
            return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
        }
        tda VMM3(tda a) {
            return {-a[0],-a[1],-a[2]};
        }
        tda VNormalized(tda a) {
            double l = length3d({(tda){0,0,0},(tda)a});
            return {a[0]/l,a[1]/l,a[2]/l};
        }
        bool inclusion(t2da p1,std::array<tda,3> carr) {
            t2da a = {carr[0][0]-p1[0],carr[0][1]-p1[1]};
            t2da b = {carr[1][0]-p1[0],carr[1][1]-p1[1]};
            t2da c = {carr[2][0]-p1[0],carr[2][1]-p1[1]};
            double ab = a[0]*b[1]-a[1]*b[0];
            double bc = b[0]*c[1]-b[1]*c[0];
            double ca = c[0]*a[1]-c[1]*a[0];
            return (ab<=0&&bc<=0&&ca<=0)||(ab>=0&&bc>=0&&ca>=0);
        }
        tda rotate3d_x(tda p) {
            return {p[0],p[1]*trifv[3]-p[2]*trifv[2],p[1]*trifv[2]+p[2]*trifv[3]};
        }
        tda rotate3d_z(tda p) {
            return {p[0]*trifv[1]-p[1]*trifv[0],p[0]*trifv[0]+p[1]*trifv[1],p[2]};
        }
};

#endif