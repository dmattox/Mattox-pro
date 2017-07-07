/**
 * 
 */

"use strict";

/*******************************************/

function Board(columns = 6, rows = 6, blockDensity = 20) {
	this.columns = columns;
	this.rows = rows;
	this.blockDenisity = blockDensity;
	
	this.boardGrid = [];
	
	this.gameBoardEnum = {
			EMPTY_SPACE : 0,
			STARTING : "S",
			DESTINATION : "D",
			USED_SPACE : 3
		};
} 

// Initializes the board
// Weight specifies a common weight to be applied to all squares. If -1 a random weight will be assigned to each square.
Board.prototype.initilizeBoard = function(weight = -1) {
	
	var value = weight;
	
	this.boardGrid = [];
	for(var col = 0; col < this.columns; col++) {
		this.boardGrid[col] = [];
		for(var row = 0; row < this.rows; row++) {
			if(weight == -1)
				value = Math.floor(Math.random() * 10);
	
			this.boardGrid[col][row] = {'type': this.gameBoardEnum.EMPTY_SPACE, 'weight': value};
		}
	}
} 

// Returns the empty or start/dest neighbors of a given block
Board.prototype.getNeighbors = function(point, board = this) {
	var availableMoves = new Set();
	
	// Create a list of all the directions and if they move to a valid space add it to our list	
	var directionSet = new Set([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]])
	for(let direction of directionSet) {
		var move = this.moveDirection(board, point, direction)
		
		if(move.col != -1 && board.boardGrid[move.col][move.row].type != board.gameBoardEnum.USED_SPACE) {
			availableMoves.add(move);
		}
	}
	
	return availableMoves;	
}

// Produces starting and ending points. Randomly fills the board with blocked positions
Board.prototype.randomizeBoard = function() {
	
	this.randomBlocks();
	
	return this.randomStartEndPoints();
}

// Generates random blocks to fill the board
Board.prototype.randomBlocks = function() {
	var numberOfBlocks = this.columns * this.rows * this.blockDensity / 100;
	
	for(var i = 0; i < numberOfBlocks; i++) {		
		this.randomPoint(this.gameBoardEnum.USED_SPACE);
	}
}

// Generates starting and ending points
Board.prototype.randomStartEndPoints = function() {

	var start = this.randomPoint(this.gameBoardEnum.STARTING, 0, this.columns/3);	
	
	var destination = this.randomPoint(this.gameBoardEnum.DESTINATION, this.columns * 2/3, this.columns - 1);
	
	// Set start and end to 0's
	this.boardGrid[start.col][start.row].weight = 0;
	this.boardGrid[destination.col][destination.row].weight = 0;
	
	return {'start': start, 'destination': destination};
}

Board.prototype.randomPoint = function(type, startCol = 0, endCol = this.columns - 1) {
	var point = null;
	
	while(point == null) {
		var point = new Point(Math.floor((endCol - startCol) * Math.random() + startCol), Math.floor(this.rows * Math.random()));
		
		if(this.boardGrid[point.col][point.row].type == this.gameBoardEnum.EMPTY_SPACE) {
			this.boardGrid[point.col][point.row].type = type;
		}
		else
			point = null;
	}
	
	return point;
}

//Copies the board for use with recursion
Board.prototype.copyBoardGrid = function(boardGrid) {
	return JSON.parse(JSON.stringify(boardGrid));
}

//Returns -1, -1 if the move would go off the gameboard
Board.prototype.moveDirection = function(board, position, direction) {
	var col = position.col + direction[0];
	var row = position.row + direction[1];
	
	if(col < 0 || col >= board.columns)
		return new Point(-1, -1);
	if(row < 0 || row >= board.rows) 
		return new Point(-1, -1);
	
	return new Point(col, row);
}

Board.prototype.checkDirection = function(position, availableMoves, direction, board){ 
	var newPos = moveDirection(board, position, direction);
		
	// Loop until we get out of bounds
	while(newPos.col != -1 && newPos.row != -1) {
		// check for an empty space
		if(board.boardGrid[newPos.col][newPos.row].type == board.gameBoardEnum.EMPTY_SPACE)
			availableMoves.add(newPos);
		// We were blocked, so return
		else
			return availableMoves;
		
		var newPos = moveDirection(board, newPos, direction);
	}
	
	// Got to the edge of the board, so return what we have
	return availableMoves;
}