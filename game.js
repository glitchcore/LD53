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
    vec2 texture_uv = vec2(
        1.0 - vuv.x + sin(time + 10. * vuv.y) * 0.01 + sin(time),
        1.3 - vuv.y + sin(time + 10. * vuv.x) * 0.01
    );
    vec2 texture_uv_2 = vec2(
        1.0 - vuv.x + sin(time + 100. * vuv.y) * 0.01 + sin(time),
        1.3 - vuv.y + sin(time + 200. * vuv.x) * 0.01
    );
    vec4 color = texture(in_texture, texture_uv);
    vec4 color_2 = texture(in_texture, texture_uv_2);
    gl_FragColor = vec4(1.0, color.r, color_2.r, 1.0);
}
`;

function game(app) {
    (new THREE.TextureLoader()).load("assets/sky.jpg", (texture) => {
        // app.getSceneObject("sky").material = new THREE.MeshBasicMaterial({map: texture});
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        context.font = 'Bold 40px Arial';
        context.fillStyle = 'white';
        context.fillText('Hello, world!', 0, 50);
        let hello_texture = new THREE.CanvasTexture(canvas);

        let material = new THREE.ShaderMaterial({
            uniforms: {
                in_texture: {value: hello_texture},
                time: {value: 0},
            },
            fragmentShader: fragmentShader,
            vertexShader: vertexShader
        });

        app.setEventHandler("update", ({time, _delta}) => {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            context.font = 'Bold 40px Arial';
            context.fillStyle = 'white';
            context.fillText(`Your order will arrive in {time} minutes.`, 0, 50);
            material.uniforms.in_texture.value = new THREE.CanvasTexture(canvas);
            material.uniforms.time.value = time / 1000;
        });

        app.scene.getObjectByName("sky").material = material;
    });

    (new THREE.TextureLoader()).load("assets/door.png", (texture) => {
        app.scene.getObjectByName("door").material = new THREE.MeshBasicMaterial({map: texture});
    });

    (new THREE.TextureLoader()).load("assets/mondrian.png", (texture) => {
        app.scene.getObjectByName("second_image").material = new THREE.MeshBasicMaterial({map: texture});
    });

    (new THREE.TextureLoader()).load("assets/neon.jpg", (texture) => {
        app.scene.getObjectByName("ground").material = new THREE.MeshBasicMaterial({map: texture});
    });

    (new THREE.TextureLoader()).load("assets/clock.png", (texture) => {
        app.scene.getObjectByName("clock").material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            color: 0x808080,
        });
    });

    const listener = new THREE.AudioListener();
    app.camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/eta.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(1.0);
        sound.play();
    });

    app.setEventHandler("update", ({time, delta}) => {
        app.scene.getObjectByName("clock").rotation.x += delta * 0.1;
    })

    const { position, quaternion } = app.camera;
    let controls = new SpatialControls(position, quaternion, app.dom);
    controls.settings.rotation.sensitivity = 4.0;
    controls.position.x = -3.0;
    controls.position.y = 1.5;
    controls.position.z = 1.2;

    app.camera.fov = 20;

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