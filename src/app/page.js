/* Referências da página (elementos do DOM) e preferência de movimento reduzido. */

export const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $ = function (s, r) {
  return (r || document).querySelector(s);
};
export const glHost = $('#gl'),
  stage = $('#stage');
