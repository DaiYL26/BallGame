class Accelerate extends AcGameObject {
    constructor(playground, player) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx
        this.player = player
        this.span = 3
        this.attack_cnt = 0
    }

    start() {

    }

    attack_incerse() {
        this.attack_cnt ++
    }

    update() {
        this.render()
        this.span -= this.timedelta / 1000
        if (this.span < this.player.eps) {
            this.player.cancel_accelerate()
            
        }
    }

    on_desttory() {
        this.ctx.lineWidth = 2
        this.strokeStyle = 'white'
    }

    render() {
        let scale = this.playground.scale
        let ctx_x = this.player.x - this.playground.cx, ctx_y = this.player.y - this.playground.cy;
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'skyblue'
        this.ctx.lineWidth = 5
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.player.radius * scale * 1.5, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.lineWidth = 2
        this.strokeStyle = 'white'
    }

}