var canvas, context;
var FRAME_RATE = 60.0;

var verticeTotal;

var GRAFO_OFFSET = 20;
var GRAFO_SPACE = 80;
var GRAFO_SIZE = 30;
var MIN_VERT = 2;
var MAX_VERT = 6;

var vertice;
var adjMatrix = [0,0,0,0,0,0,
				   0,0,0,0,0,
				     0,0,0,0,
					   0,0,0,
					     0,0,
						   0];

var verticeImg;
var verticeSelectedImg;

var elemLeft,
    elemTop,
    elements = [];
	
var selectedOne = -1;
var selectedTwo = -1;

function Start()
{
	canvas = document.getElementById("canvas");
	context = canvas.getContext('2d');
	
	elemLeft = canvas.offsetLeft,
    elemTop = canvas.offsetTop,
	
	verticeImg = new Image();
	verticeImg.src = "vertice.png";
	
	verticeSelectedImg = new Image();
	verticeSelectedImg.src = "vertice_sel.png";
	
	vertice = new Array(MAX_VERT);
	
	verticeTotal = MIN_VERT;
	
	var verticeName = 0;
	for(var i = 0; i < MAX_VERT; ++i)
	{
		vertice[i] = new Array(MAX_VERT);
		
		for(var j = 0; j < MAX_VERT; ++j)
		{
			++verticeName;
			
			vertice[i][j] = {
				pos_x: (GRAFO_OFFSET+GRAFO_SPACE*i),
				pos_y: (GRAFO_OFFSET+GRAFO_SPACE*j),
				index_x: i,
				index_y: j,
				visivel: false,
				selected: false,
				name: verticeName
			}
			
			// Add element.
			// i e j invertidos, no ideia why ¯\_(-.-)_/¯
			elements.push({
				index_i: j,
				index_j: i,
				top: vertice[i][j].pos_x,
				left: vertice[i][j].pos_y
			});
			
			if(i < verticeTotal && j < verticeTotal)
			{
				vertice[i][j].visivel = true;
			}
		}
	}
	
	// Add event listener for `click` events.
	canvas.addEventListener('click', clickElement, false);
	
	setInterval(Loop, 1000/FRAME_RATE);
}

function Loop()
{
	Update();
	Draw();
}

function Update()
{
	if(selectedOne != -1 && selectedTwo != -1)
	{
		adjMatrix[fromMatrixToVector(selectedOne,selectedTwo)] = 1;
	}
}

function Draw()
{
	// Clear canvas
	context.fillStyle = 'rgb(255,255,255)';
	context.fillRect(0,0,canvas.width,canvas.height);
	
	context.font = '15px Arial';
	context.fillStyle = 'black';
	
	for(var i = 0; i < MAX_VERT; ++i)
	{
		for(var j = 0; j < MAX_VERT; ++j)
		{
			if(vertice[i][j].visivel)
			{
				if(!vertice[i][j].selected)
					context.drawImage(verticeImg, vertice[i][j].pos_x, vertice[i][j].pos_y,GRAFO_SIZE,GRAFO_SIZE);
				else
					context.drawImage(verticeSelectedImg, vertice[i][j].pos_x, vertice[i][j].pos_y,GRAFO_SIZE,GRAFO_SIZE);
				
				context.strokeText('('+vertice[i][j].index_x +','+vertice[i][j].index_y+')',vertice[i][j].pos_x,vertice[i][j].pos_y);
			}
		}
	}
	
	drawAresta(vertice[0][0].pos_x,
			   vertice[0][0].pos_y,
			   vertice[1][1].pos_x,
			   vertice[1][1].pos_y,
			   'black');
}

function addElement()
{
	if(verticeTotal < MAX_VERT)
	{
		++verticeTotal;
		reloadVisible();
	}
}

function removeElement()
{
	if(verticeTotal > MIN_VERT)
	{
		--verticeTotal;
		reloadVisible();
	}
}

function reloadVisible()
{
	for(var i = 0; i < MAX_VERT; ++i)
	{
		for(var j = 0; j < MAX_VERT; ++j)
		{
			vertice[i][j].visivel = false;
			
			if(i < verticeTotal && j < verticeTotal)
			{
				vertice[i][j].visivel = true;
			}
		}
	}
}

function drawAresta(ox, oy, dx, dy, color)
{
	context.beginPath();
	context.moveTo(ox+GRAFO_SIZE/2,oy+GRAFO_SIZE/2);
	context.fillStyle = color;
	context.lineTo(dx+GRAFO_SIZE/2,dy+GRAFO_SIZE/2);
	context.stroke();
}

function clickElement(event)
{
	var x = event.pageX - elemLeft,
		y = event.pageY - elemTop;

	var voidClick = true;
	
	// Collision detection between clicked offset and element.
	elements.forEach(function(element) {
		if (y > element.top && y < element.top + GRAFO_SIZE 
			&& x > element.left && x < element.left + GRAFO_SIZE)
		{
			if(vertice[element.index_i][element.index_j].visivel)
			{
				if(vertice[element.index_i][element.index_j].selected)
				{
					vertice[element.index_i][element.index_j].selected = false;
					selectedOne = -1;
				}
				else
				{
					vertice[element.index_i][element.index_j].selected = true;
					
					if(selectedOne == -1)
						selectedOne = vertice[element.index_i][element.index_j].name;
					else
						selectedTwo = vertice[element.index_i][element.index_j].name;
				}
				
				//alert('clicked the element: (' + element.index_i + ',' + element.index_j + ')');
				voidClick = false;
			}
		}
	});
	
	if(voidClick)
		clearSelection();
}

function clearSelection()
{
	for(var i = 0; i < MAX_VERT; ++i)
	{
		for(var j = 0; j < MAX_VERT; ++j)
		{
			vertice[i][j].selected = false;
		}
	}
	
	selectedOne = -1;
	selectedTwo = -1;

}

function fromMatrixToVector(i, j)
{
   if (i <= j)
      return i * MAX_VERT - (i - 1) * i / 2 + j - i;
   else
      return j * MAX_VERT - (j - 1) * j / 2 + i - j;
}