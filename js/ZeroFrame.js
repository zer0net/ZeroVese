/*jshint esversion: 6 */
/*jslint browser: true */
class ZeroFrame {
	constructor(url) {
    console.log('New ZeroFrame');
		//this.onMessage = this.onMessage.bind(this);
		//this.route = this.route.bind(this);
		//this.onOpenWebsocket = this.onOpenWebsocket.bind(this);
		//this.onCloseWebsocket = this.onCloseWebsocket.bind(this);
		this.url = url;
		this.waitingCB = {};
		this.connect();
		this.nextMessageID = 1;
	}

	connect() {
		this.target = window.parent;
		window.addEventListener('message', this.onMessage, false);
		return this.cmd('innerReady');
	}


	onMessage(e) {
		var message = e.data;
		var cmd = message.cmd;
		if (cmd === 'response') {
			if ((this.waitingCB[message.to] !== null)) {
				return this.waitingCB[message.to](message.result);
			} else {
				return this.log('Websocket callback not found:', message);
			}
		} else if (cmd === 'wrapperReady') { // Wrapper inited later
			return this.cmd('innerReady');
		} else if (cmd === 'ping') {
			return this.response(message.id, 'pong');
		} else if (cmd === 'wrapperOpenedWebsocket') {
			return this.onOpenWebsocket();
		} else if (cmd === 'wrapperClosedWebsocket') {
			return this.onCloseWebsocket();
		} else {
			return this.route(cmd, message);
		}
	}


	route(cmd, message) {
		return this.log('Unknown command', message);
	}


	response(to, result) {
		return this.send({'cmd': 'response', 'to': to, 'result': result});
	}


	cmd(cmd, params = {}, cb = null) {
		return this.send({'cmd': cmd, 'params': params}, cb);
	}


	send(message, cb = null) {
		message.id = this.nextMessageID;
		this.nextMessageID += 1;
		this.target.postMessage(message, '*');
		if (cb) {
			this.waitingCB[message.id] = cb;
		}
	}


	log(...args) {
		return console.log('[ZeroFrame]', ...args);
	}


	onOpenWebsocket() {
		return this.log('Websocket open');
	}


	onCloseWebsocket() {
		return this.log('Websocket close');
	}
}

export default ZeroFrame;