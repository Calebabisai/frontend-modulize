Modulize Frontend Client

Este es el cliente web para la plataforma Modulize, diseñado para ofrecer una experiencia fluida y moderna en la gestión de inventarios activos. Está construido con Angular (versión moderna con Standalone Components) y utiliza Signals para un manejo de estado reactivo y eficiente.
Stack Tecnológico

    Framework: Angular (Standalone Components)

    Lenguaje: TypeScript

    Estado & Reactividad: Angular Signals & Computed Properties.

    Estilos: CSS3 Nativo con Variables (Custom Properties) para theming.

    Iconografía: Google Material Icons.

    Gestor de Paquetes: npm

Prerrequisitos

Para ejecutar este proyecto necesitas tener instalado:

    Node.js (LTS recomendado).

    Angular CLI: La herramienta de línea de comandos de Angular.
    Bash

    npm install -g @angular/cli

    Backend Corriendo: Este proyecto requiere que el servidor backend de Modulize esté ejecutándose (usualmente en el puerto 3000).

Instalación y Configuración

1. Clonar e Instalar Dependencias
   Bash

# Clona el repositorio

git clone <https://github.com/Calebabisai/frontend-modulize>
cd frontend-modulize

# Instala las dependencias con npm

npm install

2. Configuración de Conexión (Environment)

Para que el frontend sepa dónde está el backend, verifica el archivo de entorno.

Ve a src/environments/environment.ts (o environment.development.ts) y asegúrate de que la apiUrl coincida con el puerto de tu backend NestJS:
TypeScript

export const environment = {
production: false,
// Asegúrate de que este puerto (3000) sea el mismo que definiste en el .env del Backend
apiUrl: 'http://localhost:3000/api'
};

▶Ejecutar la Aplicación

Una vez instaladas las dependencias y con el Backend corriendo en otra terminal, inicia el servidor de desarrollo:
Bash

ng serve

O usando npm:
Bash

npm start

La aplicación estará disponible en: http://localhost:4200

Estructura del Proyecto

El proyecto sigue una arquitectura organizada por funcionalidades (Features) y Standalone Components.

src/app/
├── core/ # Lógica de negocio esencial (Singleton services)
│ ├── guards/ # Guardias de ruta (AuthGuard)
│ ├── services/ # Servicios HTTP (AuthService, ProductService)
│ └── interceptors/ # Interceptores para JWT
├── pages/ # Vistas principales (Rutas)
│ ├── auth/ # Login y Registro
│ ├── products/ # Catálogo principal, Paginación y Modales
│ └── categories/ # Gestión de categorías
├── shared/ # Componentes reutilizables
│ ├── navbar/ # Barra de navegación superior
│ ├── footer/ # Pie de página
│ └── ui/ # Elementos de UI genéricos
└── app.routes.ts # Definición de rutas y Lazy Loading

Funcionalidades Clave

    Gestión de Inventario: CRUD completo de productos con paginación optimizada (6 items por vista).

    Filtrado Inteligente: Filtrado reactivo por categorías sin recargar la página.

    Seguridad: Protección de rutas mediante Guards y manejo de sesión con JWT.

    Interfaz Reactiva: Uso de Signals para actualizaciones instantáneas de la UI (Stock, Precios, Filtros).

    Sección de Equipo: Visualización estética de los miembros del proyecto.

Construcción para Producción

Para generar los archivos estáticos optimizados para despliegue (carpeta dist/):
Bash

npm run build

Solución de Problemas Comunes

    Error de CORS: Si al intentar loguearte o cargar productos ves un error de CORS en la consola, asegúrate de que en el main.ts de tu Backend hayas habilitado CORS:
    TypeScript

    // En el Backend (main.ts)
    app.enableCors();

    Iconos no aparecen: Verifica que en tu index.html esté importada la fuente de Material Icons:
    HTML

    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

Nota para Desarrolladores

Recuerda que este es un sistema distribuido. Orden de encendido:

    Terminal 1: Backend (pnpm start:dev) -> Espera a que diga "Nest application successfully started".

    Terminal 2: Frontend (npm start) -> Abre el navegador en localhost:4200.
