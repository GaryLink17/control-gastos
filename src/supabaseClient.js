import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vfhfbrgqfhcgdeuudfku.supabase.co'
const supabaseKey = 'sb_publishable_3ToM45q3STC7Qvtc6XYBiA_6FeMFxV3'

export const supabase = createClient(supabaseUrl, supabaseKey)
