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
     * @param {Image} image - キャラクターの画像
     */
    constructor(ctx,x,y,w,h,life,image){
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
         * @type {Image}
         */
        this.image = image;
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
     * @param {Image} image - キャラクターの画像
     */
    constructor(ctx,x,y,w,h,image){
        // Characterクラスを継承しているのでまずは継承元となるCharacterクラスのコンストラクタを呼び出すことで初期化する
        // (superが継承元のコンストラクタの呼び出しに相当する)
        super(ctx,x,y,w,h,0,image);

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
            if(justTime%100 < 50){ this.ctx.glovalAlpha = 0.5; }
        }

        // 自機キャラクターを描画する
        this.draw();

        // 念のためグローバルのアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}