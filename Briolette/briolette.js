// pyramid.js

var meshes = [];  // массив объектов mesh (полигонов для three.js)
var points = [];    // массив для хранения вершин всех полигонов в виде THREE.Vector3
var colors = [];    // массив в котором хранятся цвета граней
var edges = []; // массив для хранения ребер полигонов

var canvas; // canvas для отображения 3D-модели
var scene, camera, renderer, orbitControl, raycaster;

// используется для отображения/изменения значений параметров модели
var controller;

var hud;    // canvas для отображения параметров
var ctx;	// двумерный контекст для рисования на холсте (на canvas)
			// значений параметров, привязан к hud

var numbers = [];
var enumeration1 = false; // для переключателя номеров вершин модели (да/нет)
var enumeration2 = false;

var build_crown_1 = true;

// Следующие 5 строк для raycaster.
var mouse = new THREE.Vector2();
mouse.x = 800;
mouse.y = 600;
var select_index = -1;
var old_color;

// Масштабный множитель для полигонов при их отображении
var kf = 4.0; 
// Масштабный множитель для ребер при их отображении
var kf_edges = 4.05;

var TWO_MODELS = false;  // используется в polyhedron.js если создается 
                         // второй экземпляр 3D-модели с той же топологией
						 
var DEGREE = 0.01745329251994; // величина углового градуса в радианах

var error = false;
var error_vertex = -1;
var error_facet = -1;

var pointX = 0;
var pointY = 0;
var pointZ = 0;

var correct = true;
var gui;

