import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product.service'; 
import { Producto } from '../../models/product.model'; 

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './admin-products.html',
  styles: [`:host { display: block; width: 100%; }`] 
})
export class AdminProductsComponent implements OnInit {

  productos: Producto[] = []; 
  productosFiltrados: Producto[] = []; 
  busqueda: string = ''; 

  constructor(
    private productService: ProductService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.productService.listarProductos().subscribe({
      next: (data) => {
        this.productos = data.sort((a, b) => a.estado === 'INACTIVO' ? 1 : -1);
        this.productosFiltrados = [...this.productos]; 
        this.cd.detectChanges(); 
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  filtrar() {
    const term = this.busqueda.toLowerCase().trim();
    if (!term) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.codigo.toLowerCase().includes(term)
      );
    }
  }

  agregarStock(id?: number, nombre?: string) {
    if (!id) return;
    
    const cantidadStr = prompt(`📦 ¿Cuántas unidades de "${nombre}" vas a ingresar al almacén?`);
    
    if (cantidadStr) {
      const cantidad = parseFloat(cantidadStr);
      if (cantidad > 0) {
        this.productService.agregarStock(id, cantidad).subscribe({
          next: () => {
            alert('✅ Stock actualizado correctamente. El Kardex ha registrado la ENTRADA.');
            this.busqueda = ''; 
            this.cargarDatos(); 
            this.cd.detectChanges(); 
          },
          error: () => alert('❌ Error al actualizar el stock.')
        });
      } else {
        alert('⚠️ Debes ingresar una cantidad mayor a 0.');
      }
    }
  }

  eliminar(id?: number) {
    if (!id) return;

    if (confirm('¿Estás seguro de procesar este producto? Si no tiene historial se borrará definitivamente, sino, se desactivará.')) {
      this.productService.eliminarProducto(id).subscribe({
        next: (response: any) => {
          if (response && response.mensaje === 'eliminado_fisico') {
              alert('✅ Producto eliminado definitivamente de la base de datos porque no tenía historial.');
          } else {
              alert('⚠️ El producto fue DESACTIVADO porque tiene historial de movimientos, para proteger tus reportes.');
          }
          this.cargarDatos(); 
          this.busqueda = ''; 
        },
        error: (e) => {
          console.error(e);
          alert('❌ No se pudo eliminar. El producto está atado a cotizaciones o ventas.');
        }
      });
    }
  }

  getImagenUrl(imagen: string | undefined): string {
    if (!imagen) {
        return 'assets/imagenes/logo.jpg'; 
    }
    if (imagen.startsWith('http')) {
        return imagen; 
    }
    if (imagen.startsWith('data:image')) {
        return imagen; 
    }
    return 'assets/' + imagen; 
  }
}