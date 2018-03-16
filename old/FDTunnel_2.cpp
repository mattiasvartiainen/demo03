#include <windows.h>
#include <gl\gl.h>
#include <gl\glu.h>
#include <gl\glaux.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#include "FDTunnel.h"
#include "Vector.h"

extern float SIN_TBL[360];
extern float COS_TBL[360];

// --------------------------------------------
//			 Constructor for effects
// --------------------------------------------
FDTunnel::FDTunnel( int realWidth, int realHeight, int fdWidth, int fdHeight, char *name )
{
	float aspectRatio = 1.0f;
	alphaValue = 1.0f;
	posX = posY = 0;
	combineValue = 0.0f;
	Radius = 256;
	Position = -256;
	xRot = 0;
	aspectRatio = (float)(fdWidth/fdHeight);
	polySize = 16;
	FDWidth = fdWidth;
	FDHeight = fdHeight;
	gridSizeX = realWidth/polySize;
	gridSizeY = realHeight/polySize;
	xAng=yAng=zAng=0;
	TData = new Data[(gridSizeX+1)*(gridSizeY+1)];
	renderState = 0;

	depthTest = FALSE;
	blending = FALSE;

	// Load Bitmaps And Convert To Textures
	// Load Texture
	AUX_RGBImageRec *texture1;
	texture1 = auxDIBImageLoad(name);
	if (!texture1) exit(1);

	// Create Texture
	glGenTextures(1, &texture[0]);
	glBindTexture(GL_TEXTURE_2D, texture[0]); 
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_T,GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_S,GL_REPEAT);
	glTexImage2D(GL_TEXTURE_2D, 0, 3, texture1->sizeX, texture1->sizeY, 0, GL_RGB, GL_UNSIGNED_BYTE, texture1->data);
} // end constructor

// -------------------------------------------------------------------------------------------
//					Constructor for effects, widht depthtest and blending
// -------------------------------------------------------------------------------------------
FDTunnel::FDTunnel( int realWidth, int realHeight, int fdWidth, int fdHeight, char *name, BOOL d, BOOL b, float a )
{
	float aspectRatio = 1.0f;
	posX = posY = 0;
	combineValue = 0.0f;
	Radius = 256;
	Position = -256;
	xRot = 0;
	aspectRatio = (float)(fdWidth/fdHeight);
	polySize = 16;
	FDWidth = fdWidth;
	FDHeight = fdHeight;
	gridSizeX = realWidth/polySize;
	gridSizeY = realHeight/polySize;
	xAng=yAng=zAng=0;
	TData = new Data[(gridSizeX+1)*(gridSizeY+1)];
	renderState = 0;

	depthTest = d;
	blending = b;
	alphaValue = a;

	// Load Bitmaps And Convert To Textures
	// Load Texture
	AUX_RGBImageRec *texture1;
	texture1 = auxDIBImageLoad(name);
	if (!texture1) exit(1);

	// Create Texture
	glGenTextures(1, &texture[0]);
	glBindTexture(GL_TEXTURE_2D, texture[0]); 
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_T,GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_S,GL_REPEAT);
	glTexImage2D(GL_TEXTURE_2D, 0, 3, texture1->sizeX, texture1->sizeY, 0, GL_RGB, GL_UNSIGNED_BYTE, texture1->data);
} // end constructor

// ------------------------
//		 Destructor
// ------------------------
FDTunnel::~FDTunnel( void )
{
	delete TData;
} // end destructor

// ------------------------------------------
//			Resize area of effect
// ------------------------------------------
void FDTunnel::resize( int x, int y )
{
	FDWidth = x;
	FDHeight = y;
} // end resize

// ------------------------------------------
//			Resize area of effect
// ------------------------------------------
void FDTunnel::setPos( int x, int y )
{
	posX = x;
	posY = y;
} // end setPos

// ----------------------------
//	  Change radius of sphere
// ----------------------------
void FDTunnel::setSphereRadius( float r )
{
//	SPHERE_RADIUS = r;
}