function init()
{	
	document.getElementById("btn_no").checked = true;
	document.getElementById("btn_no").addEventListener("change", radio_no);
	document.getElementById("btn_all").addEventListener("change", radio_all);
	
	canvas = document.getElementById("canvas");
	
	// Создаем трехмерную сцену, перспективную камеру и рендерер
	scene = new THREE.Scene();
/*	
	// Если перспективная камера.
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
	camera.position.x = 5;
	camera.position.y = 10;
	camera.position.z = -20;
*/
	var width = canvas.width;
	var height = canvas.height;
	var aspect = width / height;
	var frustumSize = 20;
	camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, 
											frustumSize * aspect / 2, frustumSize / 2, 
											frustumSize / - 2, 1, 2000 );
	camera.position.x = 5;
	camera.position.y = 10;
	camera.position.z = -20;
	
	camera.lookAt(new THREE.Vector3(0, 0, 0));	
	scene.add(camera);
	
	// Создаем renderer
	renderer = new THREE.WebGLRenderer({canvas: canvas});
	renderer.setClearColor(0xEEEEEE, 1.0);
	renderer.setSize(canvas.width, canvas.height);

	// Элемент управления дающий возможность осматривать модель пирамиды со всех сторон.
	orbitControl = new THREE.OrbitControls(camera, canvas);
	raycaster = new THREE.Raycaster();
	
	// Создаем 2D холст на который будем выводить 
	// вспомогательную информацию (например значения параметров).
	hud = document.getElementById("canvas_pars");
	ctx = hud.getContext('2d');
	if (!ctx) 
	{
		console.log('Failed to get rendering context');
		return;
	}	
	
	//           Создание мешей двух типов
	// 1. Для прорисовки цветных граней используется массив meshes.
	//    Каждая грань представлена одним мешем в массиве полигонов.
	// 2. Для прорисовки ребер граней используется массив edges.
	//    Каждый полигон представлен одним массивом, окаймляющих его ребер, 
	//    в общем массиве ребер всей модели.	
	create_meshes();
		
	
	////////////////////////////////////////////////////////////////////////////
	// Для задания значений параметров будем использовать библиотеку dat.GUI
	// В объекте controller определяем свойства для параметров модели и их
	// начальные значения.
	///////////////////////////////////////////////////////////////////////////
    controller = new function() 
	{
		this.lw = lw;
		this.vp = vp;
		this.Lh = Lh;
		this.kY = kY;
		this.square_deviation = square_deviation;
		
		this.alpha_1 = alpha_1 / DEGREE;
		this.alpha_2 = alpha_2 / DEGREE;
		this.beta_1 = beta_1 / DEGREE;
		this.beta_2 = beta_2 / DEGREE;
		this.beta_3 = beta_3 / DEGREE;
		this.gamma_1 = gamma_1 / DEGREE;
		this.gamma_2 = gamma_2 / DEGREE;
		this.gamma_3 = gamma_3 / DEGREE;
		
		this.h_facet_ratio = h_facet_ratio;
		this.flank_size = flank_size;
	}();
	
	// Создаем новый объект dat.GUI.
	gui = new dat.GUI({ autoPlace: false });
	gui.domElement.id = 'gui';
	gui_container_big.appendChild(gui.domElement);
	
    var f1 = gui.addFolder('Briolette');
    f1.add(controller, 'lw', 1.55, 3.0).onChange( function() 
	{
	   var temp = lw;
	   orbitControl.enabled = false;
       lw = controller.lw;
	   recalc();
	   if (isCorrect() == -1) 
	   {
		   lw = temp;
		   recalc();
		   controller.lw = temp;
	   }
	   controller.lw = lw;
	   gui.updateDisplay();
    });
	
    f1.add(controller, 'kY', 0.1, 1.5).onChange( function() 
	{
		var temp = kY;
		orbitControl.enabled = false;
		kY = controller.kY;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   kY = temp;
		   recalc();
	    }
		controller.kY = kY;
		gui.updateDisplay();
	});
	
    f1.add(controller, 'vp', -2.5, 20).onChange( function() 
	{
		var temp = vp;
		orbitControl.enabled = false;
		vp = (controller.vp) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   vp = temp;
		   recalc();
	    }
		controller.vp = vp / DEGREE;
		gui.updateDisplay();
	});
    f1.add(controller, 'Lh', 0.0001, 0.5).onChange( function() 
	{
		var temp = Lh;
		orbitControl.enabled = false;
		Lh = controller.Lh;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   Lh = temp;
		   recalc();
	    }
		gui.updateDisplay();
	});
 	
    f1.add(controller, 'square_deviation', -0.9, 0.9).onChange( function() 
	{
		var temp = square_deviation;
		orbitControl.enabled = false;
		square_deviation = controller.square_deviation;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   square_deviation = temp;
		   recalc();
	    }
		square_deviation = square_deviation;
		gui.updateDisplay();
	});	
	
    f1.add(controller, 'alpha_1', 1, 89).onChange( function() 
	{
		var temp = alpha_1;
		orbitControl.enabled = false;
		alpha_1 = (controller.alpha_1) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   alpha_1 = temp;
		   recalc();
	    }		
		controller.alpha_1 = alpha_1 / DEGREE;
		gui.updateDisplay();
	});
	
    f1.add(controller, 'alpha_2', 1, 89).onChange( function() 
	{
		var temp = alpha_2;
		orbitControl.enabled = false;
		alpha_2 = (controller.alpha_2) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   alpha_2 = temp;
		   recalc();
	    }		
		controller.alpha_2 = alpha_2 / DEGREE;
		gui.updateDisplay();
	});	
	
    f1.add(controller, 'beta_1', 1, 89).onChange( function() 
	{
		var temp = beta_1;
		orbitControl.enabled = false;
		beta_1 = (controller.beta_1) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   beta_1 = temp;
		   recalc();
	    }		
		controller.beta_1 = beta_1 / DEGREE;
		gui.updateDisplay();
	});	
	
    f1.add(controller, 'beta_2', 1, 89).onChange( function() 
	{
		var temp = beta_2;
		orbitControl.enabled = false;
		beta_2 = (controller.beta_2) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   beta_2 = temp;
		   recalc();
	    }		
		controller.beta_2 = beta_2 / DEGREE;
		gui.updateDisplay();
	});	
	
    f1.add(controller, 'beta_3', 1, 89).onChange( function() 
	{
		var temp = beta_3;
		orbitControl.enabled = false;
		beta_3 = (controller.beta_3) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   beta_3 = temp;
		   recalc();
	    }		
		controller.beta_3 = beta_3 / DEGREE;
		gui.updateDisplay();
	});	
	
    f1.add(controller, 'gamma_1', 1, 89).onChange( function() 
	{
		var temp = gamma_1;
		orbitControl.enabled = false;
		gamma_1 = (controller.gamma_1) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   gamma_1 = temp;
		   recalc();
	    }		
		controller.gamma_1 = gamma_1 / DEGREE;
		gui.updateDisplay();
	});	
	
    f1.add(controller, 'gamma_2', 1, 89).onChange( function() 
	{
		var temp = gamma_2;
		orbitControl.enabled = false;
		gamma_2 = (controller.gamma_2) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   gamma_2 = temp;
		   recalc();
	    }		
		controller.gamma_1 = gamma_1 / DEGREE;
		gui.updateDisplay();
	});		
	
    f1.add(controller, 'gamma_3', 1, 89).onChange( function() 
	{
		var temp = gamma_3;
		orbitControl.enabled = false;
		gamma_3 = (controller.gamma_3) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   gamma_3 = temp;
		   recalc();
	    }		
		controller.gamma_3 = gamma_3 / DEGREE;
		gui.updateDisplay();
	});		
	
    f1.add(controller, 'h_facet_ratio', 0.1, 1.5).onChange( function() 
	{
		var temp = h_facet_ratio;
		orbitControl.enabled = false;
		h_facet_ratio = controller.h_facet_ratio;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   h_facet_ratio = temp;
		   recalc();
	    }
		controller.h_facet_ratio = h_facet_ratio;
		gui.updateDisplay();
	});

    f1.add(controller, 'flank_size', 0.01, 1.5).onChange( function() 
	{
		var temp = flank_size;
		orbitControl.enabled = false;
		flank_size = controller.flank_size;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   flank_size = temp;
		   recalc();
	    }
		controller.flank_size = flank_size;
		gui.updateDisplay();
	});	
	
	///////////////////////////////////////////////////////////////////////////
	
	// Вывод на сцену массива полигонов.
	for(var i = 0; i < meshes.length; i++) 
	{
		scene.add(meshes[i]);	
	}
	
	// Вывод на сцену общего массива ребер.
	for(var i = 0; i < edges.length; i++) 
	{
		scene.add(edges[i]);	
	}

	// Установка обработчика события mousemove
	canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
	
	// Отображение на экран.
	render();	
}	

