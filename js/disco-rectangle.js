;(function(){
// Simple WebGL shader demo 1: 
// Animate a pulsating multicolored triangle using a single interleaved vertex buffer.
// Features a combination of absolute-position FragCoord and varying color coordinates.
// renders into a canvas with ID "disco1".
// Author: Maciek Smuga-Otto (macieksmuga@gmail.com)


// GLSL vertex shader
var VSHADER_SOURCE = 
  'attribute vec4 a_Position; attribute vec4 a_Color;' +
  'varying vec4 v_Color;' +
  'uniform mat4 u_PositionShift;' +
  'void main(){gl_Position = u_PositionShift * a_Position; v_Color = a_Color;}';

// GLSL fragment shader
// honestly, 90% of the magic for this demo happens inside here
var FSHADER_SOURCE = 
  'precision mediump float; varying vec4 v_Color;' +
  'uniform mat4 u_ColorShift;' +
  'void main(){' +
    // dd is the length of the side of each pulsing square.
    'float dd = 15.0;' +
    // rd is the normalized radial distance from the center of each pulsing square
    'float rd = sqrt(pow(0.5 - mod(gl_FragCoord.x,dd)/dd, 2.0) + pow(0.5 - mod(gl_FragCoord.y,dd)/dd, 2.0));' +
    // cs is the rotating color matrix
    'vec4 cs = v_Color * u_ColorShift;' +
    'gl_FragColor = vec4(max(cs.x - rd, 0.0), max(cs.y - rd, 0.0), max(cs.z - rd, 0.0), 1.0);}';

var canvas = document.getElementById('disco1');
var gl = canvas.getContext('webgl');

// Create shader objects
var vshader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vshader, VSHADER_SOURCE);
gl.compileShader(vshader);

var fshader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fshader, FSHADER_SOURCE);
gl.compileShader(fshader);

// Create and configure a program object
var program = gl.createProgram();
gl.attachShader(program, vshader);
gl.attachShader(program, fshader);
gl.linkProgram(program);
  
// clear the drawing area
gl.clearColor(0.0,0.0,0.1,1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// handles for uniform variables (for animating rotations)
var u_ColorShift = gl.getUniformLocation(program, 'u_ColorShift');
var u_PositionShift = gl.getUniformLocation(program, 'u_PositionShift');

// handles for attribute variables (that get positions and colors off the vertex buffer)
var a_Position = gl.getAttribLocation(program, 'a_Position');
var a_Color = gl.getAttribLocation(program, 'a_Color');

// create, bind & populate buffer (CPU side)
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// contents of buffer: Positions and colors
// var vertexData = new Float32Array([
//    //x,   y,   r,   g,   b,
// 	 0.0, 0.5, 1.0, 0.0, 0.0,
//   -0.5,-0.5, 0.0, 1.0, 0.0,
//    0.5,-0.5, 0.0, 0.0, 1.0]);
var vertexData = new Float32Array([
   //x,   y,   r,   g,   b,
   -0.8, -0.8, 1.0, 0.0, 0.0,
   -0.8,  0.8, 0.5, 0.5, 0.0,
    0.8,  0.8, 0.0, 0.5, 0.5,
    0.8, -0.8, 0.0, 0.0, 1.0]);
var FSIZE = vertexData.BYTES_PER_ELEMENT;
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

// run the program
gl.useProgram(program);

// animation setup
var degB = 0;
var ANGLE_PER_SECOND = 120;
var lastStepTime = Date.now();

// returns a transformation matrix for rotation by angle radB (in radians)
// around an axis defined by the vector (x,y,z)
function rotationMatrix3D(radB,x,y,z){
  var s = Math.sin(radB);
  var c = Math.cos(radB);
  // normalize the vector
  var vlen = Math.sqrt(x*x + y*y + z*z);
  if (vlen !== 1.0){
    var rlen = 1.0 / vlen;
    x *= rlen;
    y *= rlen;
    z *= rlen;
  }
  var nc = 1.0 - c;
  return new Float32Array([
    x*x*nc +   c, x*y*nc + z*s, x*z*nc - y*s, 0.0,
    x*y*nc - z*s, y*y*nc +   c, y*z*nc + x*s, 0.0,
    x*z*nc + y*s, y*z*nc - x*s, z*z*nc +   c, 0.0,
    0.0         , 0.0         , 0.0         , 1.0]);
}

// single animation frame
function tick(){
  gl.clear(gl.COLOR_BUFFER_BIT);

  // calculate amount of angle to rotate by, given ANGLE_PER_SECOND
  var radB = degB * Math.PI / 180.0;
  var now = Date.now();
  degB += ANGLE_PER_SECOND * (now - lastStepTime) / 1000.0 ;
  lastStepTime = now;

  // set matrix for color rotation
  gl.uniformMatrix4fv(u_ColorShift, false, 
    rotationMatrix3D(radB,1.0,1.0,1.0));

  // set matrix for position rotation
  gl.uniformMatrix4fv(u_PositionShift, false, 
    rotationMatrix3D(radB/2,Math.cos(radB/11),Math.sin(radB/7),1.0));

  // describe position data layout in buffer (GPU side)
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  // color data layout next (GPU side)
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  requestAnimationFrame(tick);
}

// run the animation
tick();

})();
