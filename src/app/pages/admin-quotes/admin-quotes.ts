import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- Necesario para el buscador
import { QuoteService } from '../../services/quote.service';
import { Cotizacion } from '../../models/quote.model';

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './admin-quotes.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminQuotesComponent implements OnInit {

  cotizaciones: Cotizacion[] = [];
  cotizacionesFiltradas: Cotizacion[] = []; // <-- Arreglo auxiliar para la búsqueda
  busqueda: string = '';

  constructor(
    private quoteService: QuoteService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarLista();
  }

  cargarLista() {
    this.quoteService.listar().subscribe(data => {
      // 🔥 SOLUCIÓN TS18048: Le ponemos "|| 0" para que TypeScript no llore por los undefined
      this.cotizaciones = data.sort((a, b) => (b.idCotizacion || 0) - (a.idCotizacion || 0));
      this.cotizacionesFiltradas = [...this.cotizaciones];
      this.cd.detectChanges(); 
    });
  }

  // Lógica del buscador en tiempo real
  filtrar() {
    const term = this.busqueda.toLowerCase().trim();
    if (!term) {
      this.cotizacionesFiltradas = [...this.cotizaciones];
    } else {
      this.cotizacionesFiltradas = this.cotizaciones.filter(c => 
        (c.codigo && c.codigo.toLowerCase().includes(term)) ||
        (c.cliente?.nombreCompleto && c.cliente.nombreCompleto.toLowerCase().includes(term)) ||
        (c.cliente?.numDoc && c.cliente.numDoc.includes(term))
      );
    }
  }

  // 🔥 Tu misma función exacta, solo reiniciando el buscador al borrar
  eliminarCotizacion(id?: number) {
    if (!id) return;

    if (confirm('¿Estás seguro de eliminar esta cotización?')) {
      this.quoteService.eliminar(id).subscribe({
        next: () => {
          alert('Cotización eliminada correctamente.');
          this.busqueda = ''; // Limpiamos buscador
          this.cargarLista();
        },
        error: (err) => {
          if (err.status === 400 && err.error) {
              alert('⚠️ ' + err.error); 
          } else if (err.status === 200) {
              alert('🗑️ Cotización eliminada correctamente.');
              this.busqueda = ''; // Limpiamos buscador
              this.cargarLista();
          } else {
              alert('❌ Error al intentar eliminar la cotización.');
          }
        }
      });
    }
  }
}