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

    /**
     * 対象のPositionクラスのインスタンスとの距離を返す
     * @param {Position} target - 距離を測る対象
     */
    distance(target){
        let x = this.x-target.x;
        let y = this.y-target.y;
        return Math.sqrt(x*x + y*y);
    }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character {
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
         * @type {Position}
         */
        this.vector = new Position(0.0,-1.0);
        /**
         * @type {number}
         */
        this.angle = 270 * Math.PI/180;
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
     * 進行方向を設定する
     * @param {number} x,y - X,Y方向の移動量
     */
    setVector(x,y){
        // 自身のvectorプロパティに設定する
        this.vector.set(x,y);
    }

    /**
     * 進行方向を角度を元に設定する
     * @param {number} angle - 回転量(ラジアン)
     */
    setVectorFromAngle(angle){
        // 自身の回転量を設定する
        this.angle = angle;
        // ラジアンからサインとコサインを求める
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        // 自身のvectorプロパティに設定する
        this.vector.set(cos,sin);
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

    /**
     * 自身の回転量を元に座標系を回転させる
     */
    rotationDraw(){
        this.ctx.save(); // 座標系を回転する前の状態を保存する
        // 自身の位置が座標系の中心となるように平行移動する
        this.ctx.translate(this.position.x,this.position.y);
        // 座標系を回転させる(270度の位置を基準にするため Math.PI*1.5 を引いている)
        this.ctx.rotate(this.angle - Math.PI*1.5);

        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width/2;
        let offsetY = this.height/2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            -offsetX, // 先に translate で平行移動しているのでオフセットのみ行う
            -offsetY, // 先に translate で平行移動しているのでオフセットのみ行う
            this.width,
            this.height
        );

        // 座標系を回転する前の状態に戻す
        this.ctx.restore();
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
        // 継承元の初期化
        super(ctx,x,y,w,h,0,imagePath);

        /**
         * 自身の移動スピード(update 1回あたりの移動量)
         * @type {number}
         */
        this.speed = 3;
        /**
         * ショットを撃ったあとのチェック用カウンタ
         * @type {number}
         */
        this.shotCheckCounter = 0;
        /**
         * ショットを撃つことができる間隔(フレーム数)
         * @type {number}
         */
        this.shotInterval = 10;
        /**
         * viperが登場中かどうかを表すフラグ
         * @type {boolean}
         */
        this.isComing = false;
        /**
         * 登場演出を開始した際のタイムスタンプ
         * @type {number}
         */
        this.comingStart = null;
        /**
         * 登場演出を開始する座標
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
        /**
         * 自身が持つシングルショットインスタンスの配列
         * @type {Array<Shot>}
         */
        this.singleShotArray = null;
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
     * @param {Array<Shot>} singleShotArray - 自身に設定するシングルショットの配列
     */
    setShotArray(shotArray,singleShotArray){
        // 自身のプロパティに設定する
        this.shotArray = shotArray;
        this.singleShotArray = singleShotArray;
    }

    /**
     * キャラクターの状態を更新し描画を行う
     */
    update(){
        // 現時点のタイムスタンプを取得する
        let justTime = Date.now();

        // 登場シーンかどうかに応じて処理を振り分ける
        if(this.isComing===true){
            // 登場シーンが始まってからの経過時間
            let comingTime = (justTime - this.comingStart) / 1000;
            // 登場中は時間が経つほど上に向かって進む
            let y = this.comingStartPosition.y - comingTime*50;
            // 一定の位置まで移動したら登場シーンを終了する
            if(y<=this.comingEndPosition.y){
                this.isComing = false;        // 登場シーンフラグを下ろす
                y = this.comingEndPosition.y; // 行き過ぎの可能性もあるので位置を再設定
            }
            // 求めたY座標を自機に設定する
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
            let canvasHeight = this.ctx.canvas.height;
            let tx = Math.min(Math.max(this.position.x,0),canvasWidth);
            let ty = Math.min(Math.max(this.position.y,0),canvasHeight);
            this.position.set(tx,ty);

            // キーの押下状態を調べてショットを生成する
            if(window.isKeyDown.key_z===true){
                // ショットを撃てる状態なのかを確認する
                // ショットチェック用カウンタが0以上ならショットを生成できる
                if(this.shotCheckCounter>=0){
                    let i;
                    // ショットの生存を確認し非生存のものがあれば生成する
                    for(i=0;i<this.shotArray.length;++i){
                        // 非生存かどうかを確認する
                        if(this.shotArray[i].life<=0){
                            // 自機キャラクターの座標にショットを生成する
                            this.shotArray[i].set(this.position.x,this.position.y);
                            // 中央のショットは攻撃力を2にする
                            this.shotArray[i].setPower(2);
                            // ショットを生成したのでインターバルを設定する
                            this.shotCheckCounter = -this.shotInterval;
                            // ひとつ生成したらループを抜ける
                            break;
                        }
                    }
                    // シングルショットの生存を確認し非生存のものがあれば生成する
                    // この時、2個をワンセットで生成し左右に進行方向を振り分ける
                    for(i=0;i<this.singleShotArray.length;i+=2){
                        // 非生存かどうかを確認する
                        if(this.singleShotArray[i].life<=0 && this.singleShotArray[i+1].life<=0){
                            // 真上の方向(270度)から左右に10度傾いたラジアン
                            let radCW  = 280*Math.PI / 180; // 時計回りに10度分
                            let radCCW = 260*Math.PI / 180; // 反時計回りに10度分
                            // 自機キャラクターの座標にショットを生成する
                            this.singleShotArray[i].set(this.position.x,this.position.y);
                            this.singleShotArray[i].setVectorFromAngle(radCW); // やや右に向かう
                            this.singleShotArray[i+1].set(this.position.x,this.position.y);
                            this.singleShotArray[i+1].setVectorFromAngle(radCCW); // やや左に向かう
                            // ショットを生成したのでインターバルを設定する
                            this.shotCheckCounter = -this.shotInterval;
                            // 一組生成したらループを抜ける
                            break;
                        }
                    }
                }
            }
            // ショットチェック用のカウンタをインクリメントする
            ++this.shotCheckCounter;
        }

        // 自機キャラクターを描画する
        this.draw();

        // 念の為グローバルなアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}

/**
 * 敵キャラクタークラス
 */
class Enemy extends Character {
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
         * 自身のタイプ
         * @type {string}
         */
        this.type = 'default';
        /**
         * 自身が出現してからのフレーム数
         * @type {number}
         */
        this.frame = 0;
        /**
         * 自身の移動スピード(update一回あたりの移動量)
         * @type {number}
         */
        this.speed = 3;
        /**
         * 自身が持つショットインスタンスの配列
         * @type {Array<Shot>}
         */
        this.shotArray = null;
    }

    /**
     * 敵を配置する
     * @param {number} x,y - 配置するX,Y座標
     * @param {number} [life=1] - 設定するライフ
     * @param {string} [type='default'] - 設定するタイプ
     */
    set(x,y,life=1,type='default'){
        this.position.set(x,y); // 登場開始位置に敵キャラクターを移動させる
        this.life  = life;  // 敵キャラクターのライフを0より大きい値(生存状態)に設定
        this.type  = type;  // 敵キャラクターのタイプを設定する
        this.frame = 0;     // 敵キャラクターのフレームをリセットする
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
        // もし敵キャラクターのライフが0以下の場合は何もしない
        if(this.life<=0){ return; }

        // タイプに応じて挙動を変える
        // タイプに応じてライフを0以下の場合は何もしない
        switch(this.type){
            // default タイプは設定されている進行方向にまっすぐ進むだけの挙動
            case 'default':
            default:
                // 配置後のフレームが50の時にショットを放つ
                if(this.frame===50){ this.fire(); }
                // 敵キャラクターを進行方向に沿って移動させる
                this.position.x+=this.vector.x*this.speed;
                this.position.y+=this.vector.y*this.speed;
                // もし敵キャラクターが画面外(画面下端)へ移動していたらライフ0(非生存状態)に設定
                if(this.position.y-this.height > this.ctx.canvas.height){ this.life=0; }
                break;
        }


        // 描画を行う(今の所特に回転は必要としていないのでそのまま描画)
        this.draw();
        // 自身のフレームをインクリメントする
        ++this.frame;
    }

    /**
     * 自身から指定された方向にショットを放つ
     * @param {number} [x=0.0,y=1.0] - 進行方向のベクトルのX,Y要素
     */
    fire(x=0.0,y=1.0){
        // ショットの生存を確認し非生存のものがあれば生成する
        for(let i=0;i<this.shotArray.length;++i){
            // 非生存かどうかを確認する
            if(this.shotArray[i].life<=0){
                // 敵キャラクターの座標にショットを生成する
                this.shotArray[i].set(this.position.x,this.position.y);
                // ショットのスピードを設定する
                this.shotArray[i].setSpeed(5.0);
                // ショットの進行方向を設定する(真下)
                this.shotArray[i].setVector(x,y);
                // 一つ生成したらループを抜ける
                break;
            }
        }
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
         * @type {number}
         */
        this.speed = 7;
        /**
         * 自身の攻撃力
         * @type {number}
         */
        this.power = 1;
        /**
         * 自身と衝突判定を取る対象を格納する
         * @type {Array<Character>}
         */
        this.targetArray = [];
        /**
         * 爆発エフェクトのインスタンスを格納する
         * @type {Array<Explosion>}
         */
        this.explosionArray = [];
    }

    /**
     * ショットを配置する
     * @param {number} x,y - 配置するX,Y座標
     * @param {number} [speed] - 設定するスピード
     * @param {number} [power] - 設定する攻撃力
     */
    set(x,y,speed,power){
        // 登場開始位置にショットを移動させる
        this.position.set(x,y);
        this.life = 1; // ショットのライフを0より大きい値(生存の状態)に設定する
        this.setSpeed(speed); // スピードを設定する
        this.setPower(power); // 攻撃力を設定する
    }

    /**
     * ショットのスピードを設定する
     * @param {number} [speed] - 設定するスピード
     */
    setSpeed(speed){
        // もしスピード引数が有効なら設定する
        if(speed!=null && speed>0){ this.speed = speed; }
    }

    /**
     * ショットの攻撃力を設定する
     * @param {number} [power] - 設定する攻撃力
     */
    setPower(power){
        // もしスピード引数が有効なら設定する
        if(power!=null && power>0){ this.power = power; }
    }

    /**
     * ショットが衝突判定を行う対象を設定する
     * @param {Array<Character>} [targets] - 衝突判定の対象を含む配列
     */
    setTargets(targets){
        // 引数の状態を確認して有効な場合は設定する
        if(targets!=null && Array.isArray(targets)===true && targets.length>0){
            this.targetArray = targets;
        }
    }
    /**
     * ショットが爆発エフェクトを発生できるよう設定する
     * @param {Array<Explosion>} [targets] - 爆発エフェクトを含む配列
     */
    setExplosions(targets){
        // 引数の状態を確認して有効な場合は設定する
        if(targets!=null && Array.isArray(targets)===true && targets.length>0){
            this.explosionArray = targets;
        }
    }

    /**
     * キャラクターの状態を更新し描画を行う
     */
    update(){
        // もしショットのライフが0以下の場合は何もしない
        if(this.life<=0){ return; }
        // もしショットが画面外に移動していたらライフを0(非生存の状態)に設定
        if(
            this.position.y+this.height<0 ||
            this.position.y-this.height>this.ctx.canvas.height
        ){ this.life=0; }
        // ショットを進行方向に向かって移動させる
        this.position.x+=this.vector.x*this.speed;
        this.position.y+=this.vector.y*this.speed;

        // ショットと対象との衝突判定を行う
        this.targetArray.map((v) => {
            // 自身か対象のライフが0以下の対象は無視する
            if(this.life<=0 || v.life<=0){ return; }
            // 自身の位置と対象との距離を測る
            let dist = this.position.distance(v.position);
            // 自身た対象の幅の1/4の距離まで近づいてくる場合衝突とみなす
            if(dist<=(this.width+v.width) / 4){
                // 対象のライフを攻撃力分減算する
                v.life-=this.power;
                // もし対象のライフが0以下になっていたら爆発エフェクトを発生させる
                if(v.life<=0){
                    for(let i=0;i<this.explosionArray.length;++i){
                        // 発生していない爆発エフェクトがあれば対象の位置に生成する
                        if(this.explosionArray[i].life!==true){
                            this.explosionArray[i].set(v.position.x,v.position.y);
                            break;
                        }
                    }
                }
                // 自身のライフを0にする
                this.life = 0;
            }
        });

        // 座標系の回転を考慮した描画を行う
        this.rotationDraw();
    }
}

/**
 * 爆発エフェクトクラス
 */
class Explosion {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する2Dコンテキスト
     * @param {number} radius - 爆発の広がりの半径
     * @param {number} count - 爆発の火花の数
     * @param {number} size - 爆発の火花の大きさ(幅・高さ)
     * @param {number} timeRange - 爆発が消えるまでの時間(秒単位)
     * @param {string} [color='#ff1166'] - 爆発の色
     */
    constructor(ctx,radius,count,size,timeRange,color='#ff1166'){
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = ctx;
        /**
         * 爆発の生存状態を表すフラグ
         * @type {boolean}
         */
        this.life = false;
        /**
         * 爆発をfillする際の色
         * @type {string}
         */
        this.color = color;
        /**
         * 自身の座標
         * @type {Position}
         */
        this.position = null;
        /**
         * 爆発の広がりの半径
         * @type {number}
         */
        this.radius = radius;
        /**
         * 爆発の火花の数
         * @type {number}
         */
        this.count = count;
        /**
         * 爆発が始まった瞬間のタイムスタンプ
         * @type {number}
         */
        this.startTime = 0;
        /**
         * 爆発が消えるまでの時間
         * @type {number}
         */
        this.timeRange = timeRange;
        /**
         * 火花の一つ辺りの最大の大きさ(幅・高さ)
         * @type {number}
         */
        this.fireBaseSize = size;
        /**
         * 火花の一つあたりの大きさ(幅・高さ)
         * @type {number}
         */
        this.fireSize = [];
        /**
         * 火花の位置を格納する
         * @type {Array<Position>}
         */
        this.firePosition = [];
        /**
         * 火花の進行方向を格納する
         * @type {Array<Position>}
         */
        this.fireVector = [];
    }

    /**
     * 爆発エフェクトを設定する
     * @param {number} x,y - 爆発を発生させるX,Y座標
     */
    set(x,y){
        // 火花の個数分ループして生成する
        for(let i=0;i<this.count;++i){
            // 引数を元に位置を決める
            this.firePosition[i] = new Position(x,y);
            // ランダムに火花が進む方向(となるラジアン)を決める
            let vr = Math.random() * Math.PI*2.0;
            // ラジアンを元にサインとコサインを生成し進行方向に設定する
            let s = Math.sin(vr);
            let c = Math.cos(vr);
            // 進行方向ベクトルの長さをランダムに短くし移動量をランダム化する
            let mr = Math.random();
            this.fireVector[i] = new Position(c*mr,s*mr);
            // 火花の大きさをランダム化する
            this.fireSize[i] = (Math.random()*0.5 + 0.5)*this.fireBaseSize;
        }
        // 爆発の生存状態を設定
        this.life = true;
        // 爆発が始まる瞬間のタイムスタンプを取得する
        this.startTime = Date.now();
    }

    /**
     * 爆発エフェクトを更新する
     */
    update(){
        if(this.life!==true){ return; } // 生存状態を確認する
        this.ctx.fillStyle = this.color; // 爆発エフェクト用の色を設定する
        this.ctx.globalAlpha = 0.5;
        // 爆発が発生してからの経過時間を求める
        let time = (Date.now()-this.startTime) / 1000; // TODO: 10000くらいで割るのがちょうどいいかも
        // 爆発終了までの時間で正規化して進捗度合いを算出する
        let ease = simpleEaseIn(1.0-Math.min(time/this.timeRange,1.0));
        let progress = 1.0-ease;

        // 進捗度合いに応じた位置に火花を描画する
        for(let i=0;i<this.firePosition.length;++i){
            let d = this.radius*progress; // 火花が広がる距離
            // 広がる距離分だけ移動した位置
            let x = this.firePosition[i].x + this.fireVector[i].x*d;
            let y = this.firePosition[i].y + this.fireVector[i].y*d;
            // 進捗を描かれる大きさにも反映させる
            let s = 1.0-progress;
            // 矩形を描画する
            this.ctx.fillRect(
                x - (this.fireSize[i]*s)/2,
                y - (this.fireSize[i]*s)/2,
                this.fireSize[i]*s,
                this.fireSize[i]*s
            );

            // 進捗が100%相当まで進んでいたら非生存の状態にする
            if(progress>=1.0){ this.life = false; }
        }
    }
}

function simpleEaseIn(t){
    return t*t*t*t;
}