import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useCategories({ userId }) {
  const [customCategories, setCustomCategories] = useState({
    income: [],
    expense: [],
  })
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState('expense')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦')
  const [showIcons, setShowIcons] = useState(false)
  const [categoryMessage, setCategoryMessage] = useState('')
  const [closingIcons, setClosingIcons] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const loadCategories = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)

      if (data) {
        const income = data
          .filter((c) => c.type === 'income')
          .map((c) => ({ name: c.name, icon: c.icon }))
        const expense = data
          .filter((c) => c.type === 'expense')
          .map((c) => ({ name: c.name, icon: c.icon }))
        setCustomCategories({ income, expense })
      }
      setLoading(false)
    }

    loadCategories()
  }, [userId])

  const addCategory = async () => {
    if (!newCategoryName.trim()) return

    const icon = newCategoryIcon || '📦'
    const newCat = { name: newCategoryName.trim(), icon }

    try {
      await supabase.from('categories').insert([
        { user_id: userId, name: newCat.name, icon: newCat.icon, type: newCategoryType },
      ])
    } catch (err) {
      console.error('Error saving category:', err)
    }

    if (newCategoryType === 'income') {
      setCustomCategories((prev) => ({
        ...prev,
        income: [...(prev.income || []), newCat],
      }))
    } else {
      setCustomCategories((prev) => ({
        ...prev,
        expense: [...(prev.expense || []), newCat],
      }))
    }

    setCategoryMessage(`Categoría "${newCategoryName.trim()}" creada exitosamente`)
    setTimeout(() => setCategoryMessage(''), 3000)
    setNewCategoryName('')
    setNewCategoryIcon('📦')
  }

  const deleteCategory = async (catName, catType) => {
    try {
      await supabase
        .from('categories')
        .delete()
        .eq('user_id', userId)
        .eq('name', catName)
        .eq('type', catType)
    } catch (err) {
      console.error('Error deleting category:', err)
    }

    if (catType === 'income') {
      setCustomCategories((prev) => ({
        ...prev,
        income: (prev.income || []).filter((c) => c.name !== catName),
      }))
    } else {
      setCustomCategories((prev) => ({
        ...prev,
        expense: (prev.expense || []).filter((c) => c.name !== catName),
      }))
    }
  }

  const getCategoryIconByName = (catName) => {
    const all = [
      ...(customCategories.income || []),
      ...(customCategories.expense || []),
    ]
    const found = all.find((c) => c.name === catName)
    return found ? found.icon : '📋'
  }

  const createDefaultCategories = useCallback(async (userId) => {
    const defaultCategories = [
      { name: 'Salario', type: 'income', icon: '💵', user_id: userId },
      { name: 'Freelance', type: 'income', icon: '💻', user_id: userId },
      { name: 'Inversiones', type: 'income', icon: '📈', user_id: userId },
      { name: 'Otros Ingresos', type: 'income', icon: '💰', user_id: userId },
      { name: 'Alimentación', type: 'expense', icon: '🛒', user_id: userId },
      { name: 'Transporte', type: 'expense', icon: '🚗', user_id: userId },
      { name: 'Servicios', type: 'expense', icon: '💡', user_id: userId },
      { name: 'Entretenimiento', type: 'expense', icon: '🎬', user_id: userId },
      { name: 'Salud', type: 'expense', icon: '🏥', user_id: userId },
      { name: 'Shopping', type: 'expense', icon: '🛍️', user_id: userId },
      { name: 'Educación', type: 'expense', icon: '📚', user_id: userId },
      { name: 'Otros Gastos', type: 'expense', icon: '📦', user_id: userId },
    ]
    await supabase.from('categories').insert(defaultCategories)
  }, [])

  const closeIconsModal = () => {
    setClosingIcons(true)
    setTimeout(() => {
      setShowIcons(false)
      setClosingIcons(false)
    }, 200)
  }

  return {
    customCategories, setCustomCategories,
    newCategoryName, setNewCategoryName,
    newCategoryType, setNewCategoryType,
    newCategoryIcon, setNewCategoryIcon,
    showIcons, setShowIcons,
    categoryMessage, setCategoryMessage,
    closingIcons, setClosingIcons,
    loading,
    addCategory,
    deleteCategory,
    getCategoryIconByName,
    closeIconsModal,
    createDefaultCategories,
  }
}
