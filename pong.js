let WIDTH = 1200; //width for canvas play area
let HEIGHT = 600; //height for canvas play area

let upArrow = 38;
let downArrow = 40;
let spaceBar = 32;

let pi = Math.PI;

let canvas; //initialize canvas variable - canvas is an html container for JS to draw graphics on the fly
let ctx; //initialize variable to store and manipulate canvas content
let keystate; //initialize an object to track keystate

let player; //initialize player object
let ai; // initialize ai object
let ball; //initialize ball object

let Cd = 0.47;
let rho = 1.22;
let A = 20;
let gravity = 9.81;
let frameRate = 1/40;
let frameDelay = frameRate * 1000;

player = {
    position: {x: null, y: null},
    height: 100,
    width: 20,
    mass: 10,
    restitution: -0.2,
    velocity: {x: 0, y: 0},
    jumpPower: 20,

    draw: function() {
        ctx.fillRect(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.width, this.height);
    },

    update: function() {
        if (keystate[spaceBar]) {
            this.velocity.y -= this.jumpPower * frameRate;
        }
    }
};

player2 = {
    position: {x: null, y: null},
    height: 100,
    width: 20,
    mass: 10,
    restitution: -0.2,
    velocity: {x: 0, y: 0},
    jumpPower: 20,

    draw: function() {
        ctx.fillRect(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.width, this.height);
    },

    update: function() {
        if (keystate[upArrow]) {
            this.velocity.y -= this.jumpPower * frameRate;
        }
    }
}

ball = {
    position : {x: null, y: null},
    side: 20,
    speed: 6,
    velocity: {x: null, y: null},

    update: function() {

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (0 > this.position.y || this.position.y + this.side > HEIGHT) {
            let offset = this.velocity.y < 0 ? 0 - this.position.y : HEIGHT - (this.position.y + this.side);
            this.position.y += 2* offset;
            this.velocity.y *= -1;
        }

        let paddle = this.velocity.x < 0 ? player : player2;
        if (detectBallCollision(paddle.position.x, paddle.position.y, paddle.width, paddle.height, this.position.x, this.position.y, this.side, this.side)) {

            this.position.x = paddle === player ? player.position.x + player.width : player2.position.x - this.side;
            let n = (this.position.y + this.side - paddle.position.y)/(paddle.height + this.side);
            let phi = 0.25 * pi * (2 * n - 1); // pi/4 = 45 degree angle
            this.velocity.x = (paddle===player ? 1 : -1) * this.speed * Math.cos(phi);
            this.velocity.y = this.speed * Math.sin(phi);
        }
    },

    draw: function() {
        ctx.fillRect(this.position.x, this.position.y, this.side, this.side);
    }
}

function createCanvas() { //function to create the canvas
    canvas = document.createElement("canvas"); //creates an HTML element - must be inserted with [element].appendChild(elem) or [element].insertBefore(elem)
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext("2d"); //provides 2D rendering context for canvas, which allows us to draw shapes
    document.body.appendChild(canvas); //appends the canvas element we created to the body of our HTML document
}

function drawNet() {
    let width = 4; //net width
    let x = (WIDTH - width) *0.5; //sets the x position for the net in the center of the screen
    let y = 0; //sets starting y position at the top of the screen
    let stepSize = HEIGHT/15; //steps between segments of net - dividing height by a larger number creates smaller segments of net

    while (y < HEIGHT) { //loops from top to bottom drawing the net as it goes
        ctx.fillRect(x, y, width, stepSize *0.5); //creates a rectangle on the canvas element at the current x, y position. The rect is 4 wide and a portion of stepSize tall. The closer stepSize gets to one, the smaller the gaps between segments
        y += stepSize; //increase y value by stepSize so that the next segment draws below the previous one
    }
}

function draw() {
    
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    ctx.fillStyle = "#fff";

    drawNet();
    player.draw();
    player2.draw();
    ball.draw();

    ctx.restore();
}

function init() {
    initBall();
    initPlayer();
    initPlayer2();
}

function initPlayer() {
    player.position.x = 20;
    player.position.y = (HEIGHT - player.height)/2;
}

function initPlayer2() {
    player2.position.x = WIDTH -40;
    player2.position.y = (HEIGHT - player2.height) /2;
}

function initBall() {
    ball.position.x = (WIDTH - ball.side) * 0.5;
    ball.position.y = (HEIGHT - ball.side) * 0.5;

    ball.velocity.x = ball.speed;
    ball.velocity.y = 0;
}


function eventListener() {
    keystate = {};

    document.addEventListener("keydown", function(event) {
        keystate[event.keyCode] = true;
    });
    document.addEventListener("keyup", function(event) {
        delete keystate[event.keyCode];
    });
}

function doPhysics(playerObj) {
    let Fy = -0.5 * Cd * A * rho * playerObj.velocity.y * playerObj.velocity.y / Math.abs(playerObj.velocity.y);
    Fy = (isNaN(Fy) ? 0 : Fy);
    let ay = gravity + (Fy / playerObj.mass);
    playerObj.velocity.y += ay * frameRate;
    playerObj.position.y += playerObj.velocity.y * frameRate * 100;

}

function detectCollision(playerObj) {
    if (playerObj.position.y > HEIGHT - playerObj.height) {
        playerObj.velocity.y *= playerObj.restitution;
        playerObj.position.y = HEIGHT - player.height;
    }

    if (playerObj.position.y < 0) {
        playerObj.velocity.y *= playerObj.restitution;
        playerObj.position.y = 0;
    }
}

function detectBallCollision(paddleX, paddleY, paddleW, paddleH, ballX, ballY, ballW, ballH) {
    return paddleX < ballX + ballW && paddleY < ballY + ballH && ballX < paddleX + paddleW && ballY < paddleY + paddleH;
}

function main() {

    createCanvas();
    eventListener();
    init();

    let loop = function() {

        ball.update();
        player.update();
        player2.update();
        
        draw();

        doPhysics(player);
        doPhysics(player2);
        detectCollision(player);
        detectCollision(player2);

        window.requestAnimationFrame(loop, canvas)
    };
    window.requestAnimationFrame(loop, canvas);
}

main();