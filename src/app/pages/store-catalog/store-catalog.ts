import { Component, OnInit, ChangeDetectorRef, HostListener, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 
import { ProductService } from '../../services/product.service'; 
import { Producto } from '../../models/product.model'; 

@Component({
  selector: 'app-store-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './store-catalog.html',
  styleUrls: ['./store-catalog.css']
})
export class StoreCatalogComponent implements OnInit {
  
  // Categorías
  decorados: Producto[] = [];
  decoradosEspanoles: Producto[] = [];
  paredes: Producto[] = [];
  fachaletas: Producto[] = [];
  porcelanatos: Producto[] = [];
  planchas: Producto[] = [];
  ceramicos: Producto[] = [];
  lapices: Producto[] = [];
  banos: Producto[] = [];
  pegamentos: Producto[] = [];
  
  // Variables de Calculadora
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

  // Etiquetas de UI
  lblPregunta: string = '¿Cuántos metros cuadrados (m²) necesitas?';
  lblRendimiento: string = 'Rendimiento:';
  lblResultadoEmpaque: string = 'CAJAS A LLEVAR:';
  mostrarPiezas: boolean = true;

  // Usuario y Chat
  nombreCliente: string = '';
  clienteLogueado: boolean = false;
  chatVisible: boolean = false;

  // Búsqueda y Carrito
  todosLosProductos: Producto[] = [];
  productosBuscados: Producto[] = [];
  terminoBusqueda: string = '';
  modalBuscadorVisto: boolean = false;
  carritoCotizacion: any[] = [];

  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor(private productService: ProductService) {}

  @HostListener('window:focus')
  onWindowFocus() {
    this.verificarSesion();
  }

  ngOnInit(): void { 
    if (localStorage.getItem('producto_a_enfocar')) {
        this.modalBuscadorVisto = true;
    }

    this.verificarSesion();
    this.cargarCatalogo(); 
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
    this.cdr.detectChanges();
  }

  cerrarSesion() {
    localStorage.removeItem('clienteLogueado');
    localStorage.removeItem('clienteNombre');
    localStorage.removeItem('clienteDNI');
    this.verificarSesion();
    alert("Has cerrado sesión exitosamente.");
  }

  cargarCatalogo() {
    this.productService.listarProductos().subscribe({
      next: (data: any[]) => { 
        const activos = data.filter(p => p.estado !== 'INACTIVO');
        this.todosLosProductos = activos;

        this.decorados = activos.filter(p => p.codigo && p.codigo.includes('DEC') && !p.codigo.includes('ESPDEC'));
        this.decoradosEspanoles = activos.filter(p => p.codigo && p.codigo.includes('ESPDEC'));
        this.paredes = activos.filter(p => p.codigo && p.codigo.includes('PAR'));
        this.fachaletas = activos.filter(p => p.codigo && p.codigo.includes('FACH'));
        this.porcelanatos = activos.filter(p => p.codigo && p.codigo.includes('POR'));
        this.planchas = activos.filter(p => p.codigo && p.codigo.includes('PLAN'));
        this.ceramicos = activos.filter(p => p.codigo && p.codigo.includes('CER'));
        this.lapices = activos.filter(p => p.codigo && p.codigo.includes('LAP'));
        this.banos = activos.filter(p => p.codigo && (p.codigo.includes('BANO') || p.codigo.includes('OVA')));
        this.pegamentos = activos.filter(p => p.codigo && p.codigo.includes('PEG')); 
        
        this.cdr.detectChanges(); 
        
        const productoEnfocar = localStorage.getItem('producto_a_enfocar');

        if (productoEnfocar) {
            setTimeout(() => {
                const elemento = document.getElementById('prod-' + productoEnfocar);
                if (elemento) {
                    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const tarjeta = elemento.querySelector('.thumbnail') as HTMLElement;
                    if (tarjeta) {
                        tarjeta.style.transition = 'all 0.5s ease';
                        tarjeta.style.boxShadow = '0 0 25px 5px rgba(255, 140, 0, 0.8)';
                        tarjeta.style.transform = 'scale(1.03)';
                        
                        setTimeout(() => {
                            tarjeta.style.boxShadow = '';
                            tarjeta.style.transform = '';
                        }, 2500);
                    }
                }
                localStorage.removeItem('producto_a_enfocar'); 
            }, 600); 
        } else if (!this.modalBuscadorVisto) {
            setTimeout(() => {
                this.abrirBuscador();
            }, 1000);
            this.modalBuscadorVisto = true;
        }
      }
    });
  }

  abrirBuscador() {
    this.terminoBusqueda = '';
    this.productosBuscados = [];
    (window as any).$('#modalBienvenidaBuscador').modal('show');
  }

  buscarProducto() {
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

  seleccionarBusqueda(prod: any) {
    (window as any).$('#modalBienvenidaBuscador').modal('hide');
    setTimeout(() => {
        const elemento = document.getElementById('prod-' + prod.codigo);
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const tarjeta = elemento.querySelector('.thumbnail') as HTMLElement;
            if (tarjeta) {
                tarjeta.style.transition = 'all 0.5s ease';
                tarjeta.style.boxShadow = '0 0 25px 5px rgba(255, 140, 0, 0.6)';
                tarjeta.style.transform = 'scale(1.03)';
                
                setTimeout(() => {
                    tarjeta.style.boxShadow = '';
                    tarjeta.style.transform = '';
                }, 2000);
            }
        }
    }, 400); 
  }

  getImagenUrl(imagen: string | undefined): string {
      if (!imagen) return 'assets/imagenes/logo.jpg'; 
      if (imagen.startsWith('http')) return imagen; 
      if (imagen.startsWith('data:image')) return imagen; 
      return 'assets/' + imagen; 
  }

  verEnSala(prod: any) {
    this.prodVistaSala = prod;
    this.mostrandoSala = true; 
    
    const rutaBase = prod.imagenSala ? prod.imagenSala : prod.imagen;
    this.imagenSala = this.getImagenUrl(rutaBase);
    
    (window as any).$ && (window as any).$('#modalSala').modal('show');
  }

  cambiarVistaImagen() {
    this.mostrandoSala = !this.mostrandoSala;
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
    } 
    // 🔥 AQUÍ AGREGAMOS 'DEC' A LA FAMILIA DE LAS UNIDADES 🔥
    else if (cod.includes('BANO') || cod.includes('OVA') || cod.includes('LAP') || cod.includes('DEC')) {
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

    setTimeout(() => {
        document.body.classList.add('modal-open');
    }, 500);
  }

  calcularTotal() {
    if (!this.prodSeleccionado || !this.metrosSolicitados || this.metrosSolicitados <= 0) {
      alert("Por favor, ingresa una cantidad válida."); return;
    }
    
    const cod = this.prodSeleccionado.codigo || '';
    const precio = this.prodSeleccionado.precio || 0;
    
    const isPeg = cod.includes('PEG');
    // 🔥 TAMBIÉN LE DECIMOS AL CÁLCULO QUE 'DEC' ES UNIDAD 🔥
    const isUnd = cod.includes('BANO') || cod.includes('OVA') || cod.includes('LAP') || cod.includes('DEC');

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
    // 🔥 Y FINALMENTE AQUÍ TAMBIÉN AGREGAMOS 'DEC' 🔥
    const isUnd = cod.includes('BANO') || cod.includes('OVA') || cod.includes('LAP') || cod.includes('DEC');
    
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
}