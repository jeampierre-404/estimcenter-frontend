import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product.service'; 

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrls: ['./pedidos.css']
})
export class PedidosComponent implements OnInit {
  
  misPedidos: any[] = [];
  pedidoSeleccionado: any = null;
  chatVisible: boolean = false;

  nombreCliente: string = '';
  clienteLogueado: boolean = false;

  carritoCotizacion: any[] = [];
  todosLosProductos: any[] = [];
  productosBuscados: any[] = [];
  terminoBusqueda: string = '';

  prodSeleccionado: any = null;
  metrosSolicitados: number | null = null;
  costoTotal: string = '';
  cajasLlevar: string = '';
  metrosReales: string = '';
  unidadesTotales: string = '';
  lblPregunta: string = '¿Cuántos metros cuadrados (m²) necesitas?';
  lblRendimiento: string = 'Rendimiento:';
  lblResultadoEmpaque: string = 'CAJAS A LLEVAR:';
  mostrarPiezas: boolean = true;

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private productService = inject(ProductService);
  private router = inject(Router); 

  @HostListener('window:focus')
  onWindowFocus() {
    this.verificarSesion(); 
    this.cargarHistorial();
    this.cargarCarrito();
  }

  ngOnInit() {
    this.verificarSesion(); 
    this.cargarHistorial();
    this.cargarCarrito();
    this.cargarProductosBase();
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

  cargarHistorial() {
    const data = localStorage.getItem('bd_pedidos_casa_decor');
    const historialGlobal = data ? JSON.parse(data) : [];
    
    const usuarioActual = localStorage.getItem('clienteNombre') || 'Invitado';
    
    this.misPedidos = historialGlobal
      .filter((p: any) => p.usuario === usuarioActual)
      .reverse(); 
      
    this.cdr.detectChanges(); 
  }

  cargarCarrito() {
    const c = localStorage.getItem('carrito_temporal');
    if (c) {
        this.carritoCotizacion = JSON.parse(c);
    }
  }

  cargarProductosBase() {
    this.productService.listarProductos().subscribe({
      next: (data: any[]) => { 
        this.todosLosProductos = data.filter(p => p.estado !== 'INACTIVO');
      }
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

  // 🔥 REDIRECCIÓN HACIA EL CATÁLOGO 🔥
  seleccionarBusquedaPred(prod: any) {
    (window as any).$('#modalBienvenidaBuscador').modal('hide');
    
    setTimeout(() => {
        // Guardamos la intención de búsqueda y "viajamos" al catálogo
        localStorage.setItem('producto_a_enfocar', prod.codigo);
        this.router.navigate(['/catalogo']);
    }, 400); 
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

  verDetalle(p: any) {
    this.pedidoSeleccionado = p;
    (window as any).$('#modalDetallePedido').modal('show');
  }

  borrarPedido(id: string) {
    if (confirm('¿Deseas eliminar esta cotización de tu historial?')) {
      const data = localStorage.getItem('bd_pedidos_casa_decor');
      let historial = data ? JSON.parse(data) : [];
      
      historial = historial.filter((p: any) => p.id !== id);
      localStorage.setItem('bd_pedidos_casa_decor', JSON.stringify(historial));
      this.cargarHistorial(); 
    }
  }

  toggleChat() { 
    this.chatVisible = !this.chatVisible; 
  }

  enviarWhatsApp(mensaje: string) {
    const url = `https://wa.me/51978875748?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  enviarMensajeEscrito(event: Event) {
    event.preventDefault(); 
    const input = document.getElementById('chat-input') as HTMLInputElement;
    if (input?.value.trim()) { 
      this.enviarWhatsApp(input.value); 
      input.value = ''; 
    }
  }
  
  cerrarSesion() {
    localStorage.removeItem('clienteLogueado');
    localStorage.removeItem('clienteNombre');
    localStorage.removeItem('clienteDNI');
    alert("Sesión cerrada correctamente.");
    window.location.href = '/'; 
  }
}