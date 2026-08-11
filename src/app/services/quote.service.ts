import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cotizacion, CotizacionDTO, DetalleCotizacion } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  private baseUrl ='https://estimcenter.onrender.com/rest/cotizacion';
  private detalleUrl ='https://estimcenter.onrender.com/rest/detallecotizacion';

  constructor(private http: HttpClient) { }

  listar(): Observable<Cotizacion[]> {
    return this.http.get<Cotizacion[]>(`${this.baseUrl}/listar`);
  }

  obtener(id: number): Observable<Cotizacion> {
    return this.http.get<Cotizacion>(`${this.baseUrl}/buscar/${id}`);
  }

  listarDetalles(idCotizacion: number): Observable<DetalleCotizacion[]> {
    return this.http.get<DetalleCotizacion[]>(`${this.detalleUrl}/por-cotizacion/${idCotizacion}`);
  }

  generar(dto: CotizacionDTO): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/generar`, dto);
  }

  facturar(idCotizacion: number, idMetodo: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/facturar/${idCotizacion}/${idMetodo}`, {});
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/borrar/${id}`, { responseType: 'text' });
  }

  obtenerVenta(idCotizacion: number): Observable<any> {
    return this.http.get(`[https://estimcenter.onrender.com/rest](https://estimcenter.onrender.com/rest)/venta/por-cotizacion/${idCotizacion}`);
  }
}