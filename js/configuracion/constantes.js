// ============================================================
// constantes.js — Centro de Control del Sistema de Enjambre
// Todas las variables ajustables del sistema en un solo lugar.
// ============================================================

// --- Población ---
export const TOTAL_DRONES = 4000;

// --- Movimiento (Interpolación Simple) ---
export const VELOCIDAD_INTERPOLACION = 0.08;  // Más rápido (antes 0.05)
export const SNAP_DISTANCIA = 1.0;            // Mayor radio de llegada
export const FRICCION = 0.95;                 // Damping del aire

// --- Grid / Pixel Art ---
export const TAMANO_CELDA = 8;                // Más pequeño = Más resolución (Más drones)
export const RADIO_COLISION = 0;              // Desactivado
export const RADIO_PROXIMIDAD = 0;            // Desactivado

// --- Quadtree ---
export const CAPACIDAD_QUADTREE = 4;          // Máx. drones por nodo antes de subdividir

// --- Formación Base ---
export const ZONA_BASE_PORCENTAJE = 0.15;     // La base ocupa el 15% inferior del canvas
export const ESPACIADO_BASE = 4;              // Más compactos en la base

// --- Visual ---
export const COLORES = {
    dronesActivos: '#00d2ff',                 // Cian brillante
    dronesInactivos: '#444444',               // Gris oscuro
    dronesCayendo: '#ff4444',                 // Rojo al caer
    fondo: '#0a0a0f',                         // Fondo casi negro
};

export const TAMANO = {
    dronActivo: 3,                            // Radio 3px (Diámetro 6px) para celda de 8px
    dronInactivo: 1.5,                        // Radio en px cuando está en base
};

// --- Estados del Dron Individual ---
export const ESTADO_DRON = {
    EN_BASE: 'EN_BASE',
    SUBIENDO: 'SUBIENDO',
    EN_POSICION: 'EN_POSICION',
    CAYENDO: 'CAYENDO',
};

// --- Estados del Orquestador ---
export const ESTADOS = {
    EN_BASE: 'EN_BASE',
    FORMANDO: 'FORMANDO',
    TRANSICION: 'TRANSICION',
};
