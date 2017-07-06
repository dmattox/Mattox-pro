/**
 * 
 */

"use strict";

// Use var instead of const to prevent name pollution

// Used to specify there is no valid move
var LOSING_MOVE = [-1, -1];
// Amount to show the current node is a loosing node
var LOSING_AMOUNT = -5000;
// Amount to show the current node is a winning node
var WINNING_AMOUNT = -LOSING_AMOUNT;

// Minimum value used for comparisons
var MIN_VALUE = Number.MIN_SAFE_INTEGER;
// Maximum value used for comparisons
var MAX_VALUE = Number.MAX_SAFE_INTEGER;

// Minimum search time allowed to continue looking for solutions. In milliseconds
var MIN_SEARCH_TIME = 50;
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
	
	this.continueProcessing = true;
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

AIMove.prototype.move = function(ID, turnStartTime, board, playerQueen, opposingQueen) {
	// If the queen hasn't been placed, put it on the board
	if(playerQueen.col == -1) {
		return this.placeQueens(board, playerQueen)
	}
	
	this.stoppedBeforeMaxDepth = true;
	
	this.currentMaxSearchDepth = MIN_SEARCH_DEPTH;
	
	this.bestMove = new Move(new Point(-1,-1), -1, -1);
	
	while(timeLeft(turnStartTime) > MIN_SEARCH_TIME && this.stoppedBeforeMaxDepth && this.continueProcessing) {
		this.outOfTime = false;
		this.stoppedBeforeMaxDepth = false;
		
		var currentMove = this.alphaBeta(turnStartTime, board, 0, playerQueen, opposingQueen);
		
		// Only keep a completed iteration
		if(this.outOfTime == false) {
			self.postMessage({'cmd' : 'bestMove', 'ID': ID, 'move': currentMove, 'searchDepth': this.currentMaxSearchDepth});
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
	var playerQueenScore = getAvailableMoves(playerQueen, board).size;
	var opposingQueenScore = getAvailableMoves(opposingQueen, board).size
	
	return playerQueenScore - opposingQueenScore;
}

AIMove.prototype.checkGameEnd = function(moveList, opposingMoveList) {

}

// Recursively alternate between Max and Min levels of the "tree" to determine the optimal move
AIMove.prototype.alphaBeta = function(turnStartTime, board, depth, playerQueen, opposingQueen, alpha = MIN_VALUE, beta = MAX_VALUE) {
	return this.alphaBetaMax(turnStartTime, board, depth, playerQueen, opposingQueen, alpha, beta);
}

AIMove.prototype.alphaBetaMax = function(turnStartTime, board, depth, playerQueen, opposingQueen, alpha, beta) {
	// Check for end game
	var ourMoveList = getAvailableMoves(playerQueen, board);
	var opposingMoveList = getAvailableMoves(opposingQueen, board);
	
	// Did we lose?
	if(ourMoveList.size == 0)
		return new Move([-1, -1], null, LOSING_AMOUNT);

	// Did we win?
	if(opposingMoveList.size == 0)
		return new Move([-1, -1], null, WINNING_AMOUNT);	
	
	// If we are running out of time
	if(timeLeft(turnStartTime) < MIN_SEARCH_TIME || this.continueProcessing == false) {
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
	var bestMove = new Move(new Point(-1,-1), -1, MIN_VALUE);
	var returnedMove;
		
	for(let move of ourMoveList) {
		var forecastedBoard = copyBoardGrid(board);
		
		// We don't really care which queen is moved into that space
		forecastedBoard.boardGrid[move.col][move.row] = board.gameBoardEnum.USED_SPACE;	
		//forecastedBoard.boardGrid[playerQueen.col][playerQueen.row] = board.gameBoardEnum.USED_SPACE;
				
		returnedMove = this.alphaBetaMin(turnStartTime, forecastedBoard, depth + 1, move, opposingQueen, alpha, beta);	
		
		// If this was the best move keep track of it
		if(returnedMove.utility > bestMove.utility) {
			// The callee didn't actually know what the move was so we need to populate it
			bestMove.moveLocation = move;
			bestMove.queen = playerQueen;
			bestMove.utility = returnedMove.utility;
		}
		
		// Update alpha
		if(bestMove.utility > alpha)
			alpha = bestMove.utility;
		
		// Beta pruning
		if(beta <= alpha)
			return bestMove;
	}
	
	return bestMove;
} 

AIMove.prototype.alphaBetaMin = function(turnStartTime, board, depth, playerQueen, opposingQueen, alpha, beta) {
	// Check for end game
	var ourMoveList = getAvailableMoves(playerQueen, board);
	var opposingMoveList = getAvailableMoves(opposingQueen, board);
	
	// Did we lose?
	if(ourMoveList.size == 0)
		return new Move([-1, -1], null, LOSING_AMOUNT);

	// Did we win?
	if(opposingMoveList.size == 0)
		return new Move([-1, -1], null, WINNING_AMOUNT);	
	
	// If we are running out of time
	if(timeLeft(turnStartTime) < MIN_SEARCH_TIME || this.continueProcessing == false) {
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
	var bestMove = new Move(new Point(-1,-1), -1, MAX_VALUE);
	
	for(let move of opposingMoveList) {
		var forecastedBoard = copyBoardGrid(board);
		
		// We don't really care which queen is moved into that space
		forecastedBoard.boardGrid[move.col][move.row] = board.gameBoardEnum.USED_SPACE;	
		//forecastedBoard.boardGrid[opposingQueen.col][opposingQueen.row] = board.gameBoardEnum.USED_SPACE;
		
		var returnedMove = this.alphaBetaMax(turnStartTime, forecastedBoard, depth + 1, playerQueen, move, alpha, beta);
		
		// If this was the best move keep track of it. This is the opposing player so we are looking for the min value
		if(returnedMove.utility < bestMove.utility) {
			// The callee didn't actually know what the move was so we need to populate it
			bestMove.moveLocation = move;
			bestMove.queen = playerQueen;
			bestMove.utility = returnedMove.utility;
		}
		
		// Update beta
		if(bestMove.utility < beta)
			beta = bestMove.utility;
		
		// Alpha pruning
		if(beta <= alpha)
			return bestMove;
	}
	
	return bestMove;
} 

function Move(moveLocation, queen, utility, depth = 0) {
	this.moveLocation = moveLocation;
	this.queen = queen;
	this.utility = utility;
	this.depth = depth;
	this.fade = 1;
}