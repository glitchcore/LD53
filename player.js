import * as THREE from 'three';

function Player(app, controls) {
    this.target_point = new THREE.Vector3();
    this.player_velocity = new THREE.Vector3();
    this.is_moving = false;

    app.setEventHandler("update", ({time, delta}) => {
        // TODO warning of overshooting target
        
        const MOVEMENT_DELTA = 0.1;

        if(this.is_moving) {
            controls.position.add(this.player_velocity.clone().multiplyScalar(delta));

            let target_dist = controls.position.distanceTo(this.target_point);

            if(target_dist < MOVEMENT_DELTA) {
                this.is_moving = false;
            }
        }
    });

    this.set_target = (target) => {
        this.target_point = target;

        this.player_velocity = this.target_point
            .clone().sub(controls.position).normalize().multiplyScalar(0.002);

        this.is_moving = true;
    }
}

export {Player};
