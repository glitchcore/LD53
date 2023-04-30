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

    app.setEventHandler("pointerdown", _ => {
        if(intersects.length > 0){
            let ancor = intersects[0].object.position;
            controls.position.x = ancor.x;
            controls.position.z = ancor.z;
        }
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    app.setEventHandler("pointermove", e => {
        pointer.x = (e.x / window.innerWidth ) * 2 - 1;
	    pointer.y = - (e.y / window.innerHeight ) * 2 + 1;
    });

    app.setEventHandler("update", () => {
        // update the picking ray with the camera and pointer position
        raycaster.setFromCamera(pointer, app.camera);

        // calculate objects intersecting the picking ray
        intersects = raycaster.intersectObjects(
            ancors.map(x => app.getSceneObject(x))
        );
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