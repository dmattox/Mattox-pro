// Copyright 2016 David Mattox  
// Usage of sections of code is granted to use in other projects under fair use

/*******************************************/

var MIN_SCREEN_WIDTH = 320;
var MIN_SCREEN_HEIGHT = 320;
var MIN_CANVAS_WIDTH = 514;
var MIN_CANVAS_HEIGHT = 320;
var MAX_OBJECT_VELOCITY = 4;
var MAX_BULLET_VELOCITY = 6;
var BULLET_LIFE_TIME = 100;
var MAX_BULLETS = 10;
var SHIELD_LIFE_TIME = 500;
var DEATH_LENGTH = 200;
var MAX_ASTEROID_SIZE = 5;
var MIN_ASTEROID_SIZE = 2;
var MAX_ASTEROID_VELOCITY = 3;
var MAX_ASTEROID_ROTATION_VELOCITY = 3;
var NUMBER_OF_ASTEROIDS = 3;
var MAX_EXPLOSION_ASTEROIDS = 3;
var LEFT_ARROW_KEY = 37;
var UP_ARROW_KEY = 38;
var RIGHT_ARROW_KEY = 39;
var FIRE_KEY = 32;
var SHIP_ROTATION = 5;
var SHIP_ACCELERATION = 0.2;
var SHIP_COUNT = 5;
var SHIELD_COUNT = 3;


/*******************************************/

// Constructor
var GameObject = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.direction = 180;
	this.objectPoints = [];
	this.xVelocity = 0;
	this.yVelocity = 0;
	this.borderColor = '#AAAAAA';
};

//GameObject.prototype.constructor = GameObject;

//Rotates the object, directionDelta can be pos/neg and in degrees
GameObject.prototype.rotateObject = function(directionDelta) {
	this.direction += directionDelta;
		
	// Check for the end cases
	if(this.direction >= 360)
		this.direction = 0;
	else if(this.direction < 0)
		this.direction = 355;
};

// Accelerates the object, nAcceleration can be pos or negative
GameObject.prototype.accelerateObject = function(acceleration) {
	// Need to break up the acceleration into X and Y components
	var xAcceleration = -Math.sin(this.direction * Math.PI / 180) * acceleration;
	var yAcceleration = Math.cos(this.direction * Math.PI / 180) * acceleration;

	// Check to see if we are going to go too fast
	if(Math.abs(this.xVelocity + xAcceleration) <= MAX_OBJECT_VELOCITY)
		this.xVelocity += xAcceleration;
	if(Math.abs(this.yVelocity + yAcceleration) <= MAX_OBJECT_VELOCITY)
		this.yVelocity += yAcceleration;
};

//Moves an object based on its direction and velocity
GameObject.prototype.moveObject = function() {
	// Gotta check to make sure we aren't going to go off the edge of the screen
	this.x = mod(this.x + this.xVelocity, Game.gameRect.width);
	this.y = mod(this.y + this.yVelocity, Game.gameRect.height);
};


// Detects if two objects have any points that intersect. Returns true if they
// do intersect
GameObject.prototype.collisionCheck = function(otherObject) {
	return intersection(new Rect(this.x, this.y, this.x + this.width, this.y + this.height),
					 new Rect(otherObject.x, otherObject.y, otherObject.x + otherObject.width, otherObject.y + otherObject.height));
};

GameObject.prototype.IsClicked = function(x, y) {
	var scaledRect = new ScaleRect(new Rect(this.x, this.y + Game.scoreRect.height, this.x + this.width, this.y + this.height + Game.scoreRect.height));
	var mouseRect = new Rect(x, y, x + 1, y + 1);
	
	return intersection(mouseRect, scaledRect);
};

// Draws the object
GameObject.prototype.drawObject = function(ctx, modern, additionalOffsetX, additionalOffsetY) {
	// Transform the object for the direction its facing
	var xCenter = this.width  / 2;
	var yCenter = this.height / 2;

	var transformedPoints = [];

	// x' = x * cos ( A ) - y * sin ( A )
	// y' = x * sin ( A ) + y * cos ( A )
	var directionRadian = this.direction * Math.PI / 180;
	var cosDirection = Math.cos(directionRadian);
	var sinDirection = Math.sin(directionRadian);
		
	for (var i = 0; i < this.objectPoints.length; i++)
	{
		transformedPoints[i] = {};
		transformedPoints[i][0] = this.objectPoints[i][0] * cosDirection - this.objectPoints[i][1] * sinDirection;
		transformedPoints[i][1] = this.objectPoints[i][0] * sinDirection + this.objectPoints[i][1] * cosDirection;
	}

	var xOffset;
	var yOffset;

	// Now lets actually draw the points
	if(additionalOffsetX > 0 )
		xOffset = this.x + xCenter - additionalOffsetX;
	else
		xOffset = this.x + xCenter;

	if(additionalOffsetY > 0)
		yOffset = this.y + yCenter - additionalOffsetY;
	else
		yOffset = this.y + yCenter;

	ctx.beginPath();
	ctx.strokeStyle = this.borderColor;
	ctx.lineWidth = '5';
	ctx.moveTo(scaleX(xOffset + transformedPoints[0][0]), scaleY(yOffset + transformedPoints[0][1]));
	
	for (i = 1; i < this.objectPoints.length; i++)
	{
		ctx.lineTo(scaleX(xOffset + transformedPoints[i][0]), scaleY(yOffset + transformedPoints[i][1]));
	}

	if(modern == Game.gameModeEnum.MODERN) {
		ctx.fillStyle = '#999999';
		ctx.fill();
	}
	ctx.stroke();
};

/*******************************************/

function BulletObject(x, y, direction) {
	GameObject.call(this, x, y, 1, 1);

	this.objectPoints = [[0,0],[1,0],[1,1],[0,1],[0,0]];

	this.direction = direction;

	this.accelerateObject(MAX_BULLET_VELOCITY);

	this.lifeTime = BULLET_LIFE_TIME;

	this.borderColor = 'white';
}

BulletObject.prototype = Object.create(GameObject.prototype);
BulletObject.prototype.constructor = BulletObject;

BulletObject.prototype.moveObject = function () {
	GameObject.prototype.moveObject.call(this);

	this.lifeTime--;
};

//Accelerates the object, nAcceleration can be pos or negative
BulletObject.prototype.accelerateObject = function(acceleration) {
	// Need to break up the acceleration into X and Y components
	var xAcceleration = -Math.sin(this.direction * Math.PI / 180) * acceleration;
	var yAcceleration = Math.cos(this.direction * Math.PI / 180) * acceleration;

	// Check to see if we are going to go too fast
	if(Math.abs(this.xVelocity + xAcceleration) <= MAX_BULLET_VELOCITY)
		this.xVelocity += xAcceleration;
	if(Math.abs(this.yVelocity + yAcceleration) <= MAX_BULLET_VELOCITY)
		this.yVelocity += yAcceleration;
};

