// Constants
const boardWidth = 1000;
const boardHeight = 250;
const pauseDuration = 5000; // Durée de la pause en millisecondes
const invincibleDuration = 10000; // 10 seconds
const speedBoostDuration = 10000; // 10 seconds
const jumpBoostDuration = 10000; // 10 seconds
const lowGravityDuration = 15000; // 15 seconds

// Variables
let board; // Référence le tag canvas
let context; // Contexte de dessin
let pauseStartTime = 0; // Temps de début de la pause
let isPaused = false; // État de la pause
let userInputReceived = false;
let score = 0;
let gameOver = false;
let velocityX = -7; // Vitesse de déplacement des obstacles
let velocityY = 0;
let gravity = 0.65; // Appliqué au perso
let bonusEndTime = 0;
let invincible = false;
let speedBoost = false;
let jumpBoost = false;
let lowGravity = false;

// Perso
const persoWidth = 88;
const persoHeight = 94;
let persoX = 150;
let persoY = boardHeight - persoHeight;
let persoImg = [];
let i = 1; // Compteur pour animer perso
let perso = {
    x: persoX,
    y: persoY,
    width: persoWidth,
    height: persoHeight,
    transformed: false
};

// Remplir le tableau de la sprite sheet
for (let j = 1; j < 9; j++) {
    persoImg[j] = new Image();
    persoImg[j].src = './img/run' + j.toString() + '.png';
}

let transformedImg = new Image();
transformedImg.src = "./img/powerPerso.png";

let persoDeadImg = new Image();
persoDeadImg.src = "./img/virus.png";

// Obstacles
let obstacleArray = [];
const obstacle1Width = 100;
const obstacle2Width = 44;
const obstacle3Width = 100;
const obstacleHeight = 70;
const obstacleX = 950;
const obstacleY = boardHeight - obstacleHeight;
let obstacle1Img = new Image();
obstacle1Img.src = "./img/obstacle1.png";
let obstacle2Img = new Image();
obstacle2Img.src = "./img/obstacle2.png";
let obstacle3Img = new Image();
obstacle3Img.src = "./img/obstacle1.png";

// Power
const powerWidth = 50;
const powerHeight = 50;
const powerY = 60;
const powerX = 950;
let powerImg = new Image();
powerImg.src = "./img/faille.png";

// Functions
window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    setInterval(animatePerso, 100);
    setInterval(placeObstacle, 1000);

    document.addEventListener("keydown", movePerso);
    requestAnimationFrame(update);
};

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        drawPersoDead();
        return;
    }

    if (isPaused) {
        if (Date.now() - pauseStartTime >= pauseDuration || userInputReceived) {
            isPaused = false;
            perso.transformed = false;
            userInputReceived = false;
        } else {
            context.clearRect(0, 0, board.width, board.height);
            context.drawImage(transformedImg, perso.x, perso.y, perso.width, perso.height);
            return;
        }
    }

    context.clearRect(0, 0, board.width, board.height);
    affichageBoost();

    if (Date.now() >= bonusEndTime) {
        resetBonuses();
    }

    velocityY += gravity;
    perso.y = Math.min(perso.y + velocityY, persoY);

    drawPerso();
    drawObstacles();
    drawScore();
    speedGame();
}

function movePerso(e) {
    if (gameOver) {
        drawPersoDead();
        return;
    }
    if ((e.code == "Space" || e.code == "ArrowUp") && perso.y == persoY) {
        velocityY = jumpBoost ? -20 : -15;
    }
}

function placeObstacle() {
    if (gameOver) {
        drawPersoDead();
        return;
    }

    let cat = {
        img: null,
        x: obstacleX,
        y: obstacleY,
        width: null,
        height: obstacleHeight
    };

    let placeChatChance = Math.random();

    if (placeChatChance > .95) {
        cat.img = powerImg;
        cat.width = powerWidth;
        cat.height = powerHeight;
        cat.y = powerY;
    } else if (placeChatChance > .70) {
        cat.img = obstacle1Img;
        cat.width = obstacle1Width;
        cat.height = 79;
    } else if (placeChatChance > .60) {
        cat.img = obstacle2Img;
        cat.width = obstacle2Width;
        cat.height = 125;
    } else if (placeChatChance > .50) {
        cat.img = obstacle3Img;
        cat.width = obstacle3Width;
        cat.height = 79;
    }

    if (cat.img !== null) {
        obstacleArray.push(cat);
    }

    if (obstacleArray.length > 5) {
        obstacleArray.shift();
    }
}

function detectCollision(a, b) {
    if (a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y) {

        if (b.img === powerImg) {
            b.y = -10;
            isPaused = true;
            pauseStartTime = Date.now();
            perso.transformed = true;

            setTimeout(() => {
                let userInput = prompt("Entrez un mot pour obtenir un bonus:");
                if (userInput) {
                    processUserInput(userInput);
                }
                userInputReceived = true;
            }, 100);

            obstacleArray = obstacleArray.filter(cat => cat !== b);
            return false;
        } else {
            return true;
        }
    }
    return false;
}

