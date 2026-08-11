import { Routes } from '@angular/router';

// 1. Importamos la NUEVA PORTADA
import { HomePublicComponent } from './pages/home-public/home-public';
import { CotizadorComponent } from './pages/cotizador/cotizador';
import { PedidosComponent } from './pages/pedidos/pedidos';

// 🔥 IMPORTAMOS EL NUEVO CATÁLOGO VIRTUAL
import { StoreCatalogComponent } from './pages/store-catalog/store-catalog'; 

// 🔥 IMPORTAMOS LOS GUARDIAS (Revisa si en tu carpeta están con guion o con punto)
import { authGuard } from './guards/auth-guard'; 
import { adminGuard } from './guards/admin-guard'; 

// 2. Importamos el Lado ADMIN
import { AdminEmployeesComponent } from './pages/admin-employees/admin-employees';
import { AdminEmployeeFormComponent } from './pages/admin-employee-form/admin-employee-form';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { AdminProductsComponent } from './pages/admin-products/admin-products';
import { AdminProductFormComponent } from './pages/admin-product-form/admin-product-form';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories';
import { AdminCategoryFormComponent } from './pages/admin-category-form/admin-category-form';
import { AdminClientsComponent } from './pages/admin-clients/admin-clients';
import { AdminClientFormComponent } from './pages/admin-client-form/admin-client-form';
import { AdminQuotesNewComponent } from './pages/admin-quotes-new/admin-quotes-new';
import { AdminQuotesComponent } from './pages/admin-quotes/admin-quotes';
import { AdminQuoteDetailComponent } from './pages/admin-quote-detail/admin-quote-detail';
import { AdminMovimientosComponent } from './pages/admin-movimientos/admin-movimientos';

// 🔥 NUEVO: Importamos el componente de Despachos
import { AdminDespachosComponent } from './pages/admin-despachos/admin-despachos';

// 🔥 LOGIN DE CLIENTES Y NUEVO LOGIN DE ADMIN
import { LoginComponent } from './pages/login/login';
import { AdminLoginComponent } from './pages/admin-login/admin-login'; 

export const routes: Routes = [
    // =========================================================
    // 🏠 RUTAS PÚBLICAS (ACCESIBLES PARA EL CLIENTE)
    // =========================================================
    { path: '', component: HomePublicComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    
    // 🔥 NUESTRA NUEVA RUTA DEL CATÁLOGO (Pública para que todos la vean)
    { path: 'catalogo', component: StoreCatalogComponent },
    
    // 🔥 RUTAS DE CLIENTE (COTIZAR AHORA ES PÚBLICA) 🔥
    { path: 'cotizar', component: CotizadorComponent }, // <--- ¡AQUÍ QUITAMOS EL GUARD!
    { path: 'pedidos', component: PedidosComponent, canActivate: [authGuard] }, // ESTA SÍ QUEDA PROTEGIDA

    // =========================================================
    // 🔐 RUTAS ADMINISTRATIVAS (LADO ADMIN)
    // =========================================================
    { path: 'admin/login', component: AdminLoginComponent }, 

    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [adminGuard], 
        children: [
            { path: '', component: AdminDashboardComponent }, 
            { path: 'productos', component: AdminProductsComponent },
            { path: 'productos/nuevo', component: AdminProductFormComponent },
            { path: 'productos/editar/:id', component: AdminProductFormComponent },
            { path: 'categorias', component: AdminCategoriesComponent },
            { path: 'categorias/nueva', component: AdminCategoryFormComponent },
            { path: 'categorias/editar/:id', component: AdminCategoryFormComponent },
            { path: 'clientes', component: AdminClientsComponent },
            { path: 'clientes/nuevo', component: AdminClientFormComponent },
            { path: 'clientes/editar/:id', component: AdminClientFormComponent },
            { path: 'cotizaciones/nueva', component: AdminQuotesNewComponent },
            { path: 'cotizaciones', component: AdminQuotesComponent },
            { path: 'cotizaciones/detalle/:id', component: AdminQuoteDetailComponent },
            { path: 'empleados', component: AdminEmployeesComponent },
            { path: 'empleados/nuevo', component: AdminEmployeeFormComponent },
            { path: 'empleados/editar/:id', component: AdminEmployeeFormComponent },
            
            // 🔥 NUEVO: Agregamos la ruta hija de despachos
            { path: 'despachos', component: AdminDespachosComponent },
            { path: 'movimientos', component: AdminMovimientosComponent },
        ]
    },

    { path: '**', redirectTo: '' }
];