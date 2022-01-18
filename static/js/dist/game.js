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
           outer.root.playground.show()
        });
        this.$multi_mode.click(function () {
            console.log("click multi_mode")
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
class GameMap extends AcGameObject {
    constructor(playground) {
        super()
        this.playground = playground

        this.$canvas = $('<canvas></canvas>')
        this.ctx = this.$canvas[0].getContext('2d')
        this.ctx.canvas.width = this.playground.width
        this.ctx.canvas.height = this.playground.height

        this.playground.$playground.append(this.$canvas)
    }

    start() {

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
class Particle extends AcGameObject {
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
        this.eps = 0.01

        this.cur_skill = null

        if (this.is_me) {
            this.img = new Image()
            this.img.src = this.playground.root.settings.photo
        }
    }

    start() {
        //this.render()
        let scale = this.playground.scale
        if (this.is_me) {
            this.add_listening_events()
        } else {
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

        // 监听鼠标
        this.playground.game_map.$canvas.mousedown(function (e) {
            const binding_rect = outer.ctx.canvas.getBoundingClientRect()
            // 移动
            if (e.which  === 3) {
                // console.log('move');
                outer.move_to( (e.clientX - binding_rect.left) / outer.playground.scale, (e.clientY - binding_rect.top) / outer.playground.scale )
            } else if (e.which == 1) {  //发技能
                if (outer.cur_skill === 'fireball' && outer.spent_time > 4) {
                    outer.shoot_fireball( (e.clientX - binding_rect.left) / outer.playground.scale, (e.clientY - binding_rect.top) / outer.playground.scale )
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
        let radius = 0.01
        let angle = Math.atan2(ty - y, tx - x) //获取角度，正交坐标中的角度
        let vx = Math.cos(angle)    // x方向上的单位速度
        let vy = Math.sin(angle)    // y方向上的单位速度
        let color = 'orange'        // 火球颜色
        let speed =  0.5    // 火球速度
        let move_length = 1    //火球的发射距离
        // 发射火球
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01 / this.playground.scale)
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
        this.update_move()    
        this.render()
    }

    update_move() {
        this.spent_time += this.timedelta / 1000;
        let scale = this.playground.scale

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
                if (this.is_me === false) {
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
        this.radius -= damage
        // 半径小于10时，判定死亡
        if (this.radius < this.eps) {
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
        let scale = this.playground.scale
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
            
            return
        }

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        
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

    update() {
        if (this.move_length < this.eps) {
            this.destroy()
            return false
        } 

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        // 碰撞检测
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i]
            // 不是自己，且碰撞
            if (player !== this.player && this.is_collision(player)) {
                this.attack(player)
            }
        }

        this.render()
    }

    // 攻击玩家
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
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

    show() {  // 打开playground界面
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        // console.log(this.width, this.height);        
        this.resize()
        this.game_map = new GameMap(this);
        this.players = []
        this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.15 / this.scale, true))
        
        for (let i = 0 ; i < 5; i ++) {
            this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, this.get_random_color(), this.height * 0.15 / this.scale, false))
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