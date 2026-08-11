import { Component, OnInit, inject } from '@angular/core'; 
import { RouterOutlet, RouterModule, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule], 
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent implements OnInit {

  private router = inject(Router); // Inyectamos el enrutador para poder salir

  saludo: string = "Hola";
  menuAbierto: boolean = false; 

  // 🔥 VARIABLES PARA EL USUARIO LOGUEADO
  adminNombre: string = '';
  adminRol: string = '';
  adminIniciales: string = ''; // <--- NUEVA VARIABLE PARA EL AVATAR

  ngOnInit(): void {
    // 1. Leemos quién acaba de entrar desde el localStorage
    this.adminNombre = localStorage.getItem('adminNombre') || 'Administrador';
    this.adminRol = localStorage.getItem('adminRol') || 'SIN ROL';

    // 🔥 2. CALCULAR INICIALES (Ej: Jeampierre Ynga -> JY)
    const partesNombre = this.adminNombre.split(' ');
    const letra1 = partesNombre[0] ? partesNombre[0].charAt(0).toUpperCase() : 'A';
    const letra2 = partesNombre[1] ? partesNombre[1].charAt(0).toUpperCase() : '';
    this.adminIniciales = letra1 + letra2;

    this.calcularSaludo();
  }

  calcularSaludo() {
    const hour = new Date().getHours();
    
    // Extraemos solo el primer nombre para que el saludo sea más amigable
    const primerNombre = this.adminNombre.split(' ')[0];

    if (hour < 12) this.saludo = `Buenos días, ${primerNombre} ☀️`;
    else if (hour < 18) this.saludo = `Buenas tardes, ${primerNombre} ☕`;
    else this.saludo = `Buenas noches, ${primerNombre} 🌙`;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // 🔥 FUNCIÓN: Cerrar Sesión
  cerrarSesion() {
    // 1. Borramos la "llave" del localStorage
    localStorage.removeItem('adminLogueado');
    localStorage.removeItem('adminNombre');
    localStorage.removeItem('adminRol');

    // 2. Lo regresamos a la pantalla de Login
    this.router.navigate(['/admin/login']);
  }
}