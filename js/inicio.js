// ============================================================
// inicio.js — Punto de Entrada (Bootstrap)
// Crea las instancias, conecta los eventos y arranca el loop.
// ============================================================

import { Orquestador } from './sistemas/Orquestador.js';
import { Camara } from './sistemas/Camara.js';
import { COLORES } from './configuracion/constantes.js';

// --- Elementos del DOM ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const inputTexto = document.getElementById('txtInput');
const btnMostrar = document.getElementById('btnMostrar');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnAnterior = document.getElementById('btnAnterior');
const spanEstado = document.getElementById('estado');
const spanDebug = document.getElementById('debug-info');

// --- Variables de Dimensión ---
let ancho, alto;

// --- Instancias del Sistema ---
const camara = new Camara();
const orquestador = new Orquestador(canvas, ctx);

// ==========================================================
// FUNCIONES DEL SISTEMA
// ==========================================================

/** Ajusta el canvas al tamaño de la ventana */
function redimensionar() {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = ancho;
    canvas.height = alto;
    orquestador.redimensionar(ancho, alto);
}

/** Loop principal — Pipeline de renderizado (60fps) */
function bucle() {
    // 1. Resetear transformaciones y limpiar
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COLORES.fondo;
    ctx.fillRect(0, 0, ancho, alto);

    // 2. Aplicar la cámara (zoom + pan)
    camara.aplicarTransformacion(ctx);

    // 3. Paso de simulación (Quadtree → Fuerzas → Actualizar)
    orquestador.paso();

    // 4. Dibujar los drones
    orquestador.dibujar();

    // 5. Resetear alpha por si quedó cambiado
    ctx.globalAlpha = 1;

    // 6. Repetir
    requestAnimationFrame(bucle);
}

/** Toma el texto del input y lo envía al orquestador */
function mostrarTextoPersonalizado() {
    const texto = inputTexto.value.trim().toUpperCase();
    if (texto === '') return;

    console.log(`[Usuario] Nuevo texto: ${texto}`);
    orquestador.agregarYMostrar(texto);
    inputTexto.value = '';
}

// ==========================================================
// EVENTOS DEL DOM
// ==========================================================

// Botones de navegación
btnMostrar.addEventListener('click', mostrarTextoPersonalizado);
btnSiguiente.addEventListener('click', () => orquestador.siguienteEscena());
btnAnterior.addEventListener('click', () => orquestador.escenaAnterior());

// Enter en el input
inputTexto.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        mostrarTextoPersonalizado();
    }
});

// Redimensión de ventana
// Redimensión de ventana
window.addEventListener('resize', redimensionar);

// Slider de Velocidad
const rangeVelocidad = document.getElementById('rangeVelocidad');
if (rangeVelocidad) {
    rangeVelocidad.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        // Mapear 1-10 a un rango útil de velocidad (0.01 - 0.2)
        // 5 (default) -> 0.08
        const nuevaVelocidad = 0.01 + (val * 0.02);
        orquestador.setVelocidad(nuevaVelocidad);
        console.log(`[UI] Velocidad ajustada a: ${nuevaVelocidad.toFixed(2)}`);
    });
}

// ==========================================================
// ARRANQUE
// ==========================================================

function init() {
    redimensionar();

    // Conectar cámara al canvas
    camara.registrarEventos(canvas);

    // Conectar UI al orquestador
    orquestador.conectarUI(spanEstado, spanDebug);

    // Crear drones
    orquestador.inicializar();

    // Cargar escenas iniciales de ejemplo
    setTimeout(() => {
        orquestador.agregarYMostrar('CANDELARIA');
    }, 100);

    // Arrancar el loop
    bucle();
}

init();
