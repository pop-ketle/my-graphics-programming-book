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
     * viperのX,Y座標
     * @type {number}
     * @type {number}
     */
    let viperX = CANVAS_WIDTH/2; // ここでは仮でcanvasの中心位置
    let viperY = CANVAS_HEIGHT/2; // ここでは仮でcanvasの中心位置

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
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }

    /**
     * イベントを設定
     */
    function eventSetting(){
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // 入力されたキーに応じて処理内容を変化させる
            switch(event.key){
                case 'ArrowLeft':
                case 'a':
                    viperX-=10;
                    break;
                case 'ArrowRight':
                case 'd':
                    viperX+=10;
                    break;
                case 'ArrowUp':
                case 'w':
                    viperY-=10;
                    break;
                case 'ArrowDown':
                case 's':
                    viperY+=10;
                    break;
            }
        },false);
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0,0,canvas.width,canvas.height,'#eeeeee');

        // 現在までの経過時間を取得する(ミリ秒を秒に変換するため1000で除算)
        let nowTime = (Date.now() - startTime) / 1000;

        // 画像を描画する(canvasの中心位置を基準にサイン波で左右に往復するようにする)
        ctx.drawImage(image,viperX,viperY);

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