(function () {
'use strict';

const D = window.DATOS;
const app = document.getElementById('app');
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const ORDINAL = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto'];
const NUMERO = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// Rosarium Virginis Mariae (2002), indexado por Date.getDay()
const DEL_DIA = ['gloriosos', 'gozosos', 'dolorosos', 'gloriosos', 'luminosos', 'dolorosos', 'gozosos'];
const SINGULAR = { gozosos: 'gozoso', luminosos: 'luminoso', dolorosos: 'doloroso', gloriosos: 'glorioso' };

const ICONO_ROSARIO = '<svg class="g-ros" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8.5" r="6" stroke-width="2.4" stroke-dasharray="0.01 2.75"/><path d="M12 15.2v2.3M12 18.6v4M10.2 20.2h3.6" stroke-width="1.6"/></svg><i class="ti ti-photo g-arte" aria-hidden="true"></i>';

/* ---------- Guardado local (puede no estar disponible) ---------- */
const memoria = {};
function leer(k, def) {
  try { const v = localStorage.getItem('rosario.' + k); if (v !== null) return JSON.parse(v); } catch (e) {}
  return k in memoria ? memoria[k] : def;
}
function guardar(k, v) { memoria[k] = v; try { localStorage.setItem('rosario.' + k, JSON.stringify(v)); } catch (e) {} }
function borrar(k) { delete memoria[k]; try { localStorage.removeItem('rosario.' + k); } catch (e) {} }

const pad = n => String(n).padStart(2, '0');
function hoyISO() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

const cfg = Object.assign({ modo: 'auto', ohJesus: true, vida: true }, leer('ajustes', {}));
let grupoInicio = DEL_DIA[new Date().getDay()];

const grupo = id => D.grupos.find(g => g.id === id);
const rezados = id => leer('rezados.' + hoyISO() + '.' + id, []);
function marcarRezado(id, m) { const r = rezados(id); if (!r.includes(m)) { r.push(m); guardar('rezados.' + hoyISO() + '.' + id, r); } }
function proximo(id) { const r = rezados(id); for (let i = 0; i < 5; i++) if (!r.includes(i)) return i; return 0; }

/* ---------- Tema ---------- */
function aplicarTema() {
  const h = new Date().getHours();
  const noche = cfg.modo === 'noche' || (cfg.modo === 'auto' && (h >= 19 || h < 7));
  document.body.className = noche ? 'noche' : 'dia';
  $('meta[name="theme-color"]').setAttribute('content', noche ? '#0d1120' : '#f6f6f4');
}

/* ---------- Pantalla encendida mientras se reza ---------- */
let bloqueo = null;
async function mantenerEncendida() { try { if ('wakeLock' in navigator) bloqueo = await navigator.wakeLock.request('screen'); } catch (e) {} }
function soltarPantalla() { try { bloqueo && bloqueo.release(); } catch (e) {} bloqueo = null; }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S && $('.rezo')) mantenerEncendida(); });
const vibrar = () => { try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} };

/* ---------- Pintura ---------- */
function heroHTML(mis) {
  return `<div class="hero"><div class="arte on" style="${estiloArte(mis)}"></div><div class="fundido"></div></div>`;
}
function estiloArte(mis) { return `background-image:url('${mis.imagen}');background-position:${mis.foco};--z:${mis.zoom}`; }

