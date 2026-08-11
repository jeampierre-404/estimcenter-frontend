import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { Categoria } from '../../models/category.model';

@Component({
  selector: 'app-admin-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-category-form.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminCategoryFormComponent implements OnInit {

  categoria: Categoria = {
    idCategoria: 0,
    nombre: '',
    descripcion: '',
    estado: true
  };

  esEdicion = false;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.esEdicion = true;
      this.categoryService.obtener(id).subscribe(data => {
        this.categoria = data;
        this.cd.detectChanges();
      });
    }
  }

  guardar() {
    if (this.esEdicion) {
      this.categoryService.actualizar(this.categoria.idCategoria, this.categoria).subscribe(() => {
        alert('Categoría actualizada');
        this.router.navigate(['/admin/categorias']);
      });
    } else {
      this.categoryService.crear(this.categoria).subscribe(() => {
        alert('Categoría creada');
        this.router.navigate(['/admin/categorias']);
      });
    }
  }
}