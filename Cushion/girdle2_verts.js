var DEGREE = 0.01745329251994;
var M_PI =   3.14159265358979;
var SQRT2 =  1.41421356237309;

var lw = 1.2;      // Отношение длины огранки к ширине
var t = 0.60;     // Размер площадки
var r = 0.04;
var beta = 32*DEGREE;
var rounnd_cir1 = 0.094;	// "Roundness front"
var rounnd_cir2 = 0.094;	// "Roundness flank"
var R3 = 0.210;          // "Radius corner"
var dr = 0.08;    
var ratio = 0.75;

var vertices = [];
var girdle = [64];
var crown = [];
var pavil = [];	

function VerticesCalculation()
{
	InitGirdle();
	
	var i;

	// Корректировка положения вершин рундиста по оси Z
	corr_gd_crown(0, 4, 8);
	corr_gd_crown(4, 8, 8);
	corr_gd_crown(8, 12, 9);
	corr_gd_crown(12, 16, 9);
	
	corr_gd_crown(16, 20, 10);
	corr_gd_crown(20, 24, 10);
	corr_gd_crown(24, 28, 11);
	corr_gd_crown(28, 32, 11);	
	
	corr_gd_crown(32, 36, 12);
	corr_gd_crown(36, 40, 12);
	corr_gd_crown(40, 44, 13);
	corr_gd_crown(44, 48, 13);

	corr_gd_crown(48, 52, 14);
	corr_gd_crown(52, 56, 14);
	corr_gd_crown(56, 60, 15);
	corr_gd_crown(60, 0, 15);	
	
	for(i = 0; i < 16; i++)
	{
		vertices.push(crown[i][0]);
		vertices.push(crown[i][1]);
		vertices.push(crown[i][2]);
	}
	
	for(i = 0; i < 128; i++)
	{
		vertices.push(girdle[i][0]);
		vertices.push(girdle[i][1]);
		vertices.push(girdle[i][2]);
	}
}