BulletObject.prototype.isAlive = function () {
	return this.lifeTime > 0;
};

/*******************************************/

// Pass the starting location and if the ship is to have permanent shields
function ShipObject(x, y, isPermShield) {
	GameObject.call(this, x, y, 10, 10);

	this.permShield = isPermShield;
	this.shieldOn = isPermShield;
	this.shieldTimeLeft = SHIELD_LIFE_TIME;

	this.borderColor = 'white';

    this.objectPoints = [[  0,  10 ],
	        		    [ -8, -10 ],		                                  
	        		    [  0, -5 ],
	        		    [  8, -10 ],
	        		    [  0,  10 ] ]; 
}

ShipObject.prototype = Object.create(GameObject.prototype);
ShipObject.prototype.constructor = ShipObject;

//Need to also adjust the shield lifetime
ShipObject.prototype.moveObject = function() {
	GameObject.prototype.moveObject.call(this);

	// If the shield is on and not a perm shield
	if(this.shieldOn && !this.permShield) {
		if(this.shieldTimeLeft > 0) 
			this.shieldTimeLeft--;
		else
			this.shieldOn = false;
	}
};

//Turns the shield on
ShipObject.prototype.turnOnShield = function() {
	this.shieldOn = true;

	this.shieldTimeLeft = SHIELD_LIFE_TIME;
};

//Returns if the shield is currently on
ShipObject.prototype.isShieldOn = function() {
	return this.shieldOn;
};

//Need to also draw the shield
ShipObject.prototype.drawObject = function(ctx, modern, additionalOffsetX, additionalOffsetY) {
	GameObject.prototype.drawObject.call(this, ctx, modern, additionalOffsetX, additionalOffsetY);

	if(additionalOffsetX == null)
		additionalOffsetX = 0;

	if(additionalOffsetY == null)
		additionalOffsetY = 0;
	
	// Draw the shield
	if(this.shieldOn)
	{
		// Make the shield fade as it gets closer to expiring
		var c = Math.floor(this.shieldTimeLeft / SHIELD_LIFE_TIME * 200 + 55);
		ctx.strokeStyle = 'rgb(' + c +',' + c + ',' + c + ')';
		ctx.lineWidth = "2";
		
		ctx.beginPath();
		ctx.arc(scaleX(this.x + 5 - additionalOffsetX),
				scaleY(this.y + 5 - additionalOffsetY),
				scaleX(20),
				0,
				2 * Math.PI);
		ctx.stroke();
	}
};

// Fires a new bullet
ShipObject.prototype.fire = function() {
	return new BulletObject(this.x + 5, this.y + 5, this.direction);
};

/*******************************************/

// Pass the starting location and if the ship is to have permanent shields
function AIShipObject(x, y, permshield) {
	ShipObject.call(this, x, y, false);

	this.targetLocation = new Point(1000,700);
	this.targetAngle = 0;
}

AIShipObject.prototype = Object.create(ShipObject.prototype);
AIShipObject.prototype.constructor = AIShipObject;

AIShipObject.prototype.AIMoveShip = function() {

	var closestAsteroid = this.findClosestAsteroid();

	if(closestAsteroid == null)
		return;

	// Avoid the asteroid
	if(distanceXY(this.x, this.y, closestAsteroid.x, closestAsteroid.y) < 150) {
		Game.autopilotState = Game.autopilotStateEnum.AVOIDING;
		this.avoidAsteroid(closestAsteroid);
		if(this.rotateToPosition())
			this.accelerateObject(0.5);
	} // Try to stay near the center
	else if(distanceXY(this.x, this.y, Game.gameRect.width/2, Game.gameRect.height/2) > 300) {
		Game.autopilotState = Game.autopilotStateEnum.CENTERING;
		this.targetLocation.x = Game.gameRect.width/2;
		this.targetLocation.y = Game.gameRect.height/2;
				
		if(this.rotateToPosition())
			this.accelerateObject(.2);
	}
	else if(distanceXY(this.x, this.y, Game.gameRect.width/2, Game.gameRect.height/2) > 200) {
		Game.autopilotState = Game.autopilotStateEnum.CENTERING;
		this.targetLocation.x = Game.gameRect.width/2;
		this.targetLocation.y = Game.gameRect.height/2;
				
		if(this.rotateToPosition())
			this.accelerateObject(.02);
	}
	// Slow down if we are going fast
	else if(Math.abs(this.xVelocity) > 0.1 || Math.abs(this.yVelocity) > 0.1) {
		Game.autopilotState = Game.autopilotStateEnum.SLOWING;
		this.targetLocation.x = this.x - (this.xVelocity * 100);
		this.targetLocation.y = this.y - (this.yVelocity * 100);	

		if(this.rotateToPosition())
			this.accelerateObject(.2);
	}	
	else {
		Game.autopilotState = Game.autopilotStateEnum.FIRING;
		this.targetLocation.x = mod(closestAsteroid.x + 
									closestAsteroid.xVelocity * distanceXY(closestAsteroid.x, closestAsteroid.y, this.x, this.y) / 2, 
									Game.gameRect.width);
		this.targetLocation.y = mod(closestAsteroid.y + 
									closestAsteroid.yVelocity * distanceXY(closestAsteroid.x, closestAsteroid.y, this.x, this.y) / 2, 
									Game.gameRect.height);	
		
		if(this.rotateToPosition(false))
			Game.fire();	
	}
};

AIShipObject.prototype.rotateToPosition = function (){
	var xDistance = this.x - this.targetLocation.x;
	var yDistance = this.y - this.targetLocation.y;

	var angle = Math.atan(yDistance / xDistance);

	angle = angle * 180 / Math.PI + 90;

	if(xDistance < 0)
		angle += 180;

	angle = mod(angle, 360);

	this.targetAngle = angle;
	
	//document.write("Angle:" + angle + " Direction:" + this.direction + " Distance:" + distanceXY(this.targetLocation.x, this.targetLocation.y, this.x, this.y));

	if(distanceXY(this.targetLocation.x, this.targetLocation.y, this.x, this.y) > 0) {
		if(Math.min(Math.abs(this.direction - (angle + 360)), Math.abs(this.direction - angle)) > 5) {
			// Is it faster to go clockwise or counterclockwise
			if(Math.sin((this.direction - angle)/180*Math.PI) < 0)
				this.direction = mod(this.direction + 5, 360);
			else
				this.direction = mod(this.direction - 5, 360);
		}
		else {
			return true; // We are pointing at our target
		}
	}	
	return false; // We are not yet pointing at our target
};

