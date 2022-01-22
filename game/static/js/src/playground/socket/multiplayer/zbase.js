class MultiPlayerSocket {
    constructor(playground, uuid) {
        this.playground = playground
        this.uuid = uuid
        this.ws = new WebSocket("wss://app122.acapp.acwing.com.cn/wss/multiplayer/")
        
        this.start()
    }

    start() {
        this.listening_events()
    }

    listening_events() {
        this.on_open()
        this.on_receive()
    }

    on_open() {
        let outer = this
        console.log(this.uuid, outer.uuid);
        this.ws.onopen = function () {
            outer.send_create_player(outer.uuid, outer.playground.root.settings.username, outer.playground.root.settings.photo)    
        }        
    }

    on_receive() {
        let outer = this
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data)
            let uuid = data.uuid

            if (uuid === outer.uuid)
                return false
            
            let event = data.event
            if (event === 'create_player') {
                console.log(data);
                outer.receive_create_player(uuid, data.username, data.photo)
            } else if (event === 'move_to') {
                outer.receive_move_to(uuid, data.tx, data.ty)
            } else if (event === 'shoot_fireball') {
                console.log('event shhot_fireball');
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid)
            } else if (event === 'attack') {
                console.log(data);
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid)
            } else if (event === 'blink') {
                console.log('receive blink');
                outer.receive_blink(uuid, data.x, data.y, data.vx, data.vy)
            } else if (event === 'message') {
                console.log('receive message');
                outer.receive_message(data.username, data.text)
            }
        }
    }

    get_player(uuid) {
        let players = this.playground.players
        for (let i = 0; i < players.length; i++) {
            let player = players[i]
            if (player.uuid === uuid)
                return player
        }

        return null
    }

    send_message(username, text) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'message',
            'uuid': outer.uuid,
            'username': username,
            'text' : text
        }))
    }

    receive_message(username, text) {

        this.playground.chat_field.add_message(username, text, true)
    }

    send_blink(x, y, vx, vy) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'x': x,
            'y': y,
            'vx': vx,
            'vy': vy,
        }));
    }

    receive_blink(uuid, x, y, vx, vy) {
        let player = this.get_player(uuid)
        if (player) {
            player.blink(x, y, vx, vy)
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid' : ball_uuid
        }))
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid)
        let attackee = this.get_player(attackee_uuid)

        if (attackee && attacker) {
            attackee.receive_attacked(x, y, angle, damage, ball_uuid, attacker)
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid
        }))
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        console.log(uuid, tx, ty, ball_uuid);
        let player = this.get_player(uuid)
        if (player) {
            let fireball = player.shoot_fireball(tx, ty)
            fireball.uuid = ball_uuid
        }
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid)

        if (player) {
            player.move_to(tx, ty)
        }
    }

    send_move_to(uuid, tx, ty) {
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uuid': uuid,
            'tx': tx,
            'ty' : ty
        }))
    }

    send_create_player(uuid, username, photo) {
        let player = { 'event': 'create_player', 'uuid': uuid, 'username': username, 'photo': photo }
        this.ws.send(JSON.stringify(player))
        console.log(JSON.stringify(player));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

}