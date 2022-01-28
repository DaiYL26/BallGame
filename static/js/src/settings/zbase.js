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
}