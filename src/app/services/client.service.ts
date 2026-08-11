import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private baseUrl ='https://estimcenter.onrender.com/rest/cliente'; 

  constructor(private http: HttpClient) { }

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/listar`);
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/buscar/${id}`);
  }

  crear(cliente: Cliente): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/agregar`, cliente);
  }

  actualizar(id: number, cliente: Cliente): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/editar/${id}`, cliente);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/borrar/${id}`);
  }

  // 🔥 NUEVO: Función para verificar si el documento ya existe
  verificarDocumento(numDoc: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verificar-documento/${numDoc}`);
  }
}