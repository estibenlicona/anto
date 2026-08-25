# 🚀 Proyecto React - Tuya Template Client

[![React](https://img.shields.io/badge/react-19.2.5-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-6.0.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-8.0.10-purple.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/vitest-4.1.5-green.svg)](https://vitest.dev/)

Proyecto React empresarial generado desde **Tuya Template React** con arquitectura modular, TypeScript strict, testing integrado y configuración lista para producción.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración Inicial](#-configuración-inicial)
- [Scripts Disponibles](#-scripts-disponibles)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)
- [Build y Deploy](#-build-y-deploy)
- [Convenciones](#-convenciones)

---

## ✨ Características

### 🏗️ **Arquitectura**
- ✅ Arquitectura modular basada en **features**
- ✅ Clean Architecture con separación de capas
- ✅ Path aliases configurados (`@app`, `@features`, `@shared`, `@layouts`, `@pages`)
- ✅ Lazy loading de rutas por defecto
- ✅ Guards de autenticación y roles

### 🛠️ **Stack Tecnológico**
- ✅ **React 19** con TypeScript strict mode
- ✅ **Vite** como build tool (desarrollo ultra-rápido)
- ✅ **Vitest** para testing unitario y de integración
- ✅ **Tailwind CSS + DaisyUI** para estilos
- ✅ **React Router v7** para enrutamiento
- ✅ **Axios** como HTTP client con interceptores
- ✅ **@tuya-bussiness/tuya-ui** librería de componentes empresarial

### 🧪 **Calidad de Código**
- ✅ **Coverage mínimo del 80%** (branches, functions, lines, statements)
- ✅ **ESLint + Prettier** configurados
- ✅ **Husky** para Git hooks
- ✅ **Conventional Commits** obligatorio
- ✅ **Commitlint** para validación de mensajes
- ✅ **Storybook** para documentación de componentes

### 📦 **Features Incluidas**
- ✅ Sistema de autenticación completo
- ✅ Sistema de temas (light/dark)
- ✅ HTTP client configurado con interceptores
- ✅ Manejo de errores centralizado
- ✅ Layouts reutilizables
- ✅ Ejemplos de páginas y componentes

---

## 📦 Requisitos Previos

### Software Requerido
- **Node.js**: >= 18.0.0 (recomendado 20.x LTS)
- **npm**: >= 9.0.0
- **Git**: última versión

### Accesos Necesarios
- ✅ Acceso al feed privado de Azure DevOps
- ✅ Credenciales configuradas para `vsts-npm-auth`

Verifica las versiones instaladas:
```bash
node --version   # Debe ser >= 18.0.0
npm --version    # Debe ser >= 9.0.0
```

---

## ⚙️ Configuración Inicial

### 1. Instalar vsts-npm-auth (si no lo tienes)

```bash
npm install -g vsts-npm-auth
```

### 2. Crear archivo .npmrc

Si el archivo `.npmrc` no existe en la raíz del proyecto, créalo.

### 3. Configurar Acceso al Feed Privado

#### Opción A: Usando vsts-npm-auth (Recomendado)

```bash
# Ejecutar en la raíz del proyecto
vsts-npm-auth -config .npmrc
```

Esto configurará automáticamente las credenciales para acceder al feed privado de Azure.

#### Opción B: Manual

1. Ve a [Feed de Tuya UI](https://flujodetrabajot.visualstudio.com/Tuya%20-%20Tecnologia/_artifacts/feed/tuya-npm-ui/Npm/@tuya-bussiness%2Ftuya-ui/)
2. Haz clic en **"Connect to Feed"**
3. Selecciona **npm**
4. Sigue las instrucciones proporcionadas
5. Copia la configuración en tu archivo `.npmrc`

### 4. Instalar Dependencias

```bash
npm install
```

Si encuentras errores:
```bash
# Limpiar caché y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 5. Configurar Variables de Entorno

Copia el archivo de ambiente apropiado:

```bash
# Para desarrollo local
cp .env.development .env

# O edita directamente .env con tus valores
```

Variables requeridas:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_BASE_PUBLIC_URL=http://localhost:4300
```

Ver [ENV_VARIABLES.md](../../ENV_VARIABLES.md) para lista completa de variables.

### 6. Verificar Instalación

```bash
npm run dev
```

La aplicación debería estar disponible en: `http://localhost:4300`

---

## 🛠️ Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo (puerto 4300)
npm run dev

# Preview del build de producción (puerto 5360)
npm run preview

# Iniciar Storybook para documentar componentes (puerto 6006)
npm run storybook
```

### Build

```bash
# Build con variables locales (.env)
npm run build:local

# Build para ambiente de desarrollo
npm run build:dev

# Build para ambiente de certificación
npm run build:test

# Build para producción
npm run build:prod

# Build de Storybook para publicación
npm run build-storybook
```

### Testing

```bash
# Ejecutar todos los tests con coverage
npm run test

# Modo watch (re-ejecuta tests al guardar)
npm run test -- --watch

# Ejecutar solo tests fallidos
npm run test:failure

# Ver reporte de coverage en el browser
# El reporte se genera en ./coverage/index.html
```

### Calidad de Código

```bash
# Ejecutar ESLint
npm run lint

# Auto-fix de problemas de linting
npm run lint:fix

# Verificar formato con Prettier
npm run prettier

# Auto-fix de formato
npm run prettier:fix

# Ejecutar prettier + lint fix
npm run format
```

### Commits

```bash
# Commit interactivo con Commitizen
npm run commit

# Esto te guiará paso a paso:
# 1. Tipo de cambio (feat, fix, docs, etc.)
# 2. Scope del cambio
# 3. Descripción corta
# 4. Descripción larga (opcional)
# 5. Breaking changes
# 6. Issues relacionados
```

---

---

## 🏗️ Arquitectura del Proyecto

Este proyecto implementa una **arquitectura modular basada en features** inspirada en Clean Architecture y Domain-Driven Design.

### Estructura de Directorios

```
src/
├── app/                      # Configuración de aplicación
│   ├── providers/            # Context providers (Auth, Theme)
│   ├── router/               # Configuración de rutas y guards
│   └── App.tsx               # Componente raíz
├── features/                 # Módulos por funcionalidad
│   └── [feature]/
│       ├── adapters/         # Transformación de datos (DTO ↔ Entity)
│       ├── components/       # Componentes UI del feature
│       ├── hooks/            # Lógica reutilizable
│       ├── models/           # Interfaces y entidades
│       ├── services/         # Comunicación con backend
│       └── index.ts          # Exports públicos
├── layouts/                  # Layouts de la aplicación
│   ├── AuthLayout/
│   ├── EmptyLayout/
│   └── MainLayout/
├── pages/                    # Páginas/Vistas
│   └── [PageName]Page/
├── shared/                   # Recursos compartidos
│   ├── components/           # Componentes reutilizables
│   ├── hooks/                # Hooks globales
│   ├── services/             # Servicios globales (httpClient)
│   ├── types/                # Tipos compartidos
│   └── utils/                # Utilidades
└── styles/                   # Estilos globales
    ├── base/
    ├── layouts/
    └── themes/
```

### Principios Arquitectónicos

#### 1. Feature-First Organization

Cada funcionalidad es un módulo autocontenido con todos sus recursos. Esto facilita:
- 🔍 Búsqueda intuitiva (todo relacionado está junto)
- 📦 Fácil de eliminar o mover features completas
- 🔌 Reduce acoplamiento entre módulos
- 👥 Facilita trabajo en equipo paralelo

**Ejemplo de Feature:**

```
features/authentication/
├── adapters/
│   └── AuthAdapter.ts         # Transforma datos backend ↔ frontend
├── components/
│   └── LoginForm.tsx          # UI específica del feature
├── hooks/
│   └── useLogin.ts            # Lógica reutilizable
├── models/
│   ├── IUser.ts               # Interface (contrato)
│   └── User.ts                # Entity (implementación)
├── services/
│   └── authService.ts         # Llamadas a API
└── index.ts                   # Public API del feature
```

#### 2. Separation of Concerns (Separación de Capas)

```
┌─────────────────┐
│   Components    │  ← Presentación (UI pura)
├─────────────────┤
│     Hooks       │  ← Lógica de negocio
├─────────────────┤
│    Services     │  ← Comunicación con backend
├─────────────────┤
│    Adapters     │  ← Transformación de datos
├─────────────────┤
│     Models      │  ← Definición de tipos
└─────────────────┘
```

**Flujo de Datos:**

```
User Interaction (Component)
       ↓
Hook (Lógica de negocio)
       ↓
Adapter (Transforma a DTO)
       ↓
Service (Llamada HTTP)
       ↓
Backend API
       ↓
Service (Recibe Response)
       ↓
Adapter (Transforma a Entity)
       ↓
Hook (Actualiza estado)
       ↓
Component (Re-render)
```

#### 3. Container/Presentational Pattern

```typescript
// Container (lógica)
export const UserProfileContainer: React.FC = () => {
  const { user, isLoading } = useUserProfile();
  const { updateProfile } = useUpdateProfile();

  if (isLoading) return <Spinner />;

  return <UserProfileView user={user} onUpdate={updateProfile} />;
};

// Presentational (UI pura)
interface UserProfileViewProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onUpdate }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      {/* Solo UI, sin lógica */}
    </div>
  );
};
```

### Ejemplo Completo: Feature de Autenticación

#### 1. Model (Definición de Datos)

```typescript
// models/IUser.ts - Interface
export interface IUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// models/User.ts - Entity
export class UserEntity implements IUser {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public role: UserRole
  ) {}

  get displayName(): string {
    return this.name;
  }

  hasRole(role: UserRole): boolean {
    return this.role === role;
  }
}
```

#### 2. Service (Comunicación con Backend)

```typescript
// services/authService.ts
import { httpClient } from '@shared/services/httpClient';

class AuthService {
  async login(dto: ILoginDto): Promise<IAuthResponse> {
    const response = await httpClient.post<IAuthResponse>('/auth/login', dto);
    return response.data;
  }

  async getCurrentUser(): Promise<IAuthResponse> {
    const response = await httpClient.get<IAuthResponse>('/auth/me');
    return response.data;
  }
}

export const authService = new AuthService();
```

#### 3. Adapter (Transformación de Datos)

```typescript
// adapters/AuthAdapter.ts
import { UserEntity } from '../models/User';

export interface ILoginDto {
  username: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

class AuthAdapter {
  toEntity(response: IAuthResponse): UserEntity {
    return new UserEntity(
      response.user.id,
      response.user.name,
      response.user.email,
      response.user.role as UserRole
    );
  }

  toDto(username: string, password: string): ILoginDto {
    return { username, password };
  }
}

export const authAdapter = new AuthAdapter();
```

#### 4. Hook (Lógica Reutilizable)

```typescript
// hooks/useLogin.ts
import { useState } from 'react';
import { authService } from '../services/authService';
import { authAdapter } from '../adapters/AuthAdapter';
import { useAuth } from '@app/providers/AuthProvider';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dto = authAdapter.toDto(username, password);
      const response = await authService.login(dto);
      const user = authAdapter.toEntity(response);
      
      login(user, response.token);
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};
```

#### 5. Component (Presentación)

```typescript
// components/LoginForm.tsx
import { Button } from '@tuya-bussiness/tuya-ui';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuario"
        disabled={isLoading}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        disabled={isLoading}
      />
      {error && <p className="error">{error}</p>}
      <Button type="submit" loading={isLoading}>
        Iniciar Sesión
      </Button>
    </form>
  );
};
```

### Ventajas de Esta Arquitectura

✅ **Escalabilidad**: Fácil agregar nuevos features sin afectar existentes  
✅ **Mantenibilidad**: Código predecible y fácil de navegar  
✅ **Testabilidad**: Cada capa puede ser testeada independientemente  
✅ **Reutilización**: Componentes y hooks bien encapsulados  
✅ **Colaboración**: Múltiples desarrolladores pueden trabajar en paralelo

---

## 💻 Desarrollo

### Path Aliases

El proyecto usa path aliases para imports más limpios:

```typescript
// ❌ Sin aliases
import { UserCard } from '../../../features/users/components/UserCard';