function InitGirdle()
{
	var i;
	var point1 = new Point2D(); 
	var point2 = new Point2D();
	
	// Радиус большей окружности
	var R1 = rounnd_cir1/2.0 + (lw * lw)/(8.0*rounnd_cir1);
	RR1 = R1;

	// Радиус меньшей окружности
	var R2 = rounnd_cir2/2.0 + 1/(8.0*rounnd_cir2);
	RR2 = R2;

	// Центр меньшей окружности - лежит на оси OX
	var O2 = new Point2D(lw/2 - R2, 0);

	// Центр большей окружности - лежит на оси OY
	var O1 = new Point2D(0, 0.5 - R1);

	// Меньшая окружность
	var cir2 = new Circle2D(O2, R2);
	// Большая окружность
	var cir1 = new Circle2D(O1, R1);

	//  Окружности, используемые для вычисления центра 
	// сопрягающей окружности
	//var R3 = R3;
	var R2_R3 = new Circle2D(O2, R2 - R3); 
	var R1_R3 = new Circle2D(O1, R1 - R3); 

	var points = R2_R3.Intersection_TwoCircles(R1_R3);
	if (points == null)
	{
		return null;
	}
	// Центр сопрягающей окружности
	var O3 = new Point2D(); // Центр сопрягающей окружности
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
	var cir3 = new Circle2D(O3, R3 + 0.00001); // R3+ EPSILON);

	// Проверяем пересекаются или нет окружности 
	// cir2 и cir1 с сопрягающей окружностью cir3
	// Координаты точек пересечения g и point2
	// и также f и point2 должны отличаться совершенно незначительно
	
	points = cir2.Intersection_TwoCircles(cir3);
	if (points == null)
	{
		return null;
	}
	// Точка пересечения окружностей cir2 и cir3
	var G = new Point2D(points[0][0], points[0][1]); 
	
	points = cir1.Intersection_TwoCircles(cir3);
	if (points == null)
	{
		return null;
	}
	// Точка пересечения окружностей cir1 и cir3
	var F = new Point2D(points[0][0], points[0][1]); 


	// Находим координаты точки O4 находящейся на дуге сопряжения
	// Эта точка будет использоваться в качестве 
	// центра окружности cir4


	
	//Point2D    O4(gd_segments * lw, gd_segments);
	var O4 = new Point2D();
	O4[0] = O3[0] + Math.cos(Math.PI/4) * R3;
	O4[1] = O3[1] + Math.sin(Math.PI/4) * R3;	
	
	// Точка с координатами P3 определяет верхний
	// правый угол прямоугольника в который вписана 
	// площадка table
	var P3 = new Point2D();
	P3[0] = (lw - (1-t))/2;
	P3[1] = t/2;	
	
	// Находим расстояние между точками O4 и P3
	var dist = O4.Distance(P3);	
	
	// К найденному расстоянию прибавляем значение параметра
	// data.dr и используем полученное значение в качестве 
	// радиуса окружности R4
	// Чем больше значение data.dr, тем больше угловые сегменты рундиста 
	var R4 = dist + dr; 
	var cir4 = new Circle2D(O4, R4);	
	
	// Проводим линию параллельную оси OX через точку pt3
	var line1 = new Line2D(P3, new Point2D(P3[0] + 1.0, P3[1]));
	
	// Проводим линию параллельную оси OY через точку P3	
	var line2 = new Line2D(P3, new Point2D(P3[0], P3[1] + 1.0));
	
	// Определяем первую ключевую точку P1
	points = cir4.Intersection_LineCircle(line1);
	if (points == null)
	{
		return null;
	}
	var P1 = new Point2D();
	if (points[0][0] < points[1][0])
	{
		P1[0] = points[0][0]; P1[1] = points[1][1];
	}
	else
	{
		P1[0] = points[1][0]; P1[1] = points[1][1];			
	}

	// Определяем вторую ключевую точку P2
	points = cir4.Intersection_LineCircle(line2);
	if (points == null)
	{
		return null;
	}
	var P2 = new Point2D();
	if (points[0][1] < points[1][1])
	{
		P2[0] = points[0][0]; P2[1] = points[0][1];
	}
	else
	{
		P2[0] = points[1][0]; P2[1] = points[1][1];			
	}

	// Точка P0 лежит посередине между точками P1 и P2
	var P0 = new Point2D();
	P0[0] = (P1[0] + P2[0])/2;
	P0[1] = (P1[1] + P2[1])/2;

	// Высота короны огранки
	var h_crown = Math.tan(beta)*(1 - t)/2;

	// Вершины площадки 
	crown[0] = new Point3D();
	crown[0][0] = 0;
	crown[0][1] = t/2;
	crown[0][2] = h_crown + r/2;

	crown[4] = new Point3D();
	crown[4][0] = crown[0][0];
	crown[4][1] = -crown[0][1];		
	crown[4][2] = crown[0][2];

	crown[2] = new Point3D();
	crown[2][0] = (lw - (1 - t))/2;
	crown[2][1] = 0;
	crown[2][2] = crown[0][2];

	crown[6] = new Point3D();
	crown[6][0] = -crown[2][0];
	crown[6][1] = crown[2][1];
	crown[6][2] = crown[2][2];

	crown[1] = new Point3D();
	crown[1][0] = P0[0];
	crown[1][1] = P0[1];
	crown[1][2] = crown[0][2];

	crown[3] = new Point3D();
	crown[3][0] = crown[1][0];
	crown[3][1] = -crown[1][1];
	crown[3][2] = crown[1][2];

	crown[5] = new Point3D();
	crown[5][0] = -crown[1][0];
	crown[5][1] = -crown[1][1];
	crown[5][2] = crown[1][2];

	crown[7] = new Point3D();
	crown[7][0] = -crown[1][0];
	crown[7][1] = crown[1][1];
	crown[7][2] = crown[1][2];
	
	// Главные четырехугольные грани короны
	// Конструируем planeA
	var planeA = new Plane3D();
	planeA.CreatePlaneThreePoints(crown[0],
							new Point3D(0, 0.5, r/2),
							new Point3D(P1[0], P1[1], h_crown + r/2));

	// Конструируем planeB
	var planeB = new Plane3D();
	planeB.CreatePlaneThreePoints(crown[2],
							new Point3D(lw/2, 0.0, r/2),
							new Point3D(P2[0], P2[1], h_crown + r/2));

	// Конструируем planeC
	var planeC = new Plane3D();
	planeC.CreatePlaneThreePoints(new Point3D(P1[0], P1[1], h_crown + r/2),
							new Point3D(P2[0], P2[1], h_crown + r/2),
							new Point3D(O4[0], O4[1], r/2));	
	
	// Конструируем линию пересечения плоскостей planeA и planeC
	var vector = planeA.VectorIntersectionTwoPlanes(planeC);
	var vector_AC = new Vector2D(vector[0], vector[1]);
	vector_AC.Normer();	
	var line_AC = new Line2D();
	line_AC.CreateLineVectorPoint(vector_AC, P1);
	
	// Конструируем линию пересечения плоскостей planeB и planeC
	vector = planeB.VectorIntersectionTwoPlanes(planeC);
	var vector_BC = new Vector2D(vector[0], vector[1]);
	vector_BC.Normer();
	var line_BC = new Line2D();
	line_BC.CreateLineVectorPoint(vector_BC, P2);	
	
	// Точка P4 может двигаться по прямой между точками pt0 и O4
	var P4 = new Point2D();
	P4[0] = P0[0] * ratio + (1 - ratio) * O4[0];
	P4[1] = P0[1] * ratio + (1 - ratio) * O4[1];
	var line_P4 = new Line2D();
	line_P4.CreateLineVectorPoint(new Vector2D(P1[0] - P2[0], P1[1] - P2[1]), P4);
	
	// Находим точки пересечения найденной линии line_ptVar с 
	// линиями пересечения плоскостей
	
	var A = line_AC.IntersectionTwoLines(line_P4); 
	var B = line_BC.IntersectionTwoLines(line_P4); 
	
	// Конструируем вершины звезды короны
	var Z1 = new Vector3D(0,0,1); // Вертикально направленный единичный вектор

	var lineVert_A = new Line3D(); // Вертикальная прямая проходящая через точку A
	lineVert_A.CreateLineVectorPoint(Z1, new Point3D(A[0], A[1], 0));
	crown[8] = lineVert_A.IntersectionLinePlane(planeA);

	var lineVert_B = new Line3D(); // Вертикальная прямая проходящая через точку B
	lineVert_B.CreateLineVectorPoint(Z1, new Point3D(B[0], B[1], 0));
	crown[9] = lineVert_B.IntersectionLinePlane(planeB);
	
	crown[11] = new Point3D();
	crown[11][0] = crown[8][0];
	crown[11][1] = -crown[8][1];
	crown[11][2] = crown[8][2];
	
	crown[12] = new Point3D();
	crown[12][0] = -crown[8][0];
	crown[12][1] = -crown[8][1];
	crown[12][2] = crown[8][2];
	
	crown[15] = new Point3D();
	crown[15][0] = -crown[8][0];
	crown[15][1] = crown[8][1];
	crown[15][2] = crown[8][2];	
	
	crown[10] = new Point3D();
	crown[10][0] = crown[9][0];
	crown[10][1] = -crown[9][1];
	crown[10][2] = crown[9][2];
	
	crown[13] = new Point3D();
	crown[13][0] = -crown[9][0];
	crown[13][1] = -crown[9][1];
	crown[13][2] = crown[9][2];
	
	crown[14] = new Point3D();
	crown[14][0] = -crown[9][0];
	crown[14][1] = crown[9][1];
	crown[14][2] = crown[9][2];
	
	// Вычисляем вершины рундиста со стороны короны
	// Прежде всего вычисляем координаты узловых вершин рундиста 
	girdle[0] = new Point3D();
	girdle[0][0] = 0;
	girdle[0][1] = 0.5;
	girdle[0][2] = r/2;
	
	// Точки s и v определяют границу сегментов рундиста
	// Точки лежащие на границе сегментов seg1 и seg2
	              // и также на границе сегментов seg3 и seg4

	// Уравнение прямой проходящей через центр большей окружности O1 и точку A
	var line_O1_A = new Line2D(O1, A);

	points = cir1.Intersection_LineCircle(line_O1_A);
	if (points == null)
	{
		return null;
	}
	var s = new Point2D()
	if (points[0][1] > points[1][1])
	{
		s[0] = points[0][0]; s[1] = points[0][1];
	}
	else
	{
		s[0] = points[1][0]; s[1] = points[1][1];			
	}

	girdle[4] = new Point3D();
	girdle[4][0] = s[0];
	girdle[4][1] = s[1];
	girdle[4][2] = r/2;
	
	girdle[8] = new Point3D();
	girdle[8][0] = O4[0];
	girdle[8][1] = O4[1];
	girdle[8][2] = r/2;

	// Уравнение прямой проходящей через центр меньшей окружности O2 и точку B
	var line_O2_B = new Line2D(O2, B);

	points = cir2.Intersection_LineCircle(line_O2_B);
	if (points == null)
	{
		return null;
	}
	var v = new Point2D()
	if (points[0][0] > points[1][0])
	{
		v[0] = points[0][0]; v[1] = points[0][1];
	}
	else
	{
		v[0] = points[1][0]; v[1] = points[1][1];			
	}

	girdle[12] = new Point3D();
	girdle[12][0] = v[0];
	girdle[12][1] = v[1];
	girdle[12][2] = r/2;

	girdle[16] = new Point3D();
	girdle[16][0] = lw/2;
	girdle[16][1] = 0;
	girdle[16][2] = r/2;

	var u = new Point2D(O4[0], O4[1]);

	// Остальной рундист
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
		girdle[i] = new Point3D(x, y, r/2);  // !!!!
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
		girdle[i] = new Point3D(x, y, r/2);
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
		girdle[i] = new Point3D(x, y, r/2);
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
		girdle[i] = new Point3D(x, y, r/2);
	}

	// Производим вычисления вершин рундиста для остальных квадрантов
	for(i = 0; i < 16; i++)
	{
		girdle[32-i] = new Point3D();
		girdle[32-i][0] = girdle[i][0];
		girdle[32-i][1] = -girdle[i][1];
		girdle[32-i][2] = r/2;
	}
	for(i = 1; i < 32; i++)
	{
		girdle[64-i] = new Point3D();
		girdle[64-i][0] = -girdle[i][0];
		girdle[64-i][1] = girdle[i][1];
		girdle[64-i][2] = r/2;
	}
	
	for (i = 0; i < 64; i++)
	{
		girdle[i+64] = new Point3D ( girdle[i][0], girdle[i][1], -r/2);
	}
}

