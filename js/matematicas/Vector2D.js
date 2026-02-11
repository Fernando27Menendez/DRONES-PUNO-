export class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    sumar(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    restar(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    multiplicar(escalar) {
        return new Vector2D(this.x * escalar, this.y * escalar);
    }

    dividir(escalar) {
        if (escalar === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / escalar, this.y / escalar);
    }

    magnitud() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magnitudCuadrada() {
        return this.x * this.x + this.y * this.y;
    }

    normalizar() {
        const mag = this.magnitud();
        if (mag === 0) return new Vector2D(0, 0);
        return this.dividir(mag);
    }

    limitar(max) {
        const magCuadrada = this.magnitudCuadrada();
        if (magCuadrada > max * max) {
            return this.normalizar().multiplicar(max);
        }
        return new Vector2D(this.x, this.y);
    }

    distanciaA(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    distanciaCuadradaA(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    sumarMutando(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    multiplicarMutando(escalar) {
        this.x *= escalar;
        this.y *= escalar;
        return this;
    }

    reiniciar() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    copiarDe(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    static aleatorio(min, max) {
        return new Vector2D(
            min + Math.random() * (max - min),
            min + Math.random() * (max - min)
        );
    }

    static clonar(v) {
        return new Vector2D(v.x, v.y);
    }
}