function create_meshes()
{
	// Предварительная очистка массивов.
	vertices.length = 0;
	plgs.length = 0;
	faces.length = 0;
	colors.length = 0;
	edges.length = 0;
	meshes.length = 0;
	points.length = 0;
		
	// Расчет координат вершин 3D модели.
    VerticesCalculation();
	// Создание топологии 3D модели с учетом координат вершин и их взаимосвязи.
	CreatePolyhedron();
	// Вывод на холст hud значений параметров.
	pars_value();
	
	// Facets
	var i, j;
	var el = 0;

	// Каждые три последовательные значения, 
	// соответствующие одной вершшине модели (массив vertices)  
	// переводим в координаты x, y, z вершины модели с типом THREE.Vector3.
	for (i = 0; i < vertices.length/3; i++)
	{
		var point3 = new THREE.Vector3();
		for (j = 0; j < 3; j++)
		{
			point3.x = kf * vertices[el];
			point3.y = kf * vertices[el + 1];
			point3.z = kf * vertices[el + 2];
		}
		points.push(point3);
		el = el + 3;
	}

	// Задаем цвет каждой грани.
	facet_colors();
	
	// Meshes (полигоны)
	
	// Для каждой грани создаем отдельный меш.
	//   Это сделано по двум причинам:
	// Во-первых отдельные меши граней легче раскрасить,
	// чем раскрашивать отдельные грани модели, если они входят
	// как части в единую модель огранки.
	// Во-вторых, если мы при помощи "raycaster" будем
	// выбирать отдельные грани (в данной программе это не реализовано,
	// но это присутствует в остальных моделях: Octagon, Brilliant ...)
	// то опять же "raycaster" удобнее использовать для модели 
	// представляющей собой не единую модель, а модель составленную
	// из отдельных моделей граней.
	// В том случае если для отображения исползуются шейдеры, то наоборот
	// удобнее использовать единую модель, а не модель состоящую
	// из отдельных граней. Это продемонстрировано в моделях Octagon, Brilliant,
	// MoonMarquise, ... в режимах работы этих программ, где применяются шейдеры.
	
	for (i = 0; i < plgs.length; i++) // цикл по всем граням
	{
		var geometry = new THREE.Geometry();
		geometry.vertices = points;
		var plg = plgs[i]; 
		var index_triangle = plg.IndexTriangle;
		if (i == 110)
		{
			var yyy = 10;
		}
		if (i == 115)
		{
			var zzz = 10;
		}		
		for (var j = 0; j < index_triangle.length; j++)
		{
			index_triangle[j].color = colors[i]; // цвет всех треугольников
				// на которые разбита грань один и тот же и определяется
				// цветом всей грани из файла pyramid_colors.js
			//index_triangle[j].color = new THREE.Color("rgb(150, 150, 150)");
		}
		geometry.faces = index_triangle;
		geometry.computeFaceNormals();
		geometry.faces = index_triangle; 
		var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
		var mesh = new THREE.Mesh(geometry, material);	
		mesh.index = i;
		meshes.push(mesh);	
	}	
	
	// Lines (ребра)
	
	// После того, как нарисовали 3D модель огранки и раскрасили цвета ее граней, 
	// для лучшего зрительного восприятия модели желательно прорисовать все ее видимые ребра.
	// С этой целью создается проволочный экземпляр 3D модели и накладывается на модель
	// с раскрашенными гранями. Проволочный экземпляр 3D модели должен быть на очень 
	// небольшую величину брльше по размеру, чем модель с гранями. В этом случае
	// задние части проволочной модели будут закрыты моделью с гранями, а передние
	// ее части окажутся видимыми. Тем самым наблюдатель будет воспринимать пирамиду
	// как единую 3D модель с прорисованными ребрами.
	// Создаем материал при помощи которого будут прорисовываться ребра 3D модели.
	var material_line = new THREE.LineBasicMaterial({ color: 0x000000 });
	// Для каждой грани создаем отдельный массив ребер которые окаймляют эту грань.	
	for (i = 0; i < plgs.length; i++) // цикл по всем граням модели
	{
		var geometry_line = new THREE.Geometry();
		var points_line = [];
		var facet = plgs[i].VertexFacet;
			
		for (j = 0; j < facet.vertexes.length; j++) // цикл по вершинам текущей грани
		{
			var vert = facet.vertexes[j];
			var point3 = new THREE.Vector3(kf_edges * vert[0], kf_edges * vert[1], kf_edges * vert[2]);
			points_line.push(point3);
		}
		geometry_line.vertices = points_line;
		var mesh_line = new THREE.Line(geometry_line, material_line);
		edges.push(mesh_line);
	}	
}			

