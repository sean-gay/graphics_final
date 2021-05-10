"use strict";

var canvas;
var gl;

var numVertices  = 144;

var program;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var u_textureSamplerLoc;

var texture;

var max = 52;
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
    "backImage"
];

// cards to be dealt to player and dealer
var playerCard1 = cards[Math.floor(Math.random(0, 52) * max)];
var playerCard2 = cards[Math.floor(Math.random(0, 52) * max)];
var dealerCard1 = cards[Math.floor(Math.random(0, 52) * max)];
var dealerCard2 = cards[Math.floor(Math.random(0, 52) * max)];
console.log(playerCard1);
console.log(playerCard2);
console.log(dealerCard1);
console.log(dealerCard2);


var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
    vec4( -0.75, -0.75,  0.0, 1.0 ),
    vec4( -0.75,  -0.25,  0.0, 1.0 ),
    vec4( -0.25,  -0.25,  0.0, 1.0 ),
    vec4( -0.25, -0.75,  0.0, 1.0 ),
    vec4( -0.75, -0.75, 0.0, 1.0 ),
    vec4( -0.75,  -0.25, 0.0, 1.0 ),
    vec4( -0.25,  -0.25, 0.0, 1.0 ),
    vec4( -0.25, -0.75, 0.0, 1.0 ),
    // second card
    vec4( -0.5, -0.5,  0.0, 1.0 ),
    vec4( -0.5,  0.0,  0.0, 1.0 ),
    vec4( 0.0,  0.0,  0.0, 1.0 ),
    vec4( 0.0, -0.5,  0.0, 1.0 ),
    vec4( -0.5, -0.5, 0.0, 1.0 ),
    vec4( -0.5,  0.0, 0.0, 1.0 ),
    vec4( 0.0,  0.0, 0.0, 1.0 ),
    vec4( 0.0, -0.5, 0.0, 1.0 ),
    // third card
    vec4( 0.25, 0.25,  0.0, 1.0 ),
    vec4( 0.25,  0.75,  0.0, 1.0 ),
    vec4( 0.75,  0.75,  0.0, 1.0 ),
    vec4( 0.75, 0.25,  0.0, 1.0 ),
    vec4( 0.25, 0.25, 0.0, 1.0 ),
    vec4( 0.25,  0.75, 0.0, 1.0 ),
    vec4( 0.75,  0.75, 0.0, 1.0 ),
    vec4( 0.75, 0.25, 0.0, 1.0 ),
    // fourth card
    vec4( 0.5, 0.5,  0.0, 1.0 ),
    vec4( 0.5,  1.0,  0.0, 1.0 ),
    vec4( 1.0,  1.0,  0.0, 1.0 ),
    vec4( 1.0, 0.5,  0.0, 1.0 ),
    vec4( 0.5, 0.5, 0.0, 1.0 ),
    vec4( 0.5,  1.0, 0.0, 1.0 ),
    vec4( 1.0,  1.0, 0.0, 1.0 ),
    vec4( 1.0, 0.5, 0.0, 1.0 )
];

var vertexColors = [
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // black
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // yellow
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // green
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 ),   // cyan
    // second set
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // black
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // yellow
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // green
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 ),   // cyan
    // third set
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // black
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // yellow
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // green
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 ),   // cyan
    // fourth set
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // black
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // yellow
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // green
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 )   // cyan
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var rxyz;

var pm = mat4(1.0); // identity matrix

// Compute the sines and cosines of theta for each of
//   the three axes in one computation.
var rotateSpeed = 0.0;
var angles = (Math.PI / 180) * (rotateSpeed);
var c = Math.cos( angles );
var s = Math.sin( angles );

var ctMatrix = mat4(1.0);
var u_ctMatrixLoc;

