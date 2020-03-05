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
     * @param {number} life - キャラクターのライフ(生存フラグをかねる)
     * @param {Image} image - キャラクターの画像
     */
    constructor(ctx,x,y,life,image){
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
        this.ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y
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
     * @param {Image} image - キャラクターの画像
     */
    constructor(ctx,x,y,image){
        // Characterクラスを継承しているのでまずは継承元となる
        // Characterクラスのコンストラクタを呼び出すことで初期化する
        // (superが継承元のコンストラクタの呼び出しに相当する)
        super(ctx,x,y,0,image);

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
        // 登場終了とする座標を設定する
        this.comingEndPosition = new Position(endX,endY);
    }
}