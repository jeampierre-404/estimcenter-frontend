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

  isFlipped: boolean = false;
  terminosAceptados: boolean = false;

  // Variables Registro
  regDni: string = '';
  regNombre: string = '';
  regTelefono: string = '';
  regPass: string = ''; 
  
  // Variables Login
  loginDni: string = ''; 
  loginPass: string = ''; 

  girarPanel() {
    this.isFlipped = !this.isFlipped;
  }

  // 🔥 VALIDACIONES EN TIEMPO REAL (Filtros de escritura) 🔥
  soloNumerosLogin(event: any) {
    this.loginDni = event.target.value.replace(/[^0-9]/g, '');
  }

  soloNumerosRegDni(event: any) {
    this.regDni = event.target.value.replace(/[^0-9]/g, '');
  }

  soloNumerosRegCel(event: any) {
    this.regTelefono = event.target.value.replace(/[^0-9]/g, '');
  }

  soloLetrasNombre(event: any) {
    // Permite solo letras y un espacio simple entre palabras (elimina dobles espacios)
    let valor = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    this.regNombre = valor.replace(/\s{2,}/g, ' '); 
  }
  // 🔥 =================================================== 🔥

  consultarAPI() {
    const btn = document.getElementById('btnSearchDni') as HTMLButtonElement;
    if (btn) { btn.innerHTML = '...'; btn.disabled = true; }
    
    setTimeout(() => {
      const dniStr = this.regDni.trim();
      
      if (dniStr.length !== 8) {
          alert("El DNI debe tener exactamente 8 dígitos.");
          if (btn) { btn.innerHTML = '<i class="fas fa-search"></i> Buscar'; btn.disabled = false; }
          return;
      }

      if (dniStr === "10442508" || dniStr === "44250864") {
        this.regNombre = "TAPIA SANCHEZ JOSE LUIS";
      } else {
        alert("DNI no encontrado en la API demo de RENIEC. Por favor, escribe tu nombre manualmente.");
      }
      if (btn) { btn.innerHTML = '<i class="fas fa-search"></i> Buscar'; btn.disabled = false; }
    }, 500);
  }

  registrarManual() {
    const dni = this.regDni.trim();
    const nombre = this.regNombre.trim();
    const telefono = this.regTelefono.trim();
    const pass = this.regPass.trim();

    // 🔥 RESTRICCIONES ESTRICTAS ANTES DE ENVIAR AL BACKEND 🔥
    if (!dni || !nombre || !telefono || !pass) {
        return alert("⚠️ Por favor, llena todos los campos obligatorios.");
    }
    
    if (dni.length !== 8) {
        return alert("⚠️ El DNI debe tener exactamente 8 números.");
    }
    
    if (nombre.length < 3) {
        return alert("⚠️ El nombre es demasiado corto. Escribe tu nombre completo.");
    }

    if (telefono.length !== 9) {
        return alert("⚠️ El número de celular debe tener exactamente 9 dígitos.");
    }

    if (pass.length < 6) {
        return alert("⚠️ La contraseña debe tener al menos 6 caracteres por seguridad.");
    }
    // 🔥 ===================================================== 🔥

    const nuevoCliente = {
      tipoDoc: "DNI",
      numDoc: dni,
      nombreCompleto: nombre,
      telefono: telefono,
      email: "pendiente@poractualizar.com", 
      password: pass, 
      descriptorFacial: "[]", 
      direcciones: [
        { 
            direccion: "Pendiente (Se pedirá al comprar)", 
            ciudad: "Por Defecto", 
            referencia: "-" 
        }
      ]
    };

    this.http.post('https://estimcenter.onrender.com/rest/cliente/registrar-ia', nuevoCliente, {responseType: 'text'}).subscribe({
      next: (res) => {
        // 1. Giramos el panel visualmente para que vea la animación
        this.girarPanel(); 
        this.loginDni = dni; 
        
        // Limpiamos el formulario por seguridad
        this.regDni = '';
        this.regNombre = '';
        this.regTelefono = '';
        this.regPass = '';
        this.terminosAceptados = false;

        // 2. Esperamos a que termine de girar la tarjeta (800ms) e iniciamos sesión automáticamente
        setTimeout(() => {
            alert(`¡Excelente ${nombre.split(' ')[0]}!\nTu cuenta ha sido creada. Iniciando sesión automáticamente...`);
            this.iniciarSesion(nombre, dni);
        }, 800);
      },
      error: (err) => {
        console.error("Error completo del backend:", err);
        alert("Error al registrar: " + (err.error || "Es posible que el DNI ya exista."));
      }
    });
  }

  loginManual() {
    const dni = this.loginDni.trim();
    const pass = this.loginPass.trim();

    if (!dni || !pass) {
      return alert("⚠️ Ingresa tu DNI y Contraseña.");
    }

    if (dni.length !== 8) {
        return alert("⚠️ El DNI debe tener 8 números.");
    }

    const credenciales = { numDoc: dni, password: pass };

    this.http.post<any>('[https://estimcenter.onrender.com/rest](https://estimcenter.onrender.com/rest)/cliente/login-manual', credenciales).subscribe({
      next: (clienteBD) => {
        this.iniciarSesion(clienteBD.nombreCompleto, clienteBD.numDoc);
      },
      error: () => alert("❌ DNI o Contraseña incorrectos.")
    });
  }

  iniciarSesion(nombre: string, dni: string) {
    localStorage.removeItem('adminLogueado'); 
    localStorage.setItem('clienteLogueado', 'true');
    localStorage.setItem('clienteNombre', nombre);
    localStorage.setItem('clienteDNI', dni);
    this.router.navigate(['/cotizar']);
  }
}