// Authentication and User Profile Management

// Initialize user data from localStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Check if user is logged in
function isLoggedIn() {
    return currentUser !== null;
}

// Update UI based on login status
function updateAuthUI() {
    const profileIcon = document.getElementById('profile-icon');
    
    if (profileIcon) {
        if (isLoggedIn()) {
            // Change profile icon to indicate logged in state
            profileIcon.innerHTML = `<i class="fas fa-user-check"></i>`;
            profileIcon.setAttribute('title', `Привет, ${currentUser.name}!`);
        } else {
            // Default profile icon for not logged in
            profileIcon.innerHTML = `<i class="fas fa-user"></i>`;
            profileIcon.setAttribute('title', 'Войти или зарегистрироваться');
        }
    }
}

// Register new user
function registerUser(name, email, password) {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
        showNotification('Пользователь с таким email уже существует', 'error');
        return false;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(), // Simple ID generation
        name: name,
        email: email,
        password: password, // In a real app, this should be hashed
        addresses: [],
        orders: []
    };
    
    // Add to users list
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log in the new user
    currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Регистрация успешна!', 'success');
    updateAuthUI();
    
    return true;
}

// Login user
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
        showNotification('Неверный email или пароль', 'error');
        return false;
    }
    
    // Set current user (without password)
    currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Вход выполнен успешно!', 'success');
    updateAuthUI();
    
    return true;
}

// Logout user
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    showNotification('Вы вышли из аккаунта', 'success');
    updateAuthUI();
    
    // Redirect to home page if on profile page
    if (window.location.pathname.includes('profile.html')) {
        window.location.href = '/index.html';
    }
}

// Get full user data (including addresses and orders)
function getUserData() {
    if (!isLoggedIn()) return null;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.id === currentUser.id);
}

// Update user profile
function updateUserProfile(name, email) {
    if (!isLoggedIn()) return false;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex === -1) return false;
    
    // Update user data
    users[userIndex].name = name;
    users[userIndex].email = email;
    
    // Update localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    currentUser.name = name;
    currentUser.email = email;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Профиль обновлен', 'success');
    updateAuthUI();
    
    return true;
}

// Change password
function changePassword(currentPassword, newPassword) {
    if (!isLoggedIn()) return false;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex === -1) return false;
    
    // Verify current password
    if (users[userIndex].password !== currentPassword) {
        showNotification('Текущий пароль неверен', 'error');
        return false;
    }
    
    // Update password
    users[userIndex].password = newPassword;
    
    // Update localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('Пароль изменен', 'success');
    
    return true;
}

// Add new address
function addAddress(address) {
    if (!isLoggedIn()) return false;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex === -1) return false;
    
    // Add address with ID
    const newAddress = {
        id: Date.now(),
        ...address
    };
    
    users[userIndex].addresses.push(newAddress);
    
    // Update localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('Адрес добавлен', 'success');
    
    return true;
}

// Delete address
function deleteAddress(addressId) {
    if (!isLoggedIn()) return false;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex === -1) return false;
    
    // Filter out the address
    users[userIndex].addresses = users[userIndex].addresses.filter(
        address => address.id !== addressId
    );
    
    // Update localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('Адрес удален', 'success');
    
    return true;
}

// Add order to user history
function addOrder(orderData) {
    if (!isLoggedIn()) return false;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex === -1) return false;
    
    // Create new order with ID and date
    const newOrder = {
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        status: 'Оформлен',
        ...orderData
    };
    
    users[userIndex].orders.push(newOrder);
    
    // Update localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    return newOrder.id;
}

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // Profile icon click handler
    const profileIcon = document.getElementById('profile-icon');
    if (profileIcon) {
        profileIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (isLoggedIn()) {
                // If logged in, redirect to profile page
                window.location.href = 'pages/profile.html';
            } else {
                // If not logged in, show login modal
                document.getElementById('login-modal').style.display = 'block';
            }
        });
    }
    
    // Close modal on X click
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('register-modal').style.display = 'none';
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Switch between login and register
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('register-modal').style.display = 'block';
        });
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('register-modal').style.display = 'none';
            document.getElementById('login-modal').style.display = 'block';
        });
    }
    
    // Login form submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (loginUser(email, password)) {
                document.getElementById('login-modal').style.display = 'none';
                // Redirect to profile if login successful
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    window.location.reload();
                } else {
                    window.location.href = '/index.html';
                }
            }
        });
    }
    
    // Register form submit
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Validate form
            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            
            if (registerUser(name, email, password)) {
                document.getElementById('register-modal').style.display = 'none';
                // Redirect to profile if registration successful
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    window.location.reload();
                } else {
                    window.location.href = '/index.html';
                }
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
    
    // Profile page
    if (window.location.pathname.includes('profile.html')) {
        if (!isLoggedIn()) {
            window.location.href = '/index.html';
            return;
        }
        
        displayUserProfile();
    }
});

