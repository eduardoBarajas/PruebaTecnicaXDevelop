// index INICIO //
const btn_go_to_listado = document.getElementById('btn-ver-listado');
btn_go_to_listado.onclick = (ev) => {
    location.href = 'lista-usuarios';
} 

const input_search_by_email = document.getElementById('input-search-by-email');
const btn_search_by_email = document.getElementById('btn-search-by-email');
btn_search_by_email.onclick = (ev) => {
    alert(input_search_by_email.value);
    //location.href = 'lista-usuarios';
} 

// index FIN //