// ----------------------------
//	  Calc values for tunnel
// ----------------------------
	void FDTunnel::fdTunnel( void )
	{
		float u,v,z;
		int xScr, yScr;
		int halfWidth = 320;//FDWidth>>1;
		int halfHeight = 240;//FDHeight>>1;
		xScr = yScr = 0;

		combineValue += (float)0.0001;

		for( int y=0; y<(gridSizeY+1); y++ )
		{
			xScr = 0;
			for( int x=0; x<(gridSizeX+1); x++ )
			{
				float a, b, c;
				float delta;
				float t;

				Vector Dir((float)(xScr-halfWidth), (float)(yScr-halfHeight), (float)(256));
				Dir.Rotate(xAng, yAng, zAng);
				Dir.Normalize();                      // normalize Direction vector

				Vector Origin( (float)128, (float)128, (float)Position);

				// calculate the stuff :-)
				a = fsqr(Dir.x) + fsqr(Dir.y);
				b = 2*(Origin.x*Dir.x + Origin.y*Dir.y);
				c = fsqr(Origin.x) + fsqr(Origin.y) - fsqr(Radius);

				// calculate discriminent delta
				delta = fsqr(b) - 4*a*c;

				// if there's no real solution
				if (delta <= 0)
				{
					u = 128;
					v = 128;
					z = 128;
					//return;
				}
				else {

					// there are 2 solutions, get the nearest ... this case should never happen
					t = (float)( (-b + sqrt(delta))/(2*a) );

					// finnally the intersection
					Vector Intersection;
					Intersection.x = Origin.x + t*Dir.x;//*SIN_TBL[xAng];
					Intersection.y = Origin.y + t*Dir.y*SIN_TBL[((int)(xAng+(xScr*combineValue)))%359];
					Intersection.z = Origin.z + t*Dir.z;//*SIN_TBL[xAng];

					// do the mapping
					u = (float)(fabs(Intersection.z+Position*8)*0.2);
					v = (float)(fabs(atan2(Intersection.y, Intersection.x)*V_Meck));

					z = (float)( abs((int)(Intersection.z - Origin.z))*0.08 );
					if( z >250.0f ) z = 250.0f;
					if( z <15.0f   ) z = 15.0f;

					TData[x+(y*gridSizeX)].u = (float)(u/255.0f);
					TData[x+(y*gridSizeX)].v = (float)(v/255.0f);
					TData[x+(y*gridSizeX)].c = 1.0f - (z/255.0f);
				}

				xScr += polySize;
			} // end x

			yScr += polySize;
		}
	}

// Free-Direction Planes
void FDTunnel::fdPlanes( void )
{
	float u,v,z;
	int xScr, yScr;
	int halfWidth = 320;//FDWidth>>1;
	int halfHeight = 240;//FDHeight>>1;
	xScr = yScr = 0;

	for( int y=0; y<(gridSizeY+1); y++ )
	{
		xScr = 0;
		for( int x=0; x<(gridSizeX+1); x++ )
		{
			float t;
			Vector Origin( (float)0, (float)0, (float)Position);
			// Pixel Direction Calculation
			//Vector Dir( (float)((xScr-160)/FOV), (float)((yScr-100)/FOV-.6), (float)( .7));
			Vector Dir( (float)((xScr-halfWidth)/FOV), (float)((yScr-halfHeight)/FOV), (float)1.0f);
			Vector Intersect;

			Dir.Rotate( xAng, yAng, zAng );
			Dir.Normalize();
			// Normalize our Direction Vector

			// Find t
			t = (sgn(Dir.y)*PLANE_OFFSET-Origin.y) / Dir.y;

			// Calculate Intersect Point (O + D*t)
			Intersect.x = Origin.x + Dir.x*t;
			Intersect.y = Origin.y + Dir.y*t;
			Intersect.z = Origin.z + Dir.z*t;

			// Calculate Mapping Coordinates ( Coordiantes)
			u = (float)(fabs(Intersect.x)*0.3);
			v = (float)(fabs(Intersect.z)*0.3);
			// Calculate Depth
			t = sqr(Intersect.x-Origin.x) + sqr(Intersect.z-Origin.z);

			if (t <= EPSILON) z = 0;
			else
			{
                t = (float)(50000.0f / sqrt(t));
                z = (unsigned char)(t > 255 ? 255 : t);
			}

            TData[x+(y*gridSizeX)].u = (float)(u/255.0f);
            TData[x+(y*gridSizeX)].v = (float)(v/255.0f);
			if( z>255 ) z=255;
			else if( z<0 ) z=0;
            TData[x+(y*gridSizeX)].c = (z/255.0f);

			xScr += polySize;
		} // end x

		yScr += polySize;
	}
} // End planes

