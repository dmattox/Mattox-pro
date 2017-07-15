var express      = require('express');
var bodyParser   = require('body-parser');
var cors 	     = require('cors');
var fs 		     = require('fs');
var util          = require('util');
var Worker       = require('webworker-threads').Worker; 
	
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
function hashcode(theString) {
	var hash = 0, i, chr;
	if (theString.length === 0) return hash;
	for (i = 0; i < theString.length; i++) {
		chr   = theString.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

/*var worker = new Worker(function() {
	
	this.onmessage = function(event) {
		 var data = event.data;
		 console.log('WORKER STARTED');
	     console.log(data.board + " currentPlayer:" + data.currentPlayer.col + ", " + data.currentPlayer.row 
	    		  + " opposingPlayer:" + data.opposingPlayer.col + ", " + data.opposingPlayer.row + " timeleft:" + data.turnStartTime);
	     
	     this.importScripts('ai_move');
	     
	     console.log('importedScripts');
	     console.log('AIMove - ' + AIMove);
	     
	     var aiMove = new AIMove(); 
	     //var bestMove = aiMove.move(data.turnStartTime, data.board, data.currentPlayer, data.opposingPlayer);
	     var bestMove = [];
	     
	     console.log('WORKER FINISHED'); 
	     //console.log(bestMove);
	     
	     postMessage({'cmd' : 'newMove', 'move': bestMove});
	      
	     self.close();
	}
	
});*/

app.post('/solve', function (req, res) {
	console.log("================ New Request ================")
	console.log(req.body.cmd);
	console.log(req.body.turnStartTime);
	console.log(req.body.board);
	console.log(req.body.currentPlayer);
	console.log(req.body.opposingPlayer);
	
	var currentBoard = JSON.parse(req.body.board);
	var currentPlayer = JSON.parse(req.body.currentPlayer);
	var opposingPlayer = JSON.parse(req.body.opposingPlayer);
	
	console.log("Hashcode:" + hashcode(req.body.board + req.body.currentPlayer + req.body.opposingPlayer));
	//console.log(req.body);
	console.log("Board Size:" + currentBoard.columns + ", " + currentBoard.rows);
	console.log("Current Player:" + currentPlayer.col + ", " + currentPlayer.row);
	console.log("Opposing Player:" + opposingPlayer.col + ", " + opposingPlayer.row);
	
/*	console.log("Starting web worker");
	
	worker.postMessage({'cmd': 'move', 'turnStartTime': Date.now(), 'board': currentBoard, 
		'currentPlayer': currentPlayer, 'opposingPlayer': opposingPlayer});*/

    var aiMove = new AIMove(); 
    var bestMove = aiMove.move(Date.now(), currentBoard, currentPlayer, opposingPlayer);
	
    console.log("Sending Response:" + JSON.stringify(bestMove));
    res.status(200).end(JSON.stringify(bestMove));
	
/*	setTimeout(function() { 
		; // do nothing
	}, 5000);*/
})


/*worker.onmessage = function(event) {
	console.log("Main thread - Received message from worker");
	console.log(event.data);
	worker.terminate();
	
    console.log("Sending Response:" + JSON.stringify(event.data.bestMove));
    res.status(200).end(JSON.stringify(bestMove));
}*/

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})


/**
 * 
 */

"use strict";

// Use var instead of const to prevent name pollution

// Used to specify there is no valid move
var LOOSING_MOVE = [-1, -1];
// Amount to show the current node is a loosing node
var LOOSING_AMOUNT = -5000;
// Amount to show the current node is a winning node
var WINNING_AMOUNT = -LOOSING_AMOUNT;

// Minimum value used for comparisons
var MIN_VALUE = Number.MIN_SAFE_INTEGER;
// Maximum value used for comparisons
var MAX_VALUE = Number.MAX_SAFE_INTEGER;

// Minimum search time allowed to continue looking for solutions. In milliseconds
var MIN_SEARCH_TIME = 500;
// Minimum search depth which will be performed for iterative deepening
var MIN_SEARCH_DEPTH = 3;
// The interval which will be used to increase the search depth for iterative deepening
var SEARCH_DEPTH_FACTOR = 1;

/*******************************************/

var board = [];

/*******************************************/

function AIMove(searchDepth = 3){
	this.searchDepth = searchDepth;
	
	this.outOfTime = false;
	
	// Indicator that we stopped because we did iterative deepening 
	this.stoppedBeforeMaxDepth = true;
	
	this.currentMaxSearchDepth = MIN_SEARCH_DEPTH;
}

