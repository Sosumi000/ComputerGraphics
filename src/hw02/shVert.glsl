#version 300 es

layout (location = 0) in vec3 aPos;

uniform float verticalFlip;
uniform vec2 squareOffset;
 
void main() {
    gl_Position = vec4(aPos[0] + squareOffset[0], aPos[1]  + squareOffset[1], aPos[2], 1.0);
} 