import * as THREE from 'three';
import { SpatialControls } from "spatial-controls";
import { Player } from "./player";
import { ClickMove } from './click_move';

const vertexShader = `
varying vec2 vuv;

void main() {
    vuv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vuv;
uniform sampler2D in_texture;
uniform float time;

void main() {
    vec4 color = texture(in_texture, vuv + vec2(0., sin(time + vuv.y) * vuv.y));
    gl_FragColor = vec4(color.r, 0.0, sin(time + vuv.x * 100.), 1.0);
}
`;

function game(app) {
    (new THREE.TextureLoader()).load("assets/sky.jpg", (texture) => {
        // app.getSceneObject("sky").material = new THREE.MeshBasicMaterial({map: texture});
        let material = new THREE.ShaderMaterial({
            uniforms: {
                in_texture: {value: texture},
                time: {value: 0},
            },
            fragmentShader: fragmentShader,
            vertexShader: vertexShader
        });

        app.setEventHandler("update", ({time, _delta}) => {
            material.uniforms.time.value = time / 1000;
        });

        app.scene.getObjectByName("sky").material = material;
    });

    const { position, quaternion } = app.camera;
    let controls = new SpatialControls(position, quaternion, app.dom);
    controls.settings.rotation.sensitivity = 4.0;
    controls.position.x = -3.0;
    controls.position.y = 1.5;
    controls.position.z = 1.2;

    // this.controls.settings.translation.enabled = false;
    app.setEventHandler("update", ({time}) => {
        controls.update(time);
    });

    let player = new Player(app, controls);

    let click_move = new ClickMove(app, controls, player);

    click_move.setHandler(name => {
        console.log("click on:", name);
    });
}

export {game};