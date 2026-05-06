// === Мобільне меню ===
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    const burgerBtn = document.getElementById('burger-btn');
    const isOpen = navLinks.classList.toggle('mobile-open');
    burgerBtn.classList.toggle('open');
    burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeMenu() {
    const navLinks = document.getElementById('nav-links');
    const burgerBtn = document.getElementById('burger-btn');
    navLinks.classList.remove('mobile-open');
    burgerBtn.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', function(e) {
    const nav = document.querySelector('.navbar');
    if (nav && !nav.contains(e.target)) closeMenu();
});

// Змінна для зберігання кошика
let cart = [];

// Змінна для активної категорії
let activeCategory = 'coffee';

// Змінна для зберігання всіх даних меню
let menuData = null;

// Функція для завантаження даних з JSON
function loadMenuData() {
    fetch('menu-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка завантаження меню: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            menuData = data;
            displayCategories(data.categories);
            displayMenuItems(data.categories[0].items);
            displaySpecialOffers(data.specialOffers);
            displayAbout(data.about);
            displayReviews(data.reviews);
            displayContact(data.contact);
            // Запускаємо спостерігач анімацій після рендеру
            initScrollAnimations();
        })
        .catch(error => {
            console.error('Помилка завантаження:', error);
        });
}

// Функція для показу категорій
function displayCategories(categories) {
    const tabsContainer = document.getElementById('category-tabs');
    tabsContainer.innerHTML = '';
    
    categories.forEach((category, index) => {
        const button = document.createElement('button');
        button.className = 'tab';
        if (index === 0) {
            button.classList.add('active');
        }
        button.textContent = category.name;
        // ВИПРАВЛЕНО: передаємо обидва аргументи явно, не покладаємось на event
        button.addEventListener('click', function() {
            changeCategory(category.id, categories, this);
        });
        tabsContainer.appendChild(button);
    });
}

// ВИПРАВЛЕНО: функція приймає кнопку як аргумент замість використання event
function changeCategory(categoryId, categories, clickedBtn) {
    activeCategory = categoryId;
    
    // Оновлюємо активну кнопку
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');
    
    // Знаходимо товари вибраної категорії
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (selectedCategory) {
        displayMenuItems(selectedCategory.items);
    }
}

// Функція для показу товарів меню
function displayMenuItems(items) {
    const menuGrid = document.getElementById('menu-grid');
    menuGrid.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.setAttribute('role', 'listitem');
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image" loading="lazy">
            <div class="item-info">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-price">${item.price} грн.</p>
                <button class="add-to-cart" onclick='addToCart(${JSON.stringify(item)})'>Додати до кошика</button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// Функція для додавання товару до кошика
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...item, quantity: 1});
    }
    
    updateCartCount();
    displayCart();
    showNotification(item.name || item.title);
}

// Функція для показу сповіщення
function showNotification(itemName) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    notificationText.textContent = `✓ ${itemName} додано до кошика`;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Функція для відкриття/закриття кошика
function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    cartModal.classList.toggle('open');
}

// Функція для показу товарів у кошику
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Ваш кошик порожній</p></div>';
        cartTotal.style.display = 'none';
        checkoutBtn.style.display = 'none';
        deleteAllBtn.style.display = 'none';
    } else {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            const itemName = item.name || item.title;
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${itemName}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${itemName}</div>
                    <div class="cart-item-price">${item.price} грн × ${item.quantity}</div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        
        const total = calculateTotal();
        document.getElementById('total-price').textContent = total;
        cartTotal.style.display = 'block';
        checkoutBtn.style.display = 'block';
        deleteAllBtn.style.display = 'block';
    }
}

// Функція для підрахунку загальної суми
function calculateTotal() {
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    return total;
}

// Функція для оновлення лічильника кошика
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Функція для видалення всіх товарів з кошика
function deleteAllItems() {
    cart = [];
    updateCartCount();
    displayCart();
    showNotification('Кошик очищено');
}

