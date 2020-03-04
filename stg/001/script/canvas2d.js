/**
 * Canvas2D APIをラップしたユーティリティクラス
 */
class Canvas2DUtility {
    /**
     * @construtor
     * @param {HTMLCanvasElement} canvas - 対象となるcanvas element
     */
    constructor(canvas){
        /**
         * @type {HTMLCanvasElement}
         */
        this.canvasElement = canvas;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.context2d = canvas.getContext('2d');
    }

    /**
     * @return {HTMLCanvasElement}
     */
    get canvas(){return this.canvasElement;}

    /**
     * @return {CanvasRenderingContext2D}
     */
    get context(){return this.context2d;}

    /**
     * 矩形を描画する
     * @param {number} x,y - 塗りつぶす矩形の左上角のX,Y座標
     * @param {number} width,height - 塗りつぶす矩形の横幅、高さ
     * @param {string} [color] - 矩形を塗りつぶす際の色
     */
    drawRect(x,y,width,height,color){
        // 色が指定されている場合はスタイルを設定
        if(color!=null) this.context2d.fillStyle = color;

        this.context2d.fillRect(x,y,width,height);
    }

    /**
     * 線分を描画する
     * @param {number} x1,y1 - 線分の始点のX,Y座標
     * @param {number} x2,y2 - 線分の終点のX,Y座標
     * @param {string} [color] - 線を描画する際の色
     * @param {number} [width=1] - 線幅
     */
    drawLine(x1,y1,x2,y2,color,width=1){
        // 色が指定されている場合はスタイルを設定する
        if(color!=null) this.context2d.strokeStyle = color;

        this.context2d.lineWidth = width; // 線幅を設定する
        this.context2d.beginPath(); // パスの設定を開始することを明示
        this.context2d.moveTo(x1,y1); // パスの視点を設定する
        this.context2d.lineTo(x2,y2);　// 直線のパスを終点座標に向けて設定する
        this.context2d.closePath(); // パスを閉じることを明示する
        this.context2d.stroke();  // 設定したパスで線描画を行う
    }

    /**
     * 多角形を描画する
     * @param {Array<number>} points - 多角形の各頂点の座標
     * @param {string} [color] - 多角形を描画する際の色
     */
    drawPolygon(points,color){
        // pointsが配列であるかどうか確認し、
        // 多角形を書くために十分な個数のデータが存在するか調べる
        if(Array.isArray(points)!=true || points.length<6) return;
        // 色が指定されている場合はスタイルを設定する
        if(color!=null) this.context2d.fillStyle = color;

        this.context2d.beginPath(); // パスの設定を開始することを明示
        this.context2d.moveTo(points[0],points[1]); // パスの視点を設定する
        // 各頂点を結ぶパスを設定する
        for(let i=2;i<points.length;i+=2){
            this.context2d.lineTo(points[i],points[i+1]);
        }
        this.context2d.closePath(); // パスを閉じることを明示する
        this.context2d.fill(); // 設定したパスで多角形の描画を行う
    }

    /**
     * 円を描画する
     * @param {number} x,y - 円の中心位置のX,Y座標
     * @param {number} radius - 円の半径
     * @param {string} [color] - 円を描画する際の色
     */
    drawCircle(x,y,radius,color){
        // 色が指定されている場合はスタイルを設定する
        if(color!=null) this.context2d.fillStyle = color;

        this.context2d.beginPath(); // パスの設定を開始することを明示
        this.context2d.arc(x,y,radius,0.0,Math.PI*2.0); // 円のパスを設定する
        this.context2d.closePath(); // パスを閉じることを明示する
        this.context2d.fill(); // 設定したパスで円の描画を行う
    }

