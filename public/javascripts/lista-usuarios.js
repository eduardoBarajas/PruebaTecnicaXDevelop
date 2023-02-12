const validateEmailRegex = /^\S+@\S+\.\S+$/;
const label_input_form_email = document.getElementById('form-user-email-valid-label');
let disable_email_input = false;
const form_user_email = document.getElementById('form-user-email');
form_user_email.onkeyup = async (ev) => {
    if (validateEmailRegex.test(ev.target.value)) {
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
            label_input_form_email.innerHTML = '<i class="bi bi-check-circle-fill"></i>Email Valido';		  
        } else {
            label_input_form_email.innerHTML = '<i class="bi bi-x-octagon-fill"></i>Email ya se encuentra en uso';
        }
    } else {
        label_input_form_email.innerHTML = '<i class="bi bi-x-octagon-fill"></i>Email Invalido';
    }
}
const btn_breadcrumb_inicio = document.getElementById('id-btn-breadcrumb-inicio');
btn_breadcrumb_inicio.onclick = (ev) => {
    window.history.back();
}
const modal_form_user = new bootstrap.Modal(document.getElementById('modal-form-user'), {
    keyboard: false,
});
const modal_form_user_title = document.getElementById('modal-form-user-title');
const btn_save_modal_form_user = document.getElementById('btn-save-modal-form-user');
const btn_add_user = document.getElementById('btn-add-user');
btn_add_user.onclick = (ev) => {
    modal_form_user_title.innerText = 'Nuevo usuario';
    btn_save_modal_form_user.setAttribute('data-action', 'CREATE');
    modal_form_user.toggle();
}
btn_save_modal_form_user.onclick = (ev) => {
    const action = ev.target.getAttribute('data-action');
    const form_user_profile_image = document.getElementById('form-user-profile-img');
    const form_data = {
        id: ev.target.getAttribute('data-id-user'),
        nombre: document.getElementById('form-user-name').value,
        apellidos: document.getElementById('form-user-lastname').value,
        pass: document.getElementById('form-user-pass').value,
        email: form_user_email.value,
        form_user_profile_img: null,
        form_user_profile_img_name: form_user_email.value.replaceAll('.', '_'),
        form_user_profile_img_extension: (form_user_profile_image.files.length > 0) ? form_user_profile_image.files[0].name.split('.')[1] : null,
    }
    switch (action) {
        case 'CREATE': {
            const invalid_form_fields = [];
            const form_fields = ['nombre', 'apellidos', 'pass', 'email', 'form_user_profile_img_name', 'form_user_profile_img_extension'];
            form_fields.forEach(field => {
                switch (field) {
                    case 'email': {
                        if (!validateEmailRegex.test(form_data[field])) {
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
                return;
            }
            const reader = new FileReader();
            reader.onloadend = function async() {
                form_data.form_user_profile_img = reader.result;
                fetch('/users/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(form_data)
                })
                    .then(response => response.json())
                    .then(res => {
                        Toast(res.status, 'Creacion de usuario', `[${res.code}] - ${res.message}`);
                        if (res.status === 'success') {
                            modal_form_user.toggle();
                            clearUserForm();
                        }
                    })
                    .catch(err => {
                        Toast('error', 'Ocurrio un problema con el servidor', err.toString());
                    });
            }
            reader.readAsDataURL(form_user_profile_image.files[0]);
            break;
        }
    }
}

function clearUserForm() {
    document.getElementById('form-user-name').value = '';
    document.getElementById('form-user-lastname').value = '';
    document.getElementById('form-user-pass').value = '';
    document.getElementById('form-user-profile-img').value = null;
    document.getElementById('form-user-email').value = '';
}