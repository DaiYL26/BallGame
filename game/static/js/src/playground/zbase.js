class AcGamePlayground {
    constructor (root) {
        this.root = root
        this.$playground = $(`<div>Game page</div>`)
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    start() {
        this.$playground.hide()
    }

    show() {  // 打开playground界面
        this.$playground.show();
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

}