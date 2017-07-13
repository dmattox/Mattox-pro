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
} 

var theBoard = null;

self.addEventListener('message', function(event) {
	  importScripts("../common_javascript/FastPriorityQueue.js");
	  importScripts("utility.js");
	  importScripts("board.js");
	  
	  theBoard = new Board();
	  
	  var data = event.data;
	  switch (data.cmd) {
	    case 'search':      	     
	      console.log('Worker Message Received - ID:' + data.ID + " type:" + data.type + " board: (" + data.board.columns + ", " + data.board.rows + ") start: (" + 
	    		  data.start.col + ", " + data.start.row + ") goal: (" + data.goal.col + ", " + data.goal.row + ")");
	    	     
	      var results = [];
	      // Restore to objects
	  	  var start = new Point(data.start.col, data.start.row);
		  var goal = new Point(data.goal.col, data.goal.row);
		  
		  var searchDelay = 0;

		  // If the user clicked for a slow search add a delay
		  if(data.slowSearch)
			  searchDelay = SLEEP_TIME;
	      
	      switch(data.type) {
	      case 'bfs':
	      		var search = new BreadthFirstSearch();
	      		results = search.performSearch(data.ID, searchDelay, data.board, start, goal);
	      		break;
	      case 'dfs':
	      		var search = new DepthFirstSearch();
	      		results = search.performSearch(data.ID, searchDelay, data.board, start, goal);
	      		break;	      			      		      
	      case 'ucs':
	      		var search = new UniformCostSearch();
	      		results = search.performSearch(data.ID, searchDelay, data.board, start, goal);
	      		break;	      			      		
	      case 'astar':
	      		var search = new AStarSearch();
	      		results = search.performSearch(data.ID, searchDelay, data.board, start, goal);
	      		break;	      	
	      default:
	      		console.log('Unknown type:' + data.type)
	      }
	      
	      self.postMessage({'cmd' : 'path', 'ID': data.ID, 'path': results.path, 'distance': results.distance, 'searchCounter': results.searchCounter});
	      	      
	      break;
	    case 'stop':
	      console.log('Worker Message Received - stop: ');
	      self.close(); // Terminates the worker.
	      break;
	    default:
	      console.log('Worker Message Received -  unknown command: ' + data.msg);
	  };
	}, false);

Search.prototype.isIn = function(elem, list) {
	for(let currentElem of list) {
		if(elem.col == currentElem.col && elem.row == currentElem.row)
			return true;
	}
	
	return false;
}

Search.prototype.performSearch = function(messageID, searchDelay, board, start, goal) {
	; // Abstract function
}

/*******************************************/

function BreadthFirstSearch() {
	Search.call(this);
}

BreadthFirstSearch.prototype = Object.create(Search.prototype);
BreadthFirstSearch.prototype.contructor = BreadthFirstSearch;

BreadthFirstSearch.prototype.performSearch = function(messageID, searchDelay, board, start, goal) {
	var searchCounter = 0;
	
	// If the start and end are the same then return an empty list
	if(start == goal)
		return {'path': [], 'distance': 0, 'searchCounter': searchCounter};
	
	var explored = [];
	var frontier = new Array();
	
	frontier.unshift({'distance': 0, 'nodeID': start, 'path': []});	
	
	var current, path;
	
	var counter = 0;
	
	// Loop until we have explored all frontiers. If this completes we couldn't find a path
	while(frontier.length > 0) {
		searchCounter++;
		current = frontier.pop();
		
		if(current.nodeID.col == goal.col && current.nodeID.row == goal.row) {
			path = current.path.slice(0);
			path.push(current.nodeID);
			self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier});
			return {'path': path, 'distance': current.distance, 'searchCounter': searchCounter};
		}
		
		// Lets get all the neighboring nodes and add them to the frontier if they haven't been explored
		for(let node of theBoard.getNeighbors(current.nodeID, board)) {		
			
			// Optimization
			if(node.col == goal.col && node.row == goal.row) {
				path = current.path.slice(0);
				path.push(current.nodeID);
				path.push(node);
				self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier});
				return {'path': path, 'distance': current.distance + + board.boardGrid[node.col][node.row].weight, 'searchCounter': searchCounter};
			}
			
			if(!(this.isIn(node, explored))) {
				explored.push(node);
				path = current.path.slice(0); 
				path.push(current.nodeID);
				frontier.unshift({'distance': current.distance + board.boardGrid[node.col][node.row].weight, 'nodeID': node, 'path': path})
			}			
		}
				
		iterationMaintenance(messageID, searchDelay, counter, explored, frontier);

	}
	
	return {'path': [], 'distance': 0, 'searchCounter': searchCounter};
}

