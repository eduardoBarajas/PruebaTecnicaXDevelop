const VALIDATE_EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const btn_breadcrumb_inicio = document.getElementById('id-btn-breadcrumb-inicio');
btn_breadcrumb_inicio.onclick = (ev) => {
    window.history.back();
}


function Toast(status, title, message) {
    const toast = new bootstrap.Toast(document.getElementById('toast'));
    const toast_header = document.getElementById('toast-header');
    const toast_title = document.getElementById('toast-title');
    const toast_body = document.getElementById('toast-body');
    toast_title.innerText = title;
    toast_body.innerText = message;
    switch (status) {
        case 'success': toast_header.style.backgroundColor = 'green'; break;
        case 'warning': toast_header.style.backgroundColor = 'orange'; break;
        case 'error': toast_header.style.backgroundColor = 'tomato'; break;
    }
    toast.show();    
}