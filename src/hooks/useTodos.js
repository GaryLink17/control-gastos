import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useTodos({ userId }) {
  const [todos, setTodos] = useState([])
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoCategory, setNewTodoCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const loadTodos = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (data) setTodos(data)
      } catch (err) {
        console.error('Error loading todos:', err)
      }
      setLoading(false)
    }

    loadTodos()
  }, [userId])

  const addTodo = async () => {
    if (!newTodoTitle.trim()) return

    const newTodo = {
      user_id: userId,
      title: newTodoTitle.trim(),
      completed: false,
      category: newTodoCategory || null,
    }

    try {
      const { data: createdTodo, error: insertError } = await supabase
        .from('todos')
        .insert([newTodo])
        .select()
        .limit(1)

      if (insertError) throw insertError
      if (createdTodo && createdTodo.length > 0)
        setTodos((prev) => [createdTodo[0], ...prev])
    } catch (err) {
      console.error('Error adding todo:', err)
    }

    setNewTodoTitle('')
    setNewTodoCategory('')
  }

  const toggleTodo = async (todo) => {
    try {
      await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id)

      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t,
        ),
      )
    } catch (err) {
      console.error('Error updating todo:', err)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await supabase.from('todos').delete().eq('id', id)

      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Error deleting todo:', err)
    }
  }

  return {
    todos, setTodos,
    loading,
    newTodoTitle, setNewTodoTitle,
    newTodoCategory, setNewTodoCategory,
    addTodo,
    toggleTodo,
    deleteTodo,
  }
}
