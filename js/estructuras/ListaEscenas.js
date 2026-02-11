import { Rastreador } from '../sistemas/Rastreador.js';

class NodoEscena {
    constructor(texto) {
        this.texto = texto;
        this.coordenadas = [];
        this.anterior = null;
        this.siguiente = null;
    }
}

export class ListaEscenas {
    constructor() {
        this.cabeza = null;
        this.cola = null;
        this.actual = null;
        this.tamano = 0;
    }

    agregarEscena(texto, ancho, alto, maxDrones) {
        const nuevoNodo = new NodoEscena(texto);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
            this.cola = nuevoNodo;
            this.actual = nuevoNodo;
        } else {
            nuevoNodo.anterior = this.cola;
            this.cola.siguiente = nuevoNodo;
            this.cola = nuevoNodo;
        }
        this.tamano++;
        nuevoNodo.coordenadas = Rastreador.obtenerPuntos(texto, ancho, alto, maxDrones);
        return nuevoNodo;
    }

    siguiente() {
        if (this.actual && this.actual.siguiente) this.actual = this.actual.siguiente;
        return this.actual;
    }

    anterior() {
        if (this.actual && this.actual.anterior) this.actual = this.actual.anterior;
        return this.actual;
    }

    irAlFinal() {
        this.actual = this.cola;
        return this.actual;
    }

    irAlInicio() {
        this.actual = this.cabeza;
        return this.actual;
    }
}
