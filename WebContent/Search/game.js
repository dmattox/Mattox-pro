/**
 * 
 */

"use strict";

/*******************************************/

// Defines the scoring area and all related drawing activities
function ScoreRect(left, top, right, bottom) {
	GameObject.call(this, left, top, right, bottom)
}

ScoreRect.prototype = Object.create(GameObject.prototype);
ScoreRect.prototype.contructor = ScoreRect;

//Score area overrides basic GameObject draw
ScoreRect.prototype.draw = function(ctx) {
	if(game.path != null) {
		ctx.textBaseline = "middle";
		ctx.font = scaleText();
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		
		if(game.searchCounter > 0) {
			ctx.fillText("Path Length: " + game.pathLength + "    Distance: " + game.distance + "    Nodes Explored: " + game.searchCounter, scaleX(this.width()/2),scaleY(25));			
		}
		else
		{					
			ctx.fillText("No path found!" ,scaleX(this.width()/2),scaleY(25));
		}
	}
};

/*******************************************/

const START_COLOR = "blue";
const DEST_COLOR = "green";
const BLOCKED_COLOR = "grey";
const PATH_COLOR = "purple";
const EXPLORED_COLOR = "orange";
const FRONTIER_COLOR = "yellow";
const ICON_TEXT_COLOR = "white";
const ICON_NUMBER_COLOR = "black";

// Defines the game area and all related drawing activities
function GameRect(left, top, right, bottom) {
	GameObject.call(this, left, top, right, bottom)
}

GameRect.prototype = Object.create(GameObject.prototype);
GameRect.prototype.contructor = GameRect;


GameRect.prototype.printMessage = function(ctx, currentRect, text, color, align, size = 35) {
	ctx.strokeStyle = color;				
	ctx.fillStyle = color;
	
	ctx.font = scaleText(size);
	
	ctx.textAlign = align;
	ctx.textBaseline = "middle";
	ctx.fillText(text, scaleX(currentRect.left + currentRect.width()/2), scaleY(currentRect.top + game.scoreRect.height() + currentRect.height()/2));
	
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
}

// Draws an individual game piece as text
GameRect.prototype.drawGamePiece = function(ctx, currentRect, gameText, color, size = 35) {
	this.printMessage(ctx, currentRect, gameText, color, "center", size);
}

// Colors in a board square
GameRect.prototype.shadeBox = function(ctx, currentRect, color) {
	ctx.stroke();
	ctx.closePath();
	
	ctx.beginPath();
			
	ctx.fillStyle = color;

	ctx.fillRect(scaleX(currentRect.left), 
			 scaleY(currentRect.top + game.scoreRect.height()), 
			 scaleX(currentRect.width()), 
			 scaleY(currentRect.height()));

	ctx.stroke();	
}

// Highlights the outside edge of a board square
GameRect.prototype.highlightBox = function(ctx, currentBox, color) {	
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();

	ctx.strokeStyle = color;
	
	ctx.lineWidth = "5";
	var currentRect = game.getSquareRect(currentBox.col, currentBox.row);
	
	ctx.strokeRect(scaleX(currentRect.left), 
			 scaleY(currentRect.top + game.scoreRect.height()), 
			 scaleX(currentRect.width()), 
			 scaleY(currentRect.height()));
	
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	
	ctx.lineWidth = "5";
}

