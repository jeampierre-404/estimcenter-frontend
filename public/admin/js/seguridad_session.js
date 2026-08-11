// js/seguridad_session.js

// 1. VERIFICAR SI PUEDE ENTRAR A COTIZAR (Desde otros links)
function verificarAcceso(e) {
    if (e) e.preventDefault(); 
    var estaLogueado = localStorage.getItem('usuarioLogueado');
    
    if (estaLogueado === 'true') {
        window.location.href = 'cotizaciones.html';
    } else {
        if(confirm("🔒 Acceso Restringido. ¿Deseas iniciar sesión?")) {
            window.location.href = 'login.html';
        }
    }
}

// 2. CERRAR SESIÓN
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('clienteNombre');
    localStorage.removeItem('clienteDNI');
    localStorage.removeItem('clienteDireccion');
    
    alert("Sesión cerrada correctamente.");
    window.location.href = 'index.html';
}

// 3. LOGICA VISUAL (Nombre de usuario y campos)
document.addEventListener("DOMContentLoaded", function() {
    var logueado = localStorage.getItem('usuarioLogueado');
    var nombre = localStorage.getItem('clienteNombre') || "Invitado";
    var dni = localStorage.getItem('clienteDNI') || "";
    
    // MENU SUPERIOR
    var lblUsuario = document.getElementById('lblUsuarioActivo');
    var opLogin = document.getElementById('opcionLogin');
    var opLogout = document.getElementById('opcionLogout');

    if (lblUsuario) {
        if (logueado === 'true') {
            lblUsuario.innerText = nombre.substring(0, 10) + "..."; 
            lblUsuario.style.color = "#28a745"; 
            if(opLogin) opLogin.style.display = 'none';
            if(opLogout) opLogout.style.display = 'block';
        } else {
            lblUsuario.innerText = "Cuenta";
            lblUsuario.style.color = "#FF8C00";
            if(opLogin) opLogin.style.display = 'block';
            if(opLogout) opLogout.style.display = 'none';
        }
    }

    // AUTO-LLENADO EN COTIZACIONES
    var inputCliente = document.getElementById('inputCliente');
    var inputDNI = document.getElementById('inputDNI');
    
    if (inputCliente && inputDNI && logueado === 'true') {
        inputCliente.value = nombre;
        inputDNI.value = dni;
        inputCliente.style.backgroundColor = "#f0f8ff"; 
        inputDNI.style.backgroundColor = "#f0f8ff";
    }
});

// 4. CANDADO DE SEGURIDAD (¡NUEVO!)
// Esto detecta si estás en cotizaciones.html sin permiso, incluso al dar "Atrás"
if (window.location.href.indexOf('cotizaciones.html') > -1) {
    // Verificar sesión inmediatamente
    if (localStorage.getItem('usuarioLogueado') !== 'true') {
        window.location.href = 'login.html';
    }

    // Detectar si la página se cargó desde la memoria caché (botón Atrás)
    window.addEventListener('pageshow', function(event) {
        if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
             if (localStorage.getItem('usuarioLogueado') !== 'true') {
                window.location.reload(); // Recarga para que el IF de arriba lo expulse
             }
        }
    });
}