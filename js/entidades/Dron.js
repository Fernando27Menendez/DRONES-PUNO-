// ============================================================
// Dron.js — Agente con Movimiento por Interpolación
// Movimiento simple (ease-out) con detección de colisión.
// Si colisiona, cae a su posición base.
// ============================================================

import {
    VELOCIDAD_INTERPOLACION,
    SNAP_DISTANCIA,
    RADIO_COLISION,
    COLORES,
    TAMANO,
    ESTADO_DRON,
} from '../configuracion/constantes.js';

export class Dron {

    // Velocidad global mutable para todos los drones
    static velocidadGlobal = VELOCIDAD_INTERPOLACION;

    constructor(x, y) {
        // Posición actual
        this.x = x;
        this.y = y;

        // Objetivo actual (donde quiere ir)
        this.objetivoX = x;
        this.objetivoY = y;

        // Posición "home" en la base (se asigna una vez)
        this.baseX = x;
        this.baseY = y;

        // Estado individual del dron
        this.estado = ESTADO_DRON.EN_BASE;

        // Visual
        this.activo = false;
        this.color = COLORES.dronesInactivos;
        this.tamano = TAMANO.dronInactivo;

        // Índice en el pool (se asigna al crear)
        this.indice = 0;

        // Delay para despliegue ordenado (en frames)
        this.delayRestante = 0;
    }

    // ==========================================================
    // ASIGNACIÓN DE OBJETIVOS
    // ==========================================================

    /**
     * Asigna la posición base (parqueo) permanente.
     * @param {number} x
     * @param {number} y
     */
    setBase(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.objetivoX = x;
        this.objetivoY = y;
    }

    /**
     * Ordena al dron subir a formar parte de una letra.
     * @param {number} x - Destino X
     * @param {number} y - Destino Y
     * @param {number} delay - Frames de espera antes de subir
     */
    asignarLetra(x, y, delay = 0) {
        this.objetivoX = x;
        this.objetivoY = y;
        this.activo = true;
        this.estado = ESTADO_DRON.SUBIENDO;
        this.color = COLORES.dronesActivos;
        this.tamano = TAMANO.dronActivo;
        this.delayRestante = delay;
    }

    /** Ordena al dron volver a su posición base */
    volverABase(delay = 0) {
        this.objetivoX = this.baseX;
        this.objetivoY = this.baseY;
        this.activo = false;
        this.estado = ESTADO_DRON.CAYENDO;
        this.color = COLORES.dronesCayendo;
        this.tamano = TAMANO.dronInactivo;
        this.delayRestante = delay;
    }

    /** Desactiva el dron y lo deja en la base sin animación de caída */
    desactivar() {
        this.objetivoX = this.baseX;
        this.objetivoY = this.baseY;
        this.activo = false;
        this.estado = ESTADO_DRON.EN_BASE;
        this.color = COLORES.dronesInactivos;
        this.tamano = TAMANO.dronInactivo;
    }

    // ==========================================================
    // COLISIÓN
    // ==========================================================

    /**
     * Detecta si este dron colisiona con otro.
     * @param {Dron} otro
     * @returns {boolean}
     */
    colisionaCon(otro) {
        const dx = this.x - otro.x;
        const dy = this.y - otro.y;
        return (dx * dx + dy * dy) < (RADIO_COLISION * RADIO_COLISION);
    }

    // ==========================================================
    // ACTUALIZACIÓN POR FRAME
    // ==========================================================

    /** Actualiza la posición por interpolación (ease-out) */
    actualizar() {
        // Si tiene delay, esperar
        if (this.delayRestante > 0) {
            this.delayRestante--;
            return;
        }

        // Interpolación: acercarse un % al destino cada frame
        const dx = this.objetivoX - this.x;
        const dy = this.objetivoY - this.y;

        // Usar la velocidad global ajustada por slider
        const velocidad = Dron.velocidadGlobal || VELOCIDAD_INTERPOLACION;

        this.x += dx * velocidad;
        this.y += dy * velocidad;

        // Snap: si está muy cerca, forzar posición exacta
        if (Math.abs(dx) < SNAP_DISTANCIA && Math.abs(dy) < SNAP_DISTANCIA) {
            this.x = this.objetivoX;
            this.y = this.objetivoY;

            // Actualizar estado al llegar
            if (this.estado === ESTADO_DRON.SUBIENDO) {
                this.estado = ESTADO_DRON.EN_POSICION;
            } else if (this.estado === ESTADO_DRON.CAYENDO) {
                this.estado = ESTADO_DRON.EN_BASE;
                this.color = COLORES.dronesInactivos;
            }
        }
    }

    /** Dibuja el dron en el canvas */
    dibujar(ctx) {
        // Opacidad según estado
        if (this.estado === ESTADO_DRON.EN_BASE) {
            ctx.globalAlpha = 0.35;
        } else if (this.estado === ESTADO_DRON.CAYENDO) {
            ctx.globalAlpha = 0.6;
        } else {
            ctx.globalAlpha = 1.0;
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.tamano, 0, Math.PI * 2);
        ctx.fill();
    }
}