// Draws the main game board along with the game pieces and colors squares which are no longer available
GameRect.prototype.drawGameBoard = function(ctx) {
	for(var col = 0; col < game.board.columns; col++) {
		for(var row = 0; row < game.board.rows; row++) {
			
			var currentRect = game.getSquareRect(col, row);
			
			switch(game.board.boardGrid[col][row].type) {
			case game.board.gameBoardEnum.EMPTY_SPACE:
				// If we have random costs enabled, display them
				if(game.randomCost)
					this.drawGamePiece(ctx, currentRect, game.board.boardGrid[col][row].weight, ICON_NUMBER_COLOR, -5);
				
				break;			
			case game.board.gameBoardEnum.STARTING:
				this.shadeBox(ctx, currentRect, START_COLOR);
				
				this.drawGamePiece(ctx, currentRect, "S", ICON_TEXT_COLOR, -5);
				
				break;
			
			case game.board.gameBoardEnum.DESTINATION:
				this.shadeBox(ctx, currentRect, DEST_COLOR);;
				
				this.drawGamePiece(ctx, currentRect, "D", ICON_TEXT_COLOR, -5);								
				
				break;
			
			case game.board.gameBoardEnum.USED_SPACE:
				this.shadeBox(ctx, currentRect, BLOCKED_COLOR);
				
				break;
			}
					
			var currentRect = game.getSquareRect(col, row)
			
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			
			ctx.strokeStyle = "#565656";
			
			// Draw the boxes
			ctx.rect(scaleX(currentRect.left), 
					 scaleY(currentRect.top + game.scoreRect.height()), 
					 scaleX(currentRect.width()), 
					 scaleY(currentRect.height()));

			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			
			ctx.strokeStyle = 'blue';
		}	
	}
}

// Displays a large message in the center of the game space
GameRect.prototype.displayMainMessage = function(ctx, message) {
	ctx.font = scaleText(35);
	
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	
	ctx.globalAlpha = 1.0;

	ctx.fillStyle = "black";

	ctx.fillText(message, scaleX(game.gameRect.width() / 2 + 2), scaleY(game.gameRect.height() / 2 + game.scoreRect.height() +5));

	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	
	ctx.fillStyle = "blue";
	
	ctx.fillText(message, scaleX(game.gameRect.width() / 2 ), scaleY(game.gameRect.height() / 2 + game.scoreRect.height()));
	

	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();

}

// Highlights the square which the mouse is currently hovering over
GameRect.prototype.highlightMousedOverSquare = function(ctx){
	// Highlight the current box the mouse is over
	var currentMouseBox = game.getPhysicalSquare(gameControls.mouse.left, gameControls.mouse.top);
	// Check to make sure they are moused over
	if(currentMouseBox.col != -1) {
		this.highlightBox(ctx, currentMouseBox, 'blue');
	}
}

// Colors explored squares
GameRect.prototype.showExplored = function(ctx) {
	if(game.explored == null)
		return;
	
	for(let node of game.explored) {
		var currentRect = game.getSquareRect(node.col, node.row);	
		
		this.shadeBox(ctx, currentRect, EXPLORED_COLOR);		
	}
}

//Colors squares on the frontier
GameRect.prototype.showFrontier = function(ctx) {
	if(game.frontier == null)
		return;
	
	for(let node of game.frontier) {
		var currentRect = game.getSquareRect(node.nodeID.col, node.nodeID.row);	
			
		this.shadeBox(ctx, currentRect, FRONTIER_COLOR);		
	}
}

//Colors squares on the path
GameRect.prototype.showShortestPath = function(ctx) {
	if(game.path == null)
		return;
	
	for(let node of game.path) {
		var currentRect = game.getSquareRect(node.col, node.row);	
			
		this.shadeBox(ctx, currentRect, PATH_COLOR);		
	}
}

GameRect.prototype.drawLegendItem = function(ctx, x, y, iconText, iconTextColor, iconBackgroundColor, legendText, legendColor) {
	var currentRect = new Rect(x, y, x+25, y+30);
	
	this.shadeBox(ctx, currentRect, iconBackgroundColor);
	
	this.drawGamePiece(ctx, currentRect, iconText, iconTextColor, -5);
	
	currentRect.left += 40; 
	
	this.printMessage(ctx, currentRect, legendText, legendColor, "left", -1);	 
}

