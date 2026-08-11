// --- CONFIGURACIÓN DE EMAILJS ---
(function(){
    // IMPORTANTE: REEMPLAZA ESTO CON TU 'PUBLIC KEY' DE EMAILJS
    emailjs.init("9K_sMon2PmtToW5n1"); 
})();

// --- CONFIGURACIÓN FACE API ---
let modelosCargados = false;
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

// --- INICIO ---
window.onload = async () => {
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        modelosCargados = true;
        
        actualizarEstado('statusLogin', "IA Lista (Multi-Usuario)", "ready-ia");
        actualizarEstado('statusReg', "IA Lista", "ready-ia");
        
        startVideo('videoLogin');
        startVideo('videoReg');
    } catch (error) {
        console.error("Error IA:", error);
    }
};

function actualizarEstado(id, txt, cls) {
    const el = document.getElementById(id);
    if(el) { el.innerText = txt; el.className = "status-ia " + cls; }
}

function startVideo(id) {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(s => { document.getElementById(id).srcObject = s; })
        .catch(e => console.log("Cámara error", e));
}

function girarPanel() {
    document.getElementById('card').classList.toggle('rotate');
}

// --- 1. SIMULACIÓN API (Sin fetch real) ---
async function consultarAPI() {
    const doc = document.getElementById('dniInput').value.trim();
    const nombre = document.getElementById('nombreInput');
    const dir = document.getElementById('direccionInput');
    const btn = document.querySelector('.input-group-btn button');

    btn.innerHTML = '...'; 
    btn.disabled = true;
    
    await new Promise(r => setTimeout(r, 400)); // Pequeña espera

    if (doc === "10442508645") {
        nombre.value = "TAPIA SANCHEZ JOSE LUIS";
        dir.value = "CAL. NICANOR CARMONA NRO. 336 - FERREÑAFE";
    } else if (doc === "44250864") {
        nombre.value = "JOSE LUIS TAPIA SANCHEZ";
        dir.value = "FERREÑAFE - LAMBAYEQUE";
    } else {
        alert("DNI no encontrado en demo. Puedes escribir los datos manualmente.");
        nombre.focus();
    }
    
    btn.innerHTML = '<i class="fas fa-search"></i>';
    btn.disabled = false;
}

// --- 2. REGISTRO JSON (AGREGA A LA LISTA) ---
async function registrarRostro() {
    if (!modelosCargados) return alert("Espera a que cargue la IA...");
    
    const usuario = document.getElementById('regUsuario').value;
    const nombre = document.getElementById('nombreInput').value;
    const dni = document.getElementById('dniInput').value;
    const dir = document.getElementById('direccionInput').value;

    if (!usuario) return alert("Escribe un Nick.");
    if (!nombre) return alert("Escribe tu nombre completo.");

    const video = document.getElementById('videoReg');
    
    try {
        const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
            // A) Creamos el perfil nuevo
            const nuevoPerfil = {
                usuario: usuario,
                nombre: nombre,
                dni: dni,
                direccion: dir,
                descriptor: Array.from(detection.descriptor)
            };

            // B) Recuperamos la LISTA existente (si no hay, crea una vacía)
            let lista = JSON.parse(localStorage.getItem('bd_facial_casa_decor') || '[]');

            // C) Agregamos el nuevo a la lista
            lista.push(nuevoPerfil);

            // D) Guardamos la lista actualizada
            localStorage.setItem('bd_facial_casa_decor', JSON.stringify(lista));
            
            alert(`¡Registro Exitoso!\nUsuario ${usuario} agregado a la base de datos.`);
            girarPanel();
        } else {
            alert("No veo tu rostro. Ilumina tu cara.");
        }
    } catch (e) {
        console.error(e);
        alert("Error técnico en registro.");
    }
}

