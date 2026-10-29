# Diseño y arquitectura del proyecto SIAR

## 1. Introducción

SIAR (Sistema Integral de Administración para Restaurantes) es una aplicación
web desarrollada con Next.js, TypeScript, Prisma y PostgreSQL. Su objetivo es
centralizar la administración de usuarios, menú, pedidos e inventario.

La implementación actual corresponde al primer entregable funcional del
proyecto y está organizada por módulos independientes.

## 2. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Next.js | Framework web y API Routes |
| React | Construcción de la interfaz |
| TypeScript | Tipado estático |
| Prisma | ORM para acceso a datos |
| PostgreSQL | Base de datos relacional |
| bcryptjs | Cifrado y validación de contraseñas |

## 3. Arquitectura general

El proyecto utiliza una arquitectura por capas:

```text
Interfaz de usuario
        ↓
Componentes React
        ↓
API Routes de Next.js
        ↓
Prisma ORM
        ↓
PostgreSQL
```

### 3.1 Capa de presentación

La interfaz está construida con componentes React separados por
responsabilidad:

- [LoginScreen](../app/components/LoginScreen.tsx): formulario de inicio de
  sesión.
- [SiarApp](../app/components/SiarApp.tsx): navegación y composición general.
- [MenuModule](../app/components/MenuModule.tsx): gestión del menú.
- [OrdersModule](../app/components/OrdersModule.tsx): gestión de pedidos.
- [InventoryModule](../app/components/InventoryModule.tsx): gestión del
  inventario.

El archivo de entrada [page.tsx](../app/page.tsx) únicamente carga el
componente principal:

```tsx
import { SiarApp } from "./components/SiarApp";

export default SiarApp;
```

### 3.2 Capa de API

Las rutas de API están organizadas por recurso:

| Recurso | Ubicación |
|---|---|
| Autenticación | `app/api/auth/login/route.ts` |
| Usuarios | `app/api/users/route.ts` |
| Productos | `app/api/products/route.ts` |
| Pedidos | `app/api/orders/route.ts` |
| Inventario | `app/api/inventory/route.ts` |

Se utilizan métodos HTTP según la operación:

- `GET`: consultar registros.
- `POST`: crear registros.
- `PATCH`: actualizar parcialmente un registro.
- `DELETE`: eliminar registros.

### 3.3 Capa de persistencia

El esquema de datos está definido en
[schema.prisma](../prisma/schema.prisma). Incluye las entidades:

- `User`
- `Product`
- `Order`
- `OrderItem`
- `InventoryItem`

La conexión compartida de Prisma está centralizada en
[prisma.ts](../lib/prisma.ts).

## 4. Patrones y diseños aplicados

### 4.1 Diseño basado en componentes

Cada componente tiene una responsabilidad funcional concreta. Esto permite
modificar el login, menú, pedidos o inventario sin concentrar toda la lógica
en una única página.

Este diseño facilita:

- Reutilización.
- Mantenimiento.
- Pruebas independientes.
- Evolución progresiva de cada módulo.

### 4.2 Separación de responsabilidades

La aplicación separa la navegación, la interfaz de cada módulo y el acceso a
la API. Por ejemplo, `MenuModule` administra la interacción visual del menú,
mientras que `app/api/products` procesa las operaciones de productos.

### 4.3 Patrón Singleton para Prisma

El cliente Prisma se reutiliza mediante una única instancia compartida en
[lib/prisma.ts](../lib/prisma.ts):

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();
```

Este enfoque evita crear conexiones innecesarias durante el desarrollo y
permite reutilizar el cliente entre solicitudes.

### 4.4 Diseño REST

La API se organiza mediante recursos y verbos HTTP estándar. Por ejemplo:

```text
GET    /api/products
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

El mismo criterio se aplica a usuarios, pedidos e inventario.

### 4.5 Validación y encapsulamiento

Las rutas validan el cuerpo de las solicitudes antes de consultar o modificar
la base de datos. Además, el acceso a Prisma está encapsulado mediante el
cliente compartido y no se expone directamente desde los componentes.

## 5. Seguridad implementada

El inicio de sesión consulta el usuario en PostgreSQL y compara la contraseña
mediante `bcryptjs`. Las contraseñas no se almacenan en texto plano.

La lógica está ubicada en
[route.ts](../app/api/auth/login/route.ts):

```text
Formulario → API de login → Usuario en PostgreSQL
           → Comparación bcrypt → Acceso permitido o rechazado
```

Las credenciales de conexión se mantienen en `.env`, archivo excluido por
`.gitignore`.

## 6. Organización por ramas

El desarrollo se organizó por funcionalidades:

```text
funcionalidad/base-datos
funcionalidad/inicio-sesion
funcionalidad/gestion-usuarios
funcionalidad/gestion-menu
funcionalidad/gestion-pedidos
funcionalidad/inventario
refactorizacion/componentes
```

Esta estrategia permite revisar, probar e integrar cada funcionalidad de forma
independiente.

## 7. Aspectos pendientes

La estructura actual es adecuada para el primer entregable, pero se puede
fortalecer en futuras iteraciones con:

- Capa de servicios para separar reglas de negocio de las API Routes.
- Patrón Repository para encapsular consultas de Prisma.
- Autenticación persistente mediante cookies seguras o sesiones.
- Autorización según el rol del usuario.
- Pruebas unitarias, de integración y de aceptación.
- Manejo centralizado de errores.
- Validación de esquemas con una biblioteca como Zod.
- Consultas reales para alimentar el dashboard.

La arquitectura objetivo sería:

```text
Componente React
        ↓
API Route / Controller
        ↓
Service
        ↓
Repository
        ↓
Prisma
        ↓
PostgreSQL
```

## 8. Conclusión

El proyecto SIAR cumple actualmente con una estructura modular, una separación
inicial por capas, una API organizada por recursos, persistencia relacional en
PostgreSQL y componentes independientes para las funcionalidades principales.

Estos elementos proporcionan una base apropiada para el primer entregable.
Los patrones Service y Repository, el control de permisos y las pruebas
automatizadas quedan como mejoras recomendadas para los siguientes
entregables.