AIShipObject.prototype.findClosestAsteroid = function() {
	if(Game.asteroidList.length == 0)
		return null;

	var i;
	var minDistance = distanceXY(this.x, this.y, Game.asteroidList[0].x, Game.asteroidList[0].y);
	var minObject = 0;
	
	for(i = 0; i < Game.asteroidList.length; i++) 
	{
		var currentDistance = distanceXY(this.x, this.y, Game.asteroidList[i].x, Game.asteroidList[i].y);
		if(currentDistance < minDistance) {
			minDistance = currentDistance;
			minObject = i;
		}
	}

	return Game.asteroidList[minObject];
};

AIShipObject.prototype.avoidAsteroid = function(closestAsteroid) {
	// Target a point that is opposite to where the asteroid is compared to the ship
	this.targetLocation.x = mod(this.x + this.x - closestAsteroid.x, Game.gameRect.width);
	this.targetLocation.y = mod(this.y + this.y - closestAsteroid.y, Game.gameRect.height);	
};

AIShipObject.prototype.drawObject = function(ctx, modern, additionalOffsetX, additionalOffsetY) {
	ShipObject.prototype.drawObject.call(this, ctx, modern, additionalOffsetX, additionalOffsetY);

	if(additionalOffsetX == null)
		additionalOffsetX = 0;
	if(additionalOffsetY == null)
		additionalOffsetY = 0;

	if(modern == Game.gameModeEnum.MODERN)
		ctx.strokeStyle = 'green';
	else
		ctx.strokeStyle = '#999999';
	ctx.beginPath();
	ctx.lineWidth = '3';

	var drawTargetLocationX = mod(this.targetLocation.x - additionalOffsetX, Game.gameRect.width);
	var drawTargetLocationY = mod(this.targetLocation.y - additionalOffsetY, Game.gameRect.height);
	
	ctx.moveTo(scaleX(drawTargetLocationX - 10), 
			   scaleY(drawTargetLocationY));
	ctx.lineTo(scaleX(drawTargetLocationX + 10), 
			   scaleY(drawTargetLocationY));

	ctx.moveTo(scaleX(drawTargetLocationX), 
			   scaleY(drawTargetLocationY - 10));
	ctx.lineTo(scaleX(drawTargetLocationX), 
			   scaleY(drawTargetLocationY + 10));

	ctx.stroke();

	if(Game.autopilotState == Game.automoveEnum.FIRE){ 
		ctx.beginPath();
		ctx.moveTo(scaleX(drawTargetLocationX), 
				   scaleY(drawTargetLocationY));
	
		drawTargetLocationX = mod(this.x - additionalOffsetX, Game.gameRect.width);
		drawTargetLocationY = mod(this.y - additionalOffsetY, Game.gameRect.height);
	
		ctx.lineTo(scaleX(drawTargetLocationX), 
				   scaleY(drawTargetLocationY));

		ctx.stroke();
	}	   
	
	this.drawVectors(ctx, this, modern, additionalOffsetX, additionalOffsetY);

	var closestAsteroid = this.findClosestAsteroid();
	
	if(closestAsteroid != null) {
		if(modern == Game.gameModeEnum.MODERN) {
			ctx.strokeStyle = 'red';
			ctx.fillStyle = 'red';
		}
		else
		{
			ctx.strokeStyle = '#999999';
			ctx.fillStyle = '#999999';
		}

		drawTargetLocationX = mod(closestAsteroid.x + closestAsteroid.width  /2 - additionalOffsetX, Game.gameRect.width);
		drawTargetLocationY = mod(closestAsteroid.y + closestAsteroid.height /2 - additionalOffsetY, Game.gameRect.height);

		ctx.beginPath();
		ctx.moveTo(scaleX(drawTargetLocationX - 10), 
				   scaleY(drawTargetLocationY));
		ctx.lineTo(scaleX(drawTargetLocationX + 10), 
				   scaleY(drawTargetLocationY));

		ctx.moveTo(scaleX(drawTargetLocationX), 
				   scaleY(drawTargetLocationY - 10));
		ctx.lineTo(scaleX(drawTargetLocationX), 
				   scaleY(drawTargetLocationY + 10));
		ctx.stroke();

		
	}	

	if(Game.autopilotState != Game.autopilotStateEnum.NONE) {
		ctx.font = scaleText();
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		if(modern == Game.gameModeEnum.MODERN) {
			ctx.strokeStyle = 'red';
			ctx.fillStyle = 'red';
		}
		else
		{
			ctx.strokeStyle = '#999999';
			ctx.fillStyle = '#999999';
		}

		ctx.fillText(Game.autopilotState, scaleX(this.x - additionalOffsetX), scaleY(this.y - additionalOffsetY));
	}
	
	for(var i = 0; i < Game.asteroidList.length; i++) 
		this.drawVectors(ctx, Game.asteroidList[i], modern, additionalOffsetX, additionalOffsetY);
};

AIShipObject.prototype.drawVectors = function(ctx, drawObject, modern, additionalOffsetX, additionalOffsetY) {
	var currentPoint = new Point(drawObject.x + drawObject.width/2, drawObject.y + drawObject.height/2);
	
	for(var i = 0; i < 50; i++) {
		currentPoint.x += drawObject.xVelocity;
		currentPoint.y += drawObject.yVelocity;

		if(modern == Game.gameModeEnum.MODERN) 
			ctx.strokeStyle = 'green';
		else
			ctx.strokeStyle  = '#999999';
		
		ctx.beginPath();

		ctx.rect(scaleX(mod(currentPoint.x - additionalOffsetX, Game.gameRect.width)), scaleY(mod(currentPoint.y - additionalOffsetY, Game.gameRect.height)), 1, 1);
		
		ctx.stroke();
	}
};

/*******************************************/

// The individual exploding ship parts
function ExplodingShipPart(points, parentShip) {
	GameObject.call(this, parentShip.x, parentShip.y, parentShip.width, parentShip.height);
	this.objectPoints = points;

	this.direction = parentShip.direction;
	this.xVelocity = parentShip.xVelocity;
	this.yVelocity = parentShip.yVelocity;
}

ExplodingShipPart.prototype = Object.create(GameObject.prototype);
ExplodingShipPart.prototype.constructor = ExplodingShipPart;

/*******************************************/

// Object for handling the ship when the player dies. The exploding ship is actually made 
// up of a number of exploding ship parts
function ExplodingShipObject(ship) {
	GameObject.call(this, ship.x, ship.y, ship.width, ship.height);
	this.x = ship.x;
	this.y = ship.y;
	this.direction = ship.direction;
	this.xVelocity = ship.xVelocity;
	this.yVelocity = ship.yVelocity;

    this.countDown = DEATH_LENGTH;

	this.makeShipParts(ship.objectPoints);
}

