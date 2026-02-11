// ============================================================
// Vector2D.js — Motor Matemático Vectorial 2D
// Clase inmutable: cada operación devuelve un NUEVO vector.
// ============================================================

export class Vector2D {

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // --- Operaciones Básicas ---

    /** Suma este vector con otro y devuelve uno nuevo */
    sumar(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    /** Resta otro vector de este y devuelve uno nuevo */
    restar(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    /** Multiplica por un escalar y devuelve uno nuevo */
    multiplicar(escalar) {
        return new Vector2D(this.x * escalar, this.y * escalar);
    }

    /** Divide por un escalar y devuelve uno nuevo */
    dividir(escalar) {
        if (escalar === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / escalar, this.y / escalar);
    }

    // --- Propiedades Geométricas ---

    /** Longitud (magnitud) del vector */
    magnitud() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /** Magnitud al cuadrado (más eficiente, evita sqrt) */
    magnitudCuadrada() {
        return this.x * this.x + this.y * this.y;
    }

    /** Devuelve el vector unitario (dirección pura, magnitud = 1) */
    normalizar() {
        const mag = this.magnitud();
        if (mag === 0) return new Vector2D(0, 0);
        return this.dividir(mag);
    }

    /** Trunca la magnitud a un valor máximo */
    limitar(max) {
        const magCuadrada = this.magnitudCuadrada();
        if (magCuadrada > max * max) {
            return this.normalizar().multiplicar(max);
        }
        return new Vector2D(this.x, this.y);
    }

    // --- Relaciones entre Vectores ---

    /** Distancia euclidiana hacia otro vector/punto */
    distanciaA(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Distancia al cuadrado (evita sqrt, para comparaciones) */
    distanciaCuadradaA(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    // --- Mutación In-Place (para rendimiento en el loop principal) ---

    /** Suma directamente sobre este vector (no crea uno nuevo) */
    sumarMutando(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /** Multiplica directamente sobre este vector */
    multiplicarMutando(escalar) {
        this.x *= escalar;
        this.y *= escalar;
        return this;
    }

    /** Pone ambos componentes en cero */
    reiniciar() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    /** Copia los valores de otro vector */
    copiarDe(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    // --- Fábricas Estáticas ---

    /** Crea un vector con componentes aleatorias en un rango */
    static aleatorio(min, max) {
        return new Vector2D(
            min + Math.random() * (max - min),
            min + Math.random() * (max - min)
        );
    }

    /** Crea una copia independiente de un vector */
    static clonar(v) {
        return new Vector2D(v.x, v.y);
    }
}
