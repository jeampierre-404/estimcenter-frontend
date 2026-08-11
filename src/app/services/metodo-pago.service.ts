import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetodoPago {
  idMetodo: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {
  private baseUrl ='https://estimcenter.onrender.com/rest/metodopago'; 

  constructor(private http: HttpClient) { }

  listarMetodos(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.baseUrl}/listar`);
  }
}