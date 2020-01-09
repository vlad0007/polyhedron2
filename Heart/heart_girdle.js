var DEGREE = 0.01745329251994;
var M_PI = 3.14159265358979323846;


var vp = 9.0*DEGREE;  //  Угол, определяющий степень отклонения 
	 // кривой Ellipse_2 от окружности (см. парметры огранки груша)
var pearRt = 1.8; // Задает отношение длина/ширина для груши
var lambda = 20.0*DEGREE; // Задает угол наклона груши
//var lambda = 0.0*DEGREE; // Задает угол наклона груши
var Lh = 0.289;     // Отклонение смещения самого широкого места груши

//  Следующие восемь параметров определяют положение узловых вершин 
// на рундисте огранки:  6, 12, 18, 26, 34, 38, 42 и 46. 
var DelAngGirdle_6 = 0;  
var DelAngGirdle_12 = 0; 
var DelAngGirdle_18 = 0;  
var DelAngGirdle_26 = 0; 
var DelAngGirdle_34 = 0; 
var DelAngGirdle_38 = 0; 
var DelAngGirdle_42 = 0; 
var DelAngGirdle_46 = 0; 

var a, b, s, q, t, u, v, g, gamma, fi, psi;
var lambda_str = String.fromCharCode(955);

var ctx;
var btn_lambda_minus, btn_lambda_plus;
var btn_lw_plus, btn_lw_minus; 
var btn_vp_minus, btn_vp_plus;
var btn_Lh_minus, btn_Lh_plus;
var btn_pearRt_minus, btn_pearRt_plus;

var btn_DelAngGirdle_6_minus, btn_DelAngGirdle_6_plus;
var btn_DelAngGirdle_12_minus, btn_DelAngGirdle_12_plus;
var btn_DelAngGirdle_18_minus, btn_DelAngGirdle_18_plus;
var btn_DelAngGirdle_26_minus, btn_DelAngGirdle_26_plus;
var btn_DelAngGirdle_34_minus, btn_DelAngGirdle_34_plus;
var btn_DelAngGirdle_38_minus, btn_DelAngGirdle_38_plus;
var btn_DelAngGirdle_42_minus, btn_DelAngGirdle_42_plus;
var btn_DelAngGirdle_46_minus, btn_DelAngGirdle_46_plus;

var canvas;

// координаты мыши
var x_mouse, y_mouse;

var xC; // Centre x
var yC; // Centre y
var SCALE;  // SCALE

var girdle = [100];
var girdle2 = [54];

