import { createClient } from '@supabase/supabase-js';

// Đặt giá trị mặc định có cấu trúc URL hợp lệ để tránh crash ứng dụng khi chưa điền env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