// ✅ Con aliases
import { UserCard } from '@features/users/components/UserCard';
```

**Aliases disponibles:**
- `@app/*` → `src/app/*`
- `@features/*` → `src/features/*`
- `@layouts/*` → `src/layouts/*`
- `@pages/*` → `src/pages/*`
- `@shared/*` → `src/shared/*`

### HTTP Client

El proyecto incluye un HTTP client pre-configurado con Axios:

```typescript
// shared/services/httpClient.ts
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticación
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo de errores
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

### Sistema de Temas

Cambio entre tema claro y oscuro:

```typescript
import { useTheme } from '@app/providers/ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Tema actual: {theme}
    </button>
  );
};
```

### Guards de Rutas

#### AuthGuard - Proteger rutas autenticadas

```typescript
// app/router/guards/AuthGuard.tsx
export const AuthGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return <>{children}</>;
};
```

#### RoleGuard - Proteger por roles

```typescript
// app/router/guards/RoleGuard.tsx
export const RoleGuard: React.FC<{ 
  children: ReactNode;
  allowedRoles: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Crear un Nuevo Feature

1. **Crear estructura de carpetas:**

```bash
mkdir -p src/features/mi-feature/{adapters,components,hooks,models,services}
```

2. **Crear archivos base:**

```bash
# Model
touch src/features/mi-feature/models/IMiFeature.ts
touch src/features/mi-feature/models/MiFeature.ts

# Service
touch src/features/mi-feature/services/miFeatureService.ts

# Adapter
touch src/features/mi-feature/adapters/MiFeatureAdapter.ts

# Hook
touch src/features/mi-feature/hooks/useMiFeature.ts

# Component
touch src/features/mi-feature/components/MiFeatureView.tsx

# Index (exports públicos)
touch src/features/mi-feature/index.ts
```

3. **Exportar solo lo necesario en `index.ts`:**

```typescript
// src/features/mi-feature/index.ts
export { MiFeatureView } from './components/MiFeatureView';
export { useMiFeature } from './hooks/useMiFeature';
export type { IMiFeature } from './models/IMiFeature';
// NO exportar servicios, adapters internos
```

---

## 🧪 Testing

### Configuración de Testing

El proyecto usa **Vitest** con las siguientes configuraciones:

- **Coverage mínimo**: 80% (branches, functions, lines, statements)
- **Environment**: jsdom (para testing de React)
- **Setup**: `vitest-setup.js` se ejecuta antes de cada test
- **Reporters**: default, junit
- **Coverage reporters**: text, json, html, lcov, cobertura

### Escribir Tests

#### Test de Componente

```typescript
// features/authentication/components/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('debería renderizar el formulario correctamente', () => {
    const mockOnSubmit = vi.fn();
    
    render(
      <LoginForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        error={null} 
      />
    );

    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debería llamar onSubmit con los valores correctos', () => {
    const mockOnSubmit = vi.fn();
    
    render(
      <LoginForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        error={null} 
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Usuario'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith('testuser', 'password123');
  });

  it('debería mostrar el mensaje de error', () => {
    const mockOnSubmit = vi.fn();
    
    render(
      <LoginForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        error="Credenciales inválidas" 
      />
    );

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });
});
```

#### Test de Hook

```typescript
// features/authentication/hooks/useLogin.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLogin } from './useLogin';
import { authService } from '../services/authService';

vi.mock('../services/authService');

describe('useLogin', () => {
  it('debería manejar login exitoso', async () => {
    const mockResponse = {
      user: { id: 1, name: 'Test', email: 'test@test.com', role: 'USER' },
      token: 'token123'
    };
    
    vi.mocked(authService.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);

    act(() => {
      result.current.handleLogin('testuser', 'password');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});
```

#### Test de Service

```typescript
// features/authentication/services/authService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import { httpClient } from '@shared/services/httpClient';

vi.mock('@shared/services/httpClient');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería hacer login correctamente', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, name: 'Test', email: 'test@test.com', role: 'USER' },
        token: 'token123'
      }
    };

    vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

    const result = await authService.login({ username: 'test', password: 'pass' });

    expect(httpClient.post).toHaveBeenCalledWith('/auth/login', {
      username: 'test',
      password: 'pass'
    });
    expect(result).toEqual(mockResponse.data);
  });
});
```

### Ver Coverage

```bash
# Ejecutar tests con coverage
npm run test

# Abrir reporte HTML
# Windows
start coverage/index.html

# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

El reporte muestra:
- % de cobertura por archivo
- Líneas no cubiertas
- Branches no cubiertas
- Funciones no testeadas

---

## 📦 Build y Deploy

### Builds por Ambiente

```bash
# Local (.env)
npm run build:local

# Desarrollo (.env.development)
npm run build:dev

# Certificación (.env.certification)
npm run build:test

# Producción (.env.production)
npm run build:prod
```

### Estructura del Build

```
dist/
├── assets/
│   ├── index-[hash].js      # JavaScript bundle
│   ├── index-[hash].css     # CSS bundle
│   └── [assets]             # Imágenes, fuentes, etc.
├── index.html               # HTML principal
└── [remoteEntry.js]         # Solo si Module Federation está habilitado
```

### Variables de Entorno por Ambiente

Las variables se cargan automáticamente según el comando de build:

```
build:local  → .env
build:dev    → .env.development
build:test   → .env.certification
build:prod   → .env.production
```

### CI/CD con Azure DevOps

El proyecto incluye pipeline de Azure DevOps (`../../Deploy_Resources/build-react-aks.yaml`) que:

1. ✅ Ejecuta tests con coverage
2. ✅ Valida linting
3. ✅ Ejecuta análisis de seguridad (SAST)
4. ✅ Construye la imagen Docker
5. ✅ Publica en Azure Container Registry
6. ✅ Despliega a Azure Kubernetes Service (AKS)
7. ✅ Expone reporte de coverage

### Module Federation (Opcional)

Si el proyecto fue generado con Module Federation:

```typescript
// vite.config.ts incluirá:
federation({
  name: 'miApp',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/app/App.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
```

Esto permite:
- Compartir componentes entre aplicaciones
- Micro-frontends
- Lazy loading de módulos remotos

---

## 📝 Convenciones

### Nomenclatura de Archivos

```
Componentes:         UserProfile.tsx (PascalCase)
Hooks:               useUserData.ts (camelCase con "use")
Services:            userService.ts (camelCase con "Service")
Adapters:            UserAdapter.ts (PascalCase con "Adapter")
Interfaces:          IUser.ts (PascalCase con "I")
Types:               types.ts (camelCase)
Constants:           constants.ts (camelCase)
Utils:               formatDate.ts (camelCase)
```

### Orden de Imports

```typescript
// 1. React y librerías externas
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 2. Path aliases internos (ordenados alfabéticamente)
import { useAuth } from '@app/providers/AuthProvider';
import { userService } from '@features/users/services/userService';
import { Button } from '@shared/components/Button';

// 3. Imports relativos
import { UserCard } from './components/UserCard';
import { helper } from './utils/helper';

// 4. Estilos
import './styles.css';
```

### TypeScript Best Practices

```typescript
// ✅ Tipos explícitos en funciones
const fetchUser = async (id: number): Promise<User> => {
  // ...
};

// ✅ Props interface para componentes
interface UserCardProps {
  user: User;
  onEdit: (id: number) => void;
}

// ✅ Evitar any, usar unknown cuando sea necesario
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  }
};

// ✅ Usar utility types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
```

### Conventional Commits

```bash
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorización de código
test: agregar tests
chore: tareas de mantenimiento
perf: mejoras de rendimiento
ci: cambios en CI/CD
build: cambios en build system
```

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- [README Principal](../../README.md) - Información del template
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Arquitectura detallada
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Guía de contribución
- [CODING_STANDARDS.md](../../CODING_STANDARDS.md) - Estándares de código
- [TESTING_GUIDE.md](../../TESTING_GUIDE.md) - Guía completa de testing
- [ENV_VARIABLES.md](../../ENV_VARIABLES.md) - Variables de entorno

### Documentación Externa

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI Components](https://daisyui.com/)

### Soporte

- **Azure DevOps**: [Proyecto Tuya - Tecnología](https://flujodetrabajot.visualstudio.com/Tuya%20-%20Tecnologia)
- **Feed UI**: [tuya-ui](https://flujodetrabajot.visualstudio.com/Tuya%20-%20Tecnologia/_artifacts/feed/tuya-npm-ui)

---

**¿Preguntas?** Consulta la [documentación](../../ARCHITECTURE.md) o contacta al equipo de desarrollo.

**Última actualización:** Febrero 2026