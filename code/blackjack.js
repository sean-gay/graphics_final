"use strict";

var gl;
var vertices;
var u_ColorLoc;

// Initial Setup Info
var Name;
var userStack;

// Chips 
var chipVertices;
var chipOnePrimary;
var chipOneSecondary;
var chipFivePrimary;
var chipFiveSecondary;
var chipTenPrimary;
var chipTenSecondary;
var chipTwoFivePrimary;
var chipTwoFiveSecondary;

// Cards 
var card;

// Gameplay
var currState = 0;

window.onload = function init(){
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.14, 0.58, 0.15, 1.0 );

    // Setup Chips
    createChips();
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var a_vPositionLoc = gl.getAttribLocation( program, "a_vPosition" );
    gl.vertexAttribPointer( a_vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vPositionLoc );

    u_ColorLoc = gl.getUniformLocation(program, "u_Color");

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
}

function createChips(){
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

    chipOnePrimary = vec3(0.4, 0.4, 1.0);

}

function createCards(){

}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
}
