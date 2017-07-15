/**
 * 
 */

"use strict";

/*******************************************/

var CLOUD_AI_URL = "http://localhost:8081/solve/";
var CLOUD_AI_REST_TIMEOUT = 6000;

/*******************************************/

// "Abstract object" - should use one of the child objects
function Player(playerTitle, queenLocation, queenBoardIndicator, queenColor) {
	// What the player is called
	this.playerTitle = playerTitle;
	// The type of player
	this.playerType = null;
	// Duplicate information for what is in the board, but keeping it here as well for easy lookup
	this.queenLocation = queenLocation;
	// The symbol for the queen
	this.queenBoardIndicator = queenBoardIndicator;
	// Color the queen should be drawn in
	this.queenColor = queenColor;
	
	this.playerTypeEnum = {
			HUMAN : "Human",
			LOCAL_AI : "Local AI",
			CLOUD_AI : "Cloud AI",
			RANDOM : "Random"
	};
}

Player.prototype.isPlayerHuman = function() {
	return false;
}

Player.prototype.getPlayerType = function() {
	return this.playerType;
}

Player.prototype.getPlayerTitle = function() {
	return this.playerTitle;
}

Player.prototype.getQueenLocation = function() {
	return this.queenLocation;
}

Player.prototype.setQueenLocation = function(newLocation) {
	this.queenLocation = newLocation;
}

Player.prototype.getQueenBoardIndicator = function() {
	return this.queenBoardIndicator;
}

Player.prototype.getQueenColor = function() {
	return this.queenColor;
}

var player = new Player();

/*******************************************/

function HumanPlayer(playerTitle, queenLocation, queenBoardIndicator, queenColor) {
	Player.call(this, playerTitle, queenLocation, queenBoardIndicator, queenColor);
	
	this.playerType = this.playerTypeEnum.HUMAN;
}

HumanPlayer.prototype = Object.create(Player.prototype);
HumanPlayer.prototype.contructor = HumanPlayer;

HumanPlayer.prototype.isPlayerHuman = function() {
	return true;
}

HumanPlayer.prototype.move = function(turnStartTime, board, opposingQueenLocation) {
	return; // Don't do anything - need to wait for the player to interact with the application
}

/*******************************************/

function LocalAIPlayer(playerTitle, queenLocation, queenBoardIndicator, queenColor) {
	Player.call(this, playerTitle, queenLocation, queenBoardIndicator, queenColor);
	
	this.playerType = this.playerTypeEnum.LOCAL_AI;

	this.worker = new Worker('worker.js');
	
	// We want to be able to ignore old messages
	this.messageGroupID = 0;
	
	this.process = function(event){
		  var data = event.data;
		  switch (data.cmd) {
		    case 'newMove':
		      console.log('Worker said - newMove ID:' + data.ID + " " + " (" + data.move.moveLocation.col + ", " + data.move.moveLocation.row + ")");
		      
		      // Try to discard messages we are no longer interested in
		      if(this.messageGroupID == data.ID) {
		    	  var move = data.move;
		      	            
		    	  game.processComputerMove(move);		      
		      }
		      
		      break;
		    case 'bestMove':
		      console.log('Worker said - bestmove newMove ID:' + data.ID + " " + " (" + data.move.moveLocation.col + ", " + data.move.moveLocation.row + ") - Depth:" + data.searchDepth);
		      if(this.messageGroupID == data.ID) {
		    	  data.move.depth = data.searchDepth;
		    	  game.bestMove.push(data.move);
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
}

LocalAIPlayer.prototype = Object.create(Player.prototype);
LocalAIPlayer.prototype.contructor = LocalAIPlayer;

LocalAIPlayer.prototype.move = function(turnStartTime, board, opposingQueenLocation) {
	console.log('Main Thread Message - move');
	
	this.messageGroupID++;
	
	// Since this is CPU intensive, need to launch a worker thread to handle this. The move is returned to the listener below
	this.worker.postMessage({'cmd': 'move', 'ID': this.messageGroupID, 'turnStartTime': turnStartTime, 'board': board, 
		'currentPlayer': this.getQueenLocation(), 'opposingPlayer': opposingQueenLocation});
}

LocalAIPlayer.prototype.stopWorkerTask = function(turnStartTime, board, opposingQueenLocation) {
	console.log('Main Thread Message - stopTask');
	
	// Will tell the worker to stop a task
	this.worker.postMessage({'cmd': 'stopTask'});	
}

/*******************************************/

function CloudAIPlayer(playerTitle, queenLocation, queenBoardIndicator, queenColor) {
	Player.call(this, playerTitle, queenLocation, queenBoardIndicator, queenColor);
	
	this.playerType = this.playerTypeEnum.CLOUD_AI;
}

CloudAIPlayer.prototype = Object.create(Player.prototype);
CloudAIPlayer.prototype.contructor = CloudAIPlayer;

CloudAIPlayer.prototype.move = function(turnStartTime, board, opposingQueenLocation) {
    $.ajax({
        url: CLOUD_AI_URL,
        type: "POST",
        crossDomain: true,
        timeout: CLOUD_AI_REST_TIMEOUT,
        data: { cmd: 'move', turnStartTime: turnStartTime, board: JSON.stringify(this.board), 
			currentPlayer: JSON.stringify(this.getQueenLocation()), opposingPlayer: JSON.stringify(opposingQueenLocation) },
        dataType: "json",
        success: function (result) {
        	var move = result;
        	game.processComputerMove(move);
        },
        error: function (xhr, ajaxOptions, thrownError) {
        	game.serverError();
        }
    });	
}

/*******************************************/

function RandomPlayer(playerTitle, queenLocation, queenBoardIndicator, queenColor) {
	Player.call(this, playerTitle, queenLocation, queenBoardIndicator, queenColor);
	
	this.playerType = this.playerTypeEnum.RANDOM;
	
	this.worker = new Worker('randomworker.js');
	
	//Add a listener to receive moves from the worker thread
	this.worker.addEventListener('message', function(e) {
		  var data = e.data;
		  switch (data.cmd) {
		    case 'newMove':
		      console.log('WORKER SAID: ' + data.move);
		      
		      var move = data.move;		     	            
		      game.processComputerMove(move);
		      
		      break;
		    case 'bestMove':
		      game.bestMove = data.move;
		      game.searchDepth = data.searchDepth;	
		    case 'stop':
		      console.log('WORKER STOPPED: ' + data.msg);
		      break;
		    default:
		      console.log('Unknown command: ' + data.msg);
		  };
	}, false);
}

RandomPlayer.prototype = Object.create(Player.prototype);
RandomPlayer.prototype.contructor = RandomPlayer;

RandomPlayer.prototype.move = function(turnStartTime, board, opposingQueenLocation) {
	// Since this is CPU intensive, need to launch a worker thread to handle this. The move is returned to the listener below
	this.worker.postMessage({'cmd': 'move', 'turnStartTime': turnStartTime, 'board': board, 
		'currentPlayer': this.getQueenLocation(), 'opposingPlayer': opposingQueenLocation});	
}

RandomPlayer.prototype.stopWorkerTask = function(turnStartTime, board, opposingQueenLocation) {
	// Will tell the worker to stop a task
	this.worker.postMessage({'cmd': 'stopTask'});	
}
