// Shopping Cart Functionality

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count badge
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        // Make the badge visible only if there are items
        if (totalItems > 0) {
            cartCountElement.style.display = 'flex';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

// Add item to cart
function addToCart(productId, quantity = 1) {
    // Find the product from products array
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Товар не найден', 'error');
        return;
    }
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Update quantity if already in cart
        cart[existingItemIndex].quantity += quantity;
        showNotification('Количество товара обновлено в корзине', 'success');
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
        showNotification('Товар добавлен в корзину', 'success');
    }
    
    // Save cart to localStorage
    saveCart();
    
    // Update cart count
    updateCartCount();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    
    // If on cart page, update cart display
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    showNotification('Товар удален из корзины', 'success');
}

// Update item quantity in cart
function updateCartItemQuantity(productId, quantity) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (quantity > 0) {
            cart[itemIndex].quantity = quantity;
            showNotification('Количество товара обновлено', 'success');
        } else {
            removeFromCart(productId);
        }
        
        saveCart();
        updateCartCount();
        
        // If on cart page, update cart display
        if (window.location.pathname.includes('cart.html')) {
            displayCart();
        }
    }
}

// Calculate cart total
function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Display cart on cart page
function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartEmptyMessage = document.getElementById('cart-empty');
    const cartCheckoutButton = document.getElementById('checkout-button');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        // Display empty cart message
        cartItemsContainer.innerHTML = '';
        cartTotalElement.textContent = '0 ₽';
        cartEmptyMessage.style.display = 'block';
        cartCheckoutButton.disabled = true;
        cartCheckoutButton.classList.add('disabled');
        return;
    }
    
    // Hide empty cart message and enable checkout
    cartEmptyMessage.style.display = 'none';
    cartCheckoutButton.disabled = false;
    cartCheckoutButton.classList.remove('disabled');
    
    // Display cart items
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItemElement = document.createElement('tr');
        cartItemElement.classList.add('cart-item');
        
        const itemTotal = item.price * item.quantity;
        
        cartItemElement.innerHTML = `
            <td class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </td>
            <td class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="item-price">${item.price.toLocaleString()} ₽</p>
            </td>
            <td class="cart-item-quantity">
                <div class="quantity-controls">
                    <button class="quantity-decrease" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="quantity-input">
                    <button class="quantity-increase" data-id="${item.id}">+</button>
                </div>
            </td>
            <td class="cart-item-total">
                ${itemTotal.toLocaleString()} ₽
            </td>
            <td class="cart-item-remove">
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
        
        // Add event listeners for quantity controls and remove button
        cartItemElement.querySelector('.quantity-decrease').addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const currentInput = cartItemElement.querySelector('.quantity-input');
            const currentValue = parseInt(currentInput.value);
            if (currentValue > 1) {
                updateCartItemQuantity(productId, currentValue - 1);
            }
        });
        
        cartItemElement.querySelector('.quantity-increase').addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const currentInput = cartItemElement.querySelector('.quantity-input');
            const currentValue = parseInt(currentInput.value);
            // Get product to check stock
            const product = products.find(p => p.id === productId);
            if (product && currentValue < product.stock) {
                updateCartItemQuantity(productId, currentValue + 1);
            } else {
                showNotification('Достигнуто максимальное количество товара на складе', 'error');
            }
        });
        
        cartItemElement.querySelector('.quantity-input').addEventListener('change', function() {
            const productId = parseInt(this.dataset.id);
            const newValue = parseInt(this.value);
            if (newValue >= 1) {
                // Get product to check stock
                const product = products.find(p => p.id === productId);
                if (product && newValue <= product.stock) {
                    updateCartItemQuantity(productId, newValue);
                } else {
                    // Reset to max stock if exceeds
                    updateCartItemQuantity(productId, product.stock);
                    showNotification(`Максимальное доступное количество: ${product.stock}`, 'error');
                }
            } else {
                this.value = 1;
                updateCartItemQuantity(productId, 1);
            }
        });
        
        cartItemElement.querySelector('.remove-item').addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            removeFromCart(productId);
        });
    });
    
    // Update cart total
    const total = calculateCartTotal();
    cartTotalElement.textContent = total.toLocaleString() + ' ₽';
}

// Display cart summary for checkout page
function displayCartSummary() {
    const cartSummaryContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('order-subtotal');
    const deliveryElement = document.getElementById('order-delivery');
    const totalElement = document.getElementById('order-total');
    
    if (!cartSummaryContainer) return;
    
    // Clear existing items
    cartSummaryContainer.innerHTML = '';
    
    // Display each item in order summary
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('order-item');
        
        itemElement.innerHTML = `
            <div class="order-item-details">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>Количество: ${item.quantity}</p>
                </div>
            </div>
            <div class="order-item-price">
                ${(item.price * item.quantity).toLocaleString()} ₽
            </div>
        `;
        
        cartSummaryContainer.appendChild(itemElement);
    });
    
    // Calculate and display totals
    const subtotal = calculateCartTotal();
    const delivery = subtotal >= 5000 ? 0 : 499;
    const total = subtotal + delivery;
    
    subtotalElement.textContent = subtotal.toLocaleString() + ' ₽';
    deliveryElement.textContent = delivery > 0 ? delivery.toLocaleString() + ' ₽' : 'Бесплатно';
    totalElement.textContent = total.toLocaleString() + ' ₽';
}

// Clear cart (after successful order)
function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.style.display = 'block';
    notification.style.opacity = '1';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 500);
    }, 3000);
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // If on cart page, display cart items
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    // If on checkout page, display cart summary
    if (window.location.pathname.includes('checkout.html')) {
        displayCartSummary();
    }
    
    // Add event listeners for Add to Cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
            const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
            const productId = parseInt(button.dataset.id);
            addToCart(productId);
        }
    });
});
