"use strict";

var gl;
var vertices;
var u_ColorLoc;

// Initial Info
var Name;
var userStack;

window.onload = function init(){
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
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

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
}
