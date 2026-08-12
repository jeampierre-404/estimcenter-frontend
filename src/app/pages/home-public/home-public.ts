import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // 🔥 Se agregó Router
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-public',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './home-public.html',
  styleUrls: ['./home-public.css']
})
export class HomePublicComponent implements OnInit {

  chatVisible: boolean = false;
  porcelanatosList: any[] = [];
  ceramicosList: any[] = [];
  pegamentosList: any[] = [];

  nombreCliente: string = '';
  clienteLogueado: boolean = false;

  // Variables Calculadora
  prodSeleccionado: any = null;
  metrosSolicitados: number | null = null;
  costoTotal: string = '';
  cajasLlevar: string = '';
  metrosReales: string = '';
  unidadesTotales: string = '';

  // 🔥 Variables para la Vista en Ambiente Mejorada 🔥
  imagenSala: string = '';
  prodVistaSala: any = null;
  mostrandoSala: boolean = true;

  lblPregunta: string = '¿Cuántos metros cuadrados (m²) necesitas?';
  lblRendimiento: string = 'Rendimiento:';
  lblResultadoEmpaque: string = 'CAJAS A LLEVAR:';
  mostrarPiezas: boolean = true;

  // Búsqueda y Carrito
  todosLosProductos: any[] = [];
  productosBuscados: any[] = [];
  terminoBusqueda: string = '';
  carritoCotizacion: any[] = [];

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor() {}

