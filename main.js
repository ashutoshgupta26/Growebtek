const productsDB = {
  'analytics': {
    title: 'AI Analytics Dashboard',
    category: 'Web App Development',
    desc: 'Real-time data visualization and AI predictive modeling platform for enterprises.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    priceMonthly: '₹1,499 / month',
    priceAnnually: '₹14,390 / year',
    rawPrice: 1499
  },
  'seo': {
    title: 'Enterprise SEO Suite',
    category: 'Digital Marketing',
    desc: 'A comprehensive digital marketing strategy powered by machine learning algorithms. We analyze your competitors, optimize your content, and build a high-authority backlink profile to ensure your business dominates search results.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    priceMonthly: '₹899 / month',
    priceAnnually: '₹8,630 / year',
    rawPrice: 899
  },
  'custom-web': {
    title: 'Custom AI Web Application',
    category: 'Web App Development',
    desc: 'Full-stack web application development integrated with custom machine learning models.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    priceMonthly: '₹2,999 / setup',
    priceAnnually: 'Custom pricing',
    rawPrice: 2999
  },
  'brand': {
    title: 'Brand Identity Package',
    category: 'Graphic Design',
    desc: 'Complete corporate branding including logos, typography, and visual guidelines.',
    img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1200',
    priceMonthly: '₹1,200 / package',
    priceAnnually: 'N/A',
    rawPrice: 1200
  },
  'it': {
    title: '24/7 Managed IT Services',
    category: 'IT Support',
    desc: 'Proactive monitoring and technical support with AI-driven incident resolution.',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    priceMonthly: '₹499 / month',
    priceAnnually: '₹4,790 / year',
    rawPrice: 499
  },
  'amc': {
    title: 'Hardware AMC Plan',
    category: 'Repair & AMC',
    desc: 'Annual maintenance contract covering all workstation and server hardware.',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    priceMonthly: '₹199 / month',
    priceAnnually: '₹1,999 / year',
    rawPrice: 199
  },
  'ecommerce': {
    title: 'E-Commerce Platform Setup',
    category: 'Web App Development',
    desc: 'End-to-end e-commerce development with AI product recommendation engine.',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    priceMonthly: '₹4,500 / setup',
    priceAnnually: 'Custom pricing',
    rawPrice: 4500
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // --- Cart State Management ---
  let cart = JSON.parse(localStorage.getItem('growebtek_cart')) || [];
  
  const updateCartCountUI = () => {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.innerText = totalQty;
    });
  };
  updateCartCountUI();

  // --- Scroll Animations ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // --- Login Modal ---
  const loginModal = document.getElementById('loginModal');
  const loginBtn = document.getElementById('loginBtn');
  const closeModalBtns = document.querySelectorAll('.close-modal');

  if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.classList.add('active');
    });
  }
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (loginModal) loginModal.classList.remove('active');
    });
  });
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.remove('active');
    }
  });

  // --- Dynamic Product Page Population ---
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (productId && productsDB[productId] && document.getElementById('productTitle')) {
    const p = productsDB[productId];
    document.getElementById('productTitle').innerText = p.title;
    document.getElementById('productCategory').innerText = p.category;
    document.getElementById('productDesc').innerText = p.desc;
    document.getElementById('productImg').src = p.img;
    document.getElementById('priceMonthly').innerText = p.priceMonthly;
    document.getElementById('priceAnnually').innerText = p.priceAnnually;
  }

  // --- Subscription plan selection ---
  let selectedPlan = 'Monthly';
  const subPlans = document.querySelectorAll('.sub-plan');
  subPlans.forEach(plan => {
    plan.addEventListener('click', function() {
      subPlans.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      selectedPlan = this.querySelector('.sub-plan-name').innerText;
    });
  });

  // --- Add to Cart ---
  const addToCartBtn = document.getElementById('addToCartBtn');
  const qtyInput = document.querySelector('.qty-input');
  
  if (addToCartBtn && productId && productsDB[productId]) {
    addToCartBtn.addEventListener('click', () => {
      const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
      
      // Check if already in cart
      const existingItem = cart.find(item => item.id === productId && item.plan === selectedPlan);
      if (existingItem) {
        existingItem.qty += qty;
      } else {
        cart.push({ id: productId, qty: qty, plan: selectedPlan });
      }
      
      localStorage.setItem('growebtek_cart', JSON.stringify(cart));
      updateCartCountUI();
      
      // Button Animation
      const originalText = addToCartBtn.innerText;
      addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
      addToCartBtn.style.background = 'var(--accent-orange)';
      
      setTimeout(() => {
        addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        addToCartBtn.style.background = 'var(--primary-blue)';
      }, 2000);
    });
  }

  // --- Cart Page Rendering ---
  const cartContainer = document.getElementById('cartItemsContainer');
  if (cartContainer) {
    const renderCart = () => {
      cartContainer.innerHTML = '';
      let subtotal = 0;

      if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Your cart is empty. <a href="products.html" style="color: var(--primary-blue);">Browse Services</a></p>';
      } else {
        cart.forEach((item, index) => {
          const product = productsDB[item.id];
          if (!product) return;
          
          const itemTotal = product.rawPrice * item.qty;
          subtotal += itemTotal;

          const cartItemHTML = `
            <div class="cart-item">
                <img src="${product.img}" alt="${product.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h3 style="font-size: 1.1rem;">${product.title}</h3>
                        <span style="font-weight: 700;">₹${product.rawPrice.toLocaleString('en-IN')}.00</span>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">Subscription: ${item.plan}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="color: var(--text-main); font-weight: 600;">Qty: ${item.qty}</div>
                        <button class="icon-btn remove-btn" data-index="${index}" style="color: #ef4444; font-size: 1rem;"><i class="fas fa-trash-alt"></i> Remove</button>
                    </div>
                </div>
            </div>
          `;
          cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });
      }

      // Update Summary
      const taxes = subtotal * 0.10; // 10% tax
      const total = subtotal + taxes;
      
      document.getElementById('cartSubtotal').innerText = `₹${subtotal.toLocaleString('en-IN')}.00`;
      document.getElementById('cartTaxes').innerText = `₹${taxes.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      document.getElementById('cartTotal').innerText = `₹${total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

      // Attach remove listeners
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-index'));
          cart.splice(idx, 1);
          localStorage.setItem('growebtek_cart', JSON.stringify(cart));
          updateCartCountUI();
          renderCart();
        });
      });
    };
    renderCart();
  }

  // --- Category Filtering ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card[data-category]');

  if (filterBtns.length > 0 && productCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        productCards.forEach(card => {
          if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }
});
