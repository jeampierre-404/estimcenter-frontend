import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './admin-employees.html',
  styleUrls: ['./admin-employees.css']
})
export class AdminEmployeesComponent implements OnInit {
  empleados: any[] = [];
  
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // 🔥 INYECTAMOS EL DETECTOR DE CAMBIOS

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    this.http.get<any[]>('https://estimcenter.onrender.com/rest/usuario/listar').subscribe({
      next: (data) => {
        this.empleados = data;
        this.cdr.detectChanges(); // 🔥 Despertamos a Angular para que pinte la tabla
      },
      error: (err) => {
        console.error("Error cargando empleados", err);
        this.cdr.detectChanges();
      }
    });
  }

  eliminarEmpleado(id: number) {
    if (confirm('¿Estás seguro de eliminar a este empleado?')) {
      // 🔥 Le decimos a Angular que espere un texto como respuesta, no un JSON
      this.http.delete(`https://estimcenter.onrender.com/rest/usuario/borrar/${id}`, { responseType: 'text' }).subscribe({
        next: (respuesta) => {
          if (respuesta === 'eliminado') {
            alert('🗑️ El empleado fue eliminado definitivamente del sistema.');
          } else if (respuesta === 'inactivado') {
            alert('⚠️ El empleado tiene historial registrado. Ha sido INACTIVADO para proteger los datos.');
          }
          this.cargarEmpleados(); 
        },
        error: (err) => {
          console.error("Error al borrar", err);
          alert('Error al intentar procesar la solicitud.');
          this.cdr.detectChanges();
        }
      });
    }
  }
}