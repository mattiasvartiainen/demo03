#include "stdafx.h"
#include "DXGround.h"
#include "Debug.h"
#include "AudioDlg.h"
#include "Demo.h"

#include <mmsystem.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <malloc.h>
#include <time.h>

	// include midas header file
#include "resource.h"
#include "stuff.h"
#include "images.h"

#include "vector.h"
#include "tunnel.h"
#include "simple.h"

extern float SIN_TBL[360];
extern float COS_TBL[360];

void Vector::Normalize()
{
   float lenght = (float)(1.0/sqrt(x*x + y*y + z*z));
   x /= lenght;
   y /= lenght;
   z /= lenght;
}

void Vector::Rotate(int x_angle, int y_angle, int z_angle)
{
   float x1, y1, z1, x2, y2, z2;

   //X-rotation
   z1 = ( z*COS_TBL[abs((int)x_angle%360)] - y*SIN_TBL[abs((int)x_angle%360)] );
   y1 = ( z*SIN_TBL[abs((int)x_angle%360)] + y*COS_TBL[abs((int)x_angle%360)] );
   //Y-rotation
   x1 = ( x*COS_TBL[abs((int)y_angle%360)] - z1*SIN_TBL[abs((int)y_angle%360)] );
   z2 = ( x*SIN_TBL[abs((int)y_angle%360)] + z1*COS_TBL[abs((int)y_angle%360)] );
   //Z-rotation
   x2 = ( x1*COS_TBL[abs((int)z_angle%360)] - y1*SIN_TBL[abs((int)z_angle%360)] );
   y2 = ( x1*SIN_TBL[abs((int)z_angle%360)] + y1*COS_TBL[abs((int)z_angle%360)] );

   x=x2; y=y2; z=z2;
}
