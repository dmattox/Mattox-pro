/**
 * 
 */

"use strict";

/*******************************************/

// Time to sleep in ms between each iteration loop
var SLEEP_TIME = 100;
var MAIN_THREAD_UPDATE_THROTTLE = 5;


function Search() {
	this.explored = [];
	this.frontier = new FastPriorityQueue();
	
	// We perform one iteration of the loop at a time to better show how the algorithms work.
	var searchComplete = false;
} 

var theBoard = new Board();


Search.prototype.isIn = function(elem, list) {
	for(let currentElem of list) {
		if(elem.col == currentElem.col && elem.row == currentElem.row)
			return true;
	}
	
	return false;
}

// Starts the search and does a single iteration
Search.prototype.performSearch = function(board, start, goal) {
	; // Abstract function
}

// Continues the search for the next iteration
Search.prototype.continueSearch = function() {
	; // Abstract function
}

Search.prototype.isSearchComplete = function() {
	return this.searchComplete;
} 

/*******************************************/

function BreadthFirstSearch() {
	Search.call(this);
}

BreadthFirstSearch.prototype = Object.create(Search.prototype);
BreadthFirstSearch.prototype.contructor = BreadthFirstSearch;

BreadthFirstSearch.prototype.performSearch = function(board, start, goal) {	
	this.searchCounter = 0;
	
	this.board = board;
	this.start = start;
	this.goal = goal;
	
	this.explored = [];
	this.frontier = new Array();
	
	// If the start and end are the same then return an empty list
	if(start == goal) {
		this.searchComplete = true;
		return {'completed': this.searchComplete, 'path': [], 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
	}
	
	this.frontier.unshift({'distance': 0, 'nodeID': start, 'path': []});
	
	return this.continueSearch();
}

BreadthFirstSearch.prototype.continueSearch = function() {	
	// Check to see if we couldn't find a path
	if(this.frontier.length == 0) {
		this.searchComplete = true;
		return {'completed': this.searchComplete, 'path': [], 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
	}
	
	this.searchCounter++;
	var current = this.frontier.pop();
	
	var path;
		
	// Did we find the goal?
	if(current.nodeID.col == this.goal.col && current.nodeID.row == this.goal.row) {
		path = current.path.slice(0);
		path.push(current.nodeID);
		//self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier});
		this.searchComplete = true;
		return {'completed': this.searchComplete, 'path': path, 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
	}
		
	// Lets get all the neighboring nodes and add them to the frontier if they haven't been explored
	for(let node of theBoard.getNeighbors(current.nodeID, this.board)) {		
		
		// Optimization
		if(node.col == this.goal.col && node.row == this.goal.row) {
			path = current.path.slice(0);
			path.push(current.nodeID);
			path.push(node);
			//self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier});
			this.searchComplete = true;
			return {'completed': this.searchComplete, 'path': path, 'distance': current.distance + this.board.boardGrid[node.col][node.row].weight, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
		}
		
		if(!(this.isIn(node, this.explored))) {
			this.explored.push(node);
			path = current.path.slice(0); 
			path.push(current.nodeID);
			this.frontier.unshift({'distance': current.distance + this.board.boardGrid[node.col][node.row].weight, 'nodeID': node, 'path': path})
		}			
	}	
	
	return {'completed': this.searchComplete, 'path': path, 'distance': current.distance, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
}

/*******************************************/

function DepthFirstSearch() {
	Search.call(this);
}

DepthFirstSearch.prototype = Object.create(Search.prototype);
DepthFirstSearch.prototype.contructor = BreadthFirstSearch;

DepthFirstSearch.prototype.performSearch = function(board, start, goal) {
	this.searchCounter = 0;
	
	this.board = board;
	this.start = start;
	this.goal = goal;
	
	this.explored = [];
	this.frontier = new Array();
	
	// If the start and end are the same then return an empty list
	if(start == goal) {
		this.searchComplete = true;
		return {'completed': this.searchComplete, 'path': [], 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
	}
	
	this.frontier.push({'distance': 0, 'nodeID': start, 'path': []});
	
	return this.continueSearch();
}

DepthFirstSearch.prototype.continueSearch = function() {
	// Check to see if we couldn't find a path
	if(this.frontier.length == 0) {
		this.searchComplete = true;
		return {'completed': this.searchComplete, 'path': [], 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
	}
	
	this.searchCounter++;
	var current = this.frontier.pop();
	
	var path;
		
	// Did we find the goal?
	if(current.nodeID.col == this.goal.col && current.nodeID.row == this.goal.row) {
		path = current.path.slice(0);
		path.push(current.nodeID);
		//self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier});
		this.searchComplete = true;
		return {'completed': this.searchComplete, 'path': path, 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
	}
		
	// Lets get all the neighboring nodes and add them to the frontier if they haven't been explored
	for(let node of theBoard.getNeighbors(current.nodeID, this.board)) {		
		
		// Optimization
		if(node.col == this.goal.col && node.row == this.goal.row) {
			path = current.path.slice(0);
			path.push(current.nodeID);
			path.push(node);
			//self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier});
			this.searchComplete = true;
			return {'completed': this.searchComplete, 'path': path, 'distance': current.distance + this.board.boardGrid[node.col][node.row].weight, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
		}
		
		if(!(this.isIn(node, this.explored))) {
			this.explored.push(node);
			path = current.path.slice(0); 
			path.push(current.nodeID);
			this.frontier.push({'distance': current.distance + this.board.boardGrid[node.col][node.row].weight, 'nodeID': node, 'path': path})
		}			
	}	
	
	return {'completed': this.searchComplete, 'path': path, 'distance': current.distance, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier};
}

/*******************************************/

function UniformCostSearch() {
	Search.call(this);
}

UniformCostSearch.prototype = Object.create(Search.prototype);
UniformCostSearch.prototype.contructor = UniformCostSearch;

UniformCostSearch.prototype.performSearch = function(board, start, goal) {
	this.searchCounter = 0;

	this.board = board;
	this.start = start;
	this.goal = goal;
	
	this.explored = [];
	this.frontier = new FastPriorityQueue(function(a,b) {return a.distance < b.distance});
	
	// If the start and end are the same then return an empty list
	if(start == goal) {
		this.searchComplete = true;
		// Accessing the array internal to the priority queue so need to have it cleaned up first
		frontier.trim();
		return {'completed': this.searchComplete, 'path': [], 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
	}
	
	this.frontier.add({'distance': 0, 'nodeID': start, 'path': []});	
	
	return this.continueSearch();
}

UniformCostSearch.prototype.continueSearch = function() {
	var current, path;
	
	// Check to see if we couldn't find a path
	if(this.frontier.size == 0) {
		this.searchComplete = true;
		// Accessing the array internal to the priority queue so need to have it cleaned up first
		this.frontier.trim();
		return {'completed': this.searchComplete, 'path': [], 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
	}
	
	this.searchCounter++;
	current = this.frontier.poll();
	
	if(current.nodeID.col == this.goal.col && current.nodeID.row == this.goal.row) {
		path = current.path.slice(0);
		path.push(current.nodeID);
		this.searchComplete = true;
		// Accessing the array internal to the priority queue so need to have it cleaned up first
		this.frontier.trim();
		return {'completed': this.searchComplete, 'path': path, 'distance': current.distance, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
	}
			
	// Lets get all the neighboring nodes and add them to the frontier if they haven't been explored
	for(let node of theBoard.getNeighbors(current.nodeID, this.board)) {		
		
		// Optimization
		if(node.col == this.goal.col && node.row == this.goal.row) {
			path = current.path.slice(0);
			path.push(current.nodeID);
			path.push(node);
			this.searchComplete = true;
			// Accessing the array internal to the priority queue so need to have it cleaned up first
			this.frontier.trim();
			return {'completed': this.searchComplete, 'path': path, 'distance': current.distance, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
		}
		
		if(!(this.isIn(node, this.explored))) {
			this.explored.push(node);
			path = current.path.slice(0); 
			path.push(current.nodeID);
			this.frontier.add({'distance': current.distance + this.board.boardGrid[node.col][node.row].weight, 'nodeID': node, 'path': path})
		}			
	}

	// Accessing the array internal to the priority queue so need to have it cleaned up first
	this.frontier.trim();
	return {'completed': this.searchComplete, 'path': path, 'distance': current.distance, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
}


/*******************************************/

function AStarSearch() {
	Search.call(this);
}

AStarSearch.prototype = Object.create(Search.prototype);
AStarSearch.prototype.contructor = AStarSearch;

AStarSearch.prototype.euclideanDistance = function(a, b) {
	//sqrt( (a1 - b1)^ 2 + (a2 - b2) ^ 2 )
	return Math.sqrt(Math.pow(a.col - b.col, 2) + Math.pow(a.row - b.row, 2));
}

AStarSearch.prototype.performSearch = function(board, start, goal) {
	this.searchCounter = 0;

	this.board = board;
	this.start = start;
	this.goal = goal;

	this.explored = [];
	this.frontier = new FastPriorityQueue(function(a,b) { return a.astar < b.astar });
	
	// If the start and end are the same then return an empty list
	if(start == goal) {
		this.searchComplete = true;
		// Accessing the array internal to the priority queue so need to have it cleaned up first
		frontier.trim();
		return {'completed': this.searchComplete, 'path': [], 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
	}
	
	this.frontier.add({'astar': 0, 'distance': 0, 'nodeID': start, 'path': []});
	
	return this.continueSearch();
}

AStarSearch.prototype.continueSearch = function() {
	var current, path;
	
	// Check to see if we couldn't find a path
	if(this.frontier.size == 0) {
		this.searchComplete = true;
		// Accessing the array internal to the priority queue so need to have it cleaned up first
		this.frontier.trim();
		return {'completed': this.searchComplete, 'path': [], 'distance': 0, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
	}

	this.searchCounter++;
	current = this.frontier.poll();

	if(current.nodeID.col == this.goal.col && current.nodeID.row == this.goal.row) {
		path = current.path.slice(0);
		path.push(current.nodeID);
		this.searchComplete = true;
		// Accessing the array internal to the priority queue so need to have it cleaned up first
		this.frontier.trim();
		return {'completed': this.searchComplete, 'path': path, 'distance': current.distance, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
	}
	
	// Lets get all the neighboring nodes and add them to the frontier if they haven't been explored
	for(let node of theBoard.getNeighbors(current.nodeID, this.board)) {				
		// Optimization
		if(node.col == this.goal.col && node.row == this.goal.row) {
			path = current.path.slice(0);
			path.push(current.nodeID);
			path.push(node);
			this.searchComplete = true;
			// Accessing the array internal to the priority queue so need to have it cleaned up first
			this.frontier.trim();
			return {'completed': this.searchComplete, 'path': path, 'distance': current.distance, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
		}
		
		if(!(this.isIn(node, this.explored))) {
			this.explored.push(node);
			path = current.path.slice(0); 
			path.push(current.nodeID);				
			var updatedDistance = current.distance + this.board.boardGrid[node.col][node.row].weight;
			this.frontier.add({'astar': updatedDistance + this.euclideanDistance(node, this.goal), 'distance': updatedDistance , 'nodeID': node, 'path': path})
		}			
	}
	
	// Accessing the array internal to the priority queue so need to have it cleaned up first
	this.frontier.trim();
	return {'completed': this.searchComplete, 'path': path, 'distance': current.distance, 'searchCounter': this.searchCounter, 'explored': this.explored, 'frontier': this.frontier.array};
}