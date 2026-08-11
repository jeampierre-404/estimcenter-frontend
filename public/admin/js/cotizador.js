// js/cotizador.js

// =====================================================
// BASE DE DATOS DE PRODUCTOS (ACTUALIZADA SEGÚN TUS HTMLs)
// =====================================================
const baseDatosProductos = [
    // --- PORCELANATOS (60x60, Rendimiento aprox 1.44 m2/caja) ---
    { id: 1, nombre: 'Porcelanato Calacatta', precio: 35.50, unidad: 'm2', rendimiento: 1.44, img: 'imagenes/porcelanato.png' },
    { id: 2, nombre: 'Porcelanato Gris Veteado', precio: 35.00, unidad: 'm2', rendimiento: 1.44, img: 'imagenes/porcelanato1.png' },
    { id: 3, nombre: 'Porcelanato Beige Crema', precio: 36.00, unidad: 'm2', rendimiento: 1.44, img: 'imagenes/porcelanato2.png' },
    { id: 4, nombre: 'Porcelanato Rombo Maderado', precio: 36.50, unidad: 'm2', rendimiento: 1.44, img: 'imagenes/porcelanato3.jpeg' },
    { id: 5, nombre: 'Porcelanato Gris', precio: 36.00, unidad: 'm2', rendimiento: 1.44, img: 'imagenes/porcelanato4.jpeg' },
    { id: 6, nombre: 'Porcelanato Vidrio', precio: 37.00, unidad: 'm2', rendimiento: 1.44, img: 'imagenes/porcelanato5.jpeg' },
    
    // --- CERÁMICOS (45x45, Rendimiento variado: 1.90 / 2.08 / 2.29) ---
    { id: 7, nombre: 'Cerámico Diseño Geométrico', precio: 22.90, unidad: 'm2', rendimiento: 2.08, img: 'imagenes/ceramico.jpg' },
    { id: 8, nombre: 'Cerámico Marmoleado Gris', precio: 24.50, unidad: 'm2', rendimiento: 2.29, img: 'imagenes/ceramico1.jpeg' },
    { id: 9, nombre: 'Cerámico Mármol Blanco', precio: 23.00, unidad: 'm2', rendimiento: 2.08, img: 'imagenes/ceramico2.jpeg' },
    { id: 10, nombre: 'Cerámico Piedra Terraza', precio: 24.00, unidad: 'm2', rendimiento: 2.08, img: 'imagenes/ceramico3.jpeg' },
    { id: 11, nombre: 'Cerámico Tipo Madera', precio: 24.50, unidad: 'm2', rendimiento: 2.08, img: 'imagenes/ceramico4.jpeg' },
    { id: 12, nombre: 'Cerámico Matizado Gris', precio: 23.00, unidad: 'm2', rendimiento: 2.29, img: 'imagenes/ceramico5.jpeg' },
    { id: 13, nombre: 'Cerámico Rombo Marrón', precio: 25.00, unidad: 'm2', rendimiento: 1.90, img:'imagenes/ceramico6.jpeg'},
    { id: 14, nombre: 'Cerámico Acuarela', precio: 23.00, unidad: 'm2', rendimiento: 1.90, img:'imagenes/ceramico7.jpeg'},
    { id: 15, nombre: 'Cerámico Gris Marmolizado', precio: 23.50, unidad: 'm2', rendimiento: 1.90, img:'imagenes/ceramico8.jpeg'},
    { id: 16, nombre: 'Cerámico Maderado', precio: 25.00, unidad: 'm2', rendimiento: 1.90, img:'imagenes/ceramico9.jpeg'},
    { id: 17, nombre: 'Cerámico Rocoso', precio: 24.50, unidad: 'm2', rendimiento: 1.90, img:'imagenes/ceramico10.jpeg'},
    { id: 18, nombre: 'Cerámico Maderado Oscuro', precio: 25.00, unidad: 'm2', rendimiento: 1.90, img:'imagenes/ceramico11.jpeg'},
    { id: 19, nombre: 'Cerámico Blanco Liso', precio: 23.50, unidad: 'm2', rendimiento: 2.12, img:'imagenes/ceramico12.jpeg'},
    { id: 20, nombre: 'Cerámico Figuras Rocosas', precio: 25.00, unidad: 'm2', rendimiento: 1.90, img:'imagenes/ceramico13.jpeg'},
    { id: 21, nombre: 'Cerámico Maderado Claro', precio: 24.50, unidad: 'm2', rendimiento: 1.90, img:'imagenes/ceramico14.jpeg'},

    // --- PEGAMENTOS (Rendimiento aprox 4 m2 por saco) ---
    { id: 22, nombre: 'Pegamento Gris Básico', precio: 16.50, unidad: 'unid', rendimiento: 4.00, img: 'imagenes/pegamento_gris_basico.png' },
    { id: 23, nombre: 'Blanco Flexible', precio: 32.00, unidad: 'unid', rendimiento: 4.00, img: 'imagenes/pegamento.png' },
    { id: 24, nombre: 'Extra Fuerte (Exteriores)', precio: 45.90, unidad: 'unid', rendimiento: 4.00, img: 'imagenes/chemayolic_extrafuerte.png' },
    
    // --- COMPLEMENTOS (Fraguas, Crucetas, Perfiles) ---
    { id: 25, nombre: 'Fragua Gris Perla (1kg)', precio: 8.50, unidad: 'unid', rendimiento: 4.00, img: 'imagenes/fragua.jpg' },
    { id: 26, nombre: 'Crucetas 3mm (Bolsa x 100)', precio: 5.00, unidad: 'unid', rendimiento: 15.00, img: 'imagenes/crucetas.png' },
    { id: 27, nombre: 'Perfil Aluminio "L" Plata (2.4m)', precio: 22.00, unidad: 'unid', rendimiento: 2.40, img: 'imagenes/logo.jpg' }, // Puse logo por defecto si no tienes foto de perfil
    { id: 28, nombre: 'Cantonera Dorada (2.4m)', precio: 28.50, unidad: 'unid', rendimiento: 2.40, img: 'imagenes/logo.jpg' }
];