function pars_value()
{
	var text_color = "#00F";
	var value_color = "#F00";
	var h = 15;
	var dh = 16;
	var w1 = 2;
	var w2 = 220
	
	ctx.font = "italic 10pt Arial";	
	
	h = h + dh;
	var text = "Elongation axis OZ  (lw)";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(lw, 2);
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);	
	
	h = h + dh;
	var text = "Elongation axis OY  (kY)";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(kY, 2);
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);

	h = h + dh/2;
	text = "     ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);

	h = h + dh;
	var text = "vp ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(vp/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);			
	
	h = h + dh;
	text = "Lh ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);
	text = roundNumber(Lh, 2);
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);	

	h = h + dh;
	var text = "Square deviation ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(square_deviation, 2);
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);		

	h = h + dh/2;
	text = "     ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);

	h = h + dh;
	var text = "Angle alpha 1";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(alpha_1/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);	
	
	h = h + dh;
	var text = "Angle alpha 2";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(alpha_2/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);		
	
	h = h + dh/2;
	text = "     ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);	
	
	h = h + dh;
	var text = "Angle beta 1";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(beta_1/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);	
	
	h = h + dh;
	var text = "Angle beta 2";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(beta_2/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);	
	
	h = h + dh;
	var text = "Angle beta 3 ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(beta_3/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);

	h = h + dh/2;
	text = "     ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);

	h = h + dh;
	var text = "Angle gamma 1";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(gamma_1/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);

	h = h + dh;
	var text = "Angle gamma 2";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(gamma_2/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);

	h = h + dh;
	var text = "Angle gamma 3";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);		
	text = roundNumber(gamma_3/DEGREE, 3) + "°";
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);
	
	h = h + dh/2;
	text = "     ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);	
	
	h = h + dh;
	text = "Sharp edges (h_facet_ratio) ";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);
	text = roundNumber(h_facet_ratio, 2);
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);	

	h = h + dh;
	text = "Flank size (flank_size)";
	ctx.fillStyle = text_color;
	ctx.fillText(text, w1, h);
	text = roundNumber(flank_size, 2);
	ctx.fillStyle = value_color;
	ctx.fillText(text, w2, h);		
}	



