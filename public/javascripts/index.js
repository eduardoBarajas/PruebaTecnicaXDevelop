
// index INICIO //
const btn_go_to_listado = document.getElementById('btn-ver-listado');
btn_go_to_listado.onclick = (ev) => {
    location.href = 'lista-usuarios';
} 

const input_search_by_email = document.getElementById('input-search-by-email');
const btn_search_by_email = document.getElementById('btn-search-by-email');
btn_search_by_email.onclick = (ev) => {
    if (VALIDATE_EMAIL_REGEX.test(input_search_by_email.value)) {
        location.href = `detalles-usuario?email=${input_search_by_email.value}` ;
    } else {
        Toast('warning', 'Email invalido', `Ingresa un email valido para continuar.`);
    }
} 

// index FIN //