AIMove.prototype.placeQueens = function(board, queen) {
	// Try to place near the center of the board
	for(var col = Math.floor(board.boardGrid.length / 2); col < board.boardGrid.length; col++)
		for(var row = Math.floor(board.boardGrid[0].length / 2); row < board.boardGrid[0].length; row++) 
			if(board.boardGrid[col][row] == board.gameBoardEnum.EMPTY_SPACE) {
				return new Move(new Point(col, row), queen, 0);
			}

	// Should never get here as there should always be room on a quarter of the board to place a queen
	return new Move(new Point(-1,-1), queen, 0);
}

AIMove.prototype.move = function(turnStartTime, board, playerQueen, opposingQueen) {
	// If the queen hasn't been placed, put it on the board
	if(playerQueen.col == -1) {
		return this.placeQueens(board, playerQueen)
	}
	
	this.stoppedBeforeMaxDepth = true;
	
	this.currentMaxSearchDepth = MIN_SEARCH_DEPTH;
	
	this.bestMove = new Move(new Point(-1,-1), -1, -1);
	
	while(timeLeft(turnStartTime) > MIN_SEARCH_TIME && this.stoppedBeforeMaxDepth == true) {
		this.outOfTime = false;
		this.stoppedBeforeMaxDepth = false;
		
		var currentMove = this.alphaBeta(turnStartTime, board, 0, playerQueen, opposingQueen);
		
		// Only keep a completed iteration
		if(this.outOfTime == false) {
			this.currentMaxSearchDepth += SEARCH_DEPTH_FACTOR;
			this.bestMove = currentMove;
		}
		else
			; // discarding partially completed run
	}
	
	return this.bestMove;		
}

// Scoring evaluation function - used to quickly try to determine if the move is the best move
AIMove.prototype.score = function(board, playerQueen, opposingQueen) {
	// Simply count the number of moves for our player against the number of moves for the opposing player
	return getAvailableMoves(playerQueen, board).size - getAvailableMoves(opposingQueen, board).size; 
}

// Recursively alternate between Max and Min levels of the "tree" to determine the optimal move
AIMove.prototype.alphaBeta = function(turnStartTime, board, depth, playerQueen, opposingQueen, alpha = MIN_VALUE, beta = MAX_VALUE) {
	return this.alphaBetaMax(turnStartTime, board, depth, playerQueen, opposingQueen, alpha, beta);
}

AIMove.prototype.alphaBetaMax = function(turnStartTime, board, depth, playerQueen, opposingQueen, alpha, beta) {
	// If we are running out of time
	if(timeLeft(turnStartTime) < MIN_SEARCH_TIME) {
		this.outOfTime = true;
		return new Move(null, null, 0);
	}
	
	// Perform iterative deepening
	if(depth == this.currentMaxSearchDepth) {
		this.stoppedBeforeMaxDepth = true;
		// Just get the score of the current board and return it. The caller will add the move information
		return new Move([-1, -1], null, this.score(board, playerQueen, opposingQueen));
	}
	
	// Get the list of available moves and recurse through them to find the optimal move
	var bestVal = MIN_VALUE
	var bestMove = new Move(new Point(-1,-1), -1, -1);
	var moveList = getAvailableMoves(playerQueen, board);
	var returnedMove;
		
	for(let move of moveList) {
		var forecastedBoard = copyBoardGrid(board);
		
		// We don't really care which queen is moved into that space
		forecastedBoard.boardGrid[move.col][move.row] = board.gameBoardEnum.USED_SPACE;	
		forecastedBoard.boardGrid[playerQueen.col][playerQueen.row] = board.gameBoardEnum.USED_SPACE;
				
		returnedMove = this.alphaBetaMin(turnStartTime, forecastedBoard, depth + 1, move, opposingQueen, alpha, beta);	
		
		// If this was the best move keep track of it
		if(returnedMove.utility > bestVal) {
			// The callee didn't actually know what the move was so we need to populate it
			bestMove.moveLocation = move;
			bestMove.queen = playerQueen;
			bestMove.utility = returnedMove.utility;
			bestVal = returnedMove.utility;
		}
		
		// Beta pruning
		if(bestVal >= beta)
			return bestMove;
		
		// Update alpha
		if(bestVal > alpha)
			alpha = bestVal;
	}
	
	return bestMove;
} 

