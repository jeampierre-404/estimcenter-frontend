import { Cliente } from './client.model';
import { Producto } from './product.model';

// 1. EL PAQUETE COMPLETO (DTO)
export interface CotizacionDTO {
    cotizacion: Cotizacion;
    detalles: DetalleCotizacion[];
}

// 2. LA CABECERA
export interface Cotizacion {
    idCotizacion?: number;
    codigo: string;
    fechaEmision?: string;
    fechaVencimiento: string;
    subtotal: number;
    igv: number;
    total: number;
    estado: 'PENDIENTE' | 'APROBADO' | 'FACTURADO' | 'CANCELADO';
    cliente: Cliente;
    usuario: { idUsuario: number }; // Simulamos el usuario por ahora
}

// 3. EL DETALLE (PRODUCTO EN EL CARRITO)
export interface DetalleCotizacion {
    idDetalle?: number;
    cantidad: number;
    precioHistorico: number;
    importe: number;
    producto: Producto;
}