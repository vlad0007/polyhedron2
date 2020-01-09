var DEGREE = 0.01745329251994;
var M_PI = 3.14159265358979323846;
var M_PI_2 = 1.57079632679489661923;

var lw = 1.15;
var R1, R2;
var rounnd_cir1 = 0.15;//0.1140;
var rounnd_cir2 = 0.110;
var R3 = 0.174;// 0.034;
var R2_R3, R1_R3;
var ang_2 = 60*DEGREE;  //0.663;
var ang_3 = 60*DEGREE; //0.663;
var ang_corner = 45*DEGREE; //0.785; //45*DEGREE  ALT+0176
var gd_segments = 0.205;

var girdle = [64];
var O1, O2, O3, O4;
var g, f;
			
var ctx;

// координаты мыши
var x_mouse, y_mouse;

// Canvas coordinates
var xC;
var yC;
var SCALE;

var btn_lw_minus, btn_lw_plus;
var btn_r1_minus, btn_r1_plus, btn_r2_minus,btn_r2_plus, btn_r3_minus, btn_r3_plus;
var btn_ang_corner_minus, btn_ang_corner_plus;
var btn_ang_2_minus, btn_ang_2_plus;
var btn_ang_3_minus, btn_ang_3_plus;
var btn_gd_segments_minus, btn_gd_segments_plus;
	
