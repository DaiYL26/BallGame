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


}class AcGameMenu {
    constructor(root) {
        this.root = root;

        this.$menu = $(`
        <div class="ac-game-menu">
            <div class="ac-game-menu-field">
                <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
                    单人模式
                </div>
                <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
                    多人模式
                </div>
                <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                    设置
                </div>
                <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-logout">
                    退出
                </div>
            </div>
        </div>
        `)

        this.root.$ac_game.append(this.$menu)
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode')
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode')
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings')
        this.$logout = this.$menu.find('.ac-game-menu-field-item-logout')

        this.choice = new LevelChoice(this)

        this.personalize = new Personalize(this)

        this.start()
    }

    start() {
        this.add_listening_events()
        this.hide()
    }

    add_listening_events() {
        let outer = this

        this.$single_mode.click(function () {
            outer.hide()
            // outer.root.playground.show('single')
            outer.choice.show()
        });
        this.$multi_mode.click(function () {
            console.log("click multi_mode")
            outer.hide()
            outer.root.playground.show('multi')
        })
        this.$settings.click(function () {
            console.log("click settings")
            outer.hide()
            outer.personalize.show()
            console.log(outer.personalize);
        })
        this.$logout.click(function () {
            $.get('https://app122.acapp.acwing.com.cn/settings/logout/').then(res => {
                if (res.result === 'success') {
                    $(location).attr('href', '/')
                }
            })
        })
    }

    show() {
        this.$menu.show()
    }

    hide() {
        this.$menu.hide()
    }
}
class Personalize {
    constructor(menu) {
        this.menu = menu
        this.$panel = $(`
        <div class="game-user-info">
            <div class="game-user-info-wrapper">
                <img id="game-user-info-wrapper-avatar" src="" alt="">
                <button type="button" class="btn btn-info btn-sm" id="choice">更换头像</button>
                <div class="game-user-info-wrapper-item">
                    <h5>用户名</h5>
                </div>            
                <div class="game-user-info-wrapper-item">
                    <input id="game-user-info-wrapper-item-username" type="text" placeholder="用户名">
                </div>
                <div class="game-user-info-wrapper-item">
                    <h5 id="update_pwd">修改密码</h5>
                </div>
                <div class="game-user-info-wrapper-update-pwd">
                    <div class="game-user-info-wrapper-item">
                        <h5>旧密码</h5>
                    </div>            
                    <div class="game-user-info-wrapper-item">
                        <input id="game-user-info-wrapper-item-old" type="password" placeholder="旧密码">
                    </div>
                    <div class="game-user-info-wrapper-item">
                        <h5>新密码</h5>
                    </div>            
                    <div class="game-user-info-wrapper-item">
                        <input id="game-user-info-wrapper-item-first" type="password" placeholder="新密码">
                    </div>
                    <br>
                    <div class="game-user-info-wrapper-item">
                        <input id="game-user-info-wrapper-item-second" type="password" placeholder="再次输入密码">
                    </div>
                </div>
                <button type="button" class="btn btn-info btn-sm" id="user-info-save">保存</button>
                <h5 class="game-user-info-wrapper-back">返回</h5>
            </div>
            <input class="inputFile" type="file" accept="image/*" id="imgReader">
            <div id="myModal" class="modal" tabindex="-1" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title">选择合适的区域</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="modal-body p-0 m-2">
                        <img id="cropImg">
                    </div>
                    <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                    <button type="button" class="btn btn-primary" id="avatar_save">确定</button>
                    </div>
                </div>
                </div>
            </div>
        </div>
        `)
        this.menu.root.$ac_game.append(this.$panel)

        this.$avatar = $('#game-user-info-wrapper-avatar')
        this.$username = $('#game-user-info-wrapper-item-username')
        this.$update_pwd = $('#update_pwd')
        this.update_pwd = false
        this.$pwd_field = $('.game-user-info-wrapper-update-pwd')
        this.$pwd_old = $('#game-user-info-wrapper-item-old')
        this.$pwd_first = $('#game-user-info-wrapper-item-first')
        this.$pwd_second = $('#game-user-info-wrapper-item-second')

        this.CROPPER = null

        this.hide()
        this.start()
    }

    start() {
        this.add_listening_events()
        
    }

    show() {
        this.$panel.show()
        this.$username.val(this.menu.root.settings.username)
        this.$avatar.attr("src", this.menu.root.settings.photo)
        this.$pwd_field.hide()
    }

    hide() {
        this.$panel.hide()
    }

    add_listening_events() {
        this.add_listening_avatar()
        this.add_listening_save()
        this.add_listening_back()
        this.add_listening_update_pwd()
    }

    add_listening_update_pwd() {
        let outer = this
        this.$update_pwd.click(function () {
            console.log('update_pwd');
            if (!outer.update_pwd) {
                outer.$update_pwd.text('收起')
                outer.update_pwd = true
                outer.$pwd_field.fadeIn()
                console.log('update_pwd', 'false');
            } else {
                outer.$update_pwd.text('修改密码')
                outer.update_pwd = false
                outer.$pwd_field.fadeOut()
                console.log('update_pwd', 'true');
            }
        })
    }
    
