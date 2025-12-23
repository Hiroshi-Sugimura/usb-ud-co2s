//////////////////////////////////////////////////////////////////////
//	Copyright (C) Hiroshi SUGIMURA 2023.08.22
//////////////////////////////////////////////////////////////////////
'use strict';

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');


let udcd2s = {
	callback: null,
	portConfig: {
		path: 'COM3',
		baudRate: 115200,
		dataBits: 8,
		stopBits: 1,
		parity: 'none'
	},
	port: null,

	//////////////////////////////////////////////////////////////////////
	// リクエストデータ生成 (Uint8Array)
	startRequestData: function () {
		// command 'STA'
		const req_data = new Uint8Array([0x53, 0x54, 0x41, 0x0d, 0x0a]);
		return req_data;
	},

	stopRequestData: function () {
		// command 'STP'
		const req_data = new Uint8Array([0x53, 0x54, 0x50, 0x0d, 0x0a]);
		return req_data;
	},

	//////////////////////////////////////////////////////////////////////
	// レスポンスをパース
	// return: {state: 'OK'}
	// return: {state: 'connected', CO2:'606', HUM:'46.5', TMP:'29.8'}
	parseResponse: function (recvData) {
		try {
			// 初回接続、うまくいった
			// recvData= <Buffer 4f 4b 20 53 54 41 0d 0a>
			// toString()= OK STA

			// 定期的に関数がコールされて、このようなデータを受信する
			// recvData= <Buffer 43 4f 32 3d 36 30 36 2c 48 55 4d 3d 34 36 2e 35 2c 54 4d 50 3d 32 39 2e 38 0d 0a>
			// toString()= CO2=606,HUM=46.5,TMP=29.8
			// console.log(recvData);
			let str = recvData.toString().split(/\r?\n/)[0];

			if (str == 'OK STA') {
				return { state: 'OK' };
			}

			let d = str.split(',');
			return {
				state: 'connected',
				CO2: d[0].split('=')[1], // CO2
				HUM: d[1].split('=')[1], // HUM
				TMP: d[2].split('=')[1] // TMP
			}
		} catch (e) {
			return {state:'error'};
		}
	},


	//////////////////////////////////////////////////////////////////////
	// シリアルポートのリスト取得
	getPortList: async function () {
		let portList = [];

		await SerialPort.list()
			.then((ports) => {
				portList = ports;
			}).catch((err) => {
				console.log(err, "e")
			});

		return portList;
	},

	//////////////////////////////////////////////////////////////////////
	// entry point
	// callback = function (res, error)
	start: async function (callback, options = {}) {

		if (udcd2s.port) {  // すでに通信している
			if (udcd2s.callback) {
				udcd2s.callback({ state: 'error' }, 'udcd2s.start(): port is used already.');
			} else {
				console.error('udcd2s Error: udcd2s.start(): port is used already.');
			}
			return;
		}

		udcd2s.portConfig = {  // default config set
			path: 'COM3',
			baudRate: 115200,
			dataBits: 8,
			stopBits: 1,
			parity: 'none'
		};
		udcd2s.port = null;

		if (callback) {
			udcd2s.callback = callback;
		} else {
			console.log('Error: udcd2s.start(): callback is null.');
			return;
		}

		// CO2センサーに接続
		// ユーザーにシリアルポート選択画面を表示して選択を待ち受ける
		let portList = await udcd2s.getPortList();
		let com = await portList.filter((p) => {
			if (p.vendorId && p.productId && p.vendorId.toLowerCase() == '04d8' && p.productId.toLowerCase() == 'e95a') {  // Win ver.で大文字小文字表記違う感じなので
				return p;
			}
		});

		if (com.length == 0) {  // センサー見つからない、対象ポートがない
			if (udcd2s.callback) {
				udcd2s.callback({ state: 'error' }, 'udcd2s.start(): Sensor (UD-CO2S) is not found.');
			} else {
				console.error('udcd2s Error: udcd2s.start(): Sensor (UD-CO2S) is not found.');
			}
			return;
		}

		udcd2s.portConfig.path = com[0].path;  // センサー見つかった

		udcd2s.port = new SerialPort(udcd2s.portConfig, function (err) {  // ポート利用開始
			if (err) {
				if (udcd2s.callback) {
					udcd2s.callback({ state: 'error' }, err);
				} else {
					console.error('udcd2s ' + err);
				}
				return;
			}
		});

		// データを行にする
		const parser = new ReadlineParser({ delimiter: '\r\n' });
		udcd2s.port.pipe(parser);

		// データを受信したときの処理登録
		udcd2s.port.on('data', function (recvData) {
			let r = udcd2s.parseResponse(recvData);
			if (r) {
				if (udcd2s.callback) {
					udcd2s.callback(r, null);
				} else {
					console.dir(r);
				}
			} else {
				if (udcd2s.callback) {
					udcd2s.callback({ state: 'error' }, 'recvData is nothing.');
				}
			}
		});


		// USB外したりしたときの処理登録
		udcd2s.port.on('close', function () {
			if (udcd2s.port) {
				udcd2s.port.close();
				udcd2s.port = null;
			}

			if (udcd2s.callback) {
				udcd2s.callback({ state: 'warning' }, 'port is closed.');
				udcd2s.callback = null;
			}
		});

		// 準備できたので通信開始
		udcd2s.port.write(udcd2s.startRequestData());
	},

	stop: async function () {
		if (udcd2s.port) {
			await udcd2s.port.write(udcd2s.stopRequestData());
			await udcd2s.port.close();
			udcd2s.port = null;
		}

		if (udcd2s.callback) {
			udcd2s.callback({ state: 'info' }, 'port is closed.');
			udcd2s.callback = null;
		}
	}
};


module.exports = udcd2s;
//////////////////////////////////////////////////////////////////////
// EOF
//////////////////////////////////////////////////////////////////////
