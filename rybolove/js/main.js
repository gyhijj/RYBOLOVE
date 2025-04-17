// Main JavaScript file

// Initialize DOM elements when content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to body
    document.body.classList.add('fade-in');
    
    // Mobile menu functionality
    setupMobileMenu();
    
    // Populate categories
    populateCategories();
    
    // Populate featured products on homepage
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        populateFeaturedProducts();
        setupAnimations();
    }
    
    // Handle newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                showNotification('Спасибо за подписку!', 'success');
                this.reset();
            }
        });
    }
    
    // If on category page
    if (window.location.pathname.includes('category.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = parseInt(urlParams.get('id'));
        if (categoryId) {
            displayCategoryProducts(categoryId);
        }
    }
    
    // If on product details page
    if (window.location.pathname.includes('product.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        if (productId) {
            displayProductDetails(productId);
        }
    }
    
    // If on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        setupCheckoutPage();
    }
    
    // Setup address modal
    setupAddressModal();
    
    // Setup order details modal
    setupOrderDetailsModal();
});

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            // Create mobile menu if it doesn't exist
            let mobileMenu = document.querySelector('.mobile-menu');
            let overlay = document.querySelector('.mobile-menu-overlay');
            
            if (!mobileMenu) {
                // Create overlay
                overlay = document.createElement('div');
                overlay.className = 'mobile-menu-overlay';
                document.body.appendChild(overlay);
                
                // Create mobile menu
                mobileMenu = document.createElement('div');
                mobileMenu.className = 'mobile-menu';
                
                mobileMenu.innerHTML = `
                    <span class="mobile-menu-close"><i class="fas fa-times"></i></span>
                    <ul>
                        <li><a href="index.html">Главная</a></li>
                        <li class="mobile-menu-dropdown-parent">
                            <a href="#" class="mobile-dropdown-toggle">Каталог <i class="fas fa-angle-down"></i></a>
                            <ul class="mobile-menu-dropdown" id="mobile-categories">
                                <!-- Categories will be populated with JavaScript -->
                            </ul>
                        </li>
                        <li><a href="pages/about.html">О нас</a></li>
                        <li><a href="pages/profile.html" id="mobile-profile-link">Личный кабинет</a></li>
                        <li><a href="pages/cart.html">Корзина <span id="mobile-cart-count" class="mobile-cart-count">0</span></a></li>
                    </ul>
                `;
                
                document.body.appendChild(mobileMenu);
                
                // Update mobile cart count
                const mobileCartCount = document.getElementById('mobile-cart-count');
                if (mobileCartCount) {
                    const cartItems = cart.reduce((total, item) => total + item.quantity, 0);
                    mobileCartCount.textContent = cartItems;
                }
                
                // Populate categories in mobile menu
                const mobileCategoriesContainer = document.getElementById('mobile-categories');
                if (mobileCategoriesContainer) {
                    categories.forEach(category => {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="pages/category.html?id=${category.id}">${category.name}</a>`;
                        mobileCategoriesContainer.appendChild(li);
                    });
                }
                
                // Toggle mobile dropdown
                const mobileDropdownToggle = document.querySelector('.mobile-dropdown-toggle');
                const mobileDropdown = document.querySelector('.mobile-menu-dropdown');
                
                if (mobileDropdownToggle && mobileDropdown) {
                    mobileDropdownToggle.addEventListener('click', function(e) {
                        e.preventDefault();
                        mobileDropdown.classList.toggle('active');
                        this.classList.toggle('active');
                    });
                }
                
                // Close mobile menu
                const closeBtn = document.querySelector('.mobile-menu-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        mobileMenu.classList.remove('active');
                        overlay.classList.remove('active');
                    });
                }
                
                // Close mobile menu when clicking on overlay
                overlay.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    overlay.classList.remove('active');
                });
            }
            
            // Toggle mobile menu
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
        });
    }
}

// Populate categories in header dropdown and footer
function populateCategories() {
    const categoriesDropdown = document.getElementById('categories-dropdown');
    const footerCategories = document.getElementById('footer-categories');

    const path = window.location.pathname;
    const inPages = path.includes('/pages/');
    const prefix = inPages ? '' : 'pages/';

    if (categoriesDropdown) {
        categoriesDropdown.innerHTML = '';
        categories.forEach(category => {
            const a = document.createElement('a');
            a.href = `${prefix}category.html?id=${category.id}`;
            a.textContent = category.name;

            a.addEventListener('click', function (e) {
                if (window.location.pathname.includes('category.html')) {
                    e.preventDefault();
                    history.pushState({}, '', this.href);
                    handleCategoryChange();
                }
            });

            categoriesDropdown.appendChild(a);
        });
    }

    if (footerCategories) {
        footerCategories.innerHTML = '';
        categories.forEach(category => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `${prefix}category.html?id=${category.id}`;
            a.textContent = category.name;
            li.appendChild(a);
            footerCategories.appendChild(li);
        });
    }

    const categoriesGrid = document.getElementById('categories-grid');
    if (categoriesGrid) {
        categoriesGrid.innerHTML = '';
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <a href="${prefix}category.html?id=${category.id}">
                    <img src="${category.image}" alt="${category.name}">
                    <div class="category-card-content">
                        <h3>${category.name}</h3>
                        <p>${category.description}</p>
                    </div>
                </a>
            `;
            categoriesGrid.appendChild(categoryCard);
        });
    }
}

    // Populate categories grid on homepage
    const categoriesGrid = document.getElementById('categories-grid');
    if (categoriesGrid) {
        categoriesGrid.innerHTML = '';
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            
            categoryCard.innerHTML = `
                <a href="pages/category.html?id=${category.id}">
                    <img src="${category.image}" alt="${category.name}">
                    <div class="category-card-content">
                        <h3>${category.name}</h3>
                        <p>${category.description}</p>
                    </div>
                </a>
            `;
            
            categoriesGrid.appendChild(categoryCard);
        });
    }


