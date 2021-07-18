const canvas = document.getElementById("gameFrame");
const ctx = canvas.getContext("2d");

// Sound effects from https://mixkit.co/free-sound-effects/arcade/?page=1
var gameOverSound = new Audio('gameOver.wav');
var enemySpawnSound = new Audio('enemySpawn.wav');

let key = 0;
let frequency = 1000;

let size = 10;
let inertia = 5;

let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;
let gameEnd = false;

function boundryCheck(player) {
    //up
    if (player.y < 0) {
        player.y = 0;
    }
    //down
    if (player.y > canvas.height - player.size) {
        player.y = canvas.height - player.size;
    }
    //left
    if (player.x < 0) {
        player.x = 0;
    }
    //right
    if (player.x > canvas.width - player.size) {
        player.x = canvas.width - player.size;
    }
}

class Player {
    constructor(x, y, size, velocity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        boundryCheck(this);

        if (upPressed) {
            this.y = this.y - this.velocity;
            inertia = 5;
        }
        if (downPressed) {
            this.y = this.y + this.velocity;
            inertia = 5;
        }
        if (leftPressed) {
            this.x = this.x - this.velocity;
            inertia = 5;
        }
        if (rightPressed) {
            this.x = this.x + this.velocity;
            inertia = 5;
        }

        if (inertia > 0) {
            if (key == 38) {
                this.y = this.y - inertia;
            }
            if (key == 40) {
                this.y = this.y + inertia;
            }
            if (key == 37) {
                this.x = this.x - inertia;
            }
            if (key == 39) {
                this.x = this.x + inertia;
            }
            inertia -= 0.1;
        }
    }
}

class Enemy {
    constructor(x, y, size, colour, velocity, direction) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.colour = colour;
        this.velocity = velocity;
        this.direction = direction;
        enemySpawnSound.play();
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.draw();

        switch (this.direction) {
            case 0: // left to right
                this.x = this.x + this.velocity;
                break;
            case 1: // right to left
                this.x = this.x - this.velocity;
                break;
            case 2: // top to bottom
                this.y = this.y + this.velocity;
                break;
            case 3: // bottom to top
                this.y = this.y - this.velocity;
                break;
        }
    }
}

document.body.addEventListener("keydown", keyDown);
document.body.addEventListener("keyup", keyUp);

function keyDown(event) {
    key = event.keyCode;
    //up
    if (event.keyCode == 38) {
        upPressed = true;
    }
    //down
    if (event.keyCode == 40) {
        downPressed = true;
    }
    //left
    if (event.keyCode == 37) {
        leftPressed = true;
    }
    //right
    if (event.keyCode == 39) {
        rightPressed = true;
    }
    //enter
    if (event.keyCode == 13 && gameEnd) {
        location.reload();
    }
}

function keyUp(event) {
    //up
    if (event.keyCode == 38) {
        upPressed = false;
    }
    //down
    if (event.keyCode == 40) {
        downPressed = false;
    }
    //left
    if (event.keyCode == 37) {
        leftPressed = false;
    }
    //right
    if (event.keyCode == 39) {
        rightPressed = false;
    }
}

const player = new Player(100, 100, size, inertia);
const enemies = [];

var timer;
var spawnRate;

function gameTime() {
    var time = 0;
    timer = setInterval(() => {
        time += 1;
        document.getElementById('gameTime').innerHTML =
            '<p>Time: ' + (time / 10) + " s";

        if ((time / 10) % 2 == 0 && frequency > 10) {
            frequency -= 20;
            console.log(frequency);
            clearInterval(spawnRate);
            spawnEnemies();
        }
    }, 100);
}

function spawnEnemies() {
    spawnRate = setInterval(() => {
        var enemyDirection = Math.floor(Math.random() * 4);
        var x = Math.floor(Math.random() * canvas.width);
        var y = Math.floor(Math.random() * canvas.height);
        var velocity = Math.floor(Math.random() * 5) + 1;
        var colour = '#' + Math.floor(Math.random() * 16777215).toString(16);

        switch (enemyDirection) {
            case 0: // left to right
                enemies.push(new Enemy(0, y, size, colour, velocity, enemyDirection));
                break;
            case 1: // right to left
                enemies.push(new Enemy(canvas.width - size, y, size, colour, velocity, enemyDirection));
                break;
            case 2: // top to bottom
                enemies.push(new Enemy(x, 0, size, colour, velocity, enemyDirection));
                break;
            case 3: // bottom to top
                enemies.push(new Enemy(x, canvas.height - size, size, colour, velocity, enemyDirection));
                break;
        }
    }, frequency);
}

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    player.update();

    enemies.forEach((enemy, index) => {
        enemy.update();

        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (distance - (enemy.size / 2) - player.size < 0) {
            setTimeout(() => {
                gameOverSound.play();
                cancelAnimationFrame(animationId);

                document.getElementById('gameover').innerHTML = 
                '<p>Game over</p><button type="button" id="playAgain" onClick="location.reload()">Play Again</button>';
                clearInterval(timer);
                clearInterval(spawnRate);
                gameEnd = true;
            }, 25);
        }

        if (enemy.x + enemy.size < 0 || enemy.x - enemy.size > canvas.width ||
            enemy.y + enemy.size < 0 || enemy.y - enemy.size > canvas.height) {
            setTimeout(() => {
                enemies.splice(index, 1);
            }, 0);
        }
    });
}

animate();
spawnEnemies();
gameTime();
document.getElementById('gameObjective').innerHTML = "<p>Task: Avoid the polygons. Use arrow keys</p>";