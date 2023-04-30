import * as THREE from 'three';
import {App} from "./three_app";
import {game} from "./game";

var loader = new THREE.FileLoader();
loader.load('app.json', function (text) {
    var app = new App();

    app.load(JSON.parse(text));
    app.setSize(window.innerWidth, window.innerHeight);
    game(app);
    app.play();

    document.body.appendChild(app.dom);

    window.addEventListener('resize', function () {
        app.setSize(window.innerWidth, window.innerHeight);
    });
});
