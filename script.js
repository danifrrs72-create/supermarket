// Event listener ini memastikan kode JavaScript baru berjalan setelah seluruh elemen HTML dimuat.
document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const productGrid = document.getElementById('product-grid');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const noProducts = document.getElementById('no-products');
    const cartCount = document.getElementById('cart-count');
    const floatingCartCount = document.getElementById('floating-cart-count');
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const headerCart = document.getElementById('header-cart');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categoriesContainer = document.getElementById('categories');
   
    // Elemen Modal
    const modal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalProductName = document.getElementById('modal-product-name');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');
    const modalOrderNowBtn = document.getElementById('modal-order-now');
    
    // Elemen Cart Modal
    const cartModal = document.getElementById('cartModal');
    const closeCartModalBtn = document.getElementById('closeCartModalBtn');
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Form Input Customer
    const customerName = document.getElementById('customer-name');
    const customerPhone = document.getElementById('customer-phone');
    const customerAddress = document.getElementById('customer-address');
    const customerNotes = document.getElementById('customer-notes');
    
    const toastContainer = document.getElementById('toast-container');

    // --- State ---
    let products = [];
    let cart = [];
    let currentCategory = 'all';
    let currentSearch = '';
    const API_URL = 'https://fakestoreapi.com/products';
    
    // Konfigurasi Fonnte API
    const FONNTE_API_KEY = 'vR8dKDH8MXWPhs5oiQoY';
    const FONNTE_API_URL = 'https://api.fonnte.com/send';
    const ADMIN_PHONE = '6289680570904';
    
    // Kategori produk
    const categories = [
        { id: 'all', name: 'Semua Produk', icon: 'fas fa-box' },
        { id: "men's clothing", name: 'Pakaian Pria', icon: 'fas fa-tshirt' },
        { id: "women's clothing", name: 'Pakaian Wanita', icon: 'fas fa-female' },
        { id: 'jewelery', name: 'Perhiasan', icon: 'fas fa-gem' },
        { id: 'electronics', name: 'Elektronik', icon: 'fas fa-laptop' }
    ];

    // --- Functions ---

    /**
     * Format angka menjadi format Rupiah
     */
    function formatRupiah(amount) {
        return amount.toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    /**
     * Normalisasi nomor WhatsApp ke format 62
     */
    function normalizePhoneNumber(phone) {
        // Hapus semua karakter non-digit
        let cleanPhone = phone.replace(/\D/g, '');
        
        // Jika diawali dengan 0, ganti dengan 62
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' + cleanPhone.substring(1);
        }
        
        // Jika diawali dengan 8 (tanpa 62), tambahkan 62
        if (cleanPhone.startsWith('8')) {
            cleanPhone = '62' + cleanPhone;
        }
        
        // Pastikan panjang nomor minimal 10 digit
        if (cleanPhone.length < 10) {
            return null;
        }
        
        return cleanPhone;
    }

    /**
     * Validasi format nomor WhatsApp
     */
    function validatePhoneNumber(phone) {
        const cleanPhone = normalizePhoneNumber(phone);
        if (!cleanPhone) {
            return false;
        }
        
        // Regex untuk validasi nomor Indonesia
        const phoneRegex = /^62[1-9][0-9]{7,11}$/;
        return phoneRegex.test(cleanPhone);
    }

    /**
     * Mengambil produk dari Fake Store API
     */
    async function fetchProducts() {
        loader.style.display = 'block';
        productGrid.innerHTML = '';
        errorMessage.classList.add('hidden');
        noProducts.classList.add('hidden');
        
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            products = await response.json();
            displayCategories();
            displayProducts(products);
        } catch (error) {
            console.error("Gagal mengambil produk:", error);
            errorMessage.classList.remove('hidden');
        } finally {
            loader.style.display = 'none';
        }
    }

    /**
     * Menampilkan kategori produk
     */
    function displayCategories() {
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryBtn = document.createElement('button');
            categoryBtn.className = `category-btn flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
                currentCategory === category.id 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`;
            categoryBtn.dataset.category = category.id;
            
            categoryBtn.innerHTML = `
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
            `;
            
            categoriesContainer.appendChild(categoryBtn);
        });
    }

    /**
     * Menampilkan produk di dalam grid
     */
    function displayProducts(productsToDisplay) {
        productGrid.innerHTML = '';
        
        // Filter produk
        let filteredProducts = productsToDisplay;
        
        if (currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === currentCategory
            );
        }
        
        if (currentSearch) {
            const searchTerm = currentSearch.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
                product.title.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filteredProducts.length === 0) {
            noProducts.classList.remove('hidden');
            return;
        } else {
            noProducts.classList.add('hidden');
        }
        
        // Tampilkan produk
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col cursor-pointer';
            productCard.dataset.productId = product.id;

            const price = Math.round(product.price * 15000);
            const formattedPrice = formatRupiah(price);

            productCard.innerHTML = `
                <div class="p-4 bg-white h-48 flex items-center justify-center">
                    <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="p-4 border-t border-gray-200 flex flex-col flex-grow">
                    <span class="text-xs text-gray-500 capitalize">${product.category}</span>
                    <h3 class="text-md font-semibold text-gray-800 mt-1 flex-grow">${product.title.substring(0, 40)}...</h3>
                    <div class="mt-4 flex justify-between items-center">
                        <p class="text-lg font-bold text-blue-600">Rp ${formattedPrice}</p>
                        <button class="add-to-cart-btn bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }

    /**
     * Memfilter produk berdasarkan kategori
     */
    function filterByCategory(categoryId) {
        currentCategory = categoryId;
        displayCategories();
        displayProducts(products);
        productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Mencari produk berdasarkan kata kunci
     */
    function searchProducts() {
        currentSearch = searchInput.value.trim();
        displayProducts(products);
        
        if (currentSearch) {
            showToast(`Menampilkan hasil untuk: "${currentSearch}"`);
        }
    }

    /**
     * Menampilkan modal detail produk
     */
    function showProductDetail(productId) {
        const product = products.find(p => p.id == productId);
        if (!product) return;

        const price = Math.round(product.price * 15000);
        const formattedPrice = formatRupiah(price);

        modalImage.src = product.image;
        modalCategory.textContent = product.category;
        modalProductName.textContent = product.title;
        modalPrice.textContent = `Rp ${formattedPrice}`;
        modalDescription.textContent = product.description;
        modalAddToCartBtn.dataset.productId = product.id;
        modalOrderNowBtn.dataset.productId = product.id;
       
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Menyembunyikan modal detail produk
     */
    function hideModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    /**
     * Menampilkan modal keranjang
     */
    function showCartModal() {
        updateCartDisplay();
        resetCustomerForm();
        cartModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Menyembunyikan modal keranjang
     */
    function hideCartModal() {
        cartModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    /**
     * Menambahkan produk ke keranjang
     */
    function addToCart(productId) {
        const product = products.find(p => p.id == productId);
        if (product) {
            const existingItemIndex = cart.findIndex(item => item.id === product.id);
            
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push({
                    ...product,
                    quantity: 1
                });
            }
            
            updateCartCounter();
            showToast(`${product.title.substring(0, 20)}... ditambahkan ke keranjang!`);
        }
    }

    /**
     * Memperbarui tampilan counter keranjang
     */
    function updateCartCounter() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        floatingCartCount.textContent = totalItems;
    }

    /**
     * Memperbarui tampilan keranjang di modal
     */
    function updateCartDisplay() {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-center text-gray-500 py-4">Keranjang belanja Anda kosong.</p>';
            cartSubtotal.textContent = 'Rp 0';
            cartTotal.textContent = 'Rp 0';
            return;
        }
        
        let subtotal = 0;
        
        cart.forEach((product, index) => {
            const price = Math.round(product.price * 15000);
            const itemTotal = price * product.quantity;
            subtotal += itemTotal;
            const formattedPrice = formatRupiah(price);
            const formattedItemTotal = formatRupiah(itemTotal);
            
            const cartItem = document.createElement('div');
            cartItem.className = 'flex items-center py-3 border-b border-gray-200';
            cartItem.innerHTML = `
                <div class="flex-shrink-0 w-16 h-16 bg-white rounded-md overflow-hidden flex items-center justify-center">
                    <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="ml-4 flex-grow">
                    <h4 class="text-sm font-medium text-gray-800">${product.title.substring(0, 50)}...</h4>
                    <p class="text-blue-600 font-semibold">Rp ${formattedPrice}</p>
                    <div class="flex items-center mt-2">
                        <button class="quantity-btn decrease-quantity bg-gray-200 rounded-l-md w-8 h-8 flex items-center justify-center" data-index="${index}">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="quantity-display bg-gray-100 w-12 h-8 flex items-center justify-center text-sm font-medium">${product.quantity}</span>
                        <button class="quantity-btn increase-quantity bg-gray-200 rounded-r-md w-8 h-8 flex items-center justify-center" data-index="${index}">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                </div>
                <button class="remove-from-cart-btn text-red-500 hover:text-red-700 ml-2" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });
        
        const shippingCost = 10000;
        const total = subtotal + shippingCost;
        const formattedSubtotal = formatRupiah(subtotal);
        const formattedShipping = formatRupiah(shippingCost);
        const formattedTotal = formatRupiah(total);
        
        cartSubtotal.textContent = `Rp ${formattedSubtotal}`;
        cartShipping.textContent = `Rp ${formattedShipping}`;
        cartTotal.textContent = `Rp ${formattedTotal}`;
    }

    /**
     * Mengurangi quantity produk di keranjang
     */
    function decreaseQuantity(index) {
        if (index >= 0 && index < cart.length) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            updateCartCounter();
            updateCartDisplay();
        }
    }

    /**
     * Menambah quantity produk di keranjang
     */
    function increaseQuantity(index) {
        if (index >= 0 && index < cart.length) {
            cart[index].quantity += 1;
            updateCartCounter();
            updateCartDisplay();
        }
    }

    /**
     * Menghapus item dari keranjang
     */
    function removeFromCart(index) {
        if (index >= 0 && index < cart.length) {
            const removedProduct = cart[index];
            cart.splice(index, 1);
            updateCartCounter();
            updateCartDisplay();
            showToast(`${removedProduct.title.substring(0, 20)}... dihapus dari keranjang`);
        }
    }

    /**
     * Mengosongkan keranjang
     */
    function clearCart() {
        if (cart.length > 0) {
            cart = [];
            updateCartCounter();
            updateCartDisplay();
            showToast('Keranjang berhasil dikosongkan');
        }
    }

    /**
     * Mereset form informasi pembeli
     */
    function resetCustomerForm() {
        customerName.value = '';
        customerPhone.value = '';
        customerAddress.value = '';
        customerNotes.value = '';
    }

    /**
     * Validasi form informasi pembeli
     */
    function validateCustomerForm() {
        if (!customerName.value.trim()) {
            showToast('Harap masukkan nama lengkap');
            customerName.focus();
            return false;
        }
        
        if (!customerPhone.value.trim()) {
            showToast('Harap masukkan nomor WhatsApp');
            customerPhone.focus();
            return false;
        }
        
        // Validasi format nomor telepon
        if (!validatePhoneNumber(customerPhone.value)) {
            showToast('Harap masukkan nomor WhatsApp yang valid (contoh: 081234567890 atau 6281234567890)');
            customerPhone.focus();
            return false;
        }
        
        if (!customerAddress.value.trim()) {
            showToast('Harap masukkan alamat pengiriman');
            customerAddress.focus();
            return false;
        }
        
        return true;
    }

    /**
     * Membuat pesan WhatsApp untuk admin
     */
    function createAdminMessage() {
        let message = `🛒 *PESANAN BARU* 🛒\n\n`;
        message += `*Data Pembeli:*\n`;
        message += `Nama: ${customerName.value}\n`;
        message += `WhatsApp: ${customerPhone.value}\n`;
        message += `Alamat: ${customerAddress.value}\n`;
        
        if (customerNotes.value.trim()) {
            message += `Catatan: ${customerNotes.value}\n`;
        }
        
        message += `\n*Detail Pesanan:*\n`;
        message += `═══════════════════\n`;
        
        let subtotal = 0;
        cart.forEach((product, index) => {
            const price = Math.round(product.price * 15000);
            const itemTotal = price * product.quantity;
            subtotal += itemTotal;
            const formattedPrice = formatRupiah(price);
            const formattedItemTotal = formatRupiah(itemTotal);
            
            message += `\n${index + 1}. ${product.title}\n`;
            message += `   Jumlah: ${product.quantity} x Rp ${formattedPrice}\n`;
            message += `   Subtotal: Rp ${formattedItemTotal}\n`;
        });
        
        const shippingCost = 10000;
        const total = subtotal + shippingCost;
        const formattedSubtotal = formatRupiah(subtotal);
        const formattedShipping = formatRupiah(shippingCost);
        const formattedTotal = formatRupiah(total);
        
        message += `\n═══════════════════\n`;
        message += `Subtotal: Rp ${formattedSubtotal}\n`;
        message += `Ongkos Kirim: Rp ${formattedShipping}\n`;
        message += `*TOTAL: Rp ${formattedTotal}*\n\n`;
        message += `Segera proses pesanan ini!`;
        
        return encodeURIComponent(message);
    }

    /**
     * Membuat pesan konfirmasi untuk pembeli
     */
    function createCustomerMessage() {
        const normalizedPhone = normalizePhoneNumber(customerPhone.value);
        
        let message = `✅ *TERIMA KASIH TELAH BERBELANJA DI TOKOKU* ✅\n\n`;
        message += `Halo *${customerName.value}*,\n\n`;
        message += `Pesanan Anda telah kami terima dan sedang diproses.\n\n`;
        
        message += `*Detail Pesanan Anda:*\n`;
        message += `═══════════════════\n`;
        
        let subtotal = 0;
        cart.forEach((product, index) => {
            const price = Math.round(product.price * 15000);
            const itemTotal = price * product.quantity;
            subtotal += itemTotal;
            const formattedPrice = formatRupiah(price);
            const formattedItemTotal = formatRupiah(itemTotal);
            
            message += `\n${index + 1}. ${product.title}\n`;
            message += `   Jumlah: ${product.quantity} x Rp ${formattedPrice}\n`;
            message += `   Subtotal: Rp ${formattedItemTotal}\n`;
        });
        
        const shippingCost = 10000;
        const total = subtotal + shippingCost;
        const formattedSubtotal = formatRupiah(subtotal);
        const formattedShipping = formatRupiah(shippingCost);
        const formattedTotal = formatRupiah(total);
        
        message += `\n═══════════════════\n`;
        message += `Subtotal: Rp ${formattedSubtotal}\n`;
        message += `Ongkos Kirim: Rp ${formattedShipping}\n`;
        message += `*TOTAL: Rp ${formattedTotal}*\n\n`;
        
        message += `*Informasi Pengiriman:*\n`;
        message += `Nama: ${customerName.value}\n`;
        message += `Alamat: ${customerAddress.value}\n\n`;
        
        if (customerNotes.value.trim()) {
            message += `*Catatan:* ${customerNotes.value}\n\n`;
        }
        
        message += `*Status:* Menunggu Konfirmasi\n\n`;
        message += `Kami akan menghubungi Anda dalam waktu 1x24 jam untuk konfirmasi pesanan dan pembayaran.\n\n`;
        message += `Terima kasih telah berbelanja di TokoKu! 🛍️\n`;
        message += `Untuk pertanyaan, hubungi: +62 896-8057-0904`;
        
        return encodeURIComponent(message);
    }

    /**
     * Mengirim pesan ke admin dan pembeli via Fonnte API
     */
    async function sendOrderViaFonnte() {
        try {
            const customerPhoneValue = customerPhone.value;
            const normalizedCustomerPhone = normalizePhoneNumber(customerPhoneValue);
            const normalizedAdminPhone = normalizePhoneNumber(ADMIN_PHONE);
            
            if (!normalizedCustomerPhone || !normalizedAdminPhone) {
                throw new Error('Format nomor telepon tidak valid');
            }
            
            const requests = [];
            
            // Kirim ke admin
            const adminMessage = createAdminMessage();
            const decodedAdminMessage = decodeURIComponent(adminMessage);
            
            requests.push(
                fetch(FONNTE_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': FONNTE_API_KEY
                    },
                    body: JSON.stringify({
                        target: normalizedAdminPhone,
                        message: decodedAdminMessage,
                        countryCode: '62'
                    })
                })
            );
            
            // Kirim ke pembeli
            const customerMessage = createCustomerMessage();
            const decodedCustomerMessage = decodeURIComponent(customerMessage);
            
            requests.push(
                fetch(FONNTE_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': FONNTE_API_KEY
                    },
                    body: JSON.stringify({
                        target: normalizedCustomerPhone,
                        message: decodedCustomerMessage,
                        countryCode: '62'
                    })
                })
            );
            
            const responses = await Promise.all(requests);
            const results = await Promise.all(responses.map(r => r.json()));
            
            const successCount = results.filter(result => result.status === true).length;
            
            if (successCount === 2) {
                return { 
                    success: true, 
                    message: 'Pesanan berhasil dikirim! Konfirmasi telah dikirim ke WhatsApp Anda.' 
                };
            } else if (successCount === 1) {
                return { 
                    success: true, 
                    message: 'Pesanan berhasil dikirim! (Beberapa pesan mungkin gagal terkirim)' 
                };
            } else {
                return { 
                    success: false, 
                    message: 'Gagal mengirim pesanan. Silakan coba lagi.' 
                };
            }
        } catch (error) {
            console.error('Error sending message via Fonnte:', error);
            return { 
                success: false, 
                message: 'Terjadi kesalahan saat mengirim pesanan.' 
            };
        }
    }

    /**
     * Proses checkout
     */
    async function processCheckout() {
        if (!validateCustomerForm()) {
            return;
        }
        
        if (cart.length === 0) {
            showToast('Keranjang belanja Anda kosong');
            return;
        }
        
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Mengirim...</span>';
        checkoutBtn.disabled = true;
        
        try {
            const result = await sendOrderViaFonnte();
            
            if (result.success) {
                showToast(result.message);
                
                cart = [];
                updateCartCounter();
                updateCartDisplay();
                resetCustomerForm();
                
                setTimeout(() => {
                    hideCartModal();
                }, 3000);
            } else {
                showToast(result.message);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            showToast('Terjadi kesalahan saat proses checkout');
        } finally {
            checkoutBtn.innerHTML = '<i class="fab fa-whatsapp"></i><span>Checkout via WhatsApp</span>';
            checkoutBtn.disabled = false;
        }
    }

    /**
     * Memesan produk langsung via WhatsApp
     */
    function orderProduct(productId) {
        const product = products.find(p => p.id == productId);
        if (!product) return;
        
        const price = Math.round(product.price * 15000);
        const formattedPrice = formatRupiah(price);
        const message = `Halo, saya ingin memesan produk berikut:\n\n` +
                       `*${product.title}*\n` +
                       `Harga: Rp ${formattedPrice}\n\n` +
                       `Apakah produk ini tersedia?`;
        
        const normalizedAdminPhone = normalizePhoneNumber(ADMIN_PHONE);
        const url = `https://wa.me/${normalizedAdminPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }
   
    /**
     * Menampilkan notifikasi toast
     */
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Inisialisasi peta lokasi
     */
    function initMap() {
        const storeLocation = [-6.2088, 106.8456];
        
        const map = L.map('map').setView(storeLocation, 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        L.marker(storeLocation).addTo(map)
            .bindPopup('<b>TokoKu</b><br>Jl. Contoh No. 123, Jakarta')
            .openPopup();
    }

    // --- Event Listeners ---

    // Klik pada grid produk
    productGrid.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            const productId = addToCartBtn.dataset.productId;
            addToCart(productId);
            return;
        }

        const card = e.target.closest('.product-card');
        if (card) {
            const productId = card.dataset.productId;
            showProductDetail(productId);
        }
    });
   
    // Menambah ke keranjang dari modal
    modalAddToCartBtn.addEventListener('click', () => {
         const productId = modalAddToCartBtn.dataset.productId;
         addToCart(productId);
         hideModal();
    });
    
    // Memesan langsung dari modal
    modalOrderNowBtn.addEventListener('click', () => {
        const productId = modalOrderNowBtn.dataset.productId;
        orderProduct(productId);
        hideModal();
    });

    // Menutup modal produk
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // Menutup modal keranjang
    closeCartModalBtn.addEventListener('click', hideCartModal);
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            hideCartModal();
        }
    });
    
    // Tombol keranjang mengambang dan header
    floatingCartBtn.addEventListener('click', showCartModal);
    headerCart.addEventListener('click', showCartModal);
    
    // Manipulasi keranjang
    cartItems.addEventListener('click', (e) => {
        const decreaseBtn = e.target.closest('.decrease-quantity');
        if (decreaseBtn) {
            const index = parseInt(decreaseBtn.dataset.index);
            decreaseQuantity(index);
            return;
        }
        
        const increaseBtn = e.target.closest('.increase-quantity');
        if (increaseBtn) {
            const index = parseInt(increaseBtn.dataset.index);
            increaseQuantity(index);
            return;
        }
        
        const removeBtn = e.target.closest('.remove-from-cart-btn');
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.index);
            removeFromCart(index);
        }
    });
    
    // Mengosongkan keranjang
    clearCartBtn.addEventListener('click', clearCart);
    
    // Checkout
    checkoutBtn.addEventListener('click', processCheckout);

    // Kategori
    categoriesContainer.addEventListener('click', (e) => {
        const categoryBtn = e.target.closest('.category-btn');
        if (categoryBtn) {
            const categoryId = categoryBtn.dataset.category;
            filterByCategory(categoryId);
        }
    });

    // Pencarian
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!modal.classList.contains('hidden')) {
                hideModal();
            }
            if (!cartModal.classList.contains('hidden')) {
                hideCartModal();
            }
        }
    });

    // --- Pemuatan Awal ---
    fetchProducts();
    initMap();
});