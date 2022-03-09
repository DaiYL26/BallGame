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
                            outer.menu.root.settings.photo = e.url
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
}