function initiate()
{					
	var elem1 = document.getElementById('canvas_01');

	SCALE = 230;
	xC = elem1.width / 2;
	yC = elem1.height / 2 - 80;
	
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
	// Полагаем, что Lh = 1 / (2*pRt)
	// Из этого предположения следует:
	//    g = 2 * pRt * Lh = 1
	//    u = 2 * pRt * (1 - Lh) = 2*pRt - 1

	var i;
	// Переменные A, B и C определяют уравнение A*x + B*y + C = 0
	var A, B, C;
	var angle_current, delta, x, y, x_rez, y_rez;
	var rez = [2];
	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0) 
		return null;
	var u = 2*pearRt - g;
	if (u < 0)
		return null;
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2) 
		return null;
	var t = u * Math.tan(psi);
	if (t <= 2) 
		return null;
	// Величины a и b - полуоси эллипса
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );

	if ( (Math.sin(lambda) * u) > 1 ) 
		return null;
	// Начальное и конечное значение углов определяющих дуги эллипсов
	var Start, Finish;
	Start = - lambda - Math.PI/2 + Math.acos(Math.sin(lambda) * u );
	Finish = lambda / 2 + DelAngGirdle_18; 
	girdle2[0] = new Point2D(Math.sin(Start), g * Math.cos(Start));

	var del_ang = (Finish - Start) / 3.0;
	var g0 = Start;
	var g6 = Start + del_ang + DelAngGirdle_6;
	var g12 = Start + del_ang + del_ang + DelAngGirdle_12;
	var g18 = Finish;

	Fill_Arc_Ellipse(0, 6, Start, (g6 - g0) / 6, g);
	Fill_Arc_Ellipse(0+6, 6, g6, (g12 - g6) / 6, g);
	Fill_Arc_Ellipse(0+6+6, 6, g12, (g18 - g12) / 6, g);

	Start = Finish;  // Начало двух восьмиэлементных сегментов
	Finish = Math.PI/2 + DelAngGirdle_26 * Math.acos(s / a); // значение угла, где кончаются два 8-элементных сегмента

	var ang_down = Math.acos(s / a);
	var ang_down_gr = 180 * ang_down / Math.PI;

	if (DelAngGirdle_34 <= 0.0)
	{
		// Смещение вершины рундиста в сторону Ellipse_1
		var ang_0_34 = Math.PI/2 + DelAngGirdle_34;
		var E = new Point2D(Math.sin(ang_0_34), Math.cos(ang_0_34));
		var alpha = Math.atan2(E[1], (E[0] + s));
		var ang_34_50 = ang_down + alpha;
		var ang_34_50_gr = 180 * ang_34_50 / Math.PI;

		// Вершины рундиста лежащие на Ellipse_1
		Finish = Start + (ang_0_34 - Start) / 2.0 + DelAngGirdle_26;
		del_ang = (Finish - Start) / 8.0;

		Fill_Arc_Ellipse(18, 8, Start, del_ang, g);

		Start = Finish;
		Finish = ang_0_34;
		del_ang = (Finish - Start) / 8.0;

		Fill_Arc_Ellipse(26, 8, Start, del_ang, g);

		Start = Finish;
		del_ang = ang_34_50 / 4.0;

		var g34 = Start;
		var g38 = Start + del_ang + DelAngGirdle_38;
		var g42 = Start + del_ang + del_ang + DelAngGirdle_42;
		var g46 = Start + del_ang + del_ang + del_ang + DelAngGirdle_46;
		var g50 = Start + ang_34_50;

		// Вершины рундиста лежащие на Ellipse_2
		var j = 49;
		angle_current = Math.acos (s / a);
		var gr_angle_current = angle_current * 180.0 / Math.PI;

		for ( i = 15; i > 0; i-- )
		{
			if (i < 4)
				delta = (g38 - g34) / 4;
			else if (i < 8)
				delta = (g42 - g38) / 4;
			else if (i < 12)
				delta = (g46 - g42) / 4;
			else
				delta = (g50 - g46) / 4;

			angle_current = angle_current - delta;
			var angle_current_gr = 180 * angle_current / Math.PI;
			if (angle_current <= 0)
			{
				x = a * Math.cos(angle_current) - s;
				y = b * Math.sin(angle_current);
				
				// k - угловой коэффициент прямой
				var k = y/(x+s);
				//  Находим координаты точки,
				// лежащей на пересечении прямой с Ellipse_1
				A = g*g + k*k;
				B = 2*k*k*s;
				C = s*s*k*k - g*g;
				// x_rez и x_yez - координаты точки пересечения
				bRez = QuadraticEquation(A, B, C, rez);
				if (rez[0] > rez[1])
					x_rez = rez[0];
				else
					x_rez = rez[1];
				y_rez = (x_rez + s)*k;
		
				girdle2[j] = new Point2D(x_rez, y_rez);
				j--;
			}
			else
			{
				girdle2[j] = new Point2D(a * Math.cos(angle_current) - s, b * Math.sin (angle_current));
				j--;
			}
		}
		// Остальные вершины
		girdle2[50] = new Point2D(0, - u);
	}
	else
	{
		// Смещение вершины рундиста в сторону носика сердца
		// DelAngGirdle_34 > 0.0
		var N = new Point2D(a * Math.cos(DelAngGirdle_34) - s, b * Math.sin(DelAngGirdle_34)); 

		// Находим точку M пересечения прямой ON с Ellipse_1
		var k = N[1]/N[0];
		var crown_angle = Math.atan2(-N[1], N[0]);

		var ang_0_34 = Math.PI/2 + crown_angle;
		var ang_34_50 = ang_down - DelAngGirdle_34;

		// Вершины рундиста лежащие на Ellipse_1
		Finish = Start + (ang_0_34 - Start) / 2.0 + DelAngGirdle_26;
		del_ang = (Finish - Start) / 8.0;

		Fill_Arc_Ellipse(18, 8, Start, del_ang, g);

		Start = Finish;
		Finish = ang_0_34;
		del_ang = (Finish - Start) / 8.0;

		for ( i = 1; i <= 8; ++ i )
		{
			if ( (Start + i * del_ang) > Math.PI/2)
			{
				var x = Math.sin(Start + i * del_ang);	// B2[0]
				var y = Math.cos(Start + i * del_ang);	// B2[1]
				var k = y / x;

				b = - b;

				A = b*b + a*a*k*k;
				B = 2*b*b*s;
				C = s*s*b*b - a*a*b*b;

				bRez = QuadraticEquation(A, B, C, rez);
				b = - b;

				var x_rez;
				if (rez[0] > rez[1])
					x_rez = rez[0];
				else
					x_rez = rez[1];

				var y_rez = k * x_rez;

				girdle2[26+i] = new Point2D(x_rez, y_rez);
			}
			else
			{
				girdle2[26+i] = new Point2D (Math.sin(Start + i*del_ang), g * Math.cos(Start + i*del_ang));
			}
		}

		Start = Math.PI/2 - crown_angle;
		del_ang = ang_34_50 / 4.0;
		var g34 = Start;
		var g38 = Start + del_ang + DelAngGirdle_38;
		var g42 = Start + del_ang + del_ang + DelAngGirdle_42;
		var g46 = Start + del_ang + del_ang + del_ang + DelAngGirdle_46;
		var g50 = Start + ang_34_50;

		// Вершины рундиста лежащие на Ellipse_2
		var j = 49;
		angle_current = Math.acos(s / a);
		for ( i = 15; i > 0; i-- )
		{
			if (i < 4)
				delta = (g38 - g34) / 4;
			else if (i < 8)
				delta = (g42 - g38) / 4;
			else if (i < 12)
				delta = (g46 - g42) / 4;
			else
				delta = (g50 - g46) / 4;

			angle_current = angle_current - delta;
			girdle2[j] = new Point2D(a * Math.cos(angle_current) - s,
									 b * Math.sin(angle_current));
			j--;
		}
		// Остальные вершины
		girdle2[50] = new Point2D(0, -u);
	}

	// Определяем координаты трех специальных точек рундиста.
	// Сдвиг по Y для центрирования груши
	var pt = new Point2D(0, g);
	var CenterOffset = g - pt[1];

