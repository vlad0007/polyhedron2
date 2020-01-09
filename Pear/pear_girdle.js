var DEGREE = 0.01745329251994;
var M_PI = 3.14159265358979323846;
var M_PI_2 = 1.57079632679489661923;

var ctx;
var btn_lw_plus, btn_lw_minus; 
var btn_vp_minus, btn_vp_plus;
var btn_Lh_minus, btn_Lh_plus;

var btn_gd4_minus, btn_gd4_plus;
var btn_gd8_minus, btn_gd8_plus;
var btn_gd12_minus, btn_gd12_plus;
var btn_gd16_minus, btn_gd16_plus;
var btn_gd20_minus, btn_gd20_plus;
var btn_gd24_minus, btn_gd24_plus;
var btn_gd28_minus, btn_gd28_plus;

var lw = 1.5; 
var vp = -4.0*DEGREE;
var Lh = 0.34; 

var v, g, u, t, s, a, b, fi, psi;

var DelAngGirdle_4 = 0;
var DelAngGirdle_8 = 0;
var DelAngGirdle_12 = 0;
var DelAngGirdle_16 = 0;
var DelAngGirdle_20 = 0;
var DelAngGirdle_24 = 0;
var DelAngGirdle_28 = 0;

var square_deviation = 0.0; // квадратичность рундиста

var girdle = [64];

// координаты мыши
var x_mouse, y_mouse;

var xC; // Centre x
var yC; // Centre y
var SCALE;  // SCALE
	
function initiate()
{					
	var elem1 = document.getElementById('canvas_01');

	SCALE = 60;
	xC = elem1.width / 2;
	yC = elem1.height / 2;
	
	ctx = elem1.getContext("2d");
	init_girdle();
	draw_girdle();
	construction();
	pars_value();

	AddButtons();	
	AddButtonsPositionSize();

	elem1.onmousemove = mouse_move;
}

