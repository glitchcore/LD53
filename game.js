import * as THREE from 'three';
import { SpatialControls } from "spatial-controls";

function game(app) {
    let controls;
    
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
    let target_point = new THREE.Vector2();
    let player_velocity = new THREE.Vector2();
    let is_moving = false;

    app.setEventHandler("pointerdown", _ => {
        if(intersects.length > 0){
            is_moving = true;
            let ancor = intersects[0].object.position;
            target_point.x = ancor.x;
            target_point.y = ancor.z;
            player_velocity.x = (target_point.x - controls.position.x) * 0.001;
            player_velocity.y = (target_point.y - controls.position.z) * 0.001;
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
        intersects = raycaster.intersectObjects(
            ancors.map(x => app.getSceneObject(x))
        );

        const MOVEMENT_DELTA = 0.1;

        if(is_moving) {
            controls.position.x += delta * player_velocity.x;
            controls.position.z += delta * player_velocity.y;

            let target_dist = Math.pow(controls.position.x - target_point.x, 2)
                + Math.pow(controls.position.z - target_point.y, 2);

            if(target_dist < MOVEMENT_DELTA) {
                is_moving = false;
            }
        }
    });


    const { position, quaternion } = app.camera;
    controls = new SpatialControls(position, quaternion, app.dom);
    controls.settings.rotation.sensitivity = 4.0;
    controls.position.x = -3.0;
    controls.position.y = 1.5;
    controls.position.z = 1.2;

    // this.controls.settings.translation.enabled = false;
    app.setEventHandler("update", ({time}) => {
        controls.update(time);
    });
}

export {game};