/*******************************************/

function DepthFirstSearch() {
	Search.call(this);
}

DepthFirstSearch.prototype = Object.create(Search.prototype);
DepthFirstSearch.prototype.contructor = BreadthFirstSearch;

DepthFirstSearch.prototype.performSearch = function(messageID, searchDelay, board, start, goal) {
	var searchCounter = 0;
	
	// If the start and end are the same then return an empty list
	if(start == goal)
		return {'path': [], 'distance': 0, 'searchCounter': searchCounter};
	
	var explored = [];
	var frontier = new Array();
	
	frontier.push({'distance': 0, 'nodeID': start, 'path': []});	
	
	var current, path;
	
	var counter = 0;
	
	// Loop until we have explored all frontiers. If this completes we couldn't find a path
	while(frontier.length > 0) {
		searchCounter++;		
		current = frontier.pop();

		// Are we at the goal?
		if(current.nodeID.col == goal.col && current.nodeID.row == goal.row) {
			path = current.path;
			path.push(goal)
			self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier});
			return {'path': path, 'distance': current.distance, 'searchCounter': searchCounter};
		}
		
		if(!(this.isIn(current.nodeID, explored))) {
			explored.push(current.nodeID);
			
			// Lets get all the neighboring nodes and add them to the frontier if they haven't been explored
			for(let node of theBoard.getNeighbors(current.nodeID, board)) {							
					path = current.path.slice(0); 
					path.push(current.nodeID);
					frontier.push({'distance': current.distance + board.boardGrid[node.col][node.row].weight, 'nodeID': node, 'path': path, 'searchCounter': searchCounter})
				}			
		}
				
		iterationMaintenance(messageID, searchDelay, counter, explored, frontier);
	}
	
	return {'path': [], 'distance': 0, 'searchCounter': searchCounter};
}

/*******************************************/

function UniformCostSearch() {
	Search.call(this);
}

UniformCostSearch.prototype = Object.create(Search.prototype);
UniformCostSearch.prototype.contructor = UniformCostSearch;

UniformCostSearch.prototype.performSearch = function(messageID, searchDelay, board, start, goal) {
	var searchCounter = 0;
	
	// If the start and end are the same then return an empty list
	if(start == goal)
		return {'path': [], 'distance': 0, 'searchCounter': searchCounter};
	
	var explored = [];
	var frontier = new FastPriorityQueue(function(a,b) {return a.distance < b.distance});
	
	frontier.add({'distance': 0, 'nodeID': start, 'path': []});	
	
	var current, path;
	
	var counter = 0;
	
	// Loop until we have explored all frontiers. If this completes we couldn't find a path
	while(frontier.size > 0) {
		searchCounter++;
		current = frontier.poll();
		
		if(current.nodeID.col == goal.col && current.nodeID.row == goal.row) {
			path = current.path.slice(0);
			path.push(current.nodeID);
			self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier.array});
			return {'path': path, 'distance': current.distance, 'searchCounter': searchCounter};
		}
				
		// Lets get all the neighboring nodes and add them to the frontier if they haven't been explored
		for(let node of theBoard.getNeighbors(current.nodeID, board)) {		
			
			// Optimization
			if(node.col == goal.col && node.row == goal.row) {
				path = current.path.slice(0);
				path.push(current.nodeID);
				path.push(node);
				self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier.array});
				return {'path': path, 'distance': current.distance + board.boardGrid[node.col][node.row].weight, 'searchCounter': searchCounter};
			}
			
			if(!(this.isIn(node, explored))) {
				explored.push(node);
				path = current.path.slice(0); 
				path.push(current.nodeID);
				frontier.add({'distance': current.distance + board.boardGrid[node.col][node.row].weight, 'nodeID': node, 'path': path})
			}			
		}

		// Accessing the array internal to the priority queue so need to have it cleaned up first
		frontier.trim();

		iterationMaintenance(messageID, searchDelay, counter, explored, frontier.array);
	}
	
	return {'path': [], 'distance': 0, 'searchCounter': searchCounter};
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

