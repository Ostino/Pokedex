import { IV_MAX, EV_MAX_STAT, EV_MAX_TOTAL } from './limitesIvsEvs.js';

// Entero aleatorio entre min y max, ambos incluidos.
export const enteroAleatorio = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// Un elemento al azar de la lista, o null si está vacía.
export const elegirAlAzar = (lista) => (lista.length ? lista[enteroAleatorio(0, lista.length - 1)] : null);

// Hasta `cantidad` elementos distintos de la lista, en orden aleatorio (Fisher-Yates).
export function elegirVariosDistintos(lista, cantidad) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = enteroAleatorio(0, i);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad);
}

// Cada IV entre 0 y 31.
export function ivsAleatorios(stats) {
  return Object.fromEntries(stats.map((stat) => [stat, enteroAleatorio(0, IV_MAX)]));
}

// Reparte exactamente 510 EVs sin pasar de 252 en ningún stat. Se asignan en bloques de
// tamaño aleatorio a stats al azar, así salen repartos variados (y no todos parecidos a 85).
export function evsAleatorios(stats) {
  const evs = Object.fromEntries(stats.map((stat) => [stat, 0]));
  let restantes = Math.min(EV_MAX_TOTAL, stats.length * EV_MAX_STAT);

  while (restantes > 0) {
    const conHueco = stats.filter((stat) => evs[stat] < EV_MAX_STAT);
    const stat = elegirAlAzar(conHueco);
    const bloque = Math.min(restantes, EV_MAX_STAT - evs[stat], enteroAleatorio(1, EV_MAX_STAT));
    evs[stat] += bloque;
    restantes -= bloque;
  }
  return evs;
}
