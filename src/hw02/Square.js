
let gl;
let shader;  
let vao;     

function setupBuffers(vertices) {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    shader.setAttribPointer('aPos', 3, gl.FLOAT, false, 0, 0);
}

function render(color, verticalFlip) {
    shader.setVec4("uColor", color);
    shader.setFloat("verticalFlip", verticalFlip);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // 4 is the number of vertices
}


export class Square {
    constructor(params = {gl, shader}) {
        gl = params.gl;
        shader = params.shader;

        this.X = 0;
        this.Y = 0;
    }
    render(){
        let vertices = new Float32Array([
            -0.1, -0.1, 0.0,  
            0.1, -0.1, 0.0,
            0.1, 0.1, 0.0,
            -0.1 , 0.1, 0.0   
        ]);
        setupBuffers(vertices);

        shader.use();
        shader.setVec2("squareOffset", new Float32Array([this.X, this.Y]));
        
        render(new Float32Array([1.0, 0.0, 0.0, 1.0]),1.0);
    }

    move(X, Y){
        this.X += X;
        this.X = Math.min(0.9, Math.max(-0.9, this.X));
        this.Y += Y;
        this.Y = Math.min(0.9, Math.max(-0.9, this.Y));
    }
}