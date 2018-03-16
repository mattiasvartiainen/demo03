#ifndef __XZN_FDTUNNEL_H__
#define __XZN_FDTUNNEL_H__

class FDTunnel
{
protected:
	Demo	*demo;

public:
	 FDTunnel( Demo *demoPtr );
	~FDTunnel( void );

	void Tunnel( void );
};

#endif // __XZN_FDTUNNEL_H__