function initiate()
{					
	var elem1 = document.getElementById('canvas_01');

	SCALE = 250;
	xC = elem1.width / 2;
	yC = elem1.height / 2;
	
	ctx = elem1.getContext("2d");
	ctx.font = "12px Arial";
	
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
	var i;
	
	// Радиус большей окружности
	R1 = rounnd_cir1/2.0 + (lw * lw)/(8.0*rounnd_cir1);
	// Центр большей окружности - лежит на оси OY
	O1 = new Point2D(0, 0.5 - R1);
	// Большая окружность
	var cir1 = new Circle2D(O1, R1);

	// Радиус меньшей окружности
	R2 = rounnd_cir2/2.0 + 1/(8.0*rounnd_cir2);
	// Центр меньшей окружности - лежит на оси OX
	O2 = new Point2D(lw/2 - R2, 0);
	// Меньшая окружность
	var cir2 = new Circle2D(O2, R2);

	//  Окружности, используемые для вычисления центра 
	// сопрягающей окружности
	R2_R3 = new Circle2D(O2, R2 - R3); 
	R1_R3 = new Circle2D(O1, R1 - R3); 

	var points = R2_R3.Intersection_TwoCircles(R1_R3);
	if (points == null)
	{
		return null;
	}
	// Центр сопрягающей окружности
	O3 = new Point2D(); // Центр сопрягающей окружности
	if (points[0][0] > points[1][0])
	{
		O3[0] = points[0][0]; O3[1] = points[0][1]
	}
	else
	{
		O3[0] = points[1][0]; O3[1] = points[1][1]			
	}

	// Создаем сопрягающую окружность чуть большего 
	// радиуса чем R3 (для проверки)
	var cir3 = new Circle2D(O3, R3 + 0.00001); // R3 + EPSILON);

	// Проверяем пересекаются или нет окружности 
	// cir2 и cir1 с сопрягающей окружностью cir3
	// Координаты точек пересечения g и points[1]
	// и также f и points[1] должны отличаться совершенно незначительно
	// (points[1] и points[2] должны отличаться совершенно незначительно)
	
	points = cir2.Intersection_TwoCircles(cir3);
	if (points == null)
	{
		return null;
	}
	// Точка пересечения окружностей cir2 и cir3
	G = new Point2D(points[0][0], points[0][1]); 
	
	points = cir1.Intersection_TwoCircles(cir3);
	if (points == null)
	{
		return null;
	}
	// Точка пересечения окружностей cir1 и cir3
	F = new Point2D(points[0][0], points[0][1]); 

	// Находим положение точки на луче, 
	//который будет определять направление на котором  
	//лежит угловая вершина рундиста girdle[8]. 
	// Этот луч будет использоваться в качестве 
	//начальной прямой отсчета для углов ang_2 и ang_3.
	//var ang_corner = ang_corner;      !!!!!!!!!

	var u = new Point2D();
	u[0] = O3[0] + Math.cos(ang_corner) * R3;
	u[1] = O3[1] + Math.sin(ang_corner) * R3;
	
	O4 = new Point2D(gd_segments * lw, gd_segments);

	var t = new Point2D();	// Точки на радиусах сопрягающей окружности cir3
	var w = new Point2D();	// На рисунке они лежат на сопрягающей окружности
	t[0] = O4[0] + Math.cos(ang_corner + ang_2);
	t[1] = O4[1] + Math.sin(ang_corner + ang_2);

	w[0] = O4[0] + Math.cos(ang_corner - ang_3);
	w[1] = O4[1] + Math.sin(ang_corner - ang_3);

	// Прямые используемые для нахождения границ сегментов рундиста.
	//Line2D ln_O4_t, ln_O4_u, ln_O4_w;
	var ln_O4_t = new Line2D(O4, t);
	var ln_O4_u = new Line2D(O4, u);
	var ln_O4_w = new Line2D(O4, w);

	//  Конструируем верхнюю часть рундиста
	var s = new Point2D(); // s, v - Точки лежащие на границе сегментов seg1 и seg2
	var v = new Point2D(); // и также на границе сегментов seg3 и seg4
	girdle[0] = new Point2D(0, 0.5);

	points = cir1.Intersection_LineCircle(ln_O4_t);
	if (points == null)
	{
		return null;
	}
	if (points[0][1] > points[1][1])
	{
		s[0] = points[0][0]; s[1] = points[0][1];
	}
	else
	{
		s[0] = points[1][0]; s[1] = points[1][1];			
	}
	girdle[4] = s;
	girdle[8] = u;

	points = cir2.Intersection_LineCircle(ln_O4_w);
	if (points == null)
	{
		return null;
	}
	if (points[0][0] > points[1][0])
	{
		v[0] = points[0][0]; v[1] = points[0][1];
	}
	else
	{
		v[0] = points[1][0]; v[1] = points[1][1];			
	}
	
	girdle[12] = v;
	girdle[16]= new Point2D(lw/2, 0);

	// Координаты остальных вершин рундиста
	var x, y;
	var Fi2 = Math.atan2((u[0] - O1[0]), (u[1] - O1[1]));
	var Fi1 = Math.atan2((s[0] - O1[0]), (s[1] - O1[1]));
	var ang = Fi2;
	var dAng = (Fi2 - Fi1)/4; // Угловой шаг

	// seg2
	for(i = 7; i > 4; i--)
	{
		ang = ang - dAng;
		x = Math.sin(ang)*R1 + O1[0];
		if(x > F[0]) // Правее точки пересечения окружностей cir1 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line2 = new Line2D();
			var vector2 = new Vector2D(Math.sin(ang), Math.cos(ang));
			line2.CreateLineVectorPoint(vector2, O1);
			points = cir3.Intersection_LineCircle(line2);
			if (points == null)
			{
				return null;
			}
			if (points[0][1] > points[1][1])
			{
				y = points[0][1];
				x = points[0][0];
			}
			else
			{
				y = points[1][1];
				x = points[1][0];
			}
		}
		else
		{
			y = Math.cos(ang)*R1 + O1[1];
		}
		girdle[i] = new Point2D(x, y);
	}

	ang = Fi1;
	dAng = Fi1 / 4;
	// seg1
	for(i = 3; i > 0; i--)
	{
		ang = ang - dAng;
		x = Math.sin(ang)*R1 + O1[0];
		if(x > F[0]) // Правее точки пересечения окружностей cir1 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.sin(ang), Math.cos(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir3.Intersection_LineCircle(line1);
			if (points == null)
			{
				return null;
			}
			if (points[0][1] > points[1][1])
			{
				y = points[0][1];
				x = points[0][0];
			}
			else
			{
				y = points[1][1];
				x = points[1][0];
			}
		}
		else
		{
			y = Math.cos(ang)*R1 + O1[1];
		}
		girdle[i] = new Point2D(x, y);
	}

	var Fi3 = Math.atan2((u[1] - O2[1]), (u[0] - O2[0]));
	var Fi4 = Math.atan2((v[1] - O2[1]) ,(v[0] - O2[0]));
	ang = Fi3;
	dAng = (Fi3 - Fi4)/4;

	// seg3
	for(i = 9; i < 12; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R2 + O2[1];
		if(y > G[1]) // Выше точки пересечения окружностей cir2 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line3 = new Line2D();
			var vector3 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line3.CreateLineVectorPoint(vector3, O2);
			points = cir3.Intersection_LineCircle(line3);
			if (points == null)
			{
				return null;
			}
			if (points[0][0] > points[1][0])
			{
				x = points[0][0];
				y = points[0][1];
			}
			else
			{
				x = points[1][0];
				y = points[1][1];
			}
		}
		else
		{
			x = Math.cos(ang)*R2 + O2[0];
		}					
		girdle[i] = new Point2D(x, y);
	}

	ang = Fi4;
	dAng = Fi4 / 4;

	// seg4
	for(i = 13; i < 16; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R2 + O2[1];
		if (y > G[1]) // Выше точки пересечения окружностей cir2 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line4 = new Line2D();
			var vector4 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line4.CreateLineVectorPoint(vector4, O2);
			points = cir3.Intersection_LineCircle(line4);
			if (points == null)
			{
				return null;
			}
			if (points[0][0] > points[1][0])
			{
				x = points[0][0];
				y = points[0][1];
			}
			else
			{
				x = points[1][0];
				y = points[1][1];
			}
		}
		else
		{
			x = Math.cos(ang)*R2 + O2[0];
		}
		girdle[i] = new Point2D(x, y);
	}

	// Производим вычисления вершин рундиста для остальных квадрантов
	for(i = 0; i < 16; i++)
	{
		girdle[32-i] = new Point2D();
		girdle[32-i][0] = girdle[i][0];
		girdle[32-i][1] = -girdle[i][1];
	}
	for(i = 1; i < 32; i++)
	{
		girdle[64-i] = new Point2D();
		girdle[64-i][0] = -girdle[i][0];
		girdle[64-i][1] = girdle[i][1];
	}
}

