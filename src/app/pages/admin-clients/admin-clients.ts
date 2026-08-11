import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Cliente } from '../../models/client.model';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-clients.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminClientsComponent implements OnInit {

  clientes: Cliente[] = [];

  constructor(
    private clientService: ClientService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.clientService.listar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cd.detectChanges();
      },
      error: (e) => console.error(e)
    });
  }

  eliminar(id: number) {
    if (confirm('¿Seguro que deseas eliminar a este cliente?')) {
      this.clientService.eliminar(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter(c => c.idCliente !== id);
          this.cd.detectChanges();
          alert('Cliente eliminado');
        },
        error: (e) => alert('Error al eliminar')
      });
    }
  }
}