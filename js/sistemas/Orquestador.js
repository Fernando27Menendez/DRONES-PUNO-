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
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.estado = ESTADOS.EN_BASE;
        this.drones = [];
        this.listaEscenas = new ListaEscenas();
        this.elementoEstado = null;
        this.elementoDebug = null;
        this.ancho = canvas.width;
        this.alto = canvas.height;
        this.dronesActivos = 0;
        this.transitionTimeout = null;
    }

    conectarUI(elementoEstado, elementoDebug) {
        this.elementoEstado = elementoEstado;
        this.elementoDebug = elementoDebug;
    }

    setVelocidad(valor) {
        Dron.velocidadGlobal = valor;
    }

    inicializar() {
        this.drones = [];
        for (let i = 0; i < TOTAL_DRONES; i++) {
            const dron = new Dron(0, 0);
            dron.indice = i;
            this.drones.push(dron);
        }
        this.calcularFormacionBase();
        for (let i = 0; i < this.drones.length; i++) {
            this.drones[i].x = this.drones[i].baseX;
            this.drones[i].y = this.drones[i].baseY;
        }
    }

    calcularFormacionBase() {
        const altoBase = this.alto * ZONA_BASE_PORCENTAJE;
        const yInicio = this.alto - altoBase;
        const columnas = Math.floor(this.ancho / ESPACIADO_BASE);

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

    agregarYMostrar(texto) {
        this._iniciarTransicion(() => {
            this.listaEscenas.agregarEscena(texto, this.ancho, this.alto, TOTAL_DRONES);
            this.listaEscenas.irAlFinal();
        });
    }

    siguienteEscena() {
        this._iniciarTransicion(() => this.listaEscenas.siguiente());
    }

    escenaAnterior() {
        this._iniciarTransicion(() => this.listaEscenas.anterior());
    }

    _iniciarTransicion(callbackAccion) {
        if (this.transitionTimeout) clearTimeout(this.transitionTimeout);
        this.retirarTodos();
        this.estado = ESTADOS.TRANSICION;
        if (callbackAccion) callbackAccion();
        this.transitionTimeout = setTimeout(() => {
            this.asignarObjetivos();
            this.transitionTimeout = null;
        }, 1500);
    }

    retirarTodos() {
        for (let i = 0; i < this.drones.length; i++) {
            if (this.drones[i].activo ||
                this.drones[i].estado === ESTADO_DRON.SUBIENDO ||
                this.drones[i].estado === ESTADO_DRON.EN_POSICION) {
                const delay = Math.floor(Math.random() * 60);
                this.drones[i].volverABase(delay);
            }
        }
    }

    asignarObjetivos() {
        const escena = this.listaEscenas.actual;
        if (!escena) return;

        const puntos = escena.coordenadas;
        this.dronesActivos = puntos.length;

        if (this.elementoEstado) this.elementoEstado.innerText = escena.texto;
        if (this.elementoDebug) {
            this.elementoDebug.innerText = `Drones necesarios: ${puntos.length} / ${TOTAL_DRONES}`;
        }

        const disponibles = this.drones.filter(d => !d.activo);
        disponibles.sort((a, b) => a.x - b.x);

        const puntosOrdenados = [...puntos].sort((a, b) => {
            if (Math.abs(a.x - b.x) < 5) return a.y - b.y;
            return a.x - b.x;
        });

        const dronesPorTanda = 30;
        const delayEntreTandas = 3;
        const cantidadAAsignar = Math.min(disponibles.length, puntosOrdenados.length);

        for (let i = 0; i < cantidadAAsignar; i++) {
            const dron = disponibles[i];
            const punto = puntosOrdenados[i];
            const tanda = Math.floor(i / dronesPorTanda);
            const delay = tanda * delayEntreTandas;
            dron.asignarLetra(punto.x, punto.y, delay);
        }

        this.estado = ESTADOS.FORMANDO;
    }

    paso() {
        for (let i = 0; i < this.drones.length; i++) {
            this.drones[i].actualizar();
        }
    }

    dibujar() {
        for (let i = 0; i < this.drones.length; i++) {
            this.drones[i].dibujar(this.ctx);
        }
    }

    redimensionar(ancho, alto) {
        this.ancho = ancho;
        this.alto = alto;
    }
}
