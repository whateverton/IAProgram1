var canvas, context;
var FRAME_RATE = 60.0;

var verticeTotal;

var GRAFO_OFFSET = 20;
var GRAFO_SPACE = 80;
var GRAFO_SIZE = 30;
var MIN_VERT = 2;
var MAX_VERT = 6;

var vertice;
var adjMatrix = [0,0,0,0,
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

var exibeGrafo = true;

function Start()
{
	canvas = document.getElementById("canvas");
	context = canvas.getContext('2d');
	
	elemLeft = canvas.offsetLeft,
    elemTop = canvas.offsetTop,
	
	exibeGrafo = true;
	
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
			vertice[i][j] = {
				pos_x: (GRAFO_OFFSET+GRAFO_SPACE*i),
				pos_y: (GRAFO_OFFSET+GRAFO_SPACE*j),
				index_x: i,
				index_y: j,
				visivel: false,
				selected: false,
				name: verticeName
			}
			
			++verticeName;
			
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
		if((elements[selectedOne].index_i - elements[selectedTwo].index_i) == 1 || (elements[selectedOne].index_j - elements[selectedTwo].index_j) == 1||
		   (elements[selectedOne].index_i - elements[selectedTwo].index_i) == -1 || (elements[selectedOne].index_j - elements[selectedTwo].index_j) == -1)
		{
			if(adjMatrix[fromMatrixToVector(selectedOne,selectedTwo)] != 0)
				adjMatrix[fromMatrixToVector(selectedOne,selectedTwo)] = 0;
			else
			{
				if((elements[selectedOne].index_i != elements[selectedTwo].index_i) && (elements[selectedOne].index_j != elements[selectedTwo].index_j))
					adjMatrix[fromMatrixToVector(selectedOne,selectedTwo)] = 2;
				else
					adjMatrix[fromMatrixToVector(selectedOne,selectedTwo)] = 1;
			}
		}
		
		clearSelection();
	}
}

function Draw()
{
	// Clear canvas
	context.fillStyle = 'rgb(255,255,255)';
	context.fillRect(0,0,canvas.width,canvas.height);
	
	context.font = '15px Arial';
	context.fillStyle = 'black';
	
	if(exibeGrafo)
	{
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
	
		checkAdjMatrix();
	}
	else
	{
		drawAdjMatrix();
	}
}

function addElement()
{
	if(verticeTotal < MAX_VERT)
	{
		++verticeTotal;
		reloadVisible();
		
		var sqrVertice = verticeTotal*verticeTotal;
		var matrixSize = sqrVertice*(sqrVertice+1)/2;
    adjMatrix = [];
		adjMatrix = new Array(matrixSize); //N(N+1)/2
		for(var i = 0; i < matrixSize; ++i)
			adjMatrix[i] = 0;
	}
}

function removeElement()
{
	if(verticeTotal > MIN_VERT)
	{
		--verticeTotal;
		reloadVisible();
		
		var sqrVertice = verticeTotal*verticeTotal;
		var matrixSize = sqrVertice*(sqrVertice+1)/2;
    adjMatrix = [];
		adjMatrix = new Array(matrixSize); //N(N+1)/2
		for(var i = 0; i < matrixSize; ++i)
			adjMatrix[i] = 0;
	}
}

function reloadVisible()
{
	elements = [];
	
	for(var i = 0; i < MAX_VERT; ++i)
	{
		for(var j = 0; j < MAX_VERT; ++j)
		{
			vertice[i][j].visivel = false;

			if(i < verticeTotal && j < verticeTotal)
			{
				vertice[i][j].visivel = true;
				
				elements.push({
						index_i: j,
						index_j: i,
						top: vertice[i][j].pos_x,
						left: vertice[i][j].pos_y
					});
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
						selectedOne = vertice[element.index_i][element.index_j].index_x + vertice[element.index_i][element.index_j].index_y*verticeTotal;
					else
						selectedTwo = vertice[element.index_i][element.index_j].index_x + vertice[element.index_i][element.index_j].index_y*verticeTotal;
				}
				
				//alert('clicked the element: (' + element.index_i + ',' + element.index_j + ')');
				//alert('clicked the element: (' + vertice[element.index_i][element.index_j].index_x + ',' + vertice[element.index_i][element.index_j].index_y + ')');
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
      return i * verticeTotal * verticeTotal - (i - 1) * i / 2 + j - i;
   else
      return j * verticeTotal * verticeTotal - (j - 1) * j / 2 + i - j;
}

function checkAdjMatrix()
{
	/*for(var i = 0; i < verticeTotal*verticeTotal; ++i)
	{
		for(var j = 0; j < verticeTotal*verticeTotal; ++j)
		{
			if(adjMatrix[fromMatrixToVector(i,j)] != 0)
			{
				drawAresta(vertice[elements[i].index_i][elements[i].index_j].pos_x,
						   vertice[elements[i].index_i][elements[i].index_j].pos_y,
						   vertice[elements[j].index_i][elements[j].index_j].pos_x,
						   vertice[elements[j].index_i][elements[j].index_j].pos_y,
						   'black');
			}
		}
	}
  */ 
  var matCol = 0; // x
  var matRow = 0; // y
  
  var vertCol = 0;
  var vertRow = 0;
  
  var vertCol2 = 0;
  var vertRow2 = 0;
  
  for(var i = 0; i < adjMatrix.length; ++i)
  {
    if(adjMatrix[i] != 0)
	{
		drawAresta(vertice[vertCol][vertRow].pos_x,
				   vertice[vertCol][vertRow].pos_y,
				   vertice[vertCol2][vertRow2].pos_x,
				   vertice[vertCol2][vertRow2].pos_y,
				   'black');
    }
    
    //if(matRow == 0)
    //{    
      ++vertCol;
      if(vertCol == verticeTotal)
      {
        ++vertRow;
        vertCol = 0;
      }
      
      if(vertRow == verticeTotal)
        vertRow = 0;
    //}
    
    ++matCol;
    if(matCol == (verticeTotal*verticeTotal))
    {
      ++matRow;
      matCol = matRow;
	  
	  for(var k = 0; k < matRow; ++k)
	  {
		  ++vertCol;
		  if(vertCol == verticeTotal)
		  {
			++vertRow;
			vertCol = 0;
		  }
		  
		  if(vertRow == verticeTotal)
			vertRow = 0;
	  }
    }
	
    if((matCol == matRow) && (matRow != 0))
    {
      ++vertCol2;
      if(vertCol2 == verticeTotal)
      {
        ++vertRow2;
        vertCol2 = 0;
      }
      
      if(vertRow2 == verticeTotal)
        vertRow2 = 0;
    }
  }
}

function drawAdjMatrix()
{
  context.font = '8px Arial';
	context.fillStyle = 'black';
  
  var matCol = 0; // x
  var matRow = 0; // y
  
  var vertCol = 0;
  var vertRow = 0;
  
  var vertCol2 = 0;
  var vertRow2 = 0;
  
  for(var i = 0; i < adjMatrix.length; ++i)
  {
	if(adjMatrix[i] == 2)
		context.strokeText('√'+adjMatrix[i],45+matCol*20,40+matRow*20);
	else
		context.strokeText(adjMatrix[i],45+matCol*20,40+matRow*20);
    
    if(matRow == 0)
    {
      context.strokeText('('+vertCol+','+vertRow+')',40+matCol*20,20+matRow);
    
      ++vertCol;
      if(vertCol == verticeTotal)
      {
        ++vertRow;
        vertCol = 0;
      }
      
      if(vertRow == verticeTotal)
        vertRow = 0;
    }
    
    if(matCol == matRow)
    {
      context.strokeText('('+vertCol2+','+vertRow2+')',10,40+matRow*20);
    
      ++vertCol2;
      if(vertCol2 == verticeTotal)
      {
        ++vertRow2;
        vertCol2 = 0;
      }
      
      if(vertRow2 == verticeTotal)
        vertRow2 = 0;
    }
    
    ++matCol;
    if(matCol == (verticeTotal*verticeTotal))
    {
      ++matRow;
      matCol = matRow;
    }
  }
}

function toggleGrafoMatriz()
{
	if(exibeGrafo)
		exibeGrafo = false;
	else
		exibeGrafo = true;
}

function clearAll()
{
	var sqrVertice = verticeTotal*verticeTotal;
	var matrixSize = sqrVertice*(sqrVertice+1)/2;
	adjMatrix = [];
	adjMatrix = new Array(matrixSize); //N(N+1)/2
	for(var i = 0; i < matrixSize; ++i)
		adjMatrix[i] = 0;
	
	clearSelection();
}