ExplodingShipObject.prototype = Object.create(GameObject.prototype);
ExplodingShipObject.prototype.constructor = ExplodingShipObject;

// Returns whether we have spent enough time with our awesome graphics ;)
ExplodingShipObject.prototype.isDoneExploding = function() {
	return this.countDown;
};

//Creates the sub ship parts
ExplodingShipObject.prototype.makeShipParts = function(points) {
	this.shipParts = [];
        
	// Tear apart the original ship and break each line into a
	// separate ship part
	for(var i = 0; i < points.length - 1; i++) {	
		var shipPartLine = [];

		shipPartLine[0] = [];
		shipPartLine[0][0] = points[i][0];
		shipPartLine[0][1] = points[i][1];
		shipPartLine[1] = [];
		shipPartLine[1][0] = points[i+1][0];
		shipPartLine[1][1] = points[i+1][1];
		
		this.shipParts[i] = new ExplodingShipPart(shipPartLine, this);

		// Give a random relative velocity so the pieces start blowing away
		this.shipParts[i].xVelocity += Math.random() * 4 - 2;
		this.shipParts[i].yVelocity += Math.random() * 4 - 2;
	} 
};

// Need to decrease the time left to show the exploding ship
ExplodingShipObject.prototype.moveObject = function() {
	GameObject.prototype.moveObject.call(this);

	this.countDown--;

	// Loop through and move each ship part
	for(var i = 0; i < this.shipParts.length; i++)
		this.shipParts[i].moveObject();
};

// Don't actually draw anything for the parent exploding ship, but have each part draw itself
ExplodingShipObject.prototype.drawObject = function(ctx, modern, additionalOffsetX, additionalOffsetY)
{
	for(var i = 0; i < this.shipParts.length; i++)
	{
		//document.write("In Exploding" + this.shipParts[i].x + " " + this.shipParts[i].y + " " + this.shipParts[i].objectPoints);
		this.shipParts[i].drawObject(ctx, modern, additionalOffsetX, additionalOffsetY);			
	}
};

/*******************************************/


// Represents the villain of the Game - the asteroids
function AsteroidObject(gameSize, size, x, y, random) {
	// Should we create a random large size starting asteroid?
	if(random) {
		this.x = Math.random() * gameSize.width;
		this.x += gameSize.x;
		this.y = Math.random() * gameSize.height;
		this.y += gameSize.y;

		this.width = MAX_ASTEROID_SIZE * 10;
		this.height = MAX_ASTEROID_SIZE * 10; 

		this.initAsteroid(MAX_ASTEROID_SIZE);
	} else {
		GameObject.call(this, x, y, size * 10, size * 10);
		this.asteroidSize = size;

		this.initAsteroid(size);
	}
	this.asteroidCollisionTimer = 200; // make sure astroids aren't blowing completely to pieces when they collide

	this.borderColor = '#AAAAAA';
}
AsteroidObject.prototype = Object.create(GameObject.prototype);
AsteroidObject.prototype.constructor = AsteroidObject;

AsteroidObject.prototype.initAsteroid = function(size) {
	this.asteroidSize = size;

	// Give a random direction the asteroid is heading
	this.direction = Math.random() * 360.0;

	// Now a random velocity +/-
	this.xVelocity = Math.random() * MAX_ASTEROID_VELOCITY - MAX_ASTEROID_VELOCITY / 2;
	this.yVelocity = Math.random() * MAX_ASTEROID_VELOCITY - MAX_ASTEROID_VELOCITY / 2;

	// Randomly generate the asteroids shape 
	this.objectPoints = this.generateAsteroid();

	// Give it a random spin
	this.rotationVelocity = Math.random() * MAX_ASTEROID_ROTATION_VELOCITY - MAX_ASTEROID_ROTATION_VELOCITY / 2; 	
};

//Need to also update the spin of the asteroid
AsteroidObject.prototype.moveObject = function() {
	GameObject.prototype.moveObject.call(this);

	this.rotateObject(this.rotationVelocity);

	if(this.asteroidCollisionTimer>0)
		this.asteroidCollisionTimer--;
};

//Breaks an asteroid into small asteroids
AsteroidObject.prototype.explodeAsteroid = function() {
	
	var newAsteroids = [];

	// Check for the end case
	if(this.asteroidSize == MIN_ASTEROID_SIZE)
		return newAsteroids;

	// Create a random number of smaller asteroids
	var asteroidCount =  Math.random() * MAX_EXPLOSION_ASTEROIDS;
	for(var i = 0; i < asteroidCount; i++)
	{
		newAsteroids[i] = new AsteroidObject(Game.gameRect, this.asteroidSize - 1, this.x, this.y, false);
	}

	return newAsteroids;
};

//Randomly generates the asteroids shape
AsteroidObject.prototype.generateAsteroid = function() {
	// Going to generate an asteroid that is polar coordinates 
	var pointCount   = this.asteroidSize * 15;
	var pointList = [];
	var currentAngle = 0 ;
	var minR         = this.width / 3;
	var maxOffset    = this.width / 10.0;
	var R            = Math.random() * maxOffset + minR;

	// Loop through and set a random point every pointCounter degree
	//noinspection JSDuplicatedDeclaration
    for(var i = 0; i < pointCount; i++)
	{
    	pointList[i] = [];
		pointList[i][0] = currentAngle;
		pointList[i][1] = R;

		R = R + Math.random() * 3 - 1.5;
		currentAngle += 360 / pointCount;
	}

    currentAngle = 0;
	// Now Convert it to Rect coordinates
	//noinspection JSDuplicatedDeclaration
    for(var i = 0; i < pointCount; i++)
	{
        currentAngle += 360 / pointCount;
		// Change the angle index to x
		pointList[i][0] = pointList[i][1] * Math.cos(currentAngle * Math.PI / 180);
		// Change the r index to y
		pointList[i][1] = pointList[i][1] * Math.sin(currentAngle * Math.PI / 180);
	}

	// Set the last point to equal the first point
	pointList[pointCount] = [];
	pointList[pointCount][0] = pointList[0][0];
	pointList[pointCount][1] = pointList[0][1];

	return pointList;
};

/*******************************************/

function GameArea(x, y, height, width) {
	GameObject.call(this, x, y, height, width);

	this.levelDisplayCounter = 250;
}

GameArea.prototype = Object.create(GameObject.prototype);
GameArea.prototype.constructor = GameArea;

GameArea.prototype.drawObject = function(ctx) {
	ctx.strokeStyle = 'white';
	ctx.lineWidth = "5";
		
	ctx.beginPath();
	ctx.rect(scaleX(this.x), scaleY(this.y), scaleX(this.width), scaleY(this.height));
	ctx.stroke();
};

