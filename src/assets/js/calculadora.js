/* ==================================================
   1. LÓGICA DEL VISUALIZADOR (EL OJITO)
   ================================================== */
function verEnSala(rutaImagen) {
    // Busca la imagen dentro del modal
    var imgModal = $('#imgSalaGrande');
    
    // Si existe la imagen, le cambia la ruta (src)
    if(imgModal.length > 0) {
        imgModal.attr('src', rutaImagen);
        // Abre el modal visualizador
        $('#modalSala').modal('show');
    } else {
        console.error("No se encontró el modal del visualizador (#modalSala)");
    }
}

/* ==================================================
   2. LÓGICA DE LA CALCULADORA DE PRODUCTOS
   ================================================== */
$('#calculadoraModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget); 
  
  // A. Capturamos los datos del botón que se presionó
  var nombre = button.data('nombre');
  var precio = parseFloat(button.data('precio'));
  var rendimiento = parseFloat(button.data('rendimiento'));
  var unidades = button.data('unidades');
  var tipo = button.data('tipo'); // 'caja', 'saco' o 'varilla'

  // Si no se especifica tipo, asumimos que es 'caja' por defecto (para pisos)
  if (!tipo) tipo = 'caja'; 

  var modal = $(this);
  modal.find('.modal-title').text('Calculadora: ' + nombre);
  
  // B. Configuración visual según el tipo de producto
  var labelRendimiento = '';
  var labelPregunta = '';
  var labelResultado = '';
  var unidadMedida = '';

  if (tipo === 'saco') {
      labelRendimiento = 'Rendimiento Aprox (m²):';
      labelPregunta = '¿Cuántos m² necesitas enchapar?';
      labelResultado = 'SACOS A LLEVAR:';
      unidadMedida = ' m²';
  } else if (tipo === 'varilla') {
      labelRendimiento = 'Largo de Varilla:';
      labelPregunta = '¿Cuántos metros lineales necesitas?';
      labelResultado = 'VARILLAS A LLEVAR:';
      unidadMedida = ' ml'; 
  } else {
      // Por defecto CAJA (Pisos)
      labelRendimiento = 'Rendimiento por Caja:';
      labelPregunta = '¿Cuántos metros cuadrados (m²) necesitas?';
      labelResultado = 'CAJAS A LLEVAR:';
      unidadMedida = ' m²';
  }
  
  // C. Aplicamos los textos a la ventana
  modal.find('#showPrecio').val("S/ " + precio.toFixed(2));
  modal.find('#showRendimiento').val(rendimiento + unidadMedida);
  
  // Actualizamos etiquetas de texto
  modal.find("label:contains('Rendimiento')").text(labelRendimiento);
  modal.find("label:contains('necesitas')").text(labelPregunta);
  modal.find("label:contains('A LLEVAR')").text(labelResultado);

  // Cambiamos el texto pequeño "m²" al lado del input
  var spanInput = modal.find('#inputMetros').next('.input-group-addon');
  if (tipo === 'varilla') {
      spanInput.text('ml');
  } else {
      spanInput.text('m²');
  }

  // D. Ocultar "Piezas" si no es caja (en sacos no interesa cuantas piezas trae)
  if (tipo === 'caja') {
      $('#resultPiezas').parent().parent().show(); // Muestra el div contenedor
  } else {
      $('#resultPiezas').parent().parent().hide(); // Oculta el div contenedor
  }

  // E. Guardar datos en el botón "Calcular Ahora" para usarlos al dar click
  var btnCalc = $('#btnCalcular');
  btnCalc.data('precio', precio);
  btnCalc.data('rendimiento', rendimiento);
  btnCalc.data('unidades', unidades);
  btnCalc.data('tipo', tipo);
  
  // F. Limpiar resultados anteriores para que se vea limpio
  $('#resultPrecio').val('');
  $('#resultCajas').val('');
  $('#resultPiezas').val('');
  $('#resultMetrosReales').val(''); 
  $('#inputMetros').val('');
});

/* FUNCIÓN QUE HACE LA MATEMÁTICA AL DAR CLICK EN "CALCULAR AHORA" */
function calcularTotal() {
    // 1. Obtener lo que escribió el usuario
    var inputVal = document.getElementById('inputMetros').value;
    var cantidadSolicitada = parseFloat(inputVal);
    
    if (inputVal === "" || isNaN(cantidadSolicitada) || cantidadSolicitada <= 0) {
        alert("Por favor, ingresa una cantidad válida mayor a 0.");
        return;
    }

    // 2. Recuperar los datos del producto (guardados en el paso E anterior)
    var btn = $('#btnCalcular');
    var precioUnitario = btn.data('precio'); 
    var rendEmpaque = btn.data('rendimiento');
    var unidEmpaque = btn.data('unidades');
    var tipo = btn.data('tipo');

    // 3. Cálculos Matemáticos
    // Siempre redondeamos hacia arriba (Math.ceil) porque no te venden media caja
    var cantidadEmpaques = Math.ceil(cantidadSolicitada / rendEmpaque); 
    
    var costoTotal = 0;
    var metrajeReal = (cantidadEmpaques * rendEmpaque).toFixed(2);
    
    if (tipo === 'caja') {
        // PISOS: Precio es por metro cuadrado (Metraje Real * Precio m²)
        // OJO: Si tus precios en HTML son por CAJA, cambia la formula abajo. 
        // Asumiendo precio x m2 como dice tu web:
        costoTotal = (metrajeReal * precioUnitario).toFixed(2);
    } else {
        // PEGAMENTOS: Precio es por UNIDAD (Saco) -> (Cantidad Sacos * Precio Saco)
        costoTotal = (cantidadEmpaques * precioUnitario).toFixed(2);
    }

    // 4. Mostrar resultados en los inputs
    document.getElementById('resultPrecio').value = "S/ " + costoTotal;
    
    if (tipo === 'saco') {
        document.getElementById('resultCajas').value = cantidadEmpaques + " Sacos";
        document.getElementById('resultMetrosReales').value = metrajeReal + " m² aprox";
    } else if (tipo === 'varilla') {
        document.getElementById('resultCajas').value = cantidadEmpaques + " Varillas";
        document.getElementById('resultMetrosReales').value = metrajeReal + " ml";
    } else {
        document.getElementById('resultCajas').value = cantidadEmpaques + " Cajas";
        document.getElementById('resultMetrosReales').value = metrajeReal + " m²";
        
        // Calcular piezas totales
        var totalPiezas = cantidadEmpaques * unidEmpaque;
        document.getElementById('resultPiezas').value = totalPiezas + " Pzas";
    }
}