/* ---------- Inicio ---------- */
function vistaInicio() {
  S = null; soltarPantalla(); aplicarTema();
  const g = grupo(grupoInicio), m = proximo(g.id), mis = g.misterios[m], hoy = new Date();
  const ses = leer('sesion', null);
  let retomar = '';
  if (ses && ses.fecha === hoyISO() && ses.modo !== 'salve') {
    const pasos = construirPasos(ses), p = pasos[Math.min(ses.paso, pasos.length - 1)];
    const donde = p.m == null ? 'en las oraciones del comienzo' : `en el ${ORDINAL[p.m]} misterio ${SINGULAR[ses.grupo]}`;
    retomar = `<button class="retomar" data-accion="retomar"><span>Quedaste ${donde}</span><b>Retomar</b></button>`;
  }
  app.innerHTML = `
  <section class="vista inicio">
    ${heroHTML(mis)}
    <header class="barra"><span></span><button class="ic" data-accion="ajustes" aria-label="Ajustes"><i class="ti ti-adjustments-horizontal"></i></button></header>
    <div class="cuerpo">
      <div class="k lift">${cap(DIAS[hoy.getDay()])} ${hoy.getDate()} de ${MESES[hoy.getMonth()]}</div>
      <button class="grupo-sel" data-accion="grupos" aria-label="Elegir otros misterios"><h1 class="t1">${g.nombre}<i class="ti ti-chevron-down"></i></h1></button>
      <p class="sub lift">${esc(g.subtitulo)}</p>
      ${retomar}
      <div class="pregunta">¿Cuánto tiempo tenés hoy?</div>
      <button class="btn principal" data-accion="uno"><span>Un misterio<small>${esc(mis.titulo)}</small></span><span class="min">4 min</span></button>
      <button class="btn alt" data-accion="entero"><span>El Rosario entero</span><span class="min">20 min</span></button>
      <div class="accesos">
        <button class="mini" data-accion="primera"><i class="ti ti-sparkles"></i>Es mi primera vez</button>
        <button class="mini" data-accion="acerca"><i class="ti ti-book-2"></i>Acerca del Rosario</button>
      </div>
    </div>
  </section>`;
}

/* ---------- Pasos de un rezo ---------- */
// pos: lugar en el mapa. cruz, p1 (primera cuenta grande), t0-t2 (tres cuentas),
// c0 (hilo antes de la medalla), p2 (cuenta junto a la medalla), L0-L53 (vuelta),
// h0-h4 (hilo después de cada decena), med (medalla).
function cuentaGrande(m) { return m === 0 ? 'p2' : 'L' + ((m - 1) * 11 + 10); }

function construirPasos(ses) {
  const P = [];
  if (ses.modo === 'salve') {
    P.push({ t: 'oracion', o: 'salve', parte: 0, pos: 'med', etq: 'Salve' });
    P.push({ t: 'oracion', o: 'salve', parte: 1, pos: 'med', etq: 'Salve' });
    return P;
  }
  const entero = ses.modo === 'entero';
  P.push({ t: 'oracion', o: 'senal', pos: 'cruz', etq: 'Señal de la cruz', nota: 'Nos ponemos en presencia de Dios.' });
  if (entero) {
    P.push({ t: 'oracion', o: 'credo', pos: 'cruz', etq: 'Credo', nota: 'Lo que creemos, en pocas palabras.' });
    P.push({ t: 'oracion', o: 'padre', pos: 'p1', tira: { n: 3, i: 0 }, etq: 'Padrenuestro' });
    ['la fe', 'la esperanza', 'la caridad'].forEach((v, i) =>
      P.push({ t: 'oracion', o: 'ave', pos: 't' + i, tira: { n: 3, i: i + 1 }, etq: `Avemaría ${i + 1} de 3`, nota: 'Pedimos ' + v + '.' }));
    P.push({ t: 'oracion', o: 'gloria', pos: 'c0', tira: { n: 3, i: 4 }, etq: 'Gloria' });
    if (cfg.ohJesus) P.push({ t: 'oracion', o: 'ohjesus', pos: 'c0', tira: { n: 3, i: 4 }, etq: 'Oh Jesús mío' });
  }
  const lista = entero ? [0, 1, 2, 3, 4] : [ses.misterio];
  lista.forEach((m, n) => {
    const grande = cuentaGrande(m), hilo = 'h' + m;
    P.push({ t: 'anuncio', m, pos: grande, etq: 'Tocá para empezar' });
    P.push({ t: 'oracion', o: 'padre', m, k: 0, pos: grande, tira: { n: 10, i: 0 }, etq: 'Padrenuestro' });
    for (let j = 0; j < 10; j++)
      P.push({ t: 'oracion', o: 'ave', m, k: j + 1, pos: 'L' + (m * 11 + j), tira: { n: 10, i: j + 1 }, etq: `Avemaría ${j + 1} de 10` });
    P.push({ t: 'oracion', o: 'gloria', m, k: 11, pos: hilo, tira: { n: 10, i: 11 }, etq: 'Gloria' });
    if (cfg.ohJesus) P.push({ t: 'oracion', o: 'ohjesus', m, k: 11, pos: hilo, tira: { n: 10, i: 11 }, etq: 'Oh Jesús mío' });
    if (cfg.vida) P.push({ t: 'vida', m, pos: hilo, ultimo: n === lista.length - 1, etq: '' });
  });
  if (entero) {
    P.push({ t: 'oracion', o: 'salve', parte: 0, pos: 'med', etq: 'Salve' });
    P.push({ t: 'oracion', o: 'salve', parte: 1, pos: 'med', etq: 'Salve' });
  }
  return P;
}