/*******************************************/

function ScoreArea(x, y, width, height) {
	GameObject.call(this, x, y, width, height);

	// Create some ships to represent the number of lives left
	this.shipList = [];
	for(var i = 0; i < SHIP_COUNT; i++)
		this.shipList[i] = new ShipObject(width - 250 + 45 * i, height / 2 - 5, true);
}

ScoreArea.prototype = Object.create(GameObject.prototype);
ScoreArea.prototype.constructor = ScoreArea;

ScoreArea.prototype.drawObject = function(ctx) {
	ctx.font = scaleText();
	ctx.fillStyle = "red";
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.fillText("Score: " + Game.score,scaleX(50),scaleY(this.height / 2));

	for(var i = 0; i < this.shipList.length; i++)
		this.shipList[i].drawObject(ctx, false);
};

ScoreArea.prototype.shipCount = function() {
	return this.shipList.length;
};

ScoreArea.prototype.removeShip = function() {
	this.shipList.splice(this.shipCount() - 1);
};

/*******************************************/
 
function GameButton(x, y, height, width, controlText, state, showDemo, showPlaying, showPaused) {
	GameObject.call(this, x, y, height, width);

	this.showDemo = showDemo;
	this.showPlaying = showPlaying;
	this.showPaused = showPaused;

	this.controlText = controlText;
	this.scaledPhysicalRect = new ScaleRect(new Rect(this.x, this.y, this.x + this.width, this.y + this.height));

	this.state = state;
	this.isHovering = false;
}

GameButton.prototype = Object.create(GameObject.prototype);
GameButton.prototype.constructor = GameButton;

GameButton.prototype.toggleState = function() {
	this.state = !this.state;
}

GameButton.prototype.drawObject = function(ctx, offsetX, offsetY) {
	// Show control when appropriate
	if(Game.isDemo() && this.showDemo == false)
		return;
	
	if(Game.isPlaying() && this.showPlaying == false)
		return;

	if(Game.isPaused() && this.showPaused == false)
		return;
	
	if(offsetX == null)
		offsetX = 0;

	if(offsetY == null)
		offsetY = 0;

	if(this.isHovering) {
		ctx.beginPath();
		ctx.fillStyle = 'LightSlateGray';
		ctx.fillRect(scaleX(this.x - offsetX), scaleY(this.y - offsetY), scaleX(this.width), scaleY(this.height));
		ctx.stroke();
	} else if (this.state) {
		ctx.beginPath();
		ctx.fillStyle = 'DarkSlateGray';
		ctx.fillRect(scaleX(this.x - offsetX), scaleY(this.y - offsetY), scaleX(this.width), scaleY(this.height));
		ctx.stroke();
	}

	
	ctx.strokeStyle = 'white';
	ctx.fillStyle = 'red';
	ctx.lineWidth = "2";
		
	ctx.beginPath();
	ctx.rect(scaleX(this.x - offsetX), scaleY(this.y - offsetY), scaleX(this.width), scaleY(this.height));
	ctx.stroke();
		
	ctx.font = scaleText();
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(this.controlText, scaleX(this.x + this.width /2 - offsetX), scaleY(this.y + this.height/2 - offsetY));
};

/*******************************************/

function GameControl(x, y, height, width, controlText, state, showDemo, showPlaying, showPaused) {
	GameButton.call(this, x, y, height, width, controlText, state, showDemo, showPlaying, showPaused);
}

GameControl.prototype = Object.create(GameButton.prototype);
GameControl.prototype.constructor = GameControl;

GameControl.prototype.drawObject = function(ctx, offsetX, offsetY) {
	// Show controls only if touch is enabled
	if(Game.isPlaying() && !Game.touchButton.state)
		return;

	GameButton.prototype.drawObject.call(this, ctx, offsetX, offsetY);
};

/*******************************************/

var Game = Object.create(null);

//Define the physical screen
Game.physicalRect = new Rect(0,0, window.innerWidth, window.innerHeight);

//Define the rectangle for the score section
Game.scoreRect = new ScoreArea(0, 0, 1000, 75);

Game.gameRect = new GameArea(0, 0, 1000, 700);

Game.gameRect.drawObject = function(ctx) {
	GameArea.prototype.drawObject.call(this, ctx);
	
	// Display the level to the player for a bit at the start
	if(Game.isPlaying())
		if(this.levelDisplayCounter > 0){
			ctx.font = scaleText();
			ctx.fillStyle = "red";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Level - " + (Game.levelCounter+1) , scaleX(this.width / 2),scaleY(this.height / 2));

			this.levelDisplayCounter--;
	}

	if(Game.isPaused()) {
			ctx.font = scaleText();
			ctx.fillStyle = "red";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Paused", scaleX(this.width / 2), scaleY(this.height / 2));
	}
};

Game.xScale = Game.physicalRect.right / Game.gameRect.width;
Game.yScale = (Game.physicalRect.bottom - 75) / Game.gameRect.height;

Game.theShip = new AIShipObject(Game.gameRect.width / 2, Game.gameRect.height / 2, false);
Game.exploding = false;
Game.explodingCounter = 0;

//Game.classicRect = new GameButton(300, 125 - Game.scoreRect.height, 400, 200, "Play Classic Mode", false, true, false, false);
Game.modernRect = new GameButton(300, 125 - Game.scoreRect.height, 400, 200, "Play", false, true, false, false);
Game.pauseRect = new GameButton(440, 600, 120, 40, "'P'ause", false, false, true, true);

Game.keyboardButton = new GameButton(50, 175, 200, 100, "Keyboard Control", true, true, false, true);
Game.touchButton = new GameButton(50, 350, 200, 100, "Touch Control", false, true, false, true);

Game.leftRect = new GameControl(50, 500, 150, 150, "Rotate Left", false, false, true, false);
Game.rightRect = new GameControl(226, 500, 150, 150, "Rotate Right", false, false, true, false);
Game.thrustRect = new GameControl(138, 334, 150, 150, "Thrust", false, false, true, false);
Game.fireRect = new GameControl(625, 334, 334, 315, "Fire", false, false, true, false);

Game.backGroundImage = new Image();
Game.backGroundImage.src = './BlueSpace.jpg';

Game.score = 0;

Game.gameModeEnum = {
	CLASSIC : "Classic",
	MODERN : "Modern" 
};

Game.gameMode = Game.gameModeEnum.MODERN;

Game.gameStateEnum = {
	DEMO : "Demo",
	PLAYING : "Playing",
	PAUSED : "Paused"
};

Game.gameState = Game.gameStateEnum.DEMO;