// Функція для оформлення замовлення
function checkout() {
    if (cart.length === 0) return;

    const orderItemsList = document.getElementById('order-items-list');
    orderItemsList.innerHTML = '';

    cart.forEach(item => {
        const itemName = item.name || item.title;
        const itemTotal = item.price * item.quantity;

        const row = document.createElement('div');
        row.className = 'order-item-row';
        row.innerHTML = `
            <div class="order-item-info">
                <span class="order-item-name">${itemName}</span>
                <span class="order-item-qty">× ${item.quantity}</span>
            </div>
            <span class="order-item-price">${itemTotal} грн</span>
        `;
        orderItemsList.appendChild(row);
    });

    const total = calculateTotal();
    document.getElementById('order-total-amount').textContent = `${total} грн`;

    // Скидаємо вибір типу замовлення на самовивіз
    const pickupRadio = document.querySelector('input[name="orderType"][value="pickup"]');
    if (pickupRadio) {
        pickupRadio.checked = true;
        document.getElementById('table-number-container').style.display = 'none';
    }

    const overlay = document.getElementById('order-overlay');
    overlay.classList.add('visible');
    setTimeout(() => {
        document.getElementById('order-modal').classList.add('visible');
    }, 10);
}

// Закрити модальне вікно
function closeOrderModal(event) {
    // Якщо викликано без аргументу (з кнопки "Скасувати") — завжди закривати
    if (event && event.target !== document.getElementById('order-overlay')) return;
    const overlay = document.getElementById('order-overlay');
    const modal = document.getElementById('order-modal');
    modal.classList.remove('visible');
    setTimeout(() => overlay.classList.remove('visible'), 300);
}

// Показати/сховати поле для вводу номера столика
function toggleTableInput() {
    const checked = document.querySelector('input[name="orderType"]:checked');
    if (!checked) return;
    const isTable = checked.value === 'table';
    document.getElementById('table-number-container').style.display = isTable ? 'block' : 'none';
}

// Підтвердити замовлення
async function confirmOrder() {
    const modal = document.getElementById('order-modal');
    const overlay = document.getElementById('order-overlay');

    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    let orderDetailsText = orderType === 'pickup' ? "Спосіб отримання: Самовивіз 🛍" : "Спосіб отримання: За столиком 🍽";
    
    if (orderType === 'table') {
        const tableNum = document.getElementById('table-number').value;
        if (!tableNum) {
            alert("Будь ласка, введіть номер столика.");
            return;
        }
        orderDetailsText += ` № ${tableNum}`;
    }

    // Формуємо текст повідомлення для Telegram
    let messageText = `🔔 <b>НОВЕ ЗАМОВЛЕННЯ!</b>\n\n`;
    messageText += `<b>${orderDetailsText}</b>\n\n`;
    messageText += `<b>Склад замовлення:</b>\n`;
    
    cart.forEach(item => {
        const itemName = item.name || item.title;
        messageText += `▪️ ${itemName} x${item.quantity} — ${item.price * item.quantity} грн\n`;
    });
    
    messageText += `\n💰 <b>Загальна сума: ${calculateTotal()} грн</b>`;

    // Конфігурація Telegram-бота
    const BOT_TOKEN = '8708383278:AAGWuryFQL59U8FKHdPepo8-rqv4VeAR6io';
    const CHAT_ID = '-1003866545944';

    // ВИПРАВЛЕНО: повна обробка відповіді Telegram API з перевіркою ok та логуванням помилок
    if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_BOT_TOKEN') {
        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: messageText,
                    parse_mode: 'HTML'
                })
            });

            const result = await response.json();

            if (!result.ok) {
                // Telegram повернув помилку — логуємо, але НЕ зупиняємо процес
                console.error('Telegram API error:', result.description, '| error_code:', result.error_code);
            } else {
                console.log('✅ Замовлення відправлено в Telegram, message_id:', result.result.message_id);
            }
        } catch (error) {
            // Мережева помилка — логуємо, але НЕ зупиняємо процес оформлення
            console.error('Помилка відправки в Telegram:', error.message);
        }
    } else {
        console.warn("Телеграм бот не налаштовано. Текст повідомлення:", messageText);
    }

    // Зберігаємо оригінальний HTML модалки для відновлення
    const originalHTML = modal.innerHTML;

    // Показуємо екран успіху
    modal.innerHTML = `
        <div class="order-success">
            <div class="order-success-icon">✓</div>
            <h2 class="order-success-title">Дякуємо!</h2>
            <p class="order-success-text">Ваше замовлення прийнято.<br>Ми вже готуємо його для вас ☕</p>
        </div>
    `;

    // Через 2.2с закриваємо та відновлюємо структуру
    setTimeout(() => {
        modal.classList.remove('visible');
        setTimeout(() => {
            overlay.classList.remove('visible');
            modal.innerHTML = originalHTML;
            cart = [];
            updateCartCount();
            displayCart();
            const cartModal = document.getElementById('cart-modal');
            if (cartModal.classList.contains('open')) toggleCart();
        }, 300);
    }, 2200);
}

