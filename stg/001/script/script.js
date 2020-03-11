(() => {
    /**
     * キーの押下状態を調べるためのオブジェクト
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * windowオブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {object}
     */
    window.isKeyDown = {};
    /**
     * スコアを格納する
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * windowオブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {number}
     */
    window.gameScore = 0;

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
     * 敵キャラクターのインスタンス数
     * @type {number}
     */
    const ENEMY_MAX_COUNT = 10;
    /**
     * ショットの最大個数
     * @type {number}
     */
    const SHOT_MAX_COUNT = 10;
    /**
     * 敵キャラクターのショットの最大個数
     * @type {number}
     */
    const ENEMY_SHOT_MAX_COUNT = 50;
    /**
     * 爆発エフェクトの最大個数
     * @type {number}
     */
    const EXPLOSION_MAX_COUNT = 10;

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
     * シーンマネージャー
     * @type {SceneManager}
     */
    let scene = null;
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
     * 敵キャラクターのインスタンスを格納する配列
     * @type {Array<Enemy>}
     */
    let enemyArray = [];
    /**
     * ショットのインスタンスを格納する配列
     * @type {Array<Shot>}
     */
    let shotArray = [];
    /**
     * シングルショットのインスタンスを格納する配列
     * @type {Array<Shot>}
     */
    let singleShotArray = [];
    /**
     * 敵キャラクターのショットのインスタンスを格納する配列
     * @type {Array<Shot>}
     */
    let enemyShotArray = [];
    /**
     * 爆発エフェクトのインスタンスを格納する配列
     * @type {Array<Explosion>}
     */
    let explosionArray = [];
    /**
     * 再スタートするためのフラグ
     * @type {boolean}
     */
    let restart = false;

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
        let i;
        // canvasの大きさを設定
        canvas.width  = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // シーンを初期化する
        scene = new SceneManager();

        // 爆発エフェクトを初期化する
        for(i=0;i<EXPLOSION_MAX_COUNT;++i){
            explosionArray[i] = new Explosion(ctx,100.0,15,40.0,1.0);
        }
        
        // 自機のショットを初期化する
        for(i=0;i<SHOT_MAX_COUNT;++i){
            shotArray[i] = new Shot(ctx,0,0,32,32,'./image/viper_shot.png');
            singleShotArray[i*2] = new Shot(ctx,0,0,32,32,'./image/viper_single_shot.png');
            singleShotArray[i*2+1] = new Shot(ctx,0,0,32,32,'./image/viper_single_shot.png');
        }

        // 自機キャラクターを初期化する
        viper = new Viper(ctx,0,0,64,64,'./image/viper.png');
        // 登場シーンからスタートするための設定
        viper.setComing(
            CANVAS_WIDTH/2,   // 登場演出時の開始X座標
            CANVAS_HEIGHT+50,    // 登場演出時の開始Y座標
            CANVAS_WIDTH/2,   // 登場演出を終了とするX座標
            CANVAS_HEIGHT-100 // 登場演出を終了とするY座標
        );
        // ショットを自機キャラクターに設定する
        viper.setShotArray(shotArray,singleShotArray);
        
        // 敵キャラクターのショットを初期化する
        for(i=0;i<ENEMY_SHOT_MAX_COUNT;++i){
            enemyShotArray[i] = new Shot(ctx,0,0,32,32,'./image/enemy_shot.png');
            enemyShotArray[i].setTargets([viper]); // 引数は配列なので注意
            enemyShotArray[i].setExplosions(explosionArray);
        }
        
        // 敵キャラクターを初期化する
        for(i=0;i<ENEMY_MAX_COUNT;++i){
            enemyArray[i] = new Enemy(ctx,0,0,48,48,'./image/enemy_small.png');
            // 敵キャラクターは全て同じショットを共有するのでここで与えておく
            enemyArray[i].setShotArray(enemyShotArray);
        }

        // 衝突判定を行うために対象を設定する
        // 爆発エフェクトを行うためにショットを設定する
        for(i=0;i<SHOT_MAX_COUNT;++i){
            shotArray[i].setTargets(enemyArray);
            singleShotArray[i*2].setTargets(enemyArray);
            singleShotArray[i*2+1].setTargets(enemyArray);
            shotArray[i].setExplosions(explosionArray);
            singleShotArray[i*2].setExplosions(explosionArray);
            singleShotArray[i*2+1].setExplosions(explosionArray);
        }
    }

    /**
     * インスタンスの準備が完了しているか確認する
     */
    function loadCheck(){
        let ready = true; // 準備完了を意味する真偽値
        ready = ready && viper.ready; // AND演算で準備完了しているかチェックする
        // 同様に敵キャラクターの準備状況も確認する
        enemyArray.map((v) => {
            ready = ready && v.ready;
        });
        // 同様にショットの準備状況も確認する
        shotArray.map((v) => {
            ready = ready && v.ready;
        });
        // 同様にシングルショットの準備状況も確認する
        singleShotArray.map((v) => {
            ready = ready && v.ready;
        });
        // 同様に敵キャラクターのショットの準備状況も確認する
        enemyShotArray.map((v) => {
            ready = ready && v.ready;
        });
        
        // 全ての準備が完了したら次の処理に進む
        if(ready===true){
            eventSetting(); // イベントを設定する
            sceneSetting(); // シーンを定義する
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
            // ゲームオーバーから再スタートするための設定(エンターキー) Rキーも追加
            if(event.key==='Enter' || event.key==='r'){
                // 自機キャラクターのライフが0以下の状態
                if(viper.life<=0){
                    // 再スタートフラグを立てる
                    restart = true;
                }
            }
        },false);
        // キーが離された時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keyup', (event) => {
            // キーが離されたことを設定する
            isKeyDown[`key_${event.key}`] = false;
        },false);
    }

    /**
     * シーンを設定する
     */
    function sceneSetting(){
        // イントロシーン
        scene.add('intro',(time) => {
            // 2秒経過したらシーンをinvadeに変更する
            if(time>2.0){ scene.use('invade'); }
        });
        // invadeシーン
        scene.add('invade',(time) => {
            // シーンのフレーム数が0の時は敵キャラクターを配置する
            if(scene.frame===0){
                // ライフが0状態の敵キャラクターが見つかったら配置する
                for(let i=0;i<ENEMY_MAX_COUNT;++i){
                    if(enemyArray[i].life<=0){
                        let e = enemyArray[i];
                        // 出現場所はXが画面中央、Yが画面上端の外側に設定
                        // この敵キャラクターのライフを2に設定する
                        e.set(CANVAS_WIDTH/2,-e.height,2,'default');
                        // 進行方向は真下に向かうように設定する
                        e.setVector(0.0,1.0);
                        break;
                    }
                }
            }
            // シーンのフレーム数が100になった時にinvadeを再設定する
            if(scene.frame===100){ scene.use('invade'); }
            // 自機キャラクターが被弾してライフが0担っていたらゲームオーバー
            if(viper.life<=0){ scene.use('gameover'); }
        });
        // ゲームオーバーシーン
        // ここでは画面にゲームオーバーの文字が流れ続けるようにする
        scene.add('gameover',(time) => {
            // 流れる文字の幅は画面の幅の半分を最大の幅とする
            let textWidth = CANVAS_WIDTH/2;
            // 文字の幅を全体の幅に足し、ループする幅を決める
            let loopWidth = CANVAS_WIDTH+textWidth;
            // フレーム数に対する徐算の剰余を計算し、文字列の位置とする
            let x = CANVAS_WIDTH-(scene.frame*2)%loopWidth;
            // 文字列の描画
            ctx.font = 'bold 72px sans-serif';
            util.drawText('GAME OVER',x,CANVAS_HEIGHT/2,'#ff0000',textWidth);
            // 再スタートのための処理
            if(restart===true){
                restart = false; // 再スタートフラグはここでまず最初に下げておく
                gameScore = 0; // スコアをリセットしておく
                // 再度スタートするために座標等の設定
                viper.setComing(
                    CANVAS_WIDTH/2,   // 登場演出時の開始X座標
                    CANVAS_HEIGHT+50, // 登場演出時の開始Y座標
                    CANVAS_WIDTH/2,   // 登場演出時の終了X座標
                    CANVAS_HEIGHT-100 // 登場演出時の終了Y座標
                );
                scene.use('intro'); // シーンをintroに設定
            }
        });
        // 一番最初のシーンにはintroを設定する
        scene.use('intro');
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

        // スコアの表示
        ctx.font = 'bold 24px monospace';
        util.drawText(zeroPadding(gameScore,5),30,50,'#111111');

        // シーンを更新する
        scene.update();

        // 自機キャラクターの状態を更新する
        viper.update();

        // 敵キャラクターの状態を更新する
        enemyArray.map((v) => {
            v.update();
        });

        // ショットの状態を更新する
        shotArray.map((v) => {
            v.update();
        });

        // シングルショットの状態を更新する
        singleShotArray.map((v) => {
            v.update();
        });

        // 敵キャラクターのショットの状態を更新する
        enemyShotArray.map((v) => {
            v.update();
        });

        // 爆発エフェクトの状態を更新する
        explosionArray.map((v) => {
            v.update();
        });

        // 恒常ループのために描画処理を再帰呼出しする
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

    /**
     * 数値の不足した桁数をゼロで梅田文字列を返す
     * @param {number} number - 数値
     * @param {number} count - 桁数(2桁以上)
     */
    function zeroPadding(number,count){
        // 配列を指定の桁数分の長さで初期化する
        let zeroArray = new Array(count);
        // 配列の要素を'0'を挟んで連結する(つまり「桁数-1」の0が連なる)
        let zeroString = zeroArray.join('0')+number;
        // 文字列の後ろから桁数分だけ文字を抜き取る
        return zeroString.slice(-count);
    }
})();