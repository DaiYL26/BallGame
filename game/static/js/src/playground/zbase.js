class AcGamePlayground {
    constructor (root) {
        this.root = root
        this.$playground = $(`<div class="ac-game-playground"></div>`)
        this.root.$ac_game.append(this.$playground);
        
        this.n = 2

        this.start();
    }

    get_random_color() {
        let colors = ["skyblue", "yellow", "pink", "grey", "green", "snow"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
        this.$playground.hide()
        let outer = this
        $(window).resize(function () {
            outer.resize()
        })
    }

    re_calculate_cx_cy(x, y) {
        this.cx = x - 0.5 * this.width / this.scale;
        this.cy = y - 0.5 * this.height / this.scale;
        
        if (this.cy < 0) this.cy = 0
        if (this.cy > 1) this.cy = 1
        if (this.cx < 0) this.cx = 0
        if (this.cx > 1.77) this.cx = 1.77
    }

    resize() {
        this.width = this.$playground.width()
        this.height = this.$playground.height()
        let unit = Math.min(this.width / 16, this.height / 9)
        this.width = 16 * unit
        this.height = 9 * unit

        this.vheight = this.n * this.height
        this.vwidth = this.n * this.width

        this.scale = this.height

        if (this.game_map) {
            this.game_map.resize()
        }
    }

    show(mode, level_params) {  // 打开playground界面
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.resize()

        this.game_map = new GameMap(this);
        this.poison = new PoisonRange(this)
        
        this.score_board = new ScoreBoard(this)
        
        this.players = []
        this.state = 'waitting'

        this.players.push(new Player(this, this.vwidth / 2 / this.scale, this.vheight / 2 / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.2 / this.scale, 'self', this.root.settings.username, this.root.settings.photo))
        this.re_calculate_cx_cy(this.players[0].x, this.players[0].y)
        if (mode === 'single') {
            this.mode = 'single'
            this.state = 'fighting'
            for (let i = 0 ; i < 15; i ++) {
                this.players.push(new Player(this, this.vwidth  * 0.5 / this.scale, this.vheight * 0.5 / this.scale, this.height * 0.05 / this.scale, this.get_random_color(), this.height * 0.2 / this.scale, 'robot', null, null))
            }
            this.notice_board = new NoticeBoard(this, this.players.length)

        } else if (mode === 'multi') {
            
            this.notice_board = new NoticeBoard(this, 3)
            this.chat_field = new ChatField(this)

            this.player_count = 0
            this.mode = 'multi'
            this.multiplayer_socket = new MultiPlayerSocket(this, this.players[0].uuid)
        }

        this.minii_map = new MiniMap(this)
        
    }

    hide() {  // 关闭playground界面
        while (this.players && this.players.length > 0) {
            this.players[0].destroy()
        }

        if (this.game_map) {
            this.game_map.destroy()
            this.game_map = null
        }
        if (this.notice_board) {
            this.notice_board.destroy()
            this.notice_board = null
        }
        if (this.score_board) {
            this.score_board.destroy()
            this.score_board = null
        }

        this.$playground.empty()
        this.$playground.hide()
    }

}