function lw_minus() { lw = lw - 0.05; redraw();}
function lw_plus() { lw = lw + 0.05; redraw();}

function r1_minus() { rounnd_cir1 = rounnd_cir1 - 0.01; redraw();}
function r1_plus() { rounnd_cir1 = rounnd_cir1 + 0.01; redraw();}

function r2_minus() { rounnd_cir2 = rounnd_cir2 - 0.01; redraw();}
function r2_plus() { rounnd_cir2 = rounnd_cir2 + 0.01; redraw();}

function r3_minus() { R3 = R3 - 0.01; redraw();}
function r3_plus() { R3 = R3 + 0.01; redraw();}

function ang_corner_minus() { ang_corner = ang_corner - 1.0*DEGREE; redraw();}
function ang_corner_plus() { ang_corner = ang_corner + 1.0*DEGREE; redraw();}

function ang_2_minus() { ang_2 = ang_2 - 1.0*DEGREE; redraw();}
function ang_2_plus() { ang_2 = ang_2 + 1.0*DEGREE; redraw();}

function ang_3_minus() { ang_3 = ang_3 - 1.0*DEGREE; redraw();}
function ang_3_plus() { ang_3 = ang_3 + 1.0*DEGREE; redraw();}

function gd_segments_minus() { gd_segments = gd_segments - 0.005; redraw();}
function gd_segments_plus() { gd_segments = gd_segments + 0.005; redraw();}

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
	
	// Text and vertexes
	ctx.font = "italic 10pt Arial";
	
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
	rsp(ctx, new Point2D(0, 0), 4, "Black;");
	text1(ctx, "O", new Point2D(0, 0), "lt", "up");
	
	text1(ctx, "O1", O1, "lt", "md");
	text2(ctx, "O2", O2, "md", "dn");
	
	circle(ctx, O1, R1, 0.5, "Black")
	rsp(ctx, O1, 4, "Black;");
	
	circle(ctx, O2, R2, 0.5, "Black")
	rsp(ctx, O2, 4, "Black;");
	
	circle(ctx, O1, R1 - R3, 0.5, "Black");
	circle(ctx, O2, R2 - R3, 0.5, "Black");
	
	circle(ctx, O3, R3, 0.5, "Black");
	circle(ctx, new Point2D( O3[0], -O3[1]), R3, 0.5, "Black")
	circle(ctx, new Point2D(-O3[0],  O3[1]), R3, 0.5, "Black")
	circle(ctx, new Point2D(-O3[0], -O3[1]), R3, 0.5, "Black")
	rsp(ctx, O3, 3, "Black");
	rsp(ctx, new Point2D( O3[0], -O3[1]), 3, "Black");
	rsp(ctx, new Point2D(-O3[0],  O3[1]), 3, "Black");
	rsp(ctx, new Point2D(-O3[0], -O3[1]), 3, "Black");
	text1(ctx, "O3", O3, "rt", "dn");
	
	var ptR1 = radius_arrow(ctx, O1, R1, 10*DEGREE, 0.5, 0.2, "Black");
	var ptR1_R3 = radius_arrow(ctx, O1, R1 - R3, 20*DEGREE, 0.5, 0.2, "Black");
	text1(ctx, "R1", ptR1, "rt", "md");
	text1(ctx, "R1 - R3", ptR1_R3, "lt", "up");

	var ptR2 = radius_arrow(ctx, O2, R2, 195*DEGREE, 0.5, 0.2, "Black");
	var ptR2_R3 = radius_arrow(ctx, O2, R2 - R3, 205*DEGREE, 0.5, 0.2, "Black");
	text1(ctx, "R2", ptR2, "rt", "dn");
	text1(ctx, "R2 - R3", ptR2_R3, "rt", "dn");

	var ptR3 = radius_arrow(ctx, O3, R3, 250*DEGREE, 0.5, 0.2, "Black");
	text1(ctx, "R3", ptR3, "md", "dn");
	
	rsp(ctx, G, 5, "R");
	text2(ctx, "G", G, "rt", "md", "R");
	rsp(ctx, F, 5, "R");
	text1(ctx, "F", F, "md", "up", "R");
	
	var pt = new Point2D(O3[0] + Math.cos(ang_corner),  O3[1] + Math.sin(ang_corner));
	line(ctx, O3, pt, 0, 0.2, 0.5, "Black");
	
	csp(ctx, O4, 5, "R");
	text1(ctx, "O4", O4, "lt", "dn", "R");
	line(ctx, O4, girdle[12], 0, 0.6, 0.5, "Black");
	if (O4[0] >= girdle[4][0])
	{
		line(ctx, O4, girdle[4], 0, -0.6, 0.5, "Black");
	}
	else
	{
		line(ctx, O4, girdle[4], 0, 0.6, 0.5, "Black");
	}
	
	pt = new Point2D(O4[0] + Math.cos(ang_corner),  O4[1] + Math.sin(ang_corner));
	line(ctx, O4, pt, 0, 0.5, 0.5, "Black");
	
	draw_angle_txt(ctx, O4, ang_corner, ang_corner + ang_2, 0.6, "2", "rt", "up", 1, "R");
	draw_angle(ctx, O4, ang_corner, ang_corner + ang_2, 0.6-0.01,  1, "R");
	
	draw_angle_txt(ctx, O4, ang_corner - ang_3, ang_corner, 0.5, "3", "rt", "up", 1, "R");
	draw_angle(ctx, O4, ang_corner - ang_3, ang_corner, 0.5 - 0.01,  1, "R");	

	line_segment(ctx, O3, new Point2D(O3[0] + 0.2, O3[1]), 0.3, "Black");
	draw_angle_txt(ctx, O3, 0, ang_corner, 0.09, "1", "rt", "md", 1, "R");
	draw_angle(ctx, O3, 0, ang_corner, 0.09 + 0.01,  1, "R");
	
	line_segment(ctx, O1, girdle[4], 0.2, "Black");
	line_segment(ctx, O1, girdle[5], 0.2, "Black");
	line_segment(ctx, O1, girdle[6], 0.2, "Black");
	line_segment(ctx, O1, girdle[7], 0.2, "Black");
	line_segment(ctx, O1, girdle[8], 0.2, "Black");
	
	line_segment(ctx, O2, girdle[20], 0.2, "Black");
	line_segment(ctx, O2, girdle[21], 0.2, "Black");
	line_segment(ctx, O2, girdle[22], 0.2, "Black");
	line_segment(ctx, O2, girdle[23], 0.2, "Black");
	line_segment(ctx, O2, girdle[24], 0.2, "Black");	
	
	pt = new Point2D(O1[0] + R1*Math.cos(5*DEGREE), O1[1] + R1*Math.sin(5*DEGREE));
	text1(ctx, "circle 1", pt, "rt", "dn", "Black", "16px Verdana");
	
	pt = new Point2D(O2[0] + R2*Math.cos(-40*DEGREE), O2[1] + R2*Math.sin(-40*DEGREE));
	text1(ctx, "circle 2", pt, "rt", "dn", "Black", "16px Verdana");
	
	pt = new Point2D(O3[0] + R3*Math.cos(180*DEGREE), O3[1] + R3*Math.sin(180*DEGREE));
	text1(ctx, "circle 3", pt, "lt", "md", "Black", "12px Verdana");
}
			
