(() => {
    /**
     * canvasの幅
     * @type {number}
     */
    const CANVAS_WIDTH = 640;
    /**
     * @type {number}
     */
    const CANVAS_HEIGHT = 480;

    /**
     * Canvas2D APIをラップしたユーティリティクラス
     * @type {Canvas2DUtility}
     */
    let util = null;
    /**
     * 描画対象となるCanvas Element
     * @type {HTMLCanvasElement}
     */
    let canvas = null;
    /**
     * Canvas2D APIのコンテキスト
     * @type {CanvasRenderingContext2D}
     */
    let ctx = null;
    /**
     * イメージのインスタンス
     * @type {Image}
     */
    let image = null;
    /** 
     * 実行開始時のタイムスタンプ
     * @type {number
     */
    let startTime = null;
    /**
     * 自機キャラクターのインスタンス
     * @type {Viper}
     */
    let viper = null;

    /**
     * ページのロードが完了した時に発火する loadイベント
     */
    window.addEventListener('load', () => {
        // ユーティリティクラスを初期化
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        // ユーティリティクラスからcanvasを取得
        canvas = util.canvas;
        // ユーティリティクラスから2dコンテキストを取得
        ctx = util.context;

        // まず最初に画像の読み込みを開始する
        util.imageLoader('./image/viper.png', (loadedImage) => {
            // 引数経由で画像を受け取り変数に代入しておく
            image = loadedImage;
            // 初期化処理を行う
            initialize();
            // イベントを設定する
            eventSetting();
            // 実効開始時のタイムスタンプを取得する
            startTime = Date.now();
            // 描画処理を行う
            render();
        });
    },false);

    /**
     * canvasやコンテキストを初期化する
     */
    function initialize(){
        // canvasの大きさを設定
        canvas.width  = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // 自機キャラクターを初期化する
        viper = new Viper(ctx,0,0,image);
        // 登場シーンからスタートするための設定
        viper.setComing(
            CANVAS_WIDTH/2,   // 登場演出時の開始X座標
            CANVAS_HEIGHT,    // 登場演出時の開始Y座標
            CANVAS_WIDTH/2,   // 登場演出を終了とするX座標
            CANVAS_HEIGHT-100 // 登場演出を終了とするY座標
        );
    }

    /**
     * イベントを設定
     */
    function eventSetting(){
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // 登場シーンなら何もしないで終了
            if(viper.isComing===true){ return; }
            // 入力されたキーに応じて処理内容を変化させる
            switch(event.key){
                case 'ArrowLeft':
                case 'a':
                    viper.position.x-=10;
                    break;
                case 'ArrowRight':
                case 'd':
                    viper.position.x+=10;
                    break;
                case 'ArrowUp':
                case 'w':
                    viper.position.y-=10;
                    break;
                case 'ArrowDown':
                case 's':
                    viper.position.y+=10;
                    break;
            }
        },false);
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // グローバルなアルファを必ず1.0で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0,0,canvas.width,canvas.height,'#eeeeee');
        // 現在までの経過時間を取得する(ミリ秒を秒に変換するため1000で除算)
        let nowTime = (Date.now() - startTime) / 1000;

        // 登場シーンの処理
        if(viper.isComing===true){
            // 登場シーンが始まってからの経過時間
            let justTime = Date.now();
            let comingTime = (justTime - viper.comingStart) / 1000;
            // 登場中は時間がたつほど上に向かって進む
            let y = CANVAS_HEIGHT - comingTime*50;
            // 一定の位置まで移動したら登場シーンを終了する
            if(y<=viper.comingEndPosition.y){
                viper.isComing = false;              // 登場シーンフラグを下ろす
                y = viper.comingEndPosition.y;       // 行き過ぎの可能性もあるので位置を再設定
            }
            // 求めたY座標を時期に設定する
            viper.position.set(viper.position.x,y);
            // justTimeを100で割った時あまりが50より小さくなる場合だけ半透明にする
            if(justTime%100 < 50){ ctx.globalAlpha = 0.5; }
        }

        // 時期キャラクターを描画する
        viper.draw();
        // // 画像を描画する(canvasの中心位置を基準にサイン波で左右に往復するようにする)
        // ctx.drawImage(image,viperX,viperY);

        // 工場ループのために描画処理を再帰呼び出しする
        requestAnimationFrame(render);
    }

    /**
     * 特定の範囲におけるランダムな整数の値を生成する
     * @param {number} range - 乱数を生成する範囲(0以上~range未満)
     */
    function generateRandomInt(range){
        let random = Math.random();
        return Math.floor(random*range);
    }
})();