var prodSeleccionado = null;
var modoCalculo = 'cajas'; // 'cajas' o 'metraje'

// =====================================================
// INICIALIZACIÓN
// =====================================================
$(document).ready(function() {
    renderizarLista(baseDatosProductos);
    
    // Poner fecha actual
    var hoy = new Date();
    $('#fechaFactura').text(hoy.toLocaleDateString());
    
    actualizarTotal(); 

    // Buscador en tiempo real
    $("#buscador").on("keyup", function() {
        var valor = $(this).val().toLowerCase();
        var filtrados = baseDatosProductos.filter(function(p) {
            return p.nombre.toLowerCase().indexOf(valor) > -1;
        });
        renderizarLista(filtrados);
    });
});

// =====================================================
// FUNCIONES DEL COTIZADOR
// =====================================================

function renderizarLista(lista) {
    $('#listaProductos').empty();
    if(lista.length === 0) {
        $('#listaProductos').html('<p class="text-center text-muted">No se encontraron productos.</p>');
        return;
    }
    lista.forEach(function(p) {
        // USO DE NUEVA CLASE 'producto-listado-item' PARA QUE NO SE DEFORME
        var html = `
            <div class="producto-listado-item" onclick="seleccionarProducto(${p.id})">
                <img src="${p.img}" class="thumb-lista-fix" alt="foto" onerror="this.src='imagenes/logo.jpg'"> 
                <div class="info-producto-box">
                    <h5 style="margin:0; font-weight:bold; color:#122A51;">${p.nombre}</h5>
                    <small>Precio: S/ ${p.precio.toFixed(2)} x ${p.unidad}</small>
                </div>
                <span class="glyphicon glyphicon-plus-sign" style="color:#122A51; font-size: 1.5em;"></span>
            </div>
        `;
        $('#listaProductos').append(html);
    });
}

// TU LOGICA DEL MODAL (INTACTA)
function seleccionarProducto(id) {
    prodSeleccionado = baseDatosProductos.find(p => p.id === id);
    
    // Resetear modo a 'cajas' (unidades) por defecto al abrir
    modoCalculo = 'cajas';
    actualizarInterfazModo();

    // Llenar datos en el modal
    $('#lblProductoModal').text(prodSeleccionado.nombre);
    $('#imgSeleccionadaModal').attr('src', prodSeleccionado.img);
    $('#txtCantidadModal').val(1);
    
    // Si es cruceta o algo sin rendimiento claro, ocultar botón de cambio
    // (Asumimos que todo lo que tenga rendimiento > 1 puede calcularse por m2, excepto perfiles que es lineal)
    if (prodSeleccionado.rendimiento <= 1 && prodSeleccionado.unidad === 'unid') {
        $('#btnCambiarModo').hide();
    } else {
        $('#btnCambiarModo').show();
    }

    calcularResumenModal();
    $('#modalSeleccion').modal('show');

    // Enfocar el input
    $('#modalSeleccion').on('shown.bs.modal', function () {
        $('#txtCantidadModal').focus();
    });
}

function alternarModoCalculo() {
    modoCalculo = (modoCalculo === 'cajas') ? 'metraje' : 'cajas';
    
    // Limpiar input para evitar confusiones
    $('#txtCantidadModal').val('');
    $('#lblSubtotalModal').text('S/ 0.00');
    $('#lblMetrajeModal').text('0.00 m²');
    $('#lblCajasReales').text('0');
    $('#txtCantidadModal').focus();

    actualizarInterfazModo();
}