function pars_value()
{
	ctx.font = "italic 10pt Arial";
	
	var text = "Girdle ratio ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 110);		
	text = roundNumber(lw, 2);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 100, 110);	
	
	text = "Roundness 1 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 130);	
	ctx.fillStyle = '#ff0000';
	text = roundNumber(rounnd_cir1, 2);
	ctx.fillText(text, 100, 130);			
	
	text = "Roundness 2 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 150);
	text = roundNumber(rounnd_cir2, 3);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 100, 150);	
	
	text = "R3 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 170);	
	text = roundNumber(R3, 3);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 100, 170);	
	
	text = "Angle corner ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 190);
	text = roundNumber(Math.degrees(ang_corner), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 100, 190);	
	
	text = "Angle 2 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 210);
	text = roundNumber(Math.degrees(ang_2), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 100, 210);
	
	text = "Angle 3 ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 230);
	text = roundNumber(Math.degrees(ang_3), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 100, 230);
	
	text = "Size segments ";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 250);
	text = roundNumber(gd_segments, 3);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 100, 250);

	ctx.font = '14px "Times New Roman"';
	ctx.fillStyle = 'rgba(100, 0, 255, 1)'
	ctx.fillText('Cushion Maltese Cross - girdle (64 vertices)', 10, 20);	
	ctx.fillText('with parameter Size_segments', 50, 40);	

	ctx.fillStyle = 'rgba(255, 0, 0, 1)'
	ctx.fillText("F, G   ", 10, 400 );
	ctx.fillStyle = "#00F";
	ctx.fillText("  - the points of junction between", 30, 400);
	ctx.fillText("circle 1 - circle 3 and circle 2 - circle 3.", 15, 420);
	
	ctx.fillStyle = '#f00';
	ctx.fillText("O4 ", 10, 450 );
	ctx.fillText("- point with coordinates (Size_segments * Girdle_ratio, Size_segments)", 30, 450);
	ctx.fillStyle = "#00F";
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
	btn_lw_minus = new Btn2("-", "lw_minus", "150px", "100px" );
	btn_lw_plus = new Btn2("+", "lw_plus", "180px", "100px" );			
	
	btn_r1_minus = new Btn2("-", "r1_minus", "150px", "120px" );
	btn_r1_plus = new Btn2("+", "r1_plus", "180px", "120px" );
	
	btn_r2_minus = new Btn2("-", "r2_minus", "150px", "140px" );
	btn_r2_plus = new Btn2("+", "r2_plus", "180px", "140px" );
	
	btn_r3_minus = new Btn2("-", "r3_minus", "150px", "160px" );
	btn_r3_plus = new Btn2("+", "r3_plus", "180px", "160px" );
	
	btn_ang_corner_minus = new Btn2("-", "ang_corner_minus", "150px", "180px" );
	btn_ang_corner_plus = new Btn2("+", "ang_corner_plus", "180px", "180px" );
	
	btn_ang_2_minus = new Btn2("-", "ang_2_minus", "150px", "200px" );
	btn_ang_2_plus = new Btn2("+", "ang_2_plus", "180px", "200px" );
	
	btn_ang_3_minus = new Btn2("-", "ang_3_minus", "150px", "220px" );
	btn_ang_3_plus = new Btn2("+", "ang_3_plus", "180px", "220px" );
	
	btn_gd_segments_minus = new Btn2("-", "gd_segments_minus", "150px", "240px" );
	btn_gd_segments_plus = new Btn2("+", "gd_segments_plus", "180px", "240px" );
	
	btn_lw_minus.name.addEventListener("click", lw_minus);
	btn_lw_plus.name.addEventListener("click", lw_plus);
	
	btn_r1_minus.name.addEventListener("click", r1_minus);
	btn_r1_plus.name.addEventListener("click", r1_plus);
	
	btn_r2_minus.name.addEventListener("click", r2_minus);
	btn_r2_plus.name.addEventListener("click", r2_plus);
	
	btn_r3_minus.name.addEventListener("click", r3_minus);
	btn_r3_plus.name.addEventListener("click", r3_plus);
	
	btn_ang_corner_minus.name.addEventListener("click", ang_corner_minus);
	btn_ang_corner_plus.name.addEventListener("click", ang_corner_plus);
	
	btn_ang_2_minus.name.addEventListener("click", ang_2_minus);
	btn_ang_2_plus.name.addEventListener("click", ang_2_plus);
	
	btn_ang_3_minus.name.addEventListener("click", ang_3_minus);
	btn_ang_3_plus.name.addEventListener("click", ang_3_plus);		

	btn_gd_segments_minus.name.addEventListener("click", gd_segments_minus);
	btn_gd_segments_plus.name.addEventListener("click", gd_segments_plus);					
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
	ctx.clearRect(700, 10, 100, 20);
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
	ctx.fillText(xy_text, 700, 20);	
	
	// для проверки 
	//rsp(ctx, new Point2D(x_mouse, y_mouse), 4, "G");
}				
		
addEventListener("load", initiate);
	