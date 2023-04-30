import * as THREE from 'three';
import { SpatialControls } from "spatial-controls";
import { Player } from "./player";
import { ClickMove } from './click_move';

function game(app) {
    /*(new THREE.TextureLoader()).load("assets/sky.jpg", (texture) => {
        app.getSceneObject("sky").material = new THREE.MeshBasicMaterial({map: texture});
    });*/

    const vertexShader = `
    varying vec2 vuv;

    void main() {
        vuv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

    const fragmentShader = `
    varying vec2 vuv;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, sin(vuv.x * 100.), 1.0);
    }
    `;

    app.scene.getObjectByName("sky").material = new THREE.ShaderMaterial({
        fragmentShader: fragmentShader,
        vertexShader: vertexShader
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