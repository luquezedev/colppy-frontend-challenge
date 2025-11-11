# Real-time Metrics Dashboard

Dashboard de métricas en tiempo real construido con React, TypeScript y Tailwind CSS.

## Demo en Producción

🚀 **[https://colppy-frontend.vercel.app/](https://colppy-frontend.vercel.app/)**

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en http://localhost:5173

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build

# Testing
npm run test             # Tests unitarios
npm run test:coverage    # Tests con coverage
npm run test:e2e         # Tests E2E con Playwright

# Calidad de código
npm run lint             # ESLint
npm run type-check       # TypeScript
```

## Variables de Entorno

```env
VITE_API_URL=http://localhost:4000
```

## Requisitos

- Node.js 18+
- npm 9+
- API ejecutándose en el puerto 4000 (ver carpeta `/api`)

## Características

- **Auto-refresh**: Actualización automática cada 5 segundos
- **Dark Mode**: Soporte de tema oscuro/claro
- **Multi-idioma**: Inglés y Español
- **Filtros**: Por fecha y región
- **Histórico**: Datos acumulados durante la sesión
- **Responsive**: Optimizado para mobile y desktop
- **Charts**: Gráficos interactivos con Highcharts

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- SWR (data fetching)
- Highcharts (charts)
- react-i18next (i18n)
- Vitest + Playwright (testing)
