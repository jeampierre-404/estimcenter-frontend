import { Categoria } from './category.model';

export interface Producto {
    idProducto: number;          
    codigo: string;
    nombre: string;
    descripcion: string;
    precio: number;              
    // 🔥 ENUM ACTUALIZADO CON SACO Y BOLSA
    unidadMedida: 'm2' | 'unid' | 'caja' | 'saco' | 'bolsa'; 
    rendimientoCaja: number;
    stockActual: number;
    stockMinimo: number;
    imagen: string;
    // 🔥 NUEVO CAMPO
    imagenSala?: string;         
    categoria: Categoria;        
    estado?: string;
}