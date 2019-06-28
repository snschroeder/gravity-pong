//define canvas dims
let WIDTH = 1200; 
let HEIGHT = 600; 

//keycodes for EventListener
let upArrow = 38;
let spaceBar = 32;

//initialize canvas bits
let canvas; 
let ctx; 
let keystate; 

//initialize players and ball objects
let player; 
let player2;
let ball; 
let defaultPlayerHeight = 100;

//set global variables for physics
let pi = Math.PI;
let Cd = 0.75;
let rho = 1.22;
let A = 20;
let gravity = 9.81;
let frameRate = 1/40;
let frameDelay = frameRate * 1000;



function playerConstructor(startX, startY, keyControl) {
    this.x = startX;
    this.y = startY;
    this.height = 100;
    this.width = 20;
    this.mass = 10;
    this.restitution = -0.2;
    this.velocity = {x: 0, y: 0};
    this.jumpPower = 20;
    this.score = 0;

    this.draw = function() {
        ctx.fillRect(this.x + this.velocity.x, this.y + this.velocity.y, this.width, this.height);
    }
    this.update = function() {
        if (keystate[keyControl]) {
            this.velocity.y -= this.jumpPower * frameRate;
        }
    }
};

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
        if (detectBallCollision(paddle.x, paddle.y, paddle.width, paddle.height, this.position.x, this.position.y, this.side, this.side)) {
            this.position.x = paddle === player ? player.x + player.width : player2.x - this.side;
            let n = (this.position.y + this.side - paddle.y)/(paddle.height + this.side);
            let phi = 0.25 * pi * (2 * n - 1); // pi/4 = 45 degree angle
            this.velocity.x = (paddle===player ? 1 : -1) * this.speed * Math.cos(phi);
            this.velocity.y = this.speed * Math.sin(phi);
        }
    },
    draw: function() {
        ctx.fillRect(this.position.x, this.position.y, this.side, this.side);
    }
}

function reset() {
    if (ball.position.x < 0 - ball.side || ball.position.x > WIDTH) {
        if (ball.position.x < 0) {
            player2.score++;
            ball.velocity.x = ball.speed;
        }
        else {
            player.score++;
            ball.velocity.x = ball.speed *-1;
        }

        console.log(player.score + " " + player2.score);
        ball.position.x = (WIDTH - ball.side) *0.5;
        ball.position.y = (HEIGHT - ball.side) *0.5;
    }
}

function createCanvas() { 
    canvas = document.createElement("canvas"); 
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext("2d"); 
    document.body.appendChild(canvas); 
}

function drawNet() {
    let width = 4; 
    let x = (WIDTH - width) *0.5; 
    let y = 0; 
    let stepSize = HEIGHT/15; 

    while (y < HEIGHT) { 
        ctx.fillRect(x, y, width, stepSize *0.5); 
        y += stepSize; 
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
    player = new playerConstructor(20, ((HEIGHT - defaultPlayerHeight)/2), spaceBar);
    player2 = new playerConstructor((WIDTH -40), ((HEIGHT - defaultPlayerHeight) /2), upArrow);
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
    playerObj.y += playerObj.velocity.y * frameRate * 100;
}

function detectCollision(playerObj) {
    if (playerObj.y > HEIGHT - playerObj.height) {
        playerObj.velocity.y *= playerObj.restitution;
        playerObj.y = HEIGHT - player.height;
    }
    if (playerObj.y < 0) {
        playerObj.velocity.y *= playerObj.restitution;
        playerObj.y = 0;
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
        reset();
        
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