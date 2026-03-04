import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dytwxvurodzfpqnhgzgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHd4dnVyb2R6ZnBxbmhnemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzE4OTksImV4cCI6MjA4NTYwNzg5OX0.1sOO4PQetEaYevCxRR1Ey48wTYLsd3zpGaI8eAUpX-o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});