// Populate featured products on homepage
function populateFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products');
    
    if (featuredProductsContainer) {
        featuredProductsContainer.innerHTML = '';
        
        // Get featured products
        const featured = products.filter(product => featuredProductIds.includes(product.id));
        
        featured.forEach(product => {
            const productCard = createProductCard(product);
            featuredProductsContainer.appendChild(productCard);
        });
    }
}

// Create product card HTML element
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    // Calculate discount percentage
    let discountPercent = '';
    if (product.oldPrice) {
        const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        discountPercent = `<span class="discount-percent">-${discount}%</span>`;
    }
    
    // Generate rating stars
    let stars = '';
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    // Определяем правильный путь к странице продукта в зависимости от текущей страницы
    const isHomepage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    const productPath = isHomepage ? 'pages/product.html' : 'product.html';
    
    productCard.innerHTML = `
        <div class="product-image">
            <a href="${productPath}?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
            </a>
            ${product.isNew ? '<span class="product-badge badge-new">Новинка</span>' : ''}
            ${product.isSale ? '<span class="product-badge badge-sale">Скидка</span>' : ''}
        </div>
        <div class="product-details">
            <a href="${productPath}?id=${product.id}" class="product-title">${product.name}</a>
            <div class="product-category">${product.categoryName}</div>
            <div class="product-rating">
                <div class="rating-stars">${stars}</div>
                <div class="rating-count">(${product.ratingCount})</div>
            </div>
            <div class="product-price">
                <span class="current-price">${product.price.toLocaleString()} ₽</span>
                ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                ${discountPercent}
            </div>
            <div class="product-actions">
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> В корзину
                </button>
            </div>
        </div>
    `;
    
    return productCard;
}

