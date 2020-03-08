(() => {
    /**
     * キーの桜花状態を調べるためのオブジェクト
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * windowオブジェクトのカスタムプロパティとして設定する
     * @global@type {object}
     */
    window.isKeyDown = {};

    /**
     * canvasの幅
     * @type {number}
     */
    const CANVAS_WIDTH = 640;
    /**
     * canvasの高さ
     * @type {number}
     */
    const CANVAS_HEIGHT = 480;
    /**
     * ショットの最大個数
     * @type {number}
     */
    const SHOT_MAX_COUNT = 10;

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
     * 実行開始時のタイムスタンプ
     * @type {number}
     */
    let startTime = null;
    /**
     * 自機キャラクターのインスタンス
     * @type {Viper}
     */
    let viper = null;
    /**
     * ショットのインスタンスを格納する配列
     * @type {Array<Shot>}
     */
    let shotArray = [];

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

        // 初期化処理を行う
        initialize();
        // インスタンスの状態を確認する
        loadCheck();
    },false);


    /**
     * canvasやコンテキストを初期化する
     */
    function initialize(){
        // canvasの大きさを設定
        canvas.width  = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // 自機キャラクターを初期化する
        viper = new Viper(ctx,0,0,64,64,'./image/viper.png');
        // 登場シーンからスタートするための設定
        viper.setComing(
            CANVAS_WIDTH/2,   // 登場演出時の開始X座標
            CANVAS_HEIGHT+50,    // 登場演出時の開始Y座標
            CANVAS_WIDTH/2,   // 登場演出を終了とするX座標
            CANVAS_HEIGHT-100 // 登場演出を終了とするY座標
        );

        // ショットを初期化する
        for(let i=0;i<SHOT_MAX_COUNT;++i){
            shotArray[i] = new Shot(ctx,0,0,32,32,'./image/viper_shot.png');
        }

        // ショットを時期キャラクターに設定する
        viper.setShotArray(shotArray);
    }

    /**
     * インスタンスの準備が完了しているか確認する
     */
    function loadCheck(){
        let ready = true; // 準備完了を意味する真偽値
        ready = ready && viper.ready; // AND演算で準備完了しているかチェックする
        // 同様にショットの準備状況も確認する
        shotArray.map((v) => {
            ready = ready && v.ready;
        });

        // 全ての処理か完了したら次の処理に進む
        if(ready===true){
            eventSetting(); // イベントを設定する
            startTime = Date.now(); // 実行開始時のタイムスタンプを所得する
            render(); // 描画処理を開始する
        }else{
            // 準備が完了していない場合は0.1秒ごとに再帰呼び出しする
            setTimeout(loadCheck,100);
        }
    }

    /**
     * イベントを設定
     */
    function eventSetting(){
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // キーの押下状態を管理するオブジェクトに押下されたことを設定する
            isKeyDown[`key_${event.key}`] = true;

        },false);
        // キーが離された時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keyup', (event) => {
            // キーが離されたことを設定する
            isKeyDown[`key_${event.key}`] = false;
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

        // 自機キャラクターの状態を更新する
        viper.update();

        // ショットの状態を更新する
        shotArray.map((v) => {
            v.update();
        });

        // 恒常ループのために描画処理を再帰呼び出しする
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