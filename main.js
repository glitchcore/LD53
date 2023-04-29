import * as THREE from 'three';
import { SpatialControls } from "spatial-controls";

let app = {
    player: function () {
        var renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio ); // TODO: Use player.setPixelRatio()

        var loader = new THREE.ObjectLoader();
        var camera, scene;

        var events = {};

        var dom = document.createElement( 'div' );
        dom.appendChild(renderer.domElement);

        this.dom = dom;

        this.width = 500;
        this.height = 500;

        this.setEventHandler = (event, handler) => {
            events[event].push(handler);
        }

        this.load = function ( json ) {

            var project = json.project;

            if ( project.shadows !== undefined ) renderer.shadowMap.enabled = project.shadows;
            if ( project.shadowType !== undefined ) renderer.shadowMap.type = project.shadowType;
            if ( project.toneMapping !== undefined ) renderer.toneMapping = project.toneMapping;
            if ( project.toneMappingExposure !== undefined ) renderer.toneMappingExposure = project.toneMappingExposure;
            if ( project.useLegacyLights !== undefined ) renderer.useLegacyLights = project.useLegacyLights;

            this.setScene(loader.parse(json.scene));
            this.setCamera(loader.parse(json.camera));

            events = {
                init: [],
                start: [],
                stop: [],
                keydown: [],
                keyup: [],
                pointerdown: [],
                pointerup: [],
                pointermove: [],
                update: []
            };

            const { position, quaternion } = camera;
            this.controls = new SpatialControls(position, quaternion, dom);
            this.controls.settings.rotation.sensitivity = 4.0;
            this.controls.position.x = -3.0;
            this.controls.position.y = 1.5;
            this.controls.position.z = 1.2;
            // this.controls.settings.translation.enabled = false;
            this.setEventHandler("update", ({time}) => {
                this.controls.update(time);
            });

            var scriptWrapParams = 'player,renderer,scene,camera';
            var scriptWrapResultObj = {};

            for (var eventKey in events) {
                scriptWrapParams += ',' + eventKey;
                scriptWrapResultObj[eventKey] = eventKey;
            }

            var scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace( /\"/g, '' );

            for ( var uuid in json.scripts ) {
                var object = scene.getObjectByProperty( 'uuid', uuid, true );

                if ( object === undefined ) {
                    console.warn( 'APP.Player: Script without object.', uuid );
                    continue;
                }

                var scripts = json.scripts[ uuid ];

                for ( var i = 0; i < scripts.length; i ++ ) {

                    var script = scripts[ i ];

                    var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

                    for ( var name in functions ) {

                        if ( functions[ name ] === undefined ) continue;

                        if ( events[ name ] === undefined ) {

                            console.warn( 'APP.Player: Event type not supported (', name, ')' );
                            continue;

                        }

                        events[name].push(functions[name].bind( object ));
                    }

                }

            }

            dispatch(events.init, arguments);
        };

        this.setCamera = function(value) {
            camera = value;
            camera.aspect = this.width / this.height;
            camera.updateProjectionMatrix();
        };

        this.getCamera = () => camera;

        this.setScene = function (value) {
            scene = value;
        };

        this.getSceneObject = function(name) {
            return scene.getObjectByName(name);
        }

        this.setPixelRatio = function (pixelRatio) {
            renderer.setPixelRatio(pixelRatio);
        };

        this.setSize = function (width, height) {
            this.width = width;
            this.height = height;

            if (camera) {
                camera.aspect = this.width / this.height;
                camera.updateProjectionMatrix();
            }

            renderer.setSize(width, height);
        };

        function dispatch(array, event) {
            for ( var i = 0, l = array.length; i < l; i ++ ) {
                array[i](event);
            }
        }

        var time, startTime, prevTime;

        function animate() {
            time = performance.now();

            try {
                dispatch(events.update, {
                    time: time - startTime, delta: time - prevTime
                });
            } catch ( e ) {
                console.error((e.message || e), (e.stack || ''));
            }

            renderer.render(scene, camera);

            prevTime = time;
        }

        this.play = function () {
            startTime = prevTime = performance.now();

            document.addEventListener( 'keydown', onKeyDown );
            document.addEventListener( 'keyup', onKeyUp );
            document.addEventListener( 'pointerdown', onPointerDown );
            document.addEventListener( 'pointerup', onPointerUp );
            document.addEventListener( 'pointermove', onPointerMove );

            dispatch(events.start, arguments);

            renderer.setAnimationLoop(animate);
        };

        this.stop = function () {
            document.removeEventListener( 'keydown', onKeyDown );
            document.removeEventListener( 'keyup', onKeyUp );
            document.removeEventListener( 'pointerdown', onPointerDown );
            document.removeEventListener( 'pointerup', onPointerUp );
            document.removeEventListener( 'pointermove', onPointerMove );

            dispatch(events.stop, arguments);

            renderer.setAnimationLoop(null);
        };

        this.dispose = function () {
            renderer.dispose();

            camera = undefined;
            scene = undefined;        this.render = function (time) {
                dispatch(events.update, { time: time * 1000, delta: 0 /* TODO */ } );
    
                renderer.render(scene, camera);
            };
        };

        //

        function onKeyDown(event) {
            dispatch(events.keydown, event);
        }

        function onKeyUp( event ) {
            dispatch(events.keyup, event);
        }

        function onPointerDown(event) {
            dispatch(events.pointerdown, event);
        }

        function onPointerUp(event) {
            dispatch(events.pointerup, event);
        }

        function onPointerMove(event) {
            dispatch(events.pointermove, event);
        }
    }
};

var loader = new THREE.FileLoader();
loader.load('app.json', function (text) {
    var player = new app.player();

    player.load(JSON.parse(text));
    player.setSize( window.innerWidth, window.innerHeight );
    player.play();

    function key_to_digit(key) {
        // are you okay?
        switch(key) {
            case "1": return 1;
            case "2": return 2;
            case "3": return 3;
            case "4": return 4;
            case "5": return 5;
            case "6": return 6;
            case "7": return 7;
            case "8": return 8;
            case "9": return 9;
            case "0": return 0;
            default: return null;
        }
    }

    const ancors = [
        "hall_0",
        "hall_1",
        "main_window",
        "main_room_0",
        "second_window"
    ];

    // pointer_drag
    player.setEventHandler("keydown", (e) => {
        console.log("key:", e.key);
        let num = key_to_digit(e.key);
        if(num !== null) {
            console.log("go to", num);
            // player.controls.position =
            
        }
        // player.controls.position.x += 0.1;
    });

    let intersects = [];

    player.setEventHandler("pointerdown", _ => {
        console.log(intersects);
        if(intersects.length > 0){
            let ancor = intersects[0].object.position;
            console.log(ancor);
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
    })

    document.body.appendChild( player.dom );

    window.addEventListener( 'resize', function () {
        player.setSize(window.innerWidth, window.innerHeight);
    });
} );
