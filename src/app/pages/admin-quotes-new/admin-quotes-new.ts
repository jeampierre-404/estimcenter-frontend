import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ClientService } from '../../services/client.service';
import { QuoteService } from '../../services/quote.service';
import { Producto } from '../../models/product.model';
import { Cliente } from '../../models/client.model';
import { DetalleCotizacion, CotizacionDTO } from '../../models/quote.model';

@Component({
  selector: 'app-admin-quotes-new',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-quotes-new.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminQuotesNewComponent implements OnInit {

  productos: Producto[] = [];
  clientes: Cliente[] = [];
  textoCliente: string = '';
  textoProducto: string = '';
  cantidad: number = 1;
  fechaVencimiento: string = '';
  fechaMinima: string = '';
  carrito: DetalleCotizacion[] = [];
  totalSubtotal = 0;
  totalIgv = 0;
  totalFinal = 0;

  constructor(
    private productService: ProductService,
    private clientService: ClientService,
    private quoteService: QuoteService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    hoy.setDate(hoy.getDate() + 7);
    this.fechaVencimiento = hoy.toISOString().split('T')[0];
  }

  cargarDatos() {
    this.productService.listarProductos().subscribe(data => {
      this.productos = data.filter(p => p.estado !== 'INACTIVO');
      this.cd.detectChanges(); 
    });

    this.clientService.listar().subscribe(data => {
      this.clientes = data;
      this.cd.detectChanges(); 
    });
  }

  agregarAlCarrito() {
    if (!this.textoProducto) {
        alert("Debe seleccionar un producto.");
        return;
    }
    
    if (this.cantidad <= 0) {
        alert("La cantidad debe ser mayor a 0.");
        return;
    }

    const prod = this.productos.find(p => 
      this.textoProducto === `${p.nombre} - S/ ${p.precio}` || 
      p.nombre === this.textoProducto ||
      p.codigo === this.textoProducto
    );

    if (!prod) {
      alert("Producto no encontrado. Asegúrese de seleccionarlo de la lista desplegable.");
      return;
    }

    const existente = this.carrito.find(item => item.producto.idProducto === prod.idProducto);

    if (existente) {
        existente.cantidad += this.cantidad;
        existente.importe = existente.cantidad * existente.precioHistorico;
    } else {
        const nuevoDetalle: DetalleCotizacion = {
          producto: prod,
          cantidad: this.cantidad,
          precioHistorico: prod.precio,
          importe: prod.precio * this.cantidad
        };
        this.carrito.push(nuevoDetalle);
    }
    
    this.calcularTotales();
    this.textoProducto = ''; 
    this.cantidad = 1;
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    this.totalSubtotal = this.carrito.reduce((acc, item) => acc + item.importe, 0);
    this.totalIgv = this.totalSubtotal * 0.18; 
    this.totalFinal = this.totalSubtotal + this.totalIgv;
    this.cd.detectChanges(); 
  }

  guardarCotizacion() {
    if (!this.textoCliente) {
      alert('Por favor, seleccione un cliente.');
      return;
    }

    if (this.fechaVencimiento < this.fechaMinima) {
      alert('La fecha de vencimiento no puede ser menor a la fecha actual.');
      return;
    }
    
    if (this.carrito.length === 0) {
      alert('El carrito está vacío. Agregue productos antes de generar la cotización.');
      return;
    }

    const clienteObj = this.clientes.find(c => 
       this.textoCliente.includes(c.numDoc) || 
       this.textoCliente.includes(c.nombreCompleto)
    );

    if (!clienteObj) {
        alert("Cliente no válido. Debe seleccionarlo de la lista sugerida.");
        return;
    }

    const dto: CotizacionDTO = {
      cotizacion: {
        codigo: 'COT-' + Date.now().toString().slice(-6), 
        fechaVencimiento: this.fechaVencimiento,
        subtotal: this.totalSubtotal,
        igv: this.totalIgv,
        total: this.totalFinal,
        estado: 'PENDIENTE',
        cliente: clienteObj,
        usuario: { idUsuario: 1 } 
      },
      detalles: this.carrito
    };

    this.quoteService.generar(dto).subscribe({
      next: () => {
        alert('Cotización generada con éxito');
        this.router.navigate(['/admin/cotizaciones']); 
      },
      error: (e) => {
        alert('Error al guardar la cotización. Verifique la consola.');
      }
    });
  }
}