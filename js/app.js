// ============================================
// MENÚ DINÁMICO CON SUBMENÚS - Versión Completa
// ============================================

const STORAGE_KEY = 'menuDinamico_pro_v2';

// Datos iniciales con submenús
const defaultMenuData = [
    { 
        id: 1, 
        nombre: "Inicio", 
        enlace: "/home", 
        icono: "🏠", 
        tipo: "main",
        parentId: null
    },
    { 
        id: 2, 
        nombre: "Servicios", 
        enlace: "/servicios", 
        icono: "⚙️", 
        tipo: "main",
        parentId: null,
        hasSubmenu: true
    },
    { 
        id: 3, 
        nombre: "Consultoría", 
        enlace: "/servicios/consultoria", 
        icono: "📊", 
        tipo: "sub",
        parentId: 2
    },
    { 
        id: 4, 
        nombre: "Desarrollo", 
        enlace: "/servicios/desarrollo", 
        icono: "💻", 
        tipo: "sub",
        parentId: 2
    },
    { 
        id: 5, 
        nombre: "Soporte", 
        enlace: "/servicios/soporte", 
        icono: "🔧", 
        tipo: "sub",
        parentId: 2
    },
    { 
        id: 6, 
        nombre: "Contacto", 
        enlace: "/contacto", 
        icono: "✉️", 
        tipo: "main",
        parentId: null
    }
];

let menuData = loadMenuData();

// ============================================
// FUNCIONES DE PERSISTENCIA
// ============================================

function loadMenuData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        console.log('📂 Datos cargados desde localStorage');
        return JSON.parse(saved);
    }
    console.log('📂 Usando datos predeterminados');
    return JSON.parse(JSON.stringify(defaultMenuData));
}

function saveMenuData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData));
    console.log('💾 Datos guardados en localStorage');
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    renderAdminLists();
    updateParentSelect();
    setupEventListeners();
    setupTabs();
});

// Renderizar menú completo
function renderMenu() {
    const menuList = document.getElementById('menuList');
    menuList.innerHTML = '';

    // Obtener menús principales
    const mainMenus = menuData.filter(item => item.tipo === 'main');

    mainMenus.forEach(mainItem => {
        const li = document.createElement('li');
        li.className = 'menu-item';

        // Crear enlace principal
        const a = document.createElement('a');
        a.href = mainItem.enlace;
        a.className = `menu-link ${mainItem.hasSubmenu ? 'has-submenu' : ''}`;
        a.innerHTML = `
            <span class="icon">${mainItem.icono || '📌'}</span>
            <span>${mainItem.nombre}</span>
        `;

        a.addEventListener('click', (e) => {
            if (mainItem.hasSubmenu) {
                e.preventDefault();
                showMessage(`📂 ${mainItem.nombre} tiene submenú`, 'info');
            } else {
                e.preventDefault();
                showMessage(`📍 Navegando a: ${mainItem.nombre}`, 'success');
            }
        });

        li.appendChild(a);

        // Si tiene submenú, agregarlo
        if (mainItem.hasSubmenu) {
            const submenu = document.createElement('div');
            submenu.className = 'submenu';

            const submenuList = document.createElement('ul');
            submenuList.className = 'submenu-list';

            // Obtener submenús de este padre
            const subItems = menuData.filter(item => 
                item.tipo === 'sub' && item.parentId === mainItem.id
            );

            subItems.forEach(subItem => {
                const subLi = document.createElement('li');
                subLi.className = 'submenu-item';

                const subA = document.createElement('a');
                subA.href = subItem.enlace;
                subA.className = 'submenu-link';
                subA.innerHTML = `
                    <span class="submenu-icon">${subItem.icono || '📄'}</span>
                    <span>${subItem.nombre}</span>
                `;

                subA.addEventListener('click', (e) => {
                    e.preventDefault();
                    showMessage(`📍 ${mainItem.nombre} → ${subItem.nombre}`, 'success');
                });

                subLi.appendChild(subA);
                submenuList.appendChild(subLi);
            });

            submenu.appendChild(submenuList);
            li.appendChild(submenu);
        }

        menuList.appendChild(li);
    });
}

// Renderizar listas en panel admin
function renderAdminLists() {
    const mainList = document.getElementById('mainItemsList');
    const subList = document.getElementById('subItemsList');
    
    mainList.innerHTML = '';
    subList.innerHTML = '';

    menuData.forEach(item => {
        const li = document.createElement('li');
        
        if (item.tipo === 'main') {
            li.innerHTML = `
                <span>${item.icono || '📌'} ${item.nombre} (ID: ${item.id})</span>
                <div class="item-actions">
                    <button class="btn-delete" onclick="deleteItem(${item.id})">Eliminar</button>
                </div>
            `;
            mainList.appendChild(li);
        } else {
            const parent = menuData.find(p => p.id === item.parentId);
            li.innerHTML = `
                <span>${item.icono || '📄'} ${item.nombre} → ${parent ? parent.nombre : 'Sin padre'} (ID: ${item.id})</span>
                <div class="item-actions">
                    <button class="btn-delete" onclick="deleteItem(${item.id})">Eliminar</button>
                </div>
            `;
            subList.appendChild(li);
        }
    });
}