// Display products for a specific category
function displayCategoryProducts(categoryId) {
    const categoryTitleElement = document.getElementById('category-title');
    const productsContainer = document.getElementById('category-products');
    const categoryDescriptionElement = document.getElementById('category-description');
    
    if (!productsContainer) return;
    
    // Find category
    const category = categories.find(cat => cat.id === categoryId);
    
    if (!category) {
        window.location.href = '/index.html';
        return;
    }
    
    // Update page title and description
    if (categoryTitleElement) categoryTitleElement.textContent = category.name;
    if (categoryDescriptionElement) categoryDescriptionElement.textContent = category.description;
    document.title = `${category.name} - РыбоLove`;
    
    // Filter products by category
    const categoryProducts = products.filter(product => product.category === categoryId);
    
    if (categoryProducts.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">В данной категории пока нет товаров.</p>';
        return;
    }
    
    // Display products
    productsContainer.innerHTML = '';
    categoryProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
    
    // Setup filter controls
    setupProductFilters(categoryProducts, productsContainer);
}

// Setup product filters
function setupProductFilters(categoryProducts, container) {
    const sortSelect = document.getElementById('sort-select');
    const filterButtons = document.querySelectorAll('.filter-button');
    
    let currentProducts = [...categoryProducts];
    
    // Sort products
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const value = this.value;
            
            switch(value) {
                case 'price-asc':
                    currentProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    currentProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'popularity':
                    currentProducts.sort((a, b) => b.ratingCount - a.ratingCount);
                    break;
                case 'rating':
                    currentProducts.sort((a, b) => b.rating - a.rating);
                    break;
                default:
                    currentProducts = [...categoryProducts]; // Reset to original order
            }
            
            // Update display
            updateProductDisplay(currentProducts, container);
        });
    }
    
    // Filter products
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.dataset.filter;
                
                // Toggle active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                switch(filter) {
                    case 'all':
                        currentProducts = [...categoryProducts];
                        break;
                    case 'sale':
                        currentProducts = categoryProducts.filter(product => product.isSale);
                        break;
                    case 'new':
                        currentProducts = categoryProducts.filter(product => product.isNew);
                        break;
                }
                
                // Apply current sort
                if (sortSelect) {
                    const sortValue = sortSelect.value;
                    if (sortValue !== 'default') {
                        const event = new Event('change');
                        sortSelect.dispatchEvent(event);
                        return; // The updateProductDisplay is called in the sort event handler
                    }
                }
                
                // Update display
                updateProductDisplay(currentProducts, container);
            });
        });
    }
}

