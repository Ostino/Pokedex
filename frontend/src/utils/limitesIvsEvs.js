// Límites de los juegos: cada IV va de 0 a 31; cada EV de 0 a 252 y entre todos no pueden pasar de 510.
export const IV_MAX = 31;
export const EV_MAX_STAT = 252;
export const EV_MAX_TOTAL = 510;

// Lo que se escribe en un input numérico. Una casilla vacía se guarda como '' para poder
// borrar y volver a escribir; nunca como NaN.
export const leerNumero = (texto) => (texto === '' ? '' : Number(texto));

// Valor usable en cálculos: lo que no sea un número cuenta como 0.
export const comoNumero = (valor) => (Number.isFinite(valor) ? valor : 0);

function errorDeValor(valor, max, sigla) {
  if (valor === '' || !Number.isFinite(valor)) return `Escribe un ${sigla} entre 0 y ${max}`;
  if (!Number.isInteger(valor)) return 'Usa un número entero';
  if (valor < 0) return 'No puede ser negativo';
  if (valor > max) return `Máximo ${max}: te pasaste por ${valor - max}`;
  return null;
}

// Revisa IVs y EVs y devuelve todo lo que necesita la pantalla para avisar al usuario.
export function revisarIvsEvs(ivs, evs, nombreStat = (s) => s) {
  const erroresIv = {};
  for (const stat of Object.keys(ivs)) erroresIv[stat] = errorDeValor(ivs[stat], IV_MAX, 'IV');

  const erroresEv = {};
  for (const stat of Object.keys(evs)) erroresEv[stat] = errorDeValor(evs[stat], EV_MAX_STAT, 'EV');

  const totalEvs = Object.values(evs).reduce((suma, v) => suma + comoNumero(v), 0);
  const evsRestantes = EV_MAX_TOTAL - totalEvs;

  // Lo máximo que se puede poner en cada EV sin pasar de 252 ni del total de 510.
  const maxEvPorStat = {};
  for (const stat of Object.keys(evs)) {
    maxEvPorStat[stat] = Math.max(0, Math.min(EV_MAX_STAT, comoNumero(evs[stat]) + evsRestantes));
  }

  const problemas = [
    ...Object.entries(erroresIv).filter(([, e]) => e).map(([s, e]) => `IV de ${nombreStat(s)}: ${e}`),
    ...Object.entries(erroresEv).filter(([, e]) => e).map(([s, e]) => `EV de ${nombreStat(s)}: ${e}`),
  ];
  if (evsRestantes < 0) {
    problemas.push(`Los EVs suman ${totalEvs}: quita ${-evsRestantes} para no pasar de ${EV_MAX_TOTAL}`);
  }

  return { erroresIv, erroresEv, totalEvs, evsRestantes, maxEvPorStat, problemas };
}
