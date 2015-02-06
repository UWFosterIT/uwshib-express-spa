/* eslint-disable key-spacing */
var fs   = require('fs');
var path = require('path');

// infer http localhost with all env vars if not specified
// DOMAIN must match url used in nginx conf and have valid DNS entry with UW
// PORT must match what is indicated in nginx conf while in production
// CERT is full path to the certficate file
// KEY  is full path to the key file used with the cert
// SECRET is the full path to the secret file used for sessions
var config = {
  domain:      process.env.DOMAIN || 'localhost',
  port:        process.env.PORT   || 3000,
  certFile:    process.env.CERT   || "",
  keyFile:     process.env.KEY    || "",
  secretFile:  process.env.SECRET || path.join(__dirname, "/session_secret"),
  cert:        "",
  key:         "",
  loginURL:    '/login',
  callBackURL: '/login/callback',
  testUser: {
    principalName : "foster_tester@washington.edu",
    affiliation : ["member", "staff", "employee"],
    netId : "foster_tester",
    WARNING: "THIS IS NOT A VALID SHIBBOLETH USER OR NETID"
  }
};

if (config.domain !== 'localhost') {
  config.cert = fs.readFileSync(config.certFile, 'utf-8');
  config.key  = fs.readFileSync(config.keyFile, 'utf-8');
}

module.exports = config;
