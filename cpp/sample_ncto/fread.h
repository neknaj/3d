#include <fstream>
#include <iostream>
#include <string>
#include <cstdlib>
#include "../3d.h"


tdDrawPolygon arraytopoly(std::array<long double,12> a) {
    return {{a[0],a[1],a[2]},{a[3],a[4],a[5]},{a[6],a[7],a[8]},{(unsigned char)a[9],(unsigned char)a[10],(unsigned char)a[11]}};
}
tdDrawObject read(char* fname)
{
    std::ifstream ifs(fname);
    std::string str;
    tdDrawObject readobj = {};
    if (ifs.fail()) {
        std::cerr << "Failed to open file." << std::endl;
        return readobj;
    }
    while (getline(ifs, str)) {
        //std::cout << str << std::endl;
        if (str.substr(0,1)=="#") {
            continue;
        }
        std::array<long double,12> rawd = {0,0,0,0,0,0,0,0,0,0,0,0};
        int rcnt = 0;
        int nlen = 0;
        int nstart = 0;
        for (int i=0;i<str.length();i++) {
            if (str.substr(i,1)==",") {
                //std::cout << str.substr(nstart,nlen) << "  ::" << nstart << "," << nlen << std::endl;
                if (rcnt<12) {
                    rawd[rcnt] = std::stod(str.substr(nstart,nlen));
                }
                rcnt++;
                nstart = i+1;
                nlen = 0;
            }
            else {
                nlen++;
            }
        }
        if (rcnt<12) {
            rawd[rcnt] = std::stod(str.substr(nstart,nlen));
        }
        tdDrawPolygon poly = arraytopoly(rawd);
        readobj.insert(readobj.end(),poly);
    }
    std::cerr << readobj.size() << " polygons roaded" << std::endl;
    return readobj;
}