//   51 - образ центра груши
//   52 - крайняя правая точка (максимальное значение x)
//   53 - крайняя верхняя точка (максимальное значение y)

	girdle2[51] = new Point2D (0, -CenterOffset);
//	girdle2[52] = new Point2D (sin(Math.PI/2 - lambda), g * cos(Math.PI/2 - lambda));
	girdle2[52] = new Point2D (Math.cos(lambda), g * Math.sin(lambda));
//	girdle2[53] = new Point2D (sin(-lambda), g * cos(-lambda));
	girdle2[53] = new Point2D (-Math.sin(lambda), g * Math.cos(lambda));
	
	// Вершина pPoint[0] определяет точку, где наинизшее значение выреза
	var v0 = new Vector2D(girdle2[0][0] - girdle2[50][0], girdle2[0][1] - girdle2[50][1]);
	v0.Normer();
	// NX и NY новые векторы координатных осей, в которых будем отображать огранку на экране
	// Рисунок 5.7 показывает направление этих осей.
	var NX = new Vector2D(v0[1], -v0[0]);
	var NY = new Vector2D(v0[0], v0[1]);

	// Dot - скалярное произведение векторов
	// Вспомогательные векторы для нахождения смещения точек рундиста
	var vStart = new Vector2D(girdle2[50][0], girdle2[50][1]);
	var vec = new Vector2D(vStart[0] - girdle2[52][0], vStart[1] - girdle2[52][1]);
	var scalar = NY.Dot(vec);
	var vTarget = new Vector2D( vStart[0], scalar );

	// Значения величины смещения точек рундиста
	var displ_x = vTarget[0] - NX.Dot(vStart);
	var displ_y = vTarget[1] - NY.Dot(vStart);

	//  Проходим по всем точкам рундиста и определяем проекции 
	// координат x и у каждой точки рундиста на оси NX и NY.
	//  Таким образом находим координаты точек рундиста в повернутой
	// системе координат направление осей которой задается векторами NX и NY.
	for (i = 0; i < 54; i++)
	{
		girdle2[i] = new Point2D( NX.Dot(new Vector2D(girdle2[i][0], girdle2[i][1])) + displ_x,
								  NY.Dot(new Vector2D(girdle2[i][0], girdle2[i][1])) + displ_y );
	}

	//  В отличие от большинства других огранок ширина огранки сердце измеряется по оси OX,
	// а длина огранки измеряется вдоль оси OY.
	// При изменении Girdle Ratio ширина огранки остается постоянной.
	// Находим коэффициент нормировки ширины и высоты сердца в горизонтальной плоскости
	// Ширина сердца (по оси OX) дллжна быть равна величине 2 * 0.5
	// Исходя из расчета рундиста получили ширину сердца равным величине 2 * girdle2[52][0]
	// Поэтому коэффициент нормировки размеров сердца в горизонтальной плоскости равен:
	var kf = 0.5 / girdle2[52][0];

	girdle[0] = new Point2D(girdle2[0][0] * kf, girdle2[0][1] * kf);
	girdle[50] = new Point2D(girdle2[50][0] * kf, girdle2[50][1] * kf);

	for (i = 1; i < 50; i++)
	{
		girdle[i] = new Point2D(girdle2[i][0] * kf, girdle2[i][1] * kf);
		girdle[100-i] = new Point2D(- girdle2[i][0] * kf, girdle2[i][1] * kf);
	}
	
	// pt_Ymax[0] = kf * girdle2[53][0];	
	// pt_Ymax[1] = kf * girdle2[53][1];
}