function textos(p) {
  const partes = D.oraciones[p.o].partes;
  if (p.o === 'salve') return p.parte === 0 ? { guia: '', todos: partes[0].texto } : { guia: partes[1].texto, todos: partes[2].texto };
  const de = q => partes.filter(x => x.quien === q).map(x => x.texto).join(' ');
  return { guia: de('guia'), todos: de('todos') };
}

function fraseMirar(mis, p) {
  const n = mis.mirar.length;
  return mis.mirar[Math.min(n - 1, Math.floor(p.k * n / 11))];
}

/* ---------- Rezo ---------- */
let S = null; // { ses, pasos }

function iniciar(modo, gid, m) { abrirSesion({ fecha: hoyISO(), modo, grupo: gid, misterio: m || 0, paso: 0 }); }

function abrirSesion(ses) {
  S = { ses, pasos: construirPasos(ses) };
  if (ses.paso >= S.pasos.length) ses.paso = 0;
  montarRezo();
  actualizar();
  mantenerEncendida();
}

function montarRezo() {
  app.innerHTML = `
  <section class="vista fija rezo es-oracion">
    <div class="hero"><div class="arte capa"></div><div class="arte capa"></div><div class="fundido"></div></div>
    <header class="barra">
      <button class="ic" data-accion="salir" aria-label="Salir"><i class="ti ti-x"></i></button>
      <span class="cinco" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      <button class="ic" data-accion="mapa" aria-label="Ver el mapa del Rosario">${ICONO_ROSARIO}</button>
    </header>
    <div class="mapa" aria-hidden="true">
      <div class="k mapa-k"></div>
      <div class="t1 mapa-t"></div>
      <svg class="ros" viewBox="0 0 200 272" role="img" aria-label="Mapa del Rosario con la cuenta actual marcada"></svg>
      <div class="aqui"></div>
      <div class="pista">Tocá para seguir rezando desde acá</div>
    </div>
    <div class="cuerpo" aria-live="polite">
      <div class="k kicker lift"></div>
      <h2 class="t1 titulo"></h2>
      <div class="cita lift"></div>
      <p class="mira lift"></p>
      <div class="pide"><span class="k">En este misterio pedimos</span><span class="fruto"></span></div>
      <div class="credito"></div>
      <svg class="tira" viewBox="0 0 264 26" aria-hidden="true"></svg>
      <p class="guia"></p>
      <p class="todos"></p>
      <div class="vida-q"></div>
      <div class="acciones"></div>
      <div class="pie">
        <button class="ic chico" data-accion="atras" aria-label="Volver a la oración anterior"><i class="ti ti-arrow-back-up"></i></button>
        <span class="etq"></span>
        <span class="ic chico fantasma"></span>
      </div>
    </div>
  </section>`;
  dibujarMapa($('.ros'));
}

function ponerArte(mis) {
  const capas = app.querySelectorAll('.capa');
  const visible = [...capas].find(c => c.classList.contains('on'));
  if (visible && visible.dataset.img === mis.imagen) return;
  const otra = visible === capas[0] ? capas[1] : capas[0];
  otra.setAttribute('style', estiloArte(mis));
  otra.dataset.img = mis.imagen;
  otra.classList.add('on');
  if (visible) visible.classList.remove('on');
}