function init_girdle()
{
	// Параметр vp обозначен как δ на экране при запуске программы.
	
	//  При расчете формы рундиста и получении формул используемых
	// для этого расчета (полуоси эллипса a и b) использовалось свйство касательной к эллипсу.
	// Подробно это рассмотрено в комментариях к программе MarquiseGirdle.html
	
	// g - длина отрезка расположенного между вершиной 0 рундиста огранки и точкой O.
	// u - длина отрезка OB
	// ширина рундиста принята равной 2
	// g + u = 2*lw
	// Lh = g / 2*lw  
	// Lh задает соотношение величин g и u.
	var i;
	// Введем переменную v
	v = lw * Lh - 0.5;
	//  тогда размер полуоси эллипса ellipse_3 по оси OY равен величине
	g = 1.0 + v + v;
	if ( g < 0 )
		return null;
	u = 2*lw - g;  // u - длина отрезка OB (на экране при запуске программы)
	if ( u < 0 )
		return null;
	fi = Math.asin ( ( u + u ) / ( u * u + 1.0) );
	psi = fi + vp;  // vp (на экране это угол δ) - определяет величину отличия формы эллипса от окружности
	t = u * Math.tan(psi); //  на экране это длина отрезка OM
	if ( vp >= Math.PI/2 ) 
		return null;
	if ( t <= 2.0) 
		return null;

	// a и b - полуоси эллипса (на экране a < b по модулю)
	a = ( t - 1.0 ) / ( t - 2.0 );
	s = a - 1.0;
	b = u * ( 1.0 - t ) / Math.sqrt ( t * t - ( t + t ) );
	
	// Переменные AA, BB и CC определяют уравнение AA*xx + BB*y + CC = 0
	var AA, BB, CC;
	var angle_current; 
	var rez = [2];
	var delta, x, y, w, x_rez, y_rez;
	var bRez;	
	
	if (DelAngGirdle_16 <= 0.0)
	{
		//  Сдвиг центральной точки рундиста в сторону
		// противоположную от носика груши.
		var ang_0_16 = M_PI_2 + DelAngGirdle_16;
		var E = new Point2D(Math.sin(ang_0_16), Math.cos(ang_0_16));
		var alpha = Math.atan2(E[1], (E[0] + s));

		// Вершины в квадранте (X > 0; Y > 0)
		var ang_0_8 = ang_0_16 / 2 + DelAngGirdle_8;
		var ang_8_16 = ang_0_16 - ang_0_8;
		var ang_0_4 = ang_0_8 / 2 + DelAngGirdle_4;
		var ang_4_8 = ang_0_8 - ang_0_4;
		var ang_8_12 = ang_8_16 / 2 + DelAngGirdle_12;
		var ang_12_16 = ang_8_16 - ang_8_12;
		
		angle_current = 0.0;
		for ( i = 0; i <= 16; i++ )
		{
			x = Math.sin(angle_current);
			y = Math.cos (angle_current);
			girdle[i] = new Point2D(x, y * g);			

			if (i < 4)
				delta = ang_0_4 / 4;
			else if (i < 8)
				delta = ang_4_8 / 4;
			else if (i < 12)
				delta = ang_8_12 / 4;
			else
				delta = ang_12_16 / 4;
			
			angle_current = angle_current + delta;
		}
		var v16_1_x = girdle[16][0];
		var v16_1_y = girdle[16][1];

		// Вершины в квадранте (X > 0; Y < 0)
		var ang_32 = Math.acos(s / a);
		var ang_16 = - alpha;
		var ang_24 = ang_32 - (ang_32 - ang_16 )/ 2.0 + DelAngGirdle_24;
		var ang_20 = ang_24 - (ang_24 - ang_16) / 2.0 + DelAngGirdle_20;
		var ang_28 = ang_32 - (ang_32 - ang_24) / 2.0 + DelAngGirdle_28;

		var j = 31;
		angle_current = ang_32;
		for ( i = 15; i >= 0; i-- )
		{
			if (i < 4)
				delta = (ang_20 - ang_16) / 4.0;
			else if ( (i >= 4) && (i < 8) )
				delta = (ang_24 - ang_20) / 4.0;
			else if ( (i >= 8) && (i < 12) )
				delta = (ang_28 - ang_24) / 4.0;
			else
				delta = (ang_32 - ang_28) / 4.0;

			angle_current = angle_current - delta;
			if (angle_current <= 0)
			{
				// x и y - координаты точки L
				x = a * Math.cos(angle_current) - s;
				y = b * Math.sin(angle_current);
				// k - угловой коэффициент прямой DL
				var k = y/(x+s);
				//  Находим координаты точки K,
				// лежащей на пересечении прямой DL с Ellipse_1
				AA = g*g + k*k;
				BB = 2*k*k*s;
				CC = s*s*k*k - g*g;
				var x_rez, x_rez; // координаты точки K
				
				if(!QuadraticEquation(AA, BB, CC, rez))
				{
					return null;
				}
				if (rez[0] > rez[1])
					x_rez = rez[0];
				else
					x_rez = rez[1];
				
				y_rez = (x_rez + s)*k;
				girdle[j] = new Point2D(x_rez, y_rez);	
				j--;
			}
			else
			{
				girdle[j] = new Point2D();	
				girdle[j][0] = a * Math.cos(angle_current) - s;
				girdle[j][1] = b * Math.sin(angle_current);
				j--;
			}
		}
		girdle[16] = new Point2D(v16_1_x, v16_1_y);
	}
	else
	{
		// DelAngGirdle_16 > 0.0
		//  Сдвиг центральной точки рундиста в сторону носика груши.
		// Определяем координаты точки N (g16)
		var N = new Point2D(a * Math.cos(DelAngGirdle_16) - s, b * Math.sin(DelAngGirdle_16)); 

		// Находим точку M пересечения прямой ON с Ellipse_1
		var k = N[1]/N[0];
		var beta = Math.atan2(-N[1], N[0]);
		var ang_0_16 = M_PI/2 + beta;

		// Вершины g0 - g16
		var ang_0 = 0.0;
		var ang_8 = ang_0_16 / 2.0 + DelAngGirdle_8;
		var ang_4 = ang_0 + (ang_8 - ang_0) / 2.0 + DelAngGirdle_4;
		var ang_12 = ang_8 + (ang_0_16 - ang_8) / 2.0 + DelAngGirdle_12;
		var ang_16 = ang_0_16;

		angle_current = 0.0;		
		for ( i = 0; i <= 15; i++ )
		{
			if (i <= 4)
				delta = (ang_4 - ang_0) / 4.0;
			else if ( (i >= 5) && (i <= 8) )
				delta = (ang_8 - ang_4) / 4.0;
			else if ( (i >= 9) && (i <= 12) )
				delta = (ang_12 - ang_8) / 4.0;
			else
				delta = (ang_16 - ang_12) / 4.0;
			// Это могут быть и координаты точки R
			// если окжется, что angle_current > M_PI_2
			var x = Math.sin(angle_current);
			var y = g*Math.cos(angle_current);

			if (angle_current > M_PI_2)
			{
				//  Находим точку P пересечения  
				// прямой OR с Ellipse_2
				k = y / x;	
				AA = b*b + a*a*k*k;
				BB = 2*b*b*s;
				CC = b*b*s*s - a*a*b*b;
				var x_rez, y_rez;
				if(!QuadraticEquation(AA, BB, CC, rez))
				{
					return null;
				}				
				if (rez[0] > rez[1])
					x_rez = rez[0];
				else
					x_rez = rez[1];
				y_rez = k * x_rez;
				girdle[i] = new Point2D(x_rez, y_rez);	
			}
			else
			{
				var w = Math.pow (Math.abs(x), 2) + Math.pow (Math.abs(y), 2);
				w = 1.0 / Math.pow(w, 1.0 / 2);
				girdle[i] = new Point2D(w * x, w * y * g); // ?? что лучше
				//girdle[i] = new Point2D(x, y * g);	   // ?? что лучше
			}
			angle_current = angle_current + delta;
		}

		// Вершины g16 - g32
		var ang_32 = Math.acos(s / a);
		ang_16 = DelAngGirdle_16; 
		var ang_24 = ang_32 - (ang_32 - ang_16 )/ 2.0 + DelAngGirdle_24;
		var ang_20 = ang_24 - (ang_24 - ang_16) / 2.0 + DelAngGirdle_20;
		var ang_28 = ang_32 - (ang_32 - ang_24) / 2.0 + DelAngGirdle_28;

		var j = 31;
		angle_current = Math.acos(s / a);
		for ( i = 16; i > 0; i-- )
		{
			if (i <= 4)
				delta = (ang_20 - ang_16) / 4.0;
			else if ( (i > 4) && (i <= 8) )
				delta = (ang_24 - ang_20) / 4.0;
			else if ( (i > 8) && (i <= 12) )
				delta = (ang_28 - ang_24) / 4.0;
			else
				delta = (ang_32 - ang_28) / 4.0;

			angle_current = angle_current - delta;
			girdle[j] = new Point2D();
			girdle[j][0] = a * Math.cos(angle_current) - s;
			girdle[j][1] = b * Math.sin(angle_current);
			j--;
		}
		var uuu = 10;
	}
		
	// Остальные вершины
	girdle[32] = new Point2D(0.0, -u);
	for ( i = 1; i < 32; ++ i )
	{
		girdle[i+32] = new Point2D(- girdle[32-i][0], girdle[32-i][1]);
	}

/*
//  Если сегменты на линии рундиста расставлены равномерно 
	var angle_current;
	var x, y, w;
	var bRez;

	var delta = Math.PI/32;

	// Вершины в квадранте (X > 0; Y > 0)
	angle_current = 0.0;
	for ( i = 0; i <= 16; i++ )
	{
		x = Math.sin(angle_current);
		y = Math.cos (angle_current);
		girdle[i] = new Point2D( x, y * g);
		angle_current = angle_current + delta;
	}
	
	// Вершины в квадранте (X > 0; Y < 0)
	var ang_32 = Math.acos (s / a);

	angle_current = 0;
	
	delta = ang_32/16;
	
	for ( i = 1; i < 17; i++)
	{
		angle_current = angle_current + delta;
		girdle[i+16] = new Point2D(a * Math.cos(angle_current) - s, b * Math.sin(angle_current));
	}
	girdle[32][0] = 0;
	girdle[32][1] = -u;
	
	for (i = 1; i < 32; i++)
	{
		girdle[32 + i] = new Point2D( -girdle[32 - i][0], girdle[32 - i][1] );
	}
*/
}

