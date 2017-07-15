/**
 * 
 */

"use strict";

/*******************************************/

// Lets us stop a worker and not have them return data
var aiMove = null;

self.addEventListener('message', function(e) {
	  importScripts("utility.js");
	  importScripts("board.js");
	  importScripts("ai_move.js");
	  board = new Board();
	  var data = e.data;
	  switch (data.cmd) {
	    case 'move':      	     
	      console.log('WORKER STARTED: ' + data.board + " currentPlayer:" + data.currentPlayer.col + ", " + data.currentPlayer.row 
	    		  + " opposingPlayer:" + data.opposingPlayer.col + ", " + data.opposingPlayer.row + " timeleft:" + data.turnStartTime);
	      
	  	  // Get the set of available moves and then randomly select one
	  	  var availableMoves = Array.from(getAvailableMoves(data.currentPlayer, data.board));
	  	  
	  	  if(availableMoves.length == 0) {
	  		  self.postMessage({'cmd' : 'newMove', 'move': new Move(null, null, null)});
	  		  return;
	  	  }
	  	  	
	  	  var randomLocation = Math.floor(Math.random() * availableMoves.length);
	  	  var bestMove = new Move(availableMoves[randomLocation], data.currentPlayer, null);
	      	            	      
    	  self.postMessage({'cmd' : 'newMove', 'move': bestMove});
	      	      
	      break;
	    case 'stopTask':
		      // Do nothing
		      break;
	    case 'stop':
	      console.log('WORKER STOPPED: ' + data.msg);
	      self.close(); // Terminates the worker.
	      break;
	    default:
	      console.log('Unknown command: ' + data.msg);
	  };
	}, false);