function actualizar() {
  const { ses, pasos } = S, p = pasos[ses.paso], g = grupo(ses.grupo);
  const enMisterio = p.m != null;
  const mis = g.misterios[enMisterio ? p.m : (ses.modo === 'salve' ? ses.misterio : (ses.modo === 'entero' ? 0 : ses.misterio))];
  const r = $('.rezo');
  r.classList.toggle('es-anuncio', p.t === 'anuncio');
  r.classList.toggle('es-vida', p.t === 'vida');
  r.classList.toggle('es-oracion', p.t === 'oracion');
  ponerArte(mis);

  $('.kicker').textContent = enMisterio ? `${cap(ORDINAL[p.m])} misterio ${SINGULAR[g.id]}` : (ses.modo === 'salve' ? 'Para terminar' : 'Para empezar');
  $('.titulo').textContent = enMisterio ? mis.titulo : (ses.modo === 'salve' ? 'Salve' : g.nombre);
  $('.cita').textContent = enMisterio ? mis.cita : '';
  $('.mira').textContent = p.t === 'oracion' ? (enMisterio ? fraseMirar(mis, p) : (p.nota || '')) : '';
  $('.fruto').textContent = enMisterio ? mis.pedir : '';
  $('.credito').innerHTML = enMisterio ? `${esc(mis.autor)}, <em>${esc(mis.obra)}</em>` : '';

  const tira = $('.tira');
  tira.style.display = p.tira ? '' : 'none';
  if (p.tira) dibujarTira(tira, p.tira.n, p.tira.i);

  if (p.t === 'oracion') {
    const t = textos(p);
    $('.guia').textContent = t.guia;
    $('.todos').textContent = t.todos;
    $('.todos').classList.toggle('largo', t.todos.length > 230);
  }
  const acc = $('.acciones');
  if (p.t === 'anuncio') acc.innerHTML = '<button class="btn principal" data-accion="seguir" style="justify-content:center">Empezar</button>';
  else if (p.t === 'vida') {
    $('.vida-q').textContent = mis.vida;
    const siguiente = !p.ultimo ? 'Siguiente misterio' : (ses.modo === 'entero' ? 'Rezar la Salve' : 'Terminar');
    acc.innerHTML = `<button class="btn principal" data-accion="seguir" style="justify-content:center">${siguiente}</button>` +
      (!p.ultimo ? '<button class="enlace" data-accion="terminar">Terminar acá</button>' : '');
  } else acc.innerHTML = '';
  $('.kicker').textContent = p.t === 'vida' ? 'Antes de seguir' : $('.kicker').textContent;
  $('.etq').textContent = p.etq + (p.t === 'oracion' ? ' · tocá para seguir' : '');

  // Cinco círculos: uno por misterio del grupo
  const propios = pasos.filter(x => x.m === p.m);
  const avance = enMisterio ? (propios.indexOf(p) + 1) / propios.length : 0;
  app.querySelectorAll('.cinco i').forEach((c, i) => {
    const hecho = ses.modo === 'entero' ? enMisterio && i < p.m : (ses.modo === 'uno' && rezados(g.id).includes(i) && i !== ses.misterio);
    c.className = hecho ? 'hecho' : (enMisterio && i === p.m ? 'ahora' : '');
    if (enMisterio && i === p.m) c.style.setProperty('--p', avance);
  });

  actualizarMapa(p, mis, g);
  guardar('sesion', ses);
}

function avanzar() {
  const { ses, pasos } = S, p = pasos[ses.paso];
  if (p.o === 'gloria' && p.m != null) marcarRezado(ses.grupo, p.m);
  if (ses.paso < pasos.length - 1) { ses.paso++; vibrar(); actualizar(); }
  else terminar();
}
function atras() { if (S.ses.paso > 0) { S.ses.paso--; actualizar(); } }

function terminar() {
  const ses = S.ses;
  borrar('sesion');
  if (ses.modo === 'salve') return vistaInicio();
  vistaFin(ses);
}

/* ---------- Tira de cuentas (un tramo del Rosario) ---------- */
function dibujarTira(svg, n, i) {
  const ultimo = 38 + (n - 1) * 18;
  let h = `<line x1="2" y1="13" x2="262" y2="13" stroke="var(--line)" stroke-width="1.2"/>`;
  const hilo = i === n + 1;
  h += `<line x1="${ultimo + 10}" y1="13" x2="260" y2="13" stroke="${hilo ? 'var(--mark)' : 'var(--line)'}" stroke-width="${hilo ? 3.2 : 1.2}" stroke-linecap="round"/>`;
  for (let b = 0; b <= n; b++) {
    const x = b === 0 ? 14 : 38 + (b - 1) * 18, r = (b === 0 ? 7.5 : 4.6) * (b === i ? 1.35 : 1);
    const color = b <= i ? 'var(--mark)' : 'var(--bead)', op = b < i ? .55 : 1;
    h += `<circle cx="${x}" cy="13" r="${r}" fill="${color}" opacity="${op}"/>`;
  }
  svg.innerHTML = h;
}