// Actualizar select de menús padres
function updateParentSelect() {
    const select = document.getElementById('parentMenu');
    select.innerHTML = '<option value="">Seleccionar menú principal...</option>';
    
    const mainMenus = menuData.filter(item => item.tipo === 'main');
    mainMenus.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.icono || '📌'} ${item.nombre}`;
        select.appendChild(option);
    });
}

// ============================================
// FUNCIONES DE ADMINISTRACIÓN
// ============================================

function addMainMenuItem(item) {
    // Validación: ID único
    if (menuData.some(i => i.id === item.id)) {
        showMessage('❌ Error: El ID ya existe', 'error');
        return false;
    }

    // Validación: Enlace válido
    if (!item.enlace.startsWith('/')) {
        showMessage('❌ Error: El enlace debe comenzar con "/"', 'error');
        return false;
    }

    // Validación: Nombre no vacío
    if (!item.nombre.trim()) {
        showMessage('❌ Error: El nombre no puede estar vacío', 'error');
        return false;
    }

    menuData.push(item);
    saveMenuData();
    renderMenu();
    renderAdminLists();
    updateParentSelect();
    showMessage('✅ Menú principal agregado', 'success');
    return true;
}

function addSubMenuItem(item) {
    // Validación: ID único
    if (menuData.some(i => i.id === item.id)) {
        showMessage('❌ Error: El ID ya existe', 'error');
        return false;
    }

    // Validación: Padre existe
    if (!menuData.some(p => p.id === item.parentId && p.tipo === 'main')) {
        showMessage('❌ Error: El menú principal no existe', 'error');
        return false;
    }

    // Validación: Enlace válido
    if (!item.enlace.startsWith('/')) {
        showMessage('❌ Error: El enlace debe comenzar con "/"', 'error');
        return false;
    }

    // Actualizar padre para que tenga submenú
    const parent = menuData.find(p => p.id === item.parentId);
    if (parent) {
        parent.hasSubmenu = true;
    }

    menuData.push(item);
    saveMenuData();
    renderMenu();
    renderAdminLists();
    showMessage('✅ Submenú agregado', 'success');
    return true;
}

function deleteItem(id) {
    if (confirm('¿Estás seguro de eliminar esta opción?')) {
        // Si es menú principal, eliminar también sus submenús
        const item = menuData.find(i => i.id === id);
        
        if (item && item.tipo === 'main') {
            // Eliminar submenús asociados
            menuData = menuData.filter(i => i.parentId !== id);
        }
        
        // Eliminar el item
        menuData = menuData.filter(i => i.id !== id);
        
        saveMenuData();
        renderMenu();
        renderAdminLists();
        updateParentSelect();
        showMessage('🗑️ Item eliminado', 'success');
    }
}

function clearAllItems() {
    if (confirm('⚠️ ¿Estás seguro de eliminar TODO el menú?')) {
        menuData = [];
        saveMenuData();
        renderMenu();
        renderAdminLists();
        updateParentSelect();
        showMessage('🗑️ Todo eliminado', 'success');
    }
}

function resetMenu() {
    if (confirm('¿Resetear el menú a los valores originales?')) {
        menuData = JSON.parse(JSON.stringify(defaultMenuData));
        saveMenuData();
        renderMenu();
        renderAdminLists();
        updateParentSelect();
        showMessage('🔄 Menú reseteado', 'success');
    }
}

function showAvailableIds() {
    const usedIds = menuData.map(i => i.id).sort((a, b) => a - b);
    const maxId = usedIds.length > 0 ? Math.max(...usedIds) : 0;
    const nextId = maxId + 1;
    alert(`📊 IDs en uso: ${usedIds.join(', ')}\n\n✅ Siguiente ID disponible: ${nextId}`);
}

// ============================================
// EVENTOS Y UTILIDADES
// ============================================

function setupEventListeners() {
    // Toggle panel admin
    document.getElementById('toggleAdmin').addEventListener('click', () => {
        const panel = document.getElementById('adminPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    // Close button
    document.getElementById('closeAdmin').addEventListener('click', () => {
        document.getElementById('adminPanel').style.display = 'none';
    });

    // Reset button
    document.getElementById('resetMenuBtn').addEventListener('click', resetMenu);

    // Formulario menú principal
    document.getElementById('mainMenuForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const maxId = menuData.length > 0 ? Math.max(...menuData.map(i => i.id)) : 0;
        
        const newItem = {
            id: maxId + 1,
            nombre: document.getElementById('mainName').value,
            enlace: document.getElementById('mainLink').value,
            icono: document.getElementById('mainIcon').value || '📌',
            tipo: 'main',
            parentId: null,
            hasSubmenu: document.getElementById('hasSubmenu').value === 'true'
        };

        if (addMainMenuItem(newItem)) {
            document.getElementById('mainMenuForm').reset();
        }
    });

    // Formulario submenú
    document.getElementById('subMenuForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const maxId = menuData.length > 0 ? Math.max(...menuData.map(i => i.id)) : 0;
        
        const newItem = {
            id: maxId + 1,
            nombre: document.getElementById('subName').value,
            enlace: document.getElementById('subLink').value,
            icono: document.getElementById('subIcon').value || '📄',
            tipo: 'sub',
            parentId: Number(document.getElementById('parentMenu').value)
        };

        if (addSubMenuItem(newItem)) {
            document.getElementById('subMenuForm').reset();
        }
    });
}

// Sistema de pestañas
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activar seleccionado
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// Mostrar mensajes toast
function showMessage(text, type) {
    const box = document.getElementById('messageBox');
    box.textContent = text;
    box.className = `toast ${type}`;
    
    setTimeout(() => {
        box.className = 'toast';
    }, 3000);
}

// Hacer funciones disponibles globalmente
window.deleteItem = deleteItem;
window.clearAllItems = clearAllItems;
window.resetMenu = resetMenu;
window.showAvailableIds = showAvailableIds;