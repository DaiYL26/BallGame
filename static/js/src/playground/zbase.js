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
    }

    show() {  // 打开playground界面
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        // console.log(this.width, this.height);
        this.game_map = new GameMap(this);
        this.players = []
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true))
        
        for (let i = 0 ; i < 5; i ++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false))
        }
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

}
