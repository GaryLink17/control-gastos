-- Deshabilitar RLS temporalmente para pruebas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- O si prefieres mantener RLS, crear políticas públicas (para desarrollo):
-- CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all" ON transactions FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all" ON categories FOR ALL USING (true) WITH CHECK (true);
