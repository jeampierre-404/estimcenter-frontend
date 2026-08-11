import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovimientoInventario } from '../models/movimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {

  private baseUrl ='https://estimcenter.onrender.com/rest/movimiento';

  constructor(private http: HttpClient) { }

  listar(): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.baseUrl}/listar`);
  }
}