Game.autopilotStateEnum = {
	AVOIDING : "Avoiding",
	SLOWING : "Slowing Down",
	FIRING : "Firing",
	CENTERING : "Centering",
	NONE : "None"
};

Game.autopilotState = Game.autopilotStateEnum.NONE;

Game.automoveEnum = {
	ACCELERATE : "'Up Key'",
	RIGHT : "'Right Key'",
	LEFT : "'Left Key'",
	FIRE : "'Space'",
	NONE : "None"			 
};

Game.automove = Game.automoveEnum.NONE;

Game.checkScreenResize = function(canvas) {
	// Check to see if the window size has changed
	if(Game.physicalRect.right != window.innerWidth || Game.physicalRect.bottom != window.innerHeight){

		this.physicalRect = new Rect(0,0, window.innerWidth, window.innerHeight);

		var physicalScoreHeight = this.scoreRect.height / (this.scoreRect.height + this.gameRect.height) * this.physicalRect.bottom;  

		this.xScale = this.physicalRect.right / this.gameRect.width;
		this.yScale = (this.physicalRect.bottom - physicalScoreHeight) / this.gameRect.height;
	}

	if(window.innerWidth > canvas.width)
		canvas.width = window.innerWidth;

	if(window.innerHeight > canvas.height)
		canvas.height = window.innerHeight;
};

Game.togglePause = function() {
	if (this.isPlaying())
		this.gameState = this.gameStateEnum.PAUSED;
	else if (this.isPaused())
		this.gameState = this.gameStateEnum.PLAYING;
};

Game.switchToPlayState = function(mode) {
	Game.gameMode = mode;
	
	this.initGame(true);
};

Game.initDemo = function() {
	this.initGame(false);
	
	this.gameState = this.gameStateEnum.DEMO;

	this.makeAsteroids(1);

	this.theShip = new AIShipObject(this.gameRect.width / 2, this.gameRect.height / 2, false);

	this.gameMode = this.gameModeEnum.MODERN;
};

Game.initGame = function(resetScore) {
	this.gameState = this.gameStateEnum.PLAYING;

	this.automove = this.automoveEnum.NONE;

	if(resetScore) {
		this.scoreRect = new ScoreArea(0, 0, 1000, 75);
		this.score = 0;
	}

	this.levelCounter = 0;
	
	this.theShip = new ShipObject(this.gameRect.width / 2, this.gameRect.height / 2, false);
	// Give the player a chance
	this.theShip.turnOnShield();

	this.makeAsteroids(NUMBER_OF_ASTEROIDS);

	this.bulletList = [];

	this.exploding = false;
	this.explodingCounter = 0;
};

Game.isDemo = function() {
	return this.gameState == this.gameStateEnum.DEMO;
};

Game.isPlaying = function() {
	return this.gameState == this.gameStateEnum.PLAYING;
};

Game.isPaused = function() {
	return this.gameState == this.gameStateEnum.PAUSED;
};

Game.explodeAsteroid = function(asteroidIndex) {
	// Remove the bigger asteroid, create the smaller asteroids and add them to our list
	var newAsteroids = Game.asteroidList[asteroidIndex].explodeAsteroid();
	Game.asteroidList.splice(asteroidIndex,1);
	Game.asteroidList = Game.asteroidList.concat(newAsteroids);
};

Game.checkAsteroidHit = function() {
	for(var i = 0; i < Game.asteroidList.length; i++) {
		for(var j = 0; j < Game.asteroidList.length; j++) {
			if(i != j)
				if (Game.asteroidList[i].collisionCheck(Game.asteroidList[j]))
				{ 
					if(Game.asteroidList[i].asteroidCollisionTimer == 0 && Game.asteroidList[i].asteroidCollisionTimer == 0)
					{
						Game.explodeAsteroid(j);
						return;
					}
				} 
		}
	}
};

Game.checkBulletHit = function() {
	for(var i = 0; i < Game.bulletList.length; i++) {
		for(var j = 0; j < Game.asteroidList.length; j++) {
			if(Game.bulletList[i].collisionCheck(Game.asteroidList[j])) {
				// Lets give them some points
				if(!Game.isDemo())
					Game.score += 100;

				Game.explodeAsteroid(j);

				// Remove the bullet
				Game.bulletList.splice(i, 1);
				gameControls.FireTimer = 0;

				// Our lists have changed, lets start over
				Game.checkBulletHit();
				return;
			}
		}
	}
};

Game.checkShipHit = function() {
	// If the shields are on, they can't be hit
	if(Game.theShip.isShieldOn())
		return;

	// Don't check for collisions if we are already exploding
	if(Game.exploding)
		return;

	// Loop through all the asteroids and see if there is a hit
	for(var j = 0; j < Game.asteroidList.length; j++) {
		if(Game.theShip.collisionCheck(Game.asteroidList[j])) {
			Game.explodeAsteroid(j);

			// Lets have a exploding ship animation
			Game.theShip = new ExplodingShipObject(Game.theShip);
			Game.exploding = true;
			Game.explodingCounter = DEATH_LENGTH;

			// The ship exploded so lets bail out of this
			return;
		}
	}
};

Game.resetShip = function() {
	Game.exploding = false;

	if(Game.isDemo())
		this.theShip = new AIShipObject(this.gameRect.width / 2, this.gameRect.height / 2, false);
	else
		this.theShip = new ShipObject(this.gameRect.width / 2, this.gameRect.height / 2, false);
	// Give the player a chance
	this.theShip.turnOnShield();
};

Game.fire = function() {
	if(Game.exploding)
		return;

	if(!gameControls.FireTimer)
	{
		if(this.bulletList.length < MAX_BULLETS)
		{
			this.bulletList[this.bulletList.length] = Game.theShip.fire();	
			gameControls.FireTimer = 10;
		}
	}
};

Game.animate = function() {
	Game.checkAsteroidHit();

	if(gameControls.FireTimer > 0)
		gameControls.FireTimer--;
	
	if(Game.isDemo()) {
		Game.moveAsteroids();

		if(!Game.exploding)
			Game.theShip.AIMoveShip();
	}

	if(!Game.isPaused()) {
		Game.moveAsteroids();
		Game.theShip.moveObject();
		Game.moveBullets();
		Game.checkBulletHit();
		
		if(Game.exploding) {
			if(Game.explodingCounter > 0)
				Game.explodingCounter--;
			else { // Done exploding
				if(Game.scoreRect.shipCount() > 0) { // Check to see if there are ships left
					Game.resetShip();
					Game.scoreRect.removeShip();
				}
				else // No ships left
					Game.initDemo();
			}
		}
		else {
			// Check to see if the level is cleared, we want the ship explosion to finish before we do if the player happened to die clearing the level
			if(Game.asteroidList.length == 0){
				Game.levelCounter++;
				Game.gameRect.levelDisplayCounter = 250;
				Game.makeAsteroids(NUMBER_OF_ASTEROIDS + Game.levelCounter);
				Game.resetShip();
			}

			Game.moveShip(); // only allow the player to move the ship if we are playing and the ship isn't destroyed
			Game.checkShipHit();
		}
	}

    screen.updateScreen();
    
    requestAnimationFrame(Game.animate);
};

