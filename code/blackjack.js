"use strict";

var gl;
var vertices;
var u_ColorLoc;
var u_ctMatrixLoc;
var theta = 0.0;
var u_vCenterLoc;
var canvas;

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

// Cards
var card;

// Gameplay
var state = 0;
var bet = 0;
var tally = 0;

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

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Buffer for chips
  var chipsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, chipsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(chipVertices), gl.STATIC_DRAW);

  // Position
  var a_vPositionLoc = gl.getAttribLocation(program, "a_vPosition");
  gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_vPositionLoc);

  u_ColorLoc = gl.getUniformLocation(program, "u_Color");
  u_ctMatrixLoc = gl.getUniformLocation(program, "u_ctMatrix");
  u_vCenterLoc = gl.getUniformLocation(program, "u_vCenter");

  render();
};

function initialSetup() {
  Name = prompt("Username:", "Enter Name");
  if (Name == null || Name == "") {
    Name = "User";
  }
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
  console.log(cornerVerts.length);

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
  } else {
    alert("You must place a bet first!");
  }
}

function prepareForHand() {
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (state == 1) {
    createBetArea();
    selectBets();
  } else if (state == 2) {
    prepareForHand();
  }
  window.requestAnimFrame(render);
}
