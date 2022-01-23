class ScoreBoard extends AcGameObject{
    constructor(playground) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx

        this.state = null
    }

    start() {
        console.log('score board start');
    }

    win() {
        if (this.state) {
        return
        }
        this.state = "win";
        let outer = this;
        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    lose() {
        if (this.state) {
            return
        }
        this.state = "lose";
        let outer = this;
        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    add_listening_events() {
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;

        $canvas.on('click', function() {
            outer.playground.hide();
            outer.playground.root.menu.show();
        });
    }

    render() {
        let len = this.playground.height;
        this.ctx.fillStyle = 'white'
        this.ctx.font = `${len * 0.2}px serif`;
        this.ctx.textAlign = 'center'
        if (this.state === "win") {
            this.ctx.fillText("You Win !", this.playground.width / 2 , this.playground.height / 2 );
            this.ctx.font = `${len * 0.05}px serif`;
            this.ctx.fillText("click any position to quit.", this.playground.width / 2, this.playground.height / 2 + len * 0.1);
        } else if (this.state === "lose") {
            this.ctx.fillText("You Lose !", this.playground.width / 2, this.playground.height / 2);
            this.ctx.font = `${len * 0.05}px serif`;
            this.ctx.fillText("click any position to quit.", this.playground.width / 2, this.playground.height / 2 + len * 0.1);
        }
    }

    last_update() {
        this.render()
    }
}