GameRect.prototype.drawLegend = function(ctx) {
	this.drawLegendItem(ctx, 10, 610, "S", ICON_TEXT_COLOR, START_COLOR, "- Start", "black");
	this.drawLegendItem(ctx, 170, 610, "D", ICON_TEXT_COLOR, DEST_COLOR, "- Destination", "black");
	this.drawLegendItem(ctx, 340, 610, "", ICON_TEXT_COLOR, BLOCKED_COLOR, "- Blocked", "black");
	this.drawLegendItem(ctx, 510, 610, "", ICON_TEXT_COLOR, PATH_COLOR, "- Path", "black");
	this.drawLegendItem(ctx, 680, 610, "", ICON_TEXT_COLOR, EXPLORED_COLOR, "- Explored", "black");
	this.drawLegendItem(ctx, 850, 610, "", ICON_TEXT_COLOR, FRONTIER_COLOR, "- Frontier", "black");
}

//Game area overrides basic GameObject draw
GameRect.prototype.draw = function(ctx) {	
	ctx.beginPath();
	
	ctx.lineWidth = "2";

	this.showExplored(ctx);
	
	this.showFrontier(ctx);
	
	this.showShortestPath(ctx);
	
	this.drawGameBoard(ctx);
	
	this.drawLegend(ctx);
		
	this.highlightMousedOverSquare(ctx);
};

/*******************************************/

// The main class of the game. Controls the major game components and state
function Game() {
	//Define the physical screen
	this.physicalRect = new Rect(0,0, window.innerWidth, window.innerHeight);

	//Define the rectangle for the score section
	this.scoreRect = new ScoreRect(0, 0, 1000, 50);
	
	this.board = new Board();

	this.gameStateEnum = {
			DEMO : "Demo",
			PLAYING : "Playing",
	};

	this.gameRect = new GameRect(0, 75, 1000, 700);

	this.gameState = this.gameStateEnum.DEMO;

	this.squareWidth = (this.gameRect.width() - 20) / this.board.columns;
	//game.squareWidth = 400 / game.columns;
	this.squareHeight = (this.gameRect.height() - 20) / this.board.rows;
	//game.squareHeight = 200 / game.rows;

	this.xScale = this.physicalRect.right / this.gameRect.right;
	this.yScale = this.physicalRect.bottom / this.gameRect.bottom;
        
    this.explored = null;
    this.frontier = null;
    this.path = null;
    
    this.slowSearch = false;
    
    this.searchCompleted = true;
		
    // Javascript doesn't allow worker threads to sleep, so moving away from this approach to better display what the algorithms are doing
/*	this.process = function(event){
		  var data = event.data;
		  switch (data.cmd) {
		    case 'path':
		      console.log('Worker said - path ID:' + data.ID + " path:" + data.path.length);
		      
		      // Try to discard messages we are no longer interested in
		      if(this.messageGroupID == data.ID) {		    	  
		    	  game.path = data.path;
		    	  game.pathLength = data.path.length;
		    	  game.distance = data.distance;
		    	  game.searchCounter = data.searchCounter;
		      }
		      
		      break;
		    case 'currentStatus':
		      //console.log('Work said - currentStatus ID:' + data.messageID + ' explored:' + data.explored.length + ' frontier:' + data.frontier.length);
		      console.log('Work said - currentStatus ID:' + data.ID + ' explored:' + data.explored.length + ' frontier:' + data.frontier.length);
		      
		      if(this.messageGroupID == data.ID) {
		    	  this.explored = data.explored;
		    	  this.frontier = data.frontier;
		      }
		      break;		      
		    case 'stop':
		      console.log('Worker said - stopped');
		      break;
		    default:
		      console.log('Worker said - Unknown command: ' + data.msg);
		  };
	}
	
	//Add a listener to receive moves from the worker thread
	this.worker.addEventListener('message', this.process.bind(this), false);*/
};

// Returns the virtual deminsions for a given square based on the column and row provided
Game.prototype.getSquareRect = function(col, row) {
	return new Rect(col * game.squareWidth, row * game.squareHeight, (col + 1) * game.squareWidth, (row + 1) * game.squareHeight);
};