function lw_minus() { lw = lw - 0.05; redraw();}
function lw_plus() { lw = lw + 0.05; redraw();}

function vp_minus() 
{ 
	vp = vp - DEGREE; 
	var u = lw;
	var fi = Math.asin ( ( u + u ) / ( u * u + 1.0) );
	var psi = fi + vp;
	var t = u * Math.tan(psi);
	if ( t <= 2.0) 
	{
		vp = vp + DEGREE;
		return;	
	}				
	redraw();
}

function vp_plus() 
{ 
	vp = vp + DEGREE; 
	var u = lw;
	var fi = Math.asin ( ( u + u ) / ( u * u + 1.0) );
	var psi = fi + vp;
	var t = u * Math.tan(psi);
	if ( t <= 2.0) 
	{
		vp = vp - DEGREE;
		return;	
	}
	redraw();
}

function Lh_minus() 
{ 
	Lh = Lh - 0.01; 
	var v = lw * Lh - 0.5;
	var g = 1. + v + v;
	var u = 2*lw - g; 
	if ((g < 0) || (u < 0) )
	{
		Lh = Lh + 0.01;
		return;
	}
	redraw();
}

function Lh_plus() 
{ 
	Lh = Lh + 0.01; 
	var v = lw * Lh - 0.5;
	var g = 1. + v + v;
	var u = 2*lw - g; 
	if ((g < 0) || (u < 0) )
	{
		Lh = Lh - 0.01;
		return;
	}
	redraw();
}	