// Функція для показу секції "Про нас"
function displayAbout(aboutData) {
    const aboutGrid = document.getElementById('about-grid');
    aboutGrid.innerHTML = '';
    
    aboutData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'about-card';
        card.innerHTML = `
            <div class="about-icon">${item.icon}</div>
            <h3 class="about-title">${item.title}</h3>
            <p class="about-description">${item.description}</p>
        `;
        aboutGrid.appendChild(card);
    });
}

// Функція для показу спеціальних пропозицій
function displaySpecialOffers(offers) {
    const offersGrid = document.getElementById('offers-grid');
    offersGrid.innerHTML = '';

    offers.forEach(offer => {
        const card = document.createElement('div');
        card.className = 'offer-card';
        card.innerHTML = `
            <div class="offer-badge">${offer.badge}</div>
            <img src="${offer.image}" alt="${offer.title}" class="offer-image" loading="lazy">
            <h3 class="offer-title">${offer.title}</h3>
            <p class="offer-description">${offer.description}</p>
            <div class="offer-old-price">${offer.oldPrice} грн</div>
            <div class="offer-price">${offer.price} грн</div>
            <button class="offer-button" onclick='addToCart(${JSON.stringify(offer)})'>
                Додати до кошика
            </button>
        `;
        offersGrid.appendChild(card);
    });
}

// Функція для показу відгуків
function displayReviews(reviews) {
    const reviewsGrid = document.getElementById('reviews-grid');
    reviewsGrid.innerHTML = '';
    
    reviews.forEach(review => {
        let stars = '';
        for (let i = 0; i < review.rating; i++) {
            stars += '⭐';
        }
        
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-stars">${stars}</div>
            <p class="review-text">"${review.text}"</p>
            <div class="review-author">
                <div class="author-avatar">${review.avatar}</div>
                <div class="author-info">
                    <div class="author-name">${review.author}</div>
                    <div class="author-date">${review.date}</div>
                </div>
            </div>
        `;
        reviewsGrid.appendChild(card);
    });
}

// Функція для показу контактів
function displayContact(contactData) {
    const contactInfo = document.getElementById('contact-info');
    contactInfo.innerHTML = `
        <div class="contact-item">
            <strong>📍 Адреса</strong>
            ${contactData.address}
        </div>
        <div class="contact-item">
            <strong>🕐 Години роботи</strong>
            ${contactData.hours.weekdays}<br/>
            ${contactData.hours.weekend}
        </div>
    `;
}

function initScrollAnimations() {
    const animatableSelectors = [
        '.about-card',
        '.review-card',
        '.gallery-item',
        '.offer-card',
        '.contact-item'
    ];

    const elements = document.querySelectorAll(animatableSelectors.join(','));

    if (!('IntersectionObserver' in window)) return; // Fallback для старих браузерів

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-visible');
                observer.unobserve(entry.target); // Спрацьовує лише раз
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach((el, index) => {
        el.classList.add('anim-hidden');
        // Невеликий stagger-ефект для карток в одному ряду
        el.style.transitionDelay = `${(index % 4) * 0.08}s`;
        observer.observe(el);
    });
}

// Викликаємо функцію завантаження при завантаженні сторінки
window.onload = function() {
    loadMenuData();
};


