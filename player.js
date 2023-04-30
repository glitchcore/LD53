import * as THREE from 'three';
import { SpatialControls } from "spatial-controls";

let Player = function () {
    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio ); // TODO: Use player.setPixelRatio()

    var loader = new THREE.ObjectLoader();

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

        const { position, quaternion } = this.camera;
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
            var object = this.scene.getObjectByProperty( 'uuid', uuid, true );

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
        this.camera = value;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    };

    this.setScene = function (value) {
        this.scene = value;
    };

    this.getSceneObject = function(name) {
        return this.scene.getObjectByName(name);
    }

    this.setPixelRatio = function (pixelRatio) {
        renderer.setPixelRatio(pixelRatio);
    };

    this.setSize = function (width, height) {
        this.width = width;
        this.height = height;

        if (this.camera) {
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
        }

        renderer.setSize(width, height);
    };

    function dispatch(array, event) {
        for ( var i = 0, l = array.length; i < l; i ++ ) {
            array[i](event);
        }
    }

    var time, startTime, prevTime;

    this.animate = () => {
        time = performance.now();

        try {
            dispatch(events.update, {
                time: time - startTime, delta: time - prevTime
            });
        } catch ( e ) {
            console.error((e.message || e), (e.stack || ''));
        }

        renderer.render(this.scene, this.camera);

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

        renderer.setAnimationLoop(this.animate);
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

        this.camera = undefined;
        this.scene = undefined;        this.render = function (time) {
            dispatch(events.update, { time: time * 1000, delta: 0 /* TODO */ } );

            renderer.render(scene, this.camera);
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

export {Player};