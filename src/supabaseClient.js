import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iaoizvwznxybdbjystvm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhb2l6dnd6bnh5YmRianlzdHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDg5NjEsImV4cCI6MjA4OTA4NDk2MX0.jxSQjUMyNuJxs20XWP3rxYazwoUYQVUJVwgUwqDCECo'

export const supabase = createClient(supabaseUrl, supabaseKey)
