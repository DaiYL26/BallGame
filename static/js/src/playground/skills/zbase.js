class FireBall extends AcGameObject {

    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx
        this.player = player
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
        this.color = color
        this.speed = speed
        this.radius = radius
        this.move_length = move_length
        this.damage = damage

        this.eps = 0.01

    }


    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy()
            return false
        } 

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        // 碰撞检测
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i]
            // 不是自己，且碰撞
            if (player !== this.player && this.is_collision(player)) {
                this.attack(player)
            }
        }

        this.render()
    }

    // 攻击玩家
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        // 让玩家受伤
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    get_dist(tx, ty, x, y) {
        let dx = tx - x, dy = ty - y
        return Math.sqrt(dx * dx + dy * dy)
    }

    // 碰撞检测，两圆心的距离
    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    render() {
        let scale = this.playground.scale
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}