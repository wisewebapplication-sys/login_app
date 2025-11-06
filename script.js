// Variables globales
let currentView = 'login';
let verificationTimer = null;
let isInitialized = false;

// Cambiar de vista
function showView(viewName) {
    console.log('🔄 Cambiando a vista:', viewName, 'desde:', currentView);

    // Limpiar timer SOLO si no estamos en el proceso de verificación completada
    if (verificationTimer && !(currentView === 'verification' && viewName === 'dashboard')) {
        clearTimeout(verificationTimer);
        verificationTimer = null;
        console.log('🧹 Timer limpiado');
    } else if (currentView === 'verification' && viewName === 'dashboard') {
        // El timer se completó naturalmente, solo lo reseteamos
        verificationTimer = null;
        console.log('✅ Timer completado naturalmente');
    }

    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });

    // Mostrar vista seleccionada
    const targetView = document.getElementById(viewName);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewName;
        console.log('✅ Vista activada:', viewName);
    } else {
        console.error('❌ Vista no encontrada:', viewName);
        return;
    }

    // Mostrar/ocultar bottom nav
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        if (viewName === 'login' || viewName === 'verification' || viewName === 'transactions-full') {
            bottomNav.style.display = 'none';
            console.log('👻 Bottom nav oculto');
        } else {
            bottomNav.style.display = 'flex';
            console.log('👁️ Bottom nav visible');
        }
    }

    // Actualizar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItems = document.querySelectorAll('.nav-item');
    if (viewName === 'dashboard' && navItems[0]) navItems[0].classList.add('active');
    if (viewName === 'cards' && navItems[1]) navItems[1].classList.add('active');
    if (viewName === 'recipients' && navItems[2]) navItems[2].classList.add('active');
    if (viewName === 'payments' && navItems[3]) navItems[3].classList.add('active');
}
// Ir a verificación
function goToVerification() {
    console.log('🚀 Iniciando verificación...');
    showView('verification');

    console.log('⏱️ Timer de 3 segundos iniciado...');
    verificationTimer = setTimeout(function() {
        console.log('⏰ ¡Verificación completada! Redirigiendo al dashboard...');
        showView('dashboard');
    }, 3000);
    
    console.log('✅ Timer configurado:', verificationTimer);
}

// Volver al login
function goToLogin() {
    console.log('⬅️ Cancelando verificación...');
    if (verificationTimer) {
        clearTimeout(verificationTimer);
        verificationTimer = null;
        console.log('🧹 Timer cancelado');
    }
    showView('login');
}

// Toggle password
function togglePassword() {
    const input = document.getElementById('password');
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        console.log('👁️ Contraseña:', input.type === 'text' ? 'visible' : 'oculta');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Página cargada - Inicializando...');

    const requiredViews = ['login', 'verification', 'dashboard', 'cards', 'recipients', 'payments', 'profile', 'transactions-full'];
    requiredViews.forEach(id => {
        const view = document.getElementById(id);
        if (view) {
            console.log('✅ Vista encontrada:', id);
        } else {
            console.error('❌ Vista NO encontrada:', id);
        }
    });

    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        console.log('✅ Bottom nav encontrado');
    } else {
        console.error('❌ Bottom nav NO encontrado');
    }

    isInitialized = true;
    showView('login');
    console.log('✅ Inicialización completada');

    setupTransactionsView();
});

function setupTransactionsView() {
    const summaryList = document.querySelector('.transaction-list');
    const fullListContainer = document.getElementById('all-transactions');

    if (!summaryList || !fullListContainer) {
        console.warn('⚠️ No se pudo inicializar el listado completo de transacciones.');
        return;
    }

    fullListContainer.innerHTML = summaryList.innerHTML;

    const additionalTransactions = getStaticTransactions();
    let lastSectionLabel = null;

    additionalTransactions.forEach(transaction => {
        if (transaction.sectionLabel && transaction.sectionLabel !== lastSectionLabel) {
            fullListContainer.appendChild(createSectionLabel(transaction.sectionLabel));
            lastSectionLabel = transaction.sectionLabel;
        }
        fullListContainer.appendChild(createTransactionElement(transaction));
    });

    console.log(`🧾 Se agregaron ${additionalTransactions.length} transacciones adicionales al listado completo.`);
}

