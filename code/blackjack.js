"use strict";

var gl;
var vertices;
var u_ColorLoc;
var u_ctMatrixLoc;
var theta = 0.0;
var u_vCenterLoc;

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
var chipXCenter, chipYCenter;

// Cards 
var card;

// Gameplay
var state = 0;
var bet = 0;
var tally = 0;

window.onload = function init(){
    // general webgl setup
    var canvas = document.getElementById( "gl-canvas" );
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
    while (userStack > 100 || userStack < 0){
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
    chipXCenter = 0.5;
    chipYCenter = 0.5;

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

// The Initial Game State
// User can pick bets
function selectBets(){
    //Draw Chips 
    var trans;
    var tm, sm, rm, pm;
    var translationX;
    var translationY;
    gl.uniform2fv(u_vCenterLoc, vec2(0, 0));

    // One Dollar
    chipXCenter = -.5;
    chipYCenter = .5;
    matOne = mat4();
    theta = 0.0; // in degree
    trans = 0;
    var scalingOut = .2;
    translationX = chipXCenter;
    translationY = chipYCenter; 
    sm = scalem(scalingOut, scalingOut, scalingOut);
    rm = rotateZ(theta);
    tm = translate(translationX, translationY, 0.0);
    matOne = mult(sm, matOne);
    matOne = mult(rm, matOne);
    matOne = mult(tm, matOne);
    pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    matOne = mult(pm, matOne);
    gl.uniform3fv( u_ColorLoc, chipOnePrimary );
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(matOne));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 74);

    // Markers 
    theta = 0;
    var chipMarkers;
    for (var i = 0; i < 8; i++){
        chipMarkers = mat4();
        var scalingMarker = .03;
        theta -= 45;
        var thetaRadians = theta * Math.PI/180;
        translationX = Math.cos(thetaRadians)*.20 + chipXCenter;
        translationY = Math.sin(thetaRadians)*.20 + chipYCenter;
        rm = rotateZ(theta);
        tm = translate(translationX, translationY, 0.0);
        sm = scalem(scalingMarker, scalingMarker, scalingMarker);
        chipMarkers = mult(sm, chipMarkers);
        chipMarkers = mult(rm, chipMarkers);
        chipMarkers = mult(tm, chipMarkers);
        chipMarkers = mult(pm, chipMarkers);
        gl.uniform3fv( u_ColorLoc, chipOneSecondary );
        gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(chipMarkers));
        gl.drawArrays( gl.TRIANGLE_FAN, 74, 6);
    }

}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    if (state == 1){
        selectBets();
    }
    window.requestAnimFrame(render);
}
