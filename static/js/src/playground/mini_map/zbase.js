class MiniMap extends AcGameObject {
    constructor(playground) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx
        this.players = this.playground.players
    }

    start() {
    }

    last_update() {
        this.render()
    }

    render() {
        let scale = this.playground.scale
        let h = scale * 0.2
        let w = h * 16 / 9
        this.ctx.fillStyle="rgba(0, 0, 0, 0.3)";
        this.ctx.fillRect(0, 0, w, h);
    
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i]
            if (player) {
                let x = player.x * scale, y = player.y * scale
                if (player.role === 'self') {
                    this.ctx.fillStyle = 'skyblue';
                } else {
                    this.ctx.fillStyle = 'pink'
                }
                this.ctx.beginPath();
                this.ctx.arc((x / this.playground.vwidth) * w, (y / this.playground.vheight) * h, 0.01 * scale, 0, Math.PI * 2, false);
                this.ctx.fill();
            }
        }
    }
}