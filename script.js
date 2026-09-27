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
    const summaryList = document.querySelector('#dashboard .transaction-list');
    const fullListContainer = document.getElementById('all-transactions');

    if (!summaryList || !fullListContainer) {
        console.warn('⚠️ No se pudo inicializar el listado de transacciones.');
        return;
    }

    const all = getAllTransactions();
    all.forEach(t => { t._date = t.date ? new Date(t.date + 'T00:00:00') : parseSpanishDate(t.dateLabel); });
    all.sort((a, b) => b._date - a._date); // descendente: la más reciente primero

    // Resumen del inicio: las 12 transacciones más recientes
    summaryList.innerHTML = '';
    all.slice(0, 12).forEach(t => summaryList.appendChild(createTransactionElement(t)));

    // Listado completo, agrupado por mes
    fullListContainer.innerHTML = '';
    let lastLabel = null;
    all.forEach(t => {
        const label = monthLabelFromDate(t._date);
        if (label && label !== lastLabel) {
            fullListContainer.appendChild(createSectionLabel(label));
            lastLabel = label;
        }
        fullListContainer.appendChild(createTransactionElement(t));
    });

    console.log(`🧾 ${all.length} transacciones ordenadas de forma descendente.`);
}

const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function parseSpanishDate(label) {
    if (!label) return new Date(0);
    const m = String(label).match(/(\d{1,2}) de (\w+) de (\d{4})/i);
    if (!m) return new Date(0);
    const mes = MESES_ES.indexOf(m[2].toLowerCase());
    if (mes < 0) return new Date(0);
    return new Date(Number(m[3]), mes, Number(m[1]));
}

function monthLabelFromDate(d) {
    if (!(d instanceof Date) || isNaN(d)) return null;
    const nombre = MESES_ES[d.getMonth()];
    return nombre.charAt(0).toUpperCase() + nombre.slice(1) + ' ' + d.getFullYear();
}

function getAllTransactions() {
    return [].concat(getLegacyDashboardItems(), getStatementTransactions(), getStaticTransactions());
}