function actualizarInterfazModo() {
    var btn = $('#btnCambiarModo');
    var lbl = $('#lblInputModal');
    var hint = $('#hintConversion');

    if (modoCalculo === 'cajas') {
        btn.html('<span class="glyphicon glyphicon-refresh"></span> Cambiar a m²');
        btn.removeClass('btn-warning').addClass('btn-info');
        
        if (prodSeleccionado && prodSeleccionado.unidad === 'unid') {
             lbl.text('Cantidad (Sacos/Unid):');
             hint.text('Ingresa cuántas unidades llevarás.');
        } else {
             lbl.text('Cantidad (Cajas):');
             hint.text('El sistema calculará el metraje total.');
        }

    } else {
        btn.html('<span class="glyphicon glyphicon-refresh"></span> Cambiar a Cantidad');
        btn.removeClass('btn-info').addClass('btn-warning');
        lbl.text('Metraje a Cubrir (m²):');
        hint.text('El sistema calculará las cajas/sacos necesarios.');
    }
}

// TU LOGICA DE CALCULO (INTACTA)
function calcularResumenModal() {
    if (!prodSeleccionado) return;

    var inputVal = parseFloat($('#txtCantidadModal').val());
    if (isNaN(inputVal) || inputVal < 0) inputVal = 0;

    var cantidadFinal = 0; // Cajas o Sacos
    var metrajeTotal = 0;
    var totalPagar = 0;

    if (modoCalculo === 'cajas') {
        // Usuario ingresa cantidad directa
        cantidadFinal = inputVal;
        
        // Cobertura total = Cantidad * Rendimiento
        metrajeTotal = cantidadFinal * prodSeleccionado.rendimiento;

    } else {
        // Usuario ingresa Metros Cuadrados
        var metrosNecesarios = inputVal;
        
        if (prodSeleccionado.rendimiento > 0) {
            // Se redondea hacia arriba (no venden medio saco)
            cantidadFinal = Math.ceil(metrosNecesarios / prodSeleccionado.rendimiento);
        } else {
            cantidadFinal = 0;
        }
        
        // El metraje real que se lleva es lo que cubren esas cajas/sacos
        metrajeTotal = cantidadFinal * prodSeleccionado.rendimiento;
    }

    // Calcular Precio
    if (prodSeleccionado.unidad === 'm2') {
        // Pisos: Precio x m² real de la caja
        totalPagar = metrajeTotal * prodSeleccionado.precio;
    } else {
        // Pegamentos: Precio x Saco (Unidad)
        totalPagar = cantidadFinal * prodSeleccionado.precio;
    }

    // Actualizar Textos
    var labelUnidad = (prodSeleccionado.unidad === 'm2') ? ' Cajas' : ' Sacos/Und';
    
    $('#lblCajasReales').text(cantidadFinal + labelUnidad);
    $('#lblMetrajeModal').text(metrajeTotal.toFixed(2) + " m²");
    $('#lblSubtotalModal').text("S/ " + totalPagar.toFixed(2));
}

// TU LOGICA DE AGREGAR FILA (INTACTA)
function agregarAProforma() {
    if (!prodSeleccionado) return;

    // Recalcular una última vez para asegurar datos exactos
    var inputVal = parseFloat($('#txtCantidadModal').val());
    if (isNaN(inputVal) || inputVal <= 0) {
        alert("Ingrese una cantidad válida");
        return;
    }

    var cantidadFinal = 0;
    
    if (modoCalculo === 'cajas') {
        cantidadFinal = inputVal;
    } else {
        cantidadFinal = Math.ceil(inputVal / prodSeleccionado.rendimiento);
    }

    var metrajeTexto = "";
    var subtotal = 0;
    var metrajeReal = cantidadFinal * prodSeleccionado.rendimiento;

    if (prodSeleccionado.unidad === 'm2') {
        // Pisos
        metrajeTexto = metrajeReal.toFixed(2) + " m²";
        subtotal = metrajeReal * prodSeleccionado.precio;
    } else {
        // Pegamentos
        metrajeTexto = metrajeReal.toFixed(2) + " m² (aprox)";
        subtotal = cantidadFinal * prodSeleccionado.precio;
    }

    var fila = `
        <tr>
            <td class="text-center"><img src="${prodSeleccionado.img}" style="height:40px; width:auto;" onerror="this.src='imagenes/logo.jpg'"></td>
            <td>${prodSeleccionado.nombre}</td>
            <td class="text-center" style="font-weight:bold; font-size:1.1em;">${cantidadFinal}</td>
            <td class="text-center">${metrajeTexto}</td>
            <td class="text-right">S/ ${prodSeleccionado.precio.toFixed(2)}</td>
            <td class="text-right subtotal-fila" data-valor="${subtotal}">S/ ${subtotal.toFixed(2)}</td>
            <td class="text-center ocultar-impresion">
                <button class="btn btn-xs btn-danger" onclick="borrarFila(this)"><span class="glyphicon glyphicon-trash"></span></button>
            </td>
        </tr>
    `;

    $('#cuerpoTabla').append(fila);
    actualizarTotal();
    
    $('#modalSeleccion').modal('hide');
    $('#buscador').val('');
    renderizarLista(baseDatosProductos); // Resetea la lista
    prodSeleccionado = null;
}

