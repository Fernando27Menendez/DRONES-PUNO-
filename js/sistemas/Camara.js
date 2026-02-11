// ============================================================
// Camara.js — Sistema de Cámara (Zoom y Pan)
// Encapsula todas las transformaciones visuales del canvas.
// ============================================================

export class Camara {

    constructor() {
        this.zoom = 1;              // Nivel de zoom (1 = normal)
        this.posicionX = 0;         // Desplazamiento horizontal
        this.posicionY = 0;         // Desplazamiento vertical
        this.arrastrando = false;   // ¿Está arrastrando?
        this.inicioX = 0;           // Punto de inicio del arrastre
        this.inicioY = 0;

        // Límites de zoom
        this.zoomMinimo = 0.3;
        this.zoomMaximo = 10;
    }

    /**
     * Aplica la transformación de la cámara al contexto del canvas.
     * Debe llamarse DESPUÉS de limpiar el canvas y ANTES de dibujar.
     * @param {CanvasRenderingContext2D} ctx
     */
    aplicarTransformacion(ctx) {
        ctx.translate(this.posicionX, this.posicionY);
        ctx.scale(this.zoom, this.zoom);
    }

    /**
     * Registra todos los eventos de mouse sobre el canvas.
     * @param {HTMLCanvasElement} canvas
     */
    registrarEventos(canvas) {
        // --- Zoom con rueda del mouse ---
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const intensidad = 0.1;
            const direccion = e.deltaY < 0 ? 1 : -1;
            const factor = Math.exp(direccion * intensidad);
            const nuevoZoom = this.zoom * factor;

            // Verificar límites
            if (nuevoZoom < this.zoomMinimo || nuevoZoom > this.zoomMaximo) return;

            // Zoom hacia la posición del cursor
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.posicionX -= (mouseX - this.posicionX) * (factor - 1);
            this.posicionY -= (mouseY - this.posicionY) * (factor - 1);

            this.zoom = nuevoZoom;
        });

        // --- Arrastrar (Pan) ---
        canvas.addEventListener('mousedown', (e) => {
            this.arrastrando = true;
            this.inicioX = e.clientX - this.posicionX;
            this.inicioY = e.clientY - this.posicionY;
            canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.arrastrando) return;
            e.preventDefault();
            this.posicionX = e.clientX - this.inicioX;
            this.posicionY = e.clientY - this.inicioY;
        });

        canvas.addEventListener('mouseup', () => {
            this.arrastrando = false;
            canvas.style.cursor = 'default';
        });

        canvas.addEventListener('mouseleave', () => {
            this.arrastrando = false;
        });
    }
}
