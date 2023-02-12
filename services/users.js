const Response = require('../utils/response-util');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const saveImage = require('../utils/image-utils');
const User = require('../models/user');

const validateEmailRegex = /^\S+@\S+\.\S+$/;

const UsersService = {
    save: async (body) => {
        const response = new Response();
        const body_fields = ['nombre', 'apellidos', 'pass', 'email', 'form_user_profile_img', 'form_user_profile_img_name', 'form_user_profile_img_extension'];
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
            const result = await saveImage(body.form_user_profile_img, body.form_user_profile_img_name, body.form_user_profile_img_extension);
            if (result.err) {
                response.setResponse(500, 'error', `${err.toString()}`);
            } else {
                try {
                    const hash_result = await bcrypt.hash(body.pass, saltRounds);
                    const user = User.build({
                        nombre: body.nombre,
                        apellido: body.apellidos,
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
            const user = await User.findOne({
                where: {
                    email: email
                }
            });
            if (user) {
                response.setResponse(200, 'success', 'Se encontro el usuario con ese email.', user);
            } else {
                response.setResponse(204, 'warning', 'No se encontro un usuario con ese email.');
            }
        }
        return response.getResponse();
    }
}

module.exports = UsersService;