// Update product display after filtering/sorting
function updateProductDisplay(products, container) {
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">Нет товаров, соответствующих выбранным фильтрам.</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Display product details
function displayProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        window.location.href = '/index.html';
        return;
    }
    
    // Update page title
    document.title = `${product.name} - РыбоLove`;
    
    // Update product details elements
    const productTitleElement = document.getElementById('product-title');
    const productPriceElement = document.getElementById('product-price');
    const productOldPriceElement = document.getElementById('product-old-price');
    const productRatingElement = document.getElementById('product-rating');
    const productRatingCountElement = document.getElementById('product-rating-count');
    const productCategoryElement = document.getElementById('product-category');
    const productDescriptionElement = document.getElementById('product-description');
    const productFeaturesElement = document.getElementById('product-features');
    const productStockElement = document.getElementById('product-stock');
    const productGalleryElement = document.getElementById('product-gallery');
    const productThumbnailsElement = document.getElementById('product-thumbnails');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const quantityInput = document.getElementById('quantity-input');
    
    if (productTitleElement) productTitleElement.textContent = product.name;
    if (productPriceElement) productPriceElement.textContent = product.price.toLocaleString() + ' ₽';
    
    // Old price
    if (productOldPriceElement) {
        if (product.oldPrice) {
            productOldPriceElement.textContent = product.oldPrice.toLocaleString() + ' ₽';
            productOldPriceElement.style.display = 'inline-block';
            
            // Calculate discount percentage
            const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
            const discountElement = document.createElement('span');
            discountElement.className = 'discount-percent';
            discountElement.textContent = `-${discount}%`;
            productOldPriceElement.after(discountElement);
        } else {
            productOldPriceElement.style.display = 'none';
        }
    }
    
    // Rating stars
    if (productRatingElement) {
        productRatingElement.innerHTML = '';
        
        const fullStars = Math.floor(product.rating);
        const halfStar = product.rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            if (i <= fullStars) {
                star.className = 'fas fa-star';
            } else if (i === fullStars + 1 && halfStar) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
            productRatingElement.appendChild(star);
        }
    }
    
    if (productRatingCountElement) productRatingCountElement.textContent = product.ratingCount;
    if (productCategoryElement) {
        productCategoryElement.textContent = product.categoryName;
        productCategoryElement.href = `category.html?id=${product.category}`;
    }
    if (productDescriptionElement) productDescriptionElement.textContent = product.description;
    
    // Product features
    if (productFeaturesElement) {
        productFeaturesElement.innerHTML = '';
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            productFeaturesElement.appendChild(li);
        });
    }
    
    // Stock status
    if (productStockElement) {
        if (product.stock > 10) {
            productStockElement.textContent = 'В наличии';
            productStockElement.className = 'in-stock';
        } else if (product.stock > 0) {
            productStockElement.textContent = `Осталось всего ${product.stock} шт.`;
            productStockElement.className = 'low-stock';
        } else {
            productStockElement.textContent = 'Нет в наличии';
            productStockElement.className = 'out-of-stock';
        }
    }
    
    // Product gallery
    if (productGalleryElement && productThumbnailsElement) {
        // Main image
        const mainImage = document.createElement('img');
        mainImage.id = 'main-product-image';
        mainImage.src = product.images[0];
        mainImage.alt = product.name;
        productGalleryElement.innerHTML = '';
        productGalleryElement.appendChild(mainImage);
        
        // Thumbnails
        productThumbnailsElement.innerHTML = '';
        product.images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'product-thumbnail';
            if (index === 0) thumbnail.classList.add('active');
            
            thumbnail.innerHTML = `<img src="${image}" alt="${product.name}">`;
            productThumbnailsElement.appendChild(thumbnail);
            
            // Click event to change main image
            thumbnail.addEventListener('click', function() {
                document.getElementById('main-product-image').src = image;
                
                // Update active thumbnail
                document.querySelectorAll('.product-thumbnail').forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Add to cart button
    if (addToCartBtn) {
        addToCartBtn.dataset.id = product.id;
        
        // Update button state based on stock
        if (product.stock <= 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Нет в наличии';
        }
    }
    
    // Quantity input
    if (quantityInput) {
        quantityInput.max = product.stock;
        
        // Quantity increase/decrease buttons
        const decreaseBtn = document.querySelector('.quantity-decrease');
        const increaseBtn = document.querySelector('.quantity-increase');
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', function() {
                if (quantityInput.value > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                }
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', function() {
                if (parseInt(quantityInput.value) < product.stock) {
                    quantityInput.value = parseInt(quantityInput.value) + 1;
                } else {
                    showNotification('Достигнуто максимальное количество товара на складе', 'error');
                }
            });
        }
        
        // Custom add to cart with quantity
        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            
            if (quantity > 0 && quantity <= product.stock) {
                addToCart(product.id, quantity);
            } else {
                showNotification('Пожалуйста, выберите корректное количество', 'error');
            }
        });
    }
    
    // Related products
    const relatedProductsContainer = document.getElementById('related-products');
    if (relatedProductsContainer) {
        // Get products from the same category (excluding current product)
        const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id);
        
        // Show up to 4 related products
        const productsToShow = relatedProducts.slice(0, 4);
        
        relatedProductsContainer.innerHTML = '';
        
        if (productsToShow.length === 0) {
            relatedProductsContainer.parentElement.style.display = 'none';
        } else {
            productsToShow.forEach(relatedProduct => {
                const productCard = createProductCard(relatedProduct);
                relatedProductsContainer.appendChild(productCard);
            });
        }
    }
}

