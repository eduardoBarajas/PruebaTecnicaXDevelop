var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/lista-usuarios', function (req, res, next) {
  res.render('lista-usuarios', { users: [] });
});

router.get('/detalles-usuario', function (req, res, next) {
  res.render('detalles-usuario', { title: 'Express' });
});

module.exports = router;
