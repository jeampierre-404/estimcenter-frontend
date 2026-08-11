import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 
import { ProductService } from '../../services/product.service';
import { Producto } from '../../models/product.model';

@Component({
  selector: 'app-cotizador',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterModule],
  templateUrl: './cotizador.html',
  styleUrls: ['./cotizador.css']
})
export class CotizadorComponent implements OnInit {

  chatVisible: boolean = false;
  
  toggleChat() { this.chatVisible = !this.chatVisible; }

  enviarWhatsAppChat(mensaje: string) {
    const url = `https://wa.me/51978875748?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  enviarMensajeEscrito(event: Event) {
    event.preventDefault(); 
    const input = document.getElementById('chat-input') as HTMLInputElement;
    if (input?.value.trim()) { 
      this.enviarWhatsAppChat(input.value); 
      input.value = ''; 
    }
  }

  private router = inject(Router);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient); 

  productosCatalogo: Producto[] = [];
  productosFiltrados: Producto[] = [];
  busqueda: string = '';

  // 🔥 Variables para la Búsqueda Predictiva Integrada 🔥
  terminoBusqueda: string = '';
  productosBuscados: Producto[] = [];

  itemsCotizados: any[] = [];
  total: number = 0;
  fecha: string = new Date().toLocaleDateString();

  prodSeleccionado: Producto | null = null;
  modoCalculo: 'cajas' | 'metraje' = 'cajas';
  cantidadInput: number = 1;
  cajasReales: number = 1;
  metrajeReal: string = '0.00';
  subtotalModal: number = 0;

  nombreCliente: string = '';
  dniCliente: string = '';
  clienteLogueado: boolean = false;

  ngOnInit() {
    this.verificarSesion();
    this.cargarProductosReales();

    // 🔥 RECUPERAMOS EL CARRITO DEL CATÁLOGO AL ENTRAR A COTIZAR 🔥
    const carritoGuardado = localStorage.getItem('carrito_temporal');
    if (carritoGuardado) {
      const items = JSON.parse(carritoGuardado);
      this.itemsCotizados = [...this.itemsCotizados, ...items];
      this.actualizarTotal();
      localStorage.removeItem('carrito_temporal'); // Lo limpiamos para no duplicar si recarga
    }
  }

  verificarSesion() {
    this.clienteLogueado = localStorage.getItem('clienteLogueado') === 'true';
    if (this.clienteLogueado) {
      this.nombreCliente = localStorage.getItem('clienteNombre') || '';
      this.dniCliente = localStorage.getItem('clienteDNI') || '';
    }
  }

  cargarProductosReales() {
    this.productService.listarProductos().subscribe({
      next: (data) => {
        this.productosCatalogo = data.filter(p => p.estado !== 'INACTIVO');
        this.productosFiltrados = [...this.productosCatalogo];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  getImagenUrl(imagen: string | undefined): string {
      if (!imagen) return 'assets/imagenes/logo.jpg'; 
      if (imagen.startsWith('http')) return imagen; 
      if (imagen.startsWith('data:image')) return imagen; 
      return 'assets/' + imagen; 
  }

  // Búsqueda Clásica (Panel Izquierdo)
  filtrar() {
    const term = this.busqueda.toLowerCase().trim();
    this.productosFiltrados = this.productosCatalogo.filter(p => 
      p.nombre.toLowerCase().includes(term)
    );
  }

  // 🔥 FUNCIONES DE LA BÚSQUEDA PREDICTIVA (MODAL EMERGENTE) 🔥
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
    this.productosBuscados = this.productosCatalogo.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(term)) ||
        (p.codigo && p.codigo.toLowerCase().includes(term)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
    ).slice(0, 6);
  }

  // 🔥 CORRECCIÓN: REDIRECCIÓN HACIA EL CATÁLOGO 🔥
  seleccionarBusquedaPred(prod: any) {
    (window as any).$('#modalBienvenidaBuscador').modal('hide');
    
    setTimeout(() => {
        // Guardamos el producto y "viajamos" a la página del Catálogo
        localStorage.setItem('producto_a_enfocar', prod.codigo);
        this.router.navigate(['/catalogo']);
    }, 400); 
  }
  // 🔥 ===================================== 🔥

  seleccionarProducto(p: Producto) {
    this.prodSeleccionado = p;
    this.modoCalculo = 'cajas';
    this.cantidadInput = 1;
    this.calcularResumenModal();
    (window as any).$('#modalSeleccion').modal('show');
  }

  alternarModo() {
    this.modoCalculo = (this.modoCalculo === 'cajas') ? 'metraje' : 'cajas';
    this.calcularResumenModal();
  }

  calcularResumenModal() {
    if (!this.prodSeleccionado) return;
    const rend = this.prodSeleccionado.rendimientoCaja || 1.00; 
    
    if (this.modoCalculo === 'cajas') {
      this.cajasReales = this.cantidadInput || 0;
      this.metrajeReal = (this.cajasReales * rend).toFixed(2);
    } else {
      const m2Deseados = this.cantidadInput || 0;
      this.cajasReales = Math.ceil(m2Deseados / rend);
      this.metrajeReal = (this.cajasReales * rend).toFixed(2);
    }

    if (this.prodSeleccionado.unidadMedida === 'm2') {
      this.subtotalModal = parseFloat(this.metrajeReal) * this.prodSeleccionado.precio;
    } else {
      this.subtotalModal = this.cajasReales * this.prodSeleccionado.precio;
    }
  }

  agregarAProforma() {
    if (!this.prodSeleccionado) return;
    this.itemsCotizados.push({
      productoOriginal: this.prodSeleccionado, 
      img: this.prodSeleccionado.imagen,
      nombre: this.prodSeleccionado.nombre,
      cantidad: this.cajasReales + (this.prodSeleccionado.codigo?.includes('PEG') ? ' Sacos' : ' Cajas'),
      metraje: this.metrajeReal,
      precio: this.prodSeleccionado.precio,
      subtotal: this.subtotalModal
    });
    this.actualizarTotal();
    (window as any).$('#modalSeleccion').modal('hide');
  }

  actualizarTotal() {
    this.total = this.itemsCotizados.reduce((acc, item) => acc + item.subtotal, 0);
  }

  eliminarFila(index: number) {
    this.itemsCotizados.splice(index, 1);
    this.actualizarTotal();
  }

  soloGuardar() {
    if (this.itemsCotizados.length === 0) {
      alert("⚠️ Agrega al menos un producto a la proforma antes de guardar.");
      return;
    }
    
    if (!this.clienteLogueado) {
      alert("⚠️ ¡Casi listo! Por favor, inicia sesión para poder guardar tu cotización.");
      this.router.navigate(['/login']);
      return;
    }
    
    this.guardarEnHistorial();
    alert("✅ ¡Proforma guardada con éxito en 'Mis Cotizaciones'!");
    
    this.itemsCotizados = []; 
    this.actualizarTotal();
    this.router.navigate(['/pedidos']);
  }

  enviarWhatsapp() {
    if (this.itemsCotizados.length === 0) {
      alert("⚠️ La proforma está vacía. Agrega productos primero.");
      return;
    }
    
    const numero = "51978875748"; 
    
    let msg = `Hola *ESTIM CENTER FJ*, deseo cotizar:\n\n`;
    this.itemsCotizados.forEach((it, i) => {
      msg += `*${i+1}. ${it.nombre}* | Cant: ${it.cantidad} | S/ ${it.subtotal.toFixed(2)}\n`;
    });
    msg += `\n*TOTAL: S/ ${this.total.toFixed(2)}*`;
    
    this.guardarEnHistorial('Guardado');
    
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');

    this.itemsCotizados = [];
    this.actualizarTotal();
  }

  comprarPedido() {
    if (this.itemsCotizados.length === 0) {
      alert("⚠️ Agrega al menos un producto antes de comprar.");
      return;
    }

    if (!this.clienteLogueado) {
      alert("⚠️ ¡Casi listo! Por favor, inicia sesión para procesar tu compra y enviarla a la tienda.");
      this.router.navigate(['/login']);
      return;
    }

    if (!confirm('¿Deseas enviar oficialmente esta cotización para que la tienda la procese?')) return;

    const dniLocal = localStorage.getItem('clienteDNI');
    if (!dniLocal) {
        alert("Error: No se encontró tu DNI. Por favor inicia sesión nuevamente.");
        return;
    }

    this.http.get<any[]>('https://estimcenter.onrender.com/rest/cliente/listar').subscribe({
        next: (clientes) => {
            let clienteBD = clientes.find(c => c.numDoc === dniLocal);
            if (!clienteBD && clientes.length > 0) clienteBD = clientes[0]; 

            if (!clienteBD) {
                alert("❌ No hay clientes en la Base de Datos para asociar este pedido.");
                return;
            }

            const detallesDTO = this.itemsCotizados.map((d: any) => ({
                producto: d.productoOriginal || { idProducto: 1 }, 
                cantidad: parseInt(d.cantidad) || 1, 
                precioHistorico: d.precio,
                importe: d.subtotal
            }));

            const cotizacionDTO = {
                cotizacion: {
                    codigo: "PED-" + Math.floor(Math.random() * 1000000),
                    fechaVencimiento: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    subtotal: this.total / 1.18,
                    igv: (this.total / 1.18) * 0.18,
                    total: this.total,
                    estado: 'PENDIENTE', 
                    cliente: clienteBD,
                    usuario: { idUsuario: 1 }
                },
                detalles: detallesDTO
            };

            this.http.post('https://estimcenter.onrender.com/rest/cotizacion/generar', cotizacionDTO, {responseType: 'text'}).subscribe({
                next: () => {
                    this.guardarEnHistorial('ENVIADO'); 
                    alert("✅ ¡Éxito! Tu pedido fue enviado a la Base de Datos del Administrador.");
                    this.itemsCotizados = [];
                    this.actualizarTotal();
                    this.router.navigate(['/pedidos']);
                },
                error: (err) => alert("⚠️ Error al registrar en la BD: " + (err.error || err.message))
            });
        },
        error: () => alert("❌ Error de conexión al buscar el cliente en la Base de Datos.")
    });
  }

  guardarEnHistorial(estadoPersonalizado: string = 'Guardado') {
    const data = localStorage.getItem('bd_pedidos_casa_decor');
    const historial = data ? JSON.parse(data) : [];
    const codigoGenerado = "PED-" + Math.floor(Math.random() * 1000000);

    const nuevoPedido = {
      id: codigoGenerado,
      usuario: this.nombreCliente || 'Invitado', 
      fecha: new Date().toLocaleString(),
      total: "S/ " + this.total.toFixed(2),
      estado: estadoPersonalizado,
      detalles: [...this.itemsCotizados]
    };
    
    historial.push(nuevoPedido);
    localStorage.setItem('bd_pedidos_casa_decor', JSON.stringify(historial));
  }

  cerrarSesion() {
    localStorage.removeItem('clienteLogueado');
    localStorage.removeItem('clienteNombre');
    localStorage.removeItem('clienteDNI');
    window.location.href = '/';
  }
}