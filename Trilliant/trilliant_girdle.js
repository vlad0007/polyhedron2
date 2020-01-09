var girdle = [48];

var DEGREE = 0.01745329251994;
var M_PI = 3.14159265358979323846;
var M_PI_2 = 1.57079632679489661923;
var EPSILON = 0.000001;

var xC, yC, SCALE;

// координаты мыши
var x_mouse, y_mouse;

var elem, ctx;

var rs = 0.2;
var lw = 1.0;
var angle = 60*DEGREE;

var btn_lw_plus, btn_lw_minus; 
var btn_rs_minus, btn_rs_plus;
var btn_angle_minus, btn_angle_plus;

var btn_posX_minus, btn_posX_plus;
var btn_posY_minus, btn_posY_plus;
var btn_sizeGD_minus, btn_sizeGD_plus;

var cir1s, cir2s, cir3s;
var O, O1, O2, O3;

var f, g, h;
var t, u, v;

function trilliant()
{
	elem = document.getElementById('canvas_01');
	ctx = elem.getContext("2d");
	elem.style.position = "relative";
	elem.style.border = "1px solid";
	
	SCALE = 400;
	xC = elem.width / 2; 
	yC = elem.height / 2;
	yC = yC + 100;
	
	O = new Point2D (0, 0);
	init_trilliant(lw, rs);
	draw_trilliant(lw, rs);
	pars_value();
	AddButtons();
	
	elem.onmousemove = mouse_move;
 }

