class Player extends AcGameObject {
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
            if (e.which === 3) {
                outer.update_move_target(e, binding_rect)
                // if ()
                // outer.playground.chat_field.hide_input()
            } else if (e.which == 1) {  //发技能
                let tx = (e.clientX * window.devicePixelRatio - binding_rect.left) / outer.playground.scale + outer.playground.cx
                let ty = (e.clientY * window.devicePixelRatio - binding_rect.top) / outer.playground.scale + outer.playground.cy
                if (outer.cur_skill === 'fireball') {
                    let fireball = outer.shoot_fireball(tx, ty)
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
                    if (outer.playground.state != 'fighting') {
                        outer.playground.multiplayer_socket.ws.close()
                        outer.playground.hide();
                        outer.playground.root.menu.show();
                    } else {
                        outer.playground.chat_field.hide_input()
                    }
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
        let tx = (e.clientX * window.devicePixelRatio - binding_rect.left) / this.playground.scale + this.playground.cx
        let ty = (e.clientY * window.devicePixelRatio - binding_rect.top) / this.playground.scale + this.playground.cy
        // console.log(e.clientX, binding_rect.left, this.playground.scale);
        // console.log(e.clientY, binding_rect.top, this.playground.scale);
        // console.log('tx, ty', tx, ty);

        if (this.playground.mode === 'multi') {
            console.log('send move to');
            this.playground.multiplayer_socket.send_move_to(this.uuid, tx, ty)
        }

        this.click_particle(5, tx, ty)

        this.move_to(tx, ty)
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
        let speed = this.speed * 3    // 火球速度
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
        let speed = this.speed * 3    // 火球速度
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
        for (let i = 0; i < this.playground.players.length; i++) {
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
        for (let i = 0; i < num; i++) {
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
        for (let i = 0; i < num + Math.random() * 10; i++) {
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
        this.ctx.lineTo(dx * scale, dy * scale)
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
}