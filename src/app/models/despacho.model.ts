export interface Despacho {
    idDespacho: number;
    fechaProgramada?: string;
    fechaEntrega?: string;
    estado: string;
    venta: any; 
}