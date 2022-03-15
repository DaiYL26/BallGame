class MultiPlayerSocket {
    constructor(playground, uuid) {
        this.playground = playground
        this.uuid = uuid
        this.ws = new WebSocket("ws://120.77.222.189/wss/multiplayer/")
        this.start()
    }

    start() {
        this.listening_events()
    }

    listening_events() {
        this.on_open()
        this.on_receive()
    }

    on_close() {
        let outer = this
        console.log('on close')
        this.ws.onclose = function () {
            outer.send_create_player(-999, outer.playground.root.settings.username, outer.playground.root.settings.photo)
        }
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
            console.log(data);
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
            } else if (event === 'accelerate') {
                console.log('accelerate');
                outer.receive_accelerate(uuid)
            } else if (event === 'poison_attack') {
                outer.receive_poison_attack(data.attackee_uuid, data.x, data.y, data.damage)
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

    send_poison_attack(attackee_uuid, x, y, damage, type) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'poison_attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'damage': damage,
            'type': type
        }))
    }

    receive_poison_attack(attackee_uuid, x, y, damage) {
        let player = this.get_player(attackee_uuid)
        if (player) {
            player.x = x
            player.y = y
            if (damage > 100) {
                player.hp -= damage
            }
            player.attacked_by_poison()
        }
    }

    send_accelerate() {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'accelerate',
            'uuid': outer.uuid,
        }))
    }

    receive_accelerate(uuid) {
        let player = this.get_player(uuid)
        if (player) {
            player.start_accelerate()
        }
    }

    send_message(username, text) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'message',
            'uuid': outer.uuid,
            'username': username,
            'text': text
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

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid, type) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
            'type': type
        }))
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid)
        let attackee = this.get_player(attackee_uuid)

        if (attackee && attacker) {
            attackee.receive_attacked(x, y, angle, damage, ball_uuid, attacker)
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid, type) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
            'type': type
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
            'ty': ty
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
            this.playground.vwidth / 2 / this.playground.scale,
            this.playground.vheight / 2 / this.playground.scale,
            0.05,
            "white",
            0.2,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

}