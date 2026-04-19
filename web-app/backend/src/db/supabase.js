const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Fail gracefully if not configured during prototype initial mock run
const supabase = supabaseUrl && supabaseUrl !== 'your_supabase_project_url' 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

module.exports = supabase;
