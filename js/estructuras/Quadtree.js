import { CAPACIDAD_QUADTREE } from '../configuracion/constantes.js';

export class Rectangulo {
    constructor(x, y, ancho, alto) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
    }

    contiene(punto) {
        return (
            punto.x >= this.x - this.ancho &&
            punto.x < this.x + this.ancho &&
            punto.y >= this.y - this.alto &&
            punto.y < this.y + this.alto
        );
    }

    intersecta(rango) {
        return !(
            rango.x - rango.ancho > this.x + this.ancho ||
            rango.x + rango.ancho < this.x - this.ancho ||
            rango.y - rango.alto > this.y + this.alto ||
            rango.y + rango.alto < this.y - this.alto
        );
    }
}

export class Quadtree {
    constructor(limite, capacidad = CAPACIDAD_QUADTREE) {
        this.limite = limite;
        this.capacidad = capacidad;
        this.puntos = [];
        this.dividido = false;
        this.noroeste = null;
        this.noreste = null;
        this.suroeste = null;
        this.sureste = null;
    }

    subdividir() {
        const { x, y, ancho, alto } = this.limite;
        const mitadAncho = ancho / 2;
        const mitadAlto = alto / 2;
        this.noroeste = new Quadtree(new Rectangulo(x - mitadAncho, y - mitadAlto, mitadAncho, mitadAlto), this.capacidad);
        this.noreste = new Quadtree(new Rectangulo(x + mitadAncho, y - mitadAlto, mitadAncho, mitadAlto), this.capacidad);
        this.suroeste = new Quadtree(new Rectangulo(x - mitadAncho, y + mitadAlto, mitadAncho, mitadAlto), this.capacidad);
        this.sureste = new Quadtree(new Rectangulo(x + mitadAncho, y + mitadAlto, mitadAncho, mitadAlto), this.capacidad);
        this.dividido = true;
    }

    insertar(dron) {
        if (!this.limite.contiene(dron)) return false;
        if (this.puntos.length < this.capacidad) {
            this.puntos.push(dron);
            return true;
        }
        if (!this.dividido) this.subdividir();
        return this.noroeste.insertar(dron) || this.noreste.insertar(dron) ||
            this.suroeste.insertar(dron) || this.sureste.insertar(dron);
    }

    consultar(rango, encontrados = []) {
        if (!this.limite.intersecta(rango)) return encontrados;
        for (let p of this.puntos) {
            if (rango.contiene(p)) encontrados.push(p);
        }
        if (this.dividido) {
            this.noroeste.consultar(rango, encontrados);
            this.noreste.consultar(rango, encontrados);
            this.suroeste.consultar(rango, encontrados);
            this.sureste.consultar(rango, encontrados);
        }
        return encontrados;
    }
}
