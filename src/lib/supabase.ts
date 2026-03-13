import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://liacqzbvezvpmluasbld.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYWNxemJ2ZXp2cG1sdWFzYmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjYxNTYsImV4cCI6MjA2MjY0MjE1Nn0.4aR0NiaOJbMYrOWe5_W823hNMOGe3zS3UkBuxgm8U8A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
