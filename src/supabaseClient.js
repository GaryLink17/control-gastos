import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vfhfbrgqfhcgdeuudfku.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaGZicmdxZmhjZ2RldXVkZmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzA4OTUsImV4cCI6MjA4ODMwNjg5NX0.Xue-VRO3J5zPmwgALxt852I2YvueUtGaqov30gcvfx4'

export const supabase = createClient(supabaseUrl, supabaseKey)
