import { supabase } from './src/supabaseClient.js'

function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

async function testConnection() {
  console.log('🧪 Probando conexión con Supabase...')
  
  try {
    const { data: version, error: versionError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (versionError) {
      console.error('❌ Error de conexión:', versionError.message)
      return
    }
    
    console.log('✅ Conexión exitosa!')
    
    console.log('\n🧪 Verificando tablas...')
    
    const [usersCount, transactionsCount, categoriesCount, todosCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('todos').select('*', { count: 'exact', head: true })
    ])
    
    console.log(`   - Tabla users: ${usersCount.count || 0} registros`)
    console.log(`   - Tabla transactions: ${transactionsCount.count || 0} registros`)
    console.log(`   - Tabla categories: ${categoriesCount.count || 0} registros`)
    console.log(`   - Tabla todos: ${todosCount.count || 0} registros`)
    
    console.log('\n🧪 Creando registros de prueba...')
    
    const testUsername = 'test_user'
    const testPassword = 'test1234'
    const hashedPassword = hashPassword(testPassword)
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', testUsername)
      .limit(1)
    
    let userId
    
    if (existingUser && existingUser.length > 0) {
      console.log('✅ Usuario de prueba ya existe')
      userId = existingUser[0].id
    } else {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{ username: testUsername, password_hash: hashedPassword }])
        .select()
      
      if (userError) {
        console.log('❌ Error al crear usuario:', userError.message)
        return
      }
      
      userId = userData[0].id
      console.log('✅ Usuario de prueba creado:', userId)
    }
    
    console.log('\n🧪 Probando categorías...')
    
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .insert([
        { name: 'Salario', type: 'income', user_id: userId },
        { name: 'Alimentación', type: 'expense', user_id: userId },
        { name: 'Transporte', type: 'expense', user_id: userId }
      ])
      .select()
    
    if (catError) {
      console.log('❌ Error al crear categorías:', catError.message)
    } else {
      console.log('✅ Categorías creadas:', catData?.length || 0)
    }
    
    const { data: incomeCat } = await supabase
      .from('categories')
      .select('id')
      .eq('type', 'income')
      .eq('user_id', userId)
      .limit(1)
      .single()
    
    const { data: expenseCat } = await supabase
      .from('categories')
      .select('id')
      .eq('type', 'expense')
      .eq('user_id', userId)
      .limit(1)
      .single()
    
    console.log('\n🧪 Probando transacciones...')
    
    const { data: transData, error: transError } = await supabase
      .from('transactions')
      .insert([
        { 
          user_id: userId, 
          category_id: incomeCat?.id, 
          amount: 5000.00, 
          description: 'Salario mensual',
          type: 'income',
          date: new Date().toISOString().split('T')[0]
        },
        { 
          user_id: userId, 
          category_id: expenseCat?.id, 
          amount: 150.50, 
          description: 'Compras del supermercado',
          type: 'expense',
          date: new Date().toISOString().split('T')[0]
        }
      ])
      .select()
    
    if (transError) {
      console.log('❌ Error al crear transacciones:', transError.message)
    } else {
      console.log('✅ Transacciones creadas:', transData?.length || 0)
    }
    
    console.log('\n🧪 Probando todos...')
    
    const { data: todoData, error: todoError } = await supabase
      .from('todos')
      .insert([
        { user_id: userId, title: 'Pagar servicios', completed: false },
        { user_id: userId, title: 'Comprar groceries', completed: true }
      ])
      .select()
    
    if (todoError) {
      console.log('❌ Error al crear todos:', todoError.message)
    } else {
      console.log('✅ Todos creados:', todoData?.length || 0)
    }
    
    console.log('\n🧪 Verificando datos finales...')
    
    const [finalUsers, finalTransactions, finalCategories, finalTodos] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('todos').select('*')
    ])
    
    console.log(`   - users: ${finalUsers.data?.length || 0} registros`)
    console.log(`   - transactions: ${finalTransactions.data?.length || 0} registros`)
    console.log(`   - categories: ${finalCategories.data?.length || 0} registros`)
    console.log(`   - todos: ${finalTodos.data?.length || 0} registros`)
    
    if (finalTransactions.data?.length > 0) {
      console.log('\n📋 Transacciones de prueba:')
      finalTransactions.data.forEach(t => {
        console.log(`   - ${t.type}: $${t.amount} - ${t.description}`)
      })
    }
    
    if (finalTodos.data?.length > 0) {
      console.log('\n📋 Todos de prueba:')
      finalTodos.data.forEach(t => {
        console.log(`   - [${t.completed ? 'x' : ' '}] ${t.title}`)
      })
    }
    
    console.log('\n✅ Todas las pruebas pasaron!')
    
  } catch (err) {
    console.error('❌ Error general:', err.message)
  }
  
  process.exit(0)
}

testConnection()