//Time to make some Asteroids
Game.makeAsteroids = function(asteroidCount) {
	this.asteroidList = [];

	for (var i = 0; i < asteroidCount; i++)
		this.asteroidList[i] = new AsteroidObject(this.gameRect, MAX_ASTEROID_SIZE, 0, 0, true);
};

Game.moveAsteroids = function() {
	for(var i = 0; i < Game.asteroidList.length; i++) 
		Game.asteroidList[i].moveObject();
};

Game.drawAsteroids = function(ctx, modern, additionalOffsetX, additionalOffsetY) {
	for(var i = 0; i < Game.asteroidList.length; i++) 
		Game.asteroidList[i].drawObject(ctx, modern, additionalOffsetX, additionalOffsetY);
};

Game.moveBullets = function() {
	var expiredBullet = null;
	
	for(var i = 0; i < Game.bulletList.length; i++) {
		if(Game.bulletList[i].lifeTime <= 0) // Check to see if the bullet is still alive
			expiredBullet = i;
	
		Game.bulletList[i].moveObject();
	}

	if(expiredBullet != null)
		Game.bulletList.splice(expiredBullet, 1);
};

Game.drawBullets = function(ctx, modern, additionalOffsetX, additionalOffsetY) {
	for(var i = 0; i < Game.bulletList.length; i++) 
		Game.bulletList[i].drawObject(ctx, modern, additionalOffsetX, additionalOffsetY);
};

Game.moveShip = function() {
	if(gameControls.keyPressed[UP_ARROW_KEY]) // Up arrow
		Game.theShip.accelerateObject(SHIP_ACCELERATION);	
	if(gameControls.keyPressed[LEFT_ARROW_KEY]) // Left arrow
		Game.theShip.rotateObject(-SHIP_ROTATION);
	if(gameControls.keyPressed[RIGHT_ARROW_KEY]) // Right arrow
		Game.theShip.rotateObject(SHIP_ROTATION);
	if(gameControls.keyPressed[FIRE_KEY]) // Space bar
		Game.fire();
};

Game.shipControl = function(x, y) {
	if(Game.isPlaying() && Game.touchButton.state) {
    	if(Game.leftRect.IsClicked(x, y))
    		Game.theShip.rotateObject(-SHIP_ROTATION);
    	else if(Game.thrustRect.IsClicked(x, y))
    		Game.theShip.accelerateObject(SHIP_ACCELERATION);
    	else if(Game.rightRect.IsClicked(x, y))
			Game.theShip.rotateObject(SHIP_ROTATION);
    	else if(Game.fireRect.IsClicked(x, y))
    		Game.fire();
	}    	
}

Game.gameMenu = function(x, y) {
	// Check to see if they clicked the pause button 	
	if(Game.pauseRect.IsClicked(x, y)) 
		Game.togglePause();

	// Start the Game if we are in demo mode
	if(Game.isDemo()) {
		//if(Game.classicRect.IsClicked(x, y)) 
			//Game.switchToPlayState(Game.gameModeEnum.CLASSIC);
	     
		//else 
		if(Game.modernRect.IsClicked(x, y)) 
			Game.switchToPlayState(Game.gameModeEnum.MODERN);
	}

	if(!Game.isPlaying()) {
		if(Game.keyboardButton.IsClicked(x, y)){ 
			Game.keyboardButton.toggleState(); // These are inverse of each other
			Game.touchButton.toggleState();	
		}
		else if(Game.touchButton.IsClicked(x, y)) { 
			Game.keyboardButton.toggleState();
			Game.touchButton.toggleState();
		}
	}
}

/*******************************************/

var gameControls = Object.create(null);
gameControls.keyPressed = {};

gameControls.mouse = new Rect(0,0,0,0);
gameControls.mouse.mouseClick = false;

gameControls.debug = false;
gameControls.FireTimer = 0;

// Assume we are a tablet until we either get a mouse click or keyboard press
gameControls.detectedNonTablet = false;

/*******************************************/

var screen = Object.create(null);

