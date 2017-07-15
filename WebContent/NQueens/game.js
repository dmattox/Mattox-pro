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
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	
	ctx.font = scaleText(10);
	
	ctx.strokeStyle = "black";
	ctx.fillStyle = "black";
	
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	var printString;
	
	if(game.board.totalAttacks > 0) 
		printString = "Total attacks: " + game.board.totalAttacks;
	else
		printString = "Solution Found! " ;
	
	if(game.gamePlayer == game.gamePlayerTypeEnum.GENETIC)
		printString += " Generation:" + game.geneticPlayer.generation
	
	ctx.fillText(printString ,scaleX(this.width()/2),scaleY(this.height()/2));
	
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
};

/*******************************************/

const QUEEN_TEXT_COLOR = "blue";
const QUEEN_ATTACK_TEXT_COLOR = "red";
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
	
	// Queen image objects
	this.whiteQueenImage = new Image();
	this.whiteQueenImage.src = '../images/queen.png';
	
	this.redQueenImage = new Image();
	this.redQueenImage.src = '../images/queen-red.png';
	
	this.greenQueenImage = new Image();
	this.greenQueenImage.src = '../images/queen-green.png';	
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
	for(var col = 0; col < game.board.size; col++) {
		for(var row = 0; row < game.board.size; row++) {
			
			var currentRect = game.getSquareRect(col, row);
			
			switch(game.board.boardGrid[col][row]) {
			case game.board.gameBoardEnum.EMPTY_SPACE:
				
				break;			
			default: // Must be a queen				
				var currentQueenID = game.board.boardGrid[col][row];
				this.drawQueen(ctx, currentRect, new Point(col, row), currentQueenID, game.board.queenList[currentQueenID].attackCount);
				
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

GameRect.prototype.drawQueen = function(ctx, currentRect, currentSquare, queenID, attackCount) {
	// Don't draw the queen if it is being moved
	if(gameControls.selectedQueen != null && currentSquare.col == gameControls.selectedQueen.col && currentSquare.row == gameControls.selectedQueen.row )
		return;
	
	var size = Math.min(currentRect.width(), currentRect.height());
	
	var queenImage = this.greenQueenImage;
	if(attackCount > 0)
		queenImage = this.redQueenImage;
		
	ctx.drawImage(queenImage, scaleX(currentRect.left + (currentRect.width() - size)/2), scaleY(currentRect.top +
			game.scoreRect.height()), scaleX(size), scaleY(size));
	
	//this.printMessage(ctx, new Rect(currentRect.left, currentRect.top, currentRect.left + 20, currentRect.bottom) , queenID + 1, QUEEN_TEXT_COLOR, "left", 5);
	//this.printMessage(ctx, new Rect(currentRect.right - 20, currentRect.top, currentRect.right, currentRect.bottom) , attackCount, QUEEN_ATTACK_TEXT_COLOR, "right", 5); 
}

GameRect.prototype.drawMovingQueen = function(ctx, currentRect) {
	// Only draw the moving queen if it is selected
	if(gameControls.selectedQueen == null)
		return;
	
	// Get a square so we can have its size
	var squareRect = game.getSquareRect(0, 0);
	
	
	var size = Math.min(squareRect.width(), squareRect.height());
	
	ctx.drawImage(this.whiteQueenImage, gameControls.mouse.left - scaleX(squareRect.width()/2), scaleY(gameControls.mouse.top - squareRect.height()/2), scaleX(size), scaleY(size));
}

GameRect.prototype.displayGeneticDetails = function(ctx) {
	if(game.isGeneticPlayer()) {
		ctx.fillStyle = "blue";
		
		ctx.textAlign = "left";
		
		ctx.font = scaleText(-5);
		ctx.fillText("Potential Queen Layouts:", scaleX(625),scaleY(75));
		
		for(var i = 0; i < NUMBER_OF_CANDIDATES; i++) {
			if(game.geneticPlayer.candidateBoards[i].totalAttacks == 0)
				ctx.fillStyle = "green";
			else
				ctx.fillStyle = "blue";
			
			ctx.font = scaleText(-8);
			ctx.fillText(i+1 + ": Total Attacks: " + game.geneticPlayer.candidateBoards[i].totalAttacks, scaleX(625),scaleY(100 + i * 2 *25));
			ctx.font = scaleText(-10);
			ctx.fillText("Queen Rows: " + game.geneticPlayer.queenPositionsToString(i), scaleX(640),scaleY(100 + (i * 2 + .75) *25));
			
		}	
	}
}

//Game area overrides basic GameObject draw
GameRect.prototype.draw = function(ctx) {	
	ctx.beginPath();
	
	ctx.lineWidth = "2";
	
	this.drawGameBoard(ctx);
	
	this.drawMovingQueen(ctx);
	
	this.displayGeneticDetails(ctx);
		
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
	
	this.gamePlayerTypeEnum = {
			HUMAN : "Human",
			GENETIC : "Genetic"
	}
	
	this.gamePlayer = this.gamePlayerTypeEnum.HUMAN;

	this.gameRect = new GameRect(0, 75, 1000, 700);

	this.squareWidth = (this.gameRect.width() - 20) / this.board.size;
	//game.squareWidth = 400 / game.columns;
	this.squareHeight = (this.gameRect.height() - 20) / this.board.size;
	//game.squareHeight = 200 / game.rows;

	this.xScale = this.physicalRect.right / this.gameRect.right;
	this.yScale = this.physicalRect.bottom / this.gameRect.bottom;
	
    this.worker = new Worker('search.js');
    
    this.messageGroupID = 0;
    
    this.explored = null;
    this.frontier = null;
    this.path = null;
   
		
	this.process = function(event){
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
	this.worker.addEventListener('message', this.process.bind(this), false);
};

// Returns the virtual deminsions for a given square based on the column and row provided
Game.prototype.getSquareRect = function(col, row) {
	return new Rect(col * game.squareWidth, row * game.squareHeight, (col + 1) * game.squareWidth, (row + 1) * game.squareHeight);
};

// Returns the square based on the passed in coordinates. Must be scaled to the virtual size - position
Game.prototype.getVirtualSquare = function(x, y) {
	var square = new Point(Math.floor(x / game.squareWidth), Math.floor(y / game.squareHeight));
	if(square.col < 0 || square.row < 0 || square.col >= game.board.size || square.row >= game.board.size)
		square = new Point(-1, -1);
	return square;
}

// Returns the square based on the passed in coordinates. Must be physical coordinates
Game.prototype.getPhysicalSquare = function(x, y){
	return game.getVirtualSquare(x / game.xScale, (y) / game.yScale - game.scoreRect.height());
}

// Resets the game board
Game.prototype.resetBoard = function() {	
	if(game.randomCost == true)
		this.board.initilizeBoard(-1);
	else
		this.board.initilizeBoard(1);
}

// Recalculates scaling of the virtual to physical mapping for the initial screen and when the screen is resized 
Game.prototype.recalcScaling = function(width, height) {
	var canvas = document.getElementById("searchCanvas");
	
	canvas.width = width;
	canvas.height = height;

	this.physicalRect = new Rect(0,0, width, height);

	this.xScale = this.physicalRect.right / this.gameRect.right;
	this.yScale = this.physicalRect.bottom / this.gameRect.bottom;
	
	var size = Math.min(this.gameRect.width(), this.gameRect.height())	
	this.squareWidth = (size - 20) / this.board.size;
	this.squareHeight = (size - 20) / this.board.size; 
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


// Handles updates to animation components
Game.prototype.animate = function() {
	if(this.isGeneticPlayer() && game.board.totalAttacks > 0) {
		game.board.replaceQueenList(game.geneticPlayer.createNewGeneration());
	}
}

// changes the board size based on the GUI slider
Game.prototype.updateBoardSize = function() {
	var newSize = document.getElementById("size").value;
	
	game.board.size = newSize;
	
	game.resetBoard();
	
	game.recalcScaling(game.physicalRect.width(), game.physicalRect.height());
	
	game.geneticPlayer = new Genetic(game.board.size);
}

Game.prototype.isHumanPlayer = function() {
	return this.gamePlayer == this.gamePlayerTypeEnum.HUMAN;
}

Game.prototype.isGeneticPlayer = function() {
	return !this.isHumanPlayer();
}

Game.prototype.setHumanPlayer = function() {
	game.gamePlayer = game.gamePlayerTypeEnum.HUMAN;
	
	game.resetBoard();
}

Game.prototype.setGeneticPlayer = function() {
	game.gamePlayer = game.gamePlayerTypeEnum.GENETIC;
	
	game.geneticPlayer = new Genetic(game.board.size);
}


// The main game object instance
var game = new Game();

/*******************************************/

// The main animation loop
function animate() {	
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
	this.selectedQueen = null;

	// Displays debugging information on the screen
	this.debug = false;	
}

GameControls.prototype.selectQueen = function() {
	var currentSquare = game.getPhysicalSquare(gameControls.mouse.left, gameControls.mouse.top);
	
	if(currentSquare.col != -1 && game.isHumanPlayer()) 
		if(game.board.boardGrid[currentSquare.col][currentSquare.row] != game.board.gameBoardEnum.EMPTY_SPACE ) 
			this.selectedQueen = currentSquare;
	else
		this.selectedQueen = null;
	
}

GameControls.prototype.moveQueen = function() {
	; // don't need to do anything
}

GameControls.prototype.placeQueen = function() {
	var currentSquare = game.getPhysicalSquare(gameControls.mouse.left, gameControls.mouse.top);
	
	// Make sure we are on the game board, a queen has been selected and it is not being placed where another queen is
	if(currentSquare.col != -1 && this.selectedQueen != null && game.board.boardGrid[currentSquare.col][currentSquare.row] == game.board.gameBoardEnum.EMPTY_SPACE) {
		var currentQueenID = game.board.boardGrid[this.selectedQueen.col][this.selectedQueen.row];
		game.board.boardGrid[this.selectedQueen.col][this.selectedQueen.row] = game.board.gameBoardEnum.EMPTY_SPACE
		game.board.boardGrid[currentSquare.col][currentSquare.row] = currentQueenID
		game.board.queenList[currentQueenID].position = currentSquare;
		
		game.board.setQueenAttackCounts();
		
		this.selectedQueen = null;
	}
	else
		this.selectedQueen = null;
	
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
	
	onclickHumanPlayer();
	
	var canvas = document.getElementById("searchCanvas");
	
	// Hide scroll bars
	document.body.style.overflow = "hidden";
	
	onclickSize();
	
	game.updateBoardSize();
	
	game.resetBoard();

	animate();  
	
	// Listen for keyboard down events
    canvas.addEventListener('keydown', function(e) {
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
	    	
	    	gameControls.selectQueen();
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
			
			gameControls.moveQueen();
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
    	
    	gameControls.placeQueen();
    	
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
				
		gameControls.selectQueen();
		
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
			gameControls.moveQueen();
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
 	
    	gameControls.placeQueen();
    	
    }, false); 
}

/*******************************************/

// Called when a user clicks on the player type selection buttons
function onclickHumanPlayer(element) {
	document.getElementById("humanPlayer").checked = true;
	document.getElementById("geneticPlayer").checked = false;
	
	document.getElementById("instructions").style.display = 'block';
	
	game.setHumanPlayer();
}

function onclickGeneticPlayer(element) {
	document.getElementById("humanPlayer").checked = false;
	document.getElementById("geneticPlayer").checked = true;
	
	document.getElementById("instructions").style.display = 'none';
	
	game.setGeneticPlayer();
}

function onclickSize(element) {
	document.getElementById("sizeLabel").innerText = "Size (" + document.getElementById("size").value + ")";
	
	game.updateBoardSize();
}
