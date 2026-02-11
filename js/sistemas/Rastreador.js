import { TAMANO_CELDA } from '../configuracion/constantes.js';

export class Rastreador {
    static calcularDronesNecesarios(texto, ancho, alto) {
        const puntos = Rastreador._rasterizar(texto, ancho, alto);
        return puntos.length;
    }

    static obtenerPuntos(texto, ancho, alto, maxDrones) {
        const todosLosPuntos = Rastreador._rasterizar(texto, ancho, alto);
        if (todosLosPuntos.length === 0) return [];

        if (todosLosPuntos.length <= maxDrones) return todosLosPuntos;

        const puntosFinales = [];
        const paso = todosLosPuntos.length / maxDrones;
        for (let i = 0; i < maxDrones; i++) {
            const indice = Math.floor(i * paso);
            if (indice < todosLosPuntos.length) {
                puntosFinales.push(todosLosPuntos[indice]);
            }
        }
        return puntosFinales;
    }

    static _rasterizar(texto, ancho, alto) {
        const offCanvas = document.createElement('canvas');
        const ctx = offCanvas.getContext('2d');
        offCanvas.width = ancho || 1000;
        offCanvas.height = alto || 800;
        ctx.imageSmoothingEnabled = false;

        let tamanoBase = Math.floor(offCanvas.width / 2.5);
        let tamanoFuente = Math.floor(tamanoBase / TAMANO_CELDA) * TAMANO_CELDA;
        ctx.font = `${tamanoFuente}px "Press Start 2P"`;

        const metricas = ctx.measureText(texto);
        if (metricas.width > offCanvas.width * 0.9) {
            const escala = (offCanvas.width * 0.9) / metricas.width;
            let nuevoTamano = Math.floor(tamanoFuente * escala);
            tamanoFuente = Math.floor(nuevoTamano / TAMANO_CELDA) * TAMANO_CELDA;
            ctx.font = `${tamanoFuente}px "Press Start 2P"`;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, offCanvas.width / 2, offCanvas.height / 2);

        const imageData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
        const puntos = [];
        const paso = TAMANO_CELDA;

        for (let y = 0; y < offCanvas.height; y += paso) {
            for (let x = 0; x < offCanvas.width; x += paso) {
                const centroX = Math.floor(x + paso / 2);
                const centroY = Math.floor(y + paso / 2);

                if (centroX < offCanvas.width && centroY < offCanvas.height) {
                    const index = (centroY * offCanvas.width + centroX) * 4;
                    if (imageData[index + 3] > 128) {
                        puntos.push({ x: x + paso / 2, y: y + paso / 2 });
                    }
                }
            }
        }
        return puntos;
    }
}
