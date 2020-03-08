

/**
 * 座標を管理するためのクラス
 */
class Position {
    /**
     * @constructor
     * @param {number} x,y - X,Y座標
     */
    constructor(x,y){
        /**
         * X,Y座標
         * @type {number}
         */
        this.x = x;
        this.y = y;
    }

    /**
     * 値を設定する
     * @param {number} [x],[y] - 設定するX,Y座標
     */
    set(x,y){
        if(x!=null){ this.x = x; }
        if(y!=null){ this.y = y; }
    }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character{
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x,y - X,Y座標
     * @param {number} w,h - 幅、高さ
     * @param {number} life - キャラクターのライフ(生存フラグをかねる)
     * @param {string} imagePath - キャラクターの画像のパス
     */
    constructor(ctx,x,y,w,h,life,imagePath){
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = ctx;
        /**
         * @type {Position}
         */
        this.position = new Position(x,y);
        /**
         * @type {number}
         */
        this.width = w;
        /**
         * @type {number}
         */
        this.height = h;
        /**
         * @type {number}
         */
        this.life = life;
        /**
         * @type {boolean}
         */
        this.ready = false;
        /**
         * @type {Image}
         */
        this.image = new Image();
        this.image.addEventListener('load', () => {
            // 画像のロードが完了したら準備完了フラグを立てる
            this.ready = true;
        }, false);
        this.image.src = imagePath;
    }

    /**
     * キャラクターを描画する
     */
    draw(){
        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width/2;
        let offsetY = this.height/2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            this.position.x-offsetX,
            this.position.y-offsetY,
            this.width,
            this.height
        );
    }
}

/**
 * viperクラス
 */
class Viper extends Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x,y - X,Y座標
     * @param {number} w,h - 幅、高さ
     * @param {Image} image - キャラクターの画像用のパス
     */
    constructor(ctx,x,y,w,h,imagePath){
        // Characterクラスを継承しているのでまずは継承元となるCharacterクラスのコンストラクタを呼び出すことで初期化する
        // (superが継承元のコンストラクタの呼び出しに相当する)
        super(ctx,x,y,w,h,0,imagePath);

        /**
         * 自身の移動スピード(update 1回あたりの移動量)
         * @type {number}
         */
        this.speed = 3;
        /**
         * viperが搭乗中かどうかを表すフラグ
         * @type {boolean}
         */
        this.isComing = false;
        /**
         * 登場演出を開始した際のタイムスタンプ
         * @type {number}
         */
        this.comingStart = null;
        /**
         * 登場演出を完了とする座標
         * @type {Position}
         */
        this.comingStartPosition = null;
        /**
         * 登場演出を完了とする座標
         * @type {Position}
         */
        this.comingEndPosition = null;
        /**
         * 自身が持つショットインスタンスの配列
         * @type {Array<Shot>}
         */
        this.shotArray = null;
    }

    /**
     * 登場演出に関する設定を行う
     * @param {number} startX,startY - 登場開始時のX,Y座標
     * @param {number} endX,endY - 登場終了とするX,Y座標
     */
    setComing(startX,startY,endX,endY){
        // 登場中のフラグを立てる
        this.isComing = true;
        // 登場開始時のタイムスタンプを取得する
        this.comingStart = Date.now();
        // 登場開始位置に自機を移動させる
        this.position.set(startX,startY);
        // 登場開始位置を設定する
        this.comingStartPosition = new Position(startX,startY);
        // 登場終了とする座標を設定する
        this.comingEndPosition = new Position(endX,endY);
    }
    /**
     * ショットを設定する
     * @param {Array<Shot>} shotArray - 自身に設定するショットの配列
     */
    setShotArray(shotArray){
        this.shotArray = shotArray; // 自身のプロパティに設定する
    }

    /**
     * キャラクターの状態を更新し描画を行う
     */
    update(){
        // 現時点のタイムスタンプを取得する
        let justTime = Date.now();

        // 登場シーンの処理
        if(this.isComing===true){
            // 登場シーンが始まってからの経過時間
            let comingTime = (justTime - this.comingStart) / 1000;
            // 登場中は時間が経つほど上に向かって進む
            let y = this.comingStartPosition.y - comingTime*50;
            // 一定の位置まで移動したら登場シーンを終了する
            if(y<=this.comingEndPosition.y){
                this.isComing = false;       // 登場シーンフラグを下ろす
                y = this.comingEndPosition.y // 行き過ぎの可能性もあるので位置を再設定
            }
            // 求めたY座標を時期に設定する
            this.position.set(this.position.x, y);
            
            // 自機の登場演出時は点滅させる
            if(justTime%100 < 50){ this.ctx.globalAlpha = 0.5; }

        }else{
            // キーの押下状態に応じて処理内容を変化させる
            if(window.isKeyDown.key_ArrowLeft===true || window.isKeyDown.key_a===true){
                this.position.x-=this.speed;
            }
            if(window.isKeyDown.key_ArrowRight===true || window.isKeyDown.key_d===true){
                this.position.x+=this.speed;
            }
            if(window.isKeyDown.key_ArrowUp===true || window.isKeyDown.key_w===true){
                this.position.y-=this.speed;
            }
            if(window.isKeyDown.key_ArrowDown===true || window.isKeyDown.key_s===true){
                this.position.y+=this.speed;
            }
            // 移動後の位置が画面外へ出ていないか確認して修正する
            let canvasWidth  = this.ctx.canvas.width;
            let canvasHeight = this.ctx.canvas.height
            let tx = Math.min(Math.max(this.position.x,0),canvasWidth);
            let ty = Math.min(Math.max(this.position.y,0),canvasHeight);
            this.position.set(tx,ty);

            // キーの押下状態を調べてショットを生成する
            if(window.isKeyDown.key_z===true){
                // ショットの生存を確認し非生存の物があれば生成する
                for(let i=0;i<this.shotArray.length;++i){
                    // 非生存かどうかを確認する
                    if(this.shotArray[i].life<=0){
                        // 自機キャラクターの座標にショットを生成する
                        this.shotArray[i].set(this.position.x,this.position.y);
                        // 一つ生成したらループを抜ける
                        break;
                    }
                }
            }
        }

        // 自機キャラクターを描画する
        this.draw();

        // 念のためグローバルなアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}

/**
 * shotクラス
 */
class Shot extends Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する2Dコンテキスト
     * @param {number} x,y - X,Y座標
     * @param {number} w,h - 幅、高さ
     * @param {Image} image - キャラクター用の画像のパス
     */
    constructor(ctx,x,y,w,h,imagePath){
        super(ctx,x,y,w,h,0,imagePath); // 継承元の初期化

        /**
         * 自身の移動スピード(update一回あたりの移動量)
         * @type {numer}
         */
        this.speed = 7;
    }

    /**
     * ショットを配置する
     * @param {number} x,y - 配置するX,Y座標
     */
    set(x,y){
        // 登場開始位置にショットを移動させる
        this.position.set(x,y);
        // ショットのライフを0より大きい値(生存の状態)に設定する
        this.life = 1;
    }

    /**
     * キャラクターの状態を更新し描画を行う
     */
    update(){
        // もしショットのライフが0以下の場合は何もしない
        if(this.life<=0){ return; }
        // もしショットが画面外に移動していたらライフを0(非生存の状態)に設定
        if(this.position.y+this.height<0){ this.life=0; }
        // ショットを上に向かって移動させる
        this.position.y-=this.speed;
        // ショットを描画する
        this.draw();
    }
}