/////////////////////////////////////////////////////////
	
// Если значение какого-либо параметра изменилось то перестраиваем 3D модель.
function recalc()
{
	var i;
	
	// Убираем со сцены полигоны.
	for(i = 0; i < meshes.length; i++) 
	{
		var mesh = meshes[i];
		scene.remove(mesh);	
	}
	// Убираем со сцены ребра.
	for(i = 0; i < edges.length; i++) 
	{
		scene.remove(edges[i]);	
	}				
	
	// Создаем новые полигоны и ребра и выводим их на сцену.
	create_meshes();
	for(i = 0; i < edges.length; i++) 
	{
		scene.add(edges[i]);	
	}	
	for(i = 0; i < meshes.length; i++) 
	{
		scene.add(meshes[i]);	
	}

	// Очищаем холст и затем выводим на него новые значения параметров,
	// а также дополнительную информацию.
	ctx.clearRect(0, 4, hud.width, hud.height);
	pars_value();
	
	create_num_vertices(0);
}

function render() 
{
		orbitControl.enabled = true;
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( meshes );
		if ( intersects.length > 0 ) 
		{
			index = intersects[ 0 ].object.index;
			old_color = intersects[ 0 ].object.material.color;

			if ( (index != select_index)  )
			{
				if (select_index != -1)
				{
					meshes[select_index].material.color = old_color;
				}
			}
			print_text_index(index);
			meshes[index].material.color = new THREE.Color("rgb(250, 250, 0)");
			select_index = index;
			
			pointX = intersects[ 0 ].point.x;
			pointY = intersects[ 0 ].point.y;
			pointZ = intersects[ 0 ].point.z;
			
			var left_2 = 130;
			var h2 = 400;
			ctx.font = '12px "Times New Roman"';
			ctx.fillStyle = 'rgba(0, 0, 100, 1)';
			var text = "(x, y, z) = ";
			ctx.fillText(text, left_2 - 80, h2 + 60);
			
			text = "  " + roundNumber(pointX/kf, 3) + "   " + roundNumber(pointY/kf, 3) + "   "  + roundNumber(pointZ/kf, 3);
			ctx.fillText(text, left_2 - 30, h2 + 60);
		}
//		if (error == true)
//		{
//			meshes[error_facet].material.color = new THREE.Color("rgb(250, 0, 0)");
//		}		
		requestAnimationFrame(render);
		renderer.render(scene, camera);
}

function onDocumentMouseMove( event ) 
{
	event.preventDefault();
	var el = document.getElementById('canvas');
	var coords = el.getBoundingClientRect();
	mouse.x = -1 + ((event.clientX - coords.left)*2)/522;
	mouse.y = -1 + ((coords.top + 522 - event.clientY)*2)/522;
}