// Setup checkout page functionality
function setupCheckoutPage() {
    if (!cart || cart.length === 0) {
        window.location.href = '/pages/cart.html';
        return;
    }
    
    // Address selection
    const addressSelect = document.getElementById('address-select');
    const addressForm = document.getElementById('address-form');
    
    if (addressSelect && addressForm) {
        addressSelect.addEventListener('change', function() {
            const value = this.value;
            
            if (value === 'new') {
                addressForm.style.display = 'block';
            } else {
                addressForm.style.display = 'none';
            }
        });
        
        // If user is logged in, populate address dropdown
        if (isLoggedIn()) {
            const userData = getUserData();
            
            if (userData && userData.addresses && userData.addresses.length > 0) {
                // Remove "loading" option if it exists
                const loadingOption = addressSelect.querySelector('option[value="loading"]');
                if (loadingOption) {
                    addressSelect.removeChild(loadingOption);
                }
                
                // Add addresses to dropdown
                userData.addresses.forEach(address => {
                    const option = document.createElement('option');
                    option.value = address.id;
                    option.textContent = `${address.fullName}, ${address.city}, ${address.street}`;
                    
                    // Insert before the "new address" option
                    const newAddressOption = addressSelect.querySelector('option[value="new"]');
                    addressSelect.insertBefore(option, newAddressOption);
                });
            } else {
                // No saved addresses
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'У вас нет сохраненных адресов';
                option.disabled = true;
                
                // Replace "loading" option
                const loadingOption = addressSelect.querySelector('option[value="loading"]');
                if (loadingOption) {
                    addressSelect.replaceChild(option, loadingOption);
                } else {
                    // Insert before the "new address" option
                    const newAddressOption = addressSelect.querySelector('option[value="new"]');
                    addressSelect.insertBefore(option, newAddressOption);
                }
                
                // Select "new address" option
                addressSelect.value = 'new';
                addressForm.style.display = 'block';
            }
        } else {
            // Not logged in
            addressSelect.innerHTML = '';
            
            const option = document.createElement('option');
            option.value = 'new';
            option.textContent = 'Новый адрес';
            addressSelect.appendChild(option);
            
            addressForm.style.display = 'block';
        }
    }
    
    // Order form submission
    const orderForm = document.getElementById('checkout-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const formData = new FormData(orderForm);
            const addressId = formData.get('address');
            let address;
            
            if (addressId === 'new') {
                // Collect address from form
                address = {
                    fullName: formData.get('fullName'),
                    street: formData.get('street'),
                    city: formData.get('city'),
                    postalCode: formData.get('postalCode'),
                    phone: formData.get('phone')
                };
                
                // Validate address form
                const requiredFields = ['fullName', 'street', 'city', 'postalCode', 'phone'];
                const missingFields = requiredFields.filter(field => !address[field]);
                
                if (missingFields.length > 0) {
                    showNotification('Пожалуйста, заполните все обязательные поля адреса', 'error');
                    return;
                }
                
                // Save address if user is logged in and checkbox is checked
                if (isLoggedIn() && formData.get('saveAddress')) {
                    addAddress(address);
                }
            } else {
                // Get saved address from user data
                const userData = getUserData();
                if (userData && userData.addresses) {
                    address = userData.addresses.find(addr => addr.id === parseInt(addressId));
                }
                
                if (!address) {
                    showNotification('Ошибка при выборе адреса', 'error');
                    return;
                }
            }
            
            // Calculate order totals
            const subtotal = calculateCartTotal();
            const delivery = subtotal >= 5000 ? 0 : 499;
            const total = subtotal + delivery;
            
            // Create order data
            const orderData = {
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                address: address,
                subtotal: subtotal,
                delivery: delivery,
                total: total,
                paymentMethod: formData.get('payment')
            };
            
            // Add order to user data if logged in
            let orderId;
            if (isLoggedIn()) {
                orderId = addOrder(orderData);
            } else {
                // Generate order ID for non-logged in users
                orderId = 'ORD-' + Date.now();
            }
            
            // Clear cart
            clearCart();
            
            // Show success message
            showOrderConfirmation(orderId);
        });
    }
}

