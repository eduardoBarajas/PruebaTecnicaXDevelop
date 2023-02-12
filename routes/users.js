var express = require('express');
var router = express.Router();
const UsersService = require('../services/users');

router.post('/create', function (req, res, next) {
  (async () => {
    const response = await UsersService.save(req.body);
    if (response.status === 'success') {
      const image_result = await UsersService.getImageAsBase64(response.data.img_perfil);
      if (image_result.status === 'success') {
        response.data = { ...response.data.dataValues, profile_image: image_result.data };
      }
    }
    res.send(response);
  })();
});

router.put('/update', function (req, res, next) {
  (async () => {
    const response = await UsersService.update(req.body);
    if (response.status === 'success') {
      const image_result = await UsersService.getImageAsBase64(response.data.img_perfil);
      if (image_result.status === 'success') {
        response.data = { ...response.data.dataValues, profile_image: image_result.data };
      }
    }
    res.send(response);
  })();
});

router.get('/get-by-id/:id/:complete', function (req, res, next) {
  (async () => {
    const response = await UsersService.findUserById(req.params.id);
    if (response.status === 'success') {
      if (req.params.complete === 'true') {
        const image_result = await UsersService.getImageAsBase64(response.data.img_perfil);
        if (image_result.status === 'success') {
          response.data = { ...response.data.dataValues, profile_image: image_result.data };
        }
      }
    }
    res.send(response);
  })();
});

router.get('/get-all/:complete', function (req, res, next) {
  (async () => {
    const response = await UsersService.findAll();
    if (response.status === 'success') {
      if (req.params.complete === 'true') {
        response.data = await Promise.all(response.data.map(async (user) => {
          const image_result = await UsersService.getImageAsBase64(user.dataValues.img_perfil);
          if(image_result.status === 'success') {
            user = { ...user.dataValues, profile_image: image_result.data };
          }
          return await user;
        }));
      }
    }
    res.send(response);
  })();
});

router.delete('/delete/:id', function (req, res, next) {
  (async () => {
    const response = await UsersService.deleteOneById(req.params.id);
    res.send(response);
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
