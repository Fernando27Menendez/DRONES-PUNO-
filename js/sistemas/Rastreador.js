// ============================================================
// Rastreador.js — Rasterización de Texto a Puntos
// Convierte una cadena de texto en coordenadas destino para
// los drones usando un canvas offscreen.
// ============================================================

import { TAMANO_CELDA } from '../configuracion/constantes.js';

export class Rastreador {

    /**
     * Calcula cuántos drones se necesitan para un texto dado.
     * No muestrea, solo cuenta los píxeles visibles del texto.
     * @param {string} texto - Texto a analizar
     * @param {number} ancho - Ancho del canvas
     * @param {number} alto - Alto del canvas
     * @returns {number} Cantidad de puntos (drones necesarios)
     */
    static calcularDronesNecesarios(texto, ancho, alto) {
        const puntos = Rastreador._rasterizar(texto, ancho, alto);
        return puntos.length;
    }

    /**
     * Obtiene los puntos del texto, limitados a una cantidad máxima.
     * Si hay más puntos que drones disponibles, muestrea uniformemente.
     * @param {string} texto - Texto a rasterizar
     * @param {number} ancho - Ancho del canvas principal
     * @param {number} alto - Alto del canvas principal
     * @param {number} maxDrones - Cantidad máxima de puntos a devolver
     * @returns {{x: number, y: number}[]} Array de coordenadas
     */
    static obtenerPuntos(texto, ancho, alto, maxDrones) {
        const todosLosPuntos = Rastreador._rasterizar(texto, ancho, alto);

        if (todosLosPuntos.length === 0) return [];

        // Si caben todos los puntos, devolverlos tal cual
        if (todosLosPuntos.length <= maxDrones) {
            return todosLosPuntos;
        }

        // Si hay más puntos que drones, muestrear uniformemente
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

    /**
     * INTERNO: Rasteriza el texto en un canvas offscreen.
     * Devuelve TODOS los puntos sin muestrear.
     * @param {string} texto
     * @param {number} ancho
     * @param {number} alto
     * @returns {{x: number, y: number}[]}
     */
    static _rasterizar(texto, ancho, alto) {
        const offCanvas = document.createElement('canvas');
        const ctx = offCanvas.getContext('2d');

        offCanvas.width = ancho || 1000;
        offCanvas.height = alto || 800;

        // Desactivar suavizado para bordes duros (Pixel Art puro)
        ctx.imageSmoothingEnabled = false;

        // Tamaño de fuente ajustado a la grilla
        // Forzamos que sea múltiplo de TAMANO_CELDA para alineación perfecta
        let tamanoBase = Math.floor(offCanvas.width / 2.5);
        // Redondeamos hacia abajo al múltiplo más cercano de la celda
        let tamanoFuente = Math.floor(tamanoBase / TAMANO_CELDA) * TAMANO_CELDA;

        ctx.font = `${tamanoFuente}px "Press Start 2P"`;
        const metricas = ctx.measureText(texto);

        // Ajuste si se sale del ancho
        if (metricas.width > offCanvas.width * 0.9) {
            const escala = (offCanvas.width * 0.9) / metricas.width;
            let nuevoTamano = Math.floor(tamanoFuente * escala);
            // Asegurar que sigue siendo múltiplo del tamaño de celda
            tamanoFuente = Math.floor(nuevoTamano / TAMANO_CELDA) * TAMANO_CELDA;
            ctx.font = `${tamanoFuente}px "Press Start 2P"`;
        }

        // Dibujar texto sólido en blanco puro
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Posicionamiento exacto en el centro
        ctx.fillText(texto, offCanvas.width / 2, offCanvas.height / 2);

        // Escaneo de píxeles
        const imageData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
        const puntos = [];
        const paso = TAMANO_CELDA;

        // Recorrer la grilla
        for (let y = 0; y < offCanvas.height; y += paso) {
            for (let x = 0; x < offCanvas.width; x += paso) {

                // --- LÓGICA DE DETECCIÓN ESTRICTA ---
                // Para fuentes pixeladas perfectas, solo necesitamos mirar el CENTRO EXACTO de la celda.
                // Si la fuente y la grilla están alineadas (mismo tamaño base),
                // el pixel central determinará si la celda está llena o vacía.

                const centroX = Math.floor(x + paso / 2);
                const centroY = Math.floor(y + paso / 2);

                if (centroX < offCanvas.width && centroY < offCanvas.height) {
                    const index = (centroY * offCanvas.width + centroX) * 4;
                    // Canal Alpha (o Rojo) > 128 (50% opacidad)
                    if (imageData[index + 3] > 128) {
                        puntos.push({
                            x: x + paso / 2,
                            y: y + paso / 2
                        });
                    }
                }
            }
        }

        return puntos;
    }
}
