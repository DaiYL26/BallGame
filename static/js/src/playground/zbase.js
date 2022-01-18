class AcGamePlayground {
    constructor (root) {
        this.root = root
        this.$playground = $(`<div class="ac-game-playground"></div>`)
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    get_random_color() {
        let colors = ["skyblue", "yellow", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
        this.$playground.hide()
        let outer = this
        $(window).resize(function () {
            outer.resize()
        })
    }

    resize() {
        console.log('resize');
        this.width = this.$playground.width()
        this.height = this.$playground.height()
        let unit = Math.min(this.width / 16, this.height / 9)
        this.width = 16 * unit
        this.height = 9 * unit

        this.scale = this.height

        if (this.game_map) {
            this.game_map.resize()
        }
    }

    show() {  // 打开playground界面
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        // console.log(this.width, this.height);        
        this.resize()
        this.game_map = new GameMap(this);
        this.players = []
        this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.15 / this.scale, true))
        
        for (let i = 0 ; i < 5; i ++) {
            this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, this.get_random_color(), this.height * 0.15 / this.scale, false))
        }
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

}