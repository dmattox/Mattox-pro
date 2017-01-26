'use strict';

var SWITCH_DEFAULT_COLOR = 'grey'; 
var SWITCH_SENDER_COLOR = 'blue'; 
var SWITCH_RECEIVER_COLOR = 'black'; 

var LINK_UNKNOWN_COLOR = 'grey'; 
var LINK_BLOCKED_COLOR = 'red'; 
var LINK_ACTIVE_COLOR = 'green'; 
var LINK_DP_COLOR = 'green';
var LINK_RP_COLOR = 'blue';

var X_SCALE = 80;
var Y_SCALE = 80;

var SimStateEnum = {
	NOT_STARTED : "Not Started",
	IN_PROGRESS : "In Progress",
	FINISHED : "Finished"
};

var PortStateEnum = {
    UNKNOWN : "Unknown",
    ROOT_PORT : "Root Port",
    DESIGNATED_PORT : "Designated Port",
    BLOCKED_PORT : "Blocked Port"
};

var Message = function(messageSourceID, messageDestinationID, rootNodeID, distance, pathThrough) {
    // The switch sending the message
	this.messageSourceID = messageSourceID;
	// The switch the message is intended for
    this.messageDestinationID = messageDestinationID;
    // The current understanding of who the root nood is (not correct at the start)
    this.rootNodeID = rootNodeID;
    // Distance from the sending switch to the root node
    this.distance = distance;
    // Does the sending switch need the receiving switch to reach the noode
    this.pathThrough = pathThrough;
    // Time window the message was generated
    this.timeWindow = 0;
};

var Switch = function(switchID) {
    this.switchID = switchID;
    this.links = [];
    this.rootNode = new Message(switchID, switchID, switchID, 0, false);
};

Switch.prototype.initialBroadcast = function() {
    for(var link in this.links) {
        if(this.links.hasOwnProperty(link)) {
            var message = new Message(this.switchID, link, this.switchID, 0, false);
            theNetwork.sendMessage(message);
        }
    }
};

Switch.prototype.broadcastNewRootInfo = function(rootPathNode) {
    for(var link in this.links) {
        if (this.links.hasOwnProperty(link)) {
            // Let the node next in our path to the root know we are using them as our path
            if (link == rootPathNode)
                theNetwork.sendMessage(new Message(this.switchID, link, this.rootNode.rootNodeID, this.rootNode.distance, true));
            else
                theNetwork.sendMessage(new Message(this.switchID, link, this.rootNode.rootNodeID, this.rootNode.distance, false));
        }
    }
};

Switch.prototype.blockPort = function(portID) {
    this.links[portID] = PortStateEnum.BLOCKED_PORT;
};

Switch.prototype.designatedPort = function(portID) {
    this.links[portID] = PortStateEnum.DESIGNATED_PORT;
};

Switch.prototype.unknownPort = function(portID) {
    this.links[portID] = PortStateEnum.UNKNOWN;
};

Switch.prototype.rootPathPort = function(portID) {
    this.links[portID] = PortStateEnum.ROOT_PORT;
};

Switch.prototype.clearRootPort = function() {
    // If there used to be a root port we now block it because we have a different path to root
    for(var currentSwitch in this.links)
        if(this.links.hasOwnProperty(currentSwitch)) {
            if(this.links[currentSwitch] == PortStateEnum.ROOT_PORT)
                this.blockPort(currentSwitch);
        }
};

Switch.prototype.setRootPort = function(theMessage) {
    this.rootNode = theMessage;
    this.rootNode.distance++;

    this.clearRootPort();
    this.rootPathPort(theMessage.messageSourceID);
};

