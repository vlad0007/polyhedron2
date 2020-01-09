var DEGREE = 0.01745329251994;
var SQRT2 =  1.41421356237309;

var lw = 1.8;       // Отношение длины огранки к ее ширине
var vp = 0.0;       //  Угол, определяющий степень отклонения 
				 // кривой Ellipse_2 от окружности 
var Lh = 0.34;       // Отклонение смещения самого широкого места
var kY = 0.8;	     // Коэффициент растяжения огранки вдоль оси Y
var square_deviation = 0.0001;	//  Задает степень отклонения овала, определяющего 
					// форму огранки в поперечном сечении, от эллипса
var alpha_1 = 28*DEGREE; // Первый угол определяющий положение вершин на Ellipse_1
var alpha_2 = 62*DEGREE; // Второй угол определяющий положение вершин на Ellipse_1
var beta_1 = 11*DEGREE;  // Первый угол определяющий положение вершин на Ellipse_2
var beta_2 = 22*DEGREE;  // Второй угол определяющий положение вершин на Ellipse_2
var beta_3 = 33*DEGREE;  // Третий угол определяющий положение вершин на Ellipse_2
var gamma_1 = 2 * 90*DEGREE / 8; // Первый угол определяющий положение вершин на овале
var gamma_2 = 4 * 90 * DEGREE / 8; // Второй угол определяющий положение вершин на овале
var gamma_3 = 6 * 90 * DEGREE / 8; // Третий угол определяющий положение вершин на овале

var h_facet_ratio = 0.5; // Определяет положение вершин ближайших к острию
var flank_size = 0.1;    // Задает размер среза на тупой части огранки

var v = [];
var vertices = [];

var avia = 1.0;
var bomb = false;

function SetPoints_Ellipse_1(nPoints, angles)
{
	var v = lw * Lh - 0.5;
	var g = 1.0 + v + v;
	if ( v < 0 ) 
	{
		return 0;
	}
	var i;
	var arc = [];
	for (i = 0; i < nPoints; i++)
	{
		arc[i] = new Point3D(Math.cos(angles[i]), 0.0, g * Math.sin(angles[i]));
	}
	return arc; 
}

function SetPoints_Oval(
			nPoints, // количество точек на дуге эллипса (= 9)
			angles) // заданные значения углов gamma_1, gamma_2 и gamma_3
{
	if ( square_deviation < -1 || square_deviation >= 0.995 )
		return null;

    var p = 2 / ( 1 - square_deviation );
    var x, y, w;
	var arc = [];
	var i;
	for (i = 0; i < nPoints; i++)
	{
		x = Math.cos(angles[i]);
		y = Math.sin(angles[i]);
		w = Math.pow (Math.abs (x), p) + Math.pow (Math.abs (y), p);
		w = 1 / Math.pow ( w, 1/p );
		arc[i] = new Point2D(avia * w * x, kY * w * y);
		// arc[i] = new Point2D(0.81 * w * x, kY * w * y); // авиабомба
	}
	return arc; 
}

function SetPoints_Ellipse_2 ( nPoints, // количество точек на дуге эллипса (= 4)
							   angles)  // заданные значения углов 0*DEGREE, beta_1 . . . beta_4 
{
	var vv = lw * Lh - 0.5;
	var g = 1.0 + vv + vv;
	if ( g < 0 ) 
	{
		return null;
	}
	
	var u = 2 * lw - g;
    if ( u < 0 )
		return null;

	// Угол носика груши без внешней добавки
	// Без внешней добавки имеем окружность, а не эллипс
	var fi = Math.asin ( ( u + u ) / ( u * u + 1.0) );

	// Угол носика груши с внешней добавкой
	var psi = fi + vp;
	if ( psi >= Math.PI/2 )
	{
		null;
	}

	// Расстояние по оси OX от начала координат до точки,
	// где касательная к груши пересекает ось OX
	var t = u * Math.tan(psi);
	if ( t <= 2.0)
	{
		null;
	}

	// Полуось эллипса (смотри создание рундиста груши и
	// курсы аналитической геометрии)
	var a = ( t - 1.0 ) / ( t - 2.0 );
	
	// Координата x центра эллипса
	var s = a - 1.0;
	
	// После долгих вычислений находим вторую ось эллипса
	var b = - u * ( 1.0- t ) / Math.sqrt ( t * t - ( t + t ) );

	var arc = [];
	var i;
	for (i = 0; i < nPoints; i++)
	{
		arc[i] = new Point3D(a * Math.cos(angles[i]) - s, 0.0, b * Math.sin(angles[i]));
	}
    return arc;
}

