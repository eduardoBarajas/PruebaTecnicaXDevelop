const Response = require('../utils/response-util');
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const ImageUtils = require('../utils/image-utils');
const User = require('../models/user');

const validateEmailRegex = /^\S+@\S+\.\S+$/;

const UsersService = {
    update: async (body) => {
        const response = new Response();
        let image_result = null;
        let update_obj = {};
        let id_user = null;
        if (Object.keys(body).length === 1 && body['id']) {
            response.setResponse(204, 'error', `No se enviaron datos que actualizar`);
            return response.getResponse();
        }
        ['nombre', 'apellido', 'pass', 'email'].forEach(field => {
            if (body[field]) {
                update_obj[field] = body[field];
            }
        });
        if (body.id) {
            const user = await User.findOne({
                where: {
                    id: body.id
                }
            });
            if (user) {
                id_user = body.id;
                if (body.email) {
                    if (validateEmailRegex.test(body.email)) {
                        // si llega aqui el email significa que ha sido actualizado en el form, por lo que debe de cam
                        if (body.form_user_profile_img) {
                            // si llega la imagen significa que el usuario actualizo la imagen en el form
                            image_result = await ImageUtils.saveImage(body.form_user_profile_img, body.form_user_profile_img_name, body.form_user_profile_img_extension);
                            if (image_result.err) {
                                response.setResponse(500, 'error', `${image_result.err.toString()}`);
                            }
                        } else {
                            // si se actualizo el email pero no la imagen entonces tenemos que renombrar la imagen que ya se tiene para no perder la referencia.
                            image_result = await ImageUtils.renameImage(user.dataValues.img_perfil, `${body.email.replaceAll('.', '_')}.${user.dataValues.img_perfil.split('.')[1]}`);
                            if (image_result.err) {
                                response.setResponse(500, 'error', `${image_result.err.toString()}`);
                            }
                        }
                    } else {
                        response.setResponse(400, 'error', `El email fue proporcionado pero es invalido.`);
                    }
                } else {
                    if (body.form_user_profile_img) {
                        // si llega la imagen significa que el usuario actualizo la imagen en el form pero no el email
                        image_result = await ImageUtils.saveImage(body.form_user_profile_img, body.form_user_profile_img_name, body.form_user_profile_img_extension);
                        if (image_result.err) {
                            response.setResponse(500, 'error', `${image_result.err.toString()}`);
                        }
                    }
                }
            } else {
                response.setResponse(204, 'error', `El usuario con ese ID no existe`);
            }
        } else {
            response.setResponse(400, 'error', `El ID el usuario no fue proporcionado.`);
        }

        if (response.code === 0) {
            // si no hay errores procedemos a actualizar el registro
            try {
                if (image_result) {
                    update_obj['img_perfil'] = image_result.img_name;
                }
                await User.update(update_obj, {
                    where: {
                        id: id_user
                    }
                });
                const user = await User.findOne({
                    where: {
                        id: id_user
                    }
                });
                response.setResponse(200, 'success', `Se actualizo el usuario con exito.`, user);
            } catch (err) {
                console.log(err);
                response.setResponse(500, 'error', `${err.toString()}`);
            }
        } 
        return response.getResponse();
    },
    save: async (body) => {
        const response = new Response();
        const body_fields = ['nombre', 'apellido', 'pass', 'email', 'form_user_profile_img', 'form_user_profile_img_name', 'form_user_profile_img_extension'];
        // validamos el form
        let invalid_form_fields = [];
        body_fields.forEach(field => {
            switch (field) {
                case 'email': {
                    if (!validateEmailRegex.test(body[field])) {
                        invalid_form_fields.push(field);
                    }
                    break;
                }
                default: {
                    if (!body[field] || body[field].length === 0) {
                        invalid_form_fields.push(field);
                    }
                }
            }
        });
        if (invalid_form_fields.length > 0) {
            response.setResponse(400, 'error', `Los campos [${invalid_form_fields.join(', ')}] del formulario, son invalidos.`);
        } else {
            const result = await ImageUtils.saveImage(body.form_user_profile_img, body.form_user_profile_img_name, body.form_user_profile_img_extension);
            if (result.err) {
                response.setResponse(500, 'error', `${result.err.toString()}`);
            } else {
                try {
                    const hash_result = await bcrypt.hash(body.pass, saltRounds);
                    const user = User.build({
                        nombre: body.nombre,
                        apellido: body.apellido,
                        email: body.email,
                        img_perfil: result.img_name,
                        pass: hash_result
                    });
                    try {
                        const saved_user = await user.save();
                        response.setResponse(200, 'success', `Se registro el usuario con exito`, saved_user);
                    } catch (err_save) {
                        response.setResponse(500, 'error', `${err_save.toString()}`);
                    }
                } catch (err_hash) {
                    response.setResponse(500, 'error', `${err_hash.toString()}`);
                }
            }
        }
        return response.getResponse();
    },
    findUserByEmail: async (email) => {
        let response = new Response();
        if (!validateEmailRegex.test(email)) {
            response.setResponse(400, 'warning', 'El email no es valido.');
        } else {
            try {
                const user = await User.findOne({
                    where: {
                        email: {
                            [Op.iLike]: `${email}`
                        }
                    }
                });
                if (user) {
                    response.setResponse(200, 'success', 'Se encontro el usuario con ese email.', user);
                } else {
                    response.setResponse(204, 'warning', 'No se encontro un usuario con ese email.');
                }
            } catch (err) {
                console.log(err);
                response.setResponse(500, 'error', `${err.toString()}`);
            }
        }
        return response.getResponse();
    },
    findUserById: async (id) => {
        let response = new Response();
        try {
            const user = await User.findOne({
                where: {
                    id: id
                }
            });
            if (user) {
                response.setResponse(200, 'success', 'Se encontro el usuario con ese id.', user);
            } else {
                response.setResponse(204, 'warning', 'No se encontro un usuario con ese id.');
            }
        } catch (err) {
            console.log(err);
            response.setResponse(500, 'error', `${err.toString()}`);
        }
        return response.getResponse();
    },
    deleteOneById: async (id) => {
        let response = new Response();
        if (!id || isNaN(id) || id <= 0) {
            response.setResponse(400, 'error', 'No se envio el id del usuario a eliminar.');
            return response.getResponse();
        }
        try {
            const user = await User.findOne({
                where: {
                    id: id
                }
            });
            if (user) {
                // eliminamos la imagen de perfil
                await ImageUtils.removeOldImage(user.get('img_perfil'));
                await User.destroy({
                    where: {
                        id: id
                    }
                });
                response.setResponse(200, 'success', 'Se elimino el usuario con ese id.', id);
            } else {
                response.setResponse(204, 'error', 'No se encontro un usuario con ese id.');
            }
        } catch (err) {
            console.log(err);
            response.setResponse(500, 'error', `${err.toString()}`);
        }
        return response.getResponse();
    },
    findAll: async () => {
        let response = new Response();
        try {
            const users = await User.findAll();
            response.setResponse(200, 'success', 'Se encontraron los usuarios registrados.', users);
        } catch (err) {
            console.log(err);
            response.setResponse(500, 'error', `${err.toString()}`);
        }
        return response.getResponse();
    },
    getImageAsBase64: async (name) => {
        let response = new Response();
        const result = await ImageUtils.getImageAsBase64(name);
        if (result.err) {
            response.setResponse(500, 'error', `${result.err.toString()}`);
        } else {
            response.setResponse(200, 'success', 'Se encontro la imagen.', result.image);
        }
        return response.getResponse();
    }
}

module.exports = UsersService;