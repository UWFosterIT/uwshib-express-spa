/* eslint-disable key-spacing */
'use strict';

const fs           = require('fs');
const path         = require('path');
const express      = require('express');
const favicon      = require('serve-favicon');
const morgan       = require('morgan');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const session      = require('cookie-session');
const shibboleth   = require('./helpers/shibboleth');
const config       = require('./config');

// Setup Express
const app = express();

app.use(morgan(process.env.LOGFORMAT || 'dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(cookieParser());
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// refer to https://github.com/expressjs/cookie-session
// the cookie will be secure in production and permitted to be sent there
app.use(session({
    secret: fs.readFileSync(config.secretFile, 'utf-8'),
    secure: false,
    secureProxy: true
}));

shibboleth.initialize(app);
const routes = require('./routes/index')(shibboleth);
app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler, no stacktraces leaked to user outside of dev environment
app.use((err, req, res) => {
  let stack = app.get('env') === 'development' ? err.stack : {};
  let msg   = { message: err.message, error: stack };

  res.status(err.status || 500).json(msg);
});

module.exports = app;
