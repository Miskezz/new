// === Мобільне меню ===
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    const burgerBtn = document.getElementById('burger-btn');
    navLinks.classList.toggle('mobile-open');
    burgerBtn.classList.toggle('open');
}

function closeMenu() {
    const navLinks = document.getElementById('nav-links');
    const burgerBtn = document.getElementById('burger-btn');
    navLinks.classList.remove('mobile-open');
    burgerBtn.classList.remove('open');
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
        .then(response => response.json())
        .then(data => {
            menuData = data;
            displayCategories(data.categories);
            displayMenuItems(data.categories[0].items);
            displaySpecialOffers(data.specialOffers);
            displayAbout(data.about);
            displayReviews(data.reviews);
            displayContact(data.contact);
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
        button.onclick = () => changeCategory(category.id, categories);
        tabsContainer.appendChild(button);
    });
}

// Функція для зміни категорії
function changeCategory(categoryId, categories) {
    activeCategory = categoryId;
    
    // Оновлюємо активну кнопку
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
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
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image">
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
    
    // Оновлюємо лічильник кошика
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
    
    // Якщо кошик порожній
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Ваш кошик порожній</p></div>';
        cartTotal.style.display = 'none';
        checkoutBtn.style.display = 'none';
        deleteAllBtn.style.display = 'none';
    } else {
        // Якщо є товари в кошику
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            // Використовуємо name для звичайних товарів, title для комбо
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
        
        // Рахуємо і показуємо загальну суму
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
    cartCount.textContent = cart.length;
}

// Функція для видалення всіх товарів з кошика
function deleteAllItems() {
    cart = [];
    updateCartCount();
    displayCart();
    showNotification('Кошик очищено');
}

// Функція для оформлення замовлення — відкриває красивий модальний діалог
function checkout() {
    if (cart.length === 0) return;

    // Заповнюємо список товарів у модалці
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

    // Встановлюємо загальну суму
    const total = calculateTotal();
    document.getElementById('order-total-amount').textContent = `${total} грн`;

    // Показуємо модалку з анімацією
    const overlay = document.getElementById('order-overlay');
    overlay.classList.add('visible');
    setTimeout(() => {
        document.getElementById('order-modal').classList.add('visible');
    }, 10);
}

// Закрити модальне вікно (також спрацьовує при кліку на фон)
function closeOrderModal(event) {
    if (event && event.target !== document.getElementById('order-overlay')) return;
    const overlay = document.getElementById('order-overlay');
    const modal = document.getElementById('order-modal');
    modal.classList.remove('visible');
    setTimeout(() => overlay.classList.remove('visible'), 300);
}

// Показати/сховати поле для вводу номера столика
function toggleTableInput() {
    const isTable = document.querySelector('input[name="orderType"]:checked').value === 'table';
    document.getElementById('table-number-container').style.display = isTable ? 'block' : 'none';
}

// Підтвердити замовлення
function confirmOrder() {
    const modal = document.getElementById('order-modal');
    const overlay = document.getElementById('order-overlay');

    // Отримуємо тип замовлення та номер столика
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
        messageText += `▪️ ${itemName} x${item.quantity} - ${item.price * item.quantity} грн\n`;
    });
    
    messageText += `\n💰 <b>Загальна сума: ${calculateTotal()} грн</b>`;

    // ЗАМІНІТЬ 'YOUR_BOT_TOKEN' та 'YOUR_CHAT_ID' на ваші дані від Telegram
    const BOT_TOKEN = '8708383278:AAGWuryFQL59U8FKHdPepo8-rqv4VeAR6io'; 
    const CHAT_ID = '-1003866545944';

    // Відправка повідомлення в Telegram
    if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_BOT_TOKEN') {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: messageText,
                parse_mode: 'HTML'
            })
        })
        .then(response => {
            if (!response.ok) {
                console.error("Помилка API Telegram:", response.statusText);
            }
        })
        .catch(error => console.error("Помилка відправки в Telegram:", error));
    } else {
        console.warn("Телеграм бот не налаштовано. Текст повідомлення:", messageText);
    }

    // Зберігаємо оригінальний HTML модалки, щоб відновити його пізніше
    const originalHTML = modal.innerHTML;

    // Показуємо екран успіху
    modal.innerHTML = `
        <div class="order-success">
            <div class="order-success-icon">✓</div>
            <h2 class="order-success-title">Дякуємо!</h2>
            <p class="order-success-text">Ваше замовлення прийнято.<br>Ми вже готуємо його для вас ☕</p>
        </div>
    `;

    // Через 2 секунди закрити, очистити кошик і ВІДНОВИТИ структуру модалки
    setTimeout(() => {
        modal.classList.remove('visible');
        setTimeout(() => {
            overlay.classList.remove('visible');
            // Відновлюємо HTML модалки для наступного замовлення
            modal.innerHTML = originalHTML;
            cart = [];
            updateCartCount();
            displayCart();
            // Закриваємо кошик якщо відкритий
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

    
    // Це простий цикл forEach - він проходить по кожній пропозиції
    offers.forEach(offer => {
        const card = document.createElement('div');
        card.className = 'offer-card';
        // Тепер додаємо фото в картку
        card.innerHTML = `
            <div class="offer-badge">${offer.badge}</div>
            <img src="${offer.image}" alt="${offer.title}" class="offer-image">
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
    
    // Проходимо по кожному відгуку
    reviews.forEach(review => {
        // Створюємо зірочки для рейтингу
        let stars = '';
        for (let i = 0; i < review.rating; i++) {
            stars += '⭐';
        }
        
        // Створюємо картку відгуку
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

// Викликаємо функцію завантаження при завантаженні сторінки
window.onload = function() {
    loadMenuData();
};





