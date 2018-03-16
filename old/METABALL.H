#ifndef __METABALL_H_
#define __METABALL_H_

#define CUBE_WIDTH	210
#define CELL_SIZE	10
#define VALUE 10
#define DRAW_METHOD	1

struct GRIDCELL{
   XYZ P[8];
   float val[8];
   XYZ vertlist[12];
};

#endif // end metaball_h