/*-------------------------------------------------------------------------
06_FlipTriangle.js

1) Change the color of the triangle by keyboard input
   : 'r' for red, 'g' for green, 'b' for blue
2) Flip the triangle vertically by keyboard input 'f' 
---------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, updateText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { Square } from "./Square.js";

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;   // shader program
let vao;      // vertex array object
let colorTag = "red"; // triangle 초기 color는 red
let verticalFlip = 1.0; // 1.0 for normal, -1.0 for vertical flip
let textOverlay3; // for text output third line (see util.js)

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 600;
    canvas.height = 600;

    resizeAspectRatio(gl, canvas);

    // Initialize WebGL settings
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);
    
    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function setupKeyboardEvents() {
    document.addEventListener('keydown', (event) => {
        if (event.key == 'f') {
            //console.log("f key pressed");
            updateText(textOverlay3, "f key pressed");
            verticalFlip = -verticalFlip; 
        }
        else if (event.key == 'r') {
            //console.log("r key pressed");
            updateText(textOverlay3, "r key pressed");
            colorTag = "red";
        }
        else if (event.key == 'g') {
            //console.log("g key pressed");
            updateText(textOverlay3, "g key pressed");
            colorTag = "green";
        }
        else if (event.key == 'b') {
            //console.log("b key pressed");
            updateText(textOverlay3, "b key pressed");
            colorTag = "blue";
        }
    });
}

function setupBuffers() {
    const vertices = new Float32Array([
        -0.5, -0.5, 0.0,  // Bottom left
         0.5, -0.5, 0.0,  // Bottom right
         0.0,  0.5, 0.0   // Top center
    ]);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    shader.setAttribPointer('aPos', 3, gl.FLOAT, false, 0, 0);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    MySquare.render();
}

let MySquare;
const Direction = {
    "ArrowUp" : [0.0, 0.01],
    "ArrowDown" : [0.0, -0.01],
    "ArrowLeft" : [-0.01,0.0],
    "ArrowRight" : [0.01,0,0],
}

function MyFunction() {
    window.addEventListener('keydown', (event) => {
    // 아래 if condition을 if (event.key in keys)로 간단히 할 수도 있음
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        // do something here ...
        if (!MySquare) return;
        if (event.key in Direction){
            MySquare.move(...Direction[event.key]);
            render();
        }
    }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
            event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            // do something here
        if (!MySquare) return;
        }
    });
    window.addEventListener('resize', () => {
            render();
    });

}
 
async function main() {
    try {

        // WebGL 초기화
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        // 셰이더 초기화
        await initShader();

        // setup text overlay (see util.js)
        setupText(canvas, "Use arrow keys to move the rectangle", 1);
        
        // Setup Square Object
        MySquare = new Square({gl : gl, shader : shader});

        gl.clear(gl.COLOR_BUFFER_BIT);

        MySquare.render();
        MyFunction();
        return true;

    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}

// call main function
main().then(success => {
    if (!success) {
        console.log('프로그램을 종료합니다.');
        return;
    }
}).catch(error => {
    console.error('프로그램 실행 중 오류 발생:', error);
});
