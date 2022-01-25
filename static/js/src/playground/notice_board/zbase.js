class NoticeBoard extends AcGameObject {

    constructor(playground, player_cnt) {
        super()
        this.playground = playground
        this.ctx = playground.game_map.ctx
        this.text = '已就绪 0 人'
        this.player_cnt = player_cnt
    }

    start() {

    }

    write(text) {
        this.text = text
    }

    last_update() {
        this.render()
    }
    
    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        if (this.playground.state === 'waitting') {
            this.ctx.fillText("正在匹配", this.playground.width / 2, 20);
            this.ctx.fillText("按ESC退出匹配", this.playground.width / 2, 50);
        } else if (this.playground.state === 'fighting') {
            this.ctx.fillText(`${this.playground.players.length} / ${this.player_cnt}`, this.playground.width / 2, 20);
        }
    }

}