import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuoteService } from '../../services/quote.service';
import { Cotizacion, DetalleCotizacion } from '../../models/quote.model';
import { MetodoPagoService, MetodoPago } from '../../services/metodo-pago.service'; 

@Component({
  selector: 'app-admin-quote-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-quote-detail.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminQuoteDetailComponent implements OnInit {

  cotizacion: Cotizacion | null = null;
  detalles: DetalleCotizacion[] = [];
  ventaData: any = null; 
  
  mostrarModal: boolean = false;
  metodosPago: MetodoPago[] = [];
  metodoSeleccionado: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private quoteService: QuoteService,
    private metodoPagoService: MetodoPagoService, 
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    
    if (id) {
      this.quoteService.obtener(id).subscribe(data => {
        this.cotizacion = data;
        
        if (this.cotizacion.estado === 'FACTURADO') {
            this.quoteService.obtenerVenta(id).subscribe(venta => {
                this.ventaData = venta;
                this.cd.detectChanges();
            });
        }
        
        this.cd.detectChanges();
      });

      this.quoteService.listarDetalles(id).subscribe(data => {
        this.detalles = data;
        this.cd.detectChanges();
      });
    }

    this.cargarMetodosPago();
  }

  cargarMetodosPago() {
    this.metodoPagoService.listarMetodos().subscribe({
      next: (data) => {
        this.metodosPago = data;
      },
      error: (e) => console.error(e)
    });
  }

  abrirModalPago() {
    this.mostrarModal = true;
    this.metodoSeleccionado = null; 
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  seleccionarMetodo(idMetodo: number) {
    this.metodoSeleccionado = idMetodo;
  }

  procesarVentaFinal() {
    if (!this.cotizacion || !this.cotizacion.idCotizacion || !this.metodoSeleccionado) return;

    const idParaFacturar = this.cotizacion.idCotizacion;

    this.quoteService.facturar(idParaFacturar, this.metodoSeleccionado).subscribe({ 
      next: () => {
        alert('¡Venta registrada con éxito!');
        this.cerrarModal();
        
        this.quoteService.obtener(idParaFacturar).subscribe(data => {
            this.cotizacion = data;
            this.quoteService.obtenerVenta(idParaFacturar).subscribe(venta => {
                this.ventaData = venta;
                this.cd.detectChanges();
            });
        });

      },
      error: (err) => {
        let mensajeReal = 'Error desconocido.';

        if (typeof err.error === 'string') {
            mensajeReal = err.error; 
        } else if (err.error && err.error.message) {
            mensajeReal = err.error.message; 
        } else if (err.message) {
            mensajeReal = err.message; 
        }

        alert('NO SE PUDO COBRAR:\n' + mensajeReal);
        this.cerrarModal();
      }
    });
  }

  eliminarCotizacion() {
    if (!this.cotizacion || !this.cotizacion.idCotizacion) return;

    if (confirm('¿Estás seguro de anular y eliminar esta cotización?')) {
      this.quoteService.eliminar(this.cotizacion.idCotizacion).subscribe({
        next: () => {
          alert('Cotización eliminada con éxito.');
          this.router.navigate(['/admin/cotizaciones']);
        },
        error: (err) => {
          if (err.status === 400 && err.error) {
              alert('⚠️ ' + err.error);
          } else if (err.status === 200) {
              alert('🗑️ Cotización eliminada con éxito.');
              this.router.navigate(['/admin/cotizaciones']);
          } else {
              alert('❌ Error al intentar eliminar la cotización.');
          }
        }
      });
    }
  }
}