// Display user profile page
function displayUserProfile() {
    const userData = getUserData();
    
    if (!userData) return;
    
    // Display user info
    const profileNameElement = document.getElementById('profile-name');
    const profileEmailElement = document.getElementById('profile-email');
    
    if (profileNameElement) profileNameElement.textContent = userData.name;
    if (profileEmailElement) profileEmailElement.textContent = userData.email;
    
    // Display addresses
    const addressesContainer = document.getElementById('addresses-container');
    if (addressesContainer) {
        addressesContainer.innerHTML = '';
        
        if (userData.addresses && userData.addresses.length > 0) {
            userData.addresses.forEach(address => {
                const addressElement = document.createElement('div');
                addressElement.className = 'address-card';
                
                addressElement.innerHTML = `
                    <div class="address-details">
                        <p><strong>${address.fullName}</strong></p>
                        <p>${address.street}</p>
                        <p>${address.city}, ${address.postalCode}</p>
                        <p>Телефон: ${address.phone}</p>
                    </div>
                    <div class="address-actions">
                        <button class="btn-delete-address" data-id="${address.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                addressesContainer.appendChild(addressElement);
                
                // Delete address event listener
                addressElement.querySelector('.btn-delete-address').addEventListener('click', function() {
                    const addressId = parseInt(this.dataset.id);
                    if (deleteAddress(addressId)) {
                        addressElement.remove();
                    }
                });
            });
        } else {
            addressesContainer.innerHTML = '<p class="empty-list">У вас пока нет сохраненных адресов.</p>';
        }
    }
    
    // Display orders
    const ordersContainer = document.getElementById('orders-container');
    if (ordersContainer) {
        ordersContainer.innerHTML = '';
        
        if (userData.orders && userData.orders.length > 0) {
            userData.orders.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            const table = document.createElement('table');
            table.className = 'order-table';
            
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>№ Заказа</th>
                        <th>Дата</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            
            userData.orders.forEach(order => {
                const row = document.createElement('tr');
                
                // Format date
                const orderDate = new Date(order.date);
                const formattedDate = orderDate.toLocaleDateString('ru-RU');
                
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${formattedDate}</td>
                    <td>${order.total.toLocaleString()} ₽</td>
                    <td><span class="order-status ${order.status.toLowerCase()}">${order.status}</span></td>
                    <td>
                        <button class="btn-view-order" data-id="${order.id}">
                            <i class="fas fa-eye"></i> Детали
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
                
                // View order details event listener
                row.querySelector('.btn-view-order').addEventListener('click', function() {
                    const orderId = this.dataset.id;
                    displayOrderDetails(orderId);
                });
            });
            
            ordersContainer.appendChild(table);
        } else {
            ordersContainer.innerHTML = '<p class="empty-list">У вас пока нет заказов.</p>';
        }
    }
    
    // Update profile form
    const updateProfileForm = document.getElementById('update-profile-form');
    if (updateProfileForm) {
        document.getElementById('update-name').value = userData.name;
        document.getElementById('update-email').value = userData.email;
        
        updateProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('update-name').value;
            const email = document.getElementById('update-email').value;
            
            if (updateUserProfile(name, email)) {
                // Refresh profile display
                displayUserProfile();
            }
        });
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate form
            if (newPassword !== confirmPassword) {
                showNotification('Новые пароли не совпадают', 'error');
                return;
            }
            
            if (changePassword(currentPassword, newPassword)) {
                // Clear form
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            }
        });
    }
    
    // Add address form
    const addAddressForm = document.getElementById('add-address-form');
    if (addAddressForm) {
        addAddressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const address = {
                fullName: document.getElementById('address-name').value,
                street: document.getElementById('address-street').value,
                city: document.getElementById('address-city').value,
                postalCode: document.getElementById('address-postal').value,
                phone: document.getElementById('address-phone').value
            };
            
            if (addAddress(address)) {
                // Clear form
                this.reset();
                
                // Refresh addresses display
                displayUserProfile();
                
                // Close modal
                document.getElementById('add-address-modal').style.display = 'none';
            }
        });
    }
}

// Display order details in modal
function displayOrderDetails(orderId) {
    const userData = getUserData();
    if (!userData) return;
    
    const order = userData.orders.find(order => order.id === orderId);
    if (!order) return;
    
    // Get modal elements
    const modal = document.getElementById('order-details-modal');
    const orderIdElement = document.getElementById('order-details-id');
    const orderDateElement = document.getElementById('order-details-date');
    const orderStatusElement = document.getElementById('order-details-status');
    const orderItemsContainer = document.getElementById('order-details-items');
    const orderAddressElement = document.getElementById('order-details-address');
    const orderSubtotalElement = document.getElementById('order-details-subtotal');
    const orderDeliveryElement = document.getElementById('order-details-delivery');
    const orderTotalElement = document.getElementById('order-details-total');
    
    // Format date
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('ru-RU');
    
    // Update modal elements
    orderIdElement.textContent = order.id;
    orderDateElement.textContent = formattedDate;
    orderStatusElement.textContent = order.status;
    orderStatusElement.className = `order-status ${order.status.toLowerCase()}`;
    
    // Display items
    orderItemsContainer.innerHTML = '';
    order.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-detail-item';
        
        itemElement.innerHTML = `
            <div class="order-item-details">
                <p><strong>${item.name}</strong> x ${item.quantity}</p>
            </div>
            <div class="order-item-price">
                ${(item.price * item.quantity).toLocaleString()} ₽
            </div>
        `;
        
        orderItemsContainer.appendChild(itemElement);
    });
    
    // Display address
    orderAddressElement.innerHTML = `
        <p><strong>${order.address.fullName}</strong></p>
        <p>${order.address.street}</p>
        <p>${order.address.city}, ${order.address.postalCode}</p>
        <p>Телефон: ${order.address.phone}</p>
    `;
    
    // Display totals
    orderSubtotalElement.textContent = order.subtotal.toLocaleString() + ' ₽';
    orderDeliveryElement.textContent = order.delivery > 0 ? 
        order.delivery.toLocaleString() + ' ₽' : 'Бесплатно';
    orderTotalElement.textContent = order.total.toLocaleString() + ' ₽';
    
    // Show modal
    modal.style.display = 'block';
}



// Login existing user
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('Вход выполнен успешно!', 'success');
        updateAuthUI();
        return true;
    } else {
        showNotification('Неверный email или пароль', 'error');
        return false;
    }
}