// Free-Direction Sphere
void FDTunnel::fdSphere( void )
{
	float u,v,z;
	int xScr, yScr;
	int halfWidth = 320;//FDWidth>>1;
	int halfHeight = 240;//FDHeight>>1;
	xScr = yScr = 0;

	for( int y=0; y<(gridSizeY+1); y++ )
	{
		xScr = 0;
		for( int x=0; x<(gridSizeX+1); x++ )
		{
			Vector Origin(0,0,0);

			// Pixel Direction Calculation
			Vector Direction( (float)((xScr-halfWidth)/FOV), (float)((yScr-halfHeight)/FOV-.4), (float)( .7));
			Direction.Rotate(xAng, yAng, zAng);
			// Normalize our Direction Vector
			Direction.Normalize();

			Vector Intersect;
        
			float a, b, c, delta, t1, t2, t;

			// (Dxý+Dyý+Dzý)*tý + 2*(Ox*Dx+Oy*Dy+Oz*Dz)*t + (Oxý+Oyý+Ozý-rý) = 0
			a = sqr(Direction.x) + sqr(Direction.y) + sqr(Direction.z);
			b = 2*(Origin.x*Direction.x + Origin.y*Direction.y + Origin.z*Direction.z);
			c = sqr(Origin.x) + sqr(Origin.y) + sqr(Origin.z) - sqr(SPHERE_RADIUS);

			// delta = û ( bý - 4ac )
			delta = (float)(sqrt(b*b - 4*a*c));

			//           -b + delta             -b + delta
			//      x1 = ÄÄÄÄÄÄÄÄÄÄ    ;   x2 = ÄÄÄÄÄÄÄÄÄÄ
			//               2a                     2a
			//t = (-b + delta) / (2*a);
			t1 = (-b + delta) / (2*a);
			t2 = (-b - delta) / (2*a);

			// Find positive solution
			t = t1 > 0 ? t1 : t2;
        
			// Calculate Intersect Point (O + D*t)
			Intersect.x = (Origin.x + Direction.x*t);
			Intersect.y = (Origin.y + Direction.y*t);
			Intersect.z = (Origin.z + Direction.z*t);

			// Calculate Mapping Coordinates (Radial Coordiantes)
        
			u = (float)(asin((Intersect.y) / sqrt(sqr(Intersect.x) +
                  sqr(Intersect.y) +    sqr(Intersect.z)))*128.0f + 128.0f);
			v = (float)(atan2(Intersect.z, Intersect.x)*V_Meck);

	        t = (float)((fabs(Intersect.z) / SPHERE_RADIUS) * 90);
		    z = (unsigned char)(t > 255 ? 255 : t);

			if( z>255.0f ) z=255.0f;
			if( z<0.0f ) z = 0.0f;

            TData[x+(y*gridSizeX)].u = (float)(u/255.0f);
            TData[x+(y*gridSizeX)].v = (float)(v/255.0f);
            TData[x+(y*gridSizeX)].c = (float)(z/255.0f);

			xScr += polySize;
		} // end x

		yScr += polySize;
	} // end y

} // End sphere