// вспомогательная функция используемая при разбиении рундиста на сегменты
function Fill_Arc_Ellipse (n_begin, n_points, Start, Step, step)
{
	// n_begin - номер первой вершины
	// n_points - количество вершин
	var i;
	for (i = 1; i <= n_points; i++)
	{
		var angle = Start + Step * i;
		girdle2[i + n_begin] = new Point2D(Math.sin(angle), step * Math.cos(angle));
	}
}

// обработчики событий кнопок изменяющих форму рундиста огранки
function lambda_minus()	
{ 
	lambda = lambda - 0.5*DEGREE; 
	
	if (lambda < 0)
	{
		lambda = lambda + 0.5*DEGREE;
		return;
	}
	
	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0)
	{
		lambda = lambda + 0.5*DEGREE;
		return;
	}
	var u = 2*pearRt - g;
	if (u < 0)
	{
		lambda = lambda + 0.5*DEGREE;
		return;
	}
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2)
	{
		lambda = lambda + 0.5*DEGREE;
		return;
	}
	var t = u * Math.tan(psi);
	if (t <= 2) 
	{
		lambda = lambda + 0.5*DEGREE;
		return;
	}
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );
	if ( (Math.sin(lambda) * u) > 1 )
	{
		lambda = lambda + 0.5*DEGREE;
		return;
	}
	redraw();
}

function lambda_plus()	
{ 
	lambda = lambda + 0.5*DEGREE; 
	
	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0)
	{
		lambda = lambda - 0.5*DEGREE;
		return;
	}
	var u = 2*pearRt - g;
	if (u < 0)
	{
		lambda = lambda - 0.5*DEGREE;
		return;
	}
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2)
	{
		lambda = lambda - 0.5*DEGREE;
		return;
	}
	var t = u * Math.tan(psi);
	if (t <= 2) 
	{
		lambda = lambda - 0.5*DEGREE;
		return;
	}
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );
	if ( (Math.sin(lambda) * u) > 1 )
	{
		lambda = lambda - 0.5*DEGREE;
		return;
	}
	
	redraw();
}
	
function vp_minus() 
{ 
	vp = vp - DEGREE;

	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0)
	{
		vp = vp + DEGREE;
		return;
	}
	var u = 2*pearRt - g;
	if (u < 0)
	{
		vp = vp + DEGREE;
		return;
	}
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2)
	{
		vp = vp + DEGREE;
		return;
	}
	var t = u * Math.tan(psi);
	if (t <= 2) 
	{
		vp = vp + DEGREE;
		return;
	}
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );
	if ( (Math.sin(lambda) * u) > 1 )
	{
		vp = vp + DEGREE;
		return;
	}
	redraw();
}

function vp_plus() 
{ 
	vp = vp + DEGREE; 
	
	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0)
	{
		vp = vp - DEGREE;
		return;
	}
	var u = 2*pearRt - g;
	if (u < 0)
	{
		vp = vp - DEGREE;
		return;
	}
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2)
	{
		vp = vp - DEGREE;
		return;
	}
	var t = u * Math.tan(psi);
	if (t <= 2) 
	{
		vp = vp - DEGREE;
		return;
	}
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );
	if ( (Math.sin(lambda) * u) > 1 )
	{
		vp = vp - DEGREE;
		return;
	}
	redraw();
}

function Lh_minus() 
{ 
	Lh = Lh - 0.01; 

	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0)
	{
		Lh = Lh + 0.01; 
		return;
	}
	var u = 2*pearRt - g;
	if (u < 0)
	{
		Lh = Lh + 0.01; 
		return;
	}
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2)
	{
		Lh = Lh + 0.01; 
		return;
	}
	var t = u * Math.tan(psi);
	if (t <= 2) 
	{
		Lh = Lh + 0.01;
		return;
	}
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );
	if ( (Math.sin(lambda) * u) > 1 )
	{
		Lh = Lh + 0.01; 
		return;
	}
	redraw();
}

function Lh_plus() 
{ 
	Lh = Lh + 0.01; 
	
	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0)
	{
		Lh = Lh - 0.01; 
		return;
	}
	var u = 2*pearRt - g;
	if (u < 0)
	{
		Lh = Lh - 0.01;
		return;
	}
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2)
	{
		Lh = Lh - 0.01; 
		return;
	}
	var t = u * Math.tan(psi);
	if (t <= 2) 
	{
		Lh = Lh - 0.01;
		return;
	}
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );
	if ( (Math.sin(lambda) * u) > 1 )
	{
		Lh = Lh - 0.01; 
		return;
	}			
	redraw();
}	

function pearRt_minus()	
{ 
	pearRt = pearRt - 0.05; 
	
	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0)
	{
		pearRt = pearRt + 0.05;
		return;
	}
	var u = 2*pearRt - g;
	if (u < 0)
	{
		pearRt = pearRt + 0.05; 
		return;
	}
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2)
	{
		pearRt = pearRt + 0.05;
		return;
	}
	var t = u * Math.tan(psi);
	if (t <= 2) 
	{
		pearRt = pearRt + 0.05;
		return;
	}
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );
	if ( (Math.sin(lambda) * u) > 1 )
	{
		pearRt = pearRt + 0.05;
		return;
	}				
	
	
	redraw();
}	