function init_trilliant()
{
	var i;
			
	var Rs1 = rs;
	var Rs2 = rs;
	var Rs3 = rs;
	
	var R1 = 1.0 - Rs1;
	var R2 = 1.0 - Rs2;
	var R3 = 1.0 - Rs3;	
	
	O1 = new Point2D(-(R1 - Rs1)/2, 0.0);
	O2 = new Point2D( (R1 - Rs2)/2, 0.0);
	O3 = new Point2D( 0.0, (R1 - Rs3) * Math.sin(60*DEGREE));	
	
	var cir1 = new Circle2D(O1, R1);
	var cir2 = new Circle2D(O2, R2);
	var cir3 = new Circle2D(O3, R3);
	
	cir1s = new Circle2D(O1, Rs1 + EPSILON);
	cir2s = new Circle2D(O2, Rs2 + EPSILON);
	cir3s = new Circle2D(O3, Rs3 + EPSILON);
	
	var ln1 = new Line2D(O3, new Point2D(0, 1));
	var ln2 = new Line2D(O2, new Point2D(O2[0] + Math.cos(-30*DEGREE), O2[1] + Math.sin(-30*DEGREE)));

	var points = cir3s.Intersection_LineCircle(ln1);
	if (points == null)
	{
		return null;
	}
	if (points[0][1] > points[1][1])
	{
		girdle[0] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle[0] = new Point2D(points[1][0], points[1][1]);		
	}	
	
	points = cir2s.Intersection_LineCircle(ln2);
	if (points == null)
	{
		return null;
	}
	if (points[0][0] > points[1][0])
	{
		girdle[16] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle[16] = new Point2D(points[1][0], points[1][1]);		
	}


	// Точки пересечения окружностей cir1 и cir2 с сопрягающей окружностью cir3
	points = cir1.Intersection_TwoCircles(cir3s);
	if (points == null)
	{
		return null;
	}
	F = new Point2D(points[0][0], points[0][1]); 
	
	points = cir1.Intersection_TwoCircles(cir2s);
	if (points == null)
	{
		return null;
	}
	G = new Point2D(points[0][0], points[0][1]); 
	
	points = cir3.Intersection_TwoCircles(cir2s);
	if (points == null)
	{
		return null;
	}
	H = new Point2D(points[0][0], points[0][1]); 
	
	var O3_f = new Line2D(O3, F);
	var O2_g = new Line2D(O2, G);
	
	// Точки на радиусах сопрягающей окружности cir3
	t = new Point2D(O3[0] + Math.cos(M_PI_2 - angle),     O3[1] + Math.sin(M_PI_2 - angle));
	u = new Point2D(O2[0] + Math.cos(-30*DEGREE + angle), O2[1] + Math.sin(-30*DEGREE + angle));
	v = new Point2D(O2[0] + Math.cos(-30*DEGREE - angle), O2[1] + Math.sin(-30*DEGREE - angle));
	

	// Прямые используемые для нахождения границ сегментов рундиста.
	//      ln_O3_t, ln_O2_u, ln_O2_v;
	var ln_O3_t = new Line2D(O3, t);
	var ln_O2_u = new Line2D(O2, u);
	var ln_O2_v = new Line2D(O2, v);	
	
	// girdle[4]
	points = cir1.Intersection_LineCircle(ln_O3_t);
	if (points == null)
	{
		return null;
	}	
	if (points[0][0] > points[1][0])
	{
		girdle[4] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle[4] = new Point2D(points[1][0], points[1][1]);		
	}

	// girdle[12]
	points = cir1.Intersection_LineCircle(ln_O2_u);
	if (points == null)
	{
		return null;
	}		
	if (points[0][0] > points[1][0])
	{
		girdle[12] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle[12] = new Point2D(points[1][0], points[1][1]);		
	}

	// girdle[20]
	points = cir3.Intersection_LineCircle(ln_O2_v);
	if (points == null)
	{
		return null;
	}
	if (points[0][1] < points[1][1])
	{
		girdle[20] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle[20] = new Point2D(points[1][0], points[1][1]);		
	}

	
	// Вершина gd8 (girdle[8]) - расположена на окружности cir1 (с центром в точке O1)
	// Угол gd8 - O1 - O2  составляет 30 угловых градусов 
	ln1 = new Line2D(O1, new Point2D(O1[0] + Math.cos(30*DEGREE), 
									 O1[1] + Math.sin(30*DEGREE)));
									 
	points = cir1.Intersection_LineCircle(ln1);
	if (points == null)
	{
		return null;
	}
	if (points[0][0] > points[1][0])
	{
		girdle[8] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle[8] = new Point2D(points[1][0], points[1][1]);		
	}

	girdle[24] = new Point2D(0, girdle[0][1] - R1 - Rs1);

	// Остальной рундист
	var x,y;
	var Fi1 = Math.atan2((girdle[0][1] - O1[1]), (girdle[0][0] - O1[0]));
	var Fi2 = Math.atan2((girdle[4][1] - O1[1]), (girdle[4][0] - O1[0]));
	var ang = Fi2;
	var dAng = (Fi1 - Fi2) / 4; // Угловой шаг

	var gr1 = Fi1 * 180 / M_PI;
	var gr2 = Fi2 * 180 / M_PI;
	var gr12 = dAng * 180 / M_PI;

	// seg1
	for(i = 3; i > 0; i--)
	{
		ang = ang + dAng;
		x = Math.cos(ang)*R1 + O1[0];
		if(x < F[0]) // Левее точки пересечения окружностей cir1 и cir3s
		{
			// Пересечение прямой с сопрягающей окружностью cir3s
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir3s.Intersection_LineCircle(line1);
			if (points == null)
			{
				return null;
			}
			if (points[0][1] > points[1][1])
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
			y = Math.sin(ang)*R1 + O1[1];
		}
		girdle[i] = new Point2D(x, y);
	}

	
	Fi1 = Math.atan2((girdle[4][1] - O1[1]), (girdle[4][0] - O1[0]));
	Fi2 = Math.atan2((girdle[8][1] - O1[1]), (girdle[8][0] - O1[0]));
	ang = Fi2;
	dAng = (Fi1 - Fi2)/4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;	
	
	for(i = 7; i > 4; i--)
	{
		ang = ang + dAng;
		x = Math.cos(ang)*R1 + O1[0];
		if(x < F[0]) // Левее точки пересечения окружностей cir1 и cir3s
		{
			// Пересечение прямой с сопрягающей окружностью cir3s
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir3s.Intersection_LineCircle(line1);
			if (points == null)
			{
				return null;
			}			
			if (points[0][1] > points[1][1])
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
			y = Math.sin(ang)*R1 + O1[1];
		}
		girdle[i] = new Point2D(x, y);
	}
	
	Fi1 = Math.atan2((girdle[8][1] - O1[1]), (girdle[8][0] - O1[0]));
	Fi2 = Math.atan2((girdle[12][1] - O1[1]), (girdle[12][0] - O1[0]));
	ang = Fi1;
	dAng = (Fi1 - Fi2)/4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;	
	
	for(i = 9; i < 12; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R1 + O1[1];
		if(y < G[1]) // Ниже точки пересечения окружностей cir1 и cir2s
		{
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir2s.Intersection_LineCircle(line1);
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
			x = Math.cos(ang)*R1 + O1[0];
		}
		girdle[i] = new Point2D(x, y);
	}
	
	Fi1 = Math.atan2((girdle[12][1] - O1[1]), (girdle[12][0] - O1[0]));
	Fi2 = Math.atan2((girdle[16][1] - O1[1]), (girdle[16][0] - O1[0]));
	ang = Fi1;
	dAng = (Fi1 - Fi2)/4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;	

	for(i = 13; i < 16; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R1 + O1[1];
		if(y < G[1]) // Ниже точки пересечения окружностей cir1 и cir2s
		{
			// Пересечение прямой с сопрягающей окружностью cir2s
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir2s.Intersection_LineCircle(line1);
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
			x = Math.cos(ang)*R1 + O1[0];
		}
		girdle[i] = new Point2D(x, y);
	}
	
	Fi1 = Math.atan2((girdle[16][0] - O3[0]), (O3[1] - girdle[16][1]));
	Fi2 = Math.atan2((girdle[20][0] - O3[0]), (O3[1] - girdle[20][1]));

	ang = Fi2;
	dAng = (Fi1 - Fi2)/4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;

	for(i = 19; i > 16; i--)
	{
		ang = ang + dAng;
		x = Math.sin(ang)*R3 + O3[0];
		if(x > H[0]) // Правее точки пересечения окружностей cir3 и cir2s
		{
			// Пересечение прямой с сопрягающей окружностью cir2s
			gr1 = ang * 180 / M_PI;	
			var line1 = new Line2D();
			var vector1 = new Vector2D(-Math.sin(ang), Math.cos(ang));
			line1.CreateLineVectorPoint(vector1, O3);
			points = cir2s.Intersection_LineCircle(line1);
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
			y = - Math.cos(ang)*R3 + O3[1];
		}
		girdle[i] = new Point2D(x, y);
	}

	Fi1 = Math.atan2((girdle[20][0] - O3[0]), (O3[1] - girdle[20][1]));
	Fi2 = Math.atan2((girdle[24][0] - O3[0]), (O3[1] - girdle[24][1]));

	ang = Fi2;
	dAng = (Fi1 - Fi2) / 4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;

	for(i = 23; i > 20; i--)
	{
		ang = ang + dAng;
		x = Math.sin(ang)*R3 + O3[0];
		if(x > H[0]) // Правее точки пересечения окружностей cir3 и cir2s
		{
			// Пересечение прямой с сопрягающей окружностью cir2s
			gr1 = ang * 180 / M_PI;
			var line1 = new Line2D();
			var vector1 = new Vector2D(-Math.sin(ang), Math.cos(ang));
			line1.CreateLineVectorPoint(vector1, O3);
			points = cir2s.Intersection_LineCircle(line1);
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
			y = - Math.cos(ang)*R3 + O3[1];
		}
		girdle[i] = new Point2D(x, y);
	}


	for (i = 1; i < 24; i++)
	{
		girdle[48-i] = new Point2D(-girdle[i][0], girdle[i][1]);	
	}

	if (lw != 1)
	{
		for(i = 0; i < 48; i++)
		{
			girdle[i][1] = lw * girdle[i][1];
		}
	}
}

