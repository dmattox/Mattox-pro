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
	ctx.textBaseline = "middle";
	ctx.font = scaleText();
	ctx.fillStyle = "red";
	ctx.textAlign = "left";
	ctx.fillText("Score: " + game.leftScore,scaleX(50),scaleY(25));
	ctx.textAlign = "right";
	ctx.fillText("Score: " + game.rightScore, scaleX(game.scoreRect.width() - 50), scaleY(25));
	ctx.textAlign = "center";
	
	if(game.isPlaying() || game.isMovingTransitionState()) {
		ctx.fillStyle = game.getCurrentQueen().getQueenColor();
		ctx.fillText(game.getCurrentQueen().getPlayerTitle() + "'s Turn", scaleX(game.scoreRect.width() / 2), scaleY(25));
	}
};

/*******************************************/

// Defines the game area and all related drawing activities
function GameRect(left, top, right, bottom) {
	GameObject.call(this, left, top, right, bottom)
}

GameRect.prototype = Object.create(GameObject.prototype);
GameRect.prototype.contructor = GameRect;

// Draws an individual game piece as text
GameRect.prototype.drawGamePiece = function(ctx, currentRect, gameText, color, size = 35) {
	ctx.strokeStyle = color;				
	ctx.fillStyle = color;
	
	ctx.font = scaleText(size);
	
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(gameText, scaleX(currentRect.left + currentRect.width()/2), scaleY(currentRect.top + game.scoreRect.height() + currentRect.height()/2));
	
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
	
	ctx.lineWidth = "10";
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

// Colors all valid moves for the current player
GameRect.prototype.drawAvailableMoves = function(ctx, position) {
	// Random player is so fast want to avoid a flicker
	if(!game.isCurrentPlayerRandom()) {
		var availableMoves = getAvailableMoves(position, game.board)
		
		for(let move of availableMoves) {
			this.shadeBox(ctx, game.getSquareRect(move.col, move.row), "lightgreen");
		}		
	}
}

// Draws the main game board along with the game pieces and colors squares which are no longer available
GameRect.prototype.drawGameBoard = function(ctx) {
	for(var col = 0; col < game.board.columns; col++) {
		for(var row = 0; row < game.board.rows; row++) {
					
			var currentRect = game.getSquareRect(col, row)
			
			switch(game.board.boardGrid[col][row]) {
			case game.board.gameBoardEnum.PLAYER_1_QUEEN:
				this.shadeBox(ctx, currentRect, "grey");
				
				this.drawGamePiece(ctx, currentRect, "X", "red");
				
				break;
			
			case game.board.gameBoardEnum.PLAYER_2_QUEEN:
				this.shadeBox(ctx, currentRect, "grey");;
				
				this.drawGamePiece(ctx, currentRect, "O", "Green");				
				
				break;
			
			case game.board.gameBoardEnum.USED_SPACE:
				this.shadeBox(ctx, currentRect, "grey");
				
				break;
			}

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

// Handles the transition animation when a piece loses
GameRect.prototype.animateEndState = function(ctx) {
	if(game.isEndState()) {
		
		var currentRect = game.getSquareRect(game.losingPlayer.getQueenLocation().col, game.losingPlayer.getQueenLocation().row);

		if(game.endingGameCounter <= 100) 
			ctx.globalAlpha = game.endingGameCounter / 100;
		else
			ctx.globalAlpha = 1.0;

		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		
		ctx.fillStyle = "red";
				
    	ctx.fillRect(scaleX(currentRect.left)+5, 
				       scaleY(currentRect.top + game.scoreRect.height())+5, 
				       scaleX(currentRect.width())-5, 
				       scaleY(currentRect.height())-5);

    	this.displayMainMessage(ctx, game.winningPlayer.getPlayerTitle() + " won!");
			
	}
}

GameRect.prototype.animateMovingTransition = function(ctx) {
	if(game.isMovingTransitionState()) {
		
		var newRect = game.getSquareRect(game.newQueen.getQueenLocation().col, game.newQueen.getQueenLocation().row);
	
		if(game.movingTransitionCounter <= 100) 
			ctx.globalAlpha = 1 - (game.movingTransitionCounter / 100);
		else
			ctx.globalAlpha = 1.0;
		
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		
		ctx.fillStyle = "white";
				
    	ctx.fillRect(scaleX(newRect.left)+5, 
				       scaleY(newRect.top + game.scoreRect.height())+5, 
				       scaleX(newRect.width())-5, 
				       scaleY(newRect.height())-5);
    	
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
    	
    	// Might be the first time the queen is on the board
    	if(game.oldQueenPosition != null) {
    		var oldRect = game.getSquareRect(game.oldQueenPosition.col, game.oldQueenPosition.row);

    		// Draw the game piece at the old location
    		var currentRect = game.getSquareRect(game.oldQueenPosition.col, game.oldQueenPosition.row);
    		
    		this.drawGamePiece(ctx, currentRect, game.newQueen.getQueenBoardIndicator(), game.newQueen.getQueenColor());
			
			ctx.fillStyle = "grey";
			
			ctx.globalAlpha = game.movingTransitionCounter / 100;
			
	    	ctx.fillRect(scaleX(oldRect.left)+5, 
				       scaleY(oldRect.top + game.scoreRect.height())+5, 
				       scaleX(oldRect.width())-5, 
				       scaleY(oldRect.height())-5);
			
	
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
	
    	}
    	
    	ctx.globalAlpha = 1.0;
	}
}

// Highlights the rectangle of the current queen
GameRect.prototype.highlightCurrentQueen = function(ctx){
	// Draw a red box around the current player's queen
	var queenLocation = game.playerList[game.currentPlayer].getQueenLocation();
	if(queenLocation.col != -1)
		this.highlightBox(ctx, queenLocation, "red");
}

// Highlights the square which the mouse is currently hovering over
GameRect.prototype.highlightMousedOverSquare = function(ctx){
	// Highlight the current box the mouse is over
	var currentMouseBox = game.getPhysicalSquare(gameControls.mouse.left, gameControls.mouse.top);
	// Check to make sure they are moused over
	if((game.isPlaying() || game.isMovingTransitionState()) && currentMouseBox.col != -1) {
		this.highlightBox(ctx, currentMouseBox, 'blue');
		
		var currentRect = game.getSquareRect(currentMouseBox.col, currentMouseBox.row);	
		
		// Draw the queen at the current moused over location if it is a valid move
		if(game.board.isValidMove(currentMouseBox, game.getCurrentQueen().getQueenLocation())) {
			if(game.isCurrentPlayerHuman())
				this.drawGamePiece(ctx, currentRect, game.getCurrentQueen().getQueenBoardIndicator(), game.getCurrentQueen().getQueenColor());
			else
				// If the current player isn't human, indicate the user cant do anything
				this.drawGamePiece(ctx, currentRect, "-", "grey");		
		}
	}
}

// Shows which square is currently thought to be the best move by the computer while calculating its turn
GameRect.prototype.drawAIBestMove = function(ctx) {
	ctx.stroke();
	ctx.closePath();
	
	// Highlight where the AI thinks is the best move
	if(game.bestMove.length > 0) {
		var move = game.bestMove[game.bestMove.length-1];
		
		this.highlightBox(ctx, move.moveLocation, "purple");
		var currentRect = game.getSquareRect(move.moveLocation.col, move.moveLocation.row);	
	
		// Show W or L for win or loss move
		if(move.utility == WINNING_AMOUNT)
			move.utility = "W";
		else if (move.utility == LOSING_AMOUNT)
			move.utility = "L";
	
		currentRect.top -= 25;
		this.drawGamePiece(ctx, currentRect, "Best Move", "purple", 2.5);
		currentRect.top += 50;
		this.drawGamePiece(ctx, currentRect, "D:" + move.depth + " U:" + move.utility, "purple", 2.5);
			
	}
} 

// Draws the count down timer for the computer player
GameRect.prototype.drawTimer = function(ctx) {
	ctx.strokeStyle = 'red';
	ctx.fillStyle = 'red';				
	
	ctx.font = scaleText();
	
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	
	var currentTime = parseFloat(timeLeft(game.turnStartTime) / 1000.0).toFixed(1);
		
	ctx.fillText("Turn time: " + currentTime, scaleX(game.gameRect.width() - 10), scaleY(game.gameRect.height() - 15 + game.scoreRect.height()));
	
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
}

//Game area overrides basic GameObject draw
GameRect.prototype.draw = function(ctx) {	
	ctx.beginPath();
	
	ctx.lineWidth = "5";
		
	if(game.isPlaying()) {
		// Draw which moves are available. 
		this.drawAvailableMoves(ctx, game.getCurrentQueen().getQueenLocation());			
	}
	
	this.drawGameBoard(ctx);
	
	this.highlightCurrentQueen(ctx);
	
	this.animateEndState(ctx);
	
	this.animateMovingTransition(ctx);
	
	this.highlightMousedOverSquare(ctx);

	this.drawAIBestMove(ctx);
	
	if(game.isPlaying() && !game.isCurrentPlayerHuman())
		this.drawTimer(ctx);
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
			ENDING_GAME : "Ending Game",
			MOVING_TRANSITION : "Moving Transition"
	};

	// List of the players. Currently only doing 2 players
	this.playerList = [];
	this.playerList[0] = new HumanPlayer("Player 1", new Point(-1, -1), this.board.gameBoardEnum.PLAYER_1_QUEEN, "red");
	this.playerList[1] = new LocalAIPlayer("Player 2", new Point(-1, -1), this.board.gameBoardEnum.PLAYER_2_QUEEN, "green");
	
	// Index of the current player
	this.currentPlayer = 0;

	this.gameRect = new GameRect(0, 75, 1000, 700);

	this.turnStartTime = new Date().getTime();

	this.gameState = this.gameStateEnum.DEMO;

	this.squareWidth = (this.gameRect.width() - 20) / this.board.columns;
	//game.squareWidth = 400 / game.columns;
	this.squareHeight = (this.gameRect.height() - 20) / this.board.rows;
	//game.squareHeight = 200 / game.rows;

	this.xScale = this.physicalRect.right / this.gameRect.right;
	this.yScale = this.physicalRect.bottom / this.gameRect.bottom;

	this.leftScore = 0;
	this.rightScore = 0;
	
	this.bestMove = [];
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

Game.prototype.moveQueen = function(currentMouseBox, queenLocation, boardGrid = this.board.boardGrid) {
	this.oldQueenPosition = null;
	
	// Check to see if there is a queen on the board
	if(queenLocation.col != -1) {	
		// If the location clicked is a invalid move
		if(!this.board.isValidMove(currentMouseBox, queenLocation)) {
			this.invalidMoveSelected();
			return;		
		}
		else {
			// Mark the current location as no longer available and then move the queen
			boardGrid[queenLocation.col][queenLocation.row] = this.board.gameBoardEnum.USED_SPACE;
			this.oldQueenPosition = new Point(queenLocation.col, queenLocation.row);
		}
			
	}	
	// No player queen on the board
	else
	{
		// Make sure the location they selected isn't in use
		if(boardGrid[currentMouseBox.col][currentMouseBox.row] != this.board.gameBoardEnum.EMPTY_SPACE) {
			this.invalidMoveSelected();
			return;					
		}
		else {
			; // nothing special required
		}			
	}

	queenLocation.col = currentMouseBox.col; queenLocation.row = currentMouseBox.row;
	
	this.gameState = this.gameStateEnum.MOVING_TRANSITION;
	this.movingTransitionCounter = 0;			
	this.newQueen = game.getCurrentQueen();
	
	// Update the state information
	boardGrid[currentMouseBox.col][currentMouseBox.row] = this.getCurrentQueen().getQueenBoardIndicator();
	this.getCurrentQueen().setQueenLocation(currentMouseBox);

	// Move to the next player
	this.currentPlayer = (this.currentPlayer + 1) % 2;
	
	this.turnStartTime = new Date().getTime();
	
	this.bestMove = [];
}

// Resets the game board
Game.prototype.resetBoard = function() {	
	this.board.boardGrid = [];
	for(var col = 0; col < this.board.columns; col++) {
		this.board.boardGrid[col] = [];
	
		for(var row = 0; row < this.board.rows; row++)
			this.board.boardGrid[col][row] = this.board.gameBoardEnum.EMPTY_SPACE;
	}
	
	this.playerList[0].setQueenLocation(new Point(-1, -1));
	this.playerList[1].setQueenLocation(new Point(-1, -1));
	this.currentPlayer = 0;
}

// Resets the score
Game.prototype.resetScore = function() {
	this.rightScore = 0;
	this.leftScore = 0;
}

// Starts a new game
Game.prototype.newGame = function() {
	this.resetBoard();
	this.resetScore();
	this.gameState = game.gameStateEnum.PLAYING;
	game.bestMove = [];
	if(this.playerList[0].worker != null)
		this.playerList[0].stopWorkerTask();
	if(this.playerList[1].worker != null)
		this.playerList[1].stopWorkerTask();
	//$.growl({ title: "", message: "Starting new game!"});
	this.playerLoop();
}

// Moves a human player
Game.prototype.moveHumanPlayer = function() {
	if(this.isCurrentPlayerHuman()) {
		var currentMouseBox = game.getPhysicalSquare(gameControls.mouse.left, gameControls.mouse.top);
		
		// Check to see if the user clicked outside the game area
		if(currentMouseBox.col == -1) {
			this.invalidMoveSelected();
	
			return false;		
		}
		this.moveQueen(currentMouseBox, this.getCurrentQueen().getQueenLocation());
			
		//this.playerLoop();
		
		return true;
	}
} 

// Processes a computer move after being provided by the AI
Game.prototype.processComputerMove = function(move) {
	// Check to see if we came up with a good move
	if(move.moveLocation != null && move.moveLocation.col != -1) {
		 //$.growl({ title: "", message: this.getCurrentQueen().getPlayerTitle() + " - Moving to " + move.moveLocation.col + " x " + move.moveLocation.row});
		 this.moveQueen(move.moveLocation, move.queen);
	}
	else
		 console.log("Invalid move!!!");
	
	//this.playerLoop();
}


// Checks to see if a player won. If so increments the score and resets the board. If not switches to the next player
Game.prototype.checkForWinner = function() {
	// Did the current player win?
	if(this.getOpposingQueen().getQueenLocation().col != -1 && getAvailableMoves(this.getOpposingQueen().getQueenLocation(), game.board).size == 0) {
		if(this.currentPlayer == 0)
			this.leftScore++;
		else
			this.rightScore++;			
		this.gameState = this.gameStateEnum.ENDING_GAME;
		this.losingPlayer = this.getOpposingQueen();
		this.winningPlayer = this.getCurrentQueen();
		this.endingGameCounter = 0;
		//$.growl({ title: "", message: this.getCurrentQueen().getPlayerTitle() + " won!"});
		return true;
	}	
	
	// Did the opposing player win?
	if(this.getCurrentQueen().getQueenLocation().col != -1 && getAvailableMoves(this.getCurrentQueen().getQueenLocation(), game.board).size == 0) {
		if(this.currentPlayer == 1)
			this.leftScore++;
		else
			this.rightScore++;			
		this.gameState = this.gameStateEnum.ENDING_GAME;
		this.losingPlayer = this.getCurrentQueen();
		this.winningPlayer = this.getOpposingQueen();
		this.endingGameCounter = 0;
		//$.growl({ title: "", message: this.getOpposingQueen().getPlayerTitle() + " won!"});
		return true;
	}		
	
	return false;
}

// Starts moving the other player
Game.prototype.playerLoop = function() {
	
	if(this.checkForWinner())
		return;
	
	this.getCurrentQueen().move(this.turnStartTime, this.board, this.getOpposingQueen().getQueenLocation());
}

// Recalculates scaling of the virtual to physical mapping for the initial screen and when the screen is resized 
Game.prototype.recalcScaling = function(width, height) {
	var canvas = document.getElementById("isolationCanvas");
	
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
	var canvas = document.getElementById("isolationCanvas");
	
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

	this.leftScore = 0;
	this.rightScore = 0;

};

// Returns if the game is currently in demo mode
Game.prototype.isDemo = function() {
	return this.gameState == this.gameStateEnum.DEMO;
};

// Returns if the game is currently in playing mode
Game.prototype.isPlaying = function() {
	return this.gameState == this.gameStateEnum.PLAYING;
};

// Returns if the game is currently during the end game transition
Game.prototype.isEndState = function() {
	return this.gameState == this.gameStateEnum.ENDING_GAME;
}

//Returns if the game is currently during the moving transition
Game.prototype.isMovingTransitionState = function() {
	return this.gameState == this.gameStateEnum.MOVING_TRANSITION;
} 

// Returns if the current player is human
Game.prototype.isCurrentPlayerHuman = function() {
	return this.getCurrentQueen().isPlayerHuman();
};

// Returns if the current player is random
Game.prototype.isCurrentPlayerRandom = function() {
	return this.getCurrentQueen().getPlayerType() == player.playerTypeEnum.RANDOM;
}

// Returns the queen object of the current player
Game.prototype.getCurrentQueen = function() {
	return this.playerList[this.currentPlayer];
}

// Stops any active workers for a reset of the board 
Game.prototype.stopWorkers = function() {
	if(game.playerList[0].worker != null)
		game.playerList[0].stopWorkerTask();
	
	if(game.playerList[1].worker != null)
		game.playerList[1].stopWorkerTask();
}

// Returns the queen object of the opposing player instead of the current player
Game.prototype.getOpposingQueen = function() {
	return this.playerList[(this.currentPlayer + 1) % 2];
}

// Handles updates to animation components
Game.prototype.animate = function() {
	
	// Note the actual drawing is handled as part of the GameRect.draw routine

	// Animate the moving transition
	if(game.isMovingTransitionState()) {
		game.movingTransitionCounter+=2;
		
		// When done resume moving
		if(game.movingTransitionCounter == 100) {
			game.gameState = game.gameStateEnum.PLAYING;
			
			game.playerLoop();
		}
	}		

	// Animate the end of game fade
	if(game.isEndState()) {
		game.endingGameCounter++;
		if(game.endingGameCounter == 125) {
			game.gameState = game.gameStateEnum.PLAYING;
			game.resetBoard();
			game.playerLoop();
		}
	}
}

// Called when a response from the server is not received for a server processed AI (not used yet)
Game.prototype.serverError = function() {
	$.growl({ title: "", message: "Unable to communicate with the server. Switching to local AI."});
	
	// Set the buttons correctly and get the LocalPlayer Object
	if(this.currentPlayer == 0)
		onclickPlayer1LocalAI();
	else
		onclickPlayer2LocalAI();
	
	// Reset the timer to be fair to the local AI
	this.turnStartTime = new Date().getTime();
	
	// OK, try this again
	this.switchPlayer();
}

// changes the board size based on the GUI sliders
Game.prototype.updateBoardSize = function() {
	var newColumns = document.getElementById("columns").value;
	var newRows = document.getElementById("rows").value;
	
	if(newColumns < 3 || newColumns > 10 || newRows < 3 || newColumns > 10)
		return;

	game.stopWorkers();
	
	game.board.columns = newColumns;
	game.board.rows = newRows;
	game.resetBoard();
	
	game.recalcScaling(game.physicalRect.width(), game.physicalRect.height());
	
	if(!game.isDemo())
		game.newGame();
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
var gameControls = Object.create(null);
gameControls.keyPressed = {};

gameControls.mouse = new Rect(-1,-1,-1,-1);
gameControls.mouse.mouseClick = false;

// Displays debugging information on the screen
gameControls.debug = false;

/*******************************************/

var screen = Object.create(null);

// The main screen update function
screen.updateScreen = function(ctx) {

	var canvas = document.getElementById("isolationCanvas");
	
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

	// Display start message
	if(game.isDemo()) {
		game.gameRect.displayMainMessage(ctx, "Click anywhere to begin");
		
	}

	// Debug information
	if(gameControls.debug){
		ctx.textAlign = "left";
		ctx.fillText("gameRect: " + game.gameRect.left + " " + game.gameRect.top + " " + game.gameRect.right + " " + game.gameRect.bottom, 50 ,250);
		ctx.fillText("gameState: " + game.gameState, 50 ,300);
		ctx.fillText("game.currentPlayer: " + game.currentPlayer, 50 ,350);
		ctx.fillText("Mouse Rect: " + gameControls.mouse.left + " " + gameControls.mouse.top + " " + gameControls.mouse.right + " " + gameControls.mouse.bottom , 50 ,400);
		ctx.fillText("Mouse click: " + gameControls.mouse.mouseClick, 50 ,450);
		var currentSquare = game.getPhysicalSquare(gameControls.mouse.left, gameControls.mouse.top);
		ctx.fillText("Col:" + currentSquare.col + " Row:" + currentSquare.row, 50, 500);
		ctx.fillText("XScale: " + game.xScale + " YScale:" + game.yScale, 50 ,550);
		ctx.fillText("physicalRect: " + game.physicalRect.left + " " + game.physicalRect.top + " " + game.physicalRect.right + " " + game.physicalRect.bottom, 50 ,600);
		ctx.fillText("Canvas: " + canvas.width + " " + canvas.height + " Canvas Offset Left:" + canvas.offsetLeft + " Canvas Offset Top:" + canvas.offsetTop , 50 ,650);
		ctx.fillText(game.board.boardGrid, 50 ,700);
	}
};

/*******************************************/

// Loaded on application start
function onLoad() {
	
	onclickPlayer1Human();
	onclickPlayer2LocalAI();
	document.getElementById("player2LocalAI").checked = true;
	
	var canvas = document.getElementById("isolationCanvas");
	
	// Hide scroll bars
	document.body.style.overflow = "hidden";
	
	game.updateBoardSize();
	
	game.resetBoard();

	animate();  
	
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

		// There can be multiple touches, loop through each of them.
		for(var i = 0; i < e.touches.length; i++) {
			var touch = e.changedTouches[i];
			; // for this game we don't care about these
		}
    }, false);
 	
    canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();
    	
		// There can be multiple touches, loop through each of them.
		for(var i = 0; i < e.touches.length; i++) {
			var touch = e.changedTouches[i];
			; // for this game we don't care about these
		}
	
    }, false);

    canvas.addEventListener('touchend', function(e) {
		e.preventDefault();

    	var canvas = document.getElementById("isolationCanvas").getBoundingClientRect();
			
		gameControls.mouse.left = e.changedTouches[0].pageX - canvas.left;
		gameControls.mouse.top = e.changedTouches[0].pageY - canvas.top;
    	gameControls.mouse.right = e.changedTouches[0].pageX - canvas.left;
    	gameControls.mouse.bottom = e.changedTouches[0].pageY - canvas.top;

    	if(game.isPlaying())
    		game.moveHumanPlayer();
    	else (game.isDemo())
    		game.newGame();
    	
    }, false);
    
 	// Listen for mouse events
    canvas.addEventListener('mousemove', function(e) {
    	e.preventDefault();

    	// Offset for the canvas location
    	var canvas = document.getElementById("isolationCanvas").getBoundingClientRect();
   	
    	// Store the mouse location
		gameControls.mouse.left = e.clientX - canvas.left;
		gameControls.mouse.top = e.clientY - canvas.top;
    	gameControls.mouse.right = e.clientX - canvas.left;
    	gameControls.mouse.bottom = e.clientY - canvas.top;
	
		// Only move when the mouse is clicked
		if(gameControls.mouse.mouseClick)
			; // TODO game.movePaddleXY(e.clientX, e.clientY);
				   	
    }, false);

    canvas.addEventListener('mousedown', function(e) {
    	// Offset for the canvas location
    	var canvas = document.getElementById("isolationCanvas").getBoundingClientRect();
    	  	
    	e.preventDefault();
    	
		gameControls.mouse.mouseClick = true;
		
    }, false);

    canvas.addEventListener('mouseup', function(e) {
    	e.preventDefault();

    	// Offset for the canvas location
    	var canvas = document.getElementById("isolationCanvas").getBoundingClientRect();
    	
    	gameControls.mouse.mouseClick = false;
    	
    	// Store the mouse location
    	gameControls.mouse.left = e.clientX - canvas.left;
    	gameControls.mouse.top = e.clientY - canvas.top;
    	gameControls.mouse.right = e.clientX - canvas.left;
    	gameControls.mouse.bottom = e.clientY - canvas.top;
 	
    	if(game.isPlaying())
    		game.moveHumanPlayer();
    	else if (game.isDemo()) 
    		game.newGame();
  
    }, false); 
}

/*******************************************/

// Called when a user clicks on the player type selection buttons
function onclickPlayer1Human() {
	document.getElementById("player1Human").checked = true;
	document.getElementById("player1LocalAI").checked = false;
	//document.getElementById("player1BasicAI").checked = false;
	document.getElementById("player1Random").checked = false;

	game.stopWorkers();
	
	game.playerList[0] = new HumanPlayer("Player 1", new Point(-1, -1), game.board.gameBoardEnum.PLAYER_1_QUEEN, "red");
	
	if(!game.isDemo())
		game.newGame();
}

//Called when a user clicks on the player type selection buttons
function onclickPlayer1LocalAI() {
	document.getElementById("player1Human").checked = false;
	document.getElementById("player1LocalAI").checked = true;
	//document.getElementById("player1BasicAI").checked = false;
	document.getElementById("player1Random").checked = false;

	game.stopWorkers();
	
	game.playerList[0] = new LocalAIPlayer("Player 1", new Point(-1, -1), game.board.gameBoardEnum.PLAYER_1_QUEEN, "red");
	if(!game.isDemo())
		game.newGame();
}

//Called when a user clicks on the player type selection buttons
function onclickPlayer1BasicAI() {
	document.getElementById("player1Human").checked = false;
	document.getElementById("player1LocalAI").checked = false;
	//document.getElementById("player1BasicAI").checked = true;
	document.getElementById("player1Random").checked = false;

	game.stopWorkers();
	
	game.playerList[0] = new CloudAIPlayer("Player 1", new Point(-1, -1), game.board.gameBoardEnum.PLAYER_1_QUEEN, "red");
	if(!game.isDemo())
		game.newGame();
}

//Called when a user clicks on the player type selection buttons
function onclickPlayer1Random() {
	document.getElementById("player1Human").checked = false;
	document.getElementById("player1LocalAI").checked = false;
	//document.getElementById("player1BasicAI").checked = true;
	document.getElementById("player1Random").checked = true;

	game.stopWorkers();
	
	game.playerList[0] = new RandomPlayer("Player 1", new Point(-1, -1), game.board.gameBoardEnum.PLAYER_1_QUEEN, "red");
	
	if(!game.isDemo())
		game.newGame();
}

/*******************************************/

//Called when a user clicks on the player type selection buttons
function onclickPlayer2Human() {
	document.getElementById("player2Human").checked = true;
	document.getElementById("player2LocalAI").checked = false;
	//document.getElementById("player2BasicAI").checked = false;
	document.getElementById("player2Random").checked = false;

	game.stopWorkers();
	
	game.playerList[1] = new HumanPlayer("Player 2", new Point(-1, -1), game.board.gameBoardEnum.PLAYER_2_QUEEN, "green");
	if(!game.isDemo())
		game.newGame();
}

//Called when a user clicks on the player type selection buttons
function onclickPlayer2LocalAI() {
	document.getElementById("player2Human").checked = false;
	document.getElementById("player2LocalAI").checked = true;
	//document.getElementById("player2BasicAI").checked = false;
	document.getElementById("player2Random").checked = false;

	game.stopWorkers();
	
	game.playerList[1] = new LocalAIPlayer("Player 2", new Point(-1, -1), game.board.gameBoardEnum.PLAYER_2_QUEEN, "green");
	if(!game.isDemo())
		game.newGame();
}

//Called when a user clicks on the player type selection buttons
function onclickPlayer2BasicAI() {
	document.getElementById("player2Human").checked = false;
	document.getElementById("player2LocalAI").checked = false;
	//document.getElementById("player2BasicAI").checked = true;
	document.getElementById("player2Random").checked = false;
	
	game.stopWorkers();
	
	game.playerList[1] = new CloudAIPlayer("Player 2", new Point(-1, -1), game.board.gameBoardEnum.PLAYER_2_QUEEN, "green");
	if(!game.isDemo())
		game.newGame();
}

//Called when a user clicks on the player type selection buttons
function onclickPlayer2Random() {
	document.getElementById("player2Human").checked = false;
	document.getElementById("player2LocalAI").checked = false;
	//document.getElementById("player2BasicAI").checked = true;
	document.getElementById("player2Random").checked = true;
	
	game.stopWorkers();
	
	game.playerList[1] = new RandomPlayer("Player 2", new Point(-1, -1), game.board.gameBoardEnum.PLAYER_2_QUEEN, "green");
	if(!game.isDemo())
		game.newGame();
}
