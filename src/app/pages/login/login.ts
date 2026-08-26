import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  loginNombre: string = '';
  loginCelular: string = '';

  soloNumeros(event: any) {
    this.loginCelular = event.target.value.replace(/[^0-9]/g, '');
  }

  soloLetras(event: any) {
    let valor = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    this.loginNombre = valor.replace(/\s{2,}/g, ' '); 
  }

  ingresarMagico() {
    const nom = this.loginNombre.trim();
    const cel = this.loginCelular.trim();

    if (!nom || !cel) return alert("⚠️ Por favor, llena tu Nombre y tu Celular.");
    if (cel.length !== 9) return alert("⚠️ El celular debe tener 9 dígitos.");
    if (nom.length < 3) return alert("⚠️ Por favor, ingresa un nombre válido.");

    // Consultar si el cliente ya existe
    this.http.get<any[]>('https://estimcenter.onrender.com/rest/cliente/listar').subscribe({
      next: (clientes) => {
        const clienteExistente = clientes.find(c => c.telefono === cel || c.numDoc === cel);
        
        if (clienteExistente) {
          // ✅ El cliente existe: Solo iniciamos sesión
          this.iniciarSesion(clienteExistente.nombreCompleto, clienteExistente.numDoc);
        } else {
          // 🆕 El cliente no existe: Lo registramos en silencio
          const nuevoCliente = {
            tipoDoc: "CEL",
            numDoc: cel, // Usamos el celular como documento de identidad
            nombreCompleto: nom,
            telefono: cel,
            email: "cliente@whatsapp.com", 
            password: cel, 
            descriptorFacial: "[]", 
            direcciones: [{ direccion: "Pendiente", ciudad: "Por Defecto", referencia: "-" }]
          };

          this.http.post('https://estimcenter.onrender.com/rest/cliente/registrar-ia', nuevoCliente, {responseType: 'text'}).subscribe({
            next: () => this.iniciarSesion(nom, cel),
            error: () => alert("❌ Error al crear tu acceso rápido.")
          });
        }
      },
      error: () => alert("❌ Error de conexión con el servidor.")
    });
  }

  iniciarSesion(nombre: string, dniOCel: string) {
    localStorage.removeItem('adminLogueado'); 
    localStorage.setItem('clienteLogueado', 'true');
    localStorage.setItem('clienteNombre', nombre);
    localStorage.setItem('clienteDNI', dniOCel);
    
    // Lo regresamos a cotizar; el ngOnInit de cotizar se encargará de recuperar el carrito
    this.router.navigate(['/cotizar']);
  }
}