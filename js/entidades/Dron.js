import {
    VELOCIDAD_INTERPOLACION,
    SNAP_DISTANCIA,
    RADIO_COLISION,
    COLORES,
    TAMANO,
    ESTADO_DRON,
} from '../configuracion/constantes.js';

export class Dron {
    static velocidadGlobal = VELOCIDAD_INTERPOLACION;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.objetivoX = x;
        this.objetivoY = y;
        this.baseX = x;
        this.baseY = y;
        this.estado = ESTADO_DRON.EN_BASE;
        this.activo = false;
        this.color = COLORES.dronesInactivos;
        this.tamano = TAMANO.dronInactivo;
        this.indice = 0;
        this.delayRestante = 0;
    }

    setBase(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.objetivoX = x;
        this.objetivoY = y;
    }

    asignarLetra(x, y, delay = 0) {
        this.objetivoX = x;
        this.objetivoY = y;
        this.activo = true;
        this.estado = ESTADO_DRON.SUBIENDO;
        this.color = COLORES.dronesActivos;
        this.tamano = TAMANO.dronActivo;
        this.delayRestante = delay;
    }

    volverABase(delay = 0) {
        this.objetivoX = this.baseX;
        this.objetivoY = this.baseY;
        this.activo = false;
        this.estado = ESTADO_DRON.CAYENDO;
        this.color = COLORES.dronesCayendo;
        this.tamano = TAMANO.dronInactivo;
        this.delayRestante = delay;
    }

    desactivar() {
        this.objetivoX = this.baseX;
        this.objetivoY = this.baseY;
        this.activo = false;
        this.estado = ESTADO_DRON.EN_BASE;
        this.color = COLORES.dronesInactivos;
        this.tamano = TAMANO.dronInactivo;
    }

    colisionaCon(otro) {
        const dx = this.x - otro.x;
        const dy = this.y - otro.y;
        return (dx * dx + dy * dy) < (RADIO_COLISION * RADIO_COLISION);
    }

    actualizar() {
        if (this.delayRestante > 0) {
            this.delayRestante--;
            return;
        }

        const dx = this.objetivoX - this.x;
        const dy = this.objetivoY - this.y;
        const velocidad = Dron.velocidadGlobal || VELOCIDAD_INTERPOLACION;

        this.x += dx * velocidad;
        this.y += dy * velocidad;

        if (Math.abs(dx) < SNAP_DISTANCIA && Math.abs(dy) < SNAP_DISTANCIA) {
            this.x = this.objetivoX;
            this.y = this.objetivoY;

            if (this.estado === ESTADO_DRON.SUBIENDO) {
                this.estado = ESTADO_DRON.EN_POSICION;
            } else if (this.estado === ESTADO_DRON.CAYENDO) {
                this.estado = ESTADO_DRON.EN_BASE;
                this.color = COLORES.dronesInactivos;
            }
        }
    }

    dibujar(ctx) {
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
