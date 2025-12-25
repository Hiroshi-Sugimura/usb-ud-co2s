# Overview

このモジュールは**I/O DATAのUSB CO2センサ(UD-CO2S)**をサポートします．
非公式ですので、本モジュールに関してOMRON社様に問い合わせなどは行わないようにお願いします．

This module provides **USB environment sensor (UD-CO2S) producted by I/O DATA**.
This module is informality.


動作確認は UD-CO2 (https://www.iodata.jp/product/tsushin/iot/ud-co2s/index.htm) で行いました．


# Install


次に下記コマンドでモジュールをインストールできます．

You can install the module as following command.


```bash
npm i usb-ud-co2s
```


# Demos

## demo


Here is a demonstration script.

```JavaScript:Demo
'use strict';

const udco2s = require('usb-ud-co2s');

udco2s.start(  (res, error) => {
	if( error ) {
		console.error( '#', error );
		return;
	}

	console.log( '----------------------------' );
	let dt = new Date();
	console.log( dt );
	console.dir( res );
} );
```



# Data stracture

```JavaScript:stracture
{ state: 'OK' }
```

```
{ state: 'connected', CO2: '623', HUM: '52.5', TMP: '28.9' }
```

# APIs

## 初期化と実行

- start(callback)
受信したらcallback関数を呼び出します。
callback関数は下記の形式です。

```
callback( sensorData, error )
```


- stop()
終了してportを開放します。



## Authors

神奈川工科大学  創造工学部  ホームエレクトロニクス開発学科; Dept. of Home Electronics, Faculty of Creative Engineering, Kanagawa Institute of Technology

杉村　博; SUGIMURA, Hiroshi

## thanks

Thanks to Github users!

- 参考にしたソース、Reference
https://sokosun.tumblr.com/post/705952427815337984/io-data-ud-co2s


## License

MIT License

```
-- License summary --
o Commercial use
o Modification
o Distribution
o Private use
x Liability
x Warranty
```


## Log


- 1.1.0 testを追加してdebug 
- 1.0.2 Win ver. 変化対応
- 1.0.1 少し手直し
- 1.0.0 動作確認済み
- 0.0.1 開発開始、公開