// Returns the square based on the passed in coordinates. Must be scaled to the virtual size - position
Game.prototype.getVirtualSquare = function(x, y) {
	var square = new Point(Math.floor(x / game.squareWidth), Math.floor(y / game.squareHeight));
	if(square.col < 0 || square.row < 0 || square.col >= game.board.columns || square.row >= game.board.rows)
		square = new Point(-1, -1);
	return square;
}

// Returns the square based on the passed in coordinates. Must be physical coordinates
Game.prototype.getPhysicalSquare = function(x, y){
	return game.getVirtualSquare(x / game.xScale, (y) / game.yScale - game.scoreRect.height());
}

// Handles an invalid move
Game.prototype.invalidMoveSelected = function() {
	$.growl({ title: "", message: "Invalid move!"});
}

// Toggles a blocked square 
Game.prototype.toggleSquare = function(square) {
	if(this.board.boardGrid[square.col][square.row].type == this.board.gameBoardEnum.EMPTY_SPACE) {
		this.board.boardGrid[square.col][square.row].type = this.board.gameBoardEnum.USED_SPACE;
		return;
	}
	
	if(this.board.boardGrid[square.col][square.row].type == this.board.gameBoardEnum.USED_SPACE) {
		this.board.boardGrid[square.col][square.row].type = this.board.gameBoardEnum.EMPTY_SPACE;
		return;
	}
}

// Resets the game board
Game.prototype.resetBoard = function() {	
	if(game.randomCost == true)
		this.board.initilizeBoard(-1);
	else
		this.board.initilizeBoard(1);
	
	var positions = this.board.randomizeBoard();
	
	this.startLocation = positions.start;
	this.destinationLocation = positions.destination;
}

// Starts a new game
Game.prototype.newGame = function() {
	this.resetBoard();
	
	this.gameState = game.gameStateEnum.PLAYING;


	this.movementLoop();
}

// Starts moving the other player
Game.prototype.movementLoop = function() {
	// TODO
}

// Recalculates scaling of the virtual to physical mapping for the initial screen and when the screen is resized 
Game.prototype.recalcScaling = function(width, height) {
	var canvas = document.getElementById("searchCanvas");
	
	canvas.width = width;
	canvas.height = height;

	this.physicalRect = new Rect(0,0, width, height);

	this.xScale = this.physicalRect.right / this.gameRect.right;
	this.yScale = this.physicalRect.bottom / this.gameRect.bottom;
	
	this.squareWidth = (this.gameRect.width() - 20) / this.board.columns;
	this.squareHeight = (this.gameRect.height() - 20) / this.board.rows;
}

// Checks to see if the screen size has changed enough to require rescaling
Game.prototype.checkScreenResize = function() {
	var canvas = document.getElementById("searchCanvas");
	
	var parentSize = canvas.parentNode.getBoundingClientRect();
	
	var width = parentSize.width - parentSize.left;
	var height = parentSize.height - parentSize.top;
	
	// Check to see if the window size has changed
	if(this.physicalRect.right < width - 10 || this.physicalRect.bottom < height - 10 ||
			this.physicalRect.right > width + 10 || this.physicalRect.bottom > height + 10){
		this.recalcScaling(width, height);
	}
};

// Transitions the game to a play state
Game.prototype.switchToPlayState = function() {
	this.gameState = this.gameStateEnum.PLAYING;
};

// Returns if the game is currently in demo mode
Game.prototype.isDemo = function() {
	return this.gameState == this.gameStateEnum.DEMO;
};

// Returns if the game is currently in playing mode
Game.prototype.isPlaying = function() {
	return this.gameState == this.gameStateEnum.PLAYING;
};

// Handles updates to animation components
Game.prototype.animate = function() {
	if(!this.searchCompleted) {
		// Note the actual drawing is handled as part of the GameRect.draw routine
		//return {'completed': this.searchComplete, 'path': path, 'distance': current.distance + this.board.boardGrid[node.col][node.row].weight, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
	    var result = game.search.continueSearch();

	    this.processResults(result);	    
	}
}

