# Control de Gastos - Resumen de Cambios

Ultima actualizacion: Mayo 2026

## Funcionalidades Implementadas

### 1. Prompt de Instalacion PWA
**Archivos:**
- `src/components/InstallPrompt.jsx` (nuevo)
- `src/index.css` (actualizado)
- `vite.config.js` (actualizado)

**Que hace:** Muestra un banner en la parte inferior invitando a instalar la app en el telefono.

**Como funciona:**
- Captura el evento `beforeinstallprompt` del navegador
- Muestra el banner 2 segundos despues de que el navegador detecta que la app es instalable
- El boton "Instalar" dispara el dialogo nativo del SO
- El boton "X" guarda en localStorage para no molestar de nuevo

**Configuracion PWA mejorada en vite.config.js:**
- `registerType: 'prompt'` - permite controlar el momento de actualizacion
- `purpose: 'any maskable'` - iconos adaptados a cualquier forma
- `categories: ['finance', 'productivity']`

---

### 2. Autenticacion con Supabase Auth
**Archivos:**
- `src/components/Auth.jsx` (re-escrito)
- `src/App.jsx` (actualizado)

**Cambios principales:**

| Antes | Ahora |
|-------|-------|
| Campo `username` | Campo `email` |
| Hash manual djb2 | Supabase Auth (bcrypt) |
| `localStorage` para sesion | `getSession()` + `onAuthStateChange` |
| Tabla custom `users` | Supabase Auth (`auth.users`) |

**Flujo de Login:**
```
supabase.auth.signInWithPassword({ email, password })
```

**Flujo de Registro:**
```
supabase.auth.signUp({ email, password })
  → Insert en public.users (solo email)
  → Crear 12 categorias por defecto
```

**Flujo de Logout:**
```
supabase.auth.signOut()
  → onAuthStateChange dispara → setUser(null)
```

**Estado de sesion en App.jsx:**
```javascript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

---

### 3. Recuperacion de Contraseña
**Archivos:**
- `src/components/Auth.jsx` (actualizado)
- `src/App.jsx` (actualizado)
- `src/index.css` (actualizado)

**Vistas implementadas:**
1. Login/Registro (vista principal)
2. Olvide mi contrasena (formulario para enviar email)
3. Nueva contrasena (formulario para cambiar clave)

**Funciones:**
```javascript
// Enviar link de recuperacion
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/`
})

// Actualizar contrasena (el usuario ya tiene sesion temporal)
supabase.auth.updateUser({ password: newPassword })
```

**Deteccion de flujo de recuperacion:**
- Verifica `type=recovery` en URL hash
- Verifica `reset=true` en query params
- Escucha evento `PASSWORD_RECOVERY` de Supabase

**Configuracion requerida en Supabase:**
- Site URL: `http://localhost:5173` (desarrollo)
- Redirect URL: `http://localhost:5173/*`

---

## Base de Datos

### Tablas

**public.users**
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**public.categories**
```sql
-- Columnas: id, user_id, name, icon, type
-- type: 'income' | 'expense'
```

**public.transactions**
```sql
-- Columnas: id, user_id, type, description, amount, category, date
-- type: 'income' | 'expense' | 'saving'
```

**public.todos**
```sql
-- Columnas: id, user_id, title, completed, category, created_at
```

### Politicas RLS
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "categories_user_policy" ON public.categories FOR ALL USING (user_id = auth.uid());
CREATE POLICY "transactions_user_policy" ON public.transactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "todos_user_policy" ON public.todos FOR ALL USING (user_id = auth.uid());
```

---

## Pendiente / Proximos Pasos

1. **RLS en la tabla `public.users`** - Verificar que la politica RLS funcione correctamente
2. **Migrar usuarios existentes** - Los usuarios registrados con el sistema antiguo (username/password_hash) no pueden hacer login con el nuevo sistema
3. **Personalizar email templates** - El email de recuperacion usa el template default de Supabase
4. **Configurar SMTP personalizado** - Para produccion, usar Resend/SendGrid/Brevo en lugar del SMTP default
5. **Separar componentes** - App.jsx tiene 1100+ lineas, idealmente separar en componentes
6. **Tests** - No hay tests unitarios
7. **TypeScript** - Usar .jsx en lugar de .tsx

---

## Comandos

```bash
npm run dev        # Servidor desarrollo
npm run build      # Build produccion
npm run preview    # Previsualizar build
npm run lint       # ESLint
```

---

## Proyecto Supabase

- **Project ID:** vfhfbrgqfhcgdeuudfku
- **Region:** Por defecto
- **Plan:** Free (pausa por inactividad ~1 semana)
- **Dashboard:** https://supabase.com/dashboard/project/vfhfbrgqfhcgdeuudfku