function processUserInput(input) {
    switch (input.toLowerCase()) {
        case "perso.invincible":
            invincible = true;
            bonusEndTime = Date.now() + invincibleDuration;
            alert("Vous êtes invincible pendant 10 secondes !");
            break;
        case "perso.speedboost":
            speedBoost = true;
            bonusEndTime = Date.now() + speedBoostDuration;
            velocityX *= 2;
            alert("Vous avez un boost de vitesse pendant 10 secondes !");
            break;
        case "perso.jumpboost":
            jumpBoost = true;
            bonusEndTime = Date.now() + jumpBoostDuration;
            alert("Vous sautez plus haut pendant 10 secondes !");
            break;
        case "map.lowgravity":
            lowGravity = true;
            bonusEndTime = Date.now() + lowGravityDuration;
            gravity /= 2;
            alert("La gravité est réduite pendant 10 secondes !");
            break;
        case "perso.addscore":
            score += 1000;
            alert("Vous avez gagné un bonus de 1000 points !");
            break;
        default:
            alert("Aucun bonus obtenu.");
            break;
    }
}

function speedGame() {
    if (score < 1000) {
        velocityX = -8;
    } else if (score < 2000) {
        velocityX = -9;
    } else if (score < 3000) {
        velocityX = -10;
    } else if (score < 4000) {
        velocityX = -11;
    } else if (score < 5000) {
        velocityX = -12;
    } else if (score < 6000) {
        velocityX = -13;
    } else if (score < 7000) {
        velocityX = -14;
    } else if (score < 8000) {
        velocityX = -15;
    } else if (score < 9000) {
        velocityX = -16;
    } else if (score < 10000) {
        velocityX = -17;
    } else if (score < 11000) {
        velocityX = -18;
    } else if (score < 12000) {
        velocityX = -19;
    } else if (score < 13000) {
        velocityX = -20;
    } else if (score < 14000) {
        velocityX = -21;
    } else if (score < 15000) {
        velocityX = -22;
    } else if (score < 16000) {
        velocityX = -23;
    } else if (score < 17000) {
        velocityX = -24;
    }
}

function affichageBoost() {
    let statut = "nul";

    if (invincible) {
        statut = "Invincible";
    } else if (speedBoost) {
        statut = "Speed Boost";
    } else if (jumpBoost) {
        statut = "Jump Boost";
    } else if (lowGravity) {
        statut = "Low Gravity";
    }

    if (statut !== "nul") {
        let gradient = context.createLinearGradient(0, 0, 0, 20);
        gradient.addColorStop(0, "#FF0000");
        gradient.addColorStop(0.2, "#FF7F00");
        gradient.addColorStop(0.4, "#FFFF00");
        gradient.addColorStop(0.6, "#00FF00");
        gradient.addColorStop(0.8, "#87CEEB");
        gradient.addColorStop(1, "#FF7F00");

        context.fillStyle = gradient;
        context.font = "20px Courier";
        context.fillText(statut, 70, 20);
    }
}

function drawPerso() {
    if (perso.transformed) {
        context.drawImage(transformedImg, perso.x, perso.y, perso.width, perso.height);
    } else {
        context.drawImage(persoImg[i], perso.x, perso.y, perso.width, perso.height);
    }
}

function drawPersoDead() {
    persoDeadImg.onload = function () {
        context.clearRect(0, 0, board.width, board.height);
        context.drawImage(persoDeadImg, perso.x, perso.y, perso.width, perso.height);
    };
}

function drawObstacles() {
    for (let i = 0; i < obstacleArray.length; i++) {
        let cat = obstacleArray[i];
        cat.x += velocityX;
        context.drawImage(cat.img, cat.x, cat.y, cat.width, cat.height);

        if (detectCollision(perso, cat)) {
            if (cat.img === powerImg) {
                score += 500;
                obstacleArray.splice(i, 1);
                i--;
            } else if (!invincible) {
                gameOver = true;
                drawPersoDead();
            }
        }
    }
}

function drawScore() {
    let gradient = context.createLinearGradient(0, 0, 0, 20);
    gradient.addColorStop(0, "#FF0000");
    gradient.addColorStop(0.2, "#FF7F00");
    gradient.addColorStop(0.4, "#FFFF00");
    gradient.addColorStop(0.6, "#00FF00");
    gradient.addColorStop(0.8, "#87CEEB");
    gradient.addColorStop(1, "#FF7F00");

    context.fillStyle = gradient;
    context.font = "20px Courier";
    score += speedBoost ? 2 : 1;
    context.fillText(score, 5, 20);
}

function resetBonuses() {
    if (speedBoost) {
        velocityX = speedGame();
        speedBoost = false;
    }
    if (lowGravity) {
        gravity *= 2;
        lowGravity = false;
    }
    invincible = false;
    jumpBoost = false;
}

function animatePerso() {
    i++;
    if (i >= 9) {
        i = 1;
    }
    context.clearRect(perso.x, perso.y, perso.width, perso.height);
    context.drawImage(persoImg[i], perso.x, perso.y, perso.width, perso.height);
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        let menu = document.getElementById('menu');
        menu.classList.toggle('hidden');
    }
});

document.getElementById('resume').addEventListener('click', function() {
    document.getElementById('menu').classList.add('hidden');
});

document.getElementById('quit').addEventListener('click', function() {
    window.location.href = './index.html';
    document.getElementById('menu').classList.add('hidden');
});