Game.prototype.processResults = function(result) {
    this.searchCompleted = result.completed;
	this.explored = result.explored;
	this.frontier = result.frontier;	
	this.path = result.path;
	this.distance = result.distance;
	this.searchCounter = result.searchCounter;
	if(result.path != null)
		this.pathLength = result.path.length;

}

// changes the board size based on the GUI sliders
Game.prototype.updateBoardSize = function() {
	var newColumns = document.getElementById("columns").value;
	var newRows = document.getElementById("rows").value;
	var blockDensity = document.getElementById("blockDensity").value;
	
	if(newColumns < 10 || newColumns > 100 || newRows < 10 || newColumns > 100)
		return;
	
	game.board.columns = newColumns;
	game.board.rows = newRows;
	game.board.blockDensity = blockDensity;
	
	game.resetBoard();
	
	game.recalcScaling(game.physicalRect.width(), game.physicalRect.height());
	
	if(!game.isDemo())
		game.newGame();
}

Game.prototype.performSearch = function(type = game.currentSearch) {
	
	if(game.startLocation != null) {
		this.searchCompleted = false;
		this.path = null;		      	            		      
	    this.explored = null;
	    this.frontier = null;
	    
	    switch(game.currentSearch) {
	    case 'bfs':
	    	game.search = new BreadthFirstSearch();
	    	break;
	    case 'dfs':
	    	game.search = new DepthFirstSearch();
	    	break;	 
	    case 'ucs':
	    	game.search = new UniformCostSearch();
	    	break;	 
		case 'astar':
			game.search = new AStarSearch();
			break;	 
		}
	
	    var result = game.search.performSearch(game.board, game.startLocation, game.destinationLocation);
	    
	    this.processResults(result);	    
	}	
}



// The main game object instance
var game = new Game();

/*******************************************/

// The main animation loop
function animate() {
	if(game.isDemo()) {
		; // No demo actions for this game
	}
		
	game.animate();

	screen.updateScreen();
    
    requestAnimationFrame(animate);
};


/*******************************************/

// Basic controls for the game
function GameControls() {
	this.keyPressed = {};

	this.mouse = new Rect(-1,-1,-1,-1);
	this.mouse.mouseClick = false;
	this.currentSquare = null;

	// Displays debugging information on the screen
	this.debug = false;	
}

GameControls.prototype.checkToToggleSquares = function() {
	var newSquare = game.getPhysicalSquare(gameControls.mouse.left, gameControls.mouse.top);
		
	// Only toggle if the user moved to a new square
	if(gameControls.currentSquare == null || newSquare.col != gameControls.currentSquare.col || newSquare.row != gameControls.currentSquare.row) {
		gameControls.currentSquare = newSquare;
		
		if(newSquare.col == -1)
			return;
		
		game.toggleSquare(gameControls.currentSquare);
	}	
}

var gameControls = new GameControls();

/*******************************************/

var screen = Object.create(null);