/* ---------- Mapa completo ---------- */
const CX = 100, CY = 92, R = 74;
function puntoVuelta(i) { const a = (90 - 14 - i * (332 / 53)) * Math.PI / 180; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; }

function dibujarMapa(svg) {
  let h = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="var(--line)" stroke-width=".8"/>`;
  h += `<line x1="100" y1="${CY + R}" x2="100" y2="252" stroke="var(--line)" stroke-width=".8"/>`;
  // hilos (Gloria y Oh Jesús mío)
  for (let m = 0; m < 5; m++) {
    const [x1, y1] = puntoVuelta(m * 11 + 9), [x2, y2] = m < 4 ? puntoVuelta(m * 11 + 10) : [100, 162];
    h += `<line class="cadena" data-pos="h${m}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }
  h += `<line class="cadena" data-pos="c0" x1="100" y1="194" x2="100" y2="202"/>`;
  for (let i = 0; i < 54; i++) {
    const [x, y] = puntoVuelta(i), grande = i % 11 === 10;
    h += `<circle class="cuenta" data-pos="L${i}" cx="${x}" cy="${y}" r="${grande ? 4.6 : 2.8}"/>`;
  }
  h += `<rect class="cuenta solida" data-pos="med" x="93" y="162" width="14" height="16" rx="6"/>`;
  h += `<circle class="cuenta" data-pos="p2" cx="100" cy="188" r="4.6"/>`;
  [['t2', 207], ['t1', 216], ['t0', 225]].forEach(([k, y]) => { h += `<circle class="cuenta" data-pos="${k}" cx="100" cy="${y}" r="2.8"/>`; });
  h += `<circle class="cuenta" data-pos="p1" cx="100" cy="238" r="4.6"/>`;
  h += `<path class="cuenta solida" data-pos="cruz" d="M98 248h4v6h6v4h-6v12h-4v-12h-6v-4h6z"/>`;
  svg.innerHTML = h;
}

function actualizarMapa(p, mis, g) {
  const { ses, pasos } = S;
  const hechos = new Set(pasos.slice(0, ses.paso).map(x => x.pos));
  hechos.delete(p.pos);
  app.querySelectorAll('.ros [data-pos]').forEach(e => {
    e.classList.toggle('hecho', hechos.has(e.dataset.pos));
    e.classList.toggle('ahora', e.dataset.pos === p.pos);
  });
  $('.mapa-k').textContent = p.m != null ? `${cap(ORDINAL[p.m])} misterio ${SINGULAR[g.id]}` : g.nombre;
  $('.mapa-t').textContent = p.m != null ? mis.titulo : (ses.modo === 'salve' ? 'Salve' : 'Las oraciones del comienzo');
  const lugar = p.t === 'anuncio' ? 'anuncio del misterio' : p.t === 'vida' ? 'pausa antes de seguir' : p.etq;
  $('.aqui').textContent = 'Estás acá: ' + lugar;
}

/* ---------- Fin ---------- */
function vistaFin(ses) {
  soltarPantalla();
  const g = grupo(ses.grupo), uno = ses.modo === 'uno', mis = g.misterios[uno ? ses.misterio : 4];
  const quedan = 5 - rezados(g.id).length;
  const manana = new Date(Date.now() + 864e5).getDay();
  let detalle;
  if (uno && quedan > 0 && g.id === DEL_DIA[new Date().getDay()])
    detalle = quedan === 1 ? 'Te queda un misterio de hoy. Lo podés rezar en otro momento del día.'
      : `Te quedan ${NUMERO[quedan]} misterios de hoy. Los podés rezar en otro momento del día.`;
  else detalle = `Mañana, ${DIAS[manana]}, tocan los misterios ${DEL_DIA[manana]}.`;
  app.innerHTML = `
  <section class="vista fija fin">
    ${heroHTML(mis)}
    <header class="barra"><button class="ic" data-accion="inicio" aria-label="Volver al inicio"><i class="ti ti-x"></i></button><span></span></header>
    <div class="cuerpo">
      <div class="k lift">Amén</div>
      <h1 class="t1">${uno ? `Rezaste el ${ORDINAL[ses.misterio]} misterio ${SINGULAR[g.id]}` : `Rezaste los ${g.nombre.toLowerCase()}`}</h1>
      <p class="sub" style="margin-bottom:26px">${detalle}</p>
      ${uno ? '<button class="btn principal" data-accion="salve" style="justify-content:center">Rezar la Salve</button><button class="btn alt" data-accion="inicio" style="justify-content:center">Volver al inicio</button>'
            : '<button class="btn principal" data-accion="inicio" style="justify-content:center">Volver al inicio</button>'}
    </div>
  </section>`;
  S = { ses, pasos: [] };
}