    add_listening_back() {
        let outer = this
        $('.game-user-info-wrapper-back').click(function () {
            console.log('user-info-back');
            outer.hide()
            outer.menu.show()
        })
    }

    add_listening_save() {
        let outer = this
        $('#user-info-save').click(function () {
            outer.change_user_info()
        })
    }

    add_listening_avatar() {
        let outer = this
        $('#imgReader').change(function loadingImg(event) {
            $('#myModal').modal('show')
            let reader = new FileReader();
            if (event.target.files[0]) {
                reader.readAsDataURL(event.target.files[0]);
                reader.onload = (e) => {
                    let dataURL = reader.result;
                    document.querySelector('#cropImg').src = dataURL;
                    const image = document.getElementById('cropImg');
                    if (outer.CROPPER) {
                        outer.CROPPER.destroy()
                    }
                    outer.CROPPER = new Cropper(image, {
                        aspectRatio: 1 / 1,
                        viewMode: 1,
                        minContainerWidth: 300,
                        minContainerHeight: 300,
                        dragMode: 'move',
                    })
                }
            }
        })
        

        $('#choice').click(function () {
            $('#imgReader').click()
        })

        $('#avatar_save').click(function () {
            outer.CROPPER.getCroppedCanvas({
                maxWidth: 500,
                maxHeight: 500,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'low',
            }).toBlob((blob) => {
                let reader = new FileReader()
                reader.readAsDataURL(blob)
                reader.onload = (e) => {
                    console.log(e.target.result)
                    $.post('https://app122.acapp.acwing.com.cn/settings/change/avatar/', {
                        'img': e.target.result
                    }, function (e) {
                        if (e.result === 'success') {
                            console.log(e.url);
                            outer.$avatar.attr("src", e.url);
                            $('#myModal').modal('hide')
                        }
                    })
                }
            })
        })
    }

    change_user_info() {
        let username = this.verfiy_username()

        if (this.update_pwd) {
            let old = this.$pwd_old.val()
            let pwd = this.verfiy_pwd()

            if (old && pwd) {
                $.post('/settings/change/pwd/', {
                    old_pwd: old,
                    new_pwd: pwd
                }, function (e) {
                    alert(e.msg)
                })
            }
        }

        if (username != this.menu.root.settings.username) {
            $.ajax({
                type: 'POST',
                url: '/settings/change/username/',
                headers: {
                    'X-CSRFToken': $.cookie('csrftoken')
                },
                data: {
                    username: username,
                },
                success: function (e) {
                    alert(e.msg)
                }
            })
        }

        // $.post()
    }

    verfiy_username() {
        let username = this.$username.val()
        console.log(username);
        if (username) {
            return username
        }
        return ''
    }

    verfiy_pwd() {
        let pwd_old = this.$pwd_old.val()
        let pwd_first = this.$pwd_first.val()
        let pwd_second = this.$pwd_second.val()
        console.log(pwd_first, pwd_second);
        if (pwd_old && pwd_first && pwd_first === pwd_second) {
            return pwd_first
        }
        return ''
    }
}let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔

        this.uuid = this.create_uuid()

    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 1)之间的数
            res += x;
        }
        return res;
    }

    start() {  // 只会在第一帧执行一次
    }

    update() {  // 每一帧均会执行一次
    }

    last_update() { // 最后一帧执行一次

    }

    on_destroy() {  // 在被销毁前执行一次
    }

    destroy() {  // 删掉该物体
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        obj.last_update()
    }

    requestAnimationFrame(AC_GAME_ANIMATION);
}