// The main screen update function
screen.updateScreen = function(ctx) {

	var canvas = document.getElementById("searchCanvas");
	
	var ctx = canvas.getContext("2d");
	
	game.checkScreenResize(); 

	// Black background
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, canvas.width, canvas.height); 

	ctx.fillStyle = "red";
	ctx.font = scaleText();
			
	// Draw Game area
	game.gameRect.draw(ctx);

	// Draw Score
	game.scoreRect.draw(ctx);

	// Debug information
	if(gameControls.debug){
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		
		ctx.fillStyle = "red";
				
		ctx.textAlign = "left";
		ctx.fillText("gameRect: " + game.gameRect.left + " " + game.gameRect.top + " " + game.gameRect.right + " " + game.gameRect.bottom, 50 ,250);
		ctx.fillText("gameState: " + game.gameState, 50 ,300);
		if(gameControls.currentSquare != null)
			ctx.fillText("gameControls.currentSquare: (" + gameControls.currentSquare.col + ", " + gameControls.currentSquare + ")", 50 ,350);
		else
			ctx.fillText("gameControls.currentSquare: " + gameControls.currentSquare, 50 ,350);
		ctx.fillText("Mouse Rect: " + gameControls.mouse.left + " " + gameControls.mouse.top + " " + gameControls.mouse.right + " " + gameControls.mouse.bottom , 50 ,400);
		ctx.fillText("Mouse click: " + gameControls.mouse.mouseClick, 50 ,450);
		var currentSquare = game.getPhysicalSquare(gameControls.mouse.left, gameControls.mouse.top);
		ctx.fillText("Col:" + currentSquare.col + " Row:" + currentSquare.row, 50, 500);
		ctx.fillText("XScale: " + game.xScale + " YScale:" + game.yScale, 50 ,550);
		ctx.fillText("physicalRect: " + game.physicalRect.left + " " + game.physicalRect.top + " " + game.physicalRect.right + " " + game.physicalRect.bottom, 50 ,600);
		ctx.fillText("Canvas: " + canvas.width + " " + canvas.height + " Canvas Offset Left:" + canvas.offsetLeft + " Canvas Offset Top:" + canvas.offsetTop , 50 ,650);
		ctx.fillText(game.board.boardGrid, 50 ,700);
		
		ctx.stroke();
		ctx.closePath();
	}
};

/*******************************************/

// Loaded on application start
function onLoad() {
	
	onclickBreadthFirstSearch();
	
	var canvas = document.getElementById("searchCanvas");
	
	// Hide scroll bars
	document.body.style.overflow = "hidden";
	
	game.updateBoardSize();
	
	game.resetBoard();

	animate();  
	
	game.performSearch('bfs');
	
	// Listen for keyboard down events
    canvas.addEventListener('keydown', function(e) {
		// Start the Game if we were in demo mode
    	if(game.isDemo())
			game.switchToPlayState();

		// Store the key press
    	gameControls.keyPressed[e.keyCode] = true;

		// Check to see if paused
		if(gameControls.keyPressed['P'.charCodeAt(0)]) {
			; // dont need to do anything
		}			
    	
	}, false);

    // Listen for keyboard up events
    canvas.addEventListener('keyup', function(e) {
        // Store that the key was released
     	gameControls.keyPressed[e.keyCode] = false;
    }, false);

 	// Listen for touchscreen events
    canvas.addEventListener('touchstart', function(e) {
		e.preventDefault();

		var canvas = document.getElementById("searchCanvas").getBoundingClientRect();
		
		// There can be multiple touches, loop through each of them.
		for(var i = 0; i < e.touches.length; i++) {
			var touch = e.changedTouches[i];
			
			gameControls.mouse.left = e.changedTouches[0].pageX - canvas.left;
			gameControls.mouse.top = e.changedTouches[0].pageY - canvas.top;
	    	gameControls.mouse.right = e.changedTouches[0].pageX - canvas.left;
	    	gameControls.mouse.bottom = e.changedTouches[0].pageY - canvas.top;
	    	
	    	gameControls.checkToToggleSquares();
		}
    }, false);
 	
    canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();

    	var canvas = document.getElementById("searchCanvas").getBoundingClientRect();
		
		// There can be multiple touches, loop through each of them.
		for(var i = 0; i < e.touches.length; i++) {
			var touch = e.changedTouches[i];
			
			gameControls.mouse.left = e.changedTouches[0].pageX - canvas.left;
			gameControls.mouse.top = e.changedTouches[0].pageY - canvas.top;
	    	gameControls.mouse.right = e.changedTouches[0].pageX - canvas.left;
	    	gameControls.mouse.bottom = e.changedTouches[0].pageY - canvas.top;
			
			gameControls.checkToToggleSquares();
		}
	
    }, false);

    canvas.addEventListener('touchend', function(e) {
		e.preventDefault();
		
		gameControls.currentSquare = null;

    	var canvas = document.getElementById("searchCanvas").getBoundingClientRect();
			
		gameControls.mouse.left = e.changedTouches[0].pageX - canvas.left;
		gameControls.mouse.top = e.changedTouches[0].pageY - canvas.top;
    	gameControls.mouse.right = e.changedTouches[0].pageX - canvas.left;
    	gameControls.mouse.bottom = e.changedTouches[0].pageY - canvas.top;
    	
    }, false);  

    canvas.addEventListener('mousedown', function(e) {  	  	
    	e.preventDefault();
    	
    	// Offset for the canvas location
    	var canvas = document.getElementById("searchCanvas").getBoundingClientRect();
   	
    	// Store the mouse location
		gameControls.mouse.left = e.pageX - canvas.left;
		gameControls.mouse.top = e.pageY - canvas.top;
    	gameControls.mouse.right = e.pageX - canvas.left;
    	gameControls.mouse.bottom = e.pageY - canvas.top;
    	
    	
		gameControls.mouse.mouseClick = true;
				
		gameControls.checkToToggleSquares();
		
    }, false);
    
 	// Listen for mouse events
    canvas.addEventListener('mousemove', function(e) {
    	e.preventDefault();

    	// Offset for the canvas location
    	var canvas = document.getElementById("searchCanvas").getBoundingClientRect();
   	
    	// Store the mouse location
		gameControls.mouse.left = e.pageX - canvas.left;
		gameControls.mouse.top = e.pageY - canvas.top;
    	gameControls.mouse.right = e.pageX - canvas.left;
    	gameControls.mouse.bottom = e.pageY - canvas.top;
	
		// Only change when the mouse is clicked
		if(gameControls.mouse.mouseClick) {
			gameControls.checkToToggleSquares();
		}			
				   	
    }, false);
    
    canvas.addEventListener('mouseup', function(e) {
    	e.preventDefault();

    	// Offset for the canvas location
    	var canvas = document.getElementById("searchCanvas").getBoundingClientRect();
    	
    	gameControls.mouse.mouseClick = false;
    	
    	// Store the mouse location
    	gameControls.mouse.left = e.clientX - canvas.left;
    	gameControls.mouse.top = e.clientY - canvas.top;
    	gameControls.mouse.right = e.clientX - canvas.left;
    	gameControls.mouse.bottom = e.clientY - canvas.top;
 	
    	gameControls.currentSquare = null;
    	
    }, false); 
}