function del_gd4_minus()
{
	DelAngGirdle_4 = DelAngGirdle_4 - DEGREE;
	redraw();
}
function del_gd4_plus()
{
	DelAngGirdle_4 = DelAngGirdle_4 + DEGREE;
	redraw();
}

function del_gd8_minus()
{
	DelAngGirdle_8 = DelAngGirdle_8 - DEGREE;
	redraw();
}
function del_gd8_plus()
{
	DelAngGirdle_8 = DelAngGirdle_8 + DEGREE;
	redraw();
}

function del_gd12_minus()
{
	DelAngGirdle_12 = DelAngGirdle_12 - DEGREE;
	redraw();
}
function del_gd12_plus()
{
	DelAngGirdle_12 = DelAngGirdle_12 + DEGREE;
	redraw();
}

function del_gd16_minus()
{
	DelAngGirdle_16 = DelAngGirdle_16 - DEGREE;
	redraw();
}
function del_gd16_plus()
{
	DelAngGirdle_16 = DelAngGirdle_16 + DEGREE;
	redraw();
}

function del_gd20_minus()
{
	DelAngGirdle_20 = DelAngGirdle_20 - DEGREE;
	redraw();
}
function del_gd20_plus()
{
	DelAngGirdle_20 = DelAngGirdle_20 + DEGREE;
	redraw();
}

function del_gd24_minus()
{
	DelAngGirdle_24 = DelAngGirdle_24 - DEGREE;
	redraw();
}
function del_gd24_plus()
{
	DelAngGirdle_24 = DelAngGirdle_24 + DEGREE;
	redraw();
}

function del_gd28_minus()
{
	DelAngGirdle_28 = DelAngGirdle_28 - DEGREE;
	redraw();
}
function del_gd28_plus()
{
	DelAngGirdle_28 = DelAngGirdle_28 + DEGREE;
	redraw();
}

function draw_girdle()
{
	var i;

	// закраска области внутри рундиста
	fill_polygon(ctx, girdle, 64, '#dfe');

	// рисуем рундист
	for (i = 0; i < 63; i++)
	{
		line_segment(ctx, girdle[i], girdle[i+1], 1, "B");
	}			
	line_segment(ctx, girdle[63], girdle[0], 1, "B");
	
	// текст и вершины
	
	for (i = 0; i < 64; i = i + 1)
	{
		if ( (i == 0) ||  (i == 4)  ||  (i == 8) || (i == 12) || (i == 16) || (i == 20) ||
			 (i == 24) || (i == 28) || (i == 32) || (i == 36) || (i == 40) ||
			 (i == 44) || (i == 48) || (i == 52) || (i == 56) || (i == 60) )
		{
			csp(ctx, girdle[i], 5, "B");
		}
		else
		{
			csp(ctx, girdle[i], 3, "B");
		}
	}		
	
	text2(ctx, "0", girdle[0], "md", "up", "B");
	text2(ctx, "4", girdle[4], "rt", "up", "B");
	text2(ctx, "8", girdle[8], "rt", "md", "B");
	text2(ctx, "12", girdle[12], "rt", "md", "B");
	text2(ctx, "16", girdle[16], "rt", "md", "B");
	text2(ctx, "20", girdle[20], "rt", "md", "B");
	text2(ctx, "24", girdle[24], "rt", "md", "B");
	text2(ctx, "28", girdle[28], "rt", "md", "B");
	text2(ctx, "32", girdle[32], "md", "dn", "B");
	
	text1(ctx, "36", girdle[36], "lt", "md", "B");
	text1(ctx, "40", girdle[40], "lt", "md", "B");
	text1(ctx, "44", girdle[44], "lt", "md", "B");
	text1(ctx, "48", girdle[48], "lt", "md", "B");
	text1(ctx, "52", girdle[52], "lt", "md", "B");
	text1(ctx, "56", girdle[56], "lt", "md", "B");
	text1(ctx, "60", girdle[60], "lt", "up", "B");
}
	
