#include <windows.h>
#include <iostream>
#include "../3d.h"
#include "fread.h"

tdDraw tddraw;
tdDrawObject showobject;

LRESULT CALLBACK WndProc(HWND hwnd , UINT msg , WPARAM wp , LPARAM lp) {
	HDC hdc;
	PAINTSTRUCT ps;

	RECT rect;
	
	static unsigned char* lpPixel;
	static BITMAPINFO bmpInfo;

	switch (msg) {
	case WM_DESTROY:
		PostQuitMessage(0);
		return 0;
	case WM_CREATE:
		tddraw = tdDraw();
		tddraw.setObj(showobject);
		return 0;
	case WM_PAINT:
		GetWindowRect(hwnd, &rect);
		int width = rect.right - rect.left;
		int height = rect.bottom - rect.top;
		// std::cout << width << " " << height << std::endl; // output window size

		bmpInfo.bmiHeader.biSize=sizeof(BITMAPINFOHEADER);
		bmpInfo.bmiHeader.biWidth=width;
		bmpInfo.bmiHeader.biHeight=height;
		bmpInfo.bmiHeader.biPlanes=1;
		bmpInfo.bmiHeader.biBitCount=32;
		bmpInfo.bmiHeader.biCompression=BI_RGB;
		lpPixel = tddraw.getImg(width,height); // 3D
		// 上書き描画
		// for(int y=100;y<=500;y++){
		// 	for(int x=100;x<=500;x++){
		// 		lpPixel[(x+y*width)*4+0]=255;
		// 	}
		// }
		//
		hdc=BeginPaint(hwnd,&ps);
		SetDIBitsToDevice(hdc,0,0,width,height,0,0,0,height,lpPixel,&bmpInfo,DIB_RGB_COLORS);
		EndPaint(hwnd,&ps);
		delete[] lpPixel;
		return 0;
	}
	return DefWindowProc(hwnd,msg,wp,lp);
}

int WINAPI WinMain(HINSTANCE hInstance,HINSTANCE hPrevInstance,PSTR lpCmdLine,int nCmdShow) {
	std::cout << lpCmdLine << std::endl;
	showobject = read(lpCmdLine);

	HWND hwnd;
	MSG msg;
	WNDCLASS winc;

	winc.style = CS_HREDRAW | CS_VREDRAW;
	winc.lpfnWndProc = WndProc;
	winc.cbClsExtra	= winc.cbWndExtra	= 0;
	winc.hInstance = hInstance;
	winc.hIcon = LoadIcon(NULL , IDI_APPLICATION);
	winc.hCursor = LoadCursor(NULL , IDC_ARROW);
	winc.hbrBackground = (HBRUSH)GetStockObject(WHITE_BRUSH);
	winc.lpszMenuName = NULL;
	winc.lpszClassName = TEXT("app");

	if (!RegisterClass(&winc)) return -1;

	hwnd = CreateWindow(
		TEXT("app") , TEXT("3D on Desktop") ,
		WS_OVERLAPPEDWINDOW | WS_VISIBLE ,
		CW_USEDEFAULT , CW_USEDEFAULT ,
		500 , 400 , // window size
		NULL , NULL , hInstance , NULL
	);

	if (hwnd == NULL) return -1;

	while(GetMessage(&msg,NULL,0,0)) {DispatchMessage(&msg);}
	return msg.wParam;
}