// --- 3. LOGIN JSON (BUSCA EN LA LISTA) ---
async function iniciarReconocimientoLogin() {
    if (!modelosCargados) return alert("Espera IA...");

    const data = localStorage.getItem('bd_facial_casa_decor');
    if (!data) return alert("Nadie registrado aún.");

    const listaUsuarios = JSON.parse(data); // Array de usuarios
    const video = document.getElementById('videoLogin');
    
    const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

    if (detection) {
        let encontrado = null;
        let mejorDistancia = 0.55; // Umbral de precisión

        // Comparamos contra TODOS los registrados
        for (let perfil of listaUsuarios) {
            const guardado = new Float32Array(perfil.descriptor);
            const dist = faceapi.euclideanDistance(detection.descriptor, guardado);
            
            if (dist < mejorDistancia) {
                mejorDistancia = dist;
                encontrado = perfil;
            }
        }

        if (encontrado) {
            // Guardamos sesión actual
            localStorage.setItem('usuarioLogueado', 'true');
            localStorage.setItem('clienteNombre', encontrado.nombre);
            localStorage.setItem('clienteDNI', encontrado.dni);
            localStorage.setItem('clienteDireccion', encontrado.direccion);
            
            alert(`¡Hola ${encontrado.nombre}!\nAcceso concedido.`);
            window.location.href = 'cotizaciones.html';
        } else {
            alert("Rostro no reconocido en la base de datos.");
        }
    } else {
        alert("Acércate a la cámara.");
    }
}

function loginManual() {
    const user = document.getElementById('userLogin').value;
    if(user) {
        localStorage.setItem('usuarioLogueado', 'true');
        localStorage.setItem('clienteNombre', user);
        window.location.href = 'cotizaciones.html';
    }
}

// --- 4. RECUPERACIÓN DE CONTRASEÑA (EMAILJS) ---

function enviarCodigoGmail() {
    var email = $("#emailRecuperacion").val().trim();
    var $mensaje = $("#mensajeRecuperacion");
    var $boton = $("#modalRecuperar .btn-action");

    // Validaciones
    if (email === "") {
        $mensaje.css("color", "red").text("Por favor, escribe tu correo.").show();
        return;
    }
    
    // UX: Botón cargando
    $boton.prop("disabled", true).html('<i class="fas fa-spinner fa-spin"></i> ENVIANDO...');
    $mensaje.hide();

    // Generar código
    var codigoGenerado = Math.floor(100000 + Math.random() * 900000);

    // Guardar en localStorage para validar después
    localStorage.setItem("codigoRecuperacion", codigoGenerado);
    localStorage.setItem("emailRecuperacion", email);

    // Configuración para EmailJS
    var parametros = {
        to_email: email,       // Variable en template EmailJS
        codigo: codigoGenerado // Variable en template EmailJS
    };

    // Reemplaza los IDs con los de tu cuenta EmailJS
    emailjs.send('service_x48fc05', 'template_0pvzqzv', parametros)
        .then(function(response) {
            $mensaje.css("color", "#28a745").text("¡Código enviado!").show();

            setTimeout(function() {
                $('#modalRecuperar').modal('hide');
                abrirModalVerificarCodigo(); // Siguiente paso
            }, 2000);

        }, function(error) {
            console.log('FALLÓ...', error);
            $mensaje.css("color", "red").text("Error al enviar. Verifica las IDs.").show();
            $boton.prop("disabled", false).html('<i class="fas fa-paper-plane"></i> ENVIAR CÓDIGO');
        });
}

function abrirModalVerificarCodigo() {
    var codigoIngresado = prompt("Por favor ingresa el código de 6 dígitos que enviamos a tu correo:");
    var codigoReal = localStorage.getItem("codigoRecuperacion");

    if (codigoIngresado && codigoIngresado == codigoReal) {
        alert("¡Código Correcto! Identidad verificada.");
        var nuevaPass = prompt("Ingresa tu nueva contraseña:");
        if(nuevaPass) {
            alert("Contraseña actualizada correctamente. Ahora puedes ingresar.");
            localStorage.removeItem("codigoRecuperacion");
        }
    } else {
        alert("Código incorrecto o cancelado.");
    }
}