function construction()	
{
	axes(ctx, 7, 7.0, 0.8, "Brown");
	
	var O = [0,0];
	rsp(ctx, O, 5, "R");
	text1(ctx, "O", O, "lt", "up", "R");
	
	var s = (u * u - 1)/2;
	var A = [-s,0];	
	rsp(ctx, A, 5, "R");
	text1(ctx, "A", A, "lt", "up", "R");
	
	var C = [1,0];
	rsp(ctx, C, 5, "R");
	text1(ctx, "C", C, "lt", "up", "R");
	
	var O1 = [C[0] - a, 0];
	rsp(ctx, O1, 5, "R");
	text1(ctx, "O1", O1, "md", "up", "R");
	
	var text_ellipse_1 = [O1[0], -b];
	text1(ctx, "ellipse 1", text_ellipse_1, "lt", "up", "Black");
	
	var O2 = [-C[0] + a, 0];
	rsp(ctx, O2, 5, "R");
	text1(ctx, "O2", O2, "md", "up", "R");
	
	var text_ellipse_2 = [O2[0], -b];
	text1(ctx, "ellipse 2", text_ellipse_2, "rt", "up", "Black");
	
	var text_ellipse_3 = [0, -girdle[0][1]];
	text1(ctx, "ellipse 3", text_ellipse_3, "md", "up", "Black");
	
	var B = [0, -u];
	rsp(ctx, B, 5, "R");
	text1(ctx, "B", B, "md", "up", "R");	
	
	a = Math.abs(a);
	b = Math.abs(b);
	drawEllipse(ctx, O1[0], O1[1], a, b, 0.8, "Black");
	drawEllipse(ctx, O2[0], O2[1], a, b, 0.8, "Black");	
	
	var bb = girdle[0][1];
	var aa = girdle[16][0];
	drawEllipse(ctx, 0, 0, 1.0, g, "Black");
	
	// Рисуем окружность
	circle(ctx, new Point2D(-s, 0), s + 1, 1, "Black");
	var text_circle = [-s, s+1];
	text1(ctx, "circle", text_circle, "rt", "up", "Black");
	
	var M = [t, 0];
	rsp(ctx, M, 4, "R");
	text1(ctx, "M", M, "md", "up", "R");

	line(ctx, M, B, -15, 10, 0.5, "Black");
	line(ctx, A, B, 0.0, 2.0, 0.5, "Black");

	var ln_A_B = new Line2D(A, B);
	var ln_A_B_n = ln_A_B.CreateNormalLinePoint(B);
	var line_X = new Line2D(new Point2D(-3, 0), new Point2D(3, 0));
	var F = ln_A_B_n.IntersectionTwoLines(line_X);
	rsp(ctx, F, 4, "R");
	text1(ctx, "F", F, "md", "dn", "R");
	line(ctx, B, F, -15, 10, 0.5, "Black"); // прямая BF
	
	// angles
	var s_fi = String.fromCharCode(966);
	var s_psi = String.fromCharCode(968);	
	var s_vp = String.fromCharCode(948);
	var s_gamma = String.fromCharCode(947);
	
	var r = 1.2;
	var fi = Math.PI/2 - Math.asin(u/(s+1)); // угол с осью OX
	draw_angle_txt(ctx, B, fi, Math.PI/2, r, s_fi, "md", "up", 1, "R");
	draw_angle(ctx, B, fi, Math.PI/2, r - 0.03, 1, "R");
	
	r = 2.7;
	var psi = Math.PI/2 - (Math.asin(u/(s+1)) + vp); // угол с осью OX
	draw_angle_txt(ctx, B, psi, Math.PI/2, r, s_psi, "md", "up", 1, "R");
	draw_angle(ctx, B, psi, Math.PI/2, r - 0.03, 1, "R");
	
	r = 4.2;
	var ang1 = (Math.PI/2 -  Math.asin(u/(s+1)));
	var ang2 = (Math.PI/2 - (Math.asin(u/(s+1)) + vp))	
	if (vp >= 0)
	{
		draw_angle_txt(ctx, B, ang2, ang1, r, s_vp, "rt", "md", 1, "R");
		draw_angle(ctx, B, ang2, ang1, r - 0.05, 4, "G");
	}
	else 
	{
		draw_angle_txt(ctx, B, ang1, ang2, r, s_vp, "rt", "md", 1, "R");
		draw_angle(ctx, B, ang1, ang2, r - 0.05, 4, "G");
	}
	
	line_segment(ctx, new Point2D(-2, girdle[0][1]), girdle[0], 0.5, "Black");
	segment_two_arrow(ctx, new Point2D(-2, girdle[0][1]), new Point2D(-2, 0), 0.5, 0.2, "Black");
	text1(ctx, "g", new Point2D(-2, girdle[0][1]/2), "lt", "md", "Black");
	
	line_segment(ctx, new Point2D(-2, B[1]), B, 0.3, "Black");
	segment_two_arrow(ctx, new Point2D(-2, B[1]), new Point2D(-2, 0), 0.3, 0.2, "Black");
	text1(ctx, "u", new Point2D(-2, B[1]/2), "lt", "md", "Black");
	
	line_segment(ctx, M, new Point2D(M[0], -3.5), 0.3, "Black");
	segment_two_arrow(ctx, new Point2D(0, -3.5),  new Point2D(M[0], -3.5), 0.3, 0.2, "Black");
	text1(ctx, "t", new Point2D(1.0, -3.5), "md", "up", "Black");
	
	line_segment(ctx, A, new Point2D(A[0], -3.5), 0.3, "Black");
	segment_two_arrow(ctx, new Point2D(0, -3.5),  new Point2D(A[0], -3.5), 0.3, 0.2, "Black");
	text1(ctx, "s", new Point2D(A[0]/2, -3.5), "md", "up", "Black");
	
	text1(ctx, "1.0", C, "lt", "dn", "Black");
	
	line_segment(ctx, O2, new Point2D(O2[0], 5.0), 0.3, "Black");
	line_segment(ctx, new Point2D(O2[0] + a, 0), new Point2D(O2[0] + a, 5.0), 0.3, "Black");
	segment_two_arrow(ctx, new Point2D(O2[0], 3),  new Point2D(O2[0] + a, 3), 0.3, 0.2, "Black");
	text1(ctx, "a", new Point2D(O2[0] + a/2, 3), "md", "up", "Black");
	
	line_segment(ctx, new Point2D(O2[0], -b), new Point2D(O2[0] + 5, -b), 0.3, "Black");
	segment_two_arrow(ctx, new Point2D(O2[0] + 3, -b),  new Point2D(O2[0] + 3, 0), 0.3, 0.2, "Black");
	text1(ctx, "b", new Point2D(O2[0] + 3, -b/2), "lt", "md", "Black");
}
			
