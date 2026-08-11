import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent {
  email: string = '';
  pass: string = '';
  mensajeError: string = '';
  cargando: boolean = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  iniciarSesion() {
    if (!this.email || !this.pass) {
      this.mensajeError = 'Por favor, llena todos los campos.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    const credenciales = { email: this.email, password: this.pass };

    this.http.post<any>('https://estimcenter.onrender.com/rest/usuario/login', credenciales).subscribe({
      next: (usuarioBD) => {
        localStorage.removeItem('clienteLogueado');
        localStorage.removeItem('clienteNombre');
        localStorage.removeItem('clienteDNI');

        localStorage.setItem('adminLogueado', 'true');
        localStorage.setItem('adminNombre', `${usuarioBD.nombre} ${usuarioBD.apellido}`);
        localStorage.setItem('adminRol', usuarioBD.rol.nombre); 
        
        this.cargando = false;
        this.router.navigate(['/admin']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false; 

        if (err.status === 401) {
          this.mensajeError = 'Correo o contraseña incorrectos.';
        } else if (err.status === 403) {
          this.mensajeError = 'Usuario inactivo. Contacte al administrador.';
        } else if (err.status === 0) {
          this.mensajeError = 'No hay conexión con el servidor backend.';
        } else {
          this.mensajeError = 'Error al validar credenciales.';
        }
        
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}