void FDTunnel::fdFlag( void )
{
	float u,v,z;
	int xScr, yScr;
	xScr = yScr = 0;

	for( int y=0; y<(gridSizeY+1); y++ )
	{
		xScr = 0;
		for( int x=0; x<(gridSizeX+1); x++ )
		{
			float vinkel_x, vinkel_y;
			vinkel_x = SIN_TBL[abs((XA*xScr+yAng)%359)];
			vinkel_y = COS_TBL[abs((YA*yScr+xAng)%359)];
			u = (float)(xScr + 38*vinkel_x);
			v = (float)(abs((int)(yScr + 38*vinkel_y)) );//%255);
			z = (float)(127 - abs((int)(127*((vinkel_x+vinkel_y))/2))&0xff);

            TData[x+(y*gridSizeX)].u = (u/255.0f);
            TData[x+(y*gridSizeX)].v = (v/255.0f);
            TData[x+(y*gridSizeX)].c = (z/255.0f);

			xScr += polySize;
		} // end x

		yScr += polySize;
	} // end y
}

void FDTunnel::fdRotate( void )
{
	float u,v,z;
	int xScr, yScr;
	int halfWidth = 320;//FDWidth>>2;
	xScr = yScr = 240;//FDHeight>>2;

	for( int y=0; y<(gridSizeY+1); y++ )
	{
		xScr = halfWidth;
		float ysin = ((yScr-(240>>1))*SIN_TBL[xAng]);
		float ycos = ((yScr-(240>>1))*COS_TBL[xAng]);
		
		for( int x=0; x<(gridSizeX+1); x++ )
		{
			u = (float)((xScr-(320))*SIN_TBL[xAng] - ycos);
			v = (float)((xScr-(320))*COS_TBL[xAng] + ysin);
			u += 320;
			v += 240;

			z = 255.0f;

            TData[x+(y*gridSizeX)].u = (u/255.0f);
            TData[x+(y*gridSizeX)].v = (v/255.0f);
            TData[x+(y*gridSizeX)].c = (z/255.0f);

			xScr += polySize;
		} // end x

		yScr += polySize;
	} // end y
}

void FDTunnel::fdCombine( void ) 
{
	float u,v,z;
	int xScr, yScr;
	xScr = yScr = 0;

	combineValue += (float)0.01;

	for( int y=0; y<(gridSizeY+1); y++ )
	{
		xScr = 0;
		float ysin = ((yScr-(320))*SIN_TBL[xAng]*COS_TBL[zAng]);
		float ycos = ((yScr-(240))*COS_TBL[xAng]);

		for( int x=0; x<(gridSizeX+1); x++ )
		{
			float vinkel_x, vinkel_y;
			vinkel_x = SIN_TBL[abs((XA*xScr+yAng)%359)];
			vinkel_y = COS_TBL[abs((YA*yScr+xAng)%359)];
			u = (float)(xScr + 38*vinkel_x);
			v = (float)(abs((int)(yScr + 38*vinkel_y)) );//%255);
			z = (float)(127 - abs((int)(127*((vinkel_x+vinkel_y))/2))&0xff);

			u += (float)((xScr-(xAng>>1))*SIN_TBL[xAng] - ycos);
			v += (float)((xScr-320)*COS_TBL[xAng]*SIN_TBL[yAng] + ysin);
			u += FDWidth>>1;
			v += yAng>>1;

            TData[x+(y*gridSizeX)].u = (u/255.0f);
            TData[x+(y*gridSizeX)].v = (v/255.0f);
            TData[x+(y*gridSizeX)].c = (z/255.0f);

			xScr += polySize;
		} // end x

		yScr += polySize;
	} // end y
}

void FDTunnel::setRenderState( int state )
{
	renderState = state;
}

// Add to rotateangles
void FDTunnel::addToAngles( int x, int y, int z )
{
	xAng += x;
	yAng += y;
	zAng += z;
}

