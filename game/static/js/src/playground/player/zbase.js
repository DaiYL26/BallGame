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
        // this.playground.game_map.$canvas.on('contextmenu', function () {
        //     return false
        // })

        //鼠标移动事件
        this.playground.game_map.$canvas.mousemove(function (e) {
            if (outer.role !== 'self') 
                return false

            const binding_rect = outer.ctx.canvas.getBoundingClientRect()
            let tx = (e.clientX * window.devicePixelRatio - binding_rect.left) / outer.playground.scale
            let ty = (e.clientY * window.devicePixelRatio - binding_rect.top) / outer.playground.scale
            outer.mouse_position_x = tx
            outer.mouse_position_y = ty
            outer.update_skill_direct()
        })

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
                let tx = (e.clientX * window.devicePixelRatio - binding_rect.left) / outer.playground.scale
                let ty = (e.clientY * window.devicePixelRatio - binding_rect.top) / outer.playground.scale
                if (outer.cur_skill === 'fireball') {
                    
                    let fireball = outer.shoot_fireball( tx, ty )
                    if (outer.playground.mode === 'multi') {
                        outer.playground.multiplayer_socket.send_shoot_fireball(tx, ty, fireball.uuid)
                    }
                    outer.fireball_coldtime = 1
                }
                
                outer.cur_skill = null
            }
        })

        // 监听按键 
        this.playground.game_map.$canvas.keydown(function (e) {

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

                if (outer.playground.mode === 'multi') {
                    outer.playground.multiplayer_socket.send_blink(outer.x, outer.y, outer.direct_x, outer.direct_y)
                }

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
        if (this.playground.mode === 'multi') {
            this.playground.chat_field.$history.unbind('mousedown')
        }
    }

    // 更新移动目的地
    update_move_target(e, binding_rect) {
        let tx = (e.clientX * window.devicePixelRatio - binding_rect.left ) / this.playground.scale 
        let ty = (e.clientY * window.devicePixelRatio - binding_rect.top ) / this.playground.scale
        console.log(e.clientX, binding_rect.left, this.playground.scale);
        console.log(e.clientY, binding_rect.top, this.playground.scale);

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
}