export class Camara {
    constructor() {
        this.zoom = 1;
        this.posicionX = 0;
        this.posicionY = 0;
        this.arrastrando = false;
        this.inicioX = 0;
        this.inicioY = 0;
        this.zoomMinimo = 0.3;
        this.zoomMaximo = 10;
    }

    aplicarTransformacion(ctx) {
        ctx.translate(this.posicionX, this.posicionY);
        ctx.scale(this.zoom, this.zoom);
    }

    registrarEventos(canvas) {
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const intensidad = 0.1;
            const direccion = e.deltaY < 0 ? 1 : -1;
            const factor = Math.exp(direccion * intensidad);
            const nuevoZoom = this.zoom * factor;

            if (nuevoZoom < this.zoomMinimo || nuevoZoom > this.zoomMaximo) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.posicionX -= (mouseX - this.posicionX) * (factor - 1);
            this.posicionY -= (mouseY - this.posicionY) * (factor - 1);
            this.zoom = nuevoZoom;
        });

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