function pearRt_plus()	
{ 
	pearRt = pearRt + 0.05; 
	
	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;
	var g = 1. + v + v;
	if (g < 0)
	{
		pearRt = pearRt - 0.05;
		return;
	}
	var u = 2*pearRt - g;
	if (u < 0)
	{
		pearRt = pearRt - 0.05; 
		return;
	}
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
	if (psi >= Math.PI/2)
	{
		pearRt = pearRt - 0.05;
		return;
	}
	var t = u * Math.tan(psi);
	if (t <= 2) 
	{
		pearRt = pearRt - 0.05;
		return;
	}
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );
	if ( (Math.sin(lambda) * u) > 1 )
	{
		pearRt = pearRt - 0.05;
		return;
	}							
	
	redraw();
}		

function DelAngGirdle_6_minus()	
{ 
	DelAngGirdle_6 = DelAngGirdle_6 - DEGREE; 
	redraw();
}	
function DelAngGirdle_6_plus()	
{ 
	DelAngGirdle_6 = DelAngGirdle_6 + DEGREE; 
	redraw();
}		

function DelAngGirdle_12_minus()	
{ 
	DelAngGirdle_12 = DelAngGirdle_12 - DEGREE; 
	redraw();
}	
function DelAngGirdle_12_plus()	
{ 
	DelAngGirdle_12 = DelAngGirdle_12 + DEGREE; 
	redraw();
}		

function DelAngGirdle_18_minus()	
{ 
	DelAngGirdle_18 = DelAngGirdle_18 - DEGREE; 
	redraw();
}	
function DelAngGirdle_18_plus()	
{ 
	DelAngGirdle_18 = DelAngGirdle_18 + DEGREE; 
	redraw();
}	

function DelAngGirdle_26_minus()	
{ 
	DelAngGirdle_26 = DelAngGirdle_26 - DEGREE; 
	redraw();
}	
function DelAngGirdle_26_plus()	
{ 
	DelAngGirdle_26 = DelAngGirdle_26 + DEGREE; 
	redraw();
}	

function DelAngGirdle_34_minus()	
{ 
	DelAngGirdle_34 = DelAngGirdle_34 - DEGREE; 
	redraw();
}	
function DelAngGirdle_34_plus()	
{ 
	DelAngGirdle_34 = DelAngGirdle_34 + DEGREE; 
	redraw();
}

function DelAngGirdle_38_minus()	
{ 
	DelAngGirdle_38 = DelAngGirdle_38 - DEGREE; 
	redraw();
}	
function DelAngGirdle_38_plus()	
{ 
	DelAngGirdle_38 = DelAngGirdle_38 + DEGREE; 
	redraw();
}		

function DelAngGirdle_42_minus()	
{ 
	DelAngGirdle_42 = DelAngGirdle_42 - DEGREE; 
	redraw();
}	
function DelAngGirdle_42_plus()	
{ 
	DelAngGirdle_42 = DelAngGirdle_42 + DEGREE; 
	redraw();
}	

function DelAngGirdle_46_minus()	
{ 
	DelAngGirdle_46 = DelAngGirdle_46 - DEGREE; 
	redraw();
}	
function DelAngGirdle_46_plus()	
{ 
	DelAngGirdle_46 = DelAngGirdle_46 + DEGREE; 
	redraw();
}	

function lambda_0()
{	
	lambda = 0;
	DelAngGirdle_6 = 0;	// "Bone angle 1" -> ребро короны 8 - g6
	DelAngGirdle_12 = 0;	// "Bone angle 2" -> ребро короны 8 - g12
	DelAngGirdle_18 = 0; // "Facet angle A" -> грань A короны
	DelAngGirdle_26 = 0;	// "Bone angle 3" -> ребро короны 9 - g26
	DelAngGirdle_34 = 0;	// "Facet angle B" -> грань B короны
	DelAngGirdle_38 = 0;	// "Bone angle 4" -> ребро короны 10 - g38
	DelAngGirdle_42 = 0;	// "Facet angle C" -> грань C короны
	DelAngGirdle_46 = 0;
	redraw();
}				