function corr_gd_crown(gd1, gd2, cr)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(girdle[gd1], girdle[gd2], crown[cr]);
	var n = 4; //gd2 - gd1;
	var i = 0;
	for (i = 1; i < n; i++)
	{
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i + 64]);
		var pt = vert_line.IntersectionLinePlane(planeT);
		girdle[gd1 + i][2] = pt[2];
	}
}
/*
function corr_gd_crown(gd1, gd2, gd3, gd4, cr)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(gd1, gd2, cr);
	var vert_line = new Line3D(gd3, gd4);
	var pt = vert_line.IntersectionLinePlane(planeT);
	return pt;
}

function corr_gd_pav(gd1, gd2, gd3, gd4, pav)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(gd1, gd2, pav);
	var vert_line = new Line3D(gd3, gd4);
	var pt = vert_line.IntersectionLinePlane(planeT);
	return pt;
}
*/
/*
function corr_gd_crown(gd1, gd2, cr)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(girdle[gd1], girdle[gd2], crown[cr]);
	var n = 4; //gd2 - gd1;
	var i = 0;
	for (i = 1; i < n; i++)
	{
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i + 64]);
		var pt = vert_line.IntersectionLinePlane(planeT);
		girdle[gd1 + i][2] = pt[2];
	}
}

function corr_gd_pav(gd1, gd2, pav)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(girdle[gd1], girdle[gd2], pavil[pav]);
	var n = 4; //gd2 - gd1;
	var i;
	for (i = 1; i < n; i++)
	{
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i - 64]);
		var pt = vert_line.IntersectionLinePlane(planeT);
		girdle[gd1 + i][2] = pt[2];
	}	
}
*/