function getStatementTransactions() {
    return [
        {
            date: '2026-09-26',
            title: 'Walmart Pincher Creek',
            dateLabel: 'Sábado, 26 de septiembre de 2026',
            amountPrimary: '8,04 CAD',
            amountSecondary: '5,01 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-26',
            title: 'PayPal *Mrs_boz',
            dateLabel: 'Sábado, 26 de septiembre de 2026',
            amountPrimary: '1,00 USD',
            amountSecondary: '0,89 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-26',
            title: 'Walmart Pincher Creek',
            dateLabel: 'Sábado, 26 de septiembre de 2026',
            amountPrimary: '17,92 CAD',
            amountSecondary: '11,17 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-25',
            title: 'Walmart Supercenter Pincher Creek',
            dateLabel: 'Viernes, 25 de septiembre de 2026',
            amountPrimary: '48,79 CAD',
            amountSecondary: '30,42 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-25',
            title: 'Nayax Canada',
            dateLabel: 'Viernes, 25 de septiembre de 2026',
            amountPrimary: '1,00 CAD',
            amountSecondary: '0,63 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-25',
            title: 'Nayax Canada',
            dateLabel: 'Viernes, 25 de septiembre de 2026',
            amountPrimary: '3,00 CAD',
            amountSecondary: '1,87 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-25',
            title: 'Nayax Canada',
            dateLabel: 'Viernes, 25 de septiembre de 2026',
            amountPrimary: '10,00 CAD',
            amountSecondary: '6,23 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-25',
            title: 'Nayax Canada',
            dateLabel: 'Viernes, 25 de septiembre de 2026',
            amountPrimary: '4,00 CAD',
            amountSecondary: '2,49 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-25',
            title: 'Nayax Canada',
            dateLabel: 'Viernes, 25 de septiembre de 2026',
            amountPrimary: '6,00 CAD',
            amountSecondary: '3,74 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-25',
            title: 'No Frills High River',
            dateLabel: 'Viernes, 25 de septiembre de 2026',
            amountPrimary: '21,72 CAD',
            amountSecondary: '13,54 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-25',
            title: 'Deel, Inc.',
            dateLabel: 'Viernes, 25 de septiembre de 2026',
            amountPrimary: '+ 173,00 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-24',
            title: 'Dollarama High River',
            dateLabel: 'Jueves, 24 de septiembre de 2026',
            amountPrimary: '10,76 CAD',
            amountSecondary: '6,72 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-22',
            title: 'Canadian Tire Okotoks',
            dateLabel: 'Martes, 22 de septiembre de 2026',
            amountPrimary: '20,98 CAD',
            amountSecondary: '13,08 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-22',
            title: 'Walmart Supercenter Okotoks',
            dateLabel: 'Martes, 22 de septiembre de 2026',
            amountPrimary: '130,41 CAD',
            amountSecondary: '81,34 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-22',
            title: 'Petro-Canada Aldersyde',
            dateLabel: 'Martes, 22 de septiembre de 2026',
            amountPrimary: '3,15 CAD',
            amountSecondary: '1,97 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-22',
            title: 'Petro-Canada Aldersyde',
            dateLabel: 'Martes, 22 de septiembre de 2026',
            amountPrimary: '150,00 CAD',
            amountSecondary: '93,57 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-21',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Lunes, 21 de septiembre de 2026',
            amountPrimary: '7,65 CAD',
            amountSecondary: '4,77 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-21',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Lunes, 21 de septiembre de 2026',
            amountPrimary: '14,30 CAD',
            amountSecondary: '8,93 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-21',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Lunes, 21 de septiembre de 2026',
            amountPrimary: '8,45 CAD',
            amountSecondary: '5,27 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-21',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Lunes, 21 de septiembre de 2026',
            amountPrimary: '6,00 CAD',
            amountSecondary: '3,75 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-18',
            title: 'Walmart Supercenter Calgary',
            dateLabel: 'Viernes, 18 de septiembre de 2026',
            amountPrimary: '40,00 CAD',
            amountSecondary: '24,99 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-17',
            title: 'Wendy\'s Calgary',
            dateLabel: 'Jueves, 17 de septiembre de 2026',
            amountPrimary: '35,68 CAD',
            amountSecondary: '22,31 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-17',
            title: 'Walmart Supercenter Calgary',
            dateLabel: 'Jueves, 17 de septiembre de 2026',
            amountPrimary: '53,75 CAD',
            amountSecondary: '33,62 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-17',
            title: 'Deel, Inc.',
            dateLabel: 'Jueves, 17 de septiembre de 2026',
            amountPrimary: '+ 275,77 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-15',
            title: 'Shell Canmore',
            dateLabel: 'Martes, 15 de septiembre de 2026',
            amountPrimary: '141,27 CAD',
            amountSecondary: '88,33 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-15',
            title: 'Save On Foods Canmore',
            dateLabel: 'Martes, 15 de septiembre de 2026',
            amountPrimary: '45,01 CAD',
            amountSecondary: '28,14 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-14',
            title: 'Canva',
            dateLabel: 'Lunes, 14 de septiembre de 2026',
            amountPrimary: '1,39 CAD',
            amountSecondary: '0,88 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-13',
            title: 'Google One -',
            dateLabel: 'Domingo, 13 de septiembre de 2026',
            amountPrimary: '1,99 USD',
            amountSecondary: '1,73 EUR',
            isPositive: false,
            iconType: 'image',
            iconSrc: 'images/google one.png',
            iconBg: '#ffffff'
        },
        {
            date: '2026-09-11',
            title: 'Calgary Co-op Wines & Spirits',
            dateLabel: 'Viernes, 11 de septiembre de 2026',
            amountPrimary: '37,02 CAD',
            amountSecondary: '23,10 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-11',
            title: 'Walmart Supercenter Calgary',
            dateLabel: 'Viernes, 11 de septiembre de 2026',
            amountPrimary: '28,56 CAD',
            amountSecondary: '17,82 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-11',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Viernes, 11 de septiembre de 2026',
            amountPrimary: '2,95 CAD',
            amountSecondary: '1,84 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-11',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Viernes, 11 de septiembre de 2026',
            amountPrimary: '19,16 CAD',
            amountSecondary: '11,96 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-10',
            title: 'Popeyes Calgary',
            dateLabel: 'Jueves, 10 de septiembre de 2026',
            amountPrimary: '27,07 CAD',
            amountSecondary: '16,92 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-10',
            title: 'Chevron Calgary',
            dateLabel: 'Jueves, 10 de septiembre de 2026',
            amountPrimary: '6,69 CAD',
            amountSecondary: '4,18 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-10',
            title: 'Super 8 Macleod Trail Calgary',
            dateLabel: 'Jueves, 10 de septiembre de 2026',
            amountPrimary: '100,00 CAD',
            amountSecondary: '62,53 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-bed',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-10',
            title: 'Booking.com',
            dateLabel: 'Jueves, 10 de septiembre de 2026',
            amountPrimary: '80,67 CAD',
            amountSecondary: '50,45 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-bed',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-10',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Jueves, 10 de septiembre de 2026',
            amountPrimary: '15,34 CAD',
            amountSecondary: '9,59 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-10',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Jueves, 10 de septiembre de 2026',
            amountPrimary: '0,83 CAD',
            amountSecondary: '0,53 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-09',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Miércoles, 9 de septiembre de 2026',
            amountPrimary: '3,34 CAD',
            amountSecondary: '2,09 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-09',
            title: 'Tim Hortons Calgary',
            dateLabel: 'Miércoles, 9 de septiembre de 2026',
            amountPrimary: '17,83 CAD',
            amountSecondary: '11,15 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-09-08',
            title: 'Calgary Parking',
            dateLabel: 'Martes, 8 de septiembre de 2026',
            amountPrimary: '2,00 CAD',
            amountSecondary: '1,26 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-square-parking',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-31',
            title: 'Walmart Supercenter Drayton Valley',
            dateLabel: 'Lunes, 31 de agosto de 2026',
            amountPrimary: '23,96 CAD',
            amountSecondary: '14,95 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-30',
            title: 'Shell Grande Prairie',
            dateLabel: 'Domingo, 30 de agosto de 2026',
            amountPrimary: '150,00 CAD',
            amountSecondary: '93,49 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-30',
            title: 'Wendy\'s Dawson Creek',
            dateLabel: 'Domingo, 30 de agosto de 2026',
            amountPrimary: '34,98 CAD',
            amountSecondary: '21,81 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-30',
            title: 'Walmart Supercenter Dawson Creek',
            dateLabel: 'Domingo, 30 de agosto de 2026',
            amountPrimary: '106,46 CAD',
            amountSecondary: '66,37 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-30',
            title: 'Dawson Creek Visitor Centre',
            dateLabel: 'Domingo, 30 de agosto de 2026',
            amountPrimary: '3,74 CAD',
            amountSecondary: '2,33 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-30',
            title: 'Deel, Inc.',
            dateLabel: 'Domingo, 30 de agosto de 2026',
            amountPrimary: '+ 425,55 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-29',
            title: 'Save On Foods Fort Nelson',
            dateLabel: 'Sábado, 29 de agosto de 2026',
            amountPrimary: '38,08 CAD',
            amountSecondary: '23,75 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-29',
            title: 'Fort Nelson District Chamber',
            dateLabel: 'Sábado, 29 de agosto de 2026',
            amountPrimary: '9,46 CAD',
            amountSecondary: '5,89 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-29',
            title: 'Chevron Fort Nelson',
            dateLabel: 'Sábado, 29 de agosto de 2026',
            amountPrimary: '150,00 CAD',
            amountSecondary: '93,55 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-28',
            title: 'McDonald\'s Fort Nelson',
            dateLabel: 'Viernes, 28 de agosto de 2026',
            amountPrimary: '19,61 CAD',
            amountSecondary: '12,23 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-24',
            title: 'Northern Lights Centre Watson Lake',
            dateLabel: 'Lunes, 24 de agosto de 2026',
            amountPrimary: '34,00 CAD',
            amountSecondary: '21,14 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-24',
            title: 'Junction 37 Watson Lake',
            dateLabel: 'Lunes, 24 de agosto de 2026',
            amountPrimary: '44,77 CAD',
            amountSecondary: '27,84 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-23',
            title: 'Deel, Inc.',
            dateLabel: 'Domingo, 23 de agosto de 2026',
            amountPrimary: '+ 168,85 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-23',
            title: 'Save On Foods Whitehorse',
            dateLabel: 'Domingo, 23 de agosto de 2026',
            amountPrimary: '24,66 CAD',
            amountSecondary: '15,40 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-23',
            title: 'Dollarama Whitehorse',
            dateLabel: 'Domingo, 23 de agosto de 2026',
            amountPrimary: '10,23 CAD',
            amountSecondary: '6,39 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-21',
            title: 'Dollarama Whitehorse',
            dateLabel: 'Viernes, 21 de agosto de 2026',
            amountPrimary: '10,92 CAD',
            amountSecondary: '6,82 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-21',
            title: 'McDonald\'s Whitehorse',
            dateLabel: 'Viernes, 21 de agosto de 2026',
            amountPrimary: '26,01 CAD',
            amountSecondary: '16,25 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-21',
            title: 'Top Spot Haines Junction',
            dateLabel: 'Viernes, 21 de agosto de 2026',
            amountPrimary: '100,00 CAD',
            amountSecondary: '62,49 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-18',
            title: 'Three Bears Wasilla',
            dateLabel: 'Martes, 18 de agosto de 2026',
            amountPrimary: '3,88 USD',
            amountSecondary: '3,36 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-18',
            title: 'Chevron Tok',
            dateLabel: 'Martes, 18 de agosto de 2026',
            amountPrimary: '61,04 USD',
            amountSecondary: '52,96 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-16',
            title: 'Walmart Supercenter Fairbanks',
            dateLabel: 'Domingo, 16 de agosto de 2026',
            amountPrimary: '57,12 USD',
            amountSecondary: '49,59 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-16',
            title: 'Deel, Inc.',
            dateLabel: 'Domingo, 16 de agosto de 2026',
            amountPrimary: '+ 170,46 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-15',
            title: 'Walmart Supercenter Fairbanks',
            dateLabel: 'Sábado, 15 de agosto de 2026',
            amountPrimary: '201,37 USD',
            amountSecondary: '174,84 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-15',
            title: 'Fairbanks Laundry',
            dateLabel: 'Sábado, 15 de agosto de 2026',
            amountPrimary: '10,00 USD',
            amountSecondary: '8,68 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-shirt',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-15',
            title: 'Fairbanks Laundry',
            dateLabel: 'Sábado, 15 de agosto de 2026',
            amountPrimary: '15,00 USD',
            amountSecondary: '13,02 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-shirt',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-15',
            title: 'The Home Depot Fairbanks',
            dateLabel: 'Sábado, 15 de agosto de 2026',
            amountPrimary: '58,10 USD',
            amountSecondary: '50,46 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-15',
            title: 'Three Bears Fairbanks',
            dateLabel: 'Sábado, 15 de agosto de 2026',
            amountPrimary: '8,38 USD',
            amountSecondary: '7,27 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-15',
            title: 'Tesoro Healy',
            dateLabel: 'Sábado, 15 de agosto de 2026',
            amountPrimary: '83,31 USD',
            amountSecondary: '72,35 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-14',
            title: '49th State Brewing Healy',
            dateLabel: 'Viernes, 14 de agosto de 2026',
            amountPrimary: '16,70 USD',
            amountSecondary: '14,50 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-14',
            title: '49th State Brewing Healy',
            dateLabel: 'Viernes, 14 de agosto de 2026',
            amountPrimary: '36,73 USD',
            amountSecondary: '31,90 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-14',
            title: 'Domino\'s Anchorage',
            dateLabel: 'Viernes, 14 de agosto de 2026',
            amountPrimary: '10,98 USD',
            amountSecondary: '9,53 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-13',
            title: 'Deel, Inc.',
            dateLabel: 'Jueves, 13 de agosto de 2026',
            amountPrimary: '+ 288,19 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-13',
            title: 'Google One -',
            dateLabel: 'Jueves, 13 de agosto de 2026',
            amountPrimary: '1,99 USD',
            amountSecondary: '1,74 EUR',
            isPositive: false,
            iconType: 'image',
            iconSrc: 'images/google one.png',
            iconBg: '#ffffff'
        },
        {
            date: '2026-08-10',
            title: 'Fred-Meyer Soldotna',
            dateLabel: 'Lunes, 10 de agosto de 2026',
            amountPrimary: '14,82 USD',
            amountSecondary: '12,90 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-10',
            title: 'Circle K Soldotna',
            dateLabel: 'Lunes, 10 de agosto de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '87,03 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-09',
            title: 'McDonald\'s Homer',
            dateLabel: 'Domingo, 9 de agosto de 2026',
            amountPrimary: '14,87 USD',
            amountSecondary: '12,93 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-09',
            title: 'Safeway Homer',
            dateLabel: 'Domingo, 9 de agosto de 2026',
            amountPrimary: '16,86 USD',
            amountSecondary: '14,66 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-08',
            title: 'Safeway Homer',
            dateLabel: 'Sábado, 8 de agosto de 2026',
            amountPrimary: '22,47 USD',
            amountSecondary: '19,53 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-08',
            title: 'Rainbow Tours',
            dateLabel: 'Sábado, 8 de agosto de 2026',
            amountPrimary: '32,14 USD',
            amountSecondary: '27,93 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-08-01',
            title: 'Google Cloud',
            dateLabel: 'Sábado, 1 de agosto de 2026',
            amountPrimary: '0,01 USD',
            amountSecondary: '0,02 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-31',
            title: 'Marathon Glennallen',
            dateLabel: 'Viernes, 31 de julio de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '87,14 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-31',
            title: 'McDonald\'s North Pole',
            dateLabel: 'Viernes, 31 de julio de 2026',
            amountPrimary: '10,87 USD',
            amountSecondary: '9,46 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-31',
            title: 'Shell Fairbanks',
            dateLabel: 'Viernes, 31 de julio de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '87,25 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-30',
            title: 'Domino\'s Fairbanks',
            dateLabel: 'Jueves, 30 de julio de 2026',
            amountPrimary: '15,98 USD',
            amountSecondary: '13,95 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-30',
            title: 'Walmart Fairbanks',
            dateLabel: 'Jueves, 30 de julio de 2026',
            amountPrimary: '12,46 USD',
            amountSecondary: '10,87 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-30',
            title: 'Walmart Supercenter Fairbanks',
            dateLabel: 'Jueves, 30 de julio de 2026',
            amountPrimary: '19,32 USD',
            amountSecondary: '16,86 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-30',
            title: 'Fred Meyer Fairbanks',
            dateLabel: 'Jueves, 30 de julio de 2026',
            amountPrimary: '33,48 USD',
            amountSecondary: '29,20 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-30',
            title: 'The Home Depot Fairbanks',
            dateLabel: 'Jueves, 30 de julio de 2026',
            amountPrimary: '24,96 USD',
            amountSecondary: '21,76 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-30',
            title: 'Hilltop Sourdough Fuel Fairbanks',
            dateLabel: 'Jueves, 30 de julio de 2026',
            amountPrimary: '40,00 USD',
            amountSecondary: '34,86 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-30',
            title: 'Deel, Inc.',
            dateLabel: 'Jueves, 30 de julio de 2026',
            amountPrimary: '+ 513,05 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-29',
            title: 'Coldfoot Camp',
            dateLabel: 'Miércoles, 29 de julio de 2026',
            amountPrimary: '20,01 USD',
            amountSecondary: '17,54 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-29',
            title: 'Coldfoot Camp',
            dateLabel: 'Miércoles, 29 de julio de 2026',
            amountPrimary: '41,30 USD',
            amountSecondary: '36,42 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-27',
            title: 'Brooks Range Supply Prudhoe Bay',
            dateLabel: 'Lunes, 27 de julio de 2026',
            amountPrimary: '7,65 USD',
            amountSecondary: '6,75 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-27',
            title: 'Brooks Range Supply Prudhoe Bay',
            dateLabel: 'Lunes, 27 de julio de 2026',
            amountPrimary: '6,30 USD',
            amountSecondary: '5,56 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-23',
            title: 'Coldfoot Camp',
            dateLabel: 'Jueves, 23 de julio de 2026',
            amountPrimary: '19,99 USD',
            amountSecondary: '17,65 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-23',
            title: 'Coldfoot Camp',
            dateLabel: 'Jueves, 23 de julio de 2026',
            amountPrimary: '57,70 USD',
            amountSecondary: '50,95 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-20',
            title: 'Speedway Fairbanks',
            dateLabel: 'Lunes, 20 de julio de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '88,01 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-20',
            title: 'Speedway Fairbanks',
            dateLabel: 'Lunes, 20 de julio de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '88,01 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-20',
            title: 'McDonald\'s Fairbanks',
            dateLabel: 'Lunes, 20 de julio de 2026',
            amountPrimary: '26,10 USD',
            amountSecondary: '22,97 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-20',
            title: 'Deel, Inc.',
            dateLabel: 'Lunes, 20 de julio de 2026',
            amountPrimary: '+ 172,77 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-20',
            title: 'Walmart Supercenter Fairbanks',
            dateLabel: 'Lunes, 20 de julio de 2026',
            amountPrimary: '9,06 USD',
            amountSecondary: '7,97 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-20',
            title: 'Walmart Fairbanks',
            dateLabel: 'Lunes, 20 de julio de 2026',
            amountPrimary: '137,24 USD',
            amountSecondary: '120,81 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-20',
            title: 'The Home Depot Fairbanks',
            dateLabel: 'Lunes, 20 de julio de 2026',
            amountPrimary: '23,04 USD',
            amountSecondary: '20,28 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-20',
            title: 'Three Bears Fairbanks',
            dateLabel: 'Lunes, 20 de julio de 2026',
            amountPrimary: '18,75 USD',
            amountSecondary: '16,51 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-18',
            title: 'Tesoro Healy',
            dateLabel: 'Sábado, 18 de julio de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '87,82 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-18',
            title: 'Anyone Ai - Ml Career Anyoneai.Com',
            dateLabel: 'Sábado, 18 de julio de 2026',
            amountPrimary: '28,90 USD',
            amountSecondary: '25,38 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-graduation-cap',
            iconBg: '#1f2937'
        },
        {
            date: '2026-07-18',
            title: 'Deel, Inc.',
            dateLabel: 'Sábado, 18 de julio de 2026',
            amountPrimary: '+ 344,76 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-30',
            title: 'Three Bears Wasilla',
            dateLabel: 'Martes, 30 de junio de 2026',
            amountPrimary: '59,05 USD',
            amountSecondary: '51,95 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-30',
            title: 'Three Bears Wasilla',
            dateLabel: 'Martes, 30 de junio de 2026',
            amountPrimary: '17,99 USD',
            amountSecondary: '15,82 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-30',
            title: 'Youngs Chevron Tok',
            dateLabel: 'Martes, 30 de junio de 2026',
            amountPrimary: '49,79 USD',
            amountSecondary: '43,78 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-30',
            title: 'Chevron Tok',
            dateLabel: 'Martes, 30 de junio de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '87,92 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-30',
            title: 'Chevron Tok',
            dateLabel: 'Martes, 30 de junio de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '87,92 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-30',
            title: 'Deel, Inc.',
            dateLabel: 'Martes, 30 de junio de 2026',
            amountPrimary: '+ 299,44 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-29',
            title: 'Estación Motor In Beaver Creek',
            dateLabel: 'Lunes, 29 de junio de 2026',
            amountPrimary: '29,25 CAD',
            amountSecondary: '18,09 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-28',
            title: 'Estación Haines Fas Ga Haines Juncti',
            dateLabel: 'Domingo, 28 de junio de 2026',
            amountPrimary: '25,38 CAD',
            amountSecondary: '15,75 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-28',
            title: 'The Little Green Apple Haines Juncti',
            dateLabel: 'Domingo, 28 de junio de 2026',
            amountPrimary: '13,25 CAD',
            amountSecondary: '8,22 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-25',
            title: 'North 60 Petro Chillko Whitehorse',
            dateLabel: 'Jueves, 25 de junio de 2026',
            amountPrimary: '25,00 CAD',
            amountSecondary: '15,56 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-25',
            title: 'Canadian Tire Whitehorse',
            dateLabel: 'Jueves, 25 de junio de 2026',
            amountPrimary: '39,89 CAD',
            amountSecondary: '24,82 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-25',
            title: 'Walmart Store Whitehorse',
            dateLabel: 'Jueves, 25 de junio de 2026',
            amountPrimary: '182,21 CAD',
            amountSecondary: '113,40 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-25',
            title: 'Deel, Inc.',
            dateLabel: 'Jueves, 25 de junio de 2026',
            amountPrimary: '+ 86,70 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-24',
            title: 'Yukon Motel & Restaur Teslin',
            dateLabel: 'Miércoles, 24 de junio de 2026',
            amountPrimary: '84,53 CAD',
            amountSecondary: '52,52 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-bed',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-23',
            title: 'Petro-Canada Dease Lake',
            dateLabel: 'Martes, 23 de junio de 2026',
            amountPrimary: '150,00 CAD',
            amountSecondary: '93,14 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-23',
            title: 'Deel, Inc.',
            dateLabel: 'Martes, 23 de junio de 2026',
            amountPrimary: '+ 199,24 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-19',
            title: 'Safeway Smithers',
            dateLabel: 'Viernes, 19 de junio de 2026',
            amountPrimary: '21,87 CAD',
            amountSecondary: '13,53 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-19',
            title: 'Smithers Chev Smithers',
            dateLabel: 'Viernes, 19 de junio de 2026',
            amountPrimary: '75,00 CAD',
            amountSecondary: '46,41 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-18',
            title: 'Bon Voyage Gas & Groc Prince George',
            dateLabel: 'Jueves, 18 de junio de 2026',
            amountPrimary: '100,00 CAD',
            amountSecondary: '61,99 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-18',
            title: 'Best Buy Prince George',
            dateLabel: 'Jueves, 18 de junio de 2026',
            amountPrimary: '67,19 CAD',
            amountSecondary: '41,66 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-18',
            title: 'London Drugs 51 Prince George',
            dateLabel: 'Jueves, 18 de junio de 2026',
            amountPrimary: '8,95 CAD',
            amountSecondary: '5,55 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-18',
            title: 'London Drugs 51 Prince George',
            dateLabel: 'Jueves, 18 de junio de 2026',
            amountPrimary: '44,79 CAD',
            amountSecondary: '27,77 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-18',
            title: 'Walmart Supercenter Prince George',
            dateLabel: 'Jueves, 18 de junio de 2026',
            amountPrimary: '138,26 CAD',
            amountSecondary: '85,65 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-17',
            title: 'Deel, Inc.',
            dateLabel: 'Miércoles, 17 de junio de 2026',
            amountPrimary: '+ 145,18 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-15',
            title: 'Walmart Supercenter Prince George',
            dateLabel: 'Lunes, 15 de junio de 2026',
            amountPrimary: '174,63 CAD',
            amountSecondary: '108,12 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-15',
            title: 'Anyone Ai - Ml Career Anyoneai.Com',
            dateLabel: 'Lunes, 15 de junio de 2026',
            amountPrimary: '250,00 USD',
            amountSecondary: '216,28 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-graduation-cap',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-15',
            title: 'Deel, Inc.',
            dateLabel: 'Lunes, 15 de junio de 2026',
            amountPrimary: '+ 424,49 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-14',
            title: 'Ashcroft Travel Centre Ashcroft',
            dateLabel: 'Domingo, 14 de junio de 2026',
            amountPrimary: '100,00 CAD',
            amountSecondary: '61,96 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-bed',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-14',
            title: 'Hope S.K.T. Farmers Ma Hope',
            dateLabel: 'Domingo, 14 de junio de 2026',
            amountPrimary: '20,87 CAD',
            amountSecondary: '12,94 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-13',
            title: 'Starbucks Vancouver',
            dateLabel: 'Sábado, 13 de junio de 2026',
            amountPrimary: '15,18 CAD',
            amountSecondary: '9,42 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-13',
            title: 'Compass Account Burnab Burnaby',
            dateLabel: 'Sábado, 13 de junio de 2026',
            amountPrimary: '6,60 CAD',
            amountSecondary: '4,10 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-bus',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-13',
            title: 'Compass Account Burnab Burnaby',
            dateLabel: 'Sábado, 13 de junio de 2026',
            amountPrimary: '3,35 CAD',
            amountSecondary: '2,08 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-bus',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-13',
            title: 'Google One -',
            dateLabel: 'Sábado, 13 de junio de 2026',
            amountPrimary: '1,99 USD',
            amountSecondary: '1,73 EUR',
            isPositive: false,
            iconType: 'image',
            iconSrc: 'images/google one.png',
            iconBg: '#ffffff'
        },
        {
            date: '2026-06-12',
            title: 'Fred-Meyer Bellingham',
            dateLabel: 'Viernes, 12 de junio de 2026',
            amountPrimary: '145,70 USD',
            amountSecondary: '126,54 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-12',
            title: 'Cypress Vet Hospital -',
            dateLabel: 'Viernes, 12 de junio de 2026',
            amountPrimary: '92,00 USD',
            amountSecondary: '79,90 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-11',
            title: 'Walmart Arlington',
            dateLabel: 'Jueves, 11 de junio de 2026',
            amountPrimary: '21,04 USD',
            amountSecondary: '18,26 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-06-10',
            title: 'Deel, Inc.',
            dateLabel: 'Miércoles, 10 de junio de 2026',
            amountPrimary: '+ 341,47 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-31',
            title: 'Yellowstone Forever Yellowstone N',
            dateLabel: 'Domingo, 31 de mayo de 2026',
            amountPrimary: '31,14 USD',
            amountSecondary: '26,83 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-30',
            title: 'Canyon Village Station Yellowstone N',
            dateLabel: 'Sábado, 30 de mayo de 2026',
            amountPrimary: '40,00 USD',
            amountSecondary: '34,47 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-30',
            title: 'Deel, Inc.',
            dateLabel: 'Sábado, 30 de mayo de 2026',
            amountPrimary: '+ 84,56 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-29',
            title: 'Food Roundup West Yellowst',
            dateLabel: 'Viernes, 29 de mayo de 2026',
            amountPrimary: '8,17 USD',
            amountSecondary: '7,04 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-25',
            title: 'Walmart Riverton',
            dateLabel: 'Lunes, 25 de mayo de 2026',
            amountPrimary: '128,62 USD',
            amountSecondary: '111,03 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-25',
            title: 'Wm Supercenter Riverton',
            dateLabel: 'Lunes, 25 de mayo de 2026',
            amountPrimary: '7,84 USD',
            amountSecondary: '6,76 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-25',
            title: 'Burger King Riverton',
            dateLabel: 'Lunes, 25 de mayo de 2026',
            amountPrimary: '7,39 USD',
            amountSecondary: '6,38 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-25',
            title: 'Exxon Good To Go Store Riverton',
            dateLabel: 'Lunes, 25 de mayo de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '86,28 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-25',
            title: 'Recreation.Gov - -',
            dateLabel: 'Lunes, 25 de mayo de 2026',
            amountPrimary: '25,00 USD',
            amountSecondary: '21,57 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-24',
            title: 'Mack\'S Market Inc Thermopolis',
            dateLabel: 'Domingo, 24 de mayo de 2026',
            amountPrimary: '35,51 USD',
            amountSecondary: '30,66 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-23',
            title: 'Old Faithful Upper Bozeman',
            dateLabel: 'Sábado, 23 de mayo de 2026',
            amountPrimary: '8,87 USD',
            amountSecondary: '7,68 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-23',
            title: 'Yellowstone Forever - Yellowstone N',
            dateLabel: 'Sábado, 23 de mayo de 2026',
            amountPrimary: '25,61 USD',
            amountSecondary: '22,17 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-22',
            title: 'Phillips 66 - Colter Bay Moran',
            dateLabel: 'Viernes, 22 de mayo de 2026',
            amountPrimary: '100,00 USD',
            amountSecondary: '86,58 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-22',
            title: 'Amk Signal Mnt Lodge Groc Moran',
            dateLabel: 'Viernes, 22 de mayo de 2026',
            amountPrimary: '4,59 USD',
            amountSecondary: '3,98 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-19',
            title: 'Wp*Event Tickets',
            dateLabel: 'Martes, 19 de mayo de 2026',
            amountPrimary: '30,00 USD',
            amountSecondary: '25,97 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-18',
            title: 'Anyone Ai - Ml Career Anyoneai.Com',
            dateLabel: 'Lunes, 18 de mayo de 2026',
            amountPrimary: '234,28 USD',
            amountSecondary: '201,98 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-graduation-cap',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-17',
            title: 'Wendy\'S Jackson',
            dateLabel: 'Domingo, 17 de mayo de 2026',
            amountPrimary: '23,30 USD',
            amountSecondary: '20,13 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-17',
            title: 'Target Jackson',
            dateLabel: 'Domingo, 17 de mayo de 2026',
            amountPrimary: '35,07 USD',
            amountSecondary: '30,31 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-15',
            title: 'Alpine Market Alpine',
            dateLabel: 'Viernes, 15 de mayo de 2026',
            amountPrimary: '19,05 USD',
            amountSecondary: '16,46 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-15',
            title: 'Family Dollar Alpine',
            dateLabel: 'Viernes, 15 de mayo de 2026',
            amountPrimary: '28,20 USD',
            amountSecondary: '24,37 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-13',
            title: 'Google One -',
            dateLabel: 'Miércoles, 13 de mayo de 2026',
            amountPrimary: '1,99 USD',
            amountSecondary: '1,71 EUR',
            isPositive: false,
            iconType: 'image',
            iconSrc: 'images/google one.png',
            iconBg: '#ffffff'
        },
        {
            date: '2026-05-12',
            title: 'Broadway Wash N Dry Idaho Falls',
            dateLabel: 'Martes, 12 de mayo de 2026',
            amountPrimary: '10,00 USD',
            amountSecondary: '8,55 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-12',
            title: 'Walmart Idaho Falls',
            dateLabel: 'Martes, 12 de mayo de 2026',
            amountPrimary: '52,04 USD',
            amountSecondary: '44,55 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-11',
            title: 'Deel, Inc.',
            dateLabel: 'Lunes, 11 de mayo de 2026',
            amountPrimary: '+ 753,31 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-10',
            title: 'One9_ Carlin',
            dateLabel: 'Domingo, 10 de mayo de 2026',
            amountPrimary: '0,78 USD',
            amountSecondary: '0,67 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-05-10',
            title: 'One9_ Carlin',
            dateLabel: 'Domingo, 10 de mayo de 2026',
            amountPrimary: '0,78 USD',
            amountSecondary: '0,67 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-04-17',
            title: 'Deel, Inc.',
            dateLabel: 'Viernes, 17 de abril de 2026',
            amountPrimary: '+ 75,98 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-31',
            title: 'McDonald\'s Page',
            dateLabel: 'Martes, 31 de marzo de 2026',
            amountPrimary: '3,42 USD',
            amountSecondary: '2,96 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-31',
            title: 'Walmart Supercenter Page',
            dateLabel: 'Martes, 31 de marzo de 2026',
            amountPrimary: '2,60 USD',
            amountSecondary: '2,26 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-30',
            title: 'Walmart Supercenter Page',
            dateLabel: 'Lunes, 30 de marzo de 2026',
            amountPrimary: '4,30 USD',
            amountSecondary: '3,77 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-30',
            title: 'Walmart Supercenter Page',
            dateLabel: 'Lunes, 30 de marzo de 2026',
            amountPrimary: '5,38 USD',
            amountSecondary: '4,71 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-30',
            title: 'Burger King Kayenta',
            dateLabel: 'Lunes, 30 de marzo de 2026',
            amountPrimary: '9,80 USD',
            amountSecondary: '8,59 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-burger',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-29',
            title: 'Navajo Nation Monument Valley',
            dateLabel: 'Domingo, 29 de marzo de 2026',
            amountPrimary: '35,00 USD',
            amountSecondary: '30,55 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-28',
            title: 'Bashas\' Kayenta',
            dateLabel: 'Sábado, 28 de marzo de 2026',
            amountPrimary: '5,69 USD',
            amountSecondary: '4,96 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-28',
            title: 'Marathon Tuba City',
            dateLabel: 'Sábado, 28 de marzo de 2026',
            amountPrimary: '83,17 USD',
            amountSecondary: '72,59 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-gas-pump',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-25',
            title: 'NIUM * BOOT CAMP CHILE SPA',
            dateLabel: 'Miércoles, 25 de marzo de 2026',
            amountPrimary: '+ 62,86 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2026-03-23',
            title: 'South Rim General Store Grand Canyon',
            dateLabel: 'Lunes, 23 de marzo de 2026',
            amountPrimary: '7,65 USD',
            amountSecondary: '6,62 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-05',
            title: 'Starbucks Tlacoquemécatl',
            dateLabel: 'Jueves, 5 de febrero de 2026',
            amountPrimary: '59,00 MXN',
            amountSecondary: '2,90 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-04',
            title: 'Walmart Express Ciudad de México',
            dateLabel: 'Miércoles, 4 de febrero de 2026',
            amountPrimary: '270,16 MXN',
            amountSecondary: '13,30 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-04',
            title: 'Starbucks Tlacoquemécatl',
            dateLabel: 'Miércoles, 4 de febrero de 2026',
            amountPrimary: '149,00 MXN',
            amountSecondary: '7,33 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-mug-saucer',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-04',
            title: 'Oxxo Capulín',
            dateLabel: 'Miércoles, 4 de febrero de 2026',
            amountPrimary: '41,90 MXN',
            amountSecondary: '2,06 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-04',
            title: 'Farmacia México Centro',
            dateLabel: 'Miércoles, 4 de febrero de 2026',
            amountPrimary: '679,00 MXN',
            amountSecondary: '33,44 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-prescription-bottle-medical',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-04',
            title: 'Dr. Cln Ojos Ciudad de México',
            dateLabel: 'Miércoles, 4 de febrero de 2026',
            amountPrimary: '700,00 MXN',
            amountSecondary: '34,51 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-prescription-bottle-medical',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-04',
            title: 'Metrobús Ciudad de México',
            dateLabel: 'Miércoles, 4 de febrero de 2026',
            amountPrimary: '60,00 MXN',
            amountSecondary: '2,96 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-bus',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-03',
            title: 'Oxxo Cholula',
            dateLabel: 'Martes, 3 de febrero de 2026',
            amountPrimary: '78,00 MXN',
            amountSecondary: '3,86 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-03',
            title: 'Salón San Lorenzo',
            dateLabel: 'Martes, 3 de febrero de 2026',
            amountPrimary: '169,23 MXN',
            amountSecondary: '8,35 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-credit-card',
            iconBg: '#1f2937'
        },
        {
            date: '2026-02-01',
            title: 'Deel, Inc.',
            dateLabel: 'Domingo, 1 de febrero de 2026',
            amountPrimary: '+ 748,73 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        }
    ];
}

function getLegacyDashboardItems() {
    return [
        {
            date: '2025-11-17',
            title: 'Google One',
            dateLabel: 'Lunes, 17 de noviembre de 2025',
            amountPrimary: '1,99 USD',
            isPositive: false,
            iconType: 'image',
            iconSrc: 'images/google one.png',
            iconBg: '#ffffff'
        },
        {
            date: '2025-11-10',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Lunes, 10 de noviembre de 2025',
            amountPrimary: '+ 1.207,79 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2025-11-06',
            title: 'Súper La Torre',
            dateLabel: 'Jueves, 6 de noviembre de 2025',
            amountPrimary: '160,26 GTQ',
            amountSecondary: '11,48 USD',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2025-11-03',
            title: 'Súper La Torre',
            dateLabel: 'Lunes, 3 de noviembre de 2025',
            amountPrimary: '40,26 GTQ',
            amountSecondary: '5,48 USD',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2025-11-03',
            title: 'Deel, Inc.',
            dateLabel: 'Lunes, 3 de noviembre de 2025',
            amountPrimary: '+ 141,72 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2025-10-30',
            title: 'Border Mgmt Agency',
            dateLabel: 'Jueves, 30 de octubre de 2025',
            amountPrimary: '80 BZD',
            amountSecondary: '34,88 USD',
            isPositive: false,
            iconClass: 'fa-regular fa-file-lines',
            iconBg: '#1f2937'
        },
        {
            date: '2025-10-23',
            title: 'Insurance',
            dateLabel: 'Jueves, 23 de octubre de 2025',
            amountPrimary: '29,10 BZD',
            amountSecondary: '15,93 USD',
            isPositive: false,
            iconClass: 'fa-solid fa-car',
            iconBg: '#1f2937'
        },
        {
            date: '2025-10-06',
            title: 'Deel, Inc.',
            dateLabel: 'Lunes, 6 de octubre de 2025',
            amountPrimary: '+ 1.600,70 EUR',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        },
        {
            date: '2025-10-03',
            title: 'Chedraui',
            dateLabel: 'Viernes, 3 de octubre de 2025',
            amountPrimary: '149,10 MXN',
            amountSecondary: '6,93 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2025-09-24',
            title: 'Juan Camilo Garcia',
            dateLabel: 'Miércoles, 24 de septiembre de 2025',
            amountPrimary: '47,01 USD',
            amountSecondary: '40 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-arrow-up',
            iconBg: '#1f2937'
        },
        {
            date: '2025-09-23',
            title: 'Chedraui',
            dateLabel: 'Martes, 23 de septiembre de 2025',
            amountPrimary: '149,10 MXN',
            amountSecondary: '6,93 EUR',
            isPositive: false,
            iconClass: 'fa-solid fa-cart-shopping',
            iconBg: '#1f2937'
        },
        {
            date: '2025-09-01',
            title: 'BOOT CAMP CHILE',
            dateLabel: 'Lunes, 1 de septiembre de 2025',
            amountPrimary: '+ 1802,21 USD',
            isPositive: true,
            iconClass: 'fa-solid fa-arrow-down',
            iconBg: '#1f2937'
        }
    ];
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