function getStaticTransactions() {
    return [
        {
            sectionLabel: 'Octubre 2025',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Lunes, 27 de octubre de 2025',
            amountPrimary: '+ 1.834,20 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Mercado San Pedro',
            dateLabel: 'Domingo, 26 de octubre de 2025',
            amountPrimary: '245,80 BZD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Belize Fuel Co.',
            dateLabel: 'Sábado, 25 de octubre de 2025',
            amountPrimary: '68,40 BZD',
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Amazon Marketplace',
            dateLabel: 'Viernes, 24 de octubre de 2025',
            amountPrimary: '67,90 USD',
            iconClass: 'fa-brands fa-amazon',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Septiembre 2025',
            title: 'Deel, Inc.',
            dateLabel: 'Martes, 23 de septiembre de 2025',
            amountPrimary: '+ 1.512,00 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Walmart México',
            dateLabel: 'Lunes, 22 de septiembre de 2025',
            amountPrimary: '3.120,00 MXN',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'OXXO Digital',
            dateLabel: 'Domingo, 21 de septiembre de 2025',
            amountPrimary: '215,50 MXN',
            iconClass: 'fa-solid fa-basket-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Rides',
            dateLabel: 'Sábado, 20 de septiembre de 2025',
            amountPrimary: '19,60 USD',
            iconClass: 'fa-solid fa-taxi',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Agosto 2025',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Viernes, 29 de agosto de 2025',
            amountPrimary: '+ 1.812,50 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Supermercados La Comer',
            dateLabel: 'Jueves, 28 de agosto de 2025',
            amountPrimary: '1.380,00 MXN',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Farmacia Guadalajara',
            dateLabel: 'Miércoles, 27 de agosto de 2025',
            amountPrimary: '560,00 MXN',
            iconClass: 'fa-solid fa-prescription-bottle-medical',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Rides',
            dateLabel: 'Lunes, 25 de agosto de 2025',
            amountPrimary: '185,00 MXN',
            iconClass: 'fa-solid fa-taxi',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Julio 2025',
            title: 'Deel, Inc.',
            dateLabel: 'Martes, 22 de julio de 2025',
            amountPrimary: '+ 1.530,80 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'City Market Polanco',
            dateLabel: 'Domingo, 20 de julio de 2025',
            amountPrimary: '2.980,00 MXN',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Starbucks México',
            dateLabel: 'Sábado, 19 de julio de 2025',
            amountPrimary: '156,00 MXN',
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Rides',
            dateLabel: 'Jueves, 17 de julio de 2025',
            amountPrimary: '18,90 USD',
            iconClass: 'fa-solid fa-taxi',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Junio 2025',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Miércoles, 25 de junio de 2025',
            amountPrimary: '+ 1.745,10 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Belize Grocery',
            dateLabel: 'Lunes, 23 de junio de 2025',
            amountPrimary: '198,40 BZD',
            iconClass: 'fa-solid fa-basket-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Belize Electricity Ltd.',
            dateLabel: 'Domingo, 22 de junio de 2025',
            amountPrimary: '120,00 BZD',
            iconClass: 'fa-solid fa-bolt',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Amazon Marketplace',
            dateLabel: 'Viernes, 20 de junio de 2025',
            amountPrimary: '54,99 USD',
            iconClass: 'fa-brands fa-amazon',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Mayo 2025',
            title: 'Deel, Inc.',
            dateLabel: 'Lunes, 26 de mayo de 2025',
            amountPrimary: '+ 1.498,40 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Whole Foods Market',
            dateLabel: 'Domingo, 25 de mayo de 2025',
            amountPrimary: '82,60 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Amazon Marketplace',
            dateLabel: 'Viernes, 23 de mayo de 2025',
            amountPrimary: '134,20 USD',
            iconClass: 'fa-brands fa-amazon',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Spotify',
            dateLabel: 'Jueves, 22 de mayo de 2025',
            amountPrimary: '10,99 USD',
            iconClass: 'fa-brands fa-spotify',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Abril 2025',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Miércoles, 23 de abril de 2025',
            amountPrimary: '+ 1.728,90 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Trader Joe\'s',
            dateLabel: 'Lunes, 21 de abril de 2025',
            amountPrimary: '64,40 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Eats',
            dateLabel: 'Domingo, 20 de abril de 2025',
            amountPrimary: '24,10 USD',
            iconClass: 'fa-solid fa-burger',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Shell Fuel',
            dateLabel: 'Sábado, 19 de abril de 2025',
            amountPrimary: '53,20 USD',
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Marzo 2025',
            title: 'Deel, Inc.',
            dateLabel: 'Martes, 25 de marzo de 2025',
            amountPrimary: '+ 1.512,30 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Costco México',
            dateLabel: 'Domingo, 23 de marzo de 2025',
            amountPrimary: '2.450,00 MXN',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Rides',
            dateLabel: 'Viernes, 21 de marzo de 2025',
            amountPrimary: '18,40 USD',
            iconClass: 'fa-solid fa-taxi',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Belize Water Services',
            dateLabel: 'Jueves, 20 de marzo de 2025',
            amountPrimary: '85,20 BZD',
            iconClass: 'fa-solid fa-droplet',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Febrero 2025',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Viernes, 21 de febrero de 2025',
            amountPrimary: '+ 1.792,60 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Soriana',
            dateLabel: 'Miércoles, 19 de febrero de 2025',
            amountPrimary: '2.850,00 MXN',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Farmacias Benavides',
            dateLabel: 'Lunes, 17 de febrero de 2025',
            amountPrimary: '640,00 MXN',
            iconClass: 'fa-solid fa-prescription-bottle-medical',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Rides',
            dateLabel: 'Domingo, 16 de febrero de 2025',
            amountPrimary: '17,80 USD',
            iconClass: 'fa-solid fa-taxi',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Enero 2025',
            title: 'Deel, Inc.',
            dateLabel: 'Lunes, 20 de enero de 2025',
            amountPrimary: '+ 1.468,20 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Chedraui',
            dateLabel: 'Sábado, 18 de enero de 2025',
            amountPrimary: '1.120,00 MXN',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Starbucks México',
            dateLabel: 'Viernes, 17 de enero de 2025',
            amountPrimary: '140,00 MXN',
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Rides',
            dateLabel: 'Jueves, 16 de enero de 2025',
            amountPrimary: '21,40 USD',
            iconClass: 'fa-solid fa-taxi',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Diciembre 2024',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Martes, 17 de diciembre de 2024',
            amountPrimary: '+ 1.780,00 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Target Online',
            dateLabel: 'Domingo, 15 de diciembre de 2024',
            amountPrimary: '54,20 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Amazon Marketplace',
            dateLabel: 'Jueves, 12 de diciembre de 2024',
            amountPrimary: '89,99 USD',
            iconClass: 'fa-brands fa-amazon',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Shell Fuel',
            dateLabel: 'Martes, 10 de diciembre de 2024',
            amountPrimary: '48,40 USD',
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Noviembre 2024',
            title: 'Deel, Inc.',
            dateLabel: 'Jueves, 21 de noviembre de 2024',
            amountPrimary: '+ 1.365,75 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Whole Foods Market',
            dateLabel: 'Lunes, 18 de noviembre de 2024',
            amountPrimary: '62,10 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Café Punta del Cielo',
            dateLabel: 'Viernes, 15 de noviembre de 2024',
            amountPrimary: '12,40 USD',
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'H&M Online',
            dateLabel: 'Miércoles, 13 de noviembre de 2024',
            amountPrimary: '73,80 USD',
            iconClass: 'fa-solid fa-shirt',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Octubre 2024',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Martes, 22 de octubre de 2024',
            amountPrimary: '+ 1.720,10 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Despensa Familiar',
            dateLabel: 'Sábado, 19 de octubre de 2024',
            amountPrimary: '48,70 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Eats',
            dateLabel: 'Jueves, 17 de octubre de 2024',
            amountPrimary: '21,90 USD',
            iconClass: 'fa-solid fa-burger',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Best Buy',
            dateLabel: 'Martes, 15 de octubre de 2024',
            amountPrimary: '184,20 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Septiembre 2024',
            title: 'Deel, Inc.',
            dateLabel: 'Miércoles, 18 de septiembre de 2024',
            amountPrimary: '+ 1.498,65 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Supermercados La Torre',
            dateLabel: 'Lunes, 16 de septiembre de 2024',
            amountPrimary: '55,60 USD',
            iconClass: 'fa-solid fa-basket-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'AeroMexico',
            dateLabel: 'Sábado, 14 de septiembre de 2024',
            amountPrimary: '320,00 USD',
            iconClass: 'fa-solid fa-plane-departure',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Spotify',
            dateLabel: 'Jueves, 12 de septiembre de 2024',
            amountPrimary: '10,99 USD',
            iconClass: 'fa-brands fa-spotify',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Agosto 2024',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Lunes, 19 de agosto de 2024',
            amountPrimary: '+ 1.765,40 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Farmacias Cruz Verde',
            dateLabel: 'Domingo, 18 de agosto de 2024',
            amountPrimary: '28,40 USD',
            iconClass: 'fa-solid fa-prescription-bottle-medical',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Amazon Marketplace',
            dateLabel: 'Viernes, 16 de agosto de 2024',
            amountPrimary: '47,99 USD',
            iconClass: 'fa-brands fa-amazon',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Café Punta del Cielo',
            dateLabel: 'Miércoles, 14 de agosto de 2024',
            amountPrimary: '12,60 USD',
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Julio 2024',
            title: 'Deel, Inc.',
            dateLabel: 'Martes, 23 de julio de 2024',
            amountPrimary: '+ 1.512,90 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Despensa Familiar',
            dateLabel: 'Sábado, 20 de julio de 2024',
            amountPrimary: '52,80 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Rides',
            dateLabel: 'Jueves, 18 de julio de 2024',
            amountPrimary: '14,90 USD',
            iconClass: 'fa-solid fa-taxi',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Shell Fuel',
            dateLabel: 'Martes, 16 de julio de 2024',
            amountPrimary: '42,30 USD',
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Junio 2024',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Miércoles, 19 de junio de 2024',
            amountPrimary: '+ 1.735,20 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Supermercados La Torre',
            dateLabel: 'Lunes, 17 de junio de 2024',
            amountPrimary: '61,20 USD',
            iconClass: 'fa-solid fa-basket-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'H&M Online',
            dateLabel: 'Sábado, 15 de junio de 2024',
            amountPrimary: '64,20 USD',
            iconClass: 'fa-solid fa-shirt',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Eats',
            dateLabel: 'Jueves, 13 de junio de 2024',
            amountPrimary: '22,15 USD',
            iconClass: 'fa-solid fa-burger',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Mayo 2024',
            title: 'Deel, Inc.',
            dateLabel: 'Martes, 21 de mayo de 2024',
            amountPrimary: '+ 1.488,60 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Farmacias Cruz Verde',
            dateLabel: 'Domingo, 19 de mayo de 2024',
            amountPrimary: '24,30 USD',
            iconClass: 'fa-solid fa-prescription-bottle-medical',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Amazon Marketplace',
            dateLabel: 'Viernes, 17 de mayo de 2024',
            amountPrimary: '120,50 USD',
            iconClass: 'fa-brands fa-amazon',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Café Punta del Cielo',
            dateLabel: 'Miércoles, 15 de mayo de 2024',
            amountPrimary: '18,10 USD',
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Abril 2024',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Lunes, 22 de abril de 2024',
            amountPrimary: '+ 1.702,45 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Despensa Familiar',
            dateLabel: 'Sábado, 20 de abril de 2024',
            amountPrimary: '43,20 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Rides',
            dateLabel: 'Jueves, 18 de abril de 2024',
            amountPrimary: '13,25 USD',
            iconClass: 'fa-solid fa-taxi',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Shell Fuel',
            dateLabel: 'Martes, 16 de abril de 2024',
            amountPrimary: '51,10 USD',
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Marzo 2024',
            title: 'Deel, Inc.',
            dateLabel: 'Miércoles, 20 de marzo de 2024',
            amountPrimary: '+ 1.455,80 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Supermercados La Torre',
            dateLabel: 'Lunes, 18 de marzo de 2024',
            amountPrimary: '48,90 USD',
            iconClass: 'fa-solid fa-basket-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Amazon Marketplace',
            dateLabel: 'Sábado, 16 de marzo de 2024',
            amountPrimary: '54,90 USD',
            iconClass: 'fa-brands fa-amazon',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Spotify',
            dateLabel: 'Jueves, 14 de marzo de 2024',
            amountPrimary: '10,99 USD',
            iconClass: 'fa-brands fa-spotify',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Febrero 2024',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Martes, 20 de febrero de 2024',
            amountPrimary: '+ 1.688,30 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Farmacias Cruz Verde',
            dateLabel: 'Domingo, 18 de febrero de 2024',
            amountPrimary: '23,80 USD',
            iconClass: 'fa-solid fa-prescription-bottle-medical',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Uber Eats',
            dateLabel: 'Viernes, 16 de febrero de 2024',
            amountPrimary: '18,70 USD',
            iconClass: 'fa-solid fa-burger',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Café Punta del Cielo',
            dateLabel: 'Miércoles, 14 de febrero de 2024',
            amountPrimary: '17,20 USD',
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: 'Enero 2024',
            title: 'Deel, Inc.',
            dateLabel: 'Lunes, 22 de enero de 2024',
            amountPrimary: '+ 1.432,15 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            sectionLabel: null,
            title: 'Despensa Familiar',
            dateLabel: 'Sábado, 20 de enero de 2024',
            amountPrimary: '45,60 USD',
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'AeroMexico',
            dateLabel: 'Jueves, 18 de enero de 2024',
            amountPrimary: '280,00 USD',
            iconClass: 'fa-solid fa-plane-departure',
            iconBg: '#2c2c2c'
        },
        {
            sectionLabel: null,
            title: 'Spotify',
            dateLabel: 'Martes, 16 de enero de 2024',
            amountPrimary: '10,99 USD',
            iconClass: 'fa-brands fa-spotify',
            iconBg: '#2c2c2c'
        }
    ];
}

