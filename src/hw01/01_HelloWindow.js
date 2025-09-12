// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
const length = 500;
canvas.width = length;
canvas.height = length;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
function renderBackgroundRectangle(start, color) {
    gl.scissor(start.X, start.Y, canvas.width / 2, canvas.height / 2);
    gl.clearColor(...color);
    gl.enable(gl.SCISSOR_TEST);
    render();
}

renderBackgroundRectangle({X : 0, Y : 0}, [0,0,1,1]);
renderBackgroundRectangle({X : canvas.width / 2, Y : 0}, [1,1,0,1]);
renderBackgroundRectangle({X : 0, Y : canvas.height / 2}, [0,1,0,1]);
renderBackgroundRectangle({X : canvas.width / 2, Y : canvas.height / 2}, [1,0,0,1]);


// Start rendering

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);    
    // Draw something here
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    canvas.width = length;
    canvas.height = length;
    
    renderBackgroundRectangle({X : 0, Y : 0}, [0,0,1,1]);
    renderBackgroundRectangle({X : canvas.width / 2, Y : 0}, [1,1,0,1]);
    renderBackgroundRectangle({X : 0, Y : canvas.height / 2}, [0,1,0,1]);
    renderBackgroundRectangle({X : canvas.width / 2, Y : canvas.height / 2}, [1,0,0,1]);
});

