import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Categoria } from '../../models/category.model';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './admin-product-form.html', 
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminProductFormComponent implements OnInit {

  producto: any = {
    idProducto: 0,
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: null,
    stockActual: null,
    stockMinimo: 5,
    unidadMedida: 'caja', 
    rendimientoCaja: 1.44,
    estado: 'ACTIVO', 
    imagen: '',
    imagenSala: '',
    categoria: { idCategoria: '', nombre:'', descripcion: '', estado: true } 
  };

  categorias: Categoria[] = [];
  esEdicion: boolean = false; 
  cargando: boolean = false;

  filePrincipal: File | null = null;
  fileSala: File | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.cargarCategorias();
    
    if (id) {
      this.esEdicion = true;
      this.cargarProducto(id);
    }
  }

  cargarCategorias() {
    this.categoryService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cd.detectChanges(); 
      },
      error: (e) => console.error(e)
    });
  }

  cargarProducto(id: number) {
    this.productService.obtenerProducto(id).subscribe({
      next: (data) => {
        this.producto = data;
        if (!this.producto.estado) {
            this.producto.estado = 'ACTIVO';
        }
        this.cd.detectChanges();
      },
      error: (e) => console.error(e)
    });
  }

  onFileSelected(event: any, tipo: 'principal' | 'sala'): void {
    const file = event.target.files[0]; 
    
    if (file) {
      if (tipo === 'principal') {
          this.filePrincipal = file;
      } else if (tipo === 'sala') {
          this.fileSala = file;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        if (tipo === 'principal') {
            this.producto.imagen = reader.result as string; 
        } else if (tipo === 'sala') {
            this.producto.imagenSala = reader.result as string; 
        }
        this.cd.detectChanges();
      };
      
      reader.readAsDataURL(file);
    }
  }

  guardar() {
    if (!this.producto.codigo || !this.producto.nombre || !this.producto.categoria.idCategoria || this.producto.precio === null || this.producto.stockActual === null) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }

    if (this.producto.precio <= 0) {
        alert('El precio debe ser mayor a 0.');
        return;
    }

    if (this.producto.stockActual < 0 || this.producto.stockMinimo < 0) {
        alert('El stock no puede ser negativo.');
        return;
    }

    if (this.producto.unidadMedida === 'unid' || this.producto.unidadMedida === 'm2') {
        this.producto.rendimientoCaja = null; 
    } else {
        if (this.producto.rendimientoCaja <= 0 || !this.producto.rendimientoCaja) {
            alert('El rendimiento de la caja/bolsa debe ser mayor a 0.');
            return;
        }
    }

    this.cargando = true;
    this.cd.detectChanges();

    const formData = new FormData();
    formData.append('producto', JSON.stringify(this.producto));
    
    if (this.filePrincipal) {
        formData.append('filePrincipal', this.filePrincipal);
    }
    if (this.fileSala) {
        formData.append('fileSala', this.fileSala);
    }

    if (this.esEdicion) {
      this.productService.actualizarProducto(this.producto.idProducto, formData).subscribe({
        next: () => {
          alert('Producto actualizado con éxito');
          this.router.navigate(['/admin/productos']);
        },
        error: () => {
          alert('Error al actualizar el producto');
          this.cargando = false;
          this.cd.detectChanges();
        }
      });
    } else {
      this.productService.crearProducto(formData).subscribe({
        next: () => {
          alert('Producto creado con éxito');
          this.router.navigate(['/admin/productos']);
        },
        error: () => {
          alert('Error al crear el producto');
          this.cargando = false;
          this.cd.detectChanges();
        }
      });
    }
  }
}