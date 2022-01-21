class AcGameMenu {
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
           outer.root.playground.show('single')
        });
        this.$multi_mode.click(function () {
            console.log("click multi_mode")
            outer.hide()
            outer.root.playground.show('multi')
        })
        this.$settings.click(function () {
            console.log("click settings")
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
let AC_GAME_OBJECTS = [];

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
let AC_GAME_ANIMATION = function(timestamp) {
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
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

        this.start()
    }

    start() {
        this.$canvas.focus()
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

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }
}
class NoticeBoard extends AcGameObject {

    constructor(playground) {
        super()
        this.playground = playground
        this.ctx = playground.game_map.ctx
        this.text = '已就绪 0 人'
    }

    start() {

    }

    write(text) {
        this.text = text
    }

    update() {
        this.render()
    }
    
    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
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
        let scale = this.playground.scale
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
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

        this.fireballs = []
        this.cur_skill = null

        if (this.role !== 'robot') {
            this.img = new Image()
            this.img.src = this.photo
        }

        if (this.role === 'self') {
            this.fireball_coldtime = 0  // 单位：秒
            this.fireball_img = new Image()
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png"

            this.blink_coldtime = 0
            this.blink_img = new Image()
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png"
        }
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
            let x = Math.random() * this.playground.width / scale
            let y = Math.random() * this.playground.height / scale
            this.move_to(x, y)
        }
    }

    add_listening_events() {
        let outer = this
        // canvas 内禁止鼠标右键
        this.playground.game_map.$canvas.on('contextmenu', function () {
            return false
        })

        //鼠标移动事件
        this.playground.game_map.$canvas.mousemove(function (e) {
            if (outer.role !== 'self') 
                return false

            const binding_rect = outer.ctx.canvas.getBoundingClientRect()
            let tx = (e.clientX - binding_rect.left) / outer.playground.scale
            let ty = (e.clientY - binding_rect.top) / outer.playground.scale
            outer.mouse_position_x = tx
            outer.mouse_position_y = ty
            outer.update_skill_direct()
        })

        this.playground.chat_field.$history.mousedown(function (e) {
            if (outer.playground.state !== 'fighting')
                return false
        
            const binding_rect = outer.ctx.canvas.getBoundingClientRect()
                // 移动
            if (e.which === 3) {
                outer.update_move_target(e, binding_rect)
            }
        })

        // 监听鼠标
        this.playground.game_map.$canvas.mousedown(function (e) {
            if (outer.playground.state !== 'fighting')
                return false
                
            const binding_rect = outer.ctx.canvas.getBoundingClientRect()
            // 移动
            if (e.which  === 3) {
                outer.update_move_target(e, binding_rect)
                outer.playground.chat_field.hide_input()
            } else if (e.which == 1) {  //发技能
                let tx = (e.clientX - binding_rect.left) / outer.playground.scale
                let ty = (e.clientY - binding_rect.top) / outer.playground.scale
                if (outer.cur_skill === 'fireball') {
                    
                    let fireball = outer.shoot_fireball( tx, ty )
                    if (outer.playground.mode === 'multi') {
                        outer.playground.multiplayer_socket.send_shoot_fireball(tx, ty, fireball.uuid)
                    }
                    outer.fireball_coldtime = 3
                }
                
                outer.cur_skill = null
            }
        })

        // 监听按键 
        this.playground.game_map.$canvas.keydown(function (e) {
            console.log(e.which, outer.playground.mode, outer.playground.chat_field);
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
                if (outer.fireball_coldtime > outer.eps)
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
                outer.playground.multiplayer_socket.send_blink(outer.x ,outer.y, outer.direct_x, outer.direct_y)
                outer.blink(outer.x, outer.y, outer.direct_x, outer.direct_y)
                outer.cur_skill = null
            }
        })
    }

    unbind_listening_events() {
        this.cur_skill = null
        this.playground.game_map.$canvas.unbind('keydown')
        this.playground.game_map.$canvas.unbind('mousedown')
        this.playground.game_map.$canvas.unbind('mousemove')
        this.playground.chat_field.$history.unbind('mousedown')
    }

    // 更新移动目的地
    update_move_target(e, binding_rect) {
        let tx = (e.clientX - binding_rect.left) / this.playground.scale
        let ty = (e.clientY - binding_rect.top) / this.playground.scale

        if (this.playground.mode === 'multi') {
            console.log('send move to');
            this.playground.multiplayer_socket.send_move_to(this.uuid, tx, ty)
        }

        this.move_to( tx, ty )
    }

    update_skill_direct() {
        let angle = Math.atan2(this.mouse_position_y - this.y, this.mouse_position_x - this.x)
        this.skill_direct_x = Math.cos(angle)
        this.skill_direct_y = Math.sin(angle)
    }

    // 发射火球
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y
        let radius = 0.01
        let angle = Math.atan2(ty - y, tx - x) //获取角度，正交坐标中的角度
        let vx = Math.cos(angle)    // x方向上的单位速度
        let vy = Math.sin(angle)    // y方向上的单位速度
        let color = 'orange'        // 火球颜色
        let speed =  0.5    // 火球速度
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
        let speed =  0.5    // 火球速度
        let move_length = 1    //火球的发射距离
        // 发射火球
        let fire_ball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 20)

        this.fireballs.push(fire_ball)

        return fire_ball
    }

    blink(x, y, vx, vy) {
        let scale = this.playground.scale

        let tx = x + vx * 0.3
        let ty = y + vy * 0.3
        
        if (tx + this.radius > this.playground.width / scale) {
            tx = this.playground.width / scale - this.radius
        }
        if (tx - this.radius < 0) {
            tx = this.radius
        }

        if (ty + this.radius > this.playground.height / scale) {
            ty = this.playground.height / scale - this.radius
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
                this.playground.players.splice(i, 1)
                if (player.role === 'self') {
                    console.log('unbinding ...');
                    this.unbind_listening_events()
                }
            }
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

    // 渲染操作
    update() {
        this.spent_time += this.timedelta / 1000;
        this.update_coldtime()
        this.update_move()    
        this.render()
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0)

        this.blink_coldtime -= this.timedelta / 1000
        this.blink_coldtime = Math.max(this.blink_coldtime, 0)
    }

    update_move() {        
        let scale = this.playground.scale

        // 控制电脑玩家发射火球
        if (this.role === 'robot' && this.spent_time > 3 && Math.random() < 1 / (20 * this.playground.players.length)) {
            // 随机选取玩家
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            // 不能攻击自己
            if (player !== this) {
                this.shoot_fireball(tx, ty);
            }
        }

        // 受到伤害后退的速度
        if (this.damage_speed > this.eps) {
            // 清空当前的移动状态
            this.vx = this.vy = 0
            this.move_length = 0

            let mx = this.damage_x * this.damage_speed * this.timedelta / 1000
            let my = this.damage_y * this.damage_speed * this.timedelta / 1000
            //越界判断，不能被弹出界
            if (this.x + mx > this.radius && this.x + mx + this.radius < this.playground.width / scale) {
                this.x += mx 
            }
            if (this.y + my > this.radius && this.y + my + this.radius < this.playground.height / scale) {
                this.y += my
            }
            this.damage_speed *= this.friction
        } else {

            if (this.move_length < this.eps) {
                this.move_length = 0
                this.vx = this.vy = 0
                if (this.role === 'robot') {
                    let x = Math.random() * this.playground.width / scale
                    let y = Math.random() * this.playground.height / scale
                    this.move_to(x, y)
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)
                //越界判断，不能出界
                // this.x + this.vx * moved > this.radius （保证不出上届）
                // this.x + this.vx * moved + this.radius < this.playground.width （不出下届）
                if (this.x + this.vx * moved > this.radius && this.x + this.vx * moved + this.radius < this.playground.width / scale) {
                    this.x += this.vx * moved
                }
                if (this.y + this.vy * moved > this.radius && this.y + this.vy * moved + this.radius < this.playground.height / scale) {
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

    // 被攻击触发
    is_attacked(angle, damage) {

        // 散发粒子
        for (let i = 0; i < 20 + Math.random() * 10; i ++ ) {
            // 获取粒子散发的角度，速度，距离
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.2;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            // 发出粒子
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        // 缩小半径
        this.radius -= (damage / 100) * 0.03
        this.hp -= damage
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
        this.speed *= 0.8
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
    }

    render_fireball_icon() {
        let scale = this.playground.scale
        let x = 1.5, y = 0.9, r = 0.04

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    render_blink_icon() {
        let scale = this.playground.scale
        let x = 1.62, y = 0.9, r = 0.04

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
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

    render_arrow(scale) {
        // 顶点
        let dx = this.x + this.radius * 1.3 * this.direct_x
        let dy = this.y + this.radius * 1.3 * this.direct_y

        let angle = Math.atan2(dy - this.y, dx - this.x)
        let lineA_angle = angle + 0.2
        let lineB_angle = angle - 0.2

        let lineA_cos = Math.cos(lineA_angle), lineA_sin = Math.sin(lineA_angle)
        let lineB_cos = Math.cos(lineB_angle), lineB_sin = Math.sin(lineB_angle)
        // A点坐标
        let dAx = this.x + this.radius * 1.2 * lineA_cos
        let dAy = this.y + this.radius * 1.2 * lineA_sin
        // B点坐标
        let dBx = this.x + this.radius * 1.2 * lineB_cos
        let dBy = this.y + this.radius * 1.2 * lineB_sin

        this.ctx.moveTo(dx * scale, dy * scale)
        this.ctx.lineTo(dAx * scale, dAy * scale)
        this.ctx.moveTo(dx * scale, dy * scale)
        this.ctx.lineTo(dBx * scale, dBy * scale)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        this.ctx.lineJoin="round"
        this.ctx.stroke()
    }

    render_skill_direct(scale) {
        let dx = this.x + this.skill_direct_x 
        let dy = this.y + this.skill_direct_y
        this.ctx.lineWidth = 8
        this.ctx.moveTo(this.x * scale, this.y * scale)
        this.ctx.lineTo(dx * scale , dy * scale )
        this.ctx.stroke()
        this.ctx.lineWidth = 2
    }

    render() {
        let scale = this.playground.scale
        if (this.role !== 'robot') {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.role === 'self' && this.cur_skill && this.playground.state === 'fighting') {
            this.render_skill_direct(scale)
        }

        this.render_arrow(scale)
        
        
        if (this.role === 'self' && this.playground.state === 'fighting') {
            this.render_fireball_icon()
            this.render_blink_icon()
        }
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
        this.color = color
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
            this.playground.multiplayer_socket.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid)
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
        let scale = this.playground.scale
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
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

            console.log(data);
            if (uuid === outer.uuid)
                return false
            
            let event = data.event
            if (event === 'create_player') {
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

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid' : ball_uuid
        }))
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid)
        let attackee = this.get_player(attackee_uuid)

        if (attackee && attacker) {
            attackee.receive_attacked(x, y, angle, damage, ball_uuid, attacker)
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid
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
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
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

    show(mode) {  // 打开playground界面
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        // console.log(this.width, this.height);        
        this.resize()
        this.game_map = new GameMap(this);
        this.players = []
        this.state = 'waitting'
        if (mode === 'single') {
            this.mode = 'single'
            this.state = 'fighting'
            for (let i = 0 ; i < 5; i ++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, this.get_random_color(), this.height * 0.15 / this.scale, 'robot', null, null))
            }
            this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.15 / this.scale, 'self', this.root.settings.username, this.root.settings.photo))
        } else if (mode === 'multi') {
            this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.15 / this.scale, 'self', this.root.settings.username, this.root.settings.photo))
            this.notice_board = new NoticeBoard(this)
            this.chat_field = new ChatField(this)
            this.player_count = 0
            this.mode = 'multi'
            this.multiplayer_socket = new MultiPlayerSocket(this, this.players[0].uuid)
        }
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
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
        console.log(appid, redirect_uri, scope, state);
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            console.log("called from acapp_login function");
            console.log(resp);
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
            url: "https://app122.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
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
        console.log('click icon');
        $.ajax({
            url: 'https://app122.acapp.acwing.com.cn/settings/acwing/web/apply_code/',
            type: 'GET',
            success: (resp) => {
                console.log(resp);
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
            url: "https://app122.acapp.acwing.com.cn/settings/register/",
            type: "POST",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm
            },
            success: function(resp) {
                console.log(resp);
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
            url: "https://app122.acapp.acwing.com.cn/settings/login",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                console.log(resp);
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
            url: 'https://app122.acapp.acwing.com.cn/settings/getUserInfo',
            type: 'GET',
            data: {
                platform: outer.platform
            },
            success: (resp) => {
                console.log(resp)
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
    constructor (id, AcWingOS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        
        this.start()
    }

    start() {

        //this.menu.hide()
       // this.playground.show()   
    }
}