import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xxinluhuqvufoeputzvb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4aW5sdWh1cXZ1Zm9lcHV0enZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTAyNDUsImV4cCI6MjAyNjE4NjI0NX0.fKWvLVlrYb2J7Z3eCuKXNyv0tE0ZbzQMG6Pq2HTujUo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
