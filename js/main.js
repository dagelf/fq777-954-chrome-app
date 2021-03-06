var Player = require('./player');

if(!!navigator.getGamepads){
	const droneIp = '172.16.10.1';
	const droneTcpPort = 8888;
	const droneUdpPort = 8895;

	var udpSocket;
	var tcpSocketControl;
	var tcpSocketVideo1;
	var tcpSocketVideo2;

	var udpBound = false;

	var player = new Player({});

	window.onload = function() {
		document.body.appendChild(player.player.canvas);
	}

	var magicBytesCtrl = [
		0x49, 0x54, 0x64, 0x00, 0x00, 0x00, 0x5D, 0x00, 0x00, 0x00, 0x81, 0x85, 0xFF, 0xBD, 0x2A, 0x29, 0x5C, 0xAD, 0x67, 0x82, 0x5C, 0x57, 0xBE, 0x41, 0x03, 0xF8, 0xCA, 0xE2, 0x64, 0x30, 0xA3, 0xC1,
		0x5E, 0x40, 0xDE, 0x30, 0xF6, 0xD6, 0x95, 0xE0, 0x30, 0xB7, 0xC2, 0xE5, 0xB7, 0xD6, 0x5D, 0xA8, 0x65, 0x9E, 0xB2, 0xE2, 0xD5, 0xE0, 0xC2, 0xCB, 0x6C, 0x59, 0xCD, 0xCB, 0x66, 0x1E, 0x7E, 0x1E,
		0xB0, 0xCE, 0x8E, 0xE8, 0xDF, 0x32, 0x45, 0x6F, 0xA8, 0x42, 0xEE, 0x2E, 0x09, 0xA3, 0x9B, 0xDD, 0x05, 0xC8, 0x30, 0xA2, 0x81, 0xC8, 0x2A, 0x9E, 0xDA, 0x7F, 0xD5, 0x86, 0x0E, 0xAF, 0xAB, 0xFE,
		0xFA, 0x3C, 0x7E, 0x54, 0x4F, 0xF2, 0x8A, 0xD2, 0x93, 0xCD
	];

	var magicBytesVideo1 = [
		[0x49, 0x54, 0x64, 0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x00, 0x0F, 0x32, 0x81, 0x95, 0x45, 0x2E, 0xF5, 0xE1, 0xA9, 0x28, 0x10, 0x86, 0x63, 0x17, 0x36, 0xC3, 0xCA, 0xE2, 0x64, 0x30, 0xA3, 0xC1,
        0x5E, 0x40, 0xDE, 0x30, 0xF6, 0xD6, 0x95, 0xE0, 0x30, 0xB7, 0xC2, 0xE5, 0xB7, 0xD6, 0x5D, 0xA8, 0x65, 0x9E, 0xB2, 0xE2, 0xD5, 0xE0, 0xC2, 0xCB, 0x6C, 0x59, 0xCD, 0xCB, 0x66, 0x1E, 0x7E, 0x1E,
        0xB0, 0xCE, 0x8E, 0xE8, 0xDF, 0x32, 0x45, 0x6F, 0xA8, 0x42, 0xB7, 0x33, 0x0F, 0xB7, 0xC9, 0x57, 0x82, 0xFC, 0x3D, 0x67, 0xE7, 0xC3, 0xA6, 0x67, 0x28, 0xDA, 0xD8, 0xB5, 0x98, 0x48, 0xC7, 0x67,
        0x0C, 0x94, 0xB2, 0x9B, 0x54, 0xD2, 0x37, 0x9E, 0x2E, 0x7A],
		[0x49, 0x54, 0x64, 0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x00, 0x54, 0xB2, 0xD1, 0xF6, 0x63, 0x48, 0xC7, 0xCD, 0xB6, 0xE0, 0x5B, 0x0D, 0x1D, 0xBC, 0xA8, 0x1B, 0xCA, 0xE2, 0x64, 0x30, 0xA3, 0xC1,
        0x5E, 0x40, 0xDE, 0x30, 0xF6, 0xD6, 0x95, 0xE0, 0x30, 0xB7, 0xC2, 0xE5, 0xB7, 0xD6, 0x5D, 0xA8, 0x65, 0x9E, 0xB2, 0xE2, 0xD5, 0xE0, 0xC2, 0xCB, 0x6C, 0x59, 0xCD, 0xCB, 0x66, 0x1E, 0x7E, 0x1E,
        0xB0, 0xCE, 0x8E, 0xE8, 0xDF, 0x32, 0x45, 0x6F, 0xA8, 0x42, 0xB7, 0x33, 0x0F, 0xB7, 0xC9, 0x57, 0x82, 0xFC, 0x3D, 0x67, 0xE7, 0xC3, 0xA6, 0x67, 0x28, 0xDA, 0xD8, 0xB5, 0x98, 0x48, 0xC7, 0x67,
        0x0C, 0x94, 0xB2, 0x9B, 0x54, 0xD2, 0x37, 0x9E, 0x2E, 0x7A]
	];
	var magicVideoIdx = 0;

	var magicBytesVideo2 = [
		0x49, 0x54, 0x64, 0x00, 0x00, 0x00, 0x58, 0x00, 0x00, 0x00, 0x80, 0x86, 0x38, 0xC3, 0x8D, 0x13, 0x50, 0xFD, 0x67, 0x41, 0xC2, 0xEE, 0x36, 0x89, 0xA0, 0x54, 0xCA, 0xE2, 0x64, 0x30, 0xA3, 0xC1,
        0x5E, 0x40, 0xDE, 0x30, 0xF6, 0xD6, 0x95, 0xE0, 0x30, 0xB7, 0xC2, 0xE5, 0xB7, 0xD6, 0x5D, 0xA8, 0x65, 0x9E, 0xB2, 0xE2, 0xD5, 0xE0, 0xC2, 0xCB, 0x6C, 0x59, 0xCD, 0xCB, 0x66, 0x1E, 0x7E, 0x1E,
        0xB0, 0xCE, 0x8E, 0xE8, 0xDF, 0x32, 0x45, 0x6F, 0xA8, 0x42, 0xEB, 0x20, 0xBE, 0x38, 0x3A, 0xAB, 0x05, 0xA8, 0xC2, 0xA7, 0x1F, 0x2C, 0x90, 0x6D, 0x93, 0xF7, 0x2A, 0x85, 0xE7, 0x35, 0x6E, 0xFF,
        0xE1, 0xB8, 0xF5, 0xAF, 0x09, 0x7F, 0x91, 0x47, 0xF8, 0x7E
	];

	var data = [
		0xCC, 0x7F, 0x7F, 0x0, 0x7F, 0x0, 0x7F, 0x33
	]
	var dummyData = data;
	var dataArray = new Uint8Array(data);
	var videoData = new Uint8Array();
	var gamepads;

	var applyDeadzone = function(number, threshold) {
		threshold = threshold || 0.25;
		percentage = (Math.abs(number) - threshold) / (1 - threshold);

		if(percentage < 0) {
			percentage = 0;
		}

		return percentage * (number > 0 ? 1 : -1);
	}

	var refreshGamepads = function() {
		gamepads = navigator.getGamepads();
		console.log(gamepads);
	}



	//INITIALIZATION OF CHANNELS
	var sendMagicPackets = function() {
		var byteArray = new Uint8Array(magicBytesCtrl);
		chrome.sockets.tcp.send(tcpSocketControl, byteArray.buffer, function(e) {
			if(chrome.runtime.lastError) {}
		});
	}

	var sendMagicPacketsVideo1 = function() {
		var byteArray = new Uint8Array(magicBytesVideo1[magicVideoIdx++]);
		console.log(byteArray);
		chrome.sockets.tcp.send(tcpSocketVideo1, byteArray.buffer, function(e) {
			if(chrome.runtime.lastError) {}
			if(magicVideoIdx < magicBytesVideo1.length) {
				sendMagicPacketsVideo1();
			} else {
				connectTcpVideo2();
			}
		});
	}

	var sendMagicPacketsVideo2 = function() {
		var byteArray = new Uint8Array(magicBytesVideo2);
		console.log(byteArray);
		chrome.sockets.tcp.send(tcpSocketVideo2, byteArray.buffer, function(e) {
			if(chrome.runtime.lastError) {}
		});
	}


	var checksum = function(data) {
		return (data[1] ^ data[2] ^ data[3] ^ data[4] ^ data[5]) & 0xFF;
	}

	var sendGamepadData = function() {
		if(udpBound) {
			if(navigator.getGamepads()[0]) {
				var gamepad = navigator.getGamepads()[0];
				data[1] = Math.floor((applyDeadzone(gamepad.axes[0]) + 1) * 127);
				data[2] = Math.floor((2 - applyDeadzone(gamepad.axes[1]) + 1) * 127);
				data[3] = Math.floor((gamepad.buttons[7].value) * 255);
				data[4] = Math.floor((applyDeadzone(gamepad.axes[2]) + 1) * 127);
				data[6] = checksum(data);
				for(var i=0; i<dataArray.length; ++i) {
					dataArray[i] = data[i];
				}
				console.log(data);
			} else {
				for(var i=0; i<dummyData.length; ++i) {
					dataArray[i] = dummyData[i];
				}
			}
			chrome.sockets.udp.send(udpSocket, dataArray.buffer, droneIp, droneUdpPort, function(e) {
				if(chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
				}
			});
		}
	}

	var connectTcpControl = function() {
		chrome.sockets.tcp.connect(tcpSocketControl, droneIp, droneTcpPort, tcpControlConnected);
	}

	var connectTcpVideo1 = function() {
		chrome.sockets.tcp.connect(tcpSocketVideo1, droneIp, droneTcpPort, sendMagicPacketsVideo1);
	}

	var connectTcpVideo2 = function() {
		chrome.sockets.tcp.connect(tcpSocketVideo2, droneIp, droneTcpPort, sendMagicPacketsVideo2);
	}

	var tcpControlConnected = function(e) {
		console.log(e);
		console.log(chrome.runtime.lastError);
		//Error, retry connection
		if(e<0) {
			connectTcpControl();
		} else {
			sendMagicPackets();
		}
	}

	var video1Connected = function(e) {
		magicVideoIdx = 0;
		console.log(e);
		console.log(chrome.runtime.lastError);
		//Error, retry connection
		if(e<0) {
			connectVideo1();
		} else {
			sendMagicPacketsVideo1();
		}
	}
	
	refreshGamepads();
	window.addEventListener("gamepadconnected", function(e) {
		refreshGamepads();
	});
	window.addEventListener("gamepaddisconnected", function(e) {
		refreshGamepads(); 
	});


	//Create needed sockets
	chrome.sockets.udp.create(function(e) {
		udpSocket = e.socketId;
		chrome.sockets.udp.bind(udpSocket, '0.0.0.0', 0, function(e) {
			console.log(e);
			console.log(chrome.runtime.lastError);
			udpBound = true;
		});
	});

	chrome.sockets.tcp.create(function(e) {
		tcpSocketControl = e.socketId;
		connectTcpControl();
	});

	//Video feed sockets
	chrome.sockets.tcp.create(function(e) {
		tcpSocketVideo1 = e.socketId;
		connectTcpVideo1();
	});

	chrome.sockets.tcp.create({bufferSize: 8192}, function(e) {
		tcpSocketVideo2 = e.socketId;
		chrome.sockets.tcp.onReceive.addListener(function(info) {
			if(info.socketId == tcpSocketVideo2) {
                if (info.data.byteLength !== 106)
                {
                	var arr = new Uint8Array(info.data);
					
					player.decodeRaw(arr);
				}
			}
		});
	});

	//Reconnect
	chrome.sockets.tcp.onReceiveError.addListener(function(err) {
		chrome.sockets.tcp.disconnect(tcpSocketControl, connectTcpControl);
	});

	setInterval(sendGamepadData, 50);
}