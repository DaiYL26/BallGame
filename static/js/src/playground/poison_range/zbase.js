class PoisonRange extends AcGameObject {
    constructor(playground) {
        super()
        this.playground = playground
        this.ctx = playground.game_map.ctx
        this.shrink = -10
        this.bound_x = 0
        this.bound_y = 0
    }

    start() {

    }

    last_update() {
        if (this.playground.state === 'fighting') {
            this.shrink += this.timedelta / 1000
        }
        if (this.shrink > 0) {
            this.render()
            this.render_poison()
        }
    }


    render_poison() {
        let scale = this.playground.scale
        let ctx_x = 0 - this.playground.cx, ctx_y = 0 - this.playground.cy;

        this.ctx.fillStyle="rgba(101,94,140, 0.3)";
        this.ctx.fillRect(ctx_x * scale, ctx_y * scale, this.playground.vwidth, this.bound_y * scale);
        
        ctx_y = this.playground.vheight / scale - this.bound_y - this.playground.cy
        this.ctx.fillRect(ctx_x * scale, ctx_y * scale, this.playground.vwidth, this.bound_y * scale);

        ctx_y = this.bound_y - this.playground.cy
        let h = this.playground.vheight / scale - this.bound_y * 2
        this.ctx.fillRect(ctx_x * scale, ctx_y * scale, this.bound_x * scale, h * scale);

        ctx_x = this.playground.vwidth / scale - this.bound_x - this.playground.cx
        this.ctx.fillRect(ctx_x * scale, ctx_y * scale, this.bound_x * scale, h * scale);
    }

    render() {
        let scale = this.playground.scale
        this.bound_x = this.shrink * this.playground.vwidth / 360 / scale
        this.bound_y = this.shrink * this.playground.vheight / 360 / scale

        this.bound_x = Math.min(this.bound_x, (this.playground.vwidth / 2 - 0.3 * scale * 16 / 9) / scale)
        this.bound_y = Math.min(this.bound_y, (this.playground.vheight / 2 - 0.3 * scale) / scale)

        let ctx_x = this.bound_x - this.playground.cx, ctx_y = this.bound_y - this.playground.cy;
        let width = this.playground.vwidth - 2 * this.bound_x * scale
        let heigth = this.playground.vheight - 2 * this.bound_y * scale

        this.ctx.strokeStyle = "rgba(215,212,240, 1)";
        this.ctx.lineWidth = 5
        this.ctx.strokeRect(ctx_x * scale, ctx_y * scale, width, heigth);
        this.ctx.lineWidth = 2
    }
}