function createSectionLabel(text) {
    const section = document.createElement('div');
    section.className = 'transactions-section-label';
    section.textContent = text;
    return section;
}

function createTransactionElement(data) {
    const item = document.createElement('div');
    item.className = 'transaction-item';

    const leftWrapper = document.createElement('div');
    leftWrapper.style.display = 'flex';
    leftWrapper.style.alignItems = 'center';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'transaction-icon';
    iconContainer.style.background = data.iconBg || '#2c2c2c';

    if (data.iconType === 'image') {
        const image = document.createElement('img');
        image.src = data.iconSrc;
        image.alt = data.iconAlt || data.title;
        image.width = data.iconWidth || 36;
        image.height = data.iconHeight || 36;
        iconContainer.appendChild(image);
    } else {
        const iconElement = document.createElement('i');
        iconElement.className = data.iconClass || 'fa-solid fa-circle';
        iconElement.setAttribute('aria-hidden', 'true');
        iconContainer.appendChild(iconElement);
    }

    const info = document.createElement('div');
    info.className = 'transaction-info';

    const name = document.createElement('div');
    name.className = 'transaction-name';
    name.textContent = data.title;

    const date = document.createElement('div');
    date.className = 'transaction-date';
    date.textContent = data.dateLabel;

    info.appendChild(name);
    info.appendChild(date);

    leftWrapper.appendChild(iconContainer);
    leftWrapper.appendChild(info);

    const amountContainer = document.createElement('div');
    amountContainer.className = 'transaction-amount';

    if (data.amountSecondary) {
        const primary = document.createElement('div');
        primary.className = 'amount-primary';
        primary.textContent = data.amountPrimary;

        if (data.isPositive) {
            primary.style.color = '#9fe870';
        }

        const secondary = document.createElement('div');
        secondary.className = 'amount-secondary';
        secondary.textContent = data.amountSecondary;

        amountContainer.appendChild(primary);
        amountContainer.appendChild(secondary);
    } else {
        amountContainer.textContent = data.amountPrimary;
        if (data.isPositive) {
            amountContainer.style.color = '#9fe870';
        }
    }

    item.appendChild(leftWrapper);
    item.appendChild(amountContainer);

    return item;
}
