import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { Categoria } from '../../models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-categories.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class AdminCategoriesComponent implements OnInit {

  categorias: Categoria[] = [];

  constructor(
    private categoryService: CategoryService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.categoryService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cd.detectChanges(); // ¡Actualizar YA!
      },
      error: (e) => console.error(e)
    });
  }

  eliminar(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
      this.categoryService.eliminar(id).subscribe({
        next: () => {
          this.categorias = this.categorias.filter(c => c.idCategoria !== id);
          this.cd.detectChanges(); // ¡Borrar visualmente YA!
          alert('Categoría eliminada');
        },
        error: (e) => alert('Error al eliminar. Puede que tenga productos asociados.')
      });
    }
  }
}