/* ---------- Es mi primera vez ---------- */
const PRIMERA = [
  { t: 'El Rosario es mirar la vida de Jesús junto a María',
    b: 'Se reza en grupos de diez Avemarías. Cada grupo es un misterio: una escena del Evangelio, como el nacimiento en Belén o la noche en el huerto de los Olivos. Mientras rezás, mirás esa escena.' },
  { t: 'Las cuentas te van llevando', tira: true,
    b: 'Cada cuenta es una oración. En las grandes se reza el Padrenuestro y en las chicas, el Avemaría. Con el Rosario en la mano, pasás una cuenta por oración y sabés siempre por dónde vas.' },
  { t: '¿Por qué se repite tanto?',
    b: 'Las Avemarías marcan un ritmo, como la respiración. Cuando ya no tenés que pensar las palabras, la atención queda libre para la escena.' },
  { t: 'No hace falta saberse nada',
    b: 'La app reza con vos. Arriba, en letra chica, va la parte de quien guía. Abajo, en grande, la parte que rezás vos. Tocás la pantalla para pasar a la cuenta siguiente, y con el ícono del Rosario ves en qué parte estás.' },
];
function vistaPrimera(i) {
  const c = PRIMERA[i], ultimo = i === PRIMERA.length - 1;
  app.innerHTML = `
  <section class="vista fija pv">
    ${heroHTML(grupo('gozosos').misterios[0])}
    <header class="barra"><button class="ic" data-accion="inicio" aria-label="Cerrar"><i class="ti ti-x"></i></button><span></span></header>
    <div class="cuerpo">
      <div class="puntos">${PRIMERA.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>
      <h1 class="t1">${esc(c.t)}</h1>
      ${c.tira ? '<svg class="tira" viewBox="0 0 264 26" aria-hidden="true"></svg>' : ''}
      <p>${esc(c.b)}</p>
      <button class="btn principal" data-accion="${ultimo ? 'uno' : 'pv'}" data-v="${i + 1}" style="justify-content:center">${ultimo ? 'Rezar un misterio' : 'Siguiente'}</button>
    </div>
  </section>`;
  if (c.tira) dibujarTira($('.pv .tira'), 10, 4);
}

/* ---------- Acerca del Rosario ---------- */
const CAPITULOS = [
  ['Qué es el Rosario', 'Las oraciones, los misterios y cómo se reza'],
  ['Su historia', 'De los 150 salmos de los monjes a los misterios luminosos de 2002'],
  ['Por qué rezarlo', 'Lo que dijeron los papas y los santos'],
  ['Lo que dice la ciencia', 'Qué se midió y qué no'],
  ['Con María hacia Jesús', 'La idea que da origen a este proyecto'],
  ['Preguntas honestas', '¿No es repetitivo? ¿Por qué rezarle a María?'],
];
function vistaAcerca() {
  app.innerHTML = `
  <section class="vista acerca">
    ${heroHTML(grupo('gloriosos').misterios[4])}
    <header class="barra"><button class="ic" data-accion="inicio" aria-label="Volver al inicio"><i class="ti ti-arrow-left"></i></button><span></span></header>
    <div class="cuerpo">
      <h1 class="t1">Acerca del Rosario</h1>
      <p class="sub" style="margin-bottom:14px">Para conocerlo a fondo, de a un capítulo.</p>
      ${CAPITULOS.map(([t, d]) => `<div class="capitulo"><div><b>${t}</b><span>${d}</span></div><em>En preparación</em></div>`).join('')}
    </div>
  </section>`;
  window.scrollTo(0, 0);
}

