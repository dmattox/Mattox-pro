/**
 * 
 */

"use strict";

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