Switch.prototype.isBetterRootPath = function(theMessage) {
    // Check to see if this is a lower ID root than what we currently know about
    if(theMessage.rootNodeID < this.rootNode.rootNodeID) {
        this.setRootPort(theMessage);
        this.broadcastNewRootInfo(theMessage.messageSourceID);

        return true;
    }
    // If the root is the same, but the distance is shorter, we also want that one
    else if (theMessage.rootNodeID == this.rootNode.rootNodeID && theMessage.distance < this.rootNode.distance - 1) {
        this.setRootPort(theMessage);
        this.broadcastNewRootInfo(theMessage.messageSourceID);

        return true;
    }
    // If everything is the same but the source is lower then take that one
    else if (theMessage.rootNodeID == this.rootNode.rootNodeID && theMessage.distance == this.rootNode.distance - 1 && theMessage.messageSourceID < this.rootNode.messageSourceID ) {
        this.setRootPort(theMessage);
        this.broadcastNewRootInfo(theMessage.messageSourceID);

        return true;
    }
    // Discard a root path we already are aware of
    else if (theMessage.rootNodeID == this.rootNode.rootNodeID && theMessage.distance == this.rootNode.distance - 1 && theMessage.messageSourceID == this.rootNode.messageSourceID )
        return true;
};

Switch.prototype.receiveMessage = function(theMessage) {
    // Is the switch telling us they are using us as their root path?
    if(theMessage.pathThrough) {
        this.designatedPort(theMessage.messageSourceID);
        return;
    }

    // Check to see if this is a better root path
    if(this.isBetterRootPath(theMessage)) {
        return;
    }

    // So they aren't pathing through us and we aren't using them. Time to block the port
    this.blockPort(theMessage.messageSourceID);
};

Switch.prototype.clearSTPProgress = function() {
    this.rootNode = new Message(this.switchID, this.switchID, this.switchID, 0, false);

    for(var currentSwitch in this.links)
        if(this.links.hasOwnProperty(currentSwitch)) {
            this.blockPort(currentSwitch);
        }
};

var Network = function() {
    // The list of switches in the network
	this.switchList = [];

	// The highest switch ID in the network - used for auto creating new switch IDs
    this.maxSwitch = 0;

    // The current queue of messages in the network
    this.networkMessageQueue = [];

    // The edges currently being handled in a given time window 
    this.currentEdges = [];
    
    // Whether to display port text
    this.displayPortText = true;
    
    // The time window currently being processed - used to have batches of messages being processed instead of all at once
    this.currentTimeWindow = 0;
    
    // Whether messages should be batched into time windows or completely serialized
    this.serializeMessages = false;
    
    // If we are still processing the simulation
    this.simulationState = SimStateEnum.NOT_STARTED;
};

Network.prototype.initialBroadcast = function() {
    for(var currentSwitch in this.switchList)
        if(this.switchList.hasOwnProperty(currentSwitch)) {
            this.switchList[currentSwitch].initialBroadcast();
        }
    
    this.simulationState = SimStateEnum.IN_PROGRESS;
    
    this.colorAllEdges();
};

Network.prototype.sendMessage = function(theMessage) {
    // We want the user to see messages processed
	theMessage.timeWindow = this.currentTimeWindow;
	
    this.networkMessageQueue.push(theMessage);
};

Network.prototype.processMessage = function(theMessage) {
    var node1 = cy.$("#" + theMessage.messageSourceID).style('background-color', SWITCH_SENDER_COLOR);
    var node2 = cy.$('#' + theMessage.messageDestinationID).style('background-color', SWITCH_RECEIVER_COLOR);

    // now update the current edge
    var currentEdge = node1.edgesWith(node2);
    //console.log('Source:' + theMessage.messageSourceID + ' Destination: ' + theMessage.messageDestinationID + ' Root:' + theMessage.rootNodeID + ' Distance: ' + theMessage.distance);   
    currentEdge.data('link', 'Root:' + theMessage.rootNodeID + ' Distance: ' + theMessage.distance);
    this.currentEdges.push(currentEdge);

    this.switchList[theMessage.messageDestinationID].receiveMessage(theMessage);
    
    this.colorEdges(theMessage.messageDestinationID, theMessage.messageSourceID);
};

Network.prototype.colorEdges = function(switch1, switch2) {
    var node1 = cy.$("#" + switch1);
    var node2 = cy.$("#" + switch2);
    var edge = node1.edgesWith(node2);
    
    // The edge might have the nodes in a different order
    var edgeNode1 = switch1;
    var edgeNode2 = switch2;
    
    if(edge.data('source') != switch1) {
    	edgeNode1 = switch2;
    	edgeNode2 = switch1;
    }

    var node1PortStatus = this.switchList[edgeNode1].links[edgeNode2];
    var node2PortStatus = this.switchList[edgeNode2].links[edgeNode1];
    
    this.colorEdge(edge, node1PortStatus, node1PortStatus);
   
    this.colorPort(edge, 'source-arrow-color', 'source-label', node1PortStatus);
    
    this.colorPort(edge, 'target-arrow-color', 'target-label', node2PortStatus);

};

