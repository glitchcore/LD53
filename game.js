import * as THREE from 'three';
import { SpatialControls } from "spatial-controls";
import { Player } from "./player";


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

    app.getSceneObject("sky").material = new THREE.ShaderMaterial({
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
    
    const ancors = [
        "hall_0",
        "hall_1",
        "main_window",
        "main_room_0",
        "second_window"
    ];

    // pointer_drag
    app.setEventHandler("keydown", (e) => {
        
    });

    let intersects = [];

    app.setEventHandler("pointerdown", _ => {
        if(intersects.length > 0) {
            let ancor = intersects[0].object.position;
            let target_point = new THREE.Vector3(
                ancor.x,
                controls.position.y,
                ancor.z
            );

            player.set_target(target_point)
        }
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    app.setEventHandler("pointermove", e => {
        pointer.x = (e.x / window.innerWidth ) * 2 - 1;
	    pointer.y = - (e.y / window.innerHeight ) * 2 + 1;
    });

    app.setEventHandler("update", ({time, delta}) => {
        // update the picking ray with the camera and pointer position
        raycaster.setFromCamera(pointer, app.camera);

        // calculate objects intersecting the picking ray
        // TODO raycaster ignore walls
        intersects = raycaster.intersectObjects(
            ancors.map(x => app.getSceneObject(x))
        );
    });
}

export {game};