'use strict';

var express = require('express');

module.exports = function(shibboleth) {

  /*eslint-disable new-cap */
  var router   = express.Router();
  /*eslint enable*/

  var siteName = 'UW Shibboleth SPA Multiserver with Nginx proxy';

  router.get('/open.json', function(req, res) {
    var msg = {
      siteName: siteName,
      message: 'Success...this is NOT protected by shibboleth',
      note: 'However, due to sessions etc you may have a user context'
    };
    res.status(200).json(msg);
  });

  router.get('/secure.json', shibboleth.authorize(), function(req, res) {
    //
    // shibboleth.authorize()
    //   ensures that the uwshib node module forces the user to login first
    //   don't use it on routes that you want unprotected
    //
    // shibboleth.currentUser(req)
    //   is a test user when url is localhost
    //   is the actual UW Web Login authenticated user when logged in
    //   is null in production or test when not logged in
    //
    var obj = {
      siteName: siteName,
      message: 'First redirects to UW Web Login on test or dev, then back here',
      user: req.user != null ? "UW User exists" : "No UW user for this request",
      userObj: shibboleth.currentUser(req)
    };
    res.status(200).json(obj);
  });

  return router;
};
