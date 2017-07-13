/**
 * 
 */

"use strict";

/*******************************************/

// Board is always a square of equal sides
function Board(size = 8) {
	this.gameBoardEnum = {
			EMPTY_SPACE : -1
	};	
	
	this.size = size;
	
	this.totalAttacks = 0;
	
	this.queenList = [];
	
	this.initilizeBoard();
} 

// Initializes the board
Board.prototype.initilizeBoard = function() {
	
	this.boardGrid = [];
	this.queenList = [];
	
	for(var col = 0; col < this.size; col++) {
		this.boardGrid[col] = [];
		for(var row = 0; row < this.size; row++) {
			this.boardGrid[col][row] = this.gameBoardEnum.EMPTY_SPACE;
		}
		// Put a queen on the top row of each column
		this.boardGrid[col][0] = col;
		this.queenList.push({'position': new Point(col, 0), 'attackCount': 0});
	}
	
	this.setQueenAttackCounts();
}

Board.prototype.replaceQueenList = function(queenList) {
	// clear the old board
	this.boardGrid = [];
	
	for(var col = 0; col < this.size; col++) {
		this.boardGrid[col] = [];
		for(var row = 0; row < this.size; row++) {
			this.boardGrid[col][row] = this.gameBoardEnum.EMPTY_SPACE;
		}
	}
	
	this.queenList = queenList;
	
	// Update the new queen locations
	for(var i = 0; i < this.size; i++)
		this.boardGrid[this.queenList[i].position.col][this.queenList[i].position.row] = i;
		
	this.setQueenAttackCounts();
}

Board.prototype.setQueenAttackCounts = function() {
	this.totalAttacks = this.getQueenAttackCounts(this.queenList);
}

Board.prototype.getQueenAttackCounts = function(queenList) {
	var totalAttacks = 0
	// Loop through the list of queens
	for(var attackingQueen = 0; attackingQueen < queenList.length; attackingQueen++) {
		// Reset the counter
		queenList[attackingQueen].attackCount = 0;
		
		for(var defendingQueen = 0; defendingQueen < queenList.length; defendingQueen++)  
			// We can't attack ourselves
			if(attackingQueen != defendingQueen)
				// Are we attacking the other queen
				if(this.isAttacking(queenList[attackingQueen].position, queenList[defendingQueen].position)) { 
					queenList[attackingQueen].attackCount++;
					totalAttacks++;
				}
	}
	
	return totalAttacks;
}

Board.prototype.isAttacking = function(sourceQueen, destQueen) {
	// Check to see if they are on the same horizontal line
	if(sourceQueen.row == destQueen.row)
		return true;
	// vertical line
	else if (sourceQueen.col == destQueen.col)
		return true;

	// Is on the same -1 or 1 slopping line
	if(sourceQueen.col < destQueen.col)  
	    return this.isOnSameLine(sourceQueen, destQueen);
	else
		return this.isOnSameLine(destQueen, sourceQueen);
}

// Checked to see if two points are on the same -1 or 1 slopped line
// Avoiding division since it is expensive
Board.prototype.isOnSameLine = function(smaller, larger) {
	var difference = (larger.col - smaller.col);	
	var newPointPos = new Point(larger.col - difference, larger.row - difference);
	var newPointNeg = new Point(larger.col - difference, larger.row + difference);
	
	// We know that if we mapped back to the same point we are on the same line, but have to handle -1 and 1 slopes.
	if(newPointPos.col == smaller.col && newPointPos.row == smaller.row)
		return true;
	if(newPointNeg.col == smaller.col && newPointNeg.row == smaller.row)
		return true;
	
	return false;
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