function draw_girdle()
{
	var i;
	
	// закраска области внутри рундиста
	fill_polygon(ctx, girdle, 100, '#dfe');

	// Рисуем линию рундиста		
	for (i = 0; i < 99; i++)
	{
		line_segment(ctx, girdle[i], girdle[i+1], 1, "B");
	}			
	line_segment(ctx, girdle[99], girdle[0], 1, "B");
	
	// текст и вершины
	
	for (i = 0; i < 100; i = i + 1)
	{
		if ( (i == 0) ||  (i == 6)  ||  (i == 12) || (i == 18) || (i == 26) || (i == 34) ||
			 (i == 38) || (i == 42) || (i == 46) || (i == 50) || (i == 54) ||
			 (i == 58) || (i == 62) || (i == 66) || (i == 74) || (i == 82) || (i == 88) || (i == 94) )		
		{
			csp(ctx, girdle[i], 5, "B");
		}
		else
		{
			csp(ctx, girdle[i], 3, "B");
		}
	}		
	
	if (lambda < 5*DEGREE)
	{
		text2(ctx, "0", girdle[0], "md", "dn", "B");
		text2(ctx, "26", girdle[26], "rt", "md", "B");
		text2(ctx, "34", girdle[34], "rt", "md", "B");
		text2(ctx, "38", girdle[38], "rt", "md", "B");
		text1(ctx, "42", girdle[42], "rt", "dn", "B");
		text2(ctx, "46", girdle[46], "md", "dn", "B");
		
		text2(ctx, "50", girdle[50], "md", "dn", "B");
		
		text1(ctx, "54", girdle[54], "lt", "dn", "B");
		text1(ctx, "58", girdle[58], "lt", "dn", "B");
		text1(ctx, "62", girdle[62], "lt", "dn", "B");
		text1(ctx, "66", girdle[66], "lt", "md", "B");
		text1(ctx, "74", girdle[74], "lt", "md", "B");
	}
	else
	{
		text2(ctx, "0", girdle[0], "md", "dn", "B");
		text2(ctx, "6", girdle[6], "md", "up", "B");
		text2(ctx, "12", girdle[12], "md", "up", "B");
		text2(ctx, "18", girdle[18], "rt", "md", "B");
		text2(ctx, "26", girdle[26], "rt", "md", "B");
		text2(ctx, "34", girdle[34], "rt", "md", "B");
		text2(ctx, "38", girdle[38], "rt", "md", "B");
		text1(ctx, "42", girdle[42], "rt", "dn", "B");
		text2(ctx, "46", girdle[46], "md", "dn", "B");
		
		text2(ctx, "50", girdle[50], "md", "dn", "B");
		
		text1(ctx, "54", girdle[54], "lt", "dn", "B");
		text1(ctx, "58", girdle[58], "lt", "dn", "B");
		text1(ctx, "62", girdle[62], "lt", "dn", "B");
		text1(ctx, "66", girdle[66], "lt", "md", "B");
		text1(ctx, "74", girdle[74], "lt", "md", "B");
		text1(ctx, "82", girdle[82], "lt", "up", "B");
		text1(ctx, "88", girdle[88], "md", "up", "B");
		text2(ctx, "94", girdle[94], "md", "up", "B");	
	}
}
	
function construction()	
{
	axes(ctx, 0.7, 1.4, 0.6, "Brown");
	
	var O = [0,0];
	rsp(ctx, O, 5, "Brown");
	text1(ctx, "O", O, "lt", "up", "Brown");
	
	text2(ctx, "Pear 1", girdle[64], "lt", "md", "Black", "20px Verdana");	
	text2(ctx, "Pear 2", girdle[36], "rt", "md", "Black", "20px Verdana");	
	
	var B = [0, girdle[50][1]];
	
	if (lambda > 0.4*DEGREE)
	{
		var pt1 = new Point2D( 2*Math.sin(lambda), 2*Math.cos(lambda) + girdle[50][1]);
		var pt2 = new Point2D(-2*Math.sin(lambda), 2*Math.cos(lambda) + girdle[50][1]);
		line_segment(ctx, B, pt1, 0.2, "Black");
		line_segment(ctx, B, pt2, 0.2, "Black");
	}
	
	var s_lambda = String.fromCharCode(955);
	
	if (lambda > 0)
	{
		draw_angle(ctx, B, Math.PI/2 - lambda, Math.PI/2, 0.2, 1, "Black");
		draw_angle(ctx, B, Math.PI/2 - lambda, Math.PI/2, 0.2 - 0.01, 1, "Black");
		var p_mid = new Point2D(B[0] + 0.2 * Math.cos(Math.PI/2 - lambda/2), B[1] + 0.2 * Math.sin(Math.PI/2 - lambda/2));
		if (lambda > 5*DEGREE)
		{
			text2(ctx, s_lambda, p_mid, "md", "up", "Black", "14px Verdana");
		}
		
		draw_angle(ctx, B, Math.PI/2, Math.PI/2 + lambda, 0.25, 1, "Black");
		draw_angle(ctx, B, Math.PI/2, Math.PI/2 + lambda, 0.25 - 0.01, 1, "Black");
		var p_mid = new Point2D(B[0] + 0.25 * Math.cos(Math.PI/2 + lambda/2), B[1] + 0.25 * Math.sin(Math.PI/2 - lambda/2));
		if (lambda > 5*DEGREE)
		{
			text2(ctx, s_lambda, p_mid, "md", "up", "Black", "14px Verdana");
		}
	}
	else if ( (lambda < 2*DEGREE) && (DelAngGirdle_34 < DEGREE) )
	{
		line_segment(ctx, girdle[34], new Point2D(girdle[34][0], girdle[34][1] + 0.6), 0.2, "Black");
		line_segment(ctx, girdle[66], new Point2D(girdle[66][0], girdle[66][1] + 0.6), 0.2, "Black");
		segment_two_arrow(ctx, new Point2D(girdle[34][0], girdle[34][1] + 0.6), 
								new Point2D(girdle[66][0], girdle[66][1] + 0.6) , 0.1, 0.2, "Black");
		text2(ctx, "Pear width", new Point2D(girdle[0][0], girdle[66][1] + 0.605), "md", "up", "Black");
											
		line_segment(ctx, girdle[0], new Point2D(girdle[0][0] + 1.0, girdle[0][1]), 0.2, "Black");
		line_segment(ctx, girdle[50], new Point2D(girdle[50][0] + 1.0, girdle[50][1]), 0.2, "Black");
		segment_two_arrow(ctx, new Point2D(girdle[0][0] + 1.0, girdle[0][1]), 
								 new Point2D(girdle[50][0] + 1.0, girdle[50][1]), 0.1, 0.2, "Black");
		text2(ctx, "Pear length", new Point2D(girdle[50][0] + 1.0, girdle[38][1]), "rt", "md", "Black");											
	}
}
			