/* ---------- Hojas ---------- */
function hoja(html) {
  cerrarHoja();
  const v = document.createElement('div');
  v.className = 'velo'; v.dataset.accion = 'cerrar';
  v.innerHTML = `<div class="hoja" data-accion="nada">${html}</div>`;
  document.body.appendChild(v);
}
function cerrarHoja() { const v = $('.velo'); if (v) v.remove(); }

function hojaGrupos() {
  const hoy = DEL_DIA[new Date().getDay()];
  hoja('<h3>Elegí qué misterios rezar</h3>' + D.grupos.map(g =>
    `<button class="fila${g.id === grupoInicio ? ' sel' : ''}" data-accion="grupo" data-v="${g.id}"><span><b>${g.nombre}</b><small>${g.dias}</small></span>${g.id === hoy ? '<span class="etiqueta">Hoy</span>' : ''}</button>`).join(''));
}
function hojaAjustes() {
  const seg = (v, t) => `<button class="${cfg.modo === v ? 'sel' : ''}" data-accion="modo" data-v="${v}">${t}</button>`;
  const sw = (k, t, d) => `<button class="fila" data-accion="alternar" data-v="${k}" role="switch" aria-checked="${cfg[k]}"><span><b>${t}</b><small>${d}</small></span><span class="interruptor${cfg[k] ? ' on' : ''}"></span></button>`;
  hoja(`<h3>Ajustes</h3>
    <div style="padding-bottom:14px"><b style="font-size:14px">Modo</b><small style="display:block;font-size:12px;color:var(--muted)">En automático, de 19 a 7 se usa el modo noche.</small>
      <div class="segmentos">${seg('auto', 'Automático')}${seg('dia', 'Día')}${seg('noche', 'Noche')}</div></div>
    ${sw('ohJesus', 'Oh Jesús mío', 'Después de cada Gloria')}
    ${sw('vida', 'Pregunta para tu vida', 'Al terminar cada misterio')}`);
}

/* ---------- Acciones ---------- */
const acciones = {
  uno: () => iniciar('uno', grupoInicio, proximo(grupoInicio)),
  entero: () => iniciar('entero', grupoInicio, 0),
  retomar: () => { const s = leer('sesion', null); if (s) { grupoInicio = s.grupo; abrirSesion(s); } },
  salve: () => abrirSesion({ fecha: hoyISO(), modo: 'salve', grupo: S.ses.grupo, misterio: S.ses.misterio, paso: 0 }),
  seguir: () => avanzar(),
  terminar: () => terminar(),
  atras: () => atras(),
  salir: () => vistaInicio(),
  inicio: () => vistaInicio(),
  mapa: () => { const r = $('.rezo'); const m = r.classList.toggle('con-mapa'); $('.mapa').setAttribute('aria-hidden', !m); },
  primera: () => vistaPrimera(0),
  pv: b => vistaPrimera(+b.dataset.v),
  acerca: () => vistaAcerca(),
  grupos: () => hojaGrupos(),
  grupo: b => { grupoInicio = b.dataset.v; cerrarHoja(); vistaInicio(); },
  ajustes: () => hojaAjustes(),
  modo: b => { cfg.modo = b.dataset.v; guardar('ajustes', cfg); aplicarTema(); hojaAjustes(); },
  alternar: b => { cfg[b.dataset.v] = !cfg[b.dataset.v]; guardar('ajustes', cfg); hojaAjustes(); },
  cerrar: () => cerrarHoja(),
  nada: () => {},
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-accion]');
  if (b) { acciones[b.dataset.accion](b); return; }
  // En la pantalla de rezo, un toque en cualquier parte pasa a la cuenta siguiente.
  if (S && S.pasos.length && e.target.closest('.rezo')) {
    if (S.pasos[S.ses.paso].t === 'vida') return;
    avanzar();
  }
});
document.addEventListener('keydown', e => {
  if (!S || !S.pasos.length || !$('.rezo')) return;
  if (e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); if (S.pasos[S.ses.paso].t !== 'vida') avanzar(); }
  if (e.key === 'ArrowLeft') atras();
});

vistaInicio();
})();
