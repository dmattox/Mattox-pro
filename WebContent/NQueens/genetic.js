/**
 * 
 */

"use strict";

/*******************************************/

const MUTATION_RATE = 0.4;

const NUMBER_OF_CANDIDATES = 10;
// This is the worst possible score one can get
const WORST_SCORE = 56;

function Genetic(size) {
	this.candidateBoards = [];
	this.size = size;
	this.generation = 0;
	
	for(var i = 0; i < NUMBER_OF_CANDIDATES; i++) {
		this.candidateBoards.push(this.generateRandomBoard(size));
	}
	
	this.sortBoards();
} 

Genetic.prototype.queenPositionsToString = function (index) {
	var theString = "";
	
	for(var i = 0; i < this.size; i++) {
		if(i > 0)
			theString += ","
		theString += this.candidateBoards[index].board[i].position.row;
	}
		
	return theString;
}

// Creates a new generation of boards by producing children from the parent boards
Genetic.prototype.createNewGeneration = function() {
	var newCandidateBoards = [];
	
	for(var i = 0; i < NUMBER_OF_CANDIDATES; i++) {
		var parents = this.selectParents();
		// Always creating two children from two parents
		var child = this.produceChildBoard(parents.a, parents.b, this.size);
		newCandidateBoards.push( {'board': child, 'totalAttacks': this.score(child)});
	}
	
	// keep the best scoring board
	newCandidateBoards[NUMBER_OF_CANDIDATES - 1] = this.candidateBoards[0];
	
	this.candidateBoards = newCandidateBoards;
	this.sortBoards();
	
	this.generation++;
	
	return this.getBestBoard().board;
}

Genetic.prototype.selectParents = function() {
	var parentA, parentB;
	
	var weightedSelection = Math.random();
	var sumWeight = 0.0;
	
	for(var i = 0; i < NUMBER_OF_CANDIDATES; i++){
		sumWeight += (WORST_SCORE - this.candidateBoards[i].totalAttacks) / this.sumAttacks();
		if(weightedSelection < sumWeight) {
			parentA = this.candidateBoards[i];
			break
		}			
	}

	var weightedSelection = Math.random();
	var sumWeight = 0.0;

	for(var i = 0; i < NUMBER_OF_CANDIDATES; i++){
		sumWeight += (WORST_SCORE - this.candidateBoards[i].totalAttacks) / this.sumAttacks();
		if(weightedSelection < sumWeight) {
			parentB = this.candidateBoards[i];
			break
		}			
	}
	
	// check to see if they are the same parent
	if(parentA == parentB) {
		// Picking the first or second highest if there was the same parent
		if(parentA == this.candidateBoards[0])
			parentB = this.candidateBoards[1];
		else
			parentB = this.candidateBoards[0]
	}
	
	return {"a": parentA.board, "b": parentB.board};
}

Genetic.prototype.sumAttacks = function() {
	var sum = 0;
	
	for(var i = 0; i < NUMBER_OF_CANDIDATES; i++)
		sum += WORST_SCORE - this.candidateBoards[i].totalAttacks;
	
	return sum;
}

// Sorts the boards so they will be in attackCount order
Genetic.prototype.sortBoards = function() {
	// Lowest attackCount will be at 0 index
	this.candidateBoards.sort(function(a, b) { return a.totalAttacks - b.totalAttacks; });
}

// Returns the highest scored board
Genetic.prototype.getBestBoard = function() {
	// Assumes list has been sorted
	return this.candidateBoards[0];
}

// Generates a random board of a given size
Genetic.prototype.generateRandomBoard = function(size) {
	var queenList = [];
	// We know we have to have a queen on a different column, so always going to just increment that
	for(var i = 0; i < size; i++)
		queenList.push({'position': new Point(i, Math.floor(Math.random() * size)), 'attackCount': 0});	
	
	return { 'board': queenList, 'totalAttacks': this.score(queenList) };
}

//
Genetic.prototype.produceChildBoard = function(parentA, parentB, size) {
	var child = [];
	
	var splicePoint = Math.floor(Math.random() * size);
	
	child = parentA.slice(0, splicePoint);
	child = child.concat(parentB.slice(splicePoint, size));
	
	// Throw in some mutations to help address local maximuma
	this.randomMutation(child, size);
	
	return child;	
}

// Randomly moves a queen to a random row in the board
Genetic.prototype.randomMutation = function(queenList, size) {
	// Only mutate if we hit 
	if(Math.random() < MUTATION_RATE) {
		var randomCol = Math.floor(Math.random() * size);
		var randomRow = Math.floor(Math.random() * size);
		queenList[randomCol] = {'position': new Point(randomCol, randomRow), 'attackCount': 0};
	}
}

Genetic.prototype.score = function(queenList) {
	return game.board.getQueenAttackCounts(queenList);
}