AStarSearch.prototype.performSearch = function(messageID, searchDelay, board, start, goal) {
	var searchCounter = 0;
	
	// If the start and end are the same then return an empty list
	if(start == goal)
		return {'path': [], 'distance': 0, 'searchCounter': searchCounter};
	
	var explored = [];
	var frontier = new FastPriorityQueue(function(a,b) {
		return a.astar < b.astar});
	
	frontier.add({'astar': 0, 'distance': 0, 'nodeID': start, 'path': []});	
	
	var current, path;
	
	var counter = 0;
	
	// Loop until we have explored all frontiers. If this completes we couldn't find a path
	while(frontier.size > 0) {
		searchCounter++;
		current = frontier.poll();

		if(current.nodeID.col == goal.col && current.nodeID.row == goal.row) {
			path = current.path.slice(0);
			path.push(current.nodeID);
			self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier.array});
			return {'path': path, 'distance': current.distance, 'searchCounter': searchCounter};
		}
		
		// Lets get all the neighboring nodes and add them to the frontier if they haven't been explored
		for(let node of theBoard.getNeighbors(current.nodeID, board)) {				
			// Optimization
			if(node.col == goal.col && node.row == goal.row) {
				path = current.path.slice(0);
				path.push(current.nodeID);
				path.push(node);
				self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier.array});
				return {'path': path, 'distance': current.distance + board.boardGrid[node.col][node.row].weight, 'searchCounter': searchCounter};
			}
			
			if(!(this.isIn(node, explored))) {
				explored.push(node);
				path = current.path.slice(0); 
				path.push(current.nodeID);				
				var updatedDistance = current.distance + board.boardGrid[node.col][node.row].weight;
				frontier.add({'astar': updatedDistance + this.euclideanDistance(node, goal), 'distance': updatedDistance , 'nodeID': node, 'path': path})
			}			
		}
		
		// Accessing the array internal to the priority queue so need to have it cleaned up first
		frontier.trim();

		iterationMaintenance(messageID, searchDelay, counter, explored, frontier.array);				
	}
	
	return {'path': [], 'distance': 0, 'searchCounter': searchCounter};
}

// Sends an update to the main thread and adds a delay if the user asked for it
function iterationMaintenance(messageID, searchDelay, counter, explored, frontier) {	
	// If there is a search delay always send an update to the main thread. If there is no search delay then skip messages to not overwhelm the main thread 
	if(counter == 5 || searchDelay > 0) {
		self.postMessage({'cmd' : 'currentStatus', 'ID': messageID, 'explored': explored, 'frontier': frontier});
		counter = 0;
	}
	else
		counter++;
	
	// Want to show the progress
	sleep(searchDelay);
}

// Should not normally do this, but blocking in a worker thread. Silly that Javascript does not yet have a commonly available way to sleep without blocking.
// Since this is a worker thread, the UI isn't blocked, but it does take all the capacity of a single core
function sleep(time) {
	var now = new Date().getTime();
	while(new Date().getTime() < now + time) 
	 ; // Do nothing
}