function print_text_index(index) // 100, 130, 160
{
	ctx.clearRect(0, 360, 400, 110);
	var h1 = 380;
	var h2 = 400;
	var left_1 = 30;
	var left_2 = 140;
	
	ctx.font = 'bold 12pt "Times New Roman"';
	ctx.fillStyle = 'rgba(100, 0, 0, 1)';
	ctx.fillText("Facet : " + index, left_1 + 60, h1);			

	var plg = plgs[index]; 
	var face3 = plg.IndexTriangle[0];

	var normal = face3.normal;
	var x = normal.x;
	var y = normal.y;
	var z = normal.z;
	var slope = Math.abs(z/Math.sqrt(x*x + y*y));
	slope = Math.abs(slope);
	slope = Math.atan(slope);
	if (index != -1)
	{	
		var azim;
		if ( (Math.abs(x) <= 0.00001) && (Math.abs(y) <= 0.00001) )
		{
			azim = 10001.0;
		}
		else if ( (x > 0.00001) && (y > 0.00001) )
		{
			azim = Math.atan2(y, x) * 180.0 / Math.PI;
		}
		else if ( (x < - 0.00001) && (y > 0.00001) )
		{
			azim = ( Math.atan2(-x, y) * 180.0 / Math.PI) + 90.0 ;
		}
		else if ( (x < -0.00001) && (y < -0.00001) )
		{
			azim = (Math.atan2(-y, -x) * 180.0 / Math.PI) + 180.0;
		}
		else if ( (x > 0.00001) && (y < -0.00001) )
		{
			azim = (Math.atan2(x, -y) * 180.0 / Math.PI) + 270.0;
		}
		else if ( (Math.abs(y) <= 0.00001) && (x > 0) )
		{
			azim = 0.0;
		}
		else if ( (Math.abs(y) <= 0.00001) && (x < 0) )
		{
			azim = 180.0;
		}
		else if ( (Math.abs(x) <= 0.00001) && (y > 0) )
		{
			azim = 90.0;
		}
		else if ( (Math.abs(x) <= 0.00001) && (y < 0) )
		{
			azim = 270.0;
		}
		if (azim > 10000.0)
		{
			azim = 0.0;
		}
	}
	ctx.font = '16px "Times New Roman"';
	ctx.fillStyle = 'rgba(100, 0, 0, 1)';
	var text_slope = roundNumber(90 - Math.degrees(slope), 2) + "°";
	ctx.fillText("Slope : " + text_slope, left_1 + 60, h2 + 20);
	
	var text_azim = roundNumber(azim, 2) + "°";
	ctx.fillText("Azim. : " + text_azim, left_1 + 60, h2 + 40);
}	

var loaderText = new THREE.FontLoader(); // загрузчик шрифтов

// характеристики создаваемого 3D текста
function create_text(txt)
{
	var t =
	{
		text : txt,          // текст номера, который небходимо отобразить
		size : 3,            // размер текста (высота символа)
		height : 1,          // толщина текста
		curveSegments : 12,  // количество точек (сегментов) 
              // кривой при рисовании буквы, отвечающие за качество изображения
		//     font : "gentilis",   // название шрифта
		bevelEnabled : false // включение фаски (при true)
	};	
	return t;
}
	
// Создание текста для оцифровки вершин огранки.			
function generateGeometry(meshText, text)
{
	var data = create_text(text);
	loaderText.load
	( 
		'../libs/gentilis_bold.typeface.js', // шрифт
		function ( font ) 
		{
			var geometryText = new THREE.TextGeometry
			( 
				data.text, 
				{
					font: font,
					size: data.size,
					height: data.height,
					curveSegments: data.curveSegments,
					bevelEnabled: data.bevelEnabled
				} 
			);
			geometryText.center();
			meshText.children[ 0 ].geometry.dispose(); 
			meshText.children[ 0 ].geometry = geometryText;			
		}
	);
}