requestAnimationFrame(AC_GAME_ANIMATION);
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
}class GameMap extends AcGameObject {
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
class MiniMap extends AcGameObject {
    constructor(playground) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx
        this.players = this.playground.players
    }

    start() {
    }

    last_update() {
        this.render()
    }

    render() {
        let scale = this.playground.scale
        let h = scale * 0.2
        let w = h * 16 / 9
        this.ctx.fillStyle="rgba(0, 0, 0, 0.3)";
        this.ctx.fillRect(0, 0, w, h);
    
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i]
            if (player) {
                let x = player.x * scale, y = player.y * scale
                if (player.role === 'self') {
                    this.ctx.fillStyle = 'skyblue';
                } else {
                    this.ctx.fillStyle = 'pink'
                }
                this.ctx.beginPath();
                this.ctx.arc((x / this.playground.vwidth) * w, (y / this.playground.vheight) * h, 0.01 * scale, 0, Math.PI * 2, false);
                this.ctx.fill();
            }
        }
    }
}class NoticeBoard extends AcGameObject {

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

}class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super()
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 0.01;
        
    }

    start() {

    }

    update() {

        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy()
            return false
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)
        this.x += this.vx * moved
        this.y += this.vy * moved
        this.speed *= this.friction
        this.move_length -= moved

        this.render()
    }

    render() {
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        let scale = this.playground.scale
        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, role, username, photo) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx // 操作canvas的对象
        this.x = x
        this.y = y
        this.vx = 0 // 单位速度
        this.vy = 0

        this.direct_x = 0 //移动方向
        this.direct_y = -1

        this.skill_direct_x = 0 // 指向性技能方向
        this.skill_direct_y = -1
        this.mouse_position_x = 0 //鼠标位置
        this.mouse_position_y = 0

        this.move_length = 0
        this.damage_x = 0
        this.damage_y = 0
        this.damage_speed = 0
        this.friction = 0.9
        this.spent_time = 0
        this.radius = radius
        this.color = color
        this.speed = speed
        this.role = role
        this.eps = 0.01

        this.hp = 100
        this.photo = photo
        this.username = username

        this.accelerate = null
        this.fireballs = []
        this.cur_skill = null

        if (this.role !== 'robot') {
            this.img = new Image()
            this.img.src = this.photo
        }

        if (this.role === 'self') {
            this.fireball_img = new Image()
            this.fireball_img.src = "/static/image/skill/fireball.png"

            this.blink_img = new Image()
            this.blink_img.src = "/static/image/skill/blink.png"
            
            this.accelerate_img = new Image()
            this.accelerate_img.src = '/static/image/skill/accelerate.png'
        }
        this.accelerate_coldtime = 0
        this.blink_coldtime = 0
        this.fireball_coldtime = 0
        
        this.poison_spent = 2

        this.secure = true
    }

    start() {
        if (this.playground.mode === 'multi') {
            this.playground.player_count++
            if (this.playground.player_count === 3) {
                this.playground.notice_board.write("Fighting!")
                this.playground.state = 'fighting'
            } else {
                this.playground.notice_board.write("已就绪 " + this.playground.player_count + " 人")
            }
        }
        //this.render()
        let scale = this.playground.scale
        if (this.role === 'self') {
            this.add_listening_events()
        } else if (this.role === 'robot') {
            let x = Math.random() * this.playground.vwidth / scale
            let y = Math.random() * this.playground.vheight / scale
            this.move_to(x, y)
        }
        
    }

    add_listening_events() {
        let outer = this
        // canvas 内禁止鼠标右键
        // this.playground.game_map.$canvas.on('contextmenu', function () {
        //     return false
        // })
        this.listen_mouse_move()
        this.listen_mouse_click()
        this.listen_keydown()
    }

    listen_mouse_move() {
        let outer = this
        //鼠标移动事件
        this.playground.game_map.$canvas.mousemove(function (e) {
            if (outer.role !== 'self') 
                return false

            const binding_rect = outer.ctx.canvas.getBoundingClientRect()
            let tx = (e.clientX * window.devicePixelRatio - binding_rect.left) / outer.playground.scale + outer.playground.cx
            let ty = (e.clientY * window.devicePixelRatio - binding_rect.top) / outer.playground.scale + outer.playground.cy
            outer.mouse_position_x = tx
            outer.mouse_position_y = ty
            outer.update_skill_direct()
        })
    }

    listen_mouse_click() {
        let outer = this
        // 聊天
        if (this.playground.mode === 'multi') {

            this.playground.chat_field.$history.mousedown(function (e) {
                if (outer.playground.state !== 'fighting')
                    return false
        
                const binding_rect = outer.ctx.canvas.getBoundingClientRect()
                // 移动
                if (e.which === 3) {
                    outer.update_move_target(e, binding_rect)
                }
            })
        }

        // 监听鼠标
        this.playground.game_map.$canvas.mousedown(function (e) {
            if (outer.playground.state !== 'fighting')
                return false
                
            const binding_rect = outer.ctx.canvas.getBoundingClientRect()
            // 移动
            if (e.which  === 3) {
                outer.update_move_target(e, binding_rect)
                // if ()
                // outer.playground.chat_field.hide_input()
            } else if (e.which == 1) {  //发技能
                let tx = (e.clientX * window.devicePixelRatio - binding_rect.left ) / outer.playground.scale + outer.playground.cx
                let ty = (e.clientY * window.devicePixelRatio - binding_rect.top ) / outer.playground.scale + outer.playground.cy
                if (outer.cur_skill === 'fireball') {
                    let fireball = outer.shoot_fireball( tx, ty )
                    if (outer.playground.mode === 'multi') {
                        outer.playground.multiplayer_socket.send_shoot_fireball(tx, ty, fireball.uuid)
                    }
                    outer.fireball_coldtime = 1.5
                }
                
                outer.cur_skill = null
            }
        })
    }

    listen_keydown() {
        let outer = this
        // 监听按键 
        this.playground.game_map.$canvas.keydown(function (e) {
            // 聊天
            if (outer.playground.mode === 'multi') {
                if (e.which === 13) { // enter
                    outer.playground.chat_field.show_input()
                    console.log('enter');
                    return false
                } else if (e.which === 27) { // esc
                    outer.playground.chat_field.hide_input()
                    console.log('esc');
                    return false
                }
            }

            if (outer.playground.state !== 'fighting')
                return false
            
            if (e.which === 81) {
                if (outer.fireball_coldtime > outer.eps || outer.spent_time < 3)
                    return false;
                
                outer.cur_skill = 'fireball'
                // outer.fireball_coldtime = 3
                // let fireball = outer.shoot_fireball_moblie( outer.direct_x, outer.direct_y )
                // if (outer.playground.mode === 'multi') {
                //     outer.playground.multiplayer_socket.send_shoot_fireball(outre.direct_x, outre.direct_y, fireball.uuid)
                // }
                // outer.cur_skill = null
                return false
            } else if (e.which === 70) {
                if (outer.blink_coldtime > outer.eps || outer.spent_time < 3) {
                    return false
                }
                outer.cur_skill = 'blink'
                outer.blink_coldtime = 5

                if (outer.playground.mode === 'multi') {
                    outer.playground.multiplayer_socket.send_blink(outer.x, outer.y, outer.direct_x, outer.direct_y)
                }

                outer.blink(outer.x, outer.y, outer.direct_x, outer.direct_y)
                outer.cur_skill = null
            } else if (e.which === 69) {
                if (outer.accelerate_coldtime > outer.eps || outer.spent_time < 3) {
                    return false
                }
                if (outer.playground.mode === 'multi') {
                    outer.playground.multiplayer_socket.send_accelerate()
                }
                outer.cur_skill = 'accelerate'
                outer.start_accelerate()
                outer.cur_skill = null
            }
        })
    }

    unbind_listening_events() {
        this.cur_skill = null
        this.playground.game_map.$canvas.unbind('keydown')
        this.playground.game_map.$canvas.unbind('mousedown')
        this.playground.game_map.$canvas.unbind('mousemove')
        if (this.playground.mode === 'multi') {
            this.playground.chat_field.$history.unbind('mousedown')
        }
    }

    // 更新移动目的地
    update_move_target(e, binding_rect) {
        let tx = (e.clientX * window.devicePixelRatio - binding_rect.left ) / this.playground.scale + this.playground.cx
        let ty = (e.clientY * window.devicePixelRatio - binding_rect.top ) / this.playground.scale + this.playground.cy
        // console.log(e.clientX, binding_rect.left, this.playground.scale);
        // console.log(e.clientY, binding_rect.top, this.playground.scale);
        // console.log('tx, ty', tx, ty);

        if (this.playground.mode === 'multi') {
            console.log('send move to');
            this.playground.multiplayer_socket.send_move_to(this.uuid, tx, ty)
        }

        this.click_particle(5, tx, ty)

        this.move_to( tx, ty )
    }

    update_skill_direct() {
        let angle = Math.atan2(this.mouse_position_y - this.y, this.mouse_position_x - this.x)
        this.skill_direct_x = Math.cos(angle)
        this.skill_direct_y = Math.sin(angle)
    }

    check_poison_state(x, y) {
        let scale = this.playground.scale
        if (x < this.playground.poison.bound_x || y < this.playground.poison.bound_y) {
            return true
        }

        let up_bound_x = this.playground.vwidth / scale - this.playground.poison.bound_x
        let up_bound_y = this.playground.vheight / scale - this.playground.poison.bound_y
        if (x > up_bound_x || y > up_bound_y) {
            return true
        }

        return false
    }

    attacked_by_poison() {
        if (this.poison_spent > 2) {
            if (this.playground.mode === 'multi' && this.role === 'self') {
                this.playground.multiplayer_socket.send_poison_attack(this.uuid, this.x, this.y, 5, 'poison')
            }
            this.poison_spent = 0
            this.hp -= 5
            this.split_particle(10)
            this.radius -= (5 / 100) * 0.03
            if (this.hp < 0) {
                this.destroy()
            }
        }
    }

    // 发射火球
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y
        let radius = 0.01
        let angle = Math.atan2(ty - y, tx - x) //获取角度，正交坐标中的角度
        let vx = Math.cos(angle)    // x方向上的单位速度
        let vy = Math.sin(angle)    // y方向上的单位速度
        let color = 'orange'        // 火球颜色
        let speed =  this.speed * 3    // 火球速度
        let move_length = 1    //火球的发射距离
        // 发射火球
        let fire_ball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 20)

        this.fireballs.push(fire_ball)

        return fire_ball
    }

    // 发射火球
    shoot_fireball_moblie(vx, vy) {
        let x = this.x, y = this.y
        let radius = 0.01
        // let angle = Math.atan2(ty - y, tx - x) //获取角度，正交坐标中的角度
        // let vx = Math.cos(angle)    // x方向上的单位速度
        // let vy = Math.sin(angle)    // y方向上的单位速度
        let color = 'orange'        // 火球颜色
        let speed =  this.speed * 3    // 火球速度
        let move_length = 1    //火球的发射距离
        // 发射火球
        let fire_ball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 20)

        this.fireballs.push(fire_ball)

        return fire_ball
    }

    start_accelerate() {
        
        this.accelerate = new Accelerate(this.playground, this)
        this.speed *= 2
        this.accelerate_coldtime = 7
    }

    cancel_accelerate() {
        if (!this.accelerate) return
        this.speed /= 2

        this.accelerate.destroy()
        this.accelerate = null
    }

    blink(x, y, vx, vy) {
        let scale = this.playground.scale

        let tx = x + vx * 0.3
        let ty = y + vy * 0.3
        
        if (tx + this.radius > this.playground.vwidth / scale) {
            tx = this.playground.vwidth / scale - this.radius
        }
        if (tx - this.radius < 0) {
            tx = this.radius
        }

        if (ty + this.radius > this.playground.vheight / scale) {
            ty = this.playground.vheight / scale - this.radius
        }
        if (ty - this.radius < 0) {
            ty = this.radius
        }
        console.log('blink', tx, ty);
        this.x = tx
        this.y = ty
    }

    // 玩家消失时
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i]
            if (player === this) {
                if (this.accelerate) {
                    this.accelerate.destroy()
                }
                this.playground.players.splice(i, 1)
                if (player.role === 'self') {
                    console.log('unbinding ...');
                    this.unbind_listening_events()
                    if (this.playground.state === 'fighting') {
                        this.playground.score_board.lose()
                    }
                }
            }
        }

        if (this.playground.state === 'fighting' && this.playground.players.length === 1 && this.playground.players[0].role === 'self') {
            this.playground.score_board.win()
        }
    }
    
    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i]
            if (fireball.uuid === uuid) {
                this.fireballs.splice(i, 1)
                fireball.destroy()
                console.log('fireball destory');
                break;
            }
        }
    }

    // 联机模式下，被攻击，移动当前玩家位置，到攻击者的客户端的位置，然后长生击退效果
    receive_attacked(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid)

        this.x = x
        this.y = y
        this.is_attacked(angle, damage)
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0)

        this.blink_coldtime -= this.timedelta / 1000
        this.blink_coldtime = Math.max(this.blink_coldtime, 0)

        this.accelerate_coldtime -= this.timedelta / 1000
        this.accelerate_coldtime = Math.max(this.accelerate_coldtime, 0)
    }

    update_robot_attack() {
        if (this.role === 'robot' && this.playground.level.is_track && this.spent_time > 3 && Math.random() < this.playground.level.robot_speed / 300) {
            for (let i = 0; i < this.playground.players.length; i++) {
                let player = this.playground.players[i]
                if (player.role === 'self' && this.get_dist(player.x, player.y) < 1) {
                    this.shoot_fireball(player.x, player.y);
                    console.log('attack self');
                }
            }
        }

        // 控制电脑玩家发射火球
        if (this.role === 'robot' && this.spent_time > 3 && Math.random() < 1 / (15 * this.playground.players.length)) {
            // 随机选取玩家
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            // 不能攻击自己
            if (player && player !== this) {
                let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
                let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
                this.shoot_fireball(tx, ty);
            }
        }

        if (this.role === 'robot' && this.spent_time > 3 && Math.random() < 1 / (15 * this.playground.players.length)) {
            if (this.accelerate_coldtime < this.eps) {
                this.start_accelerate()
            }
        }
    }

    update_robot_move() {
        let scale = this.playground.scale
        let x = 1
        let y = 1
        do {
            x = Math.random() * this.playground.vwidth / scale
            y = Math.random() * this.playground.vheight / scale
        } while (this.check_poison_state(x, y))
        
        if (Math.random() < this.playground.level.robot_speed / (1.5 * this.playground.players.length)) {
            for (let i = 0; i < this.playground.players.length; i++) {
                if (this.playground.players[i].role === 'self') {
                    x = this.playground.players[i].x * 0.9
                    y = this.playground.players[i].y * 0.9
                }
            }
        }
        this.move_to(x, y)
    }

    update_damage_state() {
        let scale = this.playground.scale
        // 清空当前的移动状态
        this.vx = this.vy = 0
        this.move_length = 0

        let mx = this.damage_x * this.damage_speed * this.timedelta / 1000
        let my = this.damage_y * this.damage_speed * this.timedelta / 1000
        //越界判断，不能被弹出界
        if (this.x + mx > this.radius && this.x + mx + this.radius < this.playground.vwidth / scale) {
            this.x += mx 
        }
        if (this.y + my > this.radius && this.y + my + this.radius < this.playground.vheight / scale) {
            this.y += my
        }
        this.damage_speed *= this.friction
    }

    update_move() {        
        let scale = this.playground.scale

        this.update_robot_attack()

        // 受到伤害后退的速度
        if (this.damage_speed > this.eps) {

            this.update_damage_state()

        } else {

            if (this.move_length < this.eps) {
                this.move_length = 0
                this.vx = this.vy = 0
                if (this.role === 'robot') {
                    this.update_robot_move()
                }
            } else {
                if (this.role === 'robot' && !this.secure && Math.random() < 1 / 60) {
                    this.update_robot_move()
                }

                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)

                if (this.x + this.vx * moved > this.radius && this.x + this.vx * moved + this.radius < this.playground.vwidth / scale) {
                    this.x += this.vx * moved
                }
                if (this.y + this.vy * moved > this.radius && this.y + this.vy * moved + this.radius < this.playground.vheight / scale) {
                    this.y += this.vy * moved
                }
                // 更新剩余移动距离
                this.move_length -= moved
                if (this.role === 'self' && this.cur_skill) {
                    this.update_skill_direct()
                }
            }
        }
    }

    click_particle(num, x, y) {
        for (let i = 0; i < num; i ++ ) {
            // 获取粒子散发的角度，速度，距离
            // let x = this.x, y = this.y;
            let radius = Math.max(this.radius * Math.random() * 0.2, 0.005);
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = 0.2;
            let move_length = 0.2;
            // 发出粒子
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
    }

    split_particle(num) {
        for (let i = 0; i < num + Math.random() * 10; i ++ ) {
            // 获取粒子散发的角度，速度，距离
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.2;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 5;
            let move_length = this.radius * Math.random() * 5;
            // 发出粒子
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
    }

    // 被攻击触发
    is_attacked(angle, damage) {
        this.split_particle(20)

        // 缩小半径
        this.radius -= (damage / 100) * 0.03
        this.hp -= damage
        if (this.accelerate) {
            this.accelerate.attack_incerse()
        }
        // 半径小于10时，判定死亡
        if (this.hp <= 0) {
            this.destroy()
            if (this.role === 'self' && this.playground.mode === 'multi') {
                this.playground.notice_board.write('已阵亡')
            }
            return false
        }

        this.damage_x = Math.cos(angle)
        this.damage_y = Math.sin(angle)
        this.damage_speed = damage * this.radius * 2
        this.speed *= 1.08
    }

    get_dist(tx, ty) {
        let dx = tx - this.x
        let dy = ty - this.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    move_to(tx, ty) {
        // 获取目的坐标里当前坐标的距离
        this.move_length = this.get_dist(tx, ty)
        // 计算角度，并设置单位速度
        let angle = Math.atan2(ty - this.y, tx - this.x)
        this.vx = Math.cos(angle)
        this.vy = Math.sin(angle)
        this.direct_x = this.vx
        this.direct_y = this.vy
        // console.log(tx, ty);
        // console.log(this.playground.cx, this.playground.cy);
        // console.log(this.x, this.y);
    }

    render_fireball_icon() {
        let scale = this.playground.scale
        let x = 1.4, y = 0.9, r = 0.04

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(233, 171, 101, 1)'
        this.ctx.lineWidth = 8
        this.ctx.arc(x * scale, y * scale, r * scale * 0.85, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 1.5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    render_blink_icon() {
        let scale = this.playground.scale
        let x = 1.52, y = 0.9, r = 0.04

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(233, 171, 101, 1)'
        this.ctx.lineWidth = 8
        this.ctx.arc(x * scale, y * scale, r * scale * 0.85, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    render_accelerate_icon() {
        let scale = this.playground.scale
        let x = 1.64, y = 0.9, r = 0.04

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(233, 171, 101, 1)'
        this.ctx.lineWidth = 8
        this.ctx.arc(x * scale, y * scale, r * scale * 0.85, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.accelerate_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.accelerate_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.accelerate_coldtime / 7) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    render_arrow(scale) {
        let offset = 0
        if (this.move_length > this.eps) {
            offset = 0.1
        }
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        // 顶点
        let dx = ctx_x + this.radius * (1.3 + offset) * this.direct_x
        let dy = ctx_y + this.radius * (1.3 + offset) * this.direct_y

        let angle = Math.atan2(dy - ctx_y, dx - ctx_x)
        let lineA_angle = angle + (0.2 + offset)
        let lineB_angle = angle - (0.2 + offset)

        let lineA_cos = Math.cos(lineA_angle), lineA_sin = Math.sin(lineA_angle)
        let lineB_cos = Math.cos(lineB_angle), lineB_sin = Math.sin(lineB_angle)
        // A点坐标
        let dAx = ctx_x + this.radius * 1.2 * lineA_cos
        let dAy = ctx_y + this.radius * 1.2 * lineA_sin
        // B点坐标
        let dBx = ctx_x + this.radius * 1.2 * lineB_cos
        let dBy = ctx_y + this.radius * 1.2 * lineB_sin

        this.ctx.moveTo(dx * scale, dy * scale)
        this.ctx.lineTo(dAx * scale, dAy * scale)
        this.ctx.moveTo(dx * scale, dy * scale)
        this.ctx.lineTo(dBx * scale, dBy * scale)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        this.ctx.lineJoin = "round"
        this.ctx.stroke()
    }

    render_skill_direct(scale) {
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        let dx = ctx_x + this.skill_direct_x 
        let dy = ctx_y + this.skill_direct_y
        this.ctx.lineWidth = 8
        this.ctx.moveTo(ctx_x * scale, ctx_y * scale)
        this.ctx.lineTo(dx * scale , dy * scale )
        this.ctx.stroke()
        this.ctx.lineWidth = 2
    }

    render() {
        let scale = this.playground.scale
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        if (this.role !== 'robot') {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (ctx_x - this.radius) * scale, (ctx_y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.role === 'self' && this.cur_skill && this.playground.state === 'fighting') {
            this.render_skill_direct(scale)
        }

        this.render_arrow(scale)
    }

    render_hp() {
        let scale = this.playground.scale
        let x = 1.52, y = 0.80
        this.ctx.font = `${scale * 0.04}px serif`;
        this.ctx.fillStyle = "pink";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`❤ HP : ${this.hp}`, x * scale, y * scale);
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(`F`, x * scale, (y + 0.05) * scale);
        this.ctx.fillText(`Q`, (x - 0.12) * scale, (y + 0.05) * scale);
        this.ctx.fillText(`E`, (x + 0.12) * scale, (y + 0.05) * scale);
    }

    render_secure_notice() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`${Math.floor(4 - this.spent_time)} 秒后开始战斗`, this.playground.width / 2, 50);
    }

    last_update() {
        if (this.role === 'self' && this.playground.state === 'fighting') {
            this.render_fireball_icon()
            this.render_blink_icon()
            this.render_accelerate_icon()
            this.render_hp()
            if (this.secure) {
                this.render_secure_notice()
            }
        }
    }

    // 渲染操作
    update() {
        if (this.playground.state === 'fighting') {
            this.spent_time += this.timedelta / 1000;
            this.poison_spent += this.timedelta / 1000;
        }

        if (this.spent_time < 3 && this.secure) {
            this.speed = 0.5
        } else if (this.spent_time > 3 && this.secure) {
            if (this.role === 'robot') {
                this.speed = 0.2 * this.playground.level.robot_speed
            } else {
                this.speed = 0.2
            }
            this.secure = false
        }

        if (this.check_poison_state(this.x, this.y)) {
            this.attacked_by_poison()
        }

        if (this.role === 'self')
            this.playground.re_calculate_cx_cy(this.x, this.y);
        this.update_coldtime()
        this.update_move()    
        this.render()
    }
}class PoisonRange extends AcGameObject {
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
}class ScoreBoard extends AcGameObject{
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
}class Accelerate extends AcGameObject {
    constructor(playground, player) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx
        this.player = player
        this.span = 3
        this.attack_cnt = 0
    }

    start() {

    }

    attack_incerse() {
        this.attack_cnt ++
    }

    update() {
        this.render()
        this.span -= this.timedelta / 1000
        if (this.span < this.player.eps) {
            this.player.cancel_accelerate()
            
        }
    }

    on_desttory() {
        this.ctx.lineWidth = 2
        this.strokeStyle = 'white'
    }

    render() {
        let scale = this.playground.scale
        let ctx_x = this.player.x - this.playground.cx, ctx_y = this.player.y - this.playground.cy;
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'skyblue'
        this.ctx.lineWidth = 5
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.player.radius * scale * 1.5, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.lineWidth = 2
        this.strokeStyle = 'white'
    }

}class FireBall extends AcGameObject {

    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx
        this.player = player
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
        this.color = '#ff4702'
        this.speed = speed
        this.radius = radius
        this.move_length = move_length
        this.damage = damage

        this.eps = 0.01

    }


    start() {

    }

    on_destroy() {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i ++ ) {
            if (fireballs[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }


    update() {
        if (this.move_length < this.eps) {
            this.destroy()
            return false
        }
        this.update_move()

        if (this.player.role !== 'enemy') {
            this.update_attack()
        }

        this.render()
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        // 碰撞检测
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i]
            // 不是自己，且碰撞
            if (player !== this.player && this.is_collision(player)) {
                this.attack(player)
                break;
            }
        }
    }

    // 攻击玩家
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);

        // 联机模式下
        if (this.playground.mode === 'multi') {
            this.playground.multiplayer_socket.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid, 'fireball')
        }

        // 让玩家受伤
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    get_dist(tx, ty, x, y) {
        let dx = tx - x, dy = ty - y
        return Math.sqrt(dx * dx + dy * dy)
    }

    // 碰撞检测，两圆心的距离
    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    render() {
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        let scale = this.playground.scale
        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}class MultiPlayerSocket {
    constructor(playground, uuid) {
        this.playground = playground
        this.uuid = uuid
        this.ws = new WebSocket("wss://app122.acapp.acwing.com.cn/wss/multiplayer/")
        this.start()
    }

    start() {
        this.listening_events()
    }

    listening_events() {
        this.on_open()
        this.on_receive()
    }

    on_open() {
        let outer = this
        console.log(this.uuid, outer.uuid);
        this.ws.onopen = function () {
            outer.send_create_player(outer.uuid, outer.playground.root.settings.username, outer.playground.root.settings.photo)    
        }        
    }

    on_receive() {
        let outer = this
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data)
            let uuid = data.uuid

            if (uuid === outer.uuid)
                return false
            
            let event = data.event
            console.log(data);
            if (event === 'create_player') {
                console.log(data);
                outer.receive_create_player(uuid, data.username, data.photo)
            } else if (event === 'move_to') {
                outer.receive_move_to(uuid, data.tx, data.ty)
            } else if (event === 'shoot_fireball') {
                console.log('event shhot_fireball');
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid)
            } else if (event === 'attack') {
                console.log(data);
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid)
            } else if (event === 'blink') {
                console.log('receive blink');
                outer.receive_blink(uuid, data.x, data.y, data.vx, data.vy)
            } else if (event === 'message') {
                console.log('receive message');
                outer.receive_message(data.username, data.text)
            } else if (event === 'accelerate') {
                console.log('accelerate');
                outer.receive_accelerate(uuid)
            } else if (event === 'poison_attack') {
                outer.receive_poison_attack(data.attackee_uuid, data.x, data.y, data.damage)
            }
        }
    }

    get_player(uuid) {
        let players = this.playground.players
        for (let i = 0; i < players.length; i++) {
            let player = players[i]
            if (player.uuid === uuid)
                return player
        }

        return null
    }

    send_poison_attack(attackee_uuid, x, y, damage, type) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'poison_attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'damage': damage,
            'type' : type
        }))
    }

    receive_poison_attack(attackee_uuid, x, y, damage) {
        let player = this.get_player(attackee_uuid)
        if (player) {
            player.x = x
            player.y = y
            if (damage > 100) {
                player.hp -= damage
            }
            player.attacked_by_poison()
        }
    }

    send_accelerate() {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'accelerate',
            'uuid': outer.uuid,
        }))
    }

    receive_accelerate(uuid) {
        let player = this.get_player(uuid)
        if (player) {
            player.start_accelerate()
        }
    }

    send_message(username, text) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'message',
            'uuid': outer.uuid,
            'username': username,
            'text' : text
        }))
    }

    receive_message(username, text) {

        this.playground.chat_field.add_message(username, text, true)
    }

    send_blink(x, y, vx, vy) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'x': x,
            'y': y,
            'vx': vx,
            'vy': vy,
        }));
    }

    receive_blink(uuid, x, y, vx, vy) {
        let player = this.get_player(uuid)
        if (player) {
            player.blink(x, y, vx, vy)
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid, type) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
            'type' : type
        }))
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid)
        let attackee = this.get_player(attackee_uuid)

        if (attackee && attacker) {
            attackee.receive_attacked(x, y, angle, damage, ball_uuid, attacker)
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid, type) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
            'type' : type
        }))
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        console.log(uuid, tx, ty, ball_uuid);
        let player = this.get_player(uuid)
        if (player) {
            let fireball = player.shoot_fireball(tx, ty)
            fireball.uuid = ball_uuid
        }
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid)

        if (player) {
            player.move_to(tx, ty)
        }
    }

    send_move_to(uuid, tx, ty) {
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uuid': uuid,
            'tx': tx,
            'ty' : ty
        }))
    }

    send_create_player(uuid, username, photo) {
        let player = { 'event': 'create_player', 'uuid': uuid, 'username': username, 'photo': photo }
        this.ws.send(JSON.stringify(player))
        console.log(JSON.stringify(player));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.vwidth / 2 / this.playground.scale,
            this.playground.vheight / 2 / this.playground.scale,
            0.05,
            "white",
            0.2,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

}class AcGamePlayground {
    constructor (root) {
        this.root = root
        this.$playground = $(`<div class="ac-game-playground"></div>`)
        this.root.$ac_game.append(this.$playground);
        
        this.level

        this.n = 2

        this.start();
    }

    get_random_color() {
        let colors = ["skyblue", "yellow", "pink", "grey", "green", "snow", "purple"];
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

    show(mode, level) {  // 打开playground界面
        this.level = level
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
            for (let i = 0 ; i < level.robot_num; i ++) {
                this.players.push(new Player(this, this.vwidth  * 0.5 / this.scale, this.vheight * 0.5 / this.scale, this.height * 0.05 / this.scale, this.get_random_color(), (this.height * 0.2 / this.scale) * level.robot_speed, 'robot', null, null))
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
class Settings {
    constructor(root) {
        this.root = root
        this.platform = "WEB"

        if (this.root.AcWingOS) {
            this.platform = "ACAPP"
        }

        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
`);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");
        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img');

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.root.$ac_game.append(this.$settings);


        this.start()
    }

    start() {
        if (this.platform == 'ACAPP') {
            this.getUserInfo_AcApp()
            return
        }
        this.add_listening_events();
        this.getUserInfo()
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        // // console.log(appid, redirect_uri, scope, state);
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            // // console.log("called from acapp_login function");
            // // console.log(resp);
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }


    getUserInfo_AcApp() {
        let outer = this;

        $.ajax({
            url: "/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.add_listening_events_acwing_login();
    }

    add_listening_events_acwing_login() {
        let outer = this
        this.$acwing_login.click(function () {
            outer.acwing_login()
        })        
    }

    add_listening_events_login() {
        let outer = this;
        this.$login_register.click(function () {
            outer.register();
        });
        this.$login_submit.click(function () {
            outer.login_on_remote()
        })    
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_submit.click(function () {
            outer.register_on_remote()
        })
    }

    acwing_login() {
        // // console.log('click icon');
        $.ajax({
            url: '/settings/acwing/web/apply_code/',
            type: 'GET',
            success: (resp) => {
                // // console.log(resp);
                $(location).attr('href', resp.apply_code_url);
            }
        })
    }

    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val()
        this.$register_error_message.empty();

        $.ajax({
            url: "/settings/register/",
            type: "POST",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm
            },
            success: function(resp) {
                // console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_error_message.html(resp.msg);
                }
            }
        });

    }

    login_on_remote() {
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "/settings/login",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                // console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });

    }

    register() {
        this.$login.hide()
        this.$register.show()
    }

    login() {
        this.$register.hide();
        this.$login.show();
    }

    getUserInfo() {
        let outer = this
        $.ajax({
            url: '/settings/getUserInfo',
            type: 'GET',
            data: {
                platform: outer.platform
            },
            success: (resp) => {
                // console.log(resp)
                if (resp.result === 'success') {
                    outer.username = resp.username
                    outer.photo = resp.photo
                    outer.hide()
                    outer.root.menu.show()
                } else {
                    outer.login()
                }
            }
        })
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}export class AcGame {
    constructor (id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        document.body.style.zoom = 1 / window.devicePixelRatio
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        
        this.start()
        
    }

    start() {
        $(window).on('contextmenu', function () {
            return false
        })
        //this.menu.hide()
       // this.playground.show()   
    }
}