import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl ='https://estimcenter.onrender.com/rest/producto'; 

  constructor(private http: HttpClient) { }

  listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/listar`);
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/buscar/${id}`);
  }

  crearProducto(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/agregar`, formData);
  }

  actualizarProducto(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/editar/${id}`, formData);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/borrar/${id}`);
  }

  agregarStock(id: number, cantidad: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/agregar-stock/${id}`, { cantidad });
  }
}