// Copyright 2016 David Mattox  
// Usage of sections of code is granted to use in other projects under fair use

/*******************************************/

function Rect(left, top, right, bottom){
	this.setRect(left, top, right, bottom);
} 

function intersection(r1, r2) {
	return r1.left < r2.right  && r1.right  > r2.left &&
		   r1.top  < r2.bottom && r1.bottom > r2.top; 
}

Rect.prototype.setRect = function(left, top, right, bottom) {
	this.left = left;
	this.top = top;
	this.right = right;
	this.bottom = bottom;

	// lets store the original locations
	this.originalLeft = left;
	this.originalTop = top;
	this.originalRight = right;
	this.originalBottom = bottom;
};

Rect.prototype.reset = function() {
	this.left = this.originalLeft;
	this.top = this.originalTop;
	this.right = this.originalRight;
	this.bottom = this.originalBottom;
};

Rect.prototype.width = function() {
	return this.right - this.left;
};

Rect.prototype.height = function() {
	return this.bottom - this.top;
};

function ScaleRect(originalRect)
{
	return new Rect(originalRect.left * Game.xScale, originalRect.top * Game.yScale, originalRect.right * Game.xScale, originalRect.bottom * Game.yScale);
}

function scaleX(x)
{
	return Math.floor(x * Game.xScale);
}

function scaleY(y)
{
	return Math.floor(y * Game.yScale);
}

function scaleText(additionalFactor) {
    var baseFactor = 25;

    if(additionalFactor > 0)
        baseFactor += additionalFactor; 
     
	var scale;

	if(Game.xScale < Game.yScale)
		scale = Game.xScale;
	else
		scale = Game.yScale;

	return Math.floor(baseFactor  * scale) + "px Comic Sans MS";
}

/*******************************************/
 
function Point(x, y) {
	this.x = x;
	this.y = y;
}

function distance(point1, point2) {
	return distanceXY(point1.x, point1.y, point2.x, point2.y);
}

function distanceXY(x1, y1, x2, y2) {	
	// Need to take the wrapping board into account
	var minX = Math.min(x1, x2);
	var maxX = Math.max(x1, x2);
	var minY = Math.min(y1, y2);
	var maxY = Math.max(y1, y2);

	var xDistance;
	if(maxX - minX < Math.abs(minX - (maxX - Game.gameRect.width)))
		xDistance = maxX - minX;
	else
		xDistance = Math.abs(minX - (maxX - Game.gameRect.width));

	var yDistance;
	if(maxY - minY < Math.abs(minY - (maxY - Game.gameRect.height)))
		yDistance = maxY - minY;
	else
		yDistance = Math.abs(minY - (maxY - Game.gameRect.height));
	
	return Math.sqrt(xDistance * xDistance + yDistance*yDistance);
}

function mod(n, m) {
    return ((n % m) + m) % m;
}
