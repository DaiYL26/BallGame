export class AcGame {
    constructor (id, AcWingOS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS
        document.body.style.zoom = 1 / window.devicePixelRatio
        console.log(window.devicePixelRatio)
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