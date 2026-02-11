// ============================================================
// Orquestador.js — Máquina de Estados Central
// Coordina drones, colisiones, formación base y despliegue.
// ============================================================

import { Dron } from '../entidades/Dron.js';
import { Quadtree, Rectangulo } from '../estructuras/Quadtree.js';
import { ListaEscenas } from '../estructuras/ListaEscenas.js';
import {
    TOTAL_DRONES,
    RADIO_COLISION,
    RADIO_PROXIMIDAD,
    ESTADOS,
    ESTADO_DRON,
    ZONA_BASE_PORCENTAJE,
    ESPACIADO_BASE,
} from '../configuracion/constantes.js';

export class Orquestador {

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Estado global del sistema
        this.estado = ESTADOS.EN_BASE;

        // Pool de drones
        this.drones = [];

        // Línea de tiempo de escenas
        this.listaEscenas = new ListaEscenas();

        // Referencia a elementos UI
        this.elementoEstado = null;
        this.elementoDebug = null;

        // Dimensiones
        this.ancho = canvas.width;
        this.alto = canvas.height;

        // Drones actualmente en uso (formando letras)
        this.dronesActivos = 0;

        // Timeout para transiciones
        this.transitionTimeout = null;
    }

    /**
     * Conecta elementos del DOM para mostrar información.
     */
    conectarUI(elementoEstado, elementoDebug) {
        this.elementoEstado = elementoEstado;
        this.elementoDebug = elementoDebug;
    }

    /**
     * Ajusta la velocidad de movimiento de todos los drones.
     */
    setVelocidad(valor) {
        Dron.velocidadGlobal = valor;
    }

    // ==========================================================
    // INICIALIZACIÓN Y FORMACIÓN BASE
    // ==========================================================

    /** Crea todos los drones y los posiciona en la base */
    inicializar() {
        this.drones = [];

        for (let i = 0; i < TOTAL_DRONES; i++) {
            const dron = new Dron(0, 0);
            dron.indice = i;
            this.drones.push(dron);
        }

        // Calcular y asignar posiciones base
        this.calcularFormacionBase();

        // Posicionar todos los drones en su base inmediatamente
        for (let i = 0; i < this.drones.length; i++) {
            this.drones[i].x = this.drones[i].baseX;
            this.drones[i].y = this.drones[i].baseY;
        }

        console.log(`[Orquestador] ${TOTAL_DRONES} drones en formación base.`);
    }

    /**
     * Calcula la formación de parqueo en la zona inferior.
     * Grid ordenado en el 15% inferior del canvas.
     */
    calcularFormacionBase() {
        const altoBase = this.alto * ZONA_BASE_PORCENTAJE;
        const yInicio = this.alto - altoBase;

        // Calcular cuántas columnas y filas caben
        const columnas = Math.floor(this.ancho / ESPACIADO_BASE);
        const filas = Math.ceil(TOTAL_DRONES / columnas);

        for (let i = 0; i < this.drones.length; i++) {
            const col = i % columnas;
            const fila = Math.floor(i / columnas);

            const x = (col + 0.5) * ESPACIADO_BASE;
            const y = yInicio + (fila + 0.5) * ESPACIADO_BASE;

            this.drones[i].setBase(x, y);
            this.drones[i].desactivar();
        }

        this.estado = ESTADOS.EN_BASE;
    }

    // ==========================================================
    // GESTIÓN DE ESCENAS
    // ==========================================================

    /**
     * Agrega un texto como nueva escena y activa la formación.
     * Solo usa los drones necesarios.
     */
    agregarYMostrar(texto) {
        this._iniciarTransicion(() => {
            // Calcular cuántos drones necesita este texto
            const puntos = this.listaEscenas.agregarEscena(
                texto, this.ancho, this.alto, TOTAL_DRONES
            );
            this.listaEscenas.irAlFinal();
        });
    }

    /** Avanza a la siguiente escena */
    siguienteEscena() {
        this._iniciarTransicion(() => {
            this.listaEscenas.siguiente();
        });
    }

    /** Retrocede a la escena anterior */
    escenaAnterior() {
        this._iniciarTransicion(() => {
            this.listaEscenas.anterior();
        });
    }

    /**
     * Maneja la transición suave: Retirar -> Esperar -> Asignar
     * @param {Function} callbackAccion - Acción a ejecutar antes de asignar (ej: cambiar escena)
     */
    _iniciarTransicion(callbackAccion) {
        // Cancelar transición anterior si existe
        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
        }

        // 1. Mandar todos a base
        this.retirarTodos();
        this.estado = ESTADOS.TRANSICION;

        // Ejecutar la acción lógica (cambiar índice de escena, etc)
        if (callbackAccion) callbackAccion();

        // 2. Esperar a que bajen (1.5 segundos aprox)
        this.transitionTimeout = setTimeout(() => {
            this.asignarObjetivos();
            this.transitionTimeout = null;
        }, 1500);
    }

    /** Envía todos los drones activos de vuelta a la base */
    retirarTodos() {
        for (let i = 0; i < this.drones.length; i++) {
            if (this.drones[i].activo ||
                this.drones[i].estado === ESTADO_DRON.SUBIENDO ||
                this.drones[i].estado === ESTADO_DRON.EN_POSICION) {

                // Delay aleatorio para evitar que bajen todos a la vez (efecto lluvia)
                const delay = Math.floor(Math.random() * 60);
                this.drones[i].volverABase(delay);
            }
        }
    }

    /**
     * Asigna puntos de la escena actual a los drones.
     * Solo activa los drones necesarios con despliegue ordenado.
     */
    /**
     * Asigna puntos de la escena actual a los drones.
     * Solo activa los drones necesarios con despliegue ordenado y optimizado.
     */
    asignarObjetivos() {
        const escena = this.listaEscenas.actual;
        if (!escena) return;

        const puntos = escena.coordenadas;
        this.dronesActivos = puntos.length;

        // Actualizar UI
        if (this.elementoEstado) {
            this.elementoEstado.innerText = escena.texto;
        }
        if (this.elementoDebug) {
            this.elementoDebug.innerText =
                `Drones necesarios: ${puntos.length} / ${TOTAL_DRONES}`;
        }

        // --- ASIGNACIÓN ORDENADA (MINIMIZAR CRUCES) ---

        // 1. Obtener drones disponibles (en base)
        const disponibles = this.drones.filter(d => !d.activo);

        // 2. Ordenar drones disponibles por su posición X en la base
        // Esto asegura que los drones de la izquierda vayan a la izquierda
        disponibles.sort((a, b) => a.x - b.x);

        // 3. Ordenar puntos objetivo por X (Izquierda -> Derecha), luego Y
        // Esto hace que el texto se "escriba" de izquierda a derecha de forma limpia
        const puntosOrdenados = [...puntos].sort((a, b) => {
            if (Math.abs(a.x - b.x) < 5) return a.y - b.y; // Si misma columna, arriba->abajo
            return a.x - b.x;
        });

        const dronesPorTanda = 30; // Ajustado para flujo continuo
        const delayEntreTandas = 3;

        // 4. Asignación directa 1 a 1 (ya están ordenados espacialmente)
        // Esto minimiza dramáticamente el cruce de líneas
        const cantidadAAsignar = Math.min(disponibles.length, puntosOrdenados.length);

        for (let i = 0; i < cantidadAAsignar; i++) {
            const dron = disponibles[i];
            const punto = puntosOrdenados[i];

            // Tanda basada en el orden de izquierda a derecha
            const tanda = Math.floor(i / dronesPorTanda);
            const delay = tanda * delayEntreTandas;

            dron.asignarLetra(punto.x, punto.y, delay);
        }

        // Los drones sobrantes permanecen en la base
        this.estado = ESTADOS.FORMANDO;

        console.log(
            `[Orquestador] Desplegando ${cantidadAAsignar} drones (Asignación Ordenada)`
        );
    }

    // ==========================================================
    // PIPELINE DE RENDERIZADO (cada frame)
    // ==========================================================

    /**
     * Ejecuta un paso completo del pipeline:
     * 1. Construir Quadtree
     * 2. Detectar colisiones → marcar caída
     * 3. Actualizar posiciones (interpolación)
     */
    paso() {
        // 1. Construir Quadtree solo con drones activos/en movimiento
        // (Desactivado junto con las colisiones)
        /*
        const limiteRaiz = new Rectangulo(
            this.ancho / 2,
            this.alto / 2,
            this.ancho / 2,
            this.alto / 2
        );
        const quadtree = new Quadtree(limiteRaiz);

        for (let i = 0; i < this.drones.length; i++) {
            const dron = this.drones[i];
            // Solo insertar drones que están subiendo o en posición
            if (dron.estado === ESTADO_DRON.SUBIENDO ||
                dron.estado === ESTADO_DRON.EN_POSICION) {
                quadtree.insertar(dron);
            }
        }
        */

        // 2. Detectar colisiones entre drones activos
        // --- DESACTIVADO PARA MOVIMIENTO TIPO GRID / PIXEL ART ---
        // Al usar una grilla, los destinos ya están separados.
        // Permitimos que se crucen en el trayecto sin caer.
        /*
        for (let i = 0; i < this.drones.length; i++) {
            const dron = this.drones[i];

            // Solo verificar colisión en drones que se están moviendo
            if (dron.estado !== ESTADO_DRON.SUBIENDO) continue;

            const rangoConsulta = new Rectangulo(
                dron.x,
                dron.y,
                RADIO_PROXIMIDAD,
                RADIO_PROXIMIDAD
            );

            const vecinos = quadtree.consultar(rangoConsulta);

            for (let j = 0; j < vecinos.length; j++) {
                const otro = vecinos[j];
                if (otro === dron) continue;

                if (dron.colisionaCon(otro)) {
                    // El dron con mayor índice cae (menor prioridad)
                    if (dron.indice > otro.indice) {
                        dron.volverABase();
                    } else {
                        otro.volverABase();
                    }
                    break; // Solo procesar una colisión por frame
                }
            }
        }
        */

        // 3. Actualizar posiciones de TODOS los drones
        for (let i = 0; i < this.drones.length; i++) {
            this.drones[i].actualizar();
        }
    }

    /** Dibuja todos los drones */
    dibujar() {
        for (let i = 0; i < this.drones.length; i++) {
            this.drones[i].dibujar(this.ctx);
        }
    }

    /** Actualiza las dimensiones cuando la ventana cambia */
    redimensionar(ancho, alto) {
        this.ancho = ancho;
        this.alto = alto;
    }
}
