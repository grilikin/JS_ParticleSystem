#version 300 es

uniform vec2 resolution;
uniform vec2 offset;
uniform float scale;
uniform float point_size;
uniform float max_mass;
uniform float max_speed;

in vec2 position;
in vec2 velocity;
in float mass;

out vec3 color;

void main() {
    vec2 translated_pos = ((position * scale + offset) / resolution * 2.0 - 1.0);
    gl_Position = vec4(translated_pos * vec2(1, -1.0), 0, 1);
    gl_PointSize = point_size * mass;

    vec2 translated_velocity = 0.5 + velocity / max_speed / 2.0;
    float translated_mass = 0.5 + mass / max_mass * 0.25;
    color = vec3(translated_mass, translated_velocity.yx);
}