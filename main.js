import * as THREE from 'three';
import {Player} from "./player";

var loader = new THREE.FileLoader();
loader.load('app.json', function (text) {
    var player = new Player();

    player.load(JSON.parse(text));
    player.setSize( window.innerWidth, window.innerHeight );
    player.play();

    const ancors = [
        "hall_0",
        "hall_1",
        "main_window",
        "main_room_0",
        "second_window"
    ];

    // pointer_drag
    player.setEventHandler("keydown", (e) => {
        
    });

    let intersects = [];

    player.setEventHandler("pointerdown", _ => {
        if(intersects.length > 0){
            let ancor = intersects[0].object.position;
            player.controls.position.x = ancor.x;
            player.controls.position.z = ancor.z;
        }
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    player.setEventHandler("pointermove", e => {
        pointer.x = (e.x / window.innerWidth ) * 2 - 1;
	    pointer.y = - (e.y / window.innerHeight ) * 2 + 1;
    });

    player.setEventHandler("update", () => {
        // update the picking ray with the camera and pointer position
        raycaster.setFromCamera(pointer, player.getCamera());

        // calculate objects intersecting the picking ray
        intersects = raycaster.intersectObjects(
            ancors.map(x => player.getSceneObject(x))
        );
    });

    document.body.appendChild( player.dom );

    window.addEventListener( 'resize', function () {
        player.setSize(window.innerWidth, window.innerHeight);
    });
} );
