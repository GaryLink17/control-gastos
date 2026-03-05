import { supabase } from './src/supabaseClient.js'

async function testConnection() {
  console.log('🧪 Probando conexión con Supabase...')
  
  try {
    // Test 1: Conexión básica
    const { data: version, error: versionError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (versionError) {
      console.error('❌ Error de conexión:', versionError.message)
      return
    }
    
    console.log('✅ Conexión exitosa!')
    
    // Test 2: Intentar crear un usuario de prueba
    console.log('\n🧪 Test: Crear usuario de prueba...')
    
    // Primero verificar si existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'test_user')
      .limit(1)
    
    if (existingUser && existingUser.length > 0) {
      console.log('✅ Usuario de prueba ya existe')
    } else {
      // Crear hash simple para la contraseña
      const hashPassword = (password) => {
        let hash = 0
        for (let i = 0; i < password.length; i++) {
          const char = password.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        return hash.toString(16)
      }
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          username: 'test_user',
          password_hash: hashPassword('test1234')
        }])
      
      if (insertError) {
        console.log('❌ Error al crear usuario:', insertError.message)
      } else {
        console.log('✅ Usuario de prueba creado exitosamente')
      }
    }
    
    // Test 3: Verificar tablas
    console.log('\n🧪 Verificando tablas...')
    
    const [usersCount, transactionsCount, categoriesCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true })
    ])
    
    console.log(`   - Tabla users: ${usersCount.count || 0} registros`)
    console.log(`   - Tabla transactions: ${transactionsCount.count || 0} registros`)
    console.log(`   - Tabla categories: ${categoriesCount.count || 0} registros`)
    
    console.log('\n✅ Todas las pruebas pasaron!')
    
  } catch (err) {
    console.error('❌ Error general:', err.message)
  }
  
  process.exit(0)
}

testConnection()
