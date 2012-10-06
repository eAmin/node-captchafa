#Node-CAPTCHAfa

 node-captchafa v1.0.1

 CAPTCHAfa API in NodeJS

##Installation

	$ npm install captchafa

##Usage
 Very basic example
 
```js
var http = require('http');
var captchafa = require('captchafa');
var querystring = require('querystring');

http.createServer(function(req, res) {
	var cf = new captchafa({
		publicKey: 'your public key',
		privateKey: 'your private key',
		ip: req.connection.remoteAddress
	});

	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	if (req.method == 'POST') {
		var body = '';
		req.on('data', function(d) {
			body += d;
		});

		req.on('end', function() {
			var post = querystring.parse(body);
			cf.on('data', function(cfaRes) {
				if (cfaRes.is_valid == true) {
					res.write('درست است');
				} else {
					res.write('Error : ' + cfaRes.error);
				}
				res.end();
			});

			cf.verify(post.captchafa_challenge_field, post.captchafa_response_field);
		});
	} else {
		res.write('<form action="" method="post" accept-charset="UTF-8">');
		res.write(cf.getHTML());
		res.write('<input type="submit" value="Send" /></form>');
		res.end();
	}
}).listen(8080);
```

##Author

 Amin Akbari

 Copyright (c) 2012 Amin AKbari

 http://eamin.me/

##License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.