screen.updateScreen = function() {
	var scoreCanvas = document.getElementById("scoreCanvas");
	var gameCanvas = document.getElementById("asteroidCanvas");
//	var oldCanvas = document.getElementById("oldAsteroidCanvas");

	scoreCanvas.width = window.innerWidth;
	scoreCanvas.height = scaleY(Game.scoreRect.height);

	var gameCtx = gameCanvas.getContext("2d");
	var scoreCtx = scoreCanvas.getContext("2d");
//	var oldCtx = oldCanvas.getContext("2d");

/*	if(Game.isDemo())
		oldCanvas.style.display = "inline";
	else
		oldCanvas.style.display = "none";
	
	oldCanvas.style.left = Math.floor(scaleX(300)) + "px";
	oldCanvas.style.top = Math.floor(scaleY(125)) + "px";
	oldCanvas.width = Math.floor(scaleX(400));
	oldCanvas.height = Math.floor(scaleY(200));
	oldCanvas.style.position = "absolute";*/

	Game.checkScreenResize(gameCanvas); 
	
	// Black background
	gameCtx.fillStyle = "#000000";
	gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

//	oldCtx.fillStyle = "#000000";
//	oldCtx.fillRect (0, 0, window.innerWidth, window.innerHeight);

	scoreCtx.fillStyle = "#000000";
	scoreCtx.fillRect (0, 0, window.innerWidth, window.innerHeight);
	
	// Put background image
	if(Game.gameMode == Game.gameModeEnum.MODERN)
		gameCtx.drawImage(Game.backGroundImage, 0, 0, scaleX(Game.gameRect.width), scaleY(Game.gameRect.height));

	// Check to see if the screen is too small to even play
	if(window.innerWidth < MIN_SCREEN_WIDTH || window.innerHeight < MIN_SCREEN_HEIGHT) {
		if(Game.isPlaying())
			Game.togglePause();

		gameCtx.fillStyle = "red";
		gameCtx.textAlign = "center";
		gameCtx.font = scaleText(50);
		gameCtx.textBaseline = "middle";
		gameCtx.fillText("Sorry, screen resolution is too low to play", window.innerWidth/2, window.innerHeight/2);

//		oldCanvas.style.display = "none";
		return;
	}

	// Draw Game area
	Game.gameRect.drawObject(gameCtx);

	Game.pauseRect.drawObject(gameCtx);

	Game.leftRect.drawObject(gameCtx);
	Game.rightRect.drawObject(gameCtx);
	Game.thrustRect.drawObject(gameCtx);
	Game.fireRect.drawObject(gameCtx);

	Game.modernRect.drawObject(gameCtx);

	Game.keyboardButton.drawObject(gameCtx);
	Game.touchButton.drawObject(gameCtx);

	// Draw Score
	Game.scoreRect.drawObject(scoreCtx);
	
	Game.drawAsteroids(gameCtx, Game.gameMode);

	Game.drawBullets(gameCtx, Game.gameMode);

	Game.theShip.drawObject(gameCtx, Game.gameMode);

	/*Game.drawAsteroids(oldCtx, false, 300, 125 - Game.scoreRect.height);

	Game.theShip.drawObject(oldCtx, false, 300, 125 - Game.scoreRect.height);	

	Game.drawBullets(oldCtx, false, 300, 125 - Game.scoreRect.height);*/

	// Display this over the game area
	//Game.classicRect.drawObject(oldCtx, 300, 125 - Game.scoreRect.height);
	
	// Debug information
	if(gameControls.debug){
		gameCtx.fillStyle = "red";
		gameCtx.textAlign = "Left";
		gameCtx.font = scaleText();
		gameCtx.textBaseline = "top";
		gameCtx.textAlign = "left";
		gameCtx.fillText("Game.theShip: " + Math.floor(Game.theShip.x) + " " + Math.floor(Game.theShip.y) + " " + Game.theShip.width + " " + Game.theShip.height + " Shield On:" + " " + Game.theShip.objectPoints + " xVel:" + Math.floor(Game.theShip.xVelocity * 100) / 100 + " yVel:" + Math.floor(Game.theShip.yVelocity * 100) / 100 + " direction:" + Game.theShip.direction + " target angle:" + Game.theShip.targetAngle, scaleX(50) ,scaleY(50));
		gameCtx.fillText("Asteroids: " + Game.asteroidList.length, scaleX(50) ,scaleY(150));
		gameCtx.fillText("gameRect: " + Game.gameRect.x + " " + Game.gameRect.y + " " + Game.gameRect.width + " " + Game.gameRect.height, scaleX(50), scaleY(250));
		gameCtx.fillText("gameState: " + Game.gameState + " Exploding:" + Game.exploding + " Counter:" + Game.explodingCounter, scaleX(50) ,scaleY(300));
		gameCtx.fillText("Pause: " + Game.pauseRect.x + " " + Game.pauseRect.y + " " + Game.pauseRect.width + " " + Game.pauseRect.height , scaleX(50) ,scaleY(350));
		gameCtx.fillText("Mouse Rect: " + gameControls.mouse.left + " " + gameControls.mouse.top + " " + gameControls.mouse.right + " " + gameControls.mouse.bottom , scaleX(50) ,scaleY(400));
		gameCtx.fillText("Mouse click: " + gameControls.mouse.mouseClick, scaleX(50) ,scaleY(450));
		gameCtx.fillText("Automove: " + Game.automove, scaleX(50) ,scaleY(500));
		gameCtx.fillText("XScale: " + Game.xScale + " YScale:" + Game.yScale, scaleX(50) ,scaleY(550));
		gameCtx.fillText("physicalRect: " + Game.physicalRect.left + " " + Game.physicalRect.top + " " + Game.physicalRect.right + " " + Game.physicalRect.bottom, scaleX(50) ,scaleY(600));
		gameCtx.fillText("GameCanvas: " + gameCanvas.width + " " + gameCanvas.height, scaleX(50) ,scaleY(650));
	} 
};

/*******************************************/

function onLoad() {
	// Hide scroll bars
	document.body.style.overflow = "hidden";
	
	//Game.gameRect = new GameObject(0, 75, 1000, 700);

	Game.initDemo();

	Game.animate();  
	
	// Listen for keyboard down events
    document.addEventListener('keydown', function(e) {
    	gameControls.detectedNonTablet = true; // we know we aren't a tablet only interface now

		// Store the key press
    	gameControls.keyPressed[e.keyCode] = true;

		// Check to see if paused
		if(gameControls.keyPressed['P'.charCodeAt(0)]) {
			Game.togglePause();
		}			
    	
	}, false);

    // Listen for keyboard up events
    document.addEventListener('keyup', function(e) {
        // Store that the key was released
     	gameControls.keyPressed[e.keyCode] = false;
    }, false);

 	// Listen for touchscreen events
 	document.addEventListener('touchstart', function(e) {
		e.preventDefault();

		// There can be multiple touches, loop through each of them.
		for(var i = 0; i < e.touches.length; i++) {
			var touch = e.changedTouches[i];
			Game.shipControl(touch.pageX, touch.pageY);
			Game.gameMenu(touch.pageX, touch.pageY);
		}
    }, false);
 	
    document.addEventListener('touchmove', function(e) {
		e.preventDefault();
    	
		// There can be multiple touches, loop through each of them.
		for(var i = 0; i < e.touches.length; i++) {
			var touch = e.changedTouches[i];
			Game.shipControl(touch.pageX, touch.pageY);
			Game.gameMenu(touch.pageX, touch.pageY);
		}
	
    }, false);

 	// Listen for mouse events
    document.addEventListener('mousemove', function(e) {
    	gameControls.detectedNonTablet = true; // we know we aren't a tablet only interface now
    	
    	e.preventDefault();

    	// Store the mouse location
		gameControls.mouse.left = e.clientX;
		gameControls.mouse.top = e.clientY;
    	gameControls.mouse.right = e.clientX;
    	gameControls.mouse.bottom = e.clientY;

    	if(Game.keyboardButton.IsClicked(e.clientX, e.clientY)) 
    		Game.keyboardButton.isHovering = true; 
    	else
    		Game.keyboardButton.isHovering = false;

    	if(Game.touchButton.IsClicked(e.clientX, e.clientY))  
    		Game.touchButton.isHovering = true;
    	else
    		Game.touchButton.isHovering = false;

		Game.shipControl(e.clientX, e.clientY);
    }, false);

    document.addEventListener('mousedown', function(e) {
    	e.preventDefault();
    	
		gameControls.mouse.mouseClick = true;

		Game.shipControl(e.clientX, e.clientY);
    }, false);

    document.addEventListener('mouseup', function(e) {
    	e.preventDefault();
    	
    	gameControls.mouse.mouseClick = false;

    	// Store the mouse location
    	gameControls.mouse.left = e.clientX;
    	gameControls.mouse.top = e.clientY;
    	gameControls.mouse.right = e.clientX;
    	gameControls.mouse.bottom = e.clientY;

		Game.gameMenu(e.clientX, e.clientY);
    }, false);

}