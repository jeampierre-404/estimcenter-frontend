import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Cliente } from '../../models/client.model';

@Component({
  selector: 'app-admin-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-client-form.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminClientFormComponent implements OnInit {

  cliente: Cliente = {
    idCliente: 0,
    tipoDoc: 'DNI', 
    numDoc: '',
    nombreCompleto: '',
    email: '',
    telefono: ''
  };

  esEdicion = false;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.esEdicion = true;
      this.clientService.obtener(id).subscribe({
        next: (data) => {
          this.cliente = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error al cargar cliente:', err)
      });
    }
  }

  permitirSoloNumeros(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault(); 
      return false;
    }
    return true;
  }

  validarLogicaDocumento(): boolean {
    const doc = this.cliente.numDoc.trim();
    
    if (this.cliente.tipoDoc === 'DNI') {
      if (!/^\d{8}$/.test(doc)) {
        alert('⚠️ Error: El DNI debe contener exactamente 8 números.');
        return false;
      }
    }
    
    if (this.cliente.tipoDoc === 'RUC') {
      if (!/^(10|20)\d{9}$/.test(doc)) {
        alert('⚠️ Error: El RUC debe tener 11 números y empezar obligatoriamente con 10 o 20.');
        return false;
      }
    }

    return true; 
  }

  guardar() {
    this.cliente.numDoc = this.cliente.numDoc.trim();
    this.cliente.nombreCompleto = this.cliente.nombreCompleto.trim();

    if (!this.validarLogicaDocumento()) {
      return; 
    }

    // 🔥 VERIFICACIÓN DE DUPLICADOS ANTES DE GUARDAR
    if (!this.esEdicion) {
      this.clientService.verificarDocumento(this.cliente.numDoc).subscribe({
        next: (existe) => {
          if (existe) {
            alert(`❌ Error: El documento ${this.cliente.numDoc} ya está registrado en el sistema.`);
          } else {
            this.procederConGuardado(); // Si no existe, guardamos
          }
        },
        error: (err) => {
          console.error('Error al verificar documento:', err);
          alert('❌ Ocurrió un error al verificar el documento en la base de datos.');
        }
      });
    } else {
      // Si es edición, procedemos directo porque el documento podría ser el mismo del cliente actual
      this.procederConGuardado();
    }
  }

  // 🔥 Función auxiliar para mantener limpio el código de guardar
  procederConGuardado() {
    if (this.esEdicion) {
      this.clientService.actualizar(this.cliente.idCliente, this.cliente).subscribe({
        next: () => {
          alert('✅ Cliente actualizado correctamente.');
          this.router.navigate(['/admin/clientes']);
        },
        error: (err) => {
          console.error(err);
          alert('❌ Ocurrió un error al actualizar el cliente.');
        }
      });
    } else {
      this.clientService.crear(this.cliente).subscribe({
        next: () => {
          alert('✅ Cliente registrado con éxito.');
          this.router.navigate(['/admin/clientes']);
        },
        error: (err) => {
          console.error(err);
          alert('❌ No se pudo guardar. Inténtalo de nuevo.');
        }
      });
    }
  }
}