rxyz = [mat4( 1.0,  0.0,  0.0, 0.0,
             0.0,  c,    -s,  0.0,
             0.0,  s,    c,   0.0,
             0.0,  0.0,  0.0, 1.0 ),
        mat4( c,   0.0,  s,   0.0,
             0.0, 1.0,  0.0, 0.0,
             -s,  0.0,  c,   0.0,
             0.0, 0.0,  0.0, 1.0 ),
        mat4( c,    -s,  0.0, 0.0,
             s,    c,   0.0, 0.0,
             0.0,  0.0, 1.0, 0.0,
             0.0,  0.0, 0.0, 1.0 )
        ];

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );

    //Flips the source data along its vertical axis when texImage2D or texSubImage2D are called when param is true. The initial value for param is false.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );

    // Check if the image is a power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
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


function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    // two
    quad( 9, 8, 11, 10 );
    quad( 10, 11, 15, 14 );
    quad( 11, 8, 12, 15 );
    quad( 14, 13, 9, 10 );
    quad( 12, 13, 14, 15 );
    quad( 13, 12, 8, 9 );
    // three
    quad( 17, 16, 19, 18 );
    quad( 18, 19, 23, 22 );
    quad( 19, 16, 20, 23 );
    quad( 22, 21, 17, 18 );
    quad( 20, 21, 22, 23 );
    quad( 21, 20, 16, 17 );
    // four
    quad( 25, 24, 27, 26 );
    quad( 26, 27, 31, 30 );
    quad( 27, 24, 28, 31 );
    quad( 30, 29, 25, 26 );
    quad( 28, 29, 30, 31 );
    quad( 29, 28, 24, 25 );
}

function drawCard(start, end, cardID) {
    //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var image = document.getElementById(cardID);
    configureTexture( image );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var a_vTexCoordLoc = gl.getAttribLocation( program, "a_vTexCoord" );
    gl.vertexAttribPointer( a_vTexCoordLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vTexCoordLoc );

    gl.activeTexture( gl.TEXTURE0 );
    u_textureSamplerLoc = gl.getUniformLocation(program, "u_textureSampler");
    gl.uniform1i(u_textureSamplerLoc, 0);

    u_ctMatrixLoc = gl.getUniformLocation(program, "u_ctMatrix");

    pm = mult(rxyz[axis], pm);
    ctMatrix = mult(ortho(-1, 1, -1, 1, -1, 1), pm);
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(ctMatrix));
    gl.drawArrays( gl.TRIANGLES, start, end );
}

function drawAll() {
    //var playerCard1 = cards[Math.floor(Math.random(0, 52) * max)];
    //var playerCard2 = cards[Math.floor(Math.random(0, 52) * max)];
    drawCard(0, numVertices/4, playerCard1);
    drawCard(numVertices/4, numVertices/4, playerCard2);
    drawCard(numVertices/2, numVertices/4, dealerCard1);
    drawCard(numVertices*(3/4), numVertices/4, "backImage");
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var a_vColorLoc = gl.getAttribLocation( program, "a_vColor" );
    gl.vertexAttribPointer( a_vColorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vColorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var a_vPositionLoc = gl.getAttribLocation( program, "a_vPosition" );
    gl.vertexAttribPointer( a_vPositionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vPositionLoc );

    //
    // Initialize a texture
    //
    /*
     var image = new Image();
     image.onload = function() {
     configureTexture( image );
     }
     image.src = "notre-dame-cathedral.jpg"
     */
    ///*
    //var image = document.getElementById("2HImage");
    //configureTexture( image );
    //*/

/*
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var a_vTexCoordLoc = gl.getAttribLocation( program, "a_vTexCoord" );
    gl.vertexAttribPointer( a_vTexCoordLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vTexCoordLoc );

    gl.activeTexture( gl.TEXTURE0 );
    u_textureSamplerLoc = gl.getUniformLocation(program, "u_textureSampler");
    gl.uniform1i(u_textureSamplerLoc, 0);

    u_ctMatrixLoc = gl.getUniformLocation(program, "u_ctMatrix");
*/
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};

    render();

}



var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //pm = mult(rxyz[axis], pm);
    //ctMatrix = mult(ortho(-1, 1, -1, 1, -1, 1), pm);
    //gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(ctMatrix));
    //gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame( render );
    drawAll();
}