void FDTunnel::render( unsigned long fps )
{
	int xs, ys;
	double dx, dy;
	double xx, yy;
	int theWidth = FDWidth;
	int theHeight = FDHeight;
	double xInc = 16;
	xs = ys = 0;

	xAng++;
	yAng++;
	zAng++;

	xAng = xAng % 359;
	yAng = yAng % 359;
	zAng = zAng % 359;

	glLoadIdentity();
	glTranslatef(0.0f,0.0f,(float)-1499.0f);
	// Disable depth test when drawing fd stuff.. no depth here =)
	if( !depthTest )
		glDisable(GL_DEPTH_TEST);
	if( blending ) {
		glEnable(GL_BLEND);
	}

	//xRot += 0.4f;
	//glRotatef(xRot,0.0f,1.0f,0.0f);

	// Calc new values
	switch(renderState) {
	case 0:
		fdTunnel();
		break;
	case 1:
		fdPlanes();
		break;
	case 2:
		fdSphere();
		break;
	case 3:
		fdFlag();
		break;
	case 4:
		fdRotate();
		break;
	case 5:
		fdCombine();
		break;
	default:
		break;
	}

	// Calc how much to increment x and y when 'interpolating' textures
	dx = (double)theWidth/(double)polySize;
	dy = (double)-theWidth/(double)polySize;

	yy = (double)-dy*gridSizeY/2 + (double)posY;
	xInc = (double)(-dx*gridSizeX/2) + (double)posX;
	glBindTexture(GL_TEXTURE_2D, texture[0]);
	// OpenGL Render the polys, go through grid and draw polys..
	for( ys=0; ys<(gridSizeY); ys++ )
	{
		xx = xInc;
		for( xs=0; xs<(gridSizeX); xs++ )
		{
			float col;
			glBegin(GL_QUADS);

			//glNormal3f( 0.0f, 0.0f, 1.0f);
			
			col = TData[xs+(ys*gridSizeX)].c;
			glColor4f( col, col, col, alphaValue );
			glTexCoord2f(TData[xs+(ys*gridSizeX)].u, TData[xs+(ys*gridSizeX)].v);
			//glVertex3f( (float)xx, (float)yy, 0.0f );
			glVertex2f( (float)xx, (float)yy );
			
			col = TData[xs+(ys*gridSizeX)+1].c;
			glColor4f( col, col, col, alphaValue );
			glTexCoord2f(TData[xs+(ys*gridSizeX)+1].u, TData[xs+(ys*gridSizeX)+1].v); 
			//glVertex3f( (float)(xx+dx), (float)yy, 0.0f );
			glVertex2f( (float)(xx+dx), (float)yy );
			
			col = TData[xs+(ys*gridSizeX)+gridSizeX+1].c;
			glColor4f( col, col, col, alphaValue );
			glTexCoord2f(TData[xs+(ys*gridSizeX)+gridSizeX+1].u, TData[xs+(ys*gridSizeX)+gridSizeX+1].v); 
			//glVertex3f( (float)(xx+dx), (float)(yy+dy), 0.0f );
			glVertex2f( (float)(xx+dx), (float)(yy+dy) );

			col = TData[xs+(ys*gridSizeX)+gridSizeX].c;
			glColor4f( col, col, col, alphaValue );
			glTexCoord2f(TData[xs+(ys*gridSizeX)+gridSizeX].u, TData[xs+(ys*gridSizeX)+gridSizeX].v); 
			//glVertex3f( (float)xx, (float)(yy+dy), 0.0f );
			glVertex2f( (float)xx, (float)(yy+dy) );
			
			glColor3f( 1.0f, 1.0f, 1.0f );	// Restore colors
			glEnd();
			xx += dx;
		} // end xs
		yy += dy;

	} // end ys

	// Restor depth meck
	if( !depthTest )
		glEnable(GL_DEPTH_TEST);
	if( blending )
		glDisable(GL_BLEND);

} // end render
