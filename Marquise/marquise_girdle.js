
var girdle = [64];
var DEGREE = 0.01745329251994;
var M_PI = 3.14159265358979323846;

var ctx;
var btn_lw_plus, btn_lw_minus; 
var btn_vp_minus, btn_vp_plus;
var btn_return;

var lw = 2; 
var vp = 5.0*DEGREE;

var a, b, q, t, u, gamma, fi, psi;
	
var canvas;

// координаты мыши
var x_mouse, y_mouse;

var xC; // Centre x
var yC; // Centre y
var SCALE;  // SCALE

var elem1;
	
function initiate()
{					
	elem1 = document.getElementById('canvas_01');

	SCALE = 80;
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
	// Принимаем ширину рундиста огранки равной 2.
	// Следовательно длина огранки равна lw*2.
	// Поэтому координата Y точки B равна lw.
	// Обозначим эту величину буквой u.
	u = lw;
	if ( u < 0 ) 
		return null;

	// Находим угол наклона касательной к окружности в точке B к оси OY
	// fi = asin(OB/AB) или
	// fi = asin(OB/AC) или 
	// fi = asin(u/(OA + 1)
	// Обозначим s = OA, тогда 
	// fi = asin(u/(s + 1)
	// Так как прямоугольник AOB прямоугольный, то s*s + u*u = (s+1)*(s+1)
	// следовательно s = (u*u - 1)/2 и поэтому:
	fi = Math.asin ( ( u + u ) / ( u * u + 1.0) );
	// Находим угол наклона касательной к эллипсу в точке B к оси OY
	psi = fi + vp;  // δ = vp
	// Находим координату X точки пересечения касательной к эллипсу с осью OX.
	t = u * Math.tan(psi);
	if ( t <= 2.0) 
		return null;
	// Находим величину полуоси эллипса по горизонтали
	a = ( t - 1.0 ) / ( t - 2.0 );
	// Так как ширину рундиста огранки приняли равной 2, то координата X 
	// точки C равна 1. Следовательно величина отрезка O - O1 равна q.
	q = a - 1.0;
	// Находим величину полуоси эллипса по вертикали
	b = u * ( t - 1.0 ) / Math.sqrt( t * t - ( t + t ) );
	
	//  При расчете формы рундиста и получении формул используемых
	// для этого расчета (полуоси эллипса a и b) использовалось свйство касательной к эллипсу.
	// Смотри, напрмер, Н.И.Мусхелишвили "Курс аналитической геометрии" изд.5 § 241.
	// В обозначениях используемых при выводе рундиста на экран это свойство 
	// записывается следующим образом:
	// O1 - координата центра ellipse_1
	// M - координата X пересечения прямой касательной к ellipse_1 в точке B
	// C - координата X пересечения линии ellipse_1 с осью OX
	// a - величина горизонтальной полуоси эллипса ellipse_1			
	/*
	var O = new Point2D(0,0);
	var C = new Point2D(1,0);
	var O1 = new Point2D(C[0] - a, 0);
	var M = new Point2D(t, 0);
	var d1 = O1.Distance(O);
	var d2 = O1.Distance(M);
	var a2 = a * a;  		
	var ratio = (a*a) / ( d1*d2); // ratio = 1 
	*/
	//********************************************************************
	//      Используя введенные ранее обозначения:
	// q * (t + q) = a * a    - Это и есть свойство касательной к эллипсу.
	// Подставив в последнее выражение значение для q = a – 1.0,
	// получим значение для полуоси эллипса a = (t-1)/(t-2).
	// Для расчета величины полуоси эллипса b следут провести вертикальную
	// прямую через центр эллипса O1 и зафиксировать 
	// точку пересечения V этой прямой с касательной к эллипсу.
	// Затем, из рассмотрения подобных треугольников BWV и MOB
	// можно записать пропорцию  p / u = q / t   где p - длина отрезка WV.
	// Отсюда p = u * q / t
	// Исходя из вышеприведенного свойства касательной к эллипсу в точке B
	// можно записать  u * (p + u) = b * b 
	// Теперь зная, как вычисляются величины a, p, u, q, t мы можем записать
	// после некоторых преобразований значение для полуоси b:
	//      b = u * ( t - 1.0 ) / Math.sqrt( t * t - ( t + t ) );
	//************************************************************************
	
	// Расчет сегментов на рундисте.
	gamma = Math.acos ( q / a ); 
	//gamma = Math.atan( u / (a-1) );  - неправильная расстановка вершин
	// В отличии от MoonMarquise.html в этой программе рундист делится на фиксированные части.
	var delta = gamma/16;

	var i = 0;
	var ang_currrent = 0.0;

	var x, y, w;
	for ( i = 0; i < 17; i++ )
	{
		x = Math.cos(ang_currrent);
		y = -Math.sin(ang_currrent);

		girdle[i] = new Point2D( a * x - q, b * y);
		ang_currrent = ang_currrent + delta;
	}
	
	for ( i = 1; i < 17; i++ )
	{
		girdle[i+16] = new Point2D(-girdle[16-i][0], girdle[16-i][1]);
	}
	
	for ( i = 1; i < 17; i++ )
	{
		girdle[i+32] = new Point2D(girdle[32-i][0], -girdle[32-i][1]);
	}

	for ( i = 1; i < 16; i++ )
	{
		girdle[i+48] = new Point2D(-girdle[48-i][0], girdle[48-i][1]);
	}
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

function draw_girdle()
{
	var i;
	
	// закраска области внутри рундиста
	fill_polygon(ctx, girdle, 64, '#dfe');

	// Рисуем рундист		
	for (i = 0; i < 63; i++)
	{
		line_segment(ctx, girdle[i], girdle[i+1], 2, "B");
	}			
	line_segment(ctx, girdle[63], girdle[0], 2, "B");
	
	// Text and vertexes
	//ctx.font = "italic 10pt Arial";
	
	for (i = 0; i < 64; i = i + 1)
	{
		if ( (i == 0) ||  (i == 4)  ||  (i == 8) || (i == 12) || (i == 16) || (i == 20) ||
			 (i == 24) || (i == 28) || (i == 32) || (i == 36) || (i == 40) ||
			 (i == 44) || (i == 48) || (i == 52) || (i == 56) || (i == 60) )
		{
			rsp(ctx, girdle[i], 7, "B");
		}
		else
		{
			rsp(ctx, girdle[i], 5, "B");
		}
	}		
	
	text2(ctx, "0", girdle[0], "rt", "up", "B", "16px Verdana");
	text2(ctx, "4", girdle[4], "rt", "md", "B");
	text2(ctx, "8", girdle[8], "rt", "md", "B");
	text2(ctx, "12", girdle[12], "rt", "md", "B");
	text2(ctx, "16", girdle[16], "md", "dn", "B", "16px Verdana");
	text2(ctx, "20", girdle[20], "lt", "md", "B");
	text2(ctx, "24", girdle[24], "lt", "md", "B");
	text2(ctx, "28", girdle[28], "lt", "md", "B");
	text2(ctx, "32", girdle[32], "lt", "up", "B", "16px Verdana");
	
	text1(ctx, "36", girdle[36], "lt", "up", "B");
	text1(ctx, "40", girdle[40], "lt", "up", "B");
	text1(ctx, "44", girdle[44], "lt", "up", "B");
	text1(ctx, "48", girdle[48], "md", "up", "B", "16px Verdana");
	text1(ctx, "52", girdle[52], "rt", "up", "B");
	text1(ctx, "56", girdle[56], "rt", "up", "B");
	text1(ctx, "60", girdle[60], "rt", "up", "B");
}
	
function construction()	
{
	// Рисуем оси x и y
	axes(ctx, 15, 10, 0.8, "Brown");
	
	var O = [0,0];
	rsp(ctx, O, 5, "R");
	text1(ctx, "O", O, "lt", "up");			
	
	var s = (u * u - 1)/2;
	var A = [-s,0];
	rsp(ctx, A, 5, "R");
	text1(ctx, "A", A, "lt", "up");			
	

	var C = [1,0];
	rsp(ctx, C, 5, "R");
	text1(ctx, "C", C, "lt", "up");

	var O1 = [C[0] - a, 0];
	rsp(ctx, O1, 5, "R");		
	text1(ctx, "O1", O1, "rt", "up");
	
	var O2 = [-C[0] + a, 0];
	rsp(ctx, O2, 5, "R");		
	text1(ctx, "O2", O2, "lt", "up");

	var B = [0, -u];
	rsp(ctx, B, 8, "R");
	text2(ctx, "B", B, "md", "up");
	
	// Рисуем эллипсы
	drawEllipse(ctx, O1[0], O1[1], a, b, 0.5, "Black");
	drawEllipse(ctx, O2[0], O2[1], a, b, 0.5, "Black");
	
	// Рисуем окружность
	circle(ctx, new Point2D(-s, 0), s + 1, 0.5, "Black");
	
	var M = [t, 0];
	rsp(ctx, M, 4, "R");
	text1(ctx, "M", M, "md", "up");

	line(ctx, M, B, -15, 10, 0.5, "Black");
	line(ctx, A, B, 0.0, 2.0, 0.5, "Black");
	
	var ln_A_B = new Line2D(A, B);
	// Прямая проходящая через точки B и F
	var ln_A_B_n = ln_A_B.CreateNormalLinePoint(B);
	// ось X
	var line_X = new Line2D(new Point2D(-3, 0), new Point2D(3, 0));
	// Находим координаты точки F
	var F = ln_A_B_n.IntersectionTwoLines(line_X);
	rsp(ctx, F, 4, "R");
	text1(ctx, "F", F, "md", "dn");
	line(ctx, B, F, -15, 10, 0.5, "Black"); // прямая BF
	
	// &phi;
	var s_fi = String.fromCharCode(966);
	var s_psi = String.fromCharCode(968);	
	var s_vp = String.fromCharCode(948);
	var s_gamma = String.fromCharCode(947);
	
	var r = 1.2;
	var fi = Math.PI/2 - Math.asin(u/(s+1)); // угол с осью OX
	draw_angle_txt(ctx, B, fi, Math.PI/2, r, s_fi, "md", "up", 1, "R", "16px Verdana");
	draw_angle(ctx, B, fi, Math.PI/2, r - 0.03, 1, "R", "16px Verdana");
	
	r = 2.7;
	var psi = Math.PI/2 - (Math.asin(u/(s+1)) + vp); // угол с осью OX
	draw_angle_txt(ctx, B, psi, Math.PI/2, r, s_psi, "md", "up", 1, "R", "16px Verdana");
	draw_angle(ctx, B, psi, Math.PI/2, r - 0.03, 1, "R");
	
	r = 4.2;
	var ang1 = (Math.PI/2 -  Math.asin(u/(s+1)));
	var ang2 = (Math.PI/2 - (Math.asin(u/(s+1)) + vp))	
	if (vp >= 0)
	{
		draw_angle_txt(ctx, B, ang2, ang1, r, s_vp, "rt", "md", 1, "R", "16px Verdana");
		draw_angle(ctx, B, ang2, ang1, r - 0.05, 1, "R");
	}
	else 
	{
		draw_angle_txt(ctx, B, ang1, ang2, r, s_vp, "rt", "md", 1, "R", "16px Verdana");
		draw_angle(ctx, B, ang1, ang2, r - 0.05, 1, "R");
	}
	
	var text_circle = [-s, s+1];
	ctx.fillStyle = '#000';
	text1(ctx, "circle", text_circle, "rt", "up");
	
	var text_ellipse_1 = [O1[0], -b];
	text1(ctx, "ellipse 1", text_ellipse_1, "lt", "up");
	
	var text_ellipse_2 = [O2[0], -b];
	text1(ctx, "ellipse 2", text_ellipse_2, "rt", "up");
	
	// Рисуем вертикальную линию проходящую через точку O1
	line_segment(ctx, new Point2D(O1[0], O1[1] - 15), new Point2D(O1[0], O1[1] + 15), 0.3, "Black");
	
	// Рисуем горизонтальную линию проходящую через точку B
	line_segment(ctx, new Point2D(B[0] - 20, B[1]), new Point2D(B[0] + 10, B[1]), 0.3, "Black");
	
	var ln_O1_vert = new Line2D(O1, new Point2D(O1[0], 1));
	var ln_B_M = new Line2D(B, M);
	var V = ln_B_M.IntersectionTwoLines(ln_O1_vert);
	rsp(ctx, V, 6, "R");
	text1(ctx, "V", V, "lt", "dn");
	
	var ln_B_hor = new Line2D(B, new Point2D(1, B[1]));
	var W = ln_B_hor.IntersectionTwoLines(ln_O1_vert);
	rsp(ctx, W, 6, "R");
	text1(ctx, "W", W, "lt", "up");	

	// gamma
	draw_angle(ctx, O1, 0, 2*Math.PI,  a, 0.2, "Black");	
	
	var cir = new Circle2D(O1, a);
	var line_temp = new Line2D( new Point2D(0,0), new Point2D(0,1) );

	var points = cir.Intersection_LineCircle(line_temp);
	if (points == null)
	{
		return null;
	}
	var N = new Point2D();
	if (points[0][1] > points[1][1])
	{
		N[0] = points[1][0];
		N[1] = points[1][1];
	}
	else
	{
		N[0] = points[0][0];
		N[1] = points[1][1];
		
	}			
	rsp(ctx, N, 6, "R");
	
	line(ctx, O1, N, 0.0, 4.0, 0.5, "Black");
	text1(ctx, "N", N, "lt", "up");	

	draw_angle(ctx, O1, -gamma, 0,  0.5 + 0.03, 1, "R");
	draw_angle_txt(ctx, O1, -gamma, 0, 0.5, s_gamma, "rt", "md", 1, "R", "16px Verdana");
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
	
	text = "AB " + String.fromCharCode(8869) + " BF";
	ctx.fillStyle = "#00F";
	ctx.fillText(text, 2, 90);	

	text = "BF  " + "- касательная к  окружности circle в точке B";
	ctx.fillText(text, 2, 120);

	text = "BM  " + "- касательная к эллипсу ellipse 1 в точке B";
	ctx.fillText(text, 2, 150);		
	
	var s_fi = String.fromCharCode(966);
	var s_psi = String.fromCharCode(968);
	text = s_psi + " = " + s_fi + " + " + s_vp;
	ctx.fillText(text, 2, 180);		
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
	ctx.clearRect(700, 10, 120, 30);
	elem1 = document.getElementById('canvas_01');
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
	ctx.fillText(xy_text, 720, 35);	
	
	// для проверки 
	//rsp(ctx, new Point2D(x_mouse, y_mouse), 4, "G");
}



addEventListener("load", initiate);
	