// нумерация вершин модели
function create_num_vertices(enumeration)
{
	for(i = 0; i < numbers.length; i++) 
	{
		scene.remove(numbers[i]);	
	}
	numbers.length = 0;
	if (enumeration == 0)
	{
		document.getElementById("btn_no").checked = true;
		return;
	}
	
	var x, y, z;
	var ind = 0;
	var number = 0;
	var n = vertices.length / 3; // количество вершин модели
	
	// вывод номеров вершин на экран
	for (i = 0; i < n; i++) 
	{
		// координаты текущей вершины
		for (j = 0; j < 3; j++)
		{
			x = vertices[ind];
			y = vertices[ind + 1];
			z = vertices[ind + 2];
		}	

		// Создание текста соответствующего номеру текущей вершины
		// Текст - это объект типа меш (mesh), у которого предком
		// является THREE.Object3D.
		var meshText = new THREE.Object3D();
		
		if (enumeration == 1)
		{
			meshText.add(
				// присоединяем к объекту meshText
				// модель "номера грани" с закрашенными гранями и делаем ее видимой
				new THREE.Mesh(
					new THREE.Geometry(),
					new THREE.MeshBasicMaterial({color: 0x000000, // черный цвет номера 
												 side: THREE.DoubleSide, 
												 shading: THREE.FlatShading})));
			meshText.children[0].visible = true; // делаем видимой
			
			generateGeometry( meshText, number.toString() );
		}

		// Так как у meshText предком является Object3D, 
		// от которого наследуются все объекты попадающие на сцену, и 
		// он отвечает за геометрическое положение объектов в пространстве
		// то мы можем помещать текст в нужное место и масштабировать его.
		// (трансформации примененные к верхнему уровню иерархии объектов
		//   применяются ко всем элементам лежащим ниже)
		meshText.scale.set(0.07, 0.07, 0.07);	
		if ( (ind / 3) < 81 ) 
		{ // для вершин с положительной координатой z
			z = z + 0.025; // смещение относительно координаты вершины
			if (x >= 0)
			{
				if (y >= 0)
				{
					meshText.position.set(kf*(x + 0.03), kf*(y + 0.03), kf*z);
				}
				else
				{
					meshText.position.set(kf*(x + 0.03), kf*(y - 0.03), kf*z);
				}
			}
			else
			{
				if (y >= 0)
				{
					meshText.position.set(kf*(x - 0.03), kf*(y + 0.03), kf*z);
				}
				else
				{
					meshText.position.set(kf*(x - 0.03), kf*(y - 0.03), kf*z);
				}
			}
		}
		else
		{ // для вершин с отрицательной координатой z
			z = z - 0.025; // смещение относительно координаты вершины
			meshText.position.set(kf*x, kf*y, kf*z);
			meshText.rotation.x = Math.PI; //    для удобства
			meshText.rotation.z = Math.PI; // зрительного воспрятия			
		}
		numbers.push(meshText);
		ind = ind + 3;
		number = number + 1;
	}	
	for(i = 0; i < numbers.length; i++) 
	{
		scene.add(numbers[i]);	
	}
}

function isCorrect()
{	
	error = false;
	error_vertex = -1;
	error_facet = -1;

	var i, j;
	// Проходим по всем граням модели 
	for (i = 0; i < plgs.length; i++)
	{
		var plg = plgs[i]; 
		var face3 = plg.IndexTriangle[0];

		var ind1 = face3.a;
		var ind2 = face3.b;
		var ind3 = face3.c;
		
		var pt1 = new Point3D(points[ind1].x, points[ind1].y, points[ind1].z);
		var pt2 = new Point3D(points[ind2].x, points[ind2].y, points[ind2].z);
		var pt3 = new Point3D(points[ind3].x, points[ind3].y, points[ind3].z);

		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(pt1, pt2, pt3);
		
		// Проходим по всем вершинам модели 
		for (j = 0; j < points.length; j++)
		{
			var pt_test = new Point3D(points[j].x, points[j].y, points[j].z);
			var dist = plane.DistancePoint(pt_test);
			//alert (dist);
			if (dist > 0.00001)
			{
				// not convex
//				error = true;
//				error_vertex = j;
//				error_facet = i;
				if (correct == true)
				{
					return -1;
				}
				else
				{
					return 1;
				}
			}
		}
	}
}

function radio_no() // не отображаем нумерацию вершин
{ 
	if (document.getElementById("btn_no").checked == true )
	{
		document.getElementById("btn_all").checked = false;
		create_num_vertices(0);
	}
}

function radio_all() // отображаем нумерацию вершин одним цветом
{ 
	if (document.getElementById("btn_all").checked == true )
	{
		document.getElementById("btn_no").checked = false;
		create_num_vertices(1);
	}
}

// Вспомогательная функция форматирования числовых значений.
function roundNumber(num, places) 
{
	return ( Math.round(num * Math.pow(10, places)) / Math.pow(10, places) );
}

