// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Replace with your actual Supabase project URL and anon key
const supabaseUrl='https://jlclgonwsvnlpyholvd.supabase.co';
const supabaseAnonKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsY2xjZ29ud3N2bmxweWhvbHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTY2MjQsImV4cCI6MjA3NDIzMjYyNH0.JHx0Q7HcOjS4lsw2GXwU_WHrICQ0it-bhd0Z64ZoBPY

export const supabase = createClient(supabaseUrl, supabaseKey);
