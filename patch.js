const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
    if (['auth.html', 'admin.html', 'profile.html'].includes(file)) return;
    
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('supabase.js')) {
        content = content.replace('</head>', '    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    <script src="js/supabase.js"></script>\n</head>');
    }

    const navActionsPattern = /<div class="nav-actions">[\s\S]*?<\/div>/g;
    content = content.replace(navActionsPattern, `<div class="nav-actions">
            <button class="icon-btn"><i class="fas fa-search"></i></button>
            <a href="cart.html" class="icon-btn">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count" id="cartCount">0</span>
            </a>
            <a href="auth.html" class="btn-outline auth-link">Log In</a>
            <a href="profile.html" class="btn-outline user-link" style="display: none;">Profile</a>
            <a href="admin.html" class="btn-outline admin-link" style="display: none;">Admin</a>
        </div>`);

    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
});