function borrarFila(btn) {
    $(btn).closest('tr').remove();
    actualizarTotal();
}

function limpiarTodo() {
    $('#cuerpoTabla').empty();
    actualizarTotal();
}

function actualizarTotal() {
    var total = 0;
    $('.subtotal-fila').each(function() {
        total += parseFloat($(this).data('valor'));
    });
    // Solo texto, sin cuadro naranja (manejado por CSS)
    $('#lblTotalTabla').text("S/ " + total.toFixed(2));
}

// ============================================
// LÓGICA PARA GUARDAR PEDIDOS (ESTO ES LO QUE ARREGLA LA VISTA EN PEDIDOS.HTML)
// ============================================

function guardarPedidoEnHistorial() {
    // 1. Verificar si hay productos
    var totalTexto = $('#lblTotalTabla').text();
    if (totalTexto === "S/ 0.00") return; // No guardar si está vacío

    // --- AQUÍ ESTABA EL ERROR: AHORA SÍ CAPTURAMOS LOS PRODUCTOS ---
    var productosDetalle = [];
    $('#cuerpoTabla tr').each(function() {
        var fila = $(this);
        var item = {
            // Obtenemos los datos de cada columna de la tabla
            img: fila.find('img').attr('src'),
            nombre: fila.find('td').eq(1).text().trim(),
            cantidad: fila.find('td').eq(2).text().trim(),
            metraje: fila.find('td').eq(3).text().trim(),
            precio: fila.find('td').eq(4).text().trim(),
            subtotal: fila.find('.subtotal-fila').text().trim()
        };
        productosDetalle.push(item);
    });
    // -------------------------------------------------------------

    // 2. Obtener datos generales
    var usuario = localStorage.getItem('clienteNombre') || "Invitado";
    var dni = localStorage.getItem('clienteDNI') || "---";
    var fecha = new Date().toLocaleString();
    var idPedido = "PED-" + Math.floor(Math.random() * 1000000); 

    // 3. Crear objeto del pedido (INCLUYENDO 'detalles')
    var nuevoPedido = {
        id: idPedido,
        usuario: usuario, 
        dni: dni,
        fecha: fecha,
        total: totalTexto,
        estado: "Generado / Descargado",
        detalles: productosDetalle // <--- AQUÍ GUARDAMOS LA LISTA
    };

    // 4. Guardar en LocalStorage
    var historial = JSON.parse(localStorage.getItem('bd_pedidos_casa_decor')) || [];
    historial.push(nuevoPedido);
    localStorage.setItem('bd_pedidos_casa_decor', JSON.stringify(historial));
}

// ============================================
// MODIFICAR TUS FUNCIONES DE BOTONES
// ============================================

function capturarHoja(callback) {
    // Ocultar botones para foto limpia
    $('.ocultar-impresion').hide();
    
    // Tomar foto del área ID #areaProforma
    html2canvas(document.querySelector("#areaProforma"), {
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {
        // Mostrar botones de nuevo
        $('.ocultar-impresion').show();
        callback(canvas);
    });
}

function descargarImagen() {
    guardarPedidoEnHistorial(); // Guarda en historial
    
    var cliente = $('#inputCliente').val() || "Cliente";
    capturarHoja(function(canvas) {
        var link = document.createElement('a');
        link.download = 'Proforma_' + cliente + '.jpg';
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
    });
}

function enviarWhatsapp() {
    guardarPedidoEnHistorial(); // Guarda en historial

    var cliente = $('#inputCliente').val() || "Cliente";
    capturarHoja(function(canvas) {
        var link = document.createElement('a');
        link.download = 'Proforma_' + cliente + '.jpg';
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
        
        var numeroWhatsapp = "51936662357"; 
        var mensaje = `Hola *Casa Decor J.S*, soy ${cliente}.%0A%0AAcabo de generar mi cotización (la adjunto en este chat).%0A%0AConfirmen stock por favor.`;
        
        setTimeout(function() {
            window.open(`https://wa.me/${numeroWhatsapp}?text=${mensaje}`, '_blank');
        }, 1500);
    });
}