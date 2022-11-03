// bem130 2022 2d.js //
/*

point
  p_ = [x,y]

*/

class m2D {
    length(p1,p2) {
      return Math.sqrt((p1[0]-p2[0])**2+(p1[1]-p2[1])**2)
    }
    midpoint(p1,p2) {
      return [(p1[0]+p2[0])/2,(p1[1]+p2[1])/2]
    }
    linesplitpoint(p1,p2,t) {
      return [p1[0]+(p2[0]-p1[0])*t,p1[1]+(p2[1]-p1[1])*t]
    }
    floor(p) {
      return [Math.floor(p[0]),Math.floor(p[1])]
    }
    swapxy(p) {
      return [p[1],p[0]]
    }
}