class LevelChoice {
    constructor(menu) {
        this.menu = menu
        this.$choice = $(`
        <div class="ac-game-menu">
            <div class="ac-game-menu-field">
                <div class="ac-game-menu-field-item ac-game-menu-field-item-single-esay">
                    简单
                </div>
                <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-single-difficult">
                    困难
                </div>
                <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-single-hell">
                    噩梦
                </div>
                <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-single-back">
                    返回
                </div>
            </div>
        </div>
        `)

        this.menu.root.$ac_game.append(this.$choice)
        this.$easy = this.$choice.find('.ac-game-menu-field-item-single-esay')
        this.$difficult = this.$choice.find('.ac-game-menu-field-item-single-difficult')
        this.$hell = this.$choice.find('.ac-game-menu-field-item-single-hell')
        this.$back = this.$choice.find('.ac-game-menu-field-item-single-back')

        this.start()
    }

    start() {
        this.hide()
        this.add_listening_events()
    }

    add_listening_events() {
        let outer = this

        this.$easy.click(function () {
            console.log('easy');
            let easy = {
                level: 1,
                robot_num: 15,
                robot_speed: 1,
                is_track: false
            }
            outer.menu.root.playground.show('single', easy)
        })

        this.$difficult.click(function () {
            console.log('difficult');
            let difficult = {
                level: 2,
                robot_num: 24,
                robot_speed: 1.1,
                is_track: true
            }
            outer.menu.root.playground.show('single', difficult)
        })

        this.$hell.click(function () {
            console.log('hell');
            let hell = {
                level: 2,
                robot_num: 29,
                robot_speed: 1.3,
                is_track: true
            }
            outer.menu.root.playground.show('single', hell)
        })

        this.$back.click(function () {
            console.log('back');
            outer.hide()
            outer.menu.show()
        })
    }

    show() {
        this.$choice.show()
    }

    hide() {
        this.$choice.hide()
    }


}