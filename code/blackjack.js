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
var userStack;

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
var scalingOutOne = .2;
var scalingMarkerOne = .03;
var scalingOutFive = .2;
var scalingMarkerFive = .03;
var scalingOutTen= .2;
var scalingMarkerTen = .03;
var scalingOutTwoFive = .2;
var scalingMarkerTwoFive = .03;

// Bets
var position = 0;
var betScaleOut = .1;
var betScaleMarker = .015;
var betValues = [];

// Cards 
var card;

// Gameplay
var state = 0;
var bet = 0;
var tally = 0;

window.onload = function init(){
    // general webgl setup
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.14, 0.58, 0.15, 1.0 ); //green

    // Setup Chips
    createChips();
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Buffer for chips
    var chipsBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, chipsBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(chipVertices), gl.STATIC_DRAW );

    // Position
    var a_vPositionLoc = gl.getAttribLocation( program, "a_vPosition" );
    gl.vertexAttribPointer( a_vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vPositionLoc );

    u_ColorLoc = gl.getUniformLocation(program, "u_Color");
    u_ctMatrixLoc = gl.getUniformLocation( program, "u_ctMatrix" );
    u_vCenterLoc = gl.getUniformLocation (program, "u_vCenter");

    render();
};

function initialSetup(){
    Name = prompt("Username:", "Enter Name");
    if (Name == null || Name == "") {
      Name = "User"
    } 
    document.getElementById("Name").innerHTML = Name;
    
    userStack = -1;
    while (userStack > 100 || userStack < 10){
        var userStackInput = prompt("Starting Stack", "(10 - 100, Whole Dollars)");
        while(isNaN(userStackInput)){
            console.log("not a number");
            userStackInput = prompt("Starting Stack", "(10 - 100, Whole Dollars)");
        } 
        userStack = parseInt(userStackInput);
    }
    document.getElementById("Stack").innerHTML = userStack;
    state = 1;
}

// This function creates the vertices for the a chip circle, sets colors
function createChips(){
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
    var increment = Math.PI/36;

    for (var theta = 0.0; theta < Math.PI*2 - increment; theta += increment){
        if(theta == 0.0){
            chipVertices.push(vec2(Math.cos(theta)*radius, Math.sin(theta)*radius));
        }
        chipVertices.push(vec2(Math.cos(theta+increment)*radius, Math.sin(theta+increment)*radius));
    }

    // Generic Rectangle 
    markerVertices = [
        vec2(-1.5, 0.25),
        vec2(-1.5, -0.25),
        vec2(0, 0.25),

        vec2(0, 0.25),
        vec2(0, -0.25),
        vec2(-1.5, -0.25)
    ];

    chipVertices.push(...markerVertices);

    // Set Colors 
    // 1 - white/blue
    chipOnePrimary = vec3(1.0, 1.0, 1.0);
    chipOneSecondary = vec3(20/255, 20/255, 175/255);

    // 5 - red/white
    chipFivePrimary = vec3(180/255, 10/255, 10/255);
    chipFiveSecondary = vec3(1.0, 1.0, 1.0);

    // 10 - blue/white
    chipTenPrimary = vec3(50/255, 50/255, 200/255);
    chipTenSecondary = vec3(1.0, 1.0, 1.0);

    // 25 - black/white
    chipTwoFivePrimary = vec3(0.0, 0.0, 0.0);
    chipTwoFiveSecondary = vec3(1.0, 1.0, 1.0);

}

function showBets(position, betValues){
    if (position == 0){
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

    for (var i = 1; i <= position; i++){
        if (i == 1){
            centerBetY = -0.9;
        } else if(i == 2){
            centerBetY = -0.6;
        } else if (i == 3){
            centerBetY = -0.3;
        } else if (i == 4){
            centerBetY = 0;
        } else if (i == 5){
            centerBetY = 0.3;
        }   

        if (betValues[i - 1] == 1){
            colorBetPrimary = chipOnePrimary;
            colorBetSecondary = chipOneSecondary;
        } else if (betValues[i - 1] == 5){
            colorBetPrimary = chipFivePrimary;
            colorBetSecondary = chipFiveSecondary;
        } else if (betValues[i - 1] == 10){
            colorBetPrimary = chipTenPrimary;
            colorBetSecondary = chipTenSecondary;
        } else if (betValues[i - 1] == 25){
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
        gl.uniform3fv( u_ColorLoc, colorBetPrimary );
        gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matBet));
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 74);
        // One Dollar Markers 
        theta = 0;
        var chipMarkers;
        for (var k = 0; k < 8; k++){
            chipMarkers = mat4();
            theta -= 45;
            var thetaRadians = theta * Math.PI/180;
            translationX =  (centerBetX) + (Math.cos(thetaRadians)*.20 + 0) / 2;
            translationY =  (centerBetY) + (Math.sin(thetaRadians)*.20 + 0) / 2;
            rm = rotateZ(theta);
            tm = translate(translationX, translationY, 0.0);
            sm = scalem(betScaleMarker, betScaleMarker, betScaleMarker);
            chipMarkers = mult(sm, chipMarkers);
            chipMarkers = mult(rm, chipMarkers);
            chipMarkers = mult(tm, chipMarkers);
            chipMarkers = mult(pm, chipMarkers);
            gl.uniform3fv( u_ColorLoc, colorBetSecondary );
            gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
            gl.drawArrays( gl.TRIANGLE_FAN, 74, 6);
        }
    }
}