AIMove.prototype.alphaBetaMin = function(turnStartTime, board, depth, playerQueen, opposingQueen, alpha, beta) {
	// If we are running out of time
	if(timeLeft(turnStartTime) < MIN_SEARCH_TIME) {
		this.outOfTime = true;
		return new Move(null, null, 0);
	}
	
	// Perform iterative deepening
	if(depth == this.currentMaxSearchDepth) {
		this.stoppedBeforeMaxDepth = true;
		// Just get the score of the current board and return it. The caller will add the move information
		return new Move(new Point(-1, -1), null, this.score(board, playerQueen, opposingQueen));
	}
	
	// Get the list of available moves and recurse through them to find the optimal move
	var bestVal = MAX_VALUE
	var bestMove = new Move(new Point(-1,-1), -1, -1);
	var moveList = getAvailableMoves(opposingQueen, board);
	for(let move of moveList) {
		var forecastedBoard = copyBoardGrid(board);
		
		// We don't really care which queen is moved into that space
		forecastedBoard.boardGrid[move.col][move.row] = board.gameBoardEnum.USED_SPACE;	
		forecastedBoard.boardGrid[playerQueen.col][playerQueen.row] = board.gameBoardEnum.USED_SPACE;
		
		var returnedMove = this.alphaBetaMax(turnStartTime, forecastedBoard, depth + 1, playerQueen, move, alpha, beta);
		
		// If this was the best move keep track of it. This is the opposing player so we are looking for the min value
		if(returnedMove.utility < bestVal) {
			// The callee didn't actually know what the move was so we need to populate it
			bestMove.moveLocation = move;
			bestMove.queen = playerQueen;
			bestMove.utility = returnedMove.utility;
			bestVal = returnedMove.utility;
		}
		
		// Alpha pruning
		if(bestVal <= alpha)
			return bestMove;
		
		// Update alpha
		if(bestVal < beta)
			beta = bestVal;
	}
	
	return bestMove;
} 

function Move(moveLocation, queen, utility) {
	this.moveLocation = moveLocation;
	this.queen = queen;
	this.utility = utility;
}

/*******************************************/

function Board(columns = 6, rows = 6) {
	this.columns = columns;
	this.rows = rows;
	this.boardGrid = [];
	
	this.gameBoardEnum = {
			EMPTY_SPACE : 0,
			PLAYER_1_QUEEN : "X",
			PLAYER_2_QUEEN : "O",
			USED_SPACE : 3
		};
} 

////// These functions should be members of the board, but need to let the web work have access to them
//Copies the board for use with recursion
function copyBoardGrid (boardGrid) {
	return JSON.parse(JSON.stringify(boardGrid));
}

//Returns -1, -1 if the move would go off the gameboard
function moveDirection(board, position, direction) {
	var col = position.col + direction[0];
	var row = position.row + direction[1];
	
	if(col < 0 || col >= board.columns)
		return new Point(-1, -1);
	if(row < 0 || row >= board.rows) 
		return new Point(-1, -1);
	
	return new Point(col, row);
}

function checkDirection(position, availableMoves, direction, board){ 
	var newPos = moveDirection(board, position, direction);
		
	// Loop until we get out of bounds
	while(newPos.col != -1 && newPos.row != -1) {
		// check for an empty space
		if(board.boardGrid[newPos.col][newPos.row] == board.gameBoardEnum.EMPTY_SPACE)
			availableMoves.add(newPos);
		// We were blocked, so return
		else
			return availableMoves;
		
		var newPos = moveDirection(board, newPos, direction);
	}
	
	// Got to the edge of the board, so return what we have
	return availableMoves;
}

function getAvailableMoves(position, board) {
	var availableMoves = new Set();
	
	// if the queen has not been placed, then find all open squares on the board.
	if(position.col == -1) {
		for(var col = 0; col < board.columns; col++)
			for(var row = 0; row < board.rows; row++) {
				if(board.boardGrid[col][row] == board.gameBoardEnum.EMPTY_SPACE)		
					availableMoves.add(new Point(col,row));
			}
	
		return availableMoves;
	}
	
	// Build a set of vectors in each direction and then explore which moves they each allow. Build the list of available moves up.
	var directionSet = new Set([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]])
	for(let direction of directionSet) {
		checkDirection(position, availableMoves, direction, board);
	}
	
	return availableMoves;
}

Board.prototype.isValidMove = function(newPosition, currentQueenPosition, boardGrid = this.boardGrid) {
	var availableMoves = getAvailableMoves(currentQueenPosition, game.board);
	
	var validMove = false;
	
	// Look through all the available moves and see if one matches where we are trying to go
	availableMoves.forEach(function(move) { 
		if(move.col == newPosition.col && move.row == newPosition.row)
			validMove = true;
	});
	
	return validMove;
};

/*******************************************/

var MAX_SEARCH_TIME = 5000;

function Point(col, row) {
	this.col = col;
	this.row = row;
}

function timeLeft(turnStartTime) {
	var currentTime = Date.now() - turnStartTime;

	return MAX_SEARCH_TIME - currentTime;
}