function pars_value()
{
	ctx.font = "italic 10pt Arial";
	
	var text = "Girdle ratio (lw)";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 35);		
	text = roundNumber(lw, 2);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 35);	
	
	var s_vp = String.fromCharCode(948); // δ
	var text_ang = s_vp + "( " + String.fromCharCode(8736) + " MBF" + " )";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_ang, 5, 55);	
	text = roundNumber(Math.degrees(vp), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 55);
	
	var text = "Lh";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 75);		
	text = roundNumber(Lh, 2);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 75);	
	
	text = "AB " + String.fromCharCode(8869) + " BF";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 2, 110);	

	text = "BF  " + "- касательная к  окружности circle в точке B";
	ctx.fillText(text, 2, 140);

	text = "BM  " + "- касательная к эллипсу ellipse 1 в точке B";
	ctx.fillText(text, 2, 170);		
	
	var s_fi = String.fromCharCode(966);
	var s_psi = String.fromCharCode(968);
	text = s_psi + " = " + s_fi + " + " + s_vp;
	ctx.fillText(text, 2, 200);		
	
	
	var text = "Delta girdle 4 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 335);		
	text = roundNumber(Math.degrees(DelAngGirdle_4), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 335);
	
	var text = "Delta girdle 8 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 355);		
	text = roundNumber(Math.degrees(DelAngGirdle_8), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 355);
	
	var text = "Delta girdle 12 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 375);		
	text = roundNumber(Math.degrees(DelAngGirdle_12), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 375);
	
	var text = "Delta girdle 16 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 395);		
	text = roundNumber(Math.degrees(DelAngGirdle_16), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 395);
	
	var text = "Delta girdle 20 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 415);		
	text = roundNumber(Math.degrees(DelAngGirdle_20), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 415);
	
	var text = "Delta girdle 24 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 435);		
	text = roundNumber(Math.degrees(DelAngGirdle_24), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 435);
	
	var text = "Delta girdle 28 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 455);		
	text = roundNumber(Math.degrees(DelAngGirdle_28), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 120, 455);
}	

