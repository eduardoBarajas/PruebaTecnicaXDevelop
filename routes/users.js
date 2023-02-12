var express = require('express');
var router = express.Router();
const UsersService = require('../services/users');

router.post('/create', function (req, res, next) {
  (async () => {
    res.send(await UsersService.save(req.body));
  })();
});

router.post('/verify-if-user-exist-by-email', function (req, res, next) {
  (async () => {
    const response = await UsersService.findUserByEmail(req.body.email);
    delete response.data;
    res.send(response);
  })();
});

module.exports = router;
