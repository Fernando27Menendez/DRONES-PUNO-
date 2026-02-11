// ============================================================
// ListaEscenas.js — Lista Doblemente Enlazada de Escenas
// Gestiona la línea de tiempo del show de drones.
// ============================================================

import { Rastreador } from '../sistemas/Rastreador.js';

// --- Nodo de la Lista ---

class NodoEscena {
    constructor(texto) {
        this.texto = texto;
        this.coordenadas = [];    // Puntos destino calculados
        this.anterior = null;     // Puntero al nodo previo
        this.siguiente = null;    // Puntero al nodo siguiente
    }
}

// --- Lista Doblemente Enlazada ---

export class ListaEscenas {

    constructor() {
        this.cabeza = null;   // Primer nodo
        this.cola = null;     // Último nodo
        this.actual = null;   // Nodo activo en reproducción
        this.tamano = 0;      // Cantidad de escenas
    }

    /**
     * Agrega una nueva escena al final de la lista.
     * Calcula automáticamente las coordenadas del texto.
     * @param {string} texto - Texto de la escena
     * @param {number} ancho - Ancho del canvas
     * @param {number} alto - Alto del canvas
     * @param {number} maxDrones - Drones disponibles
     */
    agregarEscena(texto, ancho, alto, maxDrones) {
        const nuevoNodo = new NodoEscena(texto);

        if (!this.cabeza) {
            // Lista vacía: nuevo nodo es cabeza, cola y actual
            this.cabeza = nuevoNodo;
            this.cola = nuevoNodo;
            this.actual = nuevoNodo;
        } else {
            // Enlazar al final
            nuevoNodo.anterior = this.cola;
            this.cola.siguiente = nuevoNodo;
            this.cola = nuevoNodo;
        }

        this.tamano++;

        // Calcular los puntos del texto usando el Rastreador
        console.log(`[ListaEscenas] Calculando "${texto}" con ${maxDrones} drones`);
        nuevoNodo.coordenadas = Rastreador.obtenerPuntos(texto, ancho, alto, maxDrones);

        return nuevoNodo;
    }

    /** Avanza al siguiente nodo. Devuelve el nodo actual. */
    siguiente() {
        if (this.actual && this.actual.siguiente) {
            this.actual = this.actual.siguiente;
        }
        return this.actual;
    }

    /** Retrocede al nodo anterior. Devuelve el nodo actual. */
    anterior() {
        if (this.actual && this.actual.anterior) {
            this.actual = this.actual.anterior;
        }
        return this.actual;
    }

    /** Salta al último nodo (cola). */
    irAlFinal() {
        this.actual = this.cola;
        return this.actual;
    }

    /** Salta al primer nodo (cabeza). */
    irAlInicio() {
        this.actual = this.cabeza;
        return this.actual;
    }
}
