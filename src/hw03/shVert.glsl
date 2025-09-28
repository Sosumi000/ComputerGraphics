#version 300 es

in vec2 a_position;

uniform float uPointSize;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = uPointSize;
} 