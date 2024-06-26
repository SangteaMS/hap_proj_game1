var canvas, canvasContext;


var ballX = 400;
var ballSpeedX = 0;
var ballY = 530;
var ballSpeedY = 0;

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const PADDLE_DIST_FROM_EDGE = 60;
var paddleX = 350;


var mouseX;
var mouseY;


const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 20;
const BRICK_COLS = 10;
const BRICK_GAP = 2;
const BRICK_ROWS = 17;
var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
var bricksLeft = 0;


var maximumScore = 0;
var playerScore = 0;
var attempts = 5;
var playerAttempts = attempts;
var showEndingScreen = false;

function updateMousePosition(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;

  mouseX = evt.clientX - rect.left - root.scrollLeft;
  mouseY = evt.clientY - rect.top - root.scrollTop;

  paddleX = mouseX - (PADDLE_WIDTH/2);

  
}

function handleMouseClick(evt) {
  if(showEndingScreen) {
    playerScore = 0;
    maximumScore = 0;
    playerAttempts = attempts;
    brickReset();
    ballReset();
    showEndingScreen = false;
  }

  if(ballSpeedX == 0 && ballSpeedY == 0) {
    ballSpeedX = 0;
    ballSpeedY = -5;
  }
}

window.onload = function() {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');

  var framesPerSecond = 30;
  setInterval(updateAll, 1000/framesPerSecond);

  canvas.addEventListener('mousedown', handleMouseClick);

  canvas.addEventListener('mousemove', updateMousePosition);

  brickReset();
}

function updateAll() {
  moveAll();
  drawAll();
}

function ballReset() {
  if(playerAttempts <= 0) {
    showEndingScreen = true;
  }

  ballX = canvas.width/2;
  ballY = 400;

  ballSpeedX = 0;
  ballSpeedY = 5;
}

function ballMovement() {
  ballX += ballSpeedX;

  //right
  if(ballX > canvas.width && ballSpeedX > 0.0) {
    ballSpeedX *= -1;
  }

  //left
  if(ballX < 0 && ballSpeedX < 0.0) {
    ballSpeedX *= -1;
  }

  ballY += ballSpeedY;

  // bottom
  if(ballY > canvas.height) {
    playerAttempts--;
    ballReset();
  }


  if(ballY < 0 && ballSpeedY < 0.0) {
    ballSpeedY *= -1;
  }
}

function isBrickAtColRow(col, row) {
  if(col >= 0 && col < BRICK_COLS && row >= 0 && row < BRICK_ROWS) {
    var brickIndexUnderCoord = rowColToArrayIndex(col, row);
    return brickGrid[brickIndexUnderCoord];
  } else {
    return false;
  }
}

function ballBrickCollision() {
  var ballBrickCol = Math.floor(ballX / BRICK_WIDTH);
  var ballBrickRow = Math.floor(ballY / BRICK_HEIGHT);
  var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

  if(ballBrickCol >= 0 && ballBrickCol < BRICK_COLS && ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS) {
    if(isBrickAtColRow(ballBrickCol, ballBrickRow)) {
      brickGrid[brickIndexUnderBall] = false;
      bricksLeft--; 
      console.log(bricksLeft);
      playerScore += 10;
      console.log(playerScore);

      var previousBallX = ballX - ballSpeedX;
      var previousBallY = ballY - ballSpeedY;
      var previousBrickCol =  Math.floor(previousBallX / BRICK_WIDTH);
      var previousBrickRow = Math.floor(previousBallY / BRICK_HEIGHT);

      var bothTestsFailed = true;

      if(previousBrickCol != ballBrickCol) {
        if(isBrickAtColRow(previousBrickCol, ballBrickRow) == false) {
          ballSpeedX *= -1;
          bothTestsFailed = false;
        }
      }

      if(previousBrickRow != ballBrickRow) {
        if(isBrickAtColRow(previousBrickCol, ballBrickRow) == false) {
          ballSpeedY *= -1;
          bothTestsFailed = false;
        }
      }

      if(bothTestsFailed) {
        ballSpeedX *= -1;
        ballSpeedY *= -1;
      }
    }
  }
}

function ballPaddleCollision() {
  var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
  var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_HEIGHT;
  var paddleLeftEdgeX = paddleX;
  var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

  if(ballY+10 > paddleTopEdgeY && 
     ballY < paddleBottomEdgeY &&
     ballX+10 > paddleLeftEdgeX && 
     ballX-10 < paddleRightEdgeX) {

    ballSpeedY *= -1;

    var centerOfPaddleX = paddleX + PADDLE_WIDTH/2;
    var ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
    ballSpeedX = ballDistFromPaddleCenterX * 0.35;

    if(bricksLeft == 0) {
     
      showEndingScreen = true;
    }
  }
}

function moveAll() {
  if(showEndingScreen) {
    return;
  }

  ballMovement();

  ballBrickCollision();

  ballPaddleCollision();
}

function brickReset() {
  bricksLeft = 0;

  var i;

  for(i = 0; i < 3 * BRICK_COLS; i++) {
    brickGrid[i] = false;
  }

  for(; i < BRICK_COLS * BRICK_ROWS; i++) {
    if(Math.random() < 0.5) {
      brickGrid[i] = true;
      bricksLeft++;
      maximumScore += 10;
    }else {
      brickGrid[i] = false;
    }
  }
  console.log(maximumScore);
}

function rowColToArrayIndex(col, row) {
  return col + row * BRICK_COLS;
}

function drawBricks() {
  for(var eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
    for(var eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
      var arrayIndex = rowColToArrayIndex(eachCol, eachRow);

      if(brickGrid[arrayIndex]) {
        rect((BRICK_WIDTH*eachCol), BRICK_HEIGHT*eachRow, BRICK_WIDTH-BRICK_GAP, BRICK_HEIGHT-BRICK_GAP, 'black');
      }
    }
  }
}

function drawAll() {

  rect(0, 0, canvas.width, canvas.height, 'white');

  if(showEndingScreen) {
    if(playerScore == maximumScore) {
      text("YOU WIN!", canvas.width/2, 100, 'black', 'bold 3em Arial', 'center');
      text("SCORE: " + playerScore, canvas.width/2, 250, 'black', 'bold 2em Arial', 'center');
      text("ATTEMPTS: " + playerAttempts, canvas.width/2, 400, 'black', 'bold 2em Arial', 'center');
      text("Click to continue", canvas.width/2, 550, 'black', 'bold 1.5em Arial', 'center');
    } else {
      text("YOU LOSE!", canvas.width/2, 100, 'black', 'bold 3em Arial', 'center');
      text("SCORE: " + playerScore, canvas.width/2, 250, 'black', 'bold 2em Arial', 'center');
      text("ATTEMPTS: " + playerAttempts, canvas.width/2, 400, 'white', 'bold 2em Arial', 'center');
      text("Click to continue", canvas.width/2, 550, 'black', 'bold 1.5em Arial', 'center');
    }
    return;
  }


  circle(ballX, ballY, 10, 'black');


  rect(paddleX, canvas.height-PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_HEIGHT, 'black');


  drawBricks();

  var mouseBrickCol = Math.floor(mouseX / BRICK_WIDTH);
  var mouseBrickRow = Math.floor(mouseY / BRICK_HEIGHT);
  var brickIndexUnderMouse = rowColToArrayIndex(mouseBrickCol, mouseBrickRow);
  text(mouseBrickCol + "," + mouseBrickRow + ":" + brickIndexUnderMouse, mouseX, mouseY, 'white', '12px Arial');

  text("Score: " + playerScore, 10, 30, 'black', 'bold 1.4em monospace', 'left');
  text("Attempts: " + playerAttempts, 673, 30, 'black', 'bold 1.4em monospace', 'left');
}

function rect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function circle(centerX, centerY, radius, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
  canvasContext.fill();
}

function text(showWords, textX, textY, fillColor, fontSizeStyle, textAlignment) {
  canvasContext.fillStyle = fillColor;
  canvasContext.font = fontSizeStyle;
  canvasContext.textAlign = textAlignment;
  canvasContext.fillText(showWords, textX, textY);
}