// The Initial Game State
// User can pick bets
function selectBets(){
    //Draw Chips 
    var trans;
    var tm, sm, rm, pm;
    var translationX;
    var translationY;
    pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);

    // Check chip selection
    gl.uniform2fv(u_vCenterLoc, vec2(0, 0));
    canvas.addEventListener("mousedown", function(event){
        var t = vec2(2*(event.clientX - event.target.getBoundingClientRect().left)/canvas.width - 1,
        2*(canvas.height - (event.clientY - event.target.getBoundingClientRect().top))/canvas.height - 1);
    
        if ( (chipXCenterOne - .15 <= t[0]) && (t[0] <=  chipXCenterOne + .15) && (t[1] <=  chipYCenterOne + .15) && (t[1] >=  chipYCenterOne - .15) ){
            chipMoveOne = true;
        }

        if ( (chipXCenterFive - .15 <= t[0]) && (t[0] <=  chipXCenterFive + .15) && (t[1] <=  chipYCenterFive + .15) && (t[1] >=  chipYCenterFive - .15) ){
            chipMoveFive = true;
        }

        if ( (chipXCenterTen - .15 <= t[0]) && (t[0] <=  chipXCenterTen + .15) && (t[1] <=  chipYCenterTen + .15) && (t[1] >=  chipYCenterTen - .15) ){
            chipMoveTen = true;
        }

        if ( (chipXCenterTwoFive - .15 <= t[0]) && (t[0] <=  chipXCenterTwoFive + .15) && (t[1] <=  chipYCenterTwoFive + .15) && (t[1] >=  chipYCenterTwoFive - .15) ){
            chipMoveTwoFive = true;
        }

    });

    // Update based on position
    if (chipMoveOne == true){
        if (position == 0){
            chipXCenterOne += .01;
            chipYCenterOne -= .01;
        } else {
            chipXCenterOne += .01;
        }
        scalingOutOne /= 1.0052;
        scalingMarkerOne /= 1.001;
        if (chipXCenterOne > .9){
            chipXCenterOne = -0.5;
            chipYCenterOne = 0.5;
            chipMoveOne = false;
            scalingOutOne = .2;
            scalingMarkerOne = .03;
            position += 1;
            betValues.push(1);
        }
    }

    if (chipMoveFive == true){
        chipXCenterFive += .01;
        scalingOutFive /= 1.001;
        scalingMarkerFive /= 1.001;
        if (chipXCenterFive > .9){
            chipXCenterFive = 0.5;
            chipMoveFive = false;
            scalingOutFive = .2;
            scalingMarkerFive = .03;
            position += 1;
            betValues.push(5);
        }
    }

    if (chipMoveTen == true){
        chipXCenterTen += .01;
        scalingOutTen /= 1.001;
        scalingMarkerTen /= 1.001;
        if (chipXCenterTen > .9){
            chipXCenterTen = -0.5;
            chipMoveTen = false;
            scalingOutTen = .2;
            scalingMarkerTen = .03;
            position += 1;
            betValues.push(10);
        }
    }

    if (chipMoveTwoFive == true){
        chipXCenterTwoFive += .01;
        scalingOutTwoFive /= 1.001;
        scalingMarkerTwoFive /= 1.001;
        if (chipXCenterTwoFive > .9){
            chipXCenterTwoFive = 0.5;
            chipMoveTwoFive = false;
            scalingOutTwoFive = .2;
            scalingMarkerTwoFive = .03;
            position += 1;
            betValues.push(25);
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
    gl.uniform3fv( u_ColorLoc, chipOnePrimary );
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matOne));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 74);
    // One Dollar Markers 
    theta = 0;
    var chipMarkers;
    for (var i = 0; i < 8; i++){
        chipMarkers = mat4();
        theta -= 45;
        var thetaRadians = theta * Math.PI/180;
        translationX = (Math.cos(thetaRadians) + (5 * chipXCenterOne))/5;
        translationY = (Math.sin(thetaRadians) + (5 * chipYCenterOne))/5;
        rm = rotateZ(theta);
        tm = translate(translationX, translationY, 0.0);
        sm = scalem(scalingMarkerOne, scalingMarkerOne, scalingMarkerOne);
        chipMarkers = mult(sm, chipMarkers);
        chipMarkers = mult(rm, chipMarkers);
        chipMarkers = mult(tm, chipMarkers);
        chipMarkers = mult(pm, chipMarkers);
        gl.uniform3fv( u_ColorLoc, chipOneSecondary );
        gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
        gl.drawArrays( gl.TRIANGLE_FAN, 74, 6);
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
    gl.uniform3fv( u_ColorLoc, chipFivePrimary );
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matFive));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 74);
    // Five Dollar Markers 
    theta = 0;
    var chipMarkers;
    for (var i = 0; i < 8; i++){
        chipMarkers = mat4();
        theta -= 45;
        var thetaRadians = theta * Math.PI/180;
        translationX =  (Math.cos(thetaRadians)*.20 + chipXCenterFive);
        translationY =  (Math.sin(thetaRadians)*.20 + chipYCenterFive);
        rm = rotateZ(theta);
        tm = translate(translationX, translationY, 0.0);
        sm = scalem(scalingMarkerFive, scalingMarkerFive, scalingMarkerFive);
        chipMarkers = mult(sm, chipMarkers);
        chipMarkers = mult(rm, chipMarkers);
        chipMarkers = mult(tm, chipMarkers);
        chipMarkers = mult(pm, chipMarkers);
        gl.uniform3fv( u_ColorLoc, chipFiveSecondary );
        gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
        gl.drawArrays( gl.TRIANGLE_FAN, 74, 6);
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
    gl.uniform3fv( u_ColorLoc, chipTenPrimary );
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matTen));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 74);
    // Ten Dollar Markers 
    theta = 0;
    var chipMarkers;
    for (var i = 0; i < 8; i++){
        chipMarkers = mat4();
        theta -= 45;
        var thetaRadians = theta * Math.PI/180;
        translationX =  (Math.cos(thetaRadians)*.20 + chipXCenterTen);
        translationY =  (Math.sin(thetaRadians)*.20 + chipYCenterTen);
        rm = rotateZ(theta);
        tm = translate(translationX, translationY, 0.0);
        sm = scalem(scalingMarkerTen, scalingMarkerTen, scalingMarkerTen);
        chipMarkers = mult(sm, chipMarkers);
        chipMarkers = mult(rm, chipMarkers);
        chipMarkers = mult(tm, chipMarkers);
        chipMarkers = mult(pm, chipMarkers);
        gl.uniform3fv( u_ColorLoc, chipTenSecondary );
        gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
        gl.drawArrays( gl.TRIANGLE_FAN, 74, 6);
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
    gl.uniform3fv( u_ColorLoc, chipTwoFivePrimary );
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matTwoFive));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 74);
    // TwoFive Dollar Markers 
    theta = 0;
    var chipMarkers;
    for (var i = 0; i < 8; i++){
        chipMarkers = mat4();
        theta -= 45;
        var thetaRadians = theta * Math.PI/180;
        translationX =  (Math.cos(thetaRadians)*.20 + chipXCenterTwoFive);
        translationY =  (Math.sin(thetaRadians)*.20 + chipYCenterTwoFive);
        rm = rotateZ(theta);
        tm = translate(translationX, translationY, 0.0);
        sm = scalem(scalingMarkerTwoFive, scalingMarkerTwoFive, scalingMarkerTwoFive);
        chipMarkers = mult(sm, chipMarkers);
        chipMarkers = mult(rm, chipMarkers);
        chipMarkers = mult(tm, chipMarkers);
        chipMarkers = mult(pm, chipMarkers);
        gl.uniform3fv( u_ColorLoc, chipTwoFiveSecondary );
        gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
        gl.drawArrays( gl.TRIANGLE_FAN, 74, 6);
    }
    showBets(position, betValues);
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    if (state == 1){
        selectBets();
    }
    window.requestAnimFrame(render);
}
