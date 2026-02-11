import { Orquestador } from './sistemas/Orquestador.js';
import { Camara } from './sistemas/Camara.js';
import { COLORES } from './configuracion/constantes.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const inputTexto = document.getElementById('txtInput');
const btnMostrar = document.getElementById('btnMostrar');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnAnterior = document.getElementById('btnAnterior');
const spanEstado = document.getElementById('estado');
const spanDebug = document.getElementById('debug-info');

let ancho, alto;

const camara = new Camara();
const orquestador = new Orquestador(canvas, ctx);

function redimensionar() {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = ancho;
    canvas.height = alto;
    orquestador.redimensionar(ancho, alto);
}

function bucle() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COLORES.fondo;
    ctx.fillRect(0, 0, ancho, alto);

    camara.aplicarTransformacion(ctx);
    orquestador.paso();
    orquestador.dibujar();

    ctx.globalAlpha = 1;
    requestAnimationFrame(bucle);
}

function mostrarTextoPersonalizado() {
    const texto = inputTexto.value.trim().toUpperCase();
    if (texto === '') return;

    console.log(`[Usuario] Nuevo texto: ${texto}`);
    orquestador.agregarYMostrar(texto);
    inputTexto.value = '';
}

btnMostrar.addEventListener('click', mostrarTextoPersonalizado);
btnSiguiente.addEventListener('click', () => orquestador.siguienteEscena());
btnAnterior.addEventListener('click', () => orquestador.escenaAnterior());

inputTexto.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        mostrarTextoPersonalizado();
    }
});

window.addEventListener('resize', redimensionar);

const rangeVelocidad = document.getElementById('rangeVelocidad');
if (rangeVelocidad) {
    rangeVelocidad.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const nuevaVelocidad = 0.01 + (val * 0.02);
        orquestador.setVelocidad(nuevaVelocidad);
        console.log(`[UI] Velocidad ajustada a: ${nuevaVelocidad.toFixed(2)}`);
    });
}

function init() {
    redimensionar();
    camara.registrarEventos(canvas);
    orquestador.conectarUI(spanEstado, spanDebug);
    orquestador.inicializar();

    setTimeout(() => {
        orquestador.agregarYMostrar('CANDELARIA');
    }, 100);

    bucle();
}

init();


init();