function redraw()
{
	ctx.clearRect(0, 0, 1200, 800);
	init_girdle();
	draw_girdle();
	construction();		
	pars_value();
}
	
function Btn (name, where, left, top )
{
	this.name = name;
	this.name = document.createElement('input');
	this.name.type = 'button';
	this.name.value = name;
	this.id = gui_container1.appendChild(this.name);
	this.id.style = "position: absolute";
	this.id.style.background='#bbbbbb';
	this.id.style.top = top;
	this.id.style.left = left;
	this.id.style.width = "30px";
	this.id.style.cursor = "pointer";
}	

function Btn2 (name, where, left, top )
{
	this.name = name;
	this.name = document.createElement('input');
	this.name.type = 'button';
	this.name.value = name;
	this.id = out_girdle_01.appendChild(this.name);
	this.id.style = "position: absolute";
	this.id.style.background="rgba(200, 200, 220, 0.5)";
	this.id.style.top = top;
	this.id.style.left = left;
	this.id.style.width = "30px";
	this.id.style.cursor = "pointer";
}

function AddButtons()
{
	btn_lw_minus = new Btn2("-", "lw_minus", "152px", "20px" );
	btn_lw_plus = new Btn2("+", "lw_plus", "182px", "20px" );
	btn_lw_minus.name.addEventListener("click", lw_minus);
	btn_lw_plus.name.addEventListener("click", lw_plus);			

	btn_vp_minus = new Btn2("-", "button", "152px", "40px" );
	btn_vp_plus = new Btn2("+", "button", "182px", "40px" );
	btn_vp_minus.name.addEventListener("click", vp_minus);
	btn_vp_plus.name.addEventListener("click", vp_plus);
	
	btn_Lh_minus = new Btn2("-", "button", "152px", "60px" );
	btn_Lh_plus = new Btn2("+", "button", "182px", "60px" );
	btn_Lh_minus.name.addEventListener("click", Lh_minus);
	btn_Lh_plus.name.addEventListener("click", Lh_plus);
	///////////////////////////////////////////////////////
	btn_gd4_minus = new Btn2("-", "button", "152px", "320px" );
	btn_gd4_plus = new Btn2("+", "button", "182px", "320px" );
	btn_gd4_minus.name.addEventListener("click", del_gd4_minus);
	btn_gd4_plus.name.addEventListener("click", del_gd4_plus);
	
	btn_gd8_minus = new Btn2("-", "button", "152px", "340px" );
	btn_gd8_plus = new Btn2("+", "button", "182px", "340px" );
	btn_gd8_minus.name.addEventListener("click", del_gd8_minus);
	btn_gd8_plus.name.addEventListener("click", del_gd8_plus);	
	
	btn_gd12_minus = new Btn2("-", "button", "152px", "360px" );
	btn_gd12_plus = new Btn2("+", "button", "182px", "360px" );
	btn_gd12_minus.name.addEventListener("click", del_gd12_minus);
	btn_gd12_plus.name.addEventListener("click", del_gd12_plus);		
	
	btn_gd16_minus = new Btn2("-", "button", "152px", "380px" );
	btn_gd16_plus = new Btn2("+", "button", "182px", "380px" );
	btn_gd16_minus.name.addEventListener("click", del_gd16_minus);
	btn_gd16_plus.name.addEventListener("click", del_gd16_plus);

	btn_gd20_minus = new Btn2("-", "button", "152px", "400px" );
	btn_gd20_plus = new Btn2("+", "button", "182px", "400px" );
	btn_gd20_minus.name.addEventListener("click", del_gd20_minus);
	btn_gd20_plus.name.addEventListener("click", del_gd20_plus);

	btn_gd24_minus = new Btn2("-", "button", "152px", "420px" );
	btn_gd24_plus = new Btn2("+", "button", "182px", "420px" );
	btn_gd24_minus.name.addEventListener("click", del_gd24_minus);
	btn_gd24_plus.name.addEventListener("click", del_gd24_plus);	
	
	btn_gd28_minus = new Btn2("-", "button", "152px", "440px" );
	btn_gd28_plus = new Btn2("+", "button", "182px", "440px" );
	btn_gd28_minus.name.addEventListener("click", del_gd28_minus);
	btn_gd28_plus.name.addEventListener("click", del_gd28_plus);	
}
	