// Show order confirmation after successful checkout
function showOrderConfirmation(orderId) {
    // Hide checkout form and order summary
    const checkoutForm = document.getElementById('checkout-form');
    const orderSummary = document.querySelector('.order-summary');
    const checkoutTitle = document.querySelector('.checkout-page h1');
    
    if (checkoutForm) checkoutForm.style.display = 'none';
    if (orderSummary) orderSummary.style.display = 'none';
    if (checkoutTitle) checkoutTitle.textContent = 'Заказ успешно оформлен';
    
    // Show confirmation message
    const confirmationContainer = document.getElementById('order-confirmation');
    if (confirmationContainer) {
        confirmationContainer.style.display = 'block';
        
        // Add order ID to confirmation message
        const orderIdElement = document.getElementById('confirmation-order-id');
        if (orderIdElement && orderId) {
            orderIdElement.textContent = orderId;
        }
    }
}

// Setup address modal functionality in profile page
function setupAddressModal() {
    const addAddressBtn = document.getElementById('add-address-btn');
    const addAddressModal = document.getElementById('add-address-modal');
    const closeButtons = document.querySelectorAll('.modal .close');
    
    if (addAddressBtn && addAddressModal) {
        addAddressBtn.addEventListener('click', function() {
            addAddressModal.style.display = 'block';
        });
    }
    
    if (closeButtons.length > 0) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Setup animations for various page elements
function setupAnimations() {
    // Animate hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('slide-in-bottom');
    }
    
    // Animate section titles with a slight delay
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('fade-in');
        title.style.animationDelay = '0.2s';
    });
    
    // Add staggered animations to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card, index) => {
        card.classList.add('stagger-item', 'scale-in');
        // Animations are already staggered via CSS classes
    });
    
    // Add staggered animations to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.classList.add('stagger-item', 'fade-in');
        // Animations are already staggered via CSS classes
    });
    
    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.classList.add('btn-hover-effect');
    });
    
    // Add zoom effect to product images
    const productImages = document.querySelectorAll('.product-image');
    productImages.forEach(imageContainer => {
        imageContainer.classList.add('zoom-effect');
    });
    
    // Add animation to the footer social icons
    const socialIcons = document.querySelectorAll('.social-icons a');
    socialIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${0.1 * index}s`;
        icon.classList.add('scale-in');
    });
}

// Setup order details modal in profile page
function setupOrderDetailsModal() {
    const closeButtons = document.querySelectorAll('.modal .close');
    
    if (closeButtons.length > 0) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
}
// Обновляем категорию при изменении URL (например, при переходе по меню)
window.addEventListener('popstate', handleCategoryChange);
window.addEventListener('pushstate', handleCategoryChange);
window.addEventListener('replacestate', handleCategoryChange);

function handleCategoryChange() {
    if (window.location.pathname.includes('category.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = parseInt(urlParams.get('id'));
        if (categoryId) {
            displayCategoryProducts(categoryId);
        }
    }
}

// Переопределение pushState/replacestate чтобы отлавливать
(function(history) {
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function() {
        pushState.apply(history, arguments);
        window.dispatchEvent(new Event('pushstate'));
    };

    history.replaceState = function() {
        replaceState.apply(history, arguments);
        window.dispatchEvent(new Event('replacestate'));
    };
})(window.history);
