import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { QuoteService } from '../../services/quote.service';
import { Cotizacion } from '../../models/quote.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'] // Si no tienes este archivo CSS, puedes borrar esta línea
})
export class AdminDashboardComponent implements OnInit {

  totalVentas: number = 0;
  productosBajos: number = 0;
  totalClientes: number = 0;
  montoPendiente: number = 0;
  topProductos: any[] = []; // Aquí guardaremos el ranking

  ultimasCotizaciones: Cotizacion[] = [];

  constructor(
    private http: HttpClient, 
    private quoteService: QuoteService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarActividadReciente();
  }

  cargarResumen() {
    this.http.get<any>('https://estimcenter.onrender.com/rest/dashboard/resumen').subscribe({
      next: (data) => {
        // Mapeo exacto basado en tu ResumenDTO.java
        this.totalVentas = data.totalVentas;
        this.montoPendiente = data.montoCotizado;
        this.productosBajos = data.cantidadProductosBajos;
        this.totalClientes = data.totalClientes;
        
        // 🔥 AQUÍ CONECTAMOS EL RANKING
        this.topProductos = data.topProductos; 
        
        this.cd.detectChanges();
      },
      error: (e) => console.error('Error dashboard:', e)
    });
  }

  cargarActividadReciente() {
    this.quoteService.listar().subscribe({
      next: (data) => {
        this.ultimasCotizaciones = data.sort((a, b) => (b.idCotizacion || 0) - (a.idCotizacion || 0)).slice(0, 5);
        this.cd.detectChanges();
      }
    });
  }
}