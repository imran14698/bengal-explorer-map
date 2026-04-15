import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbshwdmjugwzererdhup.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhic2h3ZG1qdWd3emVyZXJkaHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODc3ODIsImV4cCI6MjA5MTg2Mzc4Mn0.50T3WUC0cTTY8buptks8Oac3g7_QHDTTIo1U_Dd-u1g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
