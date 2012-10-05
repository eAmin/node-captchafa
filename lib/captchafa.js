var http = require('http');
var util = require('util');
var querystring = require('querystring');
var EventEmitter = require('events').EventEmitter;

var API_SERVER = 'http://www.captchafa.com/api';
var VERIFY_SERVER = 'www.captchafa.com';
var VERIFY_PATH = '/api/verify/';

var keyError = 'To use CAPTCHAfa you must get an API key from http://www.captchafa.com/getkey/';
var ipError = 'For security reasons, you must pass the remote ip to CAPTCHAfa';

Object.has = function(object, value) {
	return {}.hasOwnProperty.call(object, value);
}

var CAPTCHAfa = function(opt) {
	EventEmitter.call(this);

	if (!opt) {
		throw new Error('To use CAPTCHAfa you must set configuration data');
	}

	if (!Object.has(opt, 'publicKey') || !Object.has(opt, 'privateKey')) {
		throw new Error(keyError);
	}

	if (!Object.has(opt, 'ip')) {
		throw new Error(ipError);
	}

	this.publicKey = opt['publicKey'] + '';
	this.privateKey = opt['privateKey'] + '';
	this.remoteip = opt['ip'] + '';

	this.response = {
		'is_valid': false,
		'error': 'incorrect-captcha-sol'
	};
};

util.inherits(CAPTCHAfa, EventEmitter);

CAPTCHAfa.prototype.getHTML = function(error) {
	return util.format(
		'<script type="text/javascript" src="%s/?challenge&k=%s%s"></script>',
		API_SERVER,
		this.publicKey,
		(!!error) ? '&amp;error=' + error : ''
	);
};

CAPTCHAfa.prototype.verify = function(challenge, response) {

	if (!challenge || !response) {
		this.emit('data', this.response);
		return;
	}
	
	var postData = querystring.stringify({
		'privatekey': this.privateKey,
		'remoteip': this.remoteip,
		'challenge': challenge,
		'response': response
	});
	
	this.request(postData);
};

CAPTCHAfa.prototype.request = function(data) {
	var self = this;
	var options = {
		method: 'POST',
		host: VERIFY_SERVER,
		port: 80,
		path: VERIFY_PATH,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(data),
			'User-Agent': 'CAPTCHAfa/Node.JS ' + process.version
		}
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			var splitLines = chunk.split('\n');
			if (splitLines.length >= 2) {
				if (splitLines[0] == 'true') {
					self.response.is_valid = true;
				}

				self.response.error = splitLines[1];
			}

			self.emit('data', self.response);
		});
	});

	req.on('error', function(err) {
		console.log('request error: ' + err.message);
		self.emit('error', self.response.error);
	});

	req.write(data);
	req.end();
}

module.exports = CAPTCHAfa;