// Все грани (полигоны) 3D модели огранки обходим против часовой стрелки
// если смотреть на модель находясь от нее снаружи.
var index_cut = [
    // Площадка
	0,7,6,5,4,3,2,1,0,
	// Корона
	0,1,8,0,
	1,2,9,1,
	2,3,10,2,
	3,4,11,3,
	4,5,12,4,
	5,6,13,5,
	6,7,14,6,
	7,0,15,7,

	0,8,16,15,0,
	1,9,24,8,1,
	2,10,32,9,2,
	3,11,40,10,3,
	4,12,48,11,4,
	5,13,56,12,5,
	6,14,64,13,6,
	7,15,72,14,7,

	8,20,19,18,17,16,8,
	8,24,23,22,21,20,8,
	9,28,27,26,25,24,9,
	9,32,31,30,29,28,9,
	10,36,35,34,33,32,10,
	10,40,39,38,37,36,10,
	11,44,43,42,41,40,11,
	11,48,47,46,45,44,11,
	12,52,51,50,49,48,12,
	12,56,55,54,53,52,12,
	13,60,59,58,57,56,13,
	13,64,63,62,61,60,13,
	14,68,67,66,65,64,14,
	14,72,71,70,69,68,14,
	15,76,75,74,73,72,15,
	15,16,79,78,77,76,15,
	// Рундист
	16,17,81,80,16,
	17,18,82,81,17,
	18,19,83,82,18,
	19,20,84,83,19,
	20,21,85,84,20,
	21,22,86,85,21,
	22,23,87,86,22,
	23,24,88,87,23,
	24,25,89,88,24,
	25,26,90,89,25,
	26,27,91,90,26,
	27,28,92,91,27,
	28,29,93,92,28,
	29,30,94,93,29,
	30,31,95,94,30,
	31,32,96,95,31,
	32,33,97,96,32,
	33,34,98,97,33,
	34,35,99,98,34,
	35,36,100,99,35,
	36,37,101,100,36,
	37,38,102,101,37,
	38,39,103,102,38,
	39,40,104,103,39,
	40,41,105,104,40,
	41,42,106,105,41,
	42,43,107,106,42,
	43,44,108,107,43,
	44,45,109,108,44,
	45,46,110,109,45,
	46,47,111,110,46,
	47,48,112,111,47,
	48,49,113,112,48,
	49,50,114,113,49,
	50,51,115,114,50,
	51,52,116,115,51,
	52,53,117,116,52,
	53,54,118,117,53,
	54,55,119,118,54,
	55,56,120,119,55,
	56,57,121,120,56,
	57,58,122,121,57,
	58,59,123,122,58,
	59,60,124,123,59,
	60,61,125,124,60,
	61,62,126,125,61,
	62,63,127,126,62,
	63,64,128,127,63,
	64,65,129,128,64,
	65,66,130,129,65,
	66,67,131,130,66,
	67,68,132,131,67,
	68,69,133,132,68,
	69,70,134,133,69,
	70,71,135,134,70,
	71,72,136,135,71,
	72,73,137,136,72,
	73,74,138,137,73,
	74,75,139,138,74,
	75,76,140,139,75,
	76,77,141,140,76,
	77,78,142,141,77,
	78,79,143,142,78,
	79,16,80,143,79,
	// Верхняя грань
	80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
	93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108,
	109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124,
	125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
	141, 142, 143, 80,

		// Признак того, что граней больше нет
		-100      
];

function facet_colors()
{
	var ind = 0;
	var i;

	// table
	colors[ind] = new THREE.Color("rgb(150, 150, 150)");
	ind++;
	
	// upper crown facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = new THREE.Color("rgb(150, 150, 250)");
		ind++;
	}
	
	// crown facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = new THREE.Color("rgb(100, 100, 250)");
		ind++;
	}	
	
	// bottom crown facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = new THREE.Color("rgb(170, 170, 250)"); ind++;
		colors[ind] = new THREE.Color("rgb(200, 200, 250)"); ind++;
	}
	
	//  GIRDLE
	for (i = 0; i < 32; i++)
	{
		colors[ind] = new THREE.Color("rgb(100, 100, 100)");
		ind++;
		colors[ind] = new THREE.Color("rgb(150, 150, 150)");		
		ind++;
	}
	
	colors[ind] = new THREE.Color("rgb(250, 230, 250)")
};