// Animate a multicolored cube using a single interleaved vertex buffer.
// set different color on each vertex: Black, C, M, Y, R, G, B, White.
// overlay an improved nutty disco lights fragment shader.

// copyright Maciek Smuga-Otto 2016, free to use with attribution.

var canvas = document.getElementById('cubespin-canvas');
var gl = canvas.getContext('webgl');

// Create shader objects
var vshader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vshader, document.getElementById('cubespin-shader-vs').text);
gl.compileShader(vshader);

var fshader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fshader, document.getElementById('cubespin-shader-fs').text);
gl.compileShader(fshader);

// Create and configure a program object
var program = gl.createProgram();
gl.attachShader(program, vshader);
gl.attachShader(program, fshader);
gl.linkProgram(program);
  
// clear the drawing area
gl.clearColor(0.1,0.1,0.1,1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// handles for uniform variables (for animating rotations)
var u_Shift = gl.getUniformLocation(program, 'u_Shift');
var u_PxvMatrix = gl.getUniformLocation(program, 'u_PxvMatrix');
var u_PovMatrix = gl.getUniformLocation(program, 'u_PovMatrix');
var u_RotMatrix = gl.getUniformLocation(program, 'u_RotMatrix');

// create, bind & populate vertex buffer
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
var vertexData = new Float32Array([
    // FACE 1: -x
   -0.3,-0.3,-0.3, 1.0, 0.0, 0.0,
   -0.3,-0.3, 0.3, 1.0, 1.0, 0.0,
   -0.3, 0.3,-0.3, 0.0, 1.0, 1.0,

   -0.3, 0.3, 0.3, 1.0, 1.0, 1.0,
   -0.3,-0.3, 0.3, 1.0, 1.0, 0.0,
   -0.3, 0.3,-0.3, 0.0, 1.0, 1.0,

    // FACE 2: +x
    0.3,-0.3,-0.3, 0.0, 0.0, 0.0,
    0.3,-0.3, 0.3, 0.0, 0.0, 1.0,
    0.3, 0.3,-0.3, 0.0, 1.0, 0.0,

    0.3, 0.3, 0.3, 1.0, 0.0, 1.0,
    0.3,-0.3, 0.3, 0.0, 0.0, 1.0,
    0.3, 0.3,-0.3, 0.0, 1.0, 0.0,

    // FACE 3: -y
    -0.3,-0.3,-0.3, 1.0, 0.0, 0.0,
    -0.3,-0.3, 0.3, 1.0, 1.0, 0.0,
     0.3,-0.3,-0.3, 0.0, 0.0, 0.0,

     0.3,-0.3, 0.3, 0.0, 0.0, 1.0,
    -0.3,-0.3, 0.3, 1.0, 1.0, 0.0,
     0.3,-0.3,-0.3, 0.0, 0.0, 0.0,

     // FACE 4: +y
    -0.3, 0.3,-0.3, 0.0, 1.0, 1.0,
    -0.3, 0.3, 0.3, 1.0, 1.0, 1.0,
     0.3, 0.3,-0.3, 0.0, 1.0, 0.0,

    -0.3, 0.3, 0.3, 1.0, 1.0, 1.0,
     0.3, 0.3,-0.3, 0.0, 1.0, 0.0,
     0.3, 0.3, 0.3, 1.0, 0.0, 1.0,

     // FACE 5: -z
    -0.3,-0.3,-0.3, 1.0, 0.0, 0.0,
    -0.3, 0.3,-0.3, 0.0, 1.0, 1.0,
     0.3,-0.3,-0.3, 0.0, 0.0, 0.0,

    -0.3, 0.3,-0.3, 0.0, 1.0, 1.0,
     0.3,-0.3,-0.3, 0.0, 0.0, 0.0,
     0.3, 0.3,-0.3, 0.0, 1.0, 0.0,

     // FACE 6: +z
     0.3, 0.3, 0.3, 1.0, 0.0, 1.0,
    -0.3, 0.3, 0.3, 1.0, 1.0, 1.0,
     0.3,-0.3, 0.3, 0.0, 0.0, 1.0,

    -0.3, 0.3, 0.3, 1.0, 1.0, 1.0,
     0.3,-0.3, 0.3, 0.0, 0.0, 1.0,
    -0.3,-0.3, 0.3, 1.0, 1.0, 0.0,
	]);

var FSIZE = vertexData.BYTES_PER_ELEMENT;
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

// run the program
gl.useProgram(program);
gl.enable(gl.DEPTH_TEST); // enable hidden surface removal

// animation setup
var degB = 0;
var ANGLE_PER_SECOND = 20;
var lastStepTime = Date.now();

// single animation frame
function tick(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // calculate amount of angle to rotate by, given ANGLE_PER_SECOND
  var radB = degB * Math.PI / 180.0;
  var now = Date.now();
  degB += ANGLE_PER_SECOND * (now - lastStepTime) / 1000.0 ;
  lastStepTime = now;

  // set the disco balls shift factor
  gl.uniform1f(u_Shift, degB * 2);

  // create transform matrix based on degB and radB as computed above.
  // Matrix4 is a utility object defined in the cuon-matrix library, 
  // https://github.com/yukoba/WebGLBook/tree/master/lib
  var xformMatrix = new Matrix4();
  
  // set matrix for triangle rotation around Z axis (in XY plane)
  // arguments are (angle_deg, axis_x, axis_y, axis_z)
  xformMatrix.setRotate(degB*5, 0.0, 0.0, 1.0);
  gl.uniformMatrix4fv(u_RotMatrix, false, xformMatrix.elements);

  // set matrix for POV rotation around Y axis (in the XZ plane)
  // arguments are (eyePos_x, eyePos_y, eyePos_z, lookAt_x, lookAt_y, lookAt_z, up_x, up_y, up_z)
  xformMatrix.setLookAt(Math.sin(radB), -0.5, Math.cos(radB), 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_PovMatrix, false, xformMatrix.elements);

  // set matrix for perspective transformation (rectangular solid -> Frustum)
  // arguments are (angle_of_view, aspect_ratio, cutoff_plane_near, cutoff_plane_far)
  xformMatrix.setPerspective(60, 1.0, 0.1, 2.0);
  gl.uniformMatrix4fv(u_PxvMatrix, false, xformMatrix.elements);

  // describe position data layout in buffer (GPU side)
  var a_Position = gl.getAttribLocation(program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  // color data layout next (GPU side)
  var a_Color = gl.getAttribLocation(program, 'a_Color');
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  gl.drawArrays(gl.TRIANGLES, 0, 36);

  requestAnimationFrame(tick);
}

// run the animation
tick();