    /**
     * 扇形を描画する
     * @param {number} x,y - 扇形を形成する円の中心位置のX,Y座標
     * @param {number} radius - 扇形を形成する円の半径
     * @param {number} startRadian,endRadian - 扇型の開始角、終了角
     * @param {string} [color] - 扇形を描画する際の色
     */
    drawFan(x,y,radius,startRadian,endRadian,color){
        // 色が指定されている場合はスタイルを設定する
        if(color!=null) this.context2d.fillStyle = color;

        this.context2d.beginPath(); // パスの設定を開始することを明示
        this.context2d.moveTo(x,y); // パスを扇形を形成する円の中心に移動する
        this.context2d.arc(x,y,radius,startRadian,endRadian); // 円のパスを設定する
        this.context2d.closePath(); // パスを閉じることを明示する
        this.context2d.fill(); // 設定したパスで円の描画を行う
    }

    /**
     * 線分を二次ベジェ曲線で描画する
     * @param {number} x1,y2 - 線分の始点のX,Y座標
     * @param {number} x2,y2 - 線分の終点のX,Y座標
     * @param {number} cx,cy - 制御点のX,Y座標
     * @param {string} [color] - 線を描画する際の色
     * @param {number} [width=1] - 線幅
     */
    drawQuadraticBezier(x1,y1,x2,y2,cx,cy,color,width=1){
        // 色が指定されている場合はスタイルを設定する
        if(color!=null) this.context2d.strokeStyle = color;

        this.context2d.lineWidth = width; // 線幅を設定する
        this.context2d.beginPath(); // パスの設定を開始することを明示
        this.context2d.moveTo(x1,y1); // パスの始点を設定する
        this.context2d.quadraticCurveTo(cx,cy,x2,y2); // 二次ベジェ曲線の制御点と終点を設定する
        this.context2d.closePath(); // パスを閉じることを明示する
        this.context2d.stroke(); // 設定したパスで線描画を行う
    }

    /**
     * @param {number} x1,y2 - 線分の始点のX,Y座標
     * @param {number} x2,y2 - 線分の終点のX,Y座標
     * @param {number} cx1,cy1 - 始点の制御点のX,Y座標
     * @param {number} cx2,cy2 - 終点の制御点のX,Y座標
     * @param {string} [color] - 線を描画する際の色
     * @param {number} [width=1] - 線幅
     */
    drawCubicBezier(x1,y1,x2,y2,cx1,cy1,cx2,cy2,color,width=1){
        // 色が指定されている場合はスタイルを設定する
        if(color!=null) this.context2d.strokeStyle = color;

        this.context2d.lineWidth = width; // 線幅を設定する
        this.context2d.beginPath(); // パスの設定を開始することを明示する
        this.context2d.moveTo(x1,y1); // パスの始点を設定する
        this.context2d.bezierCurveTo(cx1,cy1,cx2,cy2,x2,y2); // 三次ベジェ曲線の制御点と終点を設定する
        this.context2d.closePath(); // パスを閉じることを明示する
        this.context2d.stroke(); // 設定したパスで線描画を行う
    }

    /**
     * テキストを描画する
     * @param {string} text - 描画するテキスト
     * @param {number} x,y - テキストを描画する位置のX,Y座標
     * @param {string} [color] - テキストを描画する際の色
     * @param {number} [width] - テキストを描画する幅に上限を設定する際の上限値
     */
    drawText(text,x,y,color,width){
        // 色が指定されている場合はスタイルを設定する
        if(color!=null) this.context2d.fillStyle = color;

        this.context2d.fillText(text,x,y,width);
    }

    /**
     * 画像をロードしてコールバック関数にロードした画像を与え呼び出す
     * @param {string} path - 画像ファイルのパス
     * @param {function} [callback] - コールバック関数
     */
    imageLoader(path,callback){
        let target = new Image(); // 画像のインスタンスを生成
        // 画像がロード完了したときの処理を先に記述する
        target.addEventListener('load',() => {
            // もしコールバックがあれば呼び出す
            if(callback!=null) callback(target); // コールバック関数の引数に画像を渡す
        },false);
        target.src = path; // 画像のロードを開始するためにパスを指定する
    }
}