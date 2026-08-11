/* Función para controlar los puntos interactivos de la imagen Shop The Look */

function toggleHotspot(id, elemento) {
    // 1. Ocultar todas las tarjetas que estén abiertas actualmente
    $('.hotspot-card').fadeOut(200);
    $('.hotspot').removeClass('active');

    // 2. Identificar la tarjeta específica que queremos abrir usando su ID (card-1, card-2, etc.)
    var card = $('#card-' + id);
    
    // 3. Lógica de interruptor: 
    // Si la tarjeta ya se ve, la ocultamos. Si no, la mostramos.
    if (card.is(':visible')) {
        card.fadeOut(200);
        $(elemento).removeClass('active');
    } else {
        card.fadeIn(200);
        $(elemento).addClass('active');
    }
}

// OPCIONAL: Cerrar las tarjetas si se hace clic fuera de los puntos (en la imagen o el fondo)
$(document).ready(function() {
    $(document).on('click', function(event) {
        // Si el clic NO fue en un punto Y NO fue en una tarjeta...
        if (!$(event.target).closest('.hotspot').length && !$(event.target).closest('.hotspot-card').length) {
            $('.hotspot-card').fadeOut(200);
            $('.hotspot').removeClass('active');
        }
    });
});