function lw_minus() { lw = lw - 0.1; redraw(); }
function lw_plus() { lw = lw + 0.1; redraw(); }
function rs_minus() { rs = rs - 0.01; redraw();}
function rs_plus() { rs = rs + 0.01; redraw();}
function angle_minus() { angle = angle - 1.0 *DEGREE; redraw();}
function angle_plus() { angle = angle + 1.0 *DEGREE; redraw();}

function draw_trilliant()	
{
	var i;
	
	// закраска области внутри рундиста
	fill_polygon(ctx, girdle, 48, '#dfe');
		
	// Draw points
	for (i = 0; i < 47; i++)
	{
		line_segment(ctx, girdle[i], girdle[i+1], 1, "R");
	}
	line_segment(ctx, girdle[47], girdle[0], 1, "R");
	
	
	// Text and vertexes
	
	for (i = 0; i < 48; i = i + 1)
	{
		if ( (i == 0) ||  (i == 4)  ||  (i == 8) || (i == 12) || (i == 16) || (i == 20) ||
			 (i == 24) || (i == 28) || (i == 32) || (i == 36) || (i == 40) ||
			 (i == 44) )
		{
			csp(ctx, girdle[i], 6, "B");
		}
		else
		{
			csp(ctx, girdle[i], 4, "B");
		}
	}		
	
	text1(ctx, "0", girdle[0], "rt", "up", "B", "16px Verdana");
	text1(ctx, "4", girdle[4], "md", "up", "B", "16px Verdana");
	text1(ctx, "8", girdle[8], "rt", "md", "B", "16px Verdana");
	text1(ctx, "12", girdle[12], "rt", "md", "B", "16px Verdana");
	text1(ctx, "16", girdle[16], "rt", "md", "B", "16px Verdana");
	text1(ctx, "20", girdle[20], "rt", "dn", "B", "16px Verdana");
	text2(ctx, "24", girdle[24], "md", "dn", "B", "16px Verdana");
	text1(ctx, "28", girdle[28], "lt", "dn", "B", "16px Verdana");
	text1(ctx, "32", girdle[32], "lt", "md", "B", "16px Verdana");
	
	text1(ctx, "36", girdle[36], "lt", "md", "B", "16px Verdana");
	text1(ctx, "40", girdle[40], "lt", "md", "B", "16px Verdana");
	text1(ctx, "44", girdle[44], "lt", "md", "B", "16px Verdana");
	
	if (lw == 1)
	{
		ctx.beginPath();
		ctx.arc(fx(O1[0]), fy(O1[1]), (1.0 - rs)*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 0.3;
		ctx.strokeStyle = '#ff0000';
		ctx.stroke();		
		
		ctx.beginPath();
		ctx.arc(fx(O1[0]), fy(O1[1]), (1.0 - 2*rs)*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 0.2;
		ctx.strokeStyle = '#000000';
		ctx.stroke();				
		
		ctx.beginPath();
		ctx.arc(fx(O2[0]), fy(O2[1]), (1.0 - rs)*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 0.3;
		ctx.strokeStyle = '#ff0000';
		ctx.stroke();
		
		ctx.beginPath();
		ctx.arc(fx(O2[0]), fy(O2[1]), (1.0 - 2*rs)*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 0.2;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
		
		ctx.beginPath();
		ctx.arc(fx(O3[0]), fy(O3[1]), (1.0 - rs)*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 0.3;
		ctx.strokeStyle = '#ff0000';
		ctx.stroke();		
		
		ctx.beginPath();
		ctx.arc(fx(O3[0]), fy(O3[1]), (1.0 - 2*rs)*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 0.2;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
		
		ctx.beginPath();
		ctx.arc(fx(O1[0]), fy(O1[1]), rs*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
		csp(ctx, O1, 4, "Black");
		text1(ctx, "O1", O1, "rt", "dn", "Black");
		segment_arrow(ctx, O1, girdle[8], 0.5, 0.2, "R");
		var pt = new Point2D(O1[0] + rs * Math.sin(-40*DEGREE),
							 O1[1] + rs * Math.cos(-40*DEGREE));
		segment_arrow(ctx, O1, pt, 0.5, 0.2, "R");	
		var pt = new Point2D(O1[0] + (rs/2) * Math.sin(-40*DEGREE),
							 O1[1] + (rs/2) * Math.cos(-40*DEGREE));
		text1(ctx, "rs", pt, "rt", "up", "R");
		
		ctx.beginPath();
		ctx.arc(fx(O2[0]), fy(O2[1]), rs*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
		
		csp(ctx, O2, 4, "Black");
		text1(ctx, "O2", O2, "rt", "dn", "Black");
		segment_arrow(ctx, O2, girdle[40], 0.5, 0.2, "R");
		var point_temp = new Point2D( O2[0] - (O2[0] - girdle[40][0])/(1.1), O2[1] - (O2[1] - girdle[40][1])/(1.1) );
		text1(ctx, "1.0 - rs", point_temp, "rt", "up", "R");
		
		pt = new Point2D(O2[0] + rs * Math.sin(-130*DEGREE),
						 O2[1] + rs * Math.cos(-130*DEGREE));
		segment_arrow(ctx, O2, pt, 0.5, 0.2, "R");	
		
		ctx.beginPath();
		ctx.arc(fx(O3[0]), fy(O3[1]), rs*SCALE, 0.0, 2.0 * Math.PI, false);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
		csp(ctx, O3, 4, "Black");
		text1(ctx, "O3", O3, "rt", "dn", "Black");
		segment_arrow(ctx, O3, girdle[25], 0.5, 0.2, "R");	
		pt = new Point2D(O3[0] + rs * Math.sin(-120*DEGREE),
						 O3[1] + rs * Math.cos(-120*DEGREE));
		segment_arrow(ctx, O3, pt, 0.5, 0.2, "R");
		
		rsp(ctx, F, 8, "Brown");
		rsp(ctx, G, 8, "Brown");
		rsp(ctx, H, 8, "Brown");
		text1(ctx, "F", F, "rt", "up", "Brown");
		text1(ctx, "G", G, "rt", "up", "Brown");
		text1(ctx, "H", H, "rt", "dn", "Brown");
		
		line_segment(ctx, O3, t, 0.5, "Gray");
		line_segment(ctx, O2, u, 0.5, "Gray");
		line_segment(ctx, O2, v, 0.5, "Gray");
		
		line_segment(ctx, O1, girdle[9], 0.2, "DarkOrchid");
		line_segment(ctx, O1, girdle[10], 0.2, "DarkOrchid");
		line_segment(ctx, O1, girdle[11], 0.2, "DarkOrchid");
		
		line_segment(ctx, O1, girdle[13], 0.2, "DarkOrchid");
		line_segment(ctx, O1, girdle[14], 0.2, "DarkOrchid");
		line_segment(ctx, O1, girdle[15], 0.2, "DarkOrchid");
		
		line_segment(ctx, O3, girdle[17], 0.2, "DarkOrchid");
		line_segment(ctx, O3, girdle[18], 0.2, "DarkOrchid");
		line_segment(ctx, O3, girdle[19], 0.2, "DarkOrchid");
		
		line_segment(ctx, O3, girdle[21], 0.2, "DarkOrchid");
		line_segment(ctx, O3, girdle[22], 0.2, "DarkOrchid");
		line_segment(ctx, O3, girdle[23], 0.2, "DarkOrchid");
		
		draw_angle(ctx, O3, Math.PI/2 - angle, Math.PI/2, 0.3, 1, "R");
		draw_angle(ctx, O3, Math.PI/2 - angle, Math.PI/2, 0.305, 1, "R");
		var b = Math.PI/2 - angle;
		var e = Math.PI/2;
		var mid = b + (e - b)/2;
		var p_mid = new Point2D(O3[0] + 0.3 * Math.cos(mid), O3[1] + 0.3 * Math.sin(mid));
		text1(ctx, "angle", p_mid, "rt", "up", "R");
		
		var pt = lnx(O1, girdle[32], -0.5);
		line_segment(ctx, O1, pt, 0.5, "Gray");
		pt = lnx(O1, girdle[36], -0.5);
		line_segment(ctx, O1, pt, 0.5, "Gray");
				
		draw_angle(ctx, O1, -Math.PI + 30*DEGREE - angle, -Math.PI + 30*DEGREE,  0.3, 1, "R");
		draw_angle(ctx, O1, -Math.PI + 30*DEGREE - angle, -Math.PI + 30*DEGREE,  0.305, 1, "R");
		
		var b = -Math.PI + 30*DEGREE - angle;
		var e = -Math.PI + 30*DEGREE;
		var mid = b + (e - b)/2;
		var p_mid = new Point2D(O1[0] + 0.3 * Math.cos(mid), O1[1] + 0.3 * Math.sin(mid));
		text1(ctx, "angle", p_mid, "lt", "up", "R");
		
		pt = lnx(O2, girdle[16], 0.5);
		line_segment(ctx, O2, pt, 0.5, "Gray");		
		draw_angle(ctx, O2, -30*DEGREE, -30*DEGREE + angle,  0.3, 1, "R");
		draw_angle(ctx, O2, -30*DEGREE, -30*DEGREE + angle,  0.305, 1, "R");
		b = -30*DEGREE;
		e = -30*DEGREE + angle;
		mid = b + (e - b)/2;
		p_mid = new Point2D(O2[0] + 0.315 * Math.cos(mid), O2[1] + 0.315 * Math.sin(mid));
		text1(ctx, "angle", p_mid, "rt", "md", "R");
		
		draw_angle(ctx, O2, -30*DEGREE - angle, -30*DEGREE,  0.35, 1, "R");
		draw_angle(ctx, O2, -30*DEGREE - angle, -30*DEGREE, 0.355, 1, "R");		
		b = -30*DEGREE - angle;
		e = -30*DEGREE;
		mid = b + (e - b)/2;		
		p_mid = new Point2D(O2[0] + 0.36 * Math.cos(mid), O2[1] + 0.36 * Math.sin(mid));
		text1(ctx, "angle", p_mid, "rt", "md", "R");		
		
		axes(ctx, 4, 4, 0.8, "#734a12");
	}
}

function redraw()
{
	ctx.clearRect(0, 0, 600, 600);
	init_trilliant();
	draw_trilliant();
	pars_value();
}

function pars_value()
{
	ctx.font = "italic 10pt Arial";	
	
	var text = "Radius of conjugation (rs)";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 30);		
	text = roundNumber(rs, 2);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 170, 30);
	
	var text = "Angle girdle (angle)";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 50);		
	text = roundNumber(Math.degrees(angle), 3) + "°";
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 170, 50);
	
	var text = "Girdle ratio (lw)";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 5, 70);		
	text = roundNumber(lw, 2);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(text, 170, 70);
	
	// Угол gd8 - O1 - O2  составляет 30 угловых градусов
	// s_vp + "( " + String.fromCharCode(8736) + " MBF" + " )";
	var text = "Угол gd[8] - O1 - O2 равен 30°"
	ctx.fillStyle = '#000000';
	ctx.fillText(text, 2, 95);
	text = "Угол gd[40] - O2 - O1 равен 30°"
	ctx.fillStyle = '#000000';
	ctx.fillText(text, 2, 110);
	text = "Угол gd[24] - O3 - O2 равен 30°"
	ctx.fillStyle = '#000000';
	ctx.fillText(text, 2, 125);
	text = "Угол O1 - O3 - O2 равен 60°"
	ctx.fillStyle = '#000000';
	ctx.fillText(text, 2, 140);	
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
	btn_rs_minus = new Btn2("-", "button", "200px", "15px" );
	btn_rs_plus = new Btn2("+", "button", "230px", "15px" );
	btn_rs_minus.name.addEventListener("click", rs_minus);
	btn_rs_plus.name.addEventListener("click", rs_plus);
	
	btn_angle_minus = new Btn2("-", "button", "200px", "35px" );
	btn_angle_plus = new Btn2("+", "button", "230px", "35px" );
	btn_angle_minus.name.addEventListener("click", angle_minus);
	btn_angle_plus.name.addEventListener("click", angle_plus);
	
	btn_lw_minus = new Btn2("-", "lw_minus", "200px", "55px" );
	btn_lw_plus = new Btn2("+", "lw_plus", "230px", "55px" );
	btn_lw_minus.name.addEventListener("click", lw_minus);
	btn_lw_plus.name.addEventListener("click", lw_plus);
	
	btn_posX_minus = new Btn2("◄", "posX_minus", "470px", "50px" );
	btn_posX_plus = new Btn2("►", "posX_plus", "510px", "50px" );
	btn_posY_plus = new Btn2("▲", "posY_plus", "490px", "20px" );
	btn_posY_minus = new Btn2("▼", "posY_minus", "490px", "80px" );
	
	btn_posX_minus.name.addEventListener("click", posX_minus);
	btn_posX_plus.name.addEventListener("click", posX_plus);
	btn_posY_minus.name.addEventListener("click", posY_minus);
	btn_posY_plus.name.addEventListener("click", posY_plus);
	
	btn_sizeGD_plus = new Btn2("Scale +", "sizeGD_plus", "510px", "120px" );
	btn_sizeGD_plus.id.style.width = "60px";
	btn_sizeGD_plus.id.style.height = "24px";
	btn_sizeGD_plus.id.style.fontSize = "14px";
	btn_sizeGD_plus.id.style.opacity = "0.7";
	btn_sizeGD_plus.id.style.fontWeight = "bold";
	
	btn_sizeGD_minus = new Btn2("Scale -", "sizeGD_minus", "440px", "120px" );
	btn_sizeGD_minus.id.style.width = "60px";
	btn_sizeGD_minus.id.style.height = "24px";
	btn_sizeGD_minus.id.style.fontSize = "14px";
	btn_sizeGD_minus.id.style.opacity = "0.7";
	btn_sizeGD_minus.id.style.fontWeight = "bold";
	
	btn_sizeGD_plus.name.addEventListener("click", sizeGD_plus);
	btn_sizeGD_minus.name.addEventListener("click", sizeGD_minus);
}

function posX_minus()
{
	xC = xC - 5;
	redraw();
}

function posX_plus()
{
	xC = xC + 5;
	redraw();
}

function posY_minus()
{
	yC = yC + 5;
	redraw();
}

function posY_plus()
{
	yC = yC - 5;
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
	ctx.clearRect(490, 150, 160, 30);
	var elem = document.getElementById('canvas_01');
	var coords = elem.getBoundingClientRect();
	
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
	ctx.fillText(xy_text, 500, 170);	
	
	// для проверки 
	//rsp(ctx, new Point2D(x_mouse, y_mouse), 4, "G");
}