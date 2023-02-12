var express = require('express');
const UsersService = require('../services/users');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/lista-usuarios', function async(req, res, next) {
  (async () => {
    const users_result = await UsersService.findAll();
    res.render('lista-usuarios', {
      users: (users_result.status === 'success') ? await Promise.all(users_result.data.map(async (user) => {
        const image_result = await UsersService.getImageAsBase64(user.img_perfil);
        user.profile_image = image_result.data;
        return await user;
      })) : []
    });
  })();
});

router.get('/detalles-usuario', function (req, res, next) {
  (async () => {
    const email = req.query.email;
    const user_result = await UsersService.findUserByEmail(email);
    if (user_result.status === 'success') {
      const image_result = await UsersService.getImageAsBase64(user_result.data.img_perfil);
      user_result.data.profile_image = image_result.data;
    }
    res.render('detalles-usuario', {
      user: (user_result) ? user_result.data : null
    });
  })();
});

module.exports = router;
