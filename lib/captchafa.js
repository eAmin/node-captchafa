var http = require('http');
var util = require('util');
var querystring = require('querystring');
var EventEmitter = require('events').EventEmitter;

var API_SERVER = 'http://www.captchafa.com/api';
var VERIFY_SERVER = 'www.captchafa.com';
var VERIFY_PATH = '/api/verify/';

var CAPTCHAfa = function() {
  EventEmitter.call(this);
  this.response = {
    'is_valid': false,
    'error': 'incorrect-captcha-sol'
  };
};

util.inherits(CAPTCHAfa, EventEmitter);

CAPTCHAfa.prototype.getHTML = function(pubkey, error) {
	if (!pubkey) {
		throw new Error('To use CAPTCHAfa you must get an API key from http://www.captchafa.com/getkey/');
	}

	return util.format(
    '<script type="text/javascript" src="%s/?challenge&k=%s%s"></script>',
    API_SERVER,
    pubkey,
    (!!error) ? '&amp;error=' + error : ''
  );
};

CAPTCHAfa.prototype.check = function(privatekey, remoteip, challenge, response) {
	if (!privatekey) {
		throw new Error('To use CAPTCHAfa you must get an API key from http://www.captchafa.com/getkey/');
	}

	if (!remoteip) {
		throw new Error('For security reasons, you must pass the remote ip to CAPTCHAfa');
	}

	if (!challenge || !response) {
		this.emit('data', this.response);
		return;
	}
	
	var postData = querystring.stringify({
		'privatekey': privatekey,
		'remoteip': remoteip,
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

module.exports.captchafa = CAPTCHAfa;
