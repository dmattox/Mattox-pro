/**
 * 
 */

"use strict";

/*******************************************/

//Use var instead of const to prevent name pollution

var MAX_SEARCH_TIME = 5000;

function Point(col, row) {
	this.col = col;
	this.row = row;
}

function timeLeft(turnStartTime) {
	var currentTime = new Date().getTime() - turnStartTime;

	return MAX_SEARCH_TIME - currentTime;
}

/*******************************************/

function Rect(left, top, right, bottom){
	this.setRect(left, top, right, bottom);
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
}

function intersection(r1, r2) {
	return r1.left < r2.right  && r1.right  > r2.left &&
		   r1.top  < r2.bottom && r1.bottom > r2.top; 
}

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

function scaleRect(originalRect)
{
	return new Rect(originalRect.left * game.xScale, originalRect.top * game.yScale, originalRect.right * game.xScale, originalRect.bottom * game.yScale);
}

function scaleX(x)
{
	return Math.floor(x * game.xScale);
}

function scaleY(y)
{
	return Math.floor(y * game.yScale);
}

function scaleText(additionalFactor) {
    var baseFactor = 25;

    if(additionalFactor != null)
        baseFactor += additionalFactor; 
     
	var scale;

	if(game.xScale < game.yScale)
		scale = game.xScale;
	else
		scale = game.yScale;

	return Math.floor(baseFactor  * scale) + "px Consolas";
}

/*******************************************/

function GameObject(left, top, right, bottom) {
	Rect.call(this, left, top, right, bottom);
}

GameObject.prototype = Object.create(Rect.prototype);
GameObject.prototype.contructor = GameObject;

GameObject.prototype.draw = function(ctx, color) {
	ctx.beginPath();

	// Default a color if nothing is passed in
	if(color==null)
		ctx.strokeStyle = 'black';
	else
		ctx.strokeStyle = color;
	
	ctx.lineWidth = "5";
	ctx.rect(scaleX(this.left), scaleY(this.top), scaleX(this.width()), scaleY(this.height()));
	ctx.stroke();	
};