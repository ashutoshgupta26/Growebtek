const { execSync } = require('child_process');
const fs = require('fs');

const sql = fs.readFileSync('schema.sql', 'utf8');

// split by ; but ignore ; inside strings/functions
// An easier way is just to run the whole thing via child_process if we pass it directly?
// Let's try passing the whole file via stdin.
try {
  console.log('Trying to pipe schema.sql to db query...');
  execSync('npx.cmd @insforge/cli db query < schema.sql', { stdio: 'inherit' });
} catch (e) {
  console.log('Pipe failed, trying statement by statement...');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    if (statement.startsWith('-- Create admin user function') || statement.includes('FUNCTION public.handle_new_user()')) {
        // Skip complex plpgsql for now if simple split breaks it.
        // Actually, plpgsql has $$ which contains ; inside. simple split will break it!
        continue;
    }
    
    try {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      execSync(`npx.cmd @insforge/cli db query "${statement.replace(/"/g, '\\"')}"`);
    } catch (err) {
      console.error(`Failed: ${statement}`);
      console.error(err.message);
    }
  }
}