  @HostListener('window:focus')
  onWindowFocus() {
    this.cargarProductos();
    this.verificarSesion(); 
    this.cargarCarrito();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.hotspot') && !targetElement.closest('.hotspot-card')) {
      const cards = document.querySelectorAll('.hotspot-card');
      cards.forEach(c => (c as HTMLElement).style.display = 'none');
    }
  }

  ngOnInit() {
    this.verificarSesion(); 
    this.cargarProductos();
    this.cargarCarrito();
  }

  verificarSesion() {
    this.clienteLogueado = localStorage.getItem('clienteLogueado') === 'true';
    if (this.clienteLogueado) {
      const nombreCompleto = localStorage.getItem('clienteNombre') || '';
      this.nombreCliente = nombreCompleto.split(' ')[0];
    } else {
      this.nombreCliente = '';
    }
  }

  cargarProductos() {
    this.porcelanatosList = [];
    this.ceramicosList = [];
    this.pegamentosList = [];

    const v = new Date().getTime();
    
    this.http.get<any[]>(`https://estimcenter.onrender.com/rest/producto/listar?v=${v}`).subscribe({
      next: (data) => {
        const activos = data.filter(p => p.estado !== 'INACTIVO');
        this.todosLosProductos = activos;

        this.porcelanatosList = activos.filter(p => p.categoria?.nombre === 'Destacado Porcelanato' || (p.codigo && p.codigo.includes('POR'))).slice(0, 3);
        this.ceramicosList = activos.filter(p => p.categoria?.nombre === 'Destacado Ceramico' || (p.codigo && p.codigo.includes('CER'))).slice(0, 3);
        this.pegamentosList = activos.filter(p => p.categoria?.nombre === 'Destacado Pegamento' || (p.codigo && p.codigo.includes('PEG'))).slice(0, 3);

        this.cdr.detectChanges(); 
      },
      error: (err) => console.error(err)
    });
  }

  abrirBuscadorPred() {
    this.terminoBusqueda = '';
    this.productosBuscados = [];
    (window as any).$('#modalBienvenidaBuscador').modal('show');
  }

  buscarProductoPred() {
    const term = this.terminoBusqueda.toLowerCase().trim();
    if (!term) {
        this.productosBuscados = [];
        return;
    }

    this.productosBuscados = this.todosLosProductos.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(term)) ||
        (p.codigo && p.codigo.toLowerCase().includes(term)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
    ).slice(0, 6);
  }

  seleccionarBusquedaPred(prod: any) {
    (window as any).$('#modalBienvenidaBuscador').modal('hide');
    
    setTimeout(() => {
        const elemento = document.getElementById('prod-' + prod.codigo);
        
        if (elemento) {
            const accordionContent = elemento.closest('.panel-collapse');
            if (accordionContent && !accordionContent.classList.contains('in')) {
                (window as any).$(accordionContent).collapse('show');
            }
            
            setTimeout(() => {
                elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const tarjeta = elemento.querySelector('.thumbnail') as HTMLElement;
                if (tarjeta) {
                    const shadowOriginal = tarjeta.style.boxShadow || '';
                    const transformOriginal = tarjeta.style.transform || '';
                    
                    tarjeta.style.transition = 'all 0.5s ease';
                    tarjeta.style.boxShadow = '0 0 25px 5px rgba(255, 140, 0, 0.6)';
                    tarjeta.style.transform = 'scale(1.03)';
                    
                    setTimeout(() => {
                        tarjeta.style.boxShadow = shadowOriginal;
                        tarjeta.style.transform = transformOriginal;
                    }, 2000);
                }
            }, 300);
        } else {
            localStorage.setItem('producto_a_enfocar', prod.codigo);
            this.router.navigate(['/catalogo']);
        }
    }, 400); 
  }

  cargarCarrito() {
    const c = localStorage.getItem('carrito_temporal');
    if (c) {
        this.carritoCotizacion = JSON.parse(c);
    }
  }

  agregarAlCarrito() {
    if (!this.prodSeleccionado || !this.metrosSolicitados) return;

    const cod = this.prodSeleccionado.codigo || '';
    const precio = this.prodSeleccionado.precio || 0;
    const isPeg = cod.includes('PEG');
    const isUnd = cod.includes('BANO') || cod.includes('OVA') || cod.includes('LAP');
    
    let cantidadEmpaques = 0;
    let mReal = "-";

    if(isUnd){
        cantidadEmpaques = Math.ceil(this.metrosSolicitados);
    } else {
        const rend = this.prodSeleccionado.rendimientoCaja || (isPeg ? 4 : 1);
        cantidadEmpaques = Math.ceil(this.metrosSolicitados / rend);
        mReal = (cantidadEmpaques * rend).toFixed(2);
    }

    const subtotal = cantidadEmpaques * precio;

    const nuevoItem = {
      productoOriginal: this.prodSeleccionado,
      img: this.prodSeleccionado.imagen,
      nombre: this.prodSeleccionado.nombre,
      cantidad: cantidadEmpaques, 
      metraje: mReal,
      precio: precio,
      subtotal: subtotal
    };

    this.carritoCotizacion.push(nuevoItem);
    localStorage.setItem('carrito_temporal', JSON.stringify(this.carritoCotizacion));
    
    (window as any).$('#calculadoraModal').modal('hide');
    alert("✅ Producto agregado a tu carrito. Ve a 'Cotizar' para confirmar la compra.");
  }

  getImagenUrl(imagen: string | undefined): string {
      if (!imagen) return 'assets/imagenes/logo.jpg'; 
      if (imagen.startsWith('http')) return imagen; 
      if (imagen.startsWith('data:image')) return imagen; 
      return 'assets/' + imagen; 
  }

  // 🔥 NUEVA LÓGICA VISTA EN AMBIENTE CON FLECHAS 🔥
  verEnSala(prod: any) {
    this.prodVistaSala = prod;
    this.mostrandoSala = true; // Por defecto mostramos la foto del ambiente (sala)
    
    const rutaBase = prod.imagenSala ? prod.imagenSala : prod.imagen;
    this.imagenSala = this.getImagenUrl(rutaBase);
    
    (window as any).$ && (window as any).$('#modalSala').modal('show');
  }

  cambiarVistaImagen() {
    this.mostrandoSala = !this.mostrandoSala;
  }
  // 🔥 ============================================== 🔥

  prepararCalculadora(prod: any) {
    this.prodSeleccionado = prod;
    this.metrosSolicitados = null;
    this.costoTotal = ''; this.cajasLlevar = ''; this.metrosReales = ''; this.unidadesTotales = '';

    const cod = prod.codigo || '';

    if (cod.includes('PEG')) {
        this.lblPregunta = '¿Cuántos m² necesitas enchapar?';
        this.lblRendimiento = 'Rendimiento Aprox (m²):';
        this.lblResultadoEmpaque = 'SACOS A LLEVAR:';
        this.mostrarPiezas = false; 
    } else if (cod.includes('BANO') || cod.includes('OVA') || cod.includes('LAP')) {
        this.lblPregunta = '¿Cuántas unidades necesitas?';
        this.lblRendimiento = 'Unidad:';
        this.lblResultadoEmpaque = 'UNIDADES A LLEVAR:';
        this.mostrarPiezas = false;
    } else {
        this.lblPregunta = '¿Cuántos metros cuadrados (m²) necesitas?';
        this.lblRendimiento = 'Rendimiento Caja:';
        this.lblResultadoEmpaque = 'CAJAS A LLEVAR (Aprox):';
        this.mostrarPiezas = true;
    }
  }

  calcularTotal() {
    if (!this.prodSeleccionado || !this.metrosSolicitados || this.metrosSolicitados <= 0) {
      alert("Por favor, ingresa una cantidad válida."); return;
    }
    
    const cod = this.prodSeleccionado.codigo || '';
    const precio = this.prodSeleccionado.precio || 0;
    
    const isPeg = cod.includes('PEG');
    const isUnd = cod.includes('BANO') || cod.includes('OVA') || cod.includes('LAP');

    if (isUnd) {
        const cantidad = Math.ceil(this.metrosSolicitados); 
        this.costoTotal = "S/ " + (cantidad * precio).toFixed(2);
        this.cajasLlevar = cantidad + " Unidades";
        this.metrosReales = "-"; 
        return;
    }

    const rend = this.prodSeleccionado.rendimientoCaja || (isPeg ? 4 : 1);
    const unid = this.prodSeleccionado.unidadesPorCaja || (cod.includes('POR') ? 4 : 10); 
    const cantidadEmpaques = Math.ceil(this.metrosSolicitados / rend);
    const mReal = (cantidadEmpaques * rend).toFixed(2);

    if (isPeg) {
        this.costoTotal = "S/ " + (cantidadEmpaques * precio).toFixed(2);
        this.cajasLlevar = cantidadEmpaques + " Sacos";
        this.metrosReales = mReal + " m² aprox";
    } else {
        this.costoTotal = "S/ " + (parseFloat(mReal) * precio).toFixed(2);
        this.cajasLlevar = cantidadEmpaques + " Cajas";
        this.metrosReales = mReal + " m²";
        this.unidadesTotales = (cantidadEmpaques * unid) + " Pzas";
    }
  }

  toggleChat() { this.chatVisible = !this.chatVisible; }
  
  enviarWhatsApp(mensaje: string) {
    const url = `https://wa.me/51978875748?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }
  
  enviarMensajeEscrito(event: Event) {
    event.preventDefault(); 
    const input = document.getElementById('chat-input') as HTMLInputElement;
    if (input?.value.trim()) { this.enviarWhatsApp(input.value); input.value = ''; }
  }
  
  toggleHotspot(idCard: string, event: Event) {
    event.stopPropagation();

    const cards = document.querySelectorAll('.hotspot-card');
    cards.forEach(c => {
       if(c.id !== 'card-' + idCard) (c as HTMLElement).style.display = 'none';
    });

    const card = document.getElementById('card-' + idCard);
    if (card) card.style.display = (card.style.display === 'block') ? 'none' : 'block';
  }
  
  cerrarSesion() {
    localStorage.removeItem('clienteLogueado');
    localStorage.removeItem('clienteNombre');
    localStorage.removeItem('clienteDNI');
    
    this.verificarSesion(); 
    this.cdr.detectChanges();
    alert("Has cerrado sesión exitosamente. Vuelve pronto.");
  }
}