document.addEventListener('keydown', function(event)
{
	var code = event.keyCode;
	if ((code == 65) || (code == 97))// a или A
	{          
		if (bomb == false)
		{	
			lw = 1.8;       // Отношение длины огранки к ее ширине
			vp = 0.0;       //  Угол, определяющий степень отклонения 
							 // кривой Ellipse_2 от окружности 
			Lh = 0.34;       // Отклонение смещения самого широкого места
			kY = 0.8;	     // Коэффициент растяжения огранки вдоль оси Y
			square_deviation = 0.0001;	//  Задает степень отклонения овала, определяющего 
								// форму огранки в поперечном сечении, от эллипса
			alpha_1 = 28*DEGREE; // Первый угол определяющий положение вершин на Ellipse_1
			alpha_2 = 62*DEGREE; // Второй угол определяющий положение вершин на Ellipse_1
			beta_1 = 11*DEGREE;  // Первый угол определяющий положение вершин на Ellipse_2
			beta_2 = 22*DEGREE;  // Второй угол определяющий положение вершин на Ellipse_2
			beta_3 = 33*DEGREE;  // Третий угол определяющий положение вершин на Ellipse_2
			gamma_1 = 2 * 90*DEGREE / 8; // Первый угол определяющий положение вершин на овале
			gamma_2 = 4 * 90 * DEGREE / 8; // Второй угол определяющий положение вершин на овале
			gamma_3 = 6 * 90 * DEGREE / 8; // Третий угол определяющий положение вершин на овале

			h_facet_ratio = 0.5; // Определяет положение вершин ближайших к острию
			flank_size = 0.1;    // Задает размер среза на тупой части огранки	
			
			avia = 0.81;
			recalc();
			bomb = true;
		}
		else
		{
			restore();
			avia = 1.0;
			recalc();
			bomb = false;				
		}
	}
	if ((code == 78) || (code == 110))// n или N
	{          
		if (correct == true)
		{
			correct = false;
			recalc();
			ctx.fillRect(0, 0, hud.width, 4);
			ctx.fill();
		}
//		else
//		{
//			correct = true;
//			restore();		
//			recalc();
//		}
	}
	
	if ((code == 82) || (code == 114))// r или R
	{  
		bomb = false;
		avia = 1.0;
		correct = true;
		restore();		
		recalc();	
	}
});

function restore()
{
	lw = 1.8;       // Отношение длины огранки к ее ширине
	vp = 0.0;       //  Угол, определяющий степень отклонения 
					 // кривой Ellipse_2 от окружности 
	Lh = 0.34;       // Отклонение смещения самого широкого места
	kY = 0.8;	     // Коэффициент растяжения огранки вдоль оси Y
	square_deviation = 0.0001;	//  Задает степень отклонения овала, определяющего 
						// форму огранки в поперечном сечении, от эллипса
	alpha_1 = 28*DEGREE; // Первый угол определяющий положение вершин на Ellipse_1
	alpha_2 = 62*DEGREE; // Второй угол определяющий положение вершин на Ellipse_1
	beta_1 = 11*DEGREE;  // Первый угол определяющий положение вершин на Ellipse_2
	beta_2 = 22*DEGREE;  // Второй угол определяющий положение вершин на Ellipse_2
	beta_3 = 33*DEGREE;  // Третий угол определяющий положение вершин на Ellipse_2
	gamma_1 = 2 * 90*DEGREE / 8; // Первый угол определяющий положение вершин на овале
	gamma_2 = 4 * 90 * DEGREE / 8; // Второй угол определяющий положение вершин на овале
	gamma_3 = 6 * 90 * DEGREE / 8; // Третий угол определяющий положение вершин на овале

	h_facet_ratio = 0.5; // Определяет положение вершин ближайших к острию
	flank_size = 0.1;    // Задает размер среза на тупой части огранки	
	
	controller.lw = lw;
	controller.vp = vp;
	controller.Lh = Lh;
	controller.kY = kY;
	controller.square_deviation = square_deviation;
	
	controller.alpha_1 = alpha_1 / DEGREE;
	controller.alpha_2 = alpha_2 / DEGREE;
	controller.beta_1 = beta_1 / DEGREE;
	controller.beta_2 = beta_2 / DEGREE;
	controller.beta_3 = beta_3 / DEGREE;
	controller.gamma_1 = gamma_1 / DEGREE;
	controller.gamma_2 = gamma_2 / DEGREE;
	controller.gamma_3 = gamma_3 / DEGREE;
	
	controller.h_facet_ratio = h_facet_ratio;
	controller.flank_size = flank_size;
	
	gui.updateDisplay();
	ctx.clearRect(0, 0, hud.width, 4);
}

window.onload = init;