function pars_value()
{
	var s_psi = String.fromCharCode(968);
	var s_fi = String.fromCharCode(966);
	var s_vp = String.fromCharCode(948);
	
	// Text before buttons
	ctx.font = "italic 10pt Arial";
	
	var text_lambda = String.fromCharCode(955);
	ctx.fillStyle = "#00F";
	ctx.fillText(text_lambda, 30, 130);	
	var text_value = roundNumber(Math.degrees(lambda), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 130);			
	
	text_ang = s_vp;
	ctx.fillStyle = "#00F";
	ctx.fillText(text_ang, 30, 150);	
	text_value = roundNumber(Math.degrees(vp), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 150);
	
	text_value = "Lh ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 30, 170);		
	text_value = roundNumber(Lh, 2);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 170);	
	
	text_value = "Pear length/width ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 190);		
	text_value = roundNumber(pearRt, 2);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 190);

	text_value = "Delta angle gd. 6 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 220);	
	text_value = roundNumber(Math.degrees(DelAngGirdle_6), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 220);	
	
	text_value = "Delta angle gd. 12 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 240);	
	text_value = roundNumber(Math.degrees(DelAngGirdle_12), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 240);			

	text_value = "Delta angle gd. 18 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 260);	
	text_value = roundNumber(Math.degrees(DelAngGirdle_18), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 260);			

	text_value = "Delta angle gd. 26 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 280);	
	text_value = roundNumber(Math.degrees(DelAngGirdle_26), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 280);			
	
	text_value = "Delta angle gd. 34 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 300);	
	text_value = roundNumber(Math.degrees(DelAngGirdle_34), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 300);		

	text_value = "Delta angle gd. 38 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 320);	
	text_value = roundNumber(Math.degrees(DelAngGirdle_38), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 320);						
	
	text_value = "Delta angle gd. 42 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 340);	
	text_value = roundNumber(Math.degrees(DelAngGirdle_42), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 340);			
	
	text_value = "Delta angle gd. 46 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 5, 360);	
	text_value = roundNumber(Math.degrees(DelAngGirdle_46), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text_value, 120, 360);		

	ctx.fillStyle = '#0000ff';
	text_value = "Pear l/w  = Pear length / Pear width (  Press button " + text_lambda + "  = 0° )";
	ctx.fillText(text_value, 5, 390);			
	
	var s_equiv = String.fromCharCode(8801);
	text_value = "Pear 1 " + s_equiv + " Pear 2";
	ctx.fillStyle = "#00F";
	ctx.fillText(text_value, 30, 420);	
	
	ctx.font = '20px "Times New Roman"';
	ctx.fillStyle = 'rgba(100, 0, 255, 1)'
	ctx.fillText('Heart - girdle (100 vertices)', 20, 30);	
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
	btn_lambda_minus = new Btn2("-", "button", "170px", "120px" );
	btn_lambda_plus = new Btn2("+", "button", "200px", "120px" );
	btn_lambda_minus.name.addEventListener("click", lambda_minus);
	btn_lambda_plus.name.addEventListener("click", lambda_plus);

	btn_vp_minus = new Btn2("-", "button", "170px", "140px" );
	btn_vp_plus = new Btn2("+", "button", "200px", "140px" );
	btn_vp_minus.name.addEventListener("click", vp_minus);
	btn_vp_plus.name.addEventListener("click", vp_plus);	

	btn_Lh_minus = new Btn2("-", "button", "170px", "160px" );
	btn_Lh_plus = new Btn2("+", "button", "200px", "160px" );
	btn_Lh_minus.name.addEventListener("click", Lh_minus);
	btn_Lh_plus.name.addEventListener("click", Lh_plus);	
	
	btn_pearRt_minus = new Btn2("-", "button", "170px", "180px" );
	btn_pearRt_plus = new Btn2("+", "button", "200px", "180px" );
	btn_pearRt_minus.name.addEventListener("click", pearRt_minus);
	btn_pearRt_plus.name.addEventListener("click", pearRt_plus);				
	
	
	btn_DelAngGirdle_6_minus = new Btn2("-", "button", "170px", "210px" );
	btn_DelAngGirdle_6_plus = new Btn2("+", "button", "200px", "210px" );
	btn_DelAngGirdle_6_minus.name.addEventListener("click", DelAngGirdle_6_minus);
	btn_DelAngGirdle_6_plus.name.addEventListener("click", DelAngGirdle_6_plus);

	btn_DelAngGirdle_12_minus = new Btn2("-", "button", "170px", "230px" );
	btn_DelAngGirdle_12_plus = new Btn2("+", "button", "200px", "230px" );
	btn_DelAngGirdle_12_minus.name.addEventListener("click", DelAngGirdle_12_minus);
	btn_DelAngGirdle_12_plus.name.addEventListener("click", DelAngGirdle_12_plus);
	
	btn_DelAngGirdle_18_minus = new Btn2("-", "button", "170px", "250px" );
	btn_DelAngGirdle_18_plus = new Btn2("+", "button", "200px", "250px" );
	btn_DelAngGirdle_18_minus.name.addEventListener("click", DelAngGirdle_18_minus);
	btn_DelAngGirdle_18_plus.name.addEventListener("click", DelAngGirdle_18_plus);

	btn_DelAngGirdle_26_minus = new Btn2("-", "button", "170px", "270px" );
	btn_DelAngGirdle_26_plus = new Btn2("+", "button", "200px", "270px" );
	btn_DelAngGirdle_26_minus.name.addEventListener("click", DelAngGirdle_26_minus);
	btn_DelAngGirdle_26_plus.name.addEventListener("click", DelAngGirdle_26_plus);	

	btn_DelAngGirdle_34_minus = new Btn2("-", "button", "170px", "290px" );
	btn_DelAngGirdle_34_plus = new Btn2("+", "button", "200px", "290px" );
	btn_DelAngGirdle_34_minus.name.addEventListener("click", DelAngGirdle_34_minus);
	btn_DelAngGirdle_34_plus.name.addEventListener("click", DelAngGirdle_34_plus);		
	
	btn_DelAngGirdle_38_minus = new Btn2("-", "button", "170px", "310px" );
	btn_DelAngGirdle_38_plus = new Btn2("+", "button", "200px", "310px" );
	btn_DelAngGirdle_38_minus.name.addEventListener("click", DelAngGirdle_38_minus);
	btn_DelAngGirdle_38_plus.name.addEventListener("click", DelAngGirdle_38_plus);		

	btn_DelAngGirdle_42_minus = new Btn2("-", "button", "170px", "330px" );
	btn_DelAngGirdle_42_plus = new Btn2("+", "button", "200px", "330px" );
	btn_DelAngGirdle_42_minus.name.addEventListener("click", DelAngGirdle_42_minus);
	btn_DelAngGirdle_42_plus.name.addEventListener("click", DelAngGirdle_42_plus);			
	
	btn_DelAngGirdle_46_minus = new Btn2("-", "button", "170px", "350px" );
	btn_DelAngGirdle_46_plus = new Btn2("+", "button", "200px", "350px" );
	btn_DelAngGirdle_46_minus.name.addEventListener("click", DelAngGirdle_46_minus);
	btn_DelAngGirdle_46_plus.name.addEventListener("click", DelAngGirdle_46_plus);	
	
	var text = lambda_str + " = 0°";
	btn_lambda = new Btn2(text, "button", "170px", "415px" );
	btn_lambda.id.style.width = "60px";
	btn_lambda.id.style.color = "#ff0000";
	btn_lambda.id.style.background = "#ffdddd"; 
	btn_lambda.name.addEventListener("click", lambda_0);
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
	ctx.clearRect(700, 10, 160, 30);
	elem1 = document.getElementById('canvas_01');
	var coords = elem1.getBoundingClientRect();

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
	ctx.fillText(xy_text, 720, 35);	
	
	// для проверки 
	//rsp(ctx, new Point2D(x_mouse, y_mouse), 4, "G");
}

////////////////////////////////////////////////////		
addEventListener("load", initiate);
	