import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { DespachoService } from '../../services/despacho.service';
import { Despacho } from '../../models/despacho.model';

@Component({
  selector: 'app-admin-despachos',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './admin-despachos.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminDespachosComponent implements OnInit {

  despachos: Despacho[] = [];
  despachosFiltrados: Despacho[] = []; 
  busqueda: string = ''; 

  constructor(
    private despachoService: DespachoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarLista();
  }

  cargarLista() {
    this.despachoService.listar().subscribe({
      next: (data) => {
        this.despachos = data.sort((a, b) => b.idDespacho - a.idDespacho);
        this.despachosFiltrados = [...this.despachos];
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  filtrar() {
    const term = this.busqueda.toLowerCase().trim();
    if (!term) {
      this.despachosFiltrados = [...this.despachos];
    } else {
      this.despachosFiltrados = this.despachos.filter(d => 
        d.idDespacho.toString().includes(term) ||
        d.venta?.cotizacion?.cliente?.nombreCompleto?.toLowerCase().includes(term) ||
        d.venta?.serieCorrelativo?.toLowerCase().includes(term)
      );
    }
  }

  cambiarEstado(id: number, nuevoEstado: string) {
    if (confirm(`¿Marcar este despacho como ${nuevoEstado}?`)) {
      this.despachoService.actualizarEstado(id, nuevoEstado).subscribe({
        next: () => {
          alert(`Despacho actualizado a ${nuevoEstado}`);
          this.cargarLista();
          this.busqueda = ''; 
        },
        error: () => {
          alert('Error al actualizar el estado.');
        }
      });
    }
  }
}