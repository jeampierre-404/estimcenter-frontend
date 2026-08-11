import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  // URL ajustada a tu configuración: Puerto 9090 + /rest
  private baseUrl ='https://estimcenter.onrender.com/rest/categoria'; 

  constructor(private http: HttpClient) { }

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/listar`);
  }

  obtener(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/buscar/${id}`);
  }

  crear(categoria: Categoria): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/agregar`, categoria);
  }

  actualizar(id: number, categoria: Categoria): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/editar/${id}`, categoria);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/borrar/${id}`);
  }
}