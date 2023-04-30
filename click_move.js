import * as THREE from 'three';

function ClickMove(app, controls, player) {
    app.scene.getObjectByName("ancors").visible = false;

    const click_map = {
        main_window_plane: {distance: 1.2},
        second_window: {distance: 1.2},
    };

    const move_map = {
        hall_0_poi: {ancor: "hall_0_ancor"},
        main_window_poi: {ancor: "main_window_ancor"},
        table_poi: {ancor: "table_ancor"},
        hall_1_poi: {ancor: "hall_1_ancor"},
        chair_poi: {ancor: "chair_ancor"},
        second_window_poi: {ancor: "second_window_ancor"},
        bed_poi: {ancor: "bed_ancor"},
        door_poi: {ancor: "door_ancor"},
    };

    let last_click_time = 0;

    let move_intersects = [];
    let click_intersects = [];

    let handler = null;

    app.setEventHandler("pointerup", _ => {
        if(performance.now() - last_click_time > 200) {
            console.log("long click");
            return;
        }

        console.log("move:", move_intersects);
        console.log("click:", click_intersects);

        if(click_intersects.length > 0) {
            let name = click_intersects[0].object.name;
            let distance = click_intersects[0].distance;

            if(name in click_map && distance < click_map[name].distance) {
                if(handler !== null) {
                    handler(name);
                }

                return; // prevent move
            }
        }

        if(move_intersects.length > 0) {
            let group = move_intersects[0].object.parent.name;

            if(group in move_map) {
                let ancor = app.scene.getObjectByName(move_map[group].ancor);

                let target_point = ancor.position.clone();
    
                player.set_target(target_point);
            }
        }
    });

    app.setEventHandler("pointerdown", _ => {
        last_click_time = performance.now();
    });

    const move_raycaster = new THREE.Raycaster();
    const click_raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    app.setEventHandler("pointermove", e => {
        pointer.x = (e.x / window.innerWidth ) * 2 - 1;
	    pointer.y = - (e.y / window.innerHeight ) * 2 + 1;
    });

    let click_intersects_poi = Object.keys(click_map).map(x => app.scene.getObjectByName(x));
    let move_intersects_poi = Object.keys(move_map).map(x => app.scene.getObjectByName(x));

    app.setEventHandler("update", ({time, delta}) => {
        move_raycaster.setFromCamera(pointer, app.camera);
        // TODO raycaster ignore walls
        click_intersects = move_raycaster.intersectObjects(click_intersects_poi);

        click_raycaster.setFromCamera(pointer, app.camera);
        // TODO raycaster ignore walls
        move_intersects = click_raycaster.intersectObjects(move_intersects_poi);
    });

    this.setHandler = (_handler) => { handler = _handler; }
}

export {ClickMove};
