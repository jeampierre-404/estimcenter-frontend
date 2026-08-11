export interface Cliente {
    idCliente: number;
    tipoDoc: string;      // DNI, RUC, etc.
    numDoc: string;
    nombreCompleto: string;
    email: string;
    telefono: string;
    fechaRegistro?: string; // Opcional, porque lo pone el backend
}