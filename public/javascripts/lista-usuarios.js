window.addEventListener('load', function () {
    const label_input_form_email = document.getElementById('form-user-email-valid-label');
    const form_user_email = document.getElementById('form-user-email');
    const form_user_profile_image = document.getElementById('form-user-profile-img');
    form_user_profile_image.onchange = (ev) => {
        if (ev.target.files.length > 0) {
            const reader = new FileReader();
            reader.onloadend = function async() {
                document.getElementById('img-preview-user-form').setAttribute('src', reader.result);
            }
            reader.readAsDataURL(form_user_profile_image.files[0]);
        }
    }
    form_user_email.onkeyup = async (ev) => {
        if (VALIDATE_EMAIL_REGEX.test(ev.target.value)) {
            const result = await fetch('/users/verify-if-user-exist-by-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: ev.target.value
                })
            }).then(r => r.json());
            if (result.code === 204) { // solo si es no content es valido por que no existe el registro de otro usuario con el correo
                label_input_form_email.innerHTML = '<i class="bi bi-check-circle-fill valid-email"></i>Email Valido';
            } else {
                if ((!ev.target.getAttribute('data-original-email')) || (ev.target.getAttribute('data-original-email') && ev.target.getAttribute('data-original-email').toUpperCase() !== ev.target.value.toUpperCase())) {
                    label_input_form_email.innerHTML = '<i class="bi bi-x-octagon-fill invalid-email"></i>Email ya se encuentra en uso';
                } else {
                    label_input_form_email.innerHTML = '<i class="bi bi-check-circle-fill valid-email"></i>Email Valido';   
                }
            }
        } else {
            label_input_form_email.innerHTML = '<i class="bi bi-x-octagon-fill invalid-email"></i>Email Invalido';
        }
    }
    // Conf Modales start

    const modal_form_user = new bootstrap.Modal(document.getElementById('modal-form-user'), {
        keyboard: false,
    });

    const modal_confirm = new bootstrap.Modal(document.getElementById('modal-confirm'), {
        keyboard: false,
    });

    const btn_add_user = document.getElementById('btn-add-user');
    btn_add_user.onclick = (ev) => {
        btn_save_modal_form_user.style.display = 'block';
        clearUserForm();
        modal_form_user_title.innerText = 'Nuevo usuario';
        btn_save_modal_form_user.setAttribute('data-action', 'CREATE');
        fillUserForm(null, true);
        modal_form_user.toggle();
    }

    const btn_confirm_modal = document.getElementById('btn-confirm-modal');
    const btn_cancel_modal = document.getElementById('btn-cancel-modal');
    const confirm_modal_title = document.getElementById('modal-confirm-title');
    const confirm_modal_body = document.getElementById('modal-confirm-body');

    btn_cancel_modal.onclick = (ev) => {
        modal_confirm.toggle();
        if (['CREATE', 'UPDATE'].includes(btn_confirm_modal.getAttribute('data-action'))) {
            modal_form_user.toggle();
        }
    }

    btn_confirm_modal.onclick = (ev) => {
        const action = ev.target.getAttribute('data-action');
        const form_data = {
            id: ev.target.getAttribute('data-id-usuario'),
            nombre: document.getElementById('form-user-name').value,
            apellido: document.getElementById('form-user-lastname').value,
            pass: document.getElementById('form-user-pass').value,
            email: form_user_email.value,
            form_user_profile_img: null,
            form_user_profile_img_name: form_user_email.value.replaceAll('.', '_'),
            form_user_profile_img_extension: (form_user_profile_image.files.length > 0) ? form_user_profile_image.files[0].name.split('.')[1] : null,
        }
        switch (action) {
            case 'UPDATE': {
                const invalid_form_fields = [];
                const form_fields = ['nombre', 'apellido', 'pass', 'email'];
                form_fields.forEach(field => {
                    switch (field) {
                        case 'email': {
                            if (!VALIDATE_EMAIL_REGEX.test(form_data[field]) || document.getElementsByClassName('invalid-email').length > 0) {
                                invalid_form_fields.push(field);
                            }
                            break;
                        }
                        default: {
                            if (!form_data[field] || form_data[field].length === 0) {
                                invalid_form_fields.push(field);
                            }
                        }
                    }
                });
                if (invalid_form_fields.length > 0) {
                    Toast('warning', 'Formulario invalido', `Los campos [${invalid_form_fields.join(', ')}] son invalidos, por favor introducelos correctamente.`);
                    modal_confirm.toggle();
                    modal_form_user.toggle();
                    return;
                }
                const execute_edit = (form, image_base_64) => {
                    if (form.email === form_user_email.getAttribute('data-original-email')) {
                        delete form.email;
                    }
                    if (form.nombre === document.getElementById('form-user-name').getAttribute('data-original-name')) {
                        delete form.nombre;
                    }
                    if (form.apellido === document.getElementById('form-user-lastname').getAttribute('data-original-lastname')) {
                        delete form.apellido;
                    }
                    if (form.pass === document.getElementById('form-user-pass').getAttribute('data-original-pass')) {
                        delete form.pass;
                    }
                    if (!image_base_64) {
                        delete form.form_user_profile_img;
                        delete form.form_user_profile_img_name;
                        delete form.form_user_profile_img_extension;
                    } else {
                        form.form_user_profile_img = image_base_64;
                    }
                    fetch('/users/update', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(form)
                    })
                    .then(response => response.json())
                    .then(res => {
                        Toast(res.status, 'Actualizacion de usuario', `[${res.code}] - ${res.message}`);
                        if (res.status === 'success') {
                            modal_confirm.toggle();
                            clearUserForm();
                            updateEntries(res.data, action);
                            initActionsButtonsListeners(modal_form_user, modal_confirm);
                        } else {
                            modal_confirm.toggle();
                            modal_form_user.toggle();
                        }
                    })
                        .catch(err => {
                            console.log(err);
                        Toast('error', 'Ocurrio un problema con el servidor', err.toString());
                    });
                }
                if (form_user_profile_image.files.length > 0) {
                    const reader = new FileReader();
                    reader.onloadend = function async() {
                        execute_edit({ ...form_data }, reader.result);
                    }
                    reader.readAsDataURL(form_user_profile_image.files[0]);
                } else {
                    execute_edit({ ...form_data }, undefined);
                }
                break;
            }
            case 'CREATE': {
                const invalid_form_fields = [];
                const form_fields = ['nombre', 'apellido', 'pass', 'email'];
                form_fields.forEach(field => {
                    switch (field) {
                        case 'email': {
                            if (!VALIDATE_EMAIL_REGEX.test(form_data[field]) || document.getElementsByClassName('invalid-email').length > 0) {
                                invalid_form_fields.push(field);
                            }
                            break;
                        }
                        default: {
                            if (!form_data[field] || form_data[field].length === 0) {
                                invalid_form_fields.push(field);
                            }
                        }
                    }
                });
                if (invalid_form_fields.length > 0) {
                    Toast('warning', 'Formulario invalido', `Los campos [${invalid_form_fields.join(', ')}] son invalidos, por favor introducelos correctamente.`);
                    modal_confirm.toggle();
                    modal_form_user.toggle();
                    return;
                }
                const execute_create = (form, image_base_64) => {
                    fetch('/users/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ ...form, form_user_profile_img: image_base_64})
                    })
                        .then(response => response.json())
                        .then(res => {
                            Toast(res.status, 'Creacion de usuario', `[${res.code}] - ${res.message}`);
                            if (res.status === 'success') {
                                if (document.getElementById('no-table-data-div').style.display === 'flex') {
                                    // si antes estaba mostrandose el mensaje de no hay datos mostramos la tabla
                                    document.getElementById('no-table-data-div').style.display = 'none';
                                    document.getElementById('no-list-data-div').style.display = 'none';
                                    document.getElementById('list-content').style.display = 'block';
                                    document.getElementById('table-content').style.display = 'block';
                                }
                                modal_confirm.toggle();
                                clearUserForm();
                                updateEntries(res.data, action);
                                initActionsButtonsListeners(modal_form_user, modal_confirm);
                            } else {
                                modal_confirm.toggle();
                                modal_form_user.toggle();
                            }
                        })
                        .catch(err => {
                            Toast('error', 'Ocurrio un problema con el servidor', err.toString());
                        });
                }
                if (form_user_profile_image.files.length > 0) {
                    const reader = new FileReader();
                    reader.onloadend = function async() {
                        execute_create({ ...form_data }, reader.result);
                    }
                    reader.readAsDataURL(form_user_profile_image.files[0]);
                } else {
                    execute_create({ ...form_data }, null);
                }
                break;
            }
            case 'DELETE': {
                fetch(`/users/delete/${form_data.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(res => {
                        Toast(res.status, 'Eliminacion de usuario', `[${res.code}] - ${res.message}`);
                        if (res.status === 'success') {
                            modal_confirm.toggle();
                            document.getElementById('row-user-id-' + form_data.id).remove();
                            document.getElementById('list-row-user-id-' + form_data.id).remove();
                            if (document.getElementById('table-body').children.length === 0) {
                                document.getElementById('no-table-data-div').style.display = 'flex';
                                document.getElementById('no-list-data-div').style.display = 'flex';
                                document.getElementById('list-content').style.display = 'none';
                                document.getElementById('table-content').style.display = 'none';
                            }
                        }
                    })
                    .catch(err => {
                        Toast('error', 'Ocurrio un problema con el servidor', err.toString());
                    });
                break;
            }
        }
    }

    const modal_form_user_title = document.getElementById('modal-form-user-title');
    const btn_save_modal_form_user = document.getElementById('btn-save-modal-form-user');

    btn_save_modal_form_user.onclick = (ev) => {
        btn_confirm_modal.setAttribute('data-action', ev.target.getAttribute('data-action'));
        btn_confirm_modal.setAttribute('data-id-usuario', ev.target.getAttribute('data-id-usuario'));
        switch (ev.target.getAttribute('data-action')) {
            case 'CREATE': {
                confirm_modal_title.innerText = 'Confirmar creacion de usuario';
                confirm_modal_body.innerText = `Seguro que deseas crear el usuario?`;
                break;
            }
            case 'UPDATE': {
                confirm_modal_title.innerText = 'Confirmar actualizacion de usuario';
                confirm_modal_body.innerText = `Seguro que deseas actualizar el usuario con el id ${ev.target.getAttribute('data-id-usuario')}?`;
                break;
            }
        }
        modal_form_user.toggle();
        modal_confirm.toggle();
    }

    // Conf modales end

    // agregamoslos listeners de las acciones de la tabla y lista
    initActionsButtonsListeners(modal_form_user, modal_confirm);
}, false);

function clearUserForm() {
    document.getElementById('form-user-name').value = '';
    document.getElementById('form-user-lastname').value = '';
    document.getElementById('form-user-pass').value = '';
    document.getElementById('form-user-profile-img').value = null;
    document.getElementById('form-user-email').value = '';
    document.getElementById('img-preview-user-form').setAttribute('src', ``);
    document.getElementById('form-user-email-valid-label').innerHTML = '';
}

function initActionsButtonsListeners(_modal_form, _modal_confirm) {
    const _btn_save_modal_form_user = document.getElementById('btn-save-modal-form-user');
    const _modal_form_user_title = document.getElementById('modal-form-user-title');
    const _btn_confirm_modal = document.getElementById('btn-confirm-modal');
    const _confirm_modal_title = document.getElementById('modal-confirm-title');
    const _confirm_modal_body = document.getElementById('modal-confirm-body');
    const _form_user_email = document.getElementById('form-user-email');
    const _form_user_name = document.getElementById('form-user-name');
    const _form_user_lastname = document.getElementById('form-user-lastname');
    const _form_user_pass = document.getElementById('form-user-pass');
    const _form_user_email_valid_label = document.getElementById('form-user-email-valid-label');
    Object.entries(document.getElementsByClassName('btn-editar-usuario')).forEach(el => {
        el[1].onclick = async (ev) => {
            try {
                const id_usuario = ev.target.getAttribute('data-id-usuario');
                _form_user_email_valid_label.innerHTML = '';
                _btn_save_modal_form_user.style.display = 'block';
                _modal_form_user_title.innerText = 'Actualizar usuario';
                _btn_save_modal_form_user.setAttribute('data-id-usuario', id_usuario);
                _btn_save_modal_form_user.setAttribute('data-action', 'UPDATE');
                const GET_WITH_IMAGE = true;
                const user = await fetch(`/users/get-by-id/${id_usuario}/${GET_WITH_IMAGE}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json());
                if (user.status === 'success') {
                    fillUserForm(user.data, true);
                    _form_user_email.setAttribute('data-original-email', user.data.email);
                    _form_user_name.setAttribute('data-original-name', user.data.nombre);
                    _form_user_lastname.setAttribute('data-original-lastname', user.data.apellido);
                    _form_user_pass.setAttribute('data-original-pass', user.data.pass);
                    _modal_form.toggle();
                }
            } catch (err) {
                Toast('error', 'Ocurrio un problema con el servidor', err.toString());
            }
        }
    })
    Object.entries(document.getElementsByClassName('btn-eliminar-usuario')).forEach(el => {
        el[1].onclick = (ev) => {
            const id_usuario = ev.target.getAttribute('data-id-usuario');
            _btn_confirm_modal.setAttribute('data-action', 'DELETE');
            _btn_confirm_modal.setAttribute('data-id-usuario', id_usuario);
            _confirm_modal_title.innerText = 'Confirmar eliminacion de usuario';
            _confirm_modal_body.innerText = `Seguro que deseas eliminar el usuario con el id ${id_usuario}?`;
            _modal_confirm.toggle();
        }
    })
    Object.entries(document.getElementsByClassName('btn-ver-mas-usuario')).forEach(el => {
        el[1].onclick = async (ev) => {
            try {
                const id_usuario = ev.target.getAttribute('data-id-usuario');
                _modal_form_user_title.innerText = 'Detalles usuario';
                _btn_save_modal_form_user.style.display = 'none';
                const GET_WITH_IMAGE = true;
                const user = await fetch(`/users/get-by-id/${id_usuario}/${GET_WITH_IMAGE}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json());
                if (user.status === 'success') {
                    fillUserForm(user.data, false);
                }
                _modal_form.toggle();
            } catch (err) {
                Toast('error', 'Ocurrio un problema con el servidor', err.toString());
            }
        }
    })
}

function fillUserForm(user, editable) {
    if (user) {
        document.getElementById('form-user-name').value = user.nombre;
        document.getElementById('form-user-lastname').value = user.apellido;
        document.getElementById('form-user-pass').value = user.pass;
        document.getElementById('form-user-profile-img').value = null;
        document.getElementById('form-user-email').value = user.email;
        if (user.img_perfil) {
            document.getElementById('img-preview-user-form').setAttribute('src', `data:image/png;base64,${user.profile_image}`);
        } else {
            document.getElementById('img-preview-user-form').setAttribute('src', `/images/no-profile.png`);
        }
    }
    if (editable) {
        document.getElementById('form-user-name').removeAttribute('disabled');
        document.getElementById('form-user-lastname').removeAttribute('disabled');
        document.getElementById('form-user-pass').removeAttribute('disabled');
        document.getElementById('form-user-profile-img').removeAttribute('disabled');
        document.getElementById('form-user-email').removeAttribute('disabled');
    } else {
        document.getElementById('form-user-name').setAttribute('disabled', true);
        document.getElementById('form-user-lastname').setAttribute('disabled', true);
        document.getElementById('form-user-pass').setAttribute('disabled', true);
        document.getElementById('form-user-profile-img').setAttribute('disabled', true);
        document.getElementById('form-user-email').setAttribute('disabled', true);
    }
}

function updateEntries(user, action) {
    let row_html = `<th scope="row">${user.id}</th>`;
    row_html += `<td>${user.nombre}</td >`;
    row_html += `<td>${user.apellido}</td>`;
    row_html += `<td>${user.email}</td>`;
    row_html += `<td>${user.pass}</td>`;
    row_html += `<td>${(user.img_perfil) ? user.img_perfil : ''}</td>`;
    if (user.img_perfil) {
        row_html += `<td><image style="width: 32px; height: 32px;" src="data:image/png;base64,${user.profile_image}"/></td>`;
    } else {
        row_html += `<td><image style="width: 32px; height: 32px;" src="/images/no-profile.png"/></td>`;
    }
    row_html += `<td><div class="d-flex flex-row"> <button type="button" data-id-usuario="${user.id}" class="mx-2 btn btn-success btn-sm btn-editar-usuario"><i class="bi bi-pencil-fill"></i> Editar</button>`;
    row_html += `<button type="button" data-id-usuario="${user.id}" class="mx-2 btn btn-danger btn-sm btn-eliminar-usuario"><i class="bi bi-trash-fill"></i> Eliminar</button><button type="button" data-id-usuario="${user.id}" class="mx-2 btn btn-info btn-sm btn-ver-mas-usuario" style="color: wheat"><i class="bi bi-search"></i> Ver Mas</button>`;
    row_html += `</div></td>`;

    let list_row_html = `<div id="list-row-user-id-${user.id}" style="position: relative;">`;
    list_row_html += `<div style="z-index: 3; position:absolute; top: 8px; right: 0;">`;
    list_row_html += `<button type="button" data-id-usuario="${user.id}" class="mx-2 btn btn-success btn-sm btn-editar-usuario">`;
    list_row_html += `<i class="bi bi-pencil-fill"></i> Editar</button>`;
    list_row_html += `<button type="button" data-id-usuario="${user.id}" class="mx-2 btn btn-danger btn-sm btn-eliminar-usuario">`;
    list_row_html += `<i class="bi bi-trash-fill"></i> Eliminar</button>`;
    list_row_html += `<button type="button" data-id-usuario="${user.id}" class="mx-2 btn btn-info btn-sm btn-ver-mas-usuario"`;
    list_row_html += `style="color: wheat"><i class="bi bi-search"></i> Ver Mas</button>`;
    list_row_html += `</div>`;
    list_row_html += `<image style="z-index: 3; position:absolute; top: 48px; right: 16px; width: 64px; height: 64px; border-radius: 64px;"`;
    if (user.img_perfil) {
        list_row_html += `src="data:image/png;base64,${user.profile_image}" />`;
    } else {
        list_row_html += `src="/images/no-profile.png" />`;
    }
    list_row_html += `<a href="#" class="list-group-item list-group-item-action text-light bg-dark" aria-current="true">`;
    list_row_html += `<div class="d-flex w-100 justify-content-between">`;
    list_row_html += `<h5>${user.nombre} ${user.apellido}</h5>`;
    list_row_html += `</div>`;
    list_row_html += `<div class="d-flex flex-row w-100 justify-content-between">`;
    list_row_html += `<div class="d-flex flex-column w-25 justify-content-between">`;
    list_row_html += `<p style="font-size: 1.2rem; font-weight: 700;">ID</p>`;
    list_row_html += `<p>${user.id}</p>`;
    list_row_html += `</div>`;
    list_row_html += `<div class="d-flex flex-column w-50 justify-content-between">`;
    list_row_html += `<p style="font-size: 1.2rem; font-weight: 700;">Email</p>`;
    list_row_html += `<p>${user.email}</p>`;
    list_row_html += `</div>`;
    list_row_html += `<div class="d-flex flex-column w-100 justify-content-between">`;
    list_row_html += `<p style="font-size: 1.2rem; font-weight: 700;">Hashed Pass</p>`;
    list_row_html += `<p>${user.pass}</p>`;
    list_row_html += `</div>`;
    list_row_html += `<div class="d-flex flex-column w-100 justify-content-between">`;
    list_row_html += `<p style="font-size: 1.2rem; font-weight: 700;">Nombre Imagen</p>`;
    list_row_html += `<p>${(user.img_perfil) ? user.img_perfil : ''}</p>`;
    list_row_html += `</div></div></a></div>`;
    
    if (action === 'CREATE') {
        const row = document.createElement("tr");
        row.setAttribute('id', `row-user-id-${user.id}`);
        row.innerHTML = row_html;
        document.getElementById('table-body').appendChild(row);
        
        const list_row = document.createElement('div');
        list_row.setAttribute('id', `list-row-user-id-${user.id}`);
        list_row.innerHTML = list_row_html;
        document.getElementById('list-content').appendChild(list_row);
    } else {
        document.getElementById(`row-user-id-${user.id}`).innerHTML = row_html;
        document.getElementById(`list-row-user-id-${user.id}`).innerHTML = list_row_html;
    }
}