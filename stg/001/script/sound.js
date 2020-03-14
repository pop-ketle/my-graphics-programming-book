/**
 * 効果音を再生するための簡易的なクラス
 */
class Sound {
    /**
     * @constructor
     */
    constructor(){
        /**
         * オーディオコンテキスト
         * @type {AudioContext}
         */
        this.ctx = new AudioContext();
        /**
         * デコードしたオーディオデータ
         * @type {AudioBuffer}
         */
        this.source = null;
    }
    /**
     * オーディオファイルをロードする
     * @param {string} audioPath - オーディオファイルのパス
     * @param {function} callback - ファイルのロード完了時に呼ばれるコールバック関数
     */
    load(audioPath,callback){
        // fetchを利用してオーディオファイルをロードする
        fetch(audioPath)
        .then((response) => {
            // ロード完了したレスポンスからAudioBuffer生成のためのデータを取り出す
            return response.arrayBuffer();
        })
        .then((buffer) => {
            // 取り出したデータからAudioBufferを生成する
            return this.ctx.decodeAudioData(buffer);
        })
        .then((decodeAudio) => {
            // 再利用できるようにするためにAudioBufferをプロパティに確保しておく
            this.source = decodeAudio;
            // 準備完了したのでコールバック関数を呼び出す
            callback();
        })
        .catch(() => {
            // なにかしらのエラーが発生した場合
            callback('error!');
        });
    }
    /**
     * AudioBufferからAudioBufferSourceNodeを生成し再生する
     */
    play(){
        // ノードを生成する
        let node = new AudioBufferSourceNode(this.ctx,{buffer: this.source});
        // ノードを接続する
        node.connect(this.ctx.destination);
        node.addEventListener('ended',() => {
            // 念の為stopを実行
            node.stop();
            // ノードの接続を解除する
            node.disconnect();
            // ノードをガベージコレクタが解放するようにnullでリセットしておく
            node = null;
        },false);
        // ノードの再生を開始する
        node.start();
    }
}