function AddButtonsPositionSize()
{
	btn_Xminus = new Btn("◄", "button", "730px", "25px" );
	btn_Xminus.id.style.width = "30px";
	btn_Xminus.id.style.height = "25px";
	btn_Xminus.id.style.fontSize = "16px";
	btn_Xminus.id.style.opacity = "0.7";
	
	btn_Xplus = new Btn("►", "button", "800px", "25px" );
	btn_Xplus.id.style.width = "30px";
	btn_Xplus.id.style.height = "25px";
	btn_Xplus.id.style.fontSize = "16px";
	btn_Xplus.id.style.opacity = "0.7";

	
	btn_Xplus.name.addEventListener("click", posX_minus);
	btn_Xminus.name.addEventListener("click", posX_plus);	
	
	btn_Yplus = new Btn("▲", "button", "765px", "8px" );
	btn_Yplus.id.style.width = "30px";
	btn_Yplus.id.style.height = "30px";
	btn_Yplus.id.style.fontSize = "16px";
	btn_Yplus.id.style.opacity = "0.7";
	
	btn_Yminus = new Btn("▼", "button", "765px", "42px" );
	btn_Yminus.id.style.width = "30px";
	btn_Yminus.id.style.height = "30px"
	btn_Yminus.id.style.fontSize = "16px";
	btn_Yminus.id.style.opacity = "0.7";
	
	btn_Yplus.name.addEventListener("click", posY_minus);
	btn_Yminus.name.addEventListener("click", posY_plus);	
	
	btn_size_plus = new Btn("Scale +", "button", "250px", "20px" );
	btn_size_plus.id.style.width = "90px";
	btn_size_plus.id.style.height = "40px";
	btn_size_plus.id.style.fontSize = "24px";
	btn_size_plus.id.style.opacity = "0.7";
	
	btn_size_minus = new Btn("Scale -", "button", "350px", "20px" );
	btn_size_minus.id.style.width = "90px";
	btn_size_minus.id.style.height = "40px"
	btn_size_minus.id.style.fontSize = "24px";
	btn_size_minus.id.style.opacity = "0.7";
	
	btn_size_plus.name.addEventListener("click", sizeGD_plus);
	btn_size_minus.name.addEventListener("click", sizeGD_minus);		
}	

function posX_minus()
{
	xC = xC + 5;
	redraw();
}

function posX_plus()
{
	xC = xC - 5;
	redraw();
}

function posY_minus()
{
	yC = yC - 5;
	redraw();
}

function posY_plus()
{
	yC = yC + 5;
	redraw();
}

function sizeGD_plus()
{
	var delta = 1;
	SCALE = SCALE + 5 * delta; 
	redraw();
}

function sizeGD_minus()
{
	var delta = 1;
	SCALE = SCALE - 5 * delta;
	redraw();
}
		
function mouse_move(event)
{	
	event.preventDefault();
	ctx.clearRect(460, 10, 100, 20);
	var elem1 = document.getElementById('canvas_01');
	var coords = elem1.getBoundingClientRect();
	
	// координаты мыши на холсте 
	x_mouse = event.clientX - coords.left;
	y_mouse = event.clientY - coords.top;	
	
	// координаты мыши на холсте пересчитаны 
	// в координаты используемые в webgeometry
	x_mouse = (x_mouse - xC)/SCALE;
	y_mouse = (yC - y_mouse)/SCALE;
	
	var x_text = roundNumber(x_mouse, 3);
	var y_text = roundNumber(y_mouse, 3);
	var xy_text = "(" + x_text + ", " + y_text + ")";
	
	ctx.font = "italic 10pt Arial";
	ctx.fillStyle = '#ff00ff';
	ctx.fillText(xy_text, 460, 20);	
	
	// для проверки 
	//rsp(ctx, new Point2D(x_mouse, y_mouse), 4, "G");
}
		
addEventListener("load", initiate);
	