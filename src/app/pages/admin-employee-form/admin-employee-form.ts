import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './admin-employee-form.html',
  styleUrls: ['./admin-employee-form.css'] 
})
export class AdminEmployeeFormComponent implements OnInit {
  
  empleado: any = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    estado: true,
    rol: { idRol: '' }
  };

  roles: any[] = [];
  isEditMode: boolean = false;
  cargando: boolean = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarRoles();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.cargarEmpleado(id);
    }
  }

  cargarRoles() {
    this.http.get<any[]>('https://estimcenter.onrender.com/rest/rol/listar').subscribe({
      next: (data) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  cargarEmpleado(id: string) {
    this.http.get<any>(`[https://estimcenter.onrender.com/rest](https://estimcenter.onrender.com/rest)/usuario/buscar/${id}`).subscribe({
      next: (data) => {
        this.empleado = data;
        if (!this.empleado.rol) {
          this.empleado.rol = { idRol: '' };
        }
        this.cdr.detectChanges();
      },
      error: () => {
        alert("Error al cargar los datos del empleado.");
        this.cdr.detectChanges();
      }
    });
  }

  guardar() {
    const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!this.empleado.nombre || !this.empleado.email || !this.empleado.password || !this.empleado.rol.idRol) {
      return alert("Por favor completa los campos obligatorios.");
    }

    if (!letrasRegex.test(this.empleado.nombre)) {
      return alert("El nombre solo debe contener letras.");
    }

    if (this.empleado.apellido && !letrasRegex.test(this.empleado.apellido)) {
      return alert("El apellido solo debe contener letras.");
    }

    this.cargando = true;
    this.cdr.detectChanges();

    if (this.isEditMode) {
      this.http.put(`[https://estimcenter.onrender.com/rest](https://estimcenter.onrender.com/rest)/usuario/editar/${this.empleado.idUsuario}`, this.empleado).subscribe({
        next: () => {
          alert("Empleado actualizado con éxito.");
          this.router.navigate(['/admin/empleados']);
        },
        error: () => {
          alert("Error al actualizar empleado.");
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.http.post('[https://estimcenter.onrender.com/rest](https://estimcenter.onrender.com/rest)/usuario/agregar', this.empleado).subscribe({
        next: () => {
          alert("Empleado registrado con éxito.");
          this.router.navigate(['/admin/empleados']);
        },
        error: () => {
          alert("Error al registrar empleado.");
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}   