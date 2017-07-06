/**
 * 
 */

"use strict";

/*******************************************/

self.addEventListener('message', function(e) {
	  importScripts("utility.js");
	  importScripts("board.js");
	  importScripts("ai_move.js");
	  board = new Board();
	  var data = e.data;
	  switch (data.cmd) {
	    case 'move':      	     
	      console.log('Worker Message Received - ID:' + data.ID + " move:" + data.board + " currentPlayer:" + data.currentPlayer.col + ", " + data.currentPlayer.row 
	    		  + " opposingPlayer:" + data.opposingPlayer.col + ", " + data.opposingPlayer.row + " timeleft:" + data.turnStartTime);
	      
	      self.aiMove = new AIMove(); 
	      var bestMove = self.aiMove.move(data.ID, data.turnStartTime, data.board, data.currentPlayer, data.opposingPlayer);
	      	            	      
	      if(self.aiMove.continueProcessing)
	    	  self.postMessage({'cmd' : 'newMove', 'ID': data.ID, 'move': bestMove});
	      	      
	      break;
	      
	    // This doesn't really work because workers are single threaded and the other processing needs to complete before this message is processed
	    case 'stopTask':
	      console.log('Worker Message Received - stopTask: ');
	      if(self.aiMove != null) {
	    	  self.aiMove.continueProcessing = false;
	    	  console.log('Flag set to stop processing');
	      }
	      break;	      
	    case 'stop':
	      console.log('Worker Message Received - stop: ');
	      self.close(); // Terminates the worker.
	      break;
	    default:
	      console.log('Worker Message Received -  unknown command: ' + data.msg);
	  };
	}, false);