Network.prototype.colorAllEdges = function() {
    for(var switch1 in this.switchList)
        if(this.switchList.hasOwnProperty(switch1))
            for(var switch2 in this.switchList[switch1].links)
                if(this.switchList[switch1].links.hasOwnProperty(switch2))
                    this.colorEdges(switch1, switch2);
}

Network.prototype.colorEdge = function(edge, node1, node2) {
    if(node1 == PortStateEnum.BLOCKED_PORT || node2 == PortStateEnum.BLOCKED_PORT)
    	edge.style('line-color', LINK_BLOCKED_COLOR);
    else if(node1 == PortStateEnum.UNKNOWN || node2 == PortStateEnum.UNKNOWN) 
    	edge.style('line-color', LINK_UNKNOWN_COLOR);
    else
    	edge.style('line-color', LINK_ACTIVE_COLOR);
}

Network.prototype.colorPort = function(edge, portType, labelType, portStatus) {
    if(portStatus == PortStateEnum.BLOCKED_PORT) {
        edge.style(portType, LINK_BLOCKED_COLOR);
        if(this.displayPortText) 
        	edge.style(labelType, 'BP');
    }
    else if(portStatus == PortStateEnum.UNKNOWN) {    
        edge.style(portType, LINK_UNKNOWN_COLOR);
        if(this.displayPortText)
        	edge.style(labelType, 'UNK');
    }
    else if(portStatus == PortStateEnum.DESIGNATED_PORT) {                         
        edge.style(portType, LINK_DP_COLOR);
        if(this.displayPortText)
        	edge.style(labelType, 'DP');
    }
    else { // Root Port                  
        edge.style(portType, LINK_RP_COLOR);
        if(this.displayPortText)
        	edge.style(labelType, 'RP');
    }

}

Network.prototype.updateMessageDisplay = function() {
    var messageString = "";
    for(var currentMessage in this.networkMessageQueue)
        if(this.networkMessageQueue.hasOwnProperty(currentMessage))
            messageString += 'Source:' + this.networkMessageQueue[currentMessage].messageSourceID + ' Destination: ' + this.networkMessageQueue[currentMessage].messageDestinationID + ' Root:' + this.networkMessageQueue[currentMessage].rootNodeID + ' Distance: ' + this.networkMessageQueue[currentMessage].distance + "\r";

    document.getElementById('messageList').value = messageString;
    document.getElementById('messageListLabel').textContent = "Message List (" + this.networkMessageQueue.length + ")";
};

Network.prototype.updateSwitchStatusDisplay = function() {
    var switchString = "";
    for(var currentSwitch in this.switchList)
        if(this.switchList.hasOwnProperty(currentSwitch))
            switchString += 'Node: ' + currentSwitch + ' Root:' + this.switchList[currentSwitch].rootNode.rootNodeID + ' Source: ' + this.switchList[currentSwitch].rootNode.messageSourceID + ' Distance: ' + this.switchList[currentSwitch].rootNode.distance + "\r";

    document.getElementById('switchList').value = switchString; 
};

Network.prototype.messageHandler = function() {
	// If we are done with the simulation, we are not going to process anymore messages
	if(this.simulationState == SimStateEnum.FINISHED)
		return;
	
    this.updateMessageDisplay();

    this.updateSwitchStatusDisplay();

    this.clearNodeHighlights();
    
    // clear the prior edges
    this.clearEdgeText();

    // Check to see if there are any messages to process
    if(this.networkMessageQueue.length != 0) 
		if(this.serializeMessages)
			this.processMessage(this.networkMessageQueue.shift());
		else {
	        // Search through all the messages
	    	var messagesToProcess = this.networkMessageQueue.filter(function(currentMessage){return currentMessage.timeWindow < theNetwork.currentTimeWindow;});
	    	this.networkMessageQueue = this.networkMessageQueue.filter(function(currentMessage){return currentMessage.timeWindow >= theNetwork.currentTimeWindow;});
	    	
	        // Prepare to move to the next time window	
	        this.currentTimeWindow++;
	    	
	    	for(var currentMessageID in messagesToProcess) 
	    		this.processMessage(messagesToProcess[currentMessageID]);
		}
    else { // We are done with simulation
    	this.simulationState = SimStateEnum.FINISHED;
    	
    	this.clearEdgeText();
    	
    	$.growl({ title: "", message: "Simulation completed."});
    } 
};

