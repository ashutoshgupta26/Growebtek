const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahjdy3me.us-east.insforge.app';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTAzMDd9.rjUfyRfj0Ff4n2AxLVOGBV-Rb5mbVerIM4TOAcU1Kwo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  console.log('Signing up admin...');
  const { data, error } = await supabase.auth.signUp({
    email: 'growebtekadmin@growebtek.com',
    password: 'ashu2237',
    options: {
      data: {
        full_name: 'Admin'
      }
    }
  });

  let userId;

  if (error) {
    if (error.message.includes('already registered')) {
        console.log('Admin already registered. Logging in...');
        const login = await supabase.auth.signInWithPassword({
            email: 'growebtekadmin@growebtek.com',
            password: 'ashu2237'
        });
        if (login.error) {
            console.error('Login failed:', login.error);
            return;
        }
        userId = login.data.user.id;
        console.log('Logged in as admin. ID:', userId);
    } else {
        console.error('Sign up error:', error);
        return;
    }
  } else {
    userId = data.user.id;
    console.log('Admin signed up. User ID:', userId);
  }

  console.log('Setting admin flag via RPC...');
  const rpc = await supabase.rpc('set_admin', { user_id: userId });
  console.log('RPC result:', rpc);
  
  // also delete the set_admin rpc to secure the database!
  console.log('Please drop set_admin function manually via CLI to secure the DB.');
}

setupAdmin();
