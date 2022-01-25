class GameMap extends AcGameObject {
    constructor(playground) {
        super()
        this.playground = playground

        this.$canvas = $('<canvas tabindex=0></canvas>')
        this.ctx = this.$canvas[0].getContext('2d')
        this.ctx.canvas.width = this.playground.width
        this.ctx.canvas.height = this.playground.height

        this.playground.$playground.append(this.$canvas)

        this.grass = new Image()
        this.grass.src = '/static/image/map/grass.png'

        this.stone = new Image()
        this.stone.src = '/static/image/map/stone2.png'

        this.decorate_x = []
        this.decorate_y = []
        // this.start()
    }

    start() {
        this.$canvas.focus()

        for (let i = 0; i < 70; i++) {
            let x = Math.random() * this.playground.vwidth / this.playground.scale - 0.15
            let y = Math.random() * this.playground.vheight / this.playground.scale - 0.15

            if (x < 0) x += 0.2
            if (y < 0) y += 0.2

            this.decorate_x.push(x)
            this.decorate_y.push(y)
        }

        console.log(this.decorate_x);
        console.log(this.decorate_y);
    }

    resize() {
        this.ctx.canvas.width = this.playground.width
        this.ctx.canvas.height = this.playground.height

        this.ctx.fillStyle = "rgba(0, 0, 0, 1)"
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }

    update() {
        // console.log('Map update');
        this.render()
    }

    render() {
        this.ctx.fillStyle = "#a5bd7a"
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        let scale = this.playground.scale
        for (let i = 0; i < 50; i++) {
            let ctx_x = this.decorate_x[i] - this.playground.cx, ctx_y = this.decorate_y[i] - this.playground.cy;
            this.ctx.drawImage(this.grass, ctx_x  * scale, ctx_y * scale, 0.1 * scale, 0.1 * scale);
        }

        for (let i = 50; i < 70; i++) {
            let ctx_x = this.decorate_x[i] - this.playground.cx, ctx_y = this.decorate_y[i] - this.playground.cy;
            this.ctx.drawImage(this.stone, ctx_x  * scale, ctx_y * scale, 0.15 * scale, 0.1 * scale);
        }
    }
}