Network.prototype.clearNodeHighlights = function() {
    for(var currentSwitch in this.switchList)
        if(this.switchList.hasOwnProperty(currentSwitch))
            cy.$("#" + currentSwitch).style('background-color', SWITCH_DEFAULT_COLOR );	
}

Network.prototype.clearEdgeText = function() {
	// Clear the data for each edge
	for(var currentEdgeID in this.currentEdges)
		if(this.currentEdges.hasOwnProperty(currentEdgeID)) {
			this.currentEdges[currentEdgeID].data('link', '');
		}

	// Now clear the edges
	this.currentEdges = [];	
}

Network.prototype.addSwitch = function(switchID, posXParam, posYParam) {
    var posX = 500;
    var posY = 500;

    if(arguments.length == 0)
        switchID = this.maxSwitch+1;
    else if(arguments.length == 3) {
        posX = posXParam * X_SCALE;
        posY = posYParam * Y_SCALE;
    }


    this.switchList[switchID] = new Switch(switchID);


    cy.add({
            data: {id: switchID},
            position: { x: posX, y: posY}
        }
    );

    if(switchID > this.maxSwitch)
    	this.maxSwitch = switchID;
};

Network.prototype.removeSwitch = function(switchID) {
    // Check to see if this is a valid switch
    if(!this.switchList.hasOwnProperty(switchID)) {
        $.growl({title: "", message: "Switch does not exist."});
        return false;
    }

    var currentSwitch = this.switchList[switchID];

    // Look for any links to this switch and remove them
    for(var currentNeighbor in currentSwitch.links)
        if(currentSwitch.links.hasOwnProperty(currentNeighbor)) {
            delete this.switchList[currentNeighbor].links[switchID];
        }

    // Look for any messages to/from this switch and remove them
    for(var currentMessage in this.networkMessageQueue)
        if(this.networkMessageQueue.hasOwnProperty(currentMessage))
            if(this.networkMessageQueue[currentMessage].messageSourceID == switchID || this.networkMessageQueue[currentMessage].messageDestinationID == switchID)
                delete this.networkMessageQueue[currentMessage];

    // Now finally delete the switch
    delete this.switchList[switchID];

    return true;
};

Network.prototype.addLink = function(switchID1, switchID2) {
    var switch1 = this.switchList[switchID1];
    var switch2 = this.switchList[switchID2];

    switch1.links[switchID2] = PortStateEnum.UNKNOWN;
    switch2.links[switchID1] = PortStateEnum.UNKNOWN;

    cy.add({
        data: {
            id: switchID1 + '-' + switchID2,
            source: switchID1,
            target: switchID2,
            link: ""
        }
    });
};

Network.prototype.deleteLink = function(switchID1, switchID2) {
    // Check to make sure the switches exist
    if(!this.switchList.hasOwnProperty(switchID1)) {
        $.growl({title: "", message: switchID1 + "Switch does not exist."});
        return false;
    }
    if(!this.switchList.hasOwnProperty(switchID2)) {
        $.growl({title: "", message: switchID2 + "Switch does not exist."});
        return false;
    }
    // Check to make sure there is a link between
    if(!this.switchList[switchID1].links.hasOwnProperty(switchID2)) {
        $.growl({title: "", message: "Link does not exist."});
        return false;
    }

    delete this.switchList[switchID1].links[switchID2];
    delete this.switchList[switchID2].links[switchID1];

    return true;
};

// Clears port status and understanding of root nodes
Network.prototype.clearSTPProgress = function() {
    for(var currentSwitch in this.switchList)
        if(this.switchList.hasOwnProperty(currentSwitch))
            this.switchList[currentSwitch].clearSTPProgress();

    // Clear the message queue and then update the display
    this.networkMessageQueue = [];

    this.updateMessageDisplay();

    this.updateSwitchStatusDisplay();
};
