import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientoService } from '../../services/movimiento.service';
import { MovimientoInventario } from '../../models/movimiento.model';

@Component({
  selector: 'app-admin-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-movimientos.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminMovimientosComponent implements OnInit {

  movimientos: MovimientoInventario[] = [];
  movimientosFiltrados: MovimientoInventario[] = [];
  busqueda: string = '';

  constructor(
    private movimientoService: MovimientoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarLista();
  }

  cargarLista() {
    this.movimientoService.listar().subscribe({
      next: (data) => {
        // Ordenamos para ver el último movimiento primerito
        this.movimientos = data.sort((a, b) => b.idMovimiento - a.idMovimiento);
        this.movimientosFiltrados = [...this.movimientos];
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  filtrar() {
    const term = this.busqueda.toLowerCase().trim();
    if (!term) {
      this.movimientosFiltrados = [...this.movimientos];
    } else {
      this.movimientosFiltrados = this.movimientos.filter(m => 
        m.producto?.nombre?.toLowerCase().includes(term) ||
        m.motivo?.toLowerCase().includes(term) ||
        m.tipo?.toLowerCase().includes(term)
      );
    }
  }
}