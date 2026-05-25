import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Cảnh báo: Chưa cấu hình SUPABASE_URL hoặc SUPABASE_ANON_KEY trong file .env");
}

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseAnonKey || 'dummy');