function VerticesCalculation()
{
	var Z1 = new Vector3D(0, 0, 1);
	var nRose  = 129; // Количество вершин огранки

	//  Находим девять точек лежащих на одной четверти линии овала.
	// Точка arc_Oval[0] = (1.0, 0.0)
	// ..................................
	// Точка arc_Oval[8] = (0.0, kY * 1.0)
	//  На двух соседних овалах, разнесенных по оси Z, вершины овалов 
	// смещены относительно друг друга если их спроецировать на плоскость OXY
	var angles_oval = [0.0,
				gamma_1/2,
				gamma_1,
				gamma_1 + (gamma_2 - gamma_1)/2,
				gamma_2,
				gamma_2 + (gamma_3 - gamma_2)/2,
				gamma_3,
				gamma_3 + (Math.PI/2 - gamma_3)/2,
				Math.PI/2];
	var arc_Oval = SetPoints_Oval(9, angles_oval);		

	// Инициализация острой части груши
	var vv = lw * Lh - 0.5;
	var g = 1.0 + vv + vv;
	if ( g < 0 ) 
	{
		return null;
	}
	var u = 2 * lw - g;
    if ( u < 0 )
	{
		return null;
	}
	var max_point_Z = u; // Координата Z острия огранки	
	
	var angles_Ellipse_2 = [0*DEGREE, beta_1, beta_2, beta_3];
	var arc_Ellipse_2 = SetPoints_Ellipse_2(4, angles_Ellipse_2);	

	var x, y, z;
	
	// Острие (носик) огранки
	v[0] = new Point3D(0.0, 0.0, max_point_Z);

	// Вершины лежащие на наибольшем по размере овале
	// (на пятом считая, от острия, по порядку овале)
	x = arc_Oval[1][0];
	y = arc_Oval[1][1];
	z = 0.0;
	v[68] = new Point3D(x, y, z);
	
	x = arc_Oval[3][0];
	y = arc_Oval[3][1];
	z = 0.0;
	v[67] = new Point3D(x, y, z);

	x = arc_Oval[5][0];
	y = arc_Oval[5][1];
	z = 0.0;
	v[66] = new Point3D(x, y, z);

	x = arc_Oval[7][0];
	y = arc_Oval[7][1];
	z = 0.0;
	v[65] = new Point3D(x, y, z);

	// Вершины лежащие на четвертом, считая от острия, по порядку овале
	x = arc_Ellipse_2[1][0] * arc_Oval[0][0];
	y = 0.0;
	z = arc_Ellipse_2[1][2];
	v[53] = new Point3D(x, y, z);

	x = arc_Ellipse_2[1][0] * arc_Oval[2][0];
	y = arc_Ellipse_2[1][0] * arc_Oval[2][1];
	z = arc_Ellipse_2[1][2];
	v[52] = new Point3D(x, y, z);

	x = arc_Ellipse_2[1][0] * arc_Oval[4][0];
	y = arc_Ellipse_2[1][0] * arc_Oval[4][1];
	z = arc_Ellipse_2[1][2];
	v[51] = new Point3D(x, y, z);

	x = arc_Ellipse_2[1][0] * arc_Oval[6][0];
	y = arc_Ellipse_2[1][0] * arc_Oval[6][1];
	z = arc_Ellipse_2[1][2];
	v[50] = new Point3D(x, y, z);

	x = 0.0;
	y = arc_Ellipse_2[1][0] * arc_Oval[8][1];
	z = arc_Ellipse_2[1][2];
	v[49] = new Point3D(x, y, z);

	// Вершины лежащие на третьем, считая от острия, по порядку овале
	x = arc_Ellipse_2[2][0] * arc_Oval[1][0];
	y = arc_Ellipse_2[2][0] * arc_Oval[1][1];
	z = arc_Ellipse_2[2][2];
	v[36] = new Point3D(x, y, z);

	x = arc_Ellipse_2[2][0] * arc_Oval[3][0];
	y = arc_Ellipse_2[2][0] * arc_Oval[3][1];
	z = arc_Ellipse_2[2][2];
	v[35] = new Point3D(x, y, z);

	x = arc_Ellipse_2[2][0] * arc_Oval[5][0];
	y = arc_Ellipse_2[2][0] * arc_Oval[5][1];
	z = arc_Ellipse_2[2][2];
	v[34] = new Point3D(x, y, z);

	x = arc_Ellipse_2[2][0] * arc_Oval[7][0];
	y = arc_Ellipse_2[2][0] * arc_Oval[7][1];
	z = arc_Ellipse_2[2][2];
	v[33] = new Point3D(x, y, z);

	// Вершины лежащие на втором, считая от острия, по порядку овале
	x = arc_Ellipse_2[3][0] * arc_Oval[0][0];
	y = 0.0;
	z = arc_Ellipse_2[3][2];
	v[21] = new Point3D(x, y, z);

	x = arc_Ellipse_2[3][0] * arc_Oval[2][0];
	y = arc_Ellipse_2[3][0] * arc_Oval[2][1];
	z = arc_Ellipse_2[3][2];
	v[20] = new Point3D(x, y, z);

	x = arc_Ellipse_2[3][0] * arc_Oval[4][0];
	y = arc_Ellipse_2[3][0] * arc_Oval[4][1];
	z = arc_Ellipse_2[3][2];
	v[19] = new Point3D(x, y, z);

	x = arc_Ellipse_2[3][0] * arc_Oval[6][0];
	y = arc_Ellipse_2[3][0] * arc_Oval[6][1];
	z = arc_Ellipse_2[3][2];
	v[18] = new Point3D(x, y, z);

	x = 0.0;
	y = arc_Ellipse_2[3][0] * arc_Oval[8][1];
	z = arc_Ellipse_2[3][2];
	v[17] = new Point3D(x, y, z);
	
	//  Расчет координат вершин лежащие на первом, 
	// считая от острия, по порядку овале
	var a = arc_Ellipse_2[3][0]; // полуось эллипса

	// Координаты пересечения касательных к овалу с осью X
	// в его вершинах 18, 19 и 20
	var x1 = (a * a) / v[18][0];
	var x2 = (a * a) / v[19][0];
	var x3 = (a * a) / v[20][0];

	var vec_17 = new Vector3D(1, 0, 0);
	vec_17.Normer();
	var vec = new Vector3D(v[0][0] - v[17][0], v[0][1] - v[17][1], v[0][2] - v[17][2]);
	vec.Normer();
	var normal = vec.Cross(vec_17);
	normal.Normer();
	var pl_0 = new Plane3D();
	pl_0.CreatePlaneNormalVectorPoint(normal, v[0]);
	
	var vec_18 = new Vector3D(x1 - v[18][0], -v[18][1], 0);
	vec_18.Normer();
	vec = new Vector3D(v[0][0] - v[18][0], v[0][1] - v[18][1], v[0][2] - v[18][2]);
	vec.Normer();
	normal = vec.Cross(vec_18);
	normal.Normer();
	var pl_1 = new Plane3D();
	pl_1.CreatePlaneNormalVectorPoint(normal, v[0]);
	
	var vec_19 = new Vector3D(x2 - v[19][0], -v[19][1], 0);
	vec_19.Normer();
	vec = new Vector3D(v[0][0] - v[19][0], v[0][1] - v[19][1], v[0][2] - v[19][2]);
	vec.Normer();
	normal = vec.Cross(vec_19);
	normal.Normer();
	var pl_2 = new Plane3D();
	pl_2.CreatePlaneNormalVectorPoint(normal, v[0]);
	
	var vec_20 = new Vector3D(x3 - v[20][0], -v[20][1], 0);
	vec_20.Normer();
	vec = new Vector3D(v[0][0] - v[20][0], v[0][1] - v[20][1], v[0][2] - v[20][2]);
	vec.Normer();
	normal = vec.Cross(vec_20);
	normal.Normer();
	var pl_3 = new Plane3D();
	pl_3.CreatePlaneNormalVectorPoint(normal, v[0]);

	var vec_21 = new Vector3D(0, 1, 0);
	vec_21.Normer();
	vec = new Vector3D(v[0][0] - v[21][0], v[0][1] - v[21][1], v[0][2] - v[21][2]);
	vec.Normer();
	normal = vec.Cross(vec_21);
	normal.Normer();
	var pl_4 = new Plane3D();
	pl_4.CreatePlaneNormalVectorPoint(normal, v[0]);	

	/////////////////////////////////////////////////////////////////////
	// Проводим горизонтальную плоскость на уровне точки h_facet_ratio
	/////////////////////////////////////////////////////////////////////
	var h = v[17][2] + (v[0][2] - v[17][2]) * h_facet_ratio;
	var planeHor = new Plane3D();
	planeHor.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, h));
	// Находим координаты вершин 1, 2, 3 и 4
	v[1] = planeHor.IntersectionThreePlanes(pl_0, pl_1);
	v[2] = planeHor.IntersectionThreePlanes(pl_1, pl_2);
	v[3] = planeHor.IntersectionThreePlanes(pl_2, pl_3);
	v[4] = planeHor.IntersectionThreePlanes(pl_3, pl_4);
	
	
	//  Инициализация тупой части груши
	var b_ellipse = g;
	
	var angles_Ellipse_1 = [alpha_1, alpha_2];
	var arc_Ellipse_1 = SetPoints_Ellipse_1(2, angles_Ellipse_1);
	if (arc_Ellipse_1 == 0)
	{
		return;
	}

	// Вершины лежащие на пятом, считая от острия, по порядку овале
	x = arc_Ellipse_1[0][0] * arc_Oval[0][0];
	y = 0.0;
	z = -arc_Ellipse_1[0][2];
	v[85] = new Point3D(x, y, z);

	x = arc_Ellipse_1[0][0] * arc_Oval[2][0];
	y = arc_Ellipse_1[0][0] * arc_Oval[2][1];
	z = -arc_Ellipse_1[0][2];
	v[84] = new Point3D(x, y, z);

	x = arc_Ellipse_1[0][0] * arc_Oval[4][0];
	y = arc_Ellipse_1[0][0] * arc_Oval[4][1];
	z = -arc_Ellipse_1[0][2];
	v[83] = new Point3D(x, y, z);

	x = arc_Ellipse_1[0][0] * arc_Oval[6][0];
	y = arc_Ellipse_1[0][0] * arc_Oval[6][1];
	z = -arc_Ellipse_1[0][2];
	v[82] = new Point3D(x, y, z);

	x = 0.0;
	y = arc_Ellipse_1[0][0] * arc_Oval[8][1];
	z = -arc_Ellipse_1[0][2];
	v[81] = new Point3D(x, y, z);

	// Вершины лежащие на шестом, считая от острия, по порядку овале
	x = arc_Ellipse_1[1][0] * arc_Oval[1][0];
	y = arc_Ellipse_1[1][0] * arc_Oval[1][1];
	z = -arc_Ellipse_1[1][2];
	v[100] = new Point3D(x, y, z);

	x = arc_Ellipse_1[1][0] * arc_Oval[3][0];
	y = arc_Ellipse_1[1][0] * arc_Oval[3][1];
	z = -arc_Ellipse_1[1][2];
	v[99] = new Point3D(x, y, z);

	x = arc_Ellipse_1[1][0] * arc_Oval[5][0];
	y = arc_Ellipse_1[1][0] * arc_Oval[5][1];
	z = -arc_Ellipse_1[1][2];
	v[98] = new Point3D(x, y, z);

	x = arc_Ellipse_1[1][0] * arc_Oval[7][0];
	y = arc_Ellipse_1[1][0] * arc_Oval[7][1];
	z = -arc_Ellipse_1[1][2];
	v[97] = new Point3D(x, y, z);

	//!
	x = -v[97][0];
	y = v[97][1];
	z = v[97][2];
	v[112] = new Point3D(x, y, z);
	
	x = v[100][0];
	y = -v[100][1];
	z = v[100][2];
	v[101] = new Point3D(x, y, z);
	//!
	
	//  Определяем координаты вершин на площадке на тупом конце огранки
	// (площадка - седьмой и последний овал)
	// Плоскости, проходящие через точку down_point
	// и вершины лежащие на шестом, считая от острия , овале
	var down_point = new Point3D(0.0, 0.0, - b_ellipse);
	pl_0.CreatePlaneThreePoints(v[112], v[97], down_point);
	pl_1.CreatePlaneThreePoints(v[97], v[98], down_point);
	pl_2.CreatePlaneThreePoints(v[98], v[99], down_point);
	pl_3.CreatePlaneThreePoints(v[99], v[100], down_point);
	pl_4.CreatePlaneThreePoints(v[100], v[101], down_point);

	// Горизонтальная плоскость на уровне площадки 
	var flank_size_t = flank_size / v[100][0];
	h = ( - b_ellipse - v[100][2]) * flank_size_t;
	h = - b_ellipse - h;
	planeHor.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, h));

	// Вершины на площадке
	v[113] = planeHor.IntersectionThreePlanes(pl_0, pl_1);
	v[114] = planeHor.IntersectionThreePlanes(pl_1, pl_2);
	v[115] = planeHor.IntersectionThreePlanes(pl_2, pl_3);
	v[116] = planeHor.IntersectionThreePlanes(pl_3, pl_4);

	// Исходя из соображений симметрии находим остальные вершины огранки
	// Смметрия для остроугольной части огранки

	x = v[68][0];
	y = -v[68][1];
	z = v[68][2];
	v[69] = new Point3D(x, y, z);

	x = v[67][0];
	y = -v[67][1];
	z = v[67][2];
	v[70] = new Point3D(x, y, z);

	x = v[66][0];
	y = -v[66][1];
	z = v[66][2];
	v[71] = new Point3D(x, y, z);

	x = v[65][0];
	y = -v[65][1];
	z = v[65][2];
	v[72] = new Point3D(x, y, z);

	x = -v[72][0];
	y = v[72][1];
	z = v[72][2];
	v[73] = new Point3D(x, y, z);

	x = -v[71][0];
	y = v[71][1];
	z = v[71][2];
	v[74] = new Point3D(x, y, z);

	x = -v[70][0];
	y = v[70][1];
	z = v[70][2];
	v[75] = new Point3D(x, y, z);

	x = -v[69][0];
	y = v[69][1];
	z = v[69][2];
	v[76] = new Point3D(x, y, z);

	x = -v[68][0];
	y = v[68][1];
	z = v[68][2];
	v[77] = new Point3D(x, y, z);

	x = -v[67][0];
	y = v[67][1];
	z = v[67][2];
	v[78] = new Point3D(x, y, z);

	x = -v[66][0];
	y = v[66][1];
	z = v[66][2];
	v[79] = new Point3D(x, y, z);

	x = -v[65][0];
	y = v[65][1];
	z = v[65][2];
	v[80] = new Point3D(x, y, z);

	//  1111

	v[54] = new Point3D();
	v[54][0] = v[52][0];
	v[54][1] = -v[52][1];
	v[54][2] = v[52][2];

	v[55] = new Point3D();
	v[55][0] = v[51][0];
	v[55][1] = -v[51][1];
	v[55][2] = v[51][2];

	v[56] = new Point3D();	
	v[56][0] = v[50][0];
	v[56][1] = -v[50][1];
	v[56][2] = v[50][2];

	v[57] = new Point3D();
	v[57][0] = v[49][0];
	v[57][1] = -v[49][1];
	v[57][2] = v[49][2];

	v[58] = new Point3D();
	v[58][0] = -v[56][0];
	v[58][1] = v[56][1];
	v[58][2] = v[56][2];

	v[59] = new Point3D();
	v[59][0] = -v[55][0];
	v[59][1] = v[55][1];
	v[59][2] = v[55][2];

	v[60] = new Point3D();
	v[60][0] = -v[54][0];
	v[60][1] = v[54][1];
	v[60][2] = v[54][2];

	v[61] = new Point3D();
	v[61][0] = -v[53][0];
	v[61][1] = v[53][1];
	v[61][2] = v[53][2];
	
	v[62] = new Point3D();
	v[62][0] = -v[52][0];
	v[62][1] = v[52][1];
	v[62][2] = v[52][2];

	v[63] = new Point3D();
	v[63][0] = -v[51][0];
	v[63][1] = v[51][1];
	v[63][2] = v[51][2];

	v[64] = new Point3D();
	v[64][0] = -v[50][0];
	v[64][1] = v[50][1];
	v[64][2] = v[50][2];

	// 2222

	v[37] = new Point3D();
	v[37][0] = v[36][0];
	v[37][1] = -v[36][1];
	v[37][2] = v[36][2];

	v[38] = new Point3D();
	v[38][0] = v[35][0];
	v[38][1] = -v[35][1];
	v[38][2] = v[35][2];
	
	v[39] = new Point3D();
	v[39][0] = v[34][0];
	v[39][1] = -v[34][1];
	v[39][2] = v[34][2];
	
	v[40] = new Point3D();
	v[40][0] = v[33][0];
	v[40][1] = -v[33][1];
	v[40][2] = v[33][2];

	v[41] = new Point3D();
	v[41][0] = -v[40][0];
	v[41][1] = v[40][1];
	v[41][2] = v[40][2];

	v[42] = new Point3D();
	v[42][0] = -v[39][0];
	v[42][1] = v[39][1];
	v[42][2] = v[39][2];

	v[43] = new Point3D();
	v[43][0] = -v[38][0];
	v[43][1] = v[38][1];
	v[43][2] = v[38][2];

	v[44] = new Point3D();
	v[44][0] = -v[37][0];
	v[44][1] = v[37][1];
	v[44][2] = v[37][2];

	v[45] = new Point3D();
	v[45][0] = -v[36][0];
	v[45][1] = v[36][1];
	v[45][2] = v[36][2];

	v[46] = new Point3D();
	v[46][0] = -v[35][0];
	v[46][1] = v[35][1];
	v[46][2] = v[35][2];

	v[47] = new Point3D();
	v[47][0] = -v[34][0];
	v[47][1] = v[34][1];
	v[47][2] = v[34][2];

	v[48] = new Point3D();
	v[48][0] = -v[33][0];
	v[48][1] = v[33][1];
	v[48][2] = v[33][2];

	// 3333

	v[22] = new Point3D();
	v[22][0] = v[20][0];
	v[22][1] = -v[20][1];
	v[22][2] = v[20][2];

	v[23] = new Point3D();
	v[23][0] = v[19][0];
	v[23][1] = -v[19][1];
	v[23][2] = v[19][2];

	v[24] = new Point3D();
	v[24][0] = v[18][0];
	v[24][1] = -v[18][1];
	v[24][2] = v[18][2];

	v[25] = new Point3D();
	v[25][0] = v[17][0];
	v[25][1] = -v[17][1];
	v[25][2] = v[17][2];

	v[26] = new Point3D();
	v[26][0] = -v[24][0];
	v[26][1] = v[24][1];
	v[26][2] = v[24][2];

	v[27] = new Point3D();
	v[27][0] = -v[23][0];
	v[27][1] = v[23][1];
	v[27][2] = v[23][2];

	v[28] = new Point3D();
	v[28][0] = -v[22][0];
	v[28][1] = v[22][1];
	v[28][2] = v[22][2];

	v[29] = new Point3D();
	v[29][0] = -v[21][0];
	v[29][1] = v[21][1];
	v[29][2] = v[21][2];

	v[30] = new Point3D();
	v[30][0] = -v[20][0];
	v[30][1] = v[20][1];
	v[30][2] = v[20][2];

	v[31] = new Point3D();
	v[31][0] = -v[19][0];
	v[31][1] = v[19][1];
	v[31][2] = v[19][2];

	v[32] = new Point3D();
	v[32][0] = -v[18][0];
	v[32][1] = v[18][1];
	v[32][2] = v[18][2];

	//  4444
	
	v[5] = new Point3D();
	v[5][0] = v[4][0];
	v[5][1] = -v[4][1];
	v[5][2] = v[4][2];

	v[6] = new Point3D();
	v[6][0] = v[3][0];
	v[6][1] = -v[3][1];
	v[6][2] = v[3][2];
	
	v[7] = new Point3D();
	v[7][0] = v[2][0];
	v[7][1] = -v[2][1];
	v[7][2] = v[2][2];

	v[8] = new Point3D();
	v[8][0] = v[1][0];
	v[8][1] = -v[1][1];
	v[8][2] = v[1][2];

	v[9] = new Point3D();
	v[9][0] = -v[8][0];
	v[9][1] = v[8][1];
	v[9][2] = v[8][2];

	v[10] = new Point3D();
	v[10][0] = -v[7][0];
	v[10][1] = v[7][1];
	v[10][2] = v[7][2];

	v[11] = new Point3D();
	v[11][0] = -v[6][0];
	v[11][1] = v[6][1];
	v[11][2] = v[6][2];

	v[12] = new Point3D();
	v[12][0] = -v[5][0];
	v[12][1] = v[5][1];
	v[12][2] = v[5][2];

	v[13] = new Point3D();
	v[13][0] = -v[4][0];
	v[13][1] = v[4][1];
	v[13][2] = v[4][2];

	v[14] = new Point3D();
	v[14][0] = -v[3][0];
	v[14][1] = v[3][1];
	v[14][2] = v[3][2];

	v[15] = new Point3D();
	v[15][0] = -v[2][0];
	v[15][1] = v[2][1];
	v[15][2] = v[2][2];

	v[16] = new Point3D();
	v[16][0] = -v[1][0];
	v[16][1] = v[1][1];
	v[16][2] = v[1][2];

	// Симметрия тупой части огранки 
	
	v[86] = new Point3D();
	v[86][0] = v[84][0];
	v[86][1] = -v[84][1];
	v[86][2] = v[84][2];

	v[87] = new Point3D();
	v[87][0] = v[83][0];
	v[87][1] = -v[83][1];
	v[87][2] = v[83][2];

	v[88] = new Point3D();
	v[88][0] = v[82][0];
	v[88][1] = -v[82][1];
	v[88][2] = v[82][2];

	v[89] = new Point3D();
	v[89][0] = v[81][0];
	v[89][1] = -v[81][1];
	v[89][2] = v[81][2];

	v[90] = new Point3D();
	v[90][0] = -v[88][0];
	v[90][1] = v[88][1];
	v[90][2] = v[88][2];

	v[91] = new Point3D();
	v[91][0] = -v[87][0];
	v[91][1] = v[87][1];
	v[91][2] = v[87][2];

	v[92] = new Point3D();
	v[92][0] = -v[86][0];
	v[92][1] = v[86][1];
	v[92][2] = v[86][2];
	
	v[93] = new Point3D();
	v[93][0] = -v[85][0];
	v[93][1] = v[85][1];
	v[93][2] = v[85][2];

	v[94] = new Point3D();
	v[94][0] = -v[84][0];
	v[94][1] = v[84][1];
	v[94][2] = v[84][2];

	v[95] = new Point3D();
	v[95][0] = -v[83][0];
	v[95][1] = v[83][1];
	v[95][2] = v[83][2];

	v[96] = new Point3D();
	v[96][0] = -v[82][0];
	v[96][1] = v[82][1];
	v[96][2] = v[82][2];

	//

	v[101] = new Point3D();
	v[101][0] = v[100][0];
	v[101][1] = -v[100][1];
	v[101][2] = v[100][2];

	v[102] = new Point3D();
	v[102][0] = v[99][0];
	v[102][1] = -v[99][1];
	v[102][2] = v[99][2];

	v[103] = new Point3D();
	v[103][0] = v[98][0];
	v[103][1] = -v[98][1];
	v[103][2] = v[98][2];

	v[104] = new Point3D();
	v[104][0] = v[97][0];
	v[104][1] = -v[97][1];
	v[104][2] = v[97][2];

	v[105] = new Point3D();
	v[105][0] = -v[104][0];
	v[105][1] = v[104][1];
	v[105][2] = v[104][2];

	v[106] = new Point3D();
	v[106][0] = -v[103][0];
	v[106][1] = v[103][1];
	v[106][2] = v[103][2];

	v[107] = new Point3D();
	v[107][0] = -v[102][0];
	v[107][1] = v[102][1];
	v[107][2] = v[102][2];

	v[108] = new Point3D();
	v[108][0] = -v[101][0];
	v[108][1] = v[101][1];
	v[108][2] = v[101][2];

	v[109] = new Point3D();
	v[109][0] = -v[100][0];
	v[109][1] = v[100][1];
	v[109][2] = v[100][2];

	v[110] = new Point3D();
	v[110][0] = -v[99][0];
	v[110][1] = v[99][1];
	v[110][2] = v[99][2];

	v[111] = new Point3D();
	v[111][0] = -v[98][0];
	v[111][1] = v[98][1];
	v[111][2] = v[98][2];

	v[112] = new Point3D();
	v[112][0] = -v[97][0];
	v[112][1] = v[97][1];
	v[112][2] = v[97][2];

	// Симметрия площадки со стороны тупой части огранки

	v[117] = new Point3D();
	v[117][0] = v[116][0];
	v[117][1] = -v[116][1];
	v[117][2] = v[116][2];

	v[118] = new Point3D();
	v[118][0] = v[115][0];
	v[118][1] = -v[115][1];
	v[118][2] = v[115][2];

	v[119] = new Point3D();
	v[119][0] = v[114][0];
	v[119][1] = -v[114][1];
	v[119][2] = v[114][2];

	v[120] = new Point3D();
	v[120][0] = v[113][0];
	v[120][1] = -v[113][1];
	v[120][2] = v[113][2];

	v[121] = new Point3D();
	v[121][0] = -v[120][0];
	v[121][1] = v[120][1];
	v[121][2] = v[120][2];

	v[122] = new Point3D();
	v[122][0] = -v[119][0];
	v[122][1] = v[119][1];
	v[122][2] = v[119][2];

	v[123] = new Point3D();
	v[123][0] = -v[118][0];
	v[123][1] = v[118][1];
	v[123][2] = v[118][2];

	v[124] = new Point3D();
	v[124][0] = -v[117][0];
	v[124][1] = v[117][1];
	v[124][2] = v[117][2];

	v[125] = new Point3D();
	v[125][0] = -v[116][0];
	v[125][1] = v[116][1];
	v[125][2] = v[116][2];

	v[126] = new Point3D();
	v[126][0] = -v[115][0];
	v[126][1] = v[115][1];
	v[126][2] = v[115][2];

	v[127] = new Point3D();
	v[127][0] = -v[114][0];
	v[127][1] = v[114][1];
	v[127][2] = v[114][2];

	v[128] = new Point3D();
	v[128][0] = -v[113][0];
	v[128][1] = v[113][1];
	v[128][2] = v[113][2];

	for(i = 0; i < 129; i++)
	{
		vertices.push(v[i][0]);
		vertices.push(v[i][1]);
		vertices.push(v[i][2]);		
	}

	var ttt = 888;
}

