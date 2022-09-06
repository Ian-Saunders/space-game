// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;
document.body.appendChild(canvas);
var rect = canvas.getBoundingClientRect();


var px=295;
var py=215;



canvas.addEventListener("touchmove", function (e) {
px = e.touches[0].clientX-rect.left-25;
py = e.touches[0].clientY-rect.top-25;	
},
false);


// Update game objects/////////////////////////////////////////////////////  UPDATE
var update = function (modifier) {
	

	
};


// Draw everything///////////////////////////
var render = function () {

	ctx.fillStyle = "rgb(0, 0, 255)";
	ctx.fillRect(0, 0, 640, 480);
	ctx.fillStyle = "rgb(255, 255, 255)";
	
	ctx.fillRect(px, py, 50, 50);	
	
	
};

// The main game loop///////////////////////////////////////////////////////////////////////////////////   MAIN
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};


// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;


// Let's play this game!////////////////////////////////////////////////////////////////////////////////// START
var then = Date.now();

//reset();
main();