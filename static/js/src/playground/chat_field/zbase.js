class ChatField {
    constructor(playground) {
        this.playground = playground

        this.$history = $(`<div class="ac-game-chat-field-history">历史记录</div>`)
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`)
        this.$history.hide();
        this.$input.hide();

        this.func_id = null

        this.is_open = false

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start() 
    }

    start() {
        this.add_listening_events()
    }

    add_listening_events() {
        let outer = this

        this.$input.keydown(function (e) {
            console.log(e.which);
            if (e.which === 27) { // ESC
                console.log('esc');
                outer.hide_input()
                return false
            } else if (e.which === 13) {
                let username = outer.playground.root.settings.username
                let text = outer.$input.val()
                if (text) {
                    outer.add_message(username, text, false)
                    outer.$input.val('')
                    outer.playground.multiplayer_socket.send_message(username, text)
                } else {
                    outer.hide_input()
                }
                return false
            }
        })

        this.$history.on('contextmenu', function () {
            return false
        })
    }

    add_message(username, text, is_enemy) {
        let msg = $(`<div>[${username}] : ${text}</div>`)
        this.$history.append(msg)
        this.$history.scrollTop(this.$history[0].scrollHeight)
        this.show_history()

        let outer = this
        if (is_enemy && !this.is_open) {
            if (this.func_id) {
                clearTimeout(this.func_id)
            }

            this.func_id = setTimeout(function () {
                outer.hide_history()
                outer.func_id = null
            }, 3000)
        }
    }
    
    show_history() {
        this.$history.fadeIn()
    }

    hide_history() {
        this.$history.fadeOut()
    }

    show_input() {
        this.show_history()
        this.is_open = true
        this.$input.show()
        this.$input.focus()
    }

    hide_input() {
        this.$input.hide()
        this.hide_history()
        this.is_open = false
        this.playground.game_map.$canvas.focus()
    }
}