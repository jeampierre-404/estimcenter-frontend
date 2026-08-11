export interface MovimientoInventario {
    idMovimiento: number;
    tipo: string;
    cantidad: number;
    fecha: string;
    motivo: string;
    producto: any; 
    usuario: any; 
}