/*******************************************/

// Called when a user clicks on the player type selection buttons
function onclickBreadthFirstSearch(element) {
	document.getElementById("breadthFirstSearch").checked = true;
	document.getElementById("depthFirstSearch").checked = false;
	document.getElementById("uniformCostSearch").checked = false;
	document.getElementById("aStarSearch").checked = false;
	
	game.currentSearch = 'bfs';
	game.performSearch();
}

function onclickDepthFirstSearch(element) {
	document.getElementById("breadthFirstSearch").checked = false;
	document.getElementById("depthFirstSearch").checked = true;
	document.getElementById("uniformCostSearch").checked = false;
	document.getElementById("aStarSearch").checked = false;

	game.currentSearch = 'dfs';
	game.performSearch();
}

function onclickUniformCostSearch(element) {
	document.getElementById("breadthFirstSearch").checked = false;
	document.getElementById("depthFirstSearch").checked = false;
	document.getElementById("uniformCostSearch").checked = true;
	document.getElementById("aStarSearch").checked = false;

	game.currentSearch = 'ucs';
	game.performSearch();
}

function onclickAStarSearch(element) {
	document.getElementById("breadthFirstSearch").checked = false;
	document.getElementById("depthFirstSearch").checked = false;
	document.getElementById("uniformCostSearch").checked = false;
	document.getElementById("aStarSearch").checked = true;

	game.currentSearch = 'astar';
	game.performSearch();
}

function onclickRandomCost(element) {
	game.randomCost = element.checked;
	
	game.updateBoardSize();
	game.performSearch();
}

function onclickSlowSearch(element) {
	game.slowSearch = element.checked;
	
	game.performSearch();
}
