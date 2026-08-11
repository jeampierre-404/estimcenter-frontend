import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Despacho } from '../models/despacho.model';

@Injectable({
  providedIn: 'root'
})
export class DespachoService {

  private baseUrl ='https://estimcenter.onrender.com/rest/despacho';

  constructor(private http: HttpClient) { }

  listar(): Observable<Despacho[]> {
    return this.http.get<Despacho[]>(`${this.baseUrl}/listar`);
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/actualizar-estado/${id}`, { estado });
  }
}