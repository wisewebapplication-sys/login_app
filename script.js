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
        if (viewName === 'login' || viewName === 'verification') {
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

    const requiredViews = ['login', 'verification', 'dashboard', 'cards', 'recipients', 'payments', 'profile'];
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
});