var index_cut =
[
	// Острая часть огранки

	// Первый ярус

	// A

	0, 1, 17, 16, 0, //0
	0, 2, 18, 1, 0,	// 1
	0, 3, 19, 2, 0,  //2
	0, 4, 20, 3, 0,  //3
	0, 5, 21, 4, 0,  // 4
	0, 6, 22, 5, 0,  //5
	0, 7, 23, 6, 0,  // 6
	0, 8, 24, 7, 0,  // 7
	0, 9, 25, 8, 0,  // 8
	0, 10, 26, 9, 0,  // 9
	0, 11, 27, 10, 0,  // 10
	0, 12, 28, 11, 0,  // 11
	0, 13, 29, 12, 0,  // 12
	0, 14, 30, 13, 0,  // 13
	0, 15, 31, 14, 0,  // 14
	0, 16, 32, 15, 0,  // 15

	// B

	1, 18, 17, 1,      // 16
	2, 19, 18, 2,      // 17
	3, 20, 19, 3,      // 18
	4, 21, 20, 4,      // 19
	5, 22, 21, 5,      // 20
	6, 23, 22, 6,
	7, 24, 23, 7,
	8, 25, 24, 8,
	9, 26, 25, 9,
	10, 27, 26, 10,
	11, 28, 27, 11,
	12, 29, 28, 12,
	13, 30, 29, 13,
	14, 31, 30, 14,
	15, 32, 31, 15,     // 30
	16, 17, 32, 16,

	// Второй ярус

	// A

	17, 18, 33, 17,
	18, 19, 34, 18,
	19, 20, 35, 19,
	20, 21, 36, 20,
	21, 22, 37, 21,
	22, 23, 38, 22,
	23, 24, 39, 23,
	24, 25, 40, 24,
	25, 26, 41, 25,   // 40
	26, 27, 42, 26,   
	27, 28, 43, 27,
	28, 29, 44, 28,
	29, 30, 45, 29,
	30, 31, 46, 30,
	31, 32, 47, 31,
	32, 17, 48, 32,

	// B

	17, 33, 48, 17,
	18, 34, 33, 18,
	19, 35, 34, 19,   // 50
	20, 36, 35, 20,
	21, 37, 36, 21,
	22, 38, 37, 22,
	23, 39, 38, 23,
	24, 40, 39, 24,
	25, 41, 40, 25,
	26, 42, 41, 26,
	27, 43, 42, 27,
	28, 44, 43, 28,
	29, 45, 44, 29,  // 60
	30, 46, 45, 30,  
	31, 47, 46, 31,
	32, 48, 47, 32,

	// Третий ярус

	// A

	48, 33, 49, 48,
	33, 34, 50, 33,
	34, 35, 51, 34,
	35, 36, 52, 35,
	36, 37, 53, 36,
	37, 38, 54, 37,
	38, 39, 55, 38,  // 70
	39, 40, 56, 39,
	40, 41, 57, 40,
	41, 42, 58, 41,
	42, 43, 59, 42,
	43, 44, 60, 43,
	44, 45, 61, 44,
	45, 46, 62, 45,
	46, 47, 63, 46,
	47, 48, 64, 47,

	// B

	33, 50, 49, 33, // 80
	34, 51, 50, 34,   
	35, 52, 51, 35,
	36, 53, 52, 36,
	37, 54, 53, 37,
	38, 55, 54, 38,
	39, 56, 55, 39,
	40, 57, 56, 40,
	41, 58, 57, 41,
	42, 59, 58, 42,
	43, 60, 59, 43,  // 90
	44, 61, 60, 44,
	45, 62, 61, 45,
	46, 63, 62, 46,
	47, 64, 63, 47,
	48, 49, 64, 48,

	// Четвертый ярус

	// A

	49, 50, 65, 49,
	50, 51, 66, 50,
	51, 52, 67, 51,
	52, 53, 68, 52,
	53, 54, 69, 53,  // 100
	54, 55, 70, 54,
	55, 56, 71, 55,
	56, 57, 72, 56,
	57, 58, 73, 57,
	58, 59, 74, 58,
	59, 60, 75, 59,
	60, 61, 76, 60,
	61, 62, 77, 61,
	62, 63, 78, 62,
	63, 64, 79, 63,  // 110
	64, 49, 80, 64,

	// B

	49, 65, 80, 49, // Сделали нулевой !!!!!!!!
	50, 66, 65, 50,
	51, 67, 66, 51,
	52, 68, 67, 52,
	53, 69, 68, 53,
	54, 70, 69, 54,
	55, 71, 70, 55,
	56, 72, 71, 56,
	57, 73, 72, 57,
	58, 74, 73, 58,
	59, 75, 74, 59,
	60, 76, 75, 60,
	61, 77, 76, 61,
	62, 78, 77, 62,
	63, 79, 78, 63,
	64, 80, 79, 64,

	// Тупая часть огранки

	// Первый ярус (6)

	// A

	81, 80, 65, 81,
	82, 65, 66, 82,
	83, 66, 67, 83,
	84, 67, 68, 84,
	85, 68, 69, 85,
	86, 69, 70, 86,
	87, 70, 71, 87,
	88, 71, 72, 88,
	89, 72, 73, 89,
	90, 73, 74, 90,
	91, 74, 75, 91,
	92, 75, 76, 92,
	93, 76, 77, 93,
	94, 77, 78, 94,
	95, 78, 79, 95,
	96, 79, 80, 96,

	// B

	81, 65, 82, 81,
	82, 66, 83, 82,
	83, 67, 84, 83,
	84, 68, 85, 84,
	85, 69, 86, 85,
	86, 70, 87, 86,
	87, 71, 88, 87,
	88, 72, 89, 88,
	89, 73, 90, 89,
	90, 74, 91, 90,
	91, 75, 92, 91,
	92, 76, 93, 92,
	93, 77, 94, 93,
	94, 78, 95, 94,
	95, 79, 96, 95,
	96, 80, 81, 96,

	// Второй ярус (7)
	
	// A

	97, 112, 81, 97,
	98, 97, 82, 98,
	99, 98, 83, 99,
	100, 99, 84, 100,
	101, 100, 85, 101,
	102, 101, 86, 102,
	103, 102, 87, 103,
	104, 103, 88, 104,
	105, 104, 89, 105,
	106, 105, 90, 106,
	107, 106, 91, 107,
	108, 107, 92, 108,
	109, 108, 93, 109,
	110, 109, 94, 110,
	111, 110, 95, 111,
	112, 111, 96, 112,

	// B

	97, 81, 82, 97,
	98, 82, 83, 98,
	99, 83, 84, 99,
	100, 84, 85, 100,
	101, 85, 86, 101,
	102, 86, 87, 102,
	103, 87, 88, 103,
	104, 88, 89, 104,
	105, 89, 90, 105,
	106, 90, 91, 106,
	107, 91, 92, 107,
	108, 92, 93, 108,
	109, 93, 94, 109,
	110, 94, 95, 110,
	111, 95, 96, 111,
	112, 96, 81, 112,

	// Окончание

	128, 112, 97, 113, 128,
	113, 97, 98, 114, 113,
	114, 98, 99, 115, 114,
	115, 99, 100, 116, 115,
	116, 100, 101, 117, 116,
	117, 101, 102, 118, 117,
	118, 102, 103, 119, 118,
	119, 103, 104, 120, 119,
	120, 104, 105, 121, 120,
	121, 105, 106, 122, 121,
	122, 106, 107, 123, 122,
	123, 107, 108, 124, 123,
	124, 108, 109, 125, 124,
	125, 109, 110, 126, 125,
	126, 110, 111, 127, 126,
	127, 111, 112, 128, 127,

	//
	113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 113,

	-100
];

function facet_colors()
{
	var ind = 0;
	var i;	
	
	for (i = 0; i < 8; i++)
	{
		colors[ind] = new THREE.Color("rgb(150, 150, 250)"); ind++;
		colors[ind] = new THREE.Color("rgb(200, 150, 250)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(150, 100, 250)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(10, 100, 50)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(10, 100, 250)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(150, 100, 250)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(10, 70, 50)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(150, 90, 250)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(10, 160, 50)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(120, 130, 170)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(150, 60, 200)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(250, 60, 250)"); ind++;
	}
	for (i = 0; i < 16; i++)
	{
		colors[ind] = new THREE.Color("rgb(250, 200, 250)"); ind++;
	}
	for (i = 0; i < 8; i++) 
	{
		colors[ind] = new THREE.Color("rgb(70, 200, 250)"); ind++;
		colors[ind] = new THREE.Color("rgb(70, 90, 150)"); ind++;
	}
	colors[ind] = new THREE.Color("rgb(0, 90, 0)"); ind++;
};