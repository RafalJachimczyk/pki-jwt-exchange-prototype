const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const https = require('https');
const jsonwebtoken = require('jsonwebtoken');
const jose = require('node-jose');


const serviceRepository = require('./repository/serviceRepository');

const key = fs.readFileSync('./pki/server.key');
const cert = fs.readFileSync('./pki/server.crt');
const ca = fs.readFileSync('./pki/CA/ca_certs.pem');

var keystore = jose.JWK.createKeyStore();
keystore.add(cert, 'pem').
  then((result) => {
    console.log('Added cert!');
  })

var options = {
  key,
  cert,
  ca,
  requestCert: true,
  rejectUnauthorized: true
}

var app = express();

app.use(bodyParser.json());

app.use('/token', function (req, res, next) {

  var clientCert = req.connection.getPeerCertificate();

  if (serviceRepository.getServiceByCn(clientCert.subject.CN)) {
    next();
  } else {
    var err = new Error('Service not allowed');
    next(err);
  }
})

app.get('/token', (req, res) => {
  console.log('--- GET /token');

  var clientCert = req.connection.getPeerCertificate();
  var service = serviceRepository.getServiceByCn(clientCert.subject.CN);

  var payload = {
    "sub": service.uuid,
    "cn": service.cn
  }

  var jwt = jsonwebtoken.sign(payload, key, { algorithm: 'RS256'});

  console.log('verify result: ' + JSON.stringify(jsonwebtoken.verify(jwt, cert)));
  
  res.send(jwt);

});

app.get('/certs', (req, res) => {
  console.log('--- GET /certs');

  res.send(keystore.toJSON());

})

https.createServer(options, app).listen(7443, () => {
  	console.log(`Started JWT service on port 7443`);
})
