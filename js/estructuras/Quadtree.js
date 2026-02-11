// ============================================================
// Quadtree.js — Partición Espacial para Colisiones
// Reduce la detección de vecinos de O(n²) a O(n log n).
// Se reconstruye cada frame.
// ============================================================

import { CAPACIDAD_QUADTREE } from '../configuracion/constantes.js';

// --- Clase Auxiliar: Rectángulo (Límite) ---

export class Rectangulo {

    /**
     * @param {number} x - Centro X
     * @param {number} y - Centro Y
     * @param {number} ancho - Mitad del ancho (semi-ancho)
     * @param {number} alto - Mitad del alto (semi-alto)
     */
    constructor(x, y, ancho, alto) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
    }

    /** ¿Un punto está dentro de este rectángulo? */
    contiene(punto) {
        return (
            punto.x >= this.x - this.ancho &&
            punto.x < this.x + this.ancho &&
            punto.y >= this.y - this.alto &&
            punto.y < this.y + this.alto
        );
    }

    /** ¿Este rectángulo se intersecta con otro? */
    intersecta(rango) {
        return !(
            rango.x - rango.ancho > this.x + this.ancho ||
            rango.x + rango.ancho < this.x - this.ancho ||
            rango.y - rango.alto > this.y + this.alto ||
            rango.y + rango.alto < this.y - this.alto
        );
    }
}

// --- Clase Principal: Quadtree ---

export class Quadtree {

    /**
     * @param {Rectangulo} limite - El área que cubre este nodo
     * @param {number} capacidad - Máx. elementos antes de subdividir
     */
    constructor(limite, capacidad = CAPACIDAD_QUADTREE) {
        this.limite = limite;
        this.capacidad = capacidad;
        this.puntos = [];       // Drones almacenados en este nodo
        this.dividido = false;  // ¿Ya se subdividió?

        // Hijos (se crean solo al subdividir)
        this.noroeste = null;
        this.noreste = null;
        this.suroeste = null;
        this.sureste = null;
    }

    /** Subdivide este nodo en 4 cuadrantes */
    subdividir() {
        const { x, y, ancho, alto } = this.limite;
        const mitadAncho = ancho / 2;
        const mitadAlto = alto / 2;

        this.noroeste = new Quadtree(
            new Rectangulo(x - mitadAncho, y - mitadAlto, mitadAncho, mitadAlto),
            this.capacidad
        );
        this.noreste = new Quadtree(
            new Rectangulo(x + mitadAncho, y - mitadAlto, mitadAncho, mitadAlto),
            this.capacidad
        );
        this.suroeste = new Quadtree(
            new Rectangulo(x - mitadAncho, y + mitadAlto, mitadAncho, mitadAlto),
            this.capacidad
        );
        this.sureste = new Quadtree(
            new Rectangulo(x + mitadAncho, y + mitadAlto, mitadAncho, mitadAlto),
            this.capacidad
        );

        this.dividido = true;
    }

    /**
     * Inserta un dron en el quadtree.
     * @param {Dron} dron - El dron a insertar (necesita .x/.y)
     * @returns {boolean} true si se insertó correctamente
     */
    insertar(dron) {
        // Si el dron no está dentro de este nodo, rechazarlo
        if (!this.limite.contiene(dron)) {
            return false;
        }

        // Si hay espacio en este nodo, agregarlo aquí
        if (this.puntos.length < this.capacidad) {
            this.puntos.push(dron);
            return true;
        }

        // Si no hay espacio, subdividir (si no lo hemos hecho)
        if (!this.dividido) {
            this.subdividir();
        }

        // Intentar insertar en alguno de los 4 hijos
        if (this.noroeste.insertar(dron)) return true;
        if (this.noreste.insertar(dron)) return true;
        if (this.suroeste.insertar(dron)) return true;
        if (this.sureste.insertar(dron)) return true;

        return false; // No debería llegar aquí
    }

    /**
     * Consulta todos los drones dentro de un rango rectangular.
     * @param {Rectangulo} rango - Área de búsqueda
     * @param {Dron[]} encontrados - Array donde se acumulan resultados
     * @returns {Dron[]} Array con los drones encontrados
     */
    consultar(rango, encontrados = []) {
        // Si este nodo no intersecta con el rango, salir rápido
        if (!this.limite.intersecta(rango)) {
            return encontrados;
        }

        // Revisar los drones de este nodo
        for (let i = 0; i < this.puntos.length; i++) {
            if (rango.contiene(this.puntos[i])) {
                encontrados.push(this.puntos[i]);
            }
        }

        // Si está subdividido, consultar a los hijos también
        if (this.dividido) {
            this.noroeste.consultar(rango, encontrados);
            this.noreste.consultar(rango, encontrados);
            this.suroeste.consultar(rango, encontrados);
            this.sureste.consultar(rango, encontrados);
        }

        return encontrados;
    }
}
