'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser-rawbody');
const morgan = require('morgan');
const util = require('util');

const serverA = express();
serverA.port = 8008;
serverA.host = '0.0.0.0';

serverA.use((req, res, next) => {
	next();
})

serverA.get('/', (req, res) => {
	res.send(`hello there
    <!-- <img src="http://anothertest:8888/icq.png" /> -->
    <iframe src="http://anothertest:8888/iframe">
    </iframe>
    <script>
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://anothertest:8888/iframe', true);
    xhr.setRequestHeader('ETag', 'http://anothertest:8888/iframe')

    xhr.onload = function() {
      console.log(xhr );
      console.log(xhr.getResponseHeader('content-type'));
      console.log(xhr.getResponseHeader('X-Powered-By'));
      console.log(xhr.getResponseHeader('ETag'));
      console.log(xhr.getResponseHeader('etag'));
      console.log(xhr.getResponseHeader('access-control-expose-headers'));
    }

    xhr.send();
    </script>`);
})

serverA.listen(serverA.port, serverA.host, () => {
	console.log(`started serverA on ${serverA.host}:\
${serverA.port}`);
})

const serverB = express();
serverB.port = 8888;
serverB.host = '0.0.0.0'



serverB.use(cookieParser());

let userCounter = 0;
serverB.use((req, res, next) => {
  let userId = req.cookies.buserid;
//  if(!userId) {
//    userCounter++;
//    res.cookie('buserid', userCounter, { maxAge: 3600 * 10 * 1000, httpOnly: true });
//    console.log('new user');
//  } else {
//    console.log(`hey i know you!Hi user #${userId}`);
//  }

  console.log(`HEADERS: ${util.inspect(req.headers)}`);
  next();
})

serverB.use(express.static('img'));

serverB.get('/getcookie', (req, res) => {
	res.cookie('serverB', Math.floor(Math.random()*10000));
	res.send('here is your cookie?');
})

serverB.get('/checkoutcookie', (req, res) => {
	console.log(req.cookies['serverB']);
	res.send('do you was here before?');
})

serverB.options('/iframe', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://test:8008');
  res.setHeader('Access-Control-Expose-Headers', 'ETag, content-type, X-Powered-By');
  res.setHeader('Access-Control-Allow-Headers', 'ETag, content-type, X-Powered-By');
 res.send('');
})

serverB.get('/iframe', (req, res) => {
  const userId = req.cookies.buserid;
  const ETagUserId = req.headers['if-none-match'];

  res.setHeader('Access-Control-Allow-Origin', 'http://test:8008');
  res.setHeader('Access-Control-Expose-Headers', 'ETag, content-type, Access-Control-Expose-Headers, X-Powered-By');
 // res.setHeader('Access-Control-Allow-Headers', 'ETag, content-type, Access-Control-Expose-Headers, X-Powered-By');


  if (!ETagUserId) {
    res.setHeader('ETag', ++userCounter);
    console.log('not found, assigned');
    res.send(`you are user #${userCounter}`);
  } else {
    res.setHeader('ETag', ETagUserId);
    console.log('old friend');
    res.send(`you are user #${ETagUserId}`);
  }

  console.log('iframe asked');
});

serverB.listen(serverB.port, serverB.host, () => {
	console.log(`started serverB on ${serverB.host}:\
${serverB.port}`);
})
