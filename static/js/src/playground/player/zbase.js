class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super()
        this.playground = playground
        this.ctx = this.playground.game_map.ctx // 操作canvas的对象
        this.x = x
        this.y = y
        this.vx = 0 // 单位速度
        this.vy = 0
        this.move_length = 0
        this.damage_x = 0
        this.damage_y = 0
        this.damage_speed = 0
        this.friction = 0.9
        this.spent_time = 0
        this.radius = radius
        this.color = color
        this.speed = speed
        this.is_me = is_me
        this.eps = 0.1

        this.cur_skill = null

        if (this.is_me) {
            this.img = new Image()
            this.img.src = this.playground.root.settings.photo
        }
    }

    start() {
        //this.render()
        if (this.is_me) {
            this.add_listening_events()
        } else {
            let x = Math.random() * this.playground.width
            let y = Math.random() * this.playground.height
            this.move_to(x, y)
        }
    }

    add_listening_events() {
        let outer = this

        // canvas 内禁止鼠标右键
        this.playground.game_map.$canvas.on('contextmenu', function () {
            return false
        })

        // 监听鼠标
        this.playground.game_map.$canvas.mousedown(function (e) {
            const binding_rect = outer.ctx.canvas.getBoundingClientRect()
            // 移动
            if (e.which  === 3) {
                // console.log('move');
                outer.move_to(e.clientX - binding_rect.left, e.clientY - binding_rect.top)
            } else if (e.which == 1) {  //发技能
                if (outer.cur_skill === 'fireball' && outer.spent_time > 4) {
                    outer.shoot_fireball(e.clientX - binding_rect.left, e.clientY - binding_rect.top)
                }
                
                outer.cur_skill = null
            }
        })

        // 监听按键 
        $(window).keydown(function (e) {
            if (e.which === 81) {
                outer.cur_skill = 'fireball'
                return false
            }
        })
    }

    unbind_listening_events() {
        this.cur_skill = null
        $(window).unbind('keydown')
        this.playground.game_map.$canvas.unbind('mousedown')
    }

    // 发射火球
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y
        let radius = this.playground.height * 0.01
        let angle = Math.atan2(ty - y, tx - x) //获取角度，正交坐标中的角度
        let vx = Math.cos(angle)    // x方向上的单位速度
        let vy = Math.sin(angle)    // y方向上的单位速度
        let color = 'orange'        // 火球颜色
        let speed = this.playground.height * 0.5    // 火球速度
        let move_length = this.playground.height * 1    //火球的发射距离
        // 发射火球
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01)
    }

    // 玩家消失时
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i]
            if (player === this) {
                this.playground.players.splice(i, 1)
                if (player.is_me) {
                    console.log('unbinding ...');
                    this.unbind_listening_events()
                }
            }
        }
    }

    // 渲染操作
    update() {
        // console.log('Player update')
        this.spent_time += this.timedelta / 1000;

        // 控制电脑玩家发射火球
        if (!this.is_me && this.spent_time > 3 && Math.random() < 1 / (20 * this.playground.players.length)) {
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
        if (this.damage_speed > 10) {
            // 清空当前的移动状态
            this.vx = this.vy = 0
            this.move_length = 0

            let mx = this.damage_x * this.damage_speed * this.timedelta / 1000
            let my = this.damage_y * this.damage_speed * this.timedelta / 1000
            //越界判断，不能被弹出界
            if (this.x + mx > this.radius && this.x + mx + this.radius < this.playground.width) {
                this.x += mx 
            }
            if (this.y + my > this.radius && this.y + my + this.radius < this.playground.height) {
                this.y += my
            }
            this.damage_speed *= this.friction
        } else {

            if (this.move_length < this.eps) {
                this.move_length = 0
                this.vx = this.vy = 0
                if (this.is_me === false) {
                    let x = Math.random() * this.playground.width
                    let y = Math.random() * this.playground.height
                    this.move_to(x, y)
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)
                //越界判断，不能出界
                // this.x + this.vx * moved > this.radius （保证不出上届）
                // this.x + this.vx * moved + this.radius < this.playground.width （不出下届）
                if (this.x + this.vx * moved > this.radius && this.x + this.vx * moved + this.radius < this.playground.width) {
                    this.x += this.vx * moved
                }
                if (this.y + this.vy * moved > this.radius && this.y + this.vy * moved + this.radius < this.playground.height) {
                    this.y += this.vy * moved
                }
                // 更新剩余移动距离
                this.move_length -= moved
            }
        }

        this.render()
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
        this.radius -= damage
        // 半径小于10时，判定死亡
        if (this.radius < 10) {
            this.destroy()
            return false
        }

        this.damage_x = Math.cos(angle)
        this.damage_y = Math.sin(angle)
        this.damage_speed = damage * 100
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
    }

    render() {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
            
            return
        }

        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        
    }
}