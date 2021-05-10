"use strict";

var gl;
var u_ColorLoc;
var u_ctMatrixLoc;
var u_ctMatrixHandLoc;
var u_textureSamplerLoc;
var theta = 0.0;
var u_vCenterLoc;
var canvas;
var program;

// Initial Setup Info
var Name;

// Chips
var chipVertices;
var markerVertices;
var chipOnePrimary;
var chipOneSecondary;
var chipFivePrimary;
var chipFiveSecondary;
var chipTenPrimary;
var chipTenSecondary;
var chipTwoFivePrimary;
var chipTwoFiveSecondary;
var matOne;
var matFive;
var matTen;
var matTwoFive;
var chipXCenterOne, chipYCenterOne;
var chipXCenterFive, chipYCenterFive;
var chipXCenterTen, chipYCenterTen;
var chipXCenterTwoFive, chipYCenterTwoFive;
var chipMoveOne = false;
var chipMoveFive = false;
var chipMoveTen = false;
var chipMoveTwoFive = false;
var scalingOutOne = 0.2;
var scalingMarkerOne = 0.03;
var scalingOutFive = 0.2;
var scalingMarkerFive = 0.03;
var scalingOutTen = 0.2;
var scalingMarkerTen = 0.03;
var scalingOutTwoFive = 0.2;
var scalingMarkerTwoFive = 0.03;

var chipsBuffer;
var a_vPositionLoc;

// Selection bouncing
var isClicked = false;

// Bets
var position = 0;
var betScaleOut = 0.1;
var betScaleMarker = 0.015;
var betValues = [];
var betAreaMat;
var betAreaColor = vec3(255 / 255, 230 / 255, 0 / 255);
var feltColor = vec3(27 / 255, 149 / 255, 27 / 255);
var betAreaWideVertices;
var betAreaTallVertices;
var currentBet = 0;
var userStack;
var originalStack;

// Gameplay
var state = 0;
var controllerState = 0;
var u_ControllerStateLoc;
var u_ColorStateLoc;
var bet = 0;
var tally = 0;

// Cards
// Logic Porting Over From Outside Work
var numVertices = 144;
var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];
var texture;
var playerCard1;
var playerCard2;
var dealerCard1;
var dealerCard2;
var playerCardCount;
var dealerCardCount;
var currentCards = [];
var max = 52;

//Card Texture Images
var cards = [
  "2CImage",
  "2DImage",
  "2HImage",
  "2SImage",
  "3CImage",
  "3DImage",
  "3HImage",
  "3SImage",
  "4CImage",
  "4DImage",
  "4HImage",
  "4SImage",
  "5CImage",
  "5DImage",
  "5HImage",
  "5SImage",
  "6CImage",
  "6DImage",
  "6HImage",
  "6SImage",
  "7CImage",
  "7DImage",
  "7HImage",
  "7SImage",
  "8CImage",
  "8DImage",
  "8HImage",
  "8SImage",
  "9CImage",
  "9DImage",
  "9HImage",
  "9SImage",
  "10CImage",
  "10DImage",
  "10HImage",
  "10SImage",
  "JCImage",
  "JDImage",
  "JHImage",
  "JSImage",
  "QCImage",
  "QDImage",
  "QHImage",
  "QSImage",
  "KCImage",
  "KDImage",
  "KHImage",
  "KSImage",
  "ACImage",
  "ADImage",
  "AHImage",
  "ASImage",
  "backImage",
];

var texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)];

//Texture Verts
var cardVertices = [
  vec4(-0.75, -0.75, 0.0, 1.0),
  vec4(-0.75, -0.25, 0.0, 1.0),
  vec4(-0.25, -0.25, 0.0, 1.0),
  vec4(-0.25, -0.75, 0.0, 1.0),
  vec4(-0.75, -0.75, 0.0, 1.0),
  vec4(-0.75, -0.25, 0.0, 1.0),
  vec4(-0.25, -0.25, 0.0, 1.0),
  vec4(-0.25, -0.75, 0.0, 1.0),
  // second card
  vec4(-0.5, -0.5, 0.0, 1.0),
  vec4(-0.5, 0.0, 0.0, 1.0),
  vec4(0.0, 0.0, 0.0, 1.0),
  vec4(0.0, -0.5, 0.0, 1.0),
  vec4(-0.5, -0.5, 0.0, 1.0),
  vec4(-0.5, 0.0, 0.0, 1.0),
  vec4(0.0, 0.0, 0.0, 1.0),
  vec4(0.0, -0.5, 0.0, 1.0),
  // third card
  vec4(0.25, 0.25, 0.0, 1.0),
  vec4(0.25, 0.75, 0.0, 1.0),
  vec4(0.75, 0.75, 0.0, 1.0),
  vec4(0.75, 0.25, 0.0, 1.0),
  vec4(0.25, 0.25, 0.0, 1.0),
  vec4(0.25, 0.75, 0.0, 1.0),
  vec4(0.75, 0.75, 0.0, 1.0),
  vec4(0.75, 0.25, 0.0, 1.0),
  // fourth card
  vec4(0.5, 0.5, 0.0, 1.0),
  vec4(0.5, 1.0, 0.0, 1.0),
  vec4(1.0, 1.0, 0.0, 1.0),
  vec4(1.0, 0.5, 0.0, 1.0),
  vec4(0.5, 0.5, 0.0, 1.0),
  vec4(0.5, 1.0, 0.0, 1.0),
  vec4(1.0, 1.0, 0.0, 1.0),
  vec4(1.0, 0.5, 0.0, 1.0),
];

var vertexColors = [
  vec4(1.0, 1.0, 1.0, 1.0), // black
  vec4(1.0, 1.0, 1.0, 1.0), // red
  vec4(1.0, 1.0, 1.0, 1.0), // yellow
  vec4(1.0, 1.0, 1.0, 1.0), // green
  vec4(1.0, 1.0, 1.0, 1.0), // blue
  vec4(1.0, 1.0, 1.0, 1.0), // magenta
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(1.0, 1.0, 1.0, 1.0), // cyan
  // second set
  vec4(1.0, 1.0, 1.0, 1.0), // black
  vec4(1.0, 1.0, 1.0, 1.0), // red
  vec4(1.0, 1.0, 1.0, 1.0), // yellow
  vec4(1.0, 1.0, 1.0, 1.0), // green
  vec4(1.0, 1.0, 1.0, 1.0), // blue
  vec4(1.0, 1.0, 1.0, 1.0), // magenta
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(1.0, 1.0, 1.0, 1.0), // cyan
  // third set
  vec4(1.0, 1.0, 1.0, 1.0), // black
  vec4(1.0, 1.0, 1.0, 1.0), // red
  vec4(1.0, 1.0, 1.0, 1.0), // yellow
  vec4(1.0, 1.0, 1.0, 1.0), // green
  vec4(1.0, 1.0, 1.0, 1.0), // blue
  vec4(1.0, 1.0, 1.0, 1.0), // magenta
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(1.0, 1.0, 1.0, 1.0), // cyan
  // fourth set
  vec4(1.0, 1.0, 1.0, 1.0), // black
  vec4(1.0, 1.0, 1.0, 1.0), // red
  vec4(1.0, 1.0, 1.0, 1.0), // yellow
  vec4(1.0, 1.0, 1.0, 1.0), // green
  vec4(1.0, 1.0, 1.0, 1.0), // blue
  vec4(1.0, 1.0, 1.0, 1.0), // magenta
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(1.0, 1.0, 1.0, 1.0), // cyan
];

//Card Matrices
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var rxyz;

var pmHand = mat4(1.0); // identity matrix
// Compute the sines and cosines of theta for each of
//   the three axes in one computation.
var rotateSpeed = 0.0;
var angles = (Math.PI / 180) * rotateSpeed;
var c = Math.cos(angles);
var s = Math.sin(angles);
var ctMatrix = mat4(1.0);

rxyz = [
  mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0),
  mat4(c, 0.0, s, 0.0, 0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0),
  mat4(c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0),
];

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

// Configure Card Textures
function configureTexture(image) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  //Flips the source data along its vertical axis when texImage2D or texSubImage2D are called when param is true. The initial value for param is false.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Check if the image is a power of 2 in both dimensions.
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    // Yes, it's a power of 2. Generate mips.
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.NEAREST_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  } else {
    // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
    // Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // Prevents t-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
}

//Set arrays for card textures
function quad(a, b, c, d) {
  pointsArray.push(cardVertices[a]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[1]);

  pointsArray.push(cardVertices[b]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[0]);

  pointsArray.push(cardVertices[c]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[3]);

  pointsArray.push(cardVertices[a]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[1]);

  pointsArray.push(cardVertices[c]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[3]);

  pointsArray.push(cardVertices[d]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[2]);
}

//Coloring Cards
function colorCube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
  // two
  quad(9, 8, 11, 10);
  quad(10, 11, 15, 14);
  quad(11, 8, 12, 15);
  quad(14, 13, 9, 10);
  quad(12, 13, 14, 15);
  quad(13, 12, 8, 9);
  // three
  quad(17, 16, 19, 18);
  quad(18, 19, 23, 22);
  quad(19, 16, 20, 23);
  quad(22, 21, 17, 18);
  quad(20, 21, 22, 23);
  quad(21, 20, 16, 17);
  // four
  quad(25, 24, 27, 26);
  quad(26, 27, 31, 30);
  quad(27, 24, 28, 31);
  quad(30, 29, 25, 26);
  quad(28, 29, 30, 31);
  quad(29, 28, 24, 25);
}

function findCardValue( str ) {
  var cardValue;
  switch (str.charAt(0)) {
    case "2":
      cardValue = 2;
      break;
    case "3":
      cardValue = 3;
      break;
    case "4":
      cardValue = 4;
      break;
    case "5":
      cardValue = 5;
      break;
    case "6":
      cardValue = 6;
      break;
    case "7":
      cardValue = 7;
      break;
    case "8":
      cardValue = 8;
      break;
    case "9":
      cardValue = 9;
      break;
    case "1":
      cardValue = 10;
      break;
    case "J":
      cardValue = 10;
      break;
    case "Q":
      cardValue = 10;
      break;
    case "K":
      cardValue = 10;
      break;
    case "A":
      cardValue = 11;
      break;
  }
  return cardValue;
}

//Draw Card
function drawCard(start, end, cardID) {
  //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var image = document.getElementById(cardID);
  configureTexture(image);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

  var a_vTexCoordLoc = gl.getAttribLocation(program, "a_vTexCoord");
  gl.vertexAttribPointer(a_vTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_vTexCoordLoc);

  gl.activeTexture(gl.TEXTURE0);
  u_textureSamplerLoc = gl.getUniformLocation(program, "u_textureSampler");
  gl.uniform1i(u_textureSamplerLoc, 0);

  //Set Hand Matrix
  u_ctMatrixHandLoc = gl.getUniformLocation(program, "u_ctMatrixHand");

  pmHand = mult(rxyz[axis], pmHand);
  ctMatrix = mult(ortho(-1, 1, -1, 1, -1, 1), pmHand);
  gl.uniformMatrix4fv(u_ctMatrixHandLoc, false, flatten(ctMatrix));
  gl.drawArrays(gl.TRIANGLES, start, end);
}

//Dealing initial hand and checking matches
function dealCards(){
  // cards to be dealt to player and dealer
  playerCard1 = cards[Math.floor(Math.random(0, 52) * max)];
  currentCards.push(playerCard1);

  playerCard2 = cards[Math.floor(Math.random(0, 52) * max)];
  while (playerCard2 == playerCard1) {
    playerCard2 = cards[Math.floor(Math.random(0, 52) * max)];
  }
  currentCards.push(playerCard2);

  dealerCard1 = cards[Math.floor(Math.random(0, 52) * max)];
  while (dealerCard1 == playerCard1 || dealerCard1 == playerCard2) {
    dealerCard1 = cards[Math.floor(Math.random(0, 52) * max)];
  }
  currentCards.push(dealerCard1);

  dealerCard2 = cards[Math.floor(Math.random(0, 52) * max)];
  while (
    dealerCard2 == playerCard1 ||
    dealerCard2 == playerCard2 ||
    dealerCard2 == dealerCard1
  ) {
    dealerCard2 = cards[Math.floor(Math.random(0, 52) * max)];
  }
  currentCards.push(dealerCard2);

  // calculate player and dealer current card totals
  var playerCard1Value = findCardValue( playerCard1 );
  var playerCard2Value = findCardValue( playerCard2 );
  var dealerCard1Value = findCardValue( dealerCard1 );
  var dealerCard2Value = findCardValue( dealerCard2 );
  playerCardCount = playerCard1Value + playerCard2Value;
  dealerCardCount = dealerCard1Value + dealerCard2Value;
  console.log(playerCard1);
  console.log(playerCard2);
  console.log(dealerCard1);
  console.log(dealerCard2);
  console.log(playerCardCount);
  console.log(dealerCardCount);
  gl.enable(gl.DEPTH_TEST);
}

// Draw the Cards
function drawAll() {
  drawCard(0, numVertices / 4, playerCard1);
  drawCard(numVertices / 4, numVertices / 4, playerCard2);
  drawCard(numVertices / 2, numVertices / 4, dealerCard1);
  drawCard(numVertices * (3 / 4), numVertices / 4, "backImage");
}

window.onload = function init() {
  // general webgl setup
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.14, 0.58, 0.15, 1.0); //green

  // Setup Chips
  createChips();

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);


  // Buffer for chips
  chipsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, chipsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(chipVertices), gl.STATIC_DRAW);

  // Position Pre deal
  a_vPositionLoc = gl.getAttribLocation(program, "a_vPosition");
  gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_vPositionLoc);

  u_ColorLoc = gl.getUniformLocation(program, "u_Color");
  u_ctMatrixLoc = gl.getUniformLocation(program, "u_ctMatrix");
  u_vCenterLoc = gl.getUniformLocation(program, "u_vCenter");

  //Set Controller States for gl
  u_ControllerStateLoc = gl.getUniformLocation(program, "u_ControllerState");
  gl.uniform1i(u_ControllerStateLoc, true);

  u_ColorStateLoc = gl.getUniformLocation(program, "u_ColorState");
  gl.uniform1i(u_ColorStateLoc, true);
  render();
};

function initialSetup() {
  Name = prompt("Username:", "Enter Name");
  if (Name == null || Name == "") {
    Name = "User";
  }
  document.getElementsByClassName("current-game-stage")[0].textContent =
    "Game Stage: Place Initial Bet";
  document.getElementsByClassName(
    "better-name"
  )[0].textContent = `Name: ${Name}`;

  userStack = -1;
  while (userStack > 100 || userStack < 10) {
    var userStackInput = prompt("Starting Stack", "(10 - 100, Whole Dollars)");
    while (isNaN(userStackInput)) {
      console.log("not a number");
      userStackInput = prompt("Starting Stack", "(10 - 100, Whole Dollars)");
    }
    userStack = parseInt(userStackInput);
  }
  document.getElementsByClassName(
    "better-stack"
  )[0].textContent = `Stack: $${userStack.toString()}`;
  alert(
    "\t\t\tSelect Your Bets! \n(White = $1, Red = $5, Blue = $10, Black = $25) \n\t\t\t (Up To 5 Chips)"
  );

  originalStack = userStack;

  //Set inital bet information in HTML
  currentBet = 0;
  document.getElementsByClassName(
    "current-bet-amount"
  )[0].textContent = `Current Bet Amount: $${currentBet}`;

  document.getElementById("gl-canvas").style.visibility = "visible";
  document.getElementById("unloaded-state--text-area").style.visibility =
    "hidden";
  document.getElementById("unloaded-state--text-area").style.display = "none";

  //Update Game State
  clearBets();
  state = 1;
}

// This function creates the vertices for the a chip circle, sets colors
function createChips() {
  chipXCenterOne = -0.5;
  chipYCenterOne = 0.5;

  chipXCenterFive = 0.5;
  chipYCenterFive = 0.5;

  chipXCenterTen = -0.5;
  chipYCenterTen = -0.5;

  chipXCenterTwoFive = 0.5;
  chipYCenterTwoFive = -0.5;

  // Generic Circle
  var p = vec2(0.0, 0.0);
  chipVertices = [p];
  var radius = 1;
  var increment = Math.PI / 36;

  for (var theta = 0.0; theta < Math.PI * 2 - increment; theta += increment) {
    if (theta == 0.0) {
      chipVertices.push(
        vec2(Math.cos(theta) * radius, Math.sin(theta) * radius)
      );
    }
    chipVertices.push(
      vec2(
        Math.cos(theta + increment) * radius,
        Math.sin(theta + increment) * radius
      )
    );
  }

  // Generic Rectangle for chips
  markerVertices = [
    vec2(-1.5, 0.25),
    vec2(-1.5, -0.25),
    vec2(0, 0.25),

    vec2(0, 0.25),
    vec2(0, -0.25),
    vec2(-1.5, -0.25),
  ];

  chipVertices.push(...markerVertices);

  // Make Bet Area from 2 rectangles and 1 part of a circle
  // Wide Area One
  betAreaWideVertices = [
    vec2(-0.15, 0.0),
    vec2(-0.15, 1.4),
    vec2(0.15, 0),

    vec2(0.15, 0),
    vec2(0.15, 1.4),
    vec2(-0.15, 1.4),
  ];
  chipVertices.push(...betAreaWideVertices);

  // Tall Area One
  betAreaTallVertices = [
    vec2(-0.1, 0.0),
    vec2(-0.1, 1.45),
    vec2(0.1, 0),

    vec2(0.1, 0),
    vec2(0.1, 1.45),
    vec2(-0.1, 1.45),
  ];

  chipVertices.push(...betAreaTallVertices);

  // Corner
  var k = vec2(0.0, 0.0);
  var cornerVerts = [k];
  var radius = 1;
  var increment = Math.PI / 36;

  for (var theta = 0.0; theta < Math.PI * 2 - increment; theta += increment) {
    if (theta == 0.0) {
      cornerVerts.push(
        vec2(Math.cos(theta) * radius, Math.sin(theta) * radius)
      );
    }
    cornerVerts.push(
      vec2(
        Math.cos(theta + increment) * radius,
        Math.sin(theta + increment) * radius
      )
    );
  }

  chipVertices.push(...cornerVerts);

  // Set Colors
  // 1 - white/blue
  chipOnePrimary = vec3(1.0, 1.0, 1.0);
  chipOneSecondary = vec3(20 / 255, 20 / 255, 175 / 255);

  // 5 - red/white
  chipFivePrimary = vec3(180 / 255, 10 / 255, 10 / 255);
  chipFiveSecondary = vec3(1.0, 1.0, 1.0);

  // 10 - blue/white
  chipTenPrimary = vec3(50 / 255, 50 / 255, 200 / 255);
  chipTenSecondary = vec3(1.0, 1.0, 1.0);

  // 25 - black/white
  chipTwoFivePrimary = vec3(0.0, 0.0, 0.0);
  chipTwoFiveSecondary = vec3(1.0, 1.0, 1.0);
}

// Creates bet area
function createBetArea() {
  var tm, sm, rm, pm;

  var betAreaOutsideWideMat;
  var betAreaOutsideTallMat;
  var betAreaOutsideCornerMat;

  var betAreaInsideWideMat;
  var betAreaInsideTallMat;
  var betAreaInsideCornerMat;

  pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);

  //Outside Wide Rectangle - Yellow
  betAreaOutsideWideMat = mat4();
  tm = translate(0.9, -1, 0.0);
  betAreaOutsideWideMat = mult(tm, betAreaOutsideWideMat);
  betAreaOutsideWideMat = mult(pm, betAreaOutsideWideMat);
  gl.uniform3fv(u_ColorLoc, betAreaColor);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(betAreaOutsideWideMat));
  gl.drawArrays(gl.TRIANGLE_FAN, 80, 6);

  //Outside Tall Rectangle - Yellow
  betAreaOutsideTallMat = mat4();
  tm = translate(0.9, -1, 0.0);
  betAreaOutsideTallMat = mult(tm, betAreaOutsideTallMat);
  betAreaOutsideTallMat = mult(pm, betAreaOutsideTallMat);
  gl.uniform3fv(u_ColorLoc, betAreaColor);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(betAreaOutsideTallMat));
  gl.drawArrays(gl.TRIANGLE_FAN, 86, 6);

  // Outside Corner
  betAreaOutsideCornerMat = mat4();
  tm = translate(0.8, 0.4, 0.0);
  sm = scalem(0.05, 0.05, 1.0);
  rm = rotateZ(90);
  betAreaOutsideCornerMat = mult(sm, betAreaOutsideCornerMat);
  betAreaOutsideCornerMat = mult(rm, betAreaOutsideCornerMat);
  betAreaOutsideCornerMat = mult(tm, betAreaOutsideCornerMat);
  betAreaOutsideCornerMat = mult(pm, betAreaOutsideCornerMat);
  gl.uniform3fv(u_ColorLoc, betAreaColor);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(betAreaOutsideCornerMat));
  gl.drawArrays(gl.TRIANGLE_FAN, 92, 20);

  //Inside Wide Rectangle - Green
  betAreaInsideWideMat = mat4();
  tm = translate(0.93, -1.03, 0.0);
  betAreaInsideWideMat = mult(tm, betAreaInsideWideMat);
  betAreaInsideWideMat = mult(pm, betAreaInsideWideMat);
  gl.uniform3fv(u_ColorLoc, feltColor);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(betAreaInsideWideMat));
  gl.drawArrays(gl.TRIANGLE_FAN, 80, 6);

  //Inside Tall Rectangle - Green
  betAreaInsideTallMat = mat4();
  tm = translate(0.93, -1.03, 0.0);
  betAreaInsideTallMat = mult(tm, betAreaInsideTallMat);
  betAreaInsideTallMat = mult(pm, betAreaInsideTallMat);
  gl.uniform3fv(u_ColorLoc, feltColor);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(betAreaInsideTallMat));
  gl.drawArrays(gl.TRIANGLE_FAN, 86, 6);

  // Inside Corner - Yellow
  betAreaInsideCornerMat = mat4();
  tm = translate(0.83, 0.37, 0.0);
  sm = scalem(0.05, 0.05, 1.0);
  rm = rotateZ(90);
  betAreaInsideCornerMat = mult(sm, betAreaInsideCornerMat);
  betAreaInsideCornerMat = mult(rm, betAreaInsideCornerMat);
  betAreaInsideCornerMat = mult(tm, betAreaInsideCornerMat);
  betAreaInsideCornerMat = mult(pm, betAreaInsideCornerMat);
  gl.uniform3fv(u_ColorLoc, feltColor);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(betAreaInsideCornerMat));
  gl.drawArrays(gl.TRIANGLE_FAN, 92, 20);
}

function showBets(position, betValues) {
  if (position == 0) {
    return;
  }
  // Create Bet
  var matBet;
  var trans;
  var tm, sm, rm, pm;
  var centerBetX = 0.9;
  var centerBetY;
  var colorBetPrimary = vec3();
  var colorBetSecondary = vec3();

  var translationX;
  var translationY;

  pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);

  for (var i = 1; i <= position; i++) {
    if (i == 1) {
      centerBetY = -0.9;
    } else if (i == 2) {
      centerBetY = -0.6;
    } else if (i == 3) {
      centerBetY = -0.3;
    } else if (i == 4) {
      centerBetY = 0;
    } else if (i == 5) {
      centerBetY = 0.3;
    }

    if (betValues[i - 1] == 1) {
      colorBetPrimary = chipOnePrimary;
      colorBetSecondary = chipOneSecondary;
    } else if (betValues[i - 1] == 5) {
      colorBetPrimary = chipFivePrimary;
      colorBetSecondary = chipFiveSecondary;
    } else if (betValues[i - 1] == 10) {
      colorBetPrimary = chipTenPrimary;
      colorBetSecondary = chipTenSecondary;
    } else if (betValues[i - 1] == 25) {
      colorBetPrimary = chipTwoFivePrimary;
      colorBetSecondary = chipTwoFiveSecondary;
    }

    matBet = mat4();
    theta = 0.0; // in degree
    trans = 0;
    translationX = centerBetX;
    translationY = centerBetY;
    sm = scalem(betScaleOut, betScaleOut, betScaleOut);
    rm = rotateZ(theta);
    tm = translate(translationX, translationY, 0.0);
    matBet = mult(sm, matBet);
    matBet = mult(rm, matBet);
    matBet = mult(tm, matBet);
    matBet = mult(pm, matBet);
    gl.uniform3fv(u_ColorLoc, colorBetPrimary);
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matBet));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
    // One Dollar Markers
    theta = 0;
    var chipMarkers;
    for (var k = 0; k < 8; k++) {
      chipMarkers = mat4();
      theta -= 45;
      var thetaRadians = (theta * Math.PI) / 180;
      translationX = centerBetX + (Math.cos(thetaRadians) * 0.2 + 0) / 2;
      translationY = centerBetY + (Math.sin(thetaRadians) * 0.2 + 0) / 2;
      rm = rotateZ(theta);
      tm = translate(translationX, translationY, 0.0);
      sm = scalem(betScaleMarker, betScaleMarker, betScaleMarker);
      chipMarkers = mult(sm, chipMarkers);
      chipMarkers = mult(rm, chipMarkers);
      chipMarkers = mult(tm, chipMarkers);
      chipMarkers = mult(pm, chipMarkers);
      gl.uniform3fv(u_ColorLoc, colorBetSecondary);
      gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
      gl.drawArrays(gl.TRIANGLE_FAN, 74, 6);
    }
  }
}

// The Initial Game State
// User can pick bets
function selectBets() {
  //Draw Chips
  var trans;
  var tm, sm, rm, pm;
  var translationX;
  var translationY;
  pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);

  // Check chip selection
  gl.uniform2fv(u_vCenterLoc, vec2(0, 0));
  canvas.addEventListener("mousedown", function (event) {
    var t = vec2(
      (2 * (event.clientX - event.target.getBoundingClientRect().left)) /
        canvas.width -
        1,
      (2 *
        (canvas.height -
          (event.clientY - event.target.getBoundingClientRect().top))) /
        canvas.height -
        1
    );

    if (
      chipXCenterOne - 0.15 <= t[0] &&
      t[0] <= chipXCenterOne + 0.15 &&
      t[1] <= chipYCenterOne + 0.15 &&
      t[1] >= chipYCenterOne - 0.15
    ) {
      if (userStack - 1 >= 0) {
        chipMoveOne = true;
      }
    }

    if (
      chipXCenterFive - 0.15 <= t[0] &&
      t[0] <= chipXCenterFive + 0.15 &&
      t[1] <= chipYCenterFive + 0.15 &&
      t[1] >= chipYCenterFive - 0.15
    ) {
      chipMoveFive = true;
    }

    if (
      chipXCenterTen - 0.15 <= t[0] &&
      t[0] <= chipXCenterTen + 0.15 &&
      t[1] <= chipYCenterTen + 0.15 &&
      t[1] >= chipYCenterTen - 0.15
    ) {
      chipMoveTen = true;
    }

    if (
      chipXCenterTwoFive - 0.15 <= t[0] &&
      t[0] <= chipXCenterTwoFive + 0.15 &&
      t[1] <= chipYCenterTwoFive + 0.15 &&
      t[1] >= chipYCenterTwoFive - 0.15
    ) {
      chipMoveTwoFive = true;
    }
  });

  // Update based on position
  // ONE UPDATES
  if (chipMoveOne == true) {
    if (position == 0) {
      chipXCenterOne += 0.01;
      chipYCenterOne -= 0.01;
    } else if (position == 1) {
      chipXCenterOne += 0.01;
      chipYCenterOne -= 0.01 / (14 / 11);
    } else if (position == 2) {
      chipXCenterOne += 0.01;
      chipYCenterOne -= 0.01 / 1.75;
    } else if (position == 3) {
      chipXCenterOne += 0.01;
      chipYCenterOne -= 0.01 / (1.4 / 0.5);
    } else if (position == 4) {
      chipXCenterOne += 0.01;
      chipYCenterOne -= 0.01 / (1.4 / 0.2);
    } else {
      chipXCenterOne += 0.01;
    }
    scalingOutOne /= 1.005;
    scalingMarkerOne /= 1.005;

    if (chipXCenterOne > 0.9) {
      chipXCenterOne = -0.5;
      chipYCenterOne = 0.5;
      chipMoveOne = false;
      scalingOutOne = 0.2;
      scalingMarkerOne = 0.03;

      //update bets and check if error
      if (userStack - 1 >= 0) {
        userStack -= 1;
        currentBet += 1;
        position += 1;
        betValues.push(1);
      } else {
        alert("You don't have enough money to make this bet!");
      }
    }
  }

  // FIVE UPDATES
  if (chipMoveFive == true) {
    if (position == 0) {
      chipXCenterFive += 0.01 / (1.4 / 0.4);
      chipYCenterFive -= 0.01;
      scalingOutFive /= 1.005;
      scalingMarkerFive /= 1.005;
    } else if (position == 1) {
      chipXCenterFive += 0.01 / (1.1 / 0.4);
      chipYCenterFive -= 0.01;
      scalingOutFive /= 1.0065;
      scalingMarkerFive /= 1.0065;
    } else if (position == 2) {
      chipXCenterFive += 0.01 / (0.8 / 0.4);
      chipYCenterFive -= 0.01;
      scalingOutFive /= 1.009;
      scalingMarkerFive /= 1.009;
    } else if (position == 3) {
      chipXCenterFive += 0.008 / (0.5 / 0.4);
      chipYCenterFive -= 0.008;
      scalingOutFive /= 1.012;
      scalingMarkerFive /= 1.012;
    } else if (position == 4) {
      chipXCenterFive += 0.005 / (0.2 / 0.4);
      chipYCenterFive -= 0.005;
      scalingOutFive /= 1.018;
      scalingMarkerFive /= 1.018;
    } else {
      chipXCenterFive += 0.01;
    }

    if (chipXCenterFive > 0.9) {
      chipXCenterFive = 0.5;
      chipYCenterFive = 0.5;
      chipMoveFive = false;
      scalingOutFive = 0.2;
      scalingMarkerFive = 0.03;

      //update bets and check if error
      if (userStack - 5 >= 0) {
        userStack -= 5;
        currentBet += 5;
        position += 1;
        betValues.push(5);
      } else {
        alert("You don't have enough money to make this bet!");
      }
    }
  }

  // TEN UPDATES
  if (chipMoveTen == true) {
    if (position == 0) {
      chipXCenterTen += 0.01;
      chipYCenterTen -= 0.01 / (1.4 / 0.4);
    } else if (position == 1) {
      chipXCenterTen += 0.01;
      chipYCenterTen -= 0.01 / (1.4 / 0.1);
    } else if (position == 2) {
      chipXCenterTen += 0.01;
      chipYCenterTen += 0.01 / (1.4 / 0.2);
    } else if (position == 3) {
      chipXCenterTen += 0.01;
      chipYCenterTen += 0.01 / (1.4 / 0.5);
    } else if (position == 4) {
      chipXCenterTen += 0.01;
      chipYCenterTen += 0.01 / (1.4 / 0.8);
    } else {
      chipXCenterTen += 0.01;
    }
    scalingOutTen /= 1.005;
    scalingMarkerTen /= 1.005;

    if (chipXCenterTen > 0.9) {
      chipXCenterTen = -0.5;
      chipYCenterTen = -0.5;
      chipMoveTen = false;
      scalingOutTen = 0.2;
      scalingMarkerTen = 0.03;

      //update bets and check if error
      if (userStack - 10 >= 0) {
        userStack -= 10;
        currentBet += 10;
        position += 1;
        betValues.push(10);
      } else {
        alert("You don't have enough money to make this bet!");
      }
    }
  }

  //  TWO FIVE UPDATES
  if (chipMoveTwoFive == true) {
    if (position == 0) {
      chipXCenterTwoFive += 0.005;
      chipYCenterTwoFive -= 0.005;
      scalingOutTwoFive /= 1.0079;
      scalingMarkerTwoFive /= 1.0079;
    } else if (position == 1) {
      chipXCenterTwoFive += 0.005;
      chipYCenterTwoFive -= 0.005 / (0.4 / 0.1);
      scalingOutTwoFive /= 1.0082;
      scalingMarkerTwoFive /= 1.0082;
    } else if (position == 2) {
      chipXCenterTwoFive += 0.005;
      chipYCenterTwoFive += 0.005 / (0.4 / 0.2);
      scalingOutTwoFive /= 1.0085;
      scalingMarkerTwoFive /= 1.0085;
    } else if (position == 3) {
      chipXCenterTwoFive += 0.005;
      chipYCenterTwoFive += 0.005 / (0.4 / 0.5);
      scalingOutTwoFive /= 1.0088;
      scalingMarkerTwoFive /= 1.0088;
    } else if (position == 4) {
      chipXCenterTwoFive += 0.005;
      chipYCenterTwoFive += 0.005 / (0.4 / 0.8);
      scalingOutTwoFive /= 1.009;
      scalingMarkerTwoFive /= 1.009;
    } else {
      chipXCenterTwoFive += 0.01;
    }
    if (chipXCenterTwoFive > 0.9) {
      chipXCenterTwoFive = 0.5;
      chipYCenterTwoFive = -0.5;
      chipMoveTwoFive = false;
      scalingOutTwoFive = 0.2;
      scalingMarkerTwoFive = 0.03;

      //update bets and check if error
      if (userStack - 25 >= 0) {
        userStack -= 25;
        currentBet += 25;
        position += 1;
        betValues.push(25);
      } else {
        alert("You don't have enough money to make this bet!");
      }
    }
  }

  // One Dollar
  matOne = mat4();
  theta = 0.0; // in degree
  trans = 0;
  translationX = chipXCenterOne;
  translationY = chipYCenterOne;
  sm = scalem(scalingOutOne, scalingOutOne, scalingOutOne);
  rm = rotateZ(theta);
  tm = translate(translationX, translationY, 0.0);
  matOne = mult(sm, matOne);
  matOne = mult(rm, matOne);
  matOne = mult(tm, matOne);
  matOne = mult(pm, matOne);
  gl.uniform3fv(u_ColorLoc, chipOnePrimary);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matOne));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
  // One Dollar Markers
  theta = 0;
  var chipMarkers;
  for (var i = 0; i < 8; i++) {
    chipMarkers = mat4();
    theta -= 45;
    var thetaRadians = (theta * Math.PI) / 180;
    translationX = Math.cos(thetaRadians) * scalingOutOne + chipXCenterOne;
    translationY = Math.sin(thetaRadians) * scalingOutOne + chipYCenterOne;
    rm = rotateZ(theta);
    tm = translate(translationX, translationY, 0.0);
    sm = scalem(scalingMarkerOne, scalingMarkerOne, scalingMarkerOne);
    chipMarkers = mult(sm, chipMarkers);
    chipMarkers = mult(rm, chipMarkers);
    chipMarkers = mult(tm, chipMarkers);
    chipMarkers = mult(pm, chipMarkers);
    gl.uniform3fv(u_ColorLoc, chipOneSecondary);
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
    gl.drawArrays(gl.TRIANGLE_FAN, 74, 6);
  }

  // Five Dollar
  matFive = mat4();
  theta = 0.0; // in degree
  trans = 0;
  translationX = chipXCenterFive;
  translationY = chipYCenterFive;
  sm = scalem(scalingOutFive, scalingOutFive, scalingOutFive);
  rm = rotateZ(theta);
  tm = translate(translationX, translationY, 0.0);
  matFive = mult(sm, matFive);
  matFive = mult(rm, matFive);
  matFive = mult(tm, matFive);
  matFive = mult(pm, matFive);
  gl.uniform3fv(u_ColorLoc, chipFivePrimary);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matFive));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
  // Five Dollar Markers
  theta = 0;
  var chipMarkers;
  for (var i = 0; i < 8; i++) {
    chipMarkers = mat4();
    theta -= 45;
    var thetaRadians = (theta * Math.PI) / 180;
    translationX = Math.cos(thetaRadians) * scalingOutFive + chipXCenterFive;
    translationY = Math.sin(thetaRadians) * scalingOutFive + chipYCenterFive;
    rm = rotateZ(theta);
    tm = translate(translationX, translationY, 0.0);
    sm = scalem(scalingMarkerFive, scalingMarkerFive, scalingMarkerFive);
    chipMarkers = mult(sm, chipMarkers);
    chipMarkers = mult(rm, chipMarkers);
    chipMarkers = mult(tm, chipMarkers);
    chipMarkers = mult(pm, chipMarkers);
    gl.uniform3fv(u_ColorLoc, chipFiveSecondary);
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
    gl.drawArrays(gl.TRIANGLE_FAN, 74, 6);
  }

  // Ten Dollar
  matTen = mat4();
  theta = 0.0; // in degree
  trans = 0;
  translationX = chipXCenterTen;
  translationY = chipYCenterTen;
  sm = scalem(scalingOutTen, scalingOutTen, scalingOutTen);
  rm = rotateZ(theta);
  tm = translate(translationX, translationY, 0.0);
  matTen = mult(sm, matTen);
  matTen = mult(rm, matTen);
  matTen = mult(tm, matTen);
  matTen = mult(pm, matTen);
  gl.uniform3fv(u_ColorLoc, chipTenPrimary);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matTen));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
  // Ten Dollar Markers
  theta = 0;
  var chipMarkers;
  for (var i = 0; i < 8; i++) {
    chipMarkers = mat4();
    theta -= 45;
    var thetaRadians = (theta * Math.PI) / 180;
    translationX = Math.cos(thetaRadians) * scalingOutTen + chipXCenterTen;
    translationY = Math.sin(thetaRadians) * scalingOutTen + chipYCenterTen;
    rm = rotateZ(theta);
    tm = translate(translationX, translationY, 0.0);
    sm = scalem(scalingMarkerTen, scalingMarkerTen, scalingMarkerTen);
    chipMarkers = mult(sm, chipMarkers);
    chipMarkers = mult(rm, chipMarkers);
    chipMarkers = mult(tm, chipMarkers);
    chipMarkers = mult(pm, chipMarkers);
    gl.uniform3fv(u_ColorLoc, chipTenSecondary);
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
    gl.drawArrays(gl.TRIANGLE_FAN, 74, 6);
  }

  // Ten Dollar
  matTwoFive = mat4();
  theta = 0.0; // in degree
  trans = 0;
  translationX = chipXCenterTwoFive;
  translationY = chipYCenterTwoFive;
  sm = scalem(scalingOutTwoFive, scalingOutTwoFive, scalingOutTwoFive);
  rm = rotateZ(theta);
  tm = translate(translationX, translationY, 0.0);
  matTwoFive = mult(sm, matTwoFive);
  matTwoFive = mult(rm, matTwoFive);
  matTwoFive = mult(tm, matTwoFive);
  matTwoFive = mult(pm, matTwoFive);
  gl.uniform3fv(u_ColorLoc, chipTwoFivePrimary);
  gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matTwoFive));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
  // TwoFive Dollar Markers
  theta = 0;
  var chipMarkers;
  for (var i = 0; i < 8; i++) {
    chipMarkers = mat4();
    theta -= 45;
    var thetaRadians = (theta * Math.PI) / 180;
    translationX =
      Math.cos(thetaRadians) * scalingOutTwoFive + chipXCenterTwoFive;
    translationY =
      Math.sin(thetaRadians) * scalingOutTwoFive + chipYCenterTwoFive;
    rm = rotateZ(theta);
    tm = translate(translationX, translationY, 0.0);
    sm = scalem(
      scalingMarkerTwoFive,
      scalingMarkerTwoFive,
      scalingMarkerTwoFive
    );
    chipMarkers = mult(sm, chipMarkers);
    chipMarkers = mult(rm, chipMarkers);
    chipMarkers = mult(tm, chipMarkers);
    chipMarkers = mult(pm, chipMarkers);
    gl.uniform3fv(u_ColorLoc, chipTwoFiveSecondary);
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
    gl.drawArrays(gl.TRIANGLE_FAN, 74, 6);
  }
  showBets(position, betValues);

  //Update HTML Information
  document.getElementsByClassName(
    "better-stack"
  )[0].textContent = `Stack: $${userStack}`;
  document.getElementsByClassName(
    "current-bet-amount"
  )[0].textContent = `Current Bet: $${currentBet}`;
}

// Bet Resetting functions from button push
function clearBets() {
  position = 0;
  betValues = [];
  currentBet = 0;
  userStack = originalStack;
}

function removeLastBet() {
  if (position > 0) {
    position -= 1;
    var previousBetVal = betValues.pop();
    currentBet -= previousBetVal;
    userStack += previousBetVal;
  }
}

function dealHand() {
  if (currentBet > 0) {
    state = 2;
    controllerState = 1;
    gl.uniform1i(u_ControllerStateLoc, false);
    gl.uniform1i(u_ColorStateLoc, false);
    document.getElementsByClassName(
      "betting-actions-container"
    )[0].style.display = "none";
    document.getElementsByClassName("hand-actions-container")[0].style.display =
      "flex";
  } else {
    alert("You must place a bet first!");
  }
}

function prepareForHand() {
  dealCards();
  colorCube();

  // Buffer for Cards
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
  console.log("buffer created");

  // Color for deal
  var a_vColorHandLoc = gl.getAttribLocation(program, "a_vColorHand");
  gl.vertexAttribPointer(a_vColorHandLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_vColorHandLoc);

  // Cards Verts Buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  //Position for deal
  var a_vPositionHandLoc = gl.getAttribLocation( program, "a_vPositionHand" );
  gl.vertexAttribPointer( a_vPositionHandLoc, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( a_vPositionHandLoc );

  state = 3;
}

// function to randomly generate card when hit selected
function determineHitCard() {
  var hitCard = cards[Math.floor(Math.random(0, 52) * max)];

  var duplicateCard = currentCards.find((card) => {
    return card == hitCard;
  })

  if (!duplicateCard) {
    currentCards.push(hitCard);
    return hitCard;
  } else {
    return determineHitCard();
  }
}

function resetBetBuffers(){

  document.getElementsByClassName(
    "betting-actions-container"
  )[0].style.display = "flex";
  document.getElementsByClassName("hand-actions-container")[0].style.display =
    "none";
  document.getElementsByClassName("current-game-stage")[0].textContent =
    "Game Stage: Place Bet";

  //update state
  gl.uniform1i(u_ControllerStateLoc, true);
  gl.uniform1i(u_ColorStateLoc, true);
  state = 1;

  //Update bets
  position = 0;
  betValues = [];
  currentBet = 0;

  // reset Buffer for chips
  chipsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, chipsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(chipVertices), gl.STATIC_DRAW);

  // reset Position Pre deal
  a_vPositionLoc = gl.getAttribLocation(program, "a_vPosition");
  gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_vPositionLoc);

  //reset locations
  u_ColorLoc = gl.getUniformLocation(program, "u_Color");
  u_ctMatrixLoc = gl.getUniformLocation(program, "u_ctMatrix");
  u_vCenterLoc = gl.getUniformLocation(program, "u_vCenter");

  //reset depth
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);
}

function updatePlayerCardCount( newCard ) {
  var newCardValue = findCardValue( newCard );
  playerCardCount += newCardValue;
  console.log(playerCardCount);
  if (playerCardCount > 21 && userStack == 0) {
    alert("Bust! You have lost.");
    //window.location.reload(false);

  } else if (playerCardCount > 21 && userStack > 0) {
    resetBetBuffers();
    originalStack = userStack;
  }
}

function playerHit() {
  var nextPlayerCard = determineHitCard();
  updatePlayerCardCount( nextPlayerCard );
  console.log(nextPlayerCard);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (state == 1) {
    createBetArea();
    selectBets();
  } else if (state == 2) {
    prepareForHand();
  } else if (state == 3) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawAll();
  }
  window.requestAnimFrame(render);
}
