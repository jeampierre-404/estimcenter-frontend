/* ==========================================================
   CHATBOT INTELIGENTE - TESIS IDAT
   Integra: Recomendaciones, Cálculos y Enlace a WhatsApp
   ========================================================== */

$(document).ready(function() {
    // Abrir/Cerrar chat (Tu código original)
    $("#chat-circle, .chat-box-toggle").click(function() {
        $("#chat-circle").toggle('scale');
        $(".chat-box").toggle('scale');
    });
});

// ============================================
// 1. LÓGICA DE ENVÍO Y VISUALIZACIÓN
// ============================================

function enviarMensajeEscrito(event) {
    event.preventDefault(); 
    var input = document.getElementById("chat-input");
    var mensaje = input.value;
    
    if(mensaje.trim() === "") return;

    // 1. Mostrar mensaje del USUARIO (Derecha)
    agregarBurbuja("self", mensaje);
    input.value = ""; // Limpiar input

    // 2. Simular "Escribiendo..." y responder
    mostrarEscribiendo(true);

    setTimeout(function() {
        mostrarEscribiendo(false);
        var respuestaBot = procesarInteligencia(mensaje);
        agregarBurbuja("user", respuestaBot);
    }, 1000); // 1 segundo de retraso para realismo
}

function agregarBurbuja(tipo, html) {
    // tipo 'user' = BOT (Izquierda), tipo 'self' = USUARIO (Derecha)
    var chatBody = $(".chat-logs");
    
    var avatar = (tipo === 'user') 
        ? '<div class="chat-avatar"><img src="imagenes/logo.jpg"></div>' 
        : ''; // El usuario no tiene avatar o podrías poner un icono genérico

    var strHtml = `
        <div class="chat-msg ${tipo}">
            ${avatar}
            <div class="cm-msg-text">${html}</div>
        </div>`;
    
    chatBody.append(strHtml);
    
    // Auto-scroll hacia abajo
    $(".chat-box-body").stop().animate({ scrollTop: $(".chat-box-body")[0].scrollHeight}, 1000);
}

// Simulación visual pequeña (opcional)
function mostrarEscribiendo(estado) {
    // Podrías agregar un div de "..." aquí si quisieras pulirlo más
}

// ============================================
// 2. EL CEREBRO DEL BOT (AQUÍ ESTÁ LA MAGIA)
// ============================================

function procesarInteligencia(mensaje) {
    mensaje = mensaje.toLowerCase();

    // A) SALUDOS
    if (mensaje.includes("hola") || mensaje.includes("buenas")) {
        return "¡Hola! 👋 Soy el asistente virtual de Casa Decor. Puedo ayudarte a:<br>1. Calcular materiales<br>2. Recomendar pisos<br>3. Contactar un humano.";
    }

    // B) LÓGICA DE CÁLCULO (Detecta palabras "metros" o "m2")
    if (mensaje.includes("metro") || mensaje.includes("m2")) {
        // Extraer el número (ej: "tengo 30 metros")
        var numeros = mensaje.match(/\d+/);
        
        if (numeros) {
            var m2 = parseInt(numeros[0]);
            // Asumiendo porcelanato (1.44 rendimiento)
            var cajas = Math.ceil((m2 * 1.10) / 1.44); 
            var pegamento = Math.ceil(m2 / 4);
            
            return `Para cubrir <b>${m2} m²</b> (con merma incluida) necesitas aprox:<br>
                    📦 <b>${cajas} cajas</b> de Porcelanato 60x60.<br>
                    🧱 <b>${pegamento} bolsas</b> de pegamento.<br>
                    <button class="btn-quick-reply" onclick="window.location.href='cotizaciones.html'">Ir a Cotizar esto</button>`;
        } else {
            return "Entiendo que quieres calcular, pero necesito saber la cantidad. Escribe por ejemplo: 'Tengo 40 metros'.";
        }
    }

    // C) LÓGICA DE RECOMENDACIÓN (Usa tu base de datos real)
    if (typeof baseDatosProductos !== 'undefined') {
        
        if (mensaje.includes("sala") || mensaje.includes("comedor")) {
            // Busca porcelanatos
            var sugeridos = baseDatosProductos.filter(p => p.nombre.toLowerCase().includes("porcelanato"));
            var item = sugeridos[Math.floor(Math.random() * sugeridos.length)]; // Uno al azar
            
            return `Para sala te recomiendo el <b>${item.nombre}</b>. Es elegante y duradero.<br>
                    <img src="${item.img}" style="width:100%; border-radius:5px; margin-top:5px; max-width:150px;">`;
        }

        if (mensaje.includes("baño") || mensaje.includes("cocina")) {
            // Busca cerámicos o texturizados
            var sugeridos = baseDatosProductos.filter(p => p.nombre.toLowerCase().includes("gris") || p.nombre.toLowerCase().includes("piedra"));
            var item = sugeridos.length > 0 ? sugeridos[0] : baseDatosProductos[10]; // Fallback
            
            return `Para zonas húmedas te sugiero algo antideslizante como el <b>${item.nombre}</b>.<br>
                    <img src="${item.img}" style="width:100%; border-radius:5px; margin-top:5px; max-width:150px;">`;
        }
    }

    // D) PRECIOS
    if (mensaje.includes("precio") || mensaje.includes("cuanto cuesta")) {
        return "Los precios varían según el modelo. Los porcelanatos van desde S/35.00 y los cerámicos desde S/22.90. ¿Buscas alguno en específico?";
    }

    // E) RESPUESTA POR DEFECTO (Deriva a WhatsApp)
    return `No estoy seguro de esa consulta. 🤔 Pero un asesor humano puede ayudarte ahora mismo.<br>
            <button class="btn-quick-reply" onclick="enviarWhatsApp('${mensaje}')">Hablar por WhatsApp</button>`;
}

// ============================================
// 3. CONEXIÓN A WHATSAPP (FALLBACK)
// ============================================
function enviarWhatsApp(mensajeOpcional) {
    var telefono = "51936662357"; 
    var texto = mensajeOpcional ? mensajeOpcional : "Hola, tengo una consulta.";
    var url = "https://wa.me/" + telefono + "?text=" + encodeURIComponent(texto);
    window.open(url, '_blank');
}