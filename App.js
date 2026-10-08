(function () {
'use strict';

const D = window.DATOS;
const app = document.getElementById('app');
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const ORDINAL = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto'];
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

// mudo: la voz callada con el parlante del rezo (A dos voces). Se recuerda para la próxima vez.
const cfg = Object.assign({ modo: 'auto', ohJesus: true, vida: true, forma: 'guia', voz: 'femenina', lengua: 'es', imagenes: 'pinturas', mudo: false, textos: 'auto' }, leer('ajustes', {}));

// Formas de rezar (ver Decisiones.md, 6 de octubre)
const FORMAS = [
  ['solo', 'Solo', 'Rezás a tu ritmo, sin voz. Cada oración aparece entera.'],
  ['guia', 'A dos voces', 'Una voz guía y vos respondés, como cuando se reza en grupo. Tu parte va en letra grande.'],
  ['todo', 'Escuchar', 'Una voz reza todo y la app avanza sola. La acompañás en voz alta o en silencio.'],
];
// Opciones de Ajustes: [valor, etiqueta, descripción]
const OPCIONES = {
  forma: { titulo: 'Forma de rezar', items: FORMAS },
  voz: { titulo: 'Voz', items: [['femenina', 'Femenina'], ['masculina', 'Masculina']] },
  lengua: { titulo: 'Oraciones en', items: [
    ['es', 'Castellano', 'Las oraciones como se rezan en la Argentina.'],
    ['la', 'Latín', 'Las oraciones en latín, como se rezaron durante siglos. Anuncios, escenas y preguntas siguen en castellano.']] },
  textos: { titulo: 'Texto de las oraciones', items: [
    ['nombre', 'Solo el nombre', 'Solo el nombre de cada oración, para dejarle lugar a la pintura. El Credo y la Salve se ven siempre enteros.'],
    ['completas', 'Completas', 'Cada oración entera en pantalla, para leerla mientras rezás.']] },
  imagenes: { titulo: 'Imágenes', items: [
    ['pinturas', 'Pinturas', 'Obras de grandes maestros que muestran cada escena.'],
    ['ilustraciones', 'Ilustraciones', 'Ilustraciones de hoy, más simples y serenas.'],
    ['ninguna', 'Sin imágenes', 'Solo luz y color, para rezar sin nada que mirar.']] },
  modo: { titulo: 'Modo', items: [
    ['auto', 'Automático', 'De 19 a 7 se usa el modo noche, y el resto del día, el modo día.'],
    ['dia', 'Día', 'Fondo claro, para rezar de día o con mucha luz.'],
    ['noche', 'Noche', 'Fondo oscuro, para rezar de noche o con poca luz.']] },
};
const hayIlustraciones = D.grupos.some(g => g.misterios.some(m => m.ilustracion));
const oraciones = () => cfg.lengua === 'la' ? D.latin : D.oraciones;
// Texto de las oraciones (ver Decisiones.md, 7 de octubre): mientras no se elija, en castellano
// se ve solo el nombre (casi todos las saben) y en latín, enteras.
const textosEnteros = () => (cfg.textos === 'auto' ? (cfg.lengua === 'la' ? 'completas' : 'nombre') : cfg.textos) === 'completas';
const valor = k => k === 'textos' ? (textosEnteros() ? 'completas' : 'nombre') : cfg[k];
const SIEMPRE_ENTERAS = ['credo', 'salve'];
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

/* ---------- Voz ---------- */
// Provisoria: la voz del celular. Cuando estén los audios grabados se cambia esta
// pieza y el resto de la app queda igual.
const voz = (() => {
  const sintesis = window.speechSynthesis;
  const RARAS = /eddy|flo|grand|reed|rocko|sandy|shelley|bahh|bells|boing|bubbles|cellos|wobble|news|jester|organ|superstar|trinoids|whisper|zarvox|albert|fred|junior|kathy|ralph/i;
  // Acento: rioplatense primero. Para el latín, una voz italiana, que es la
  // pronunciación más cercana al latín de la Iglesia.
  const ORDEN = { es: ['es-ar', 'es-419', 'es-us', 'es-mx', 'es-co', 'es-cl', 'es-es'], it: ['it-it'] };
  // La API no dice si una voz es de varón o de mujer: se deduce por el nombre.
  const VARONES = /\b(jorge|juan|diego|carlos|pablo|ra[uú]l|[aá]lvaro|tom[aá]s|gonzalo|enrique|andr[eé]s|luca|cosimo|giuseppe|benigno|rinaldo)\b/i;
  const MUJERES = /\b(m[oó]nica|paulina|ang[eé]lica|isabela|isabella|marisol|soledad|francisca|helena|laura|sabina|elvira|dalia|elena|alice|federica|paola|elsa|emma|google)\b/i;
  let turno = 0, vivas = [], reloj = null;
  const genero = v => VARONES.test(v.name) ? 'masculina' : MUJERES.test(v.name) ? 'femenina' : '';
  const candidatas = idioma => sintesis ? sintesis.getVoices().filter(v => v.lang.toLowerCase().startsWith(idioma) && !RARAS.test(v.name)) : [];
  const latinItaliano = () => candidatas('it').length > 0;
  function elegir(lengua) {
    const idioma = lengua === 'la' && latinItaliano() ? 'it' : 'es', orden = ORDEN[idioma];
    const nota = v => {
      const g = genero(v), i = orden.indexOf(v.lang.replace('_', '-').toLowerCase());
      return (g === cfg.voz ? 0 : g ? 20 : 10) + (i < 0 ? orden.length : i);
    };
    return candidatas(idioma).sort((a, b) => nota(a) - nota(b))[0] || null;
  }
  const tiene = lengua => { const v = elegir(lengua); return !!v && genero(v) === cfg.voz; };
  function callar() { turno++; vivas = []; clearTimeout(reloj); if (sintesis) sintesis.cancel(); }
  // trozos: frases a decir en orden. al: { trozo(i), fin(), falla() }. lengua: 'es' o 'la'.
  function decir(trozos, al = {}, lengua = 'es') {
    callar();
    if (!sintesis || !trozos.length) return;
    const yo = turno, elegida = elegir(lengua);
    vivas = trozos.map((t, i) => {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = elegida ? elegida.lang : 'es-AR';
      if (elegida) u.voice = elegida;
      u.rate = .92;
      u.onstart = () => { if (yo === turno && al.trozo) al.trozo(i); };
      u.onerror = () => { if (yo === turno && al.falla) al.falla(); };
      if (i === trozos.length - 1) u.onend = () => { if (yo === turno) { clearTimeout(reloj); if (al.fin) al.fin(); } };
      return u;
    });
    vivas.forEach(u => sintesis.speak(u));
    // Seguro: si la voz del celular se traba y no avisa que terminó, se sigue igual.
    // Con la pantalla oculta no se hace nada, para no avanzar a escondidas.
    const limite = 4000 + trozos.join('').length * 150;
    const vigilar = () => {
      if (yo !== turno) return;
      if (document.visibilityState !== 'visible') { reloj = setTimeout(vigilar, 2000); return; }
      callar(); if (al.fin) al.fin();
    };
    reloj = setTimeout(vigilar, limite);
  }
  return { decir, callar, tiene, latinItaliano, hablando: () => !!sintesis && sintesis.speaking };
})();

// Frases cortas: algunos navegadores cortan la voz a mitad de una frase muy larga.
function partir(texto) {
  const out = [];
  (texto.match(/[^.;!?]+[.;!?]*\s*/g) || [texto]).forEach(f => {
    if (f.length <= 200) return out.push(f);
    let t = '';
    (f.match(/[^,]+,?\s*/g) || [f]).forEach(c => { if (t && (t + c).length > 160) { out.push(t); t = ''; } t += c; });
    if (t) out.push(t);
  });
  return out;
}

/* ---------- Pintura ---------- */
function heroHTML(mis) {
  return `<div class="hero"><div class="arte on" style="${estiloArte(mis)}"></div><div class="fundido"></div></div>`;
}
// Sin imágenes: una luz que baja desde arriba, con el color de cada grupo de misterios.
const LUZ = { gozosos: '232,184,107', luminosos: '170,200,235', dolorosos: '150,60,85', gloriosos: '255,210,130' };
const grupoDe = mis => D.grupos.find(g => g.misterios.includes(mis)).id;
function luz(gid) {
  const c = LUZ[gid];
  return `background-image:radial-gradient(ellipse 70% 60% at 50% -4%,rgba(255,244,222,.42),transparent 72%),radial-gradient(ellipse 160% 120% at 50% -14%,rgba(${c},.75),rgba(${c},.32) 45%,rgba(${c},.08) 72%,transparent 90%)`;
}
function estiloArte(mis) {
  if (cfg.imagenes === 'ninguna') return luz(grupoDe(mis)) + ';--z:1;top:0;-webkit-mask-image:none;mask-image:none';
  if (cfg.imagenes === 'ilustraciones' && mis.ilustracion) return `background-image:url('${mis.ilustracion}');background-position:50% 30%;--z:1;--extra:${mis.bajarIlustracion || 0}px`;
  return `background-image:url('${mis.imagen}');background-position:${mis.foco};--z:${mis.zoom}`;
}
const conCredito = mis => cfg.imagenes === 'pinturas' || (cfg.imagenes === 'ilustraciones' && !mis.ilustracion);

/* ---------- Inicio ---------- */
function vistaInicio() {
  S = null; silencio(); soltarPantalla(); aplicarTema();
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
const NOTA_SALVE = 'Saludamos a María, nuestra Madre.';

function construirPasos(ses) {
  const P = [];
  if (ses.modo === 'salve') {
    P.push({ t: 'oracion', o: 'salve', parte: 0, pos: 'med', etq: 'Salve', nota: NOTA_SALVE });
    P.push({ t: 'oracion', o: 'salve', parte: 1, pos: 'med', etq: 'Salve', nota: NOTA_SALVE });
    return P;
  }
  const entero = ses.modo === 'entero';
  // Si se sigue con "un misterio más", ya se hizo la señal de la cruz: se arranca en el anuncio.
  if (!ses.seguido) P.push({ t: 'oracion', o: 'senal', pos: 'cruz', etq: 'Señal de la cruz', nota: 'Nos ponemos en presencia de Dios.' });
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
    P.push({ t: 'oracion', o: 'salve', parte: 0, pos: 'med', etq: 'Salve', nota: NOTA_SALVE });
    P.push({ t: 'oracion', o: 'salve', parte: 1, pos: 'med', etq: 'Salve', nota: NOTA_SALVE });
  }
  return P;
}

function partesDe(p) {
  const partes = oraciones()[p.o].partes;
  if (p.o === 'salve') return p.parte === 0 ? partes.slice(0, 1) : partes.slice(1);
  return partes;
}
function textos(p) {
  const de = q => partesDe(p).filter(x => x.quien === q).map(x => x.texto).join(' ');
  return { guia: de('guia'), todos: de('todos') };
}

// Lo que dice la voz en cada paso. A dos voces, solo la parte de quien guía
// (las oraciones que se rezan todos juntos, como el Credo, las reza con vos).
// Anuncios y preguntas van siempre en castellano; las oraciones, en la lengua elegida.
function locucion(p, g) {
  if (p.t === 'anuncio') { const mis = g.misterios[p.m]; return { lengua: 'es', trozos: [`${cap(ORDINAL[p.m])} misterio ${SINGULAR[g.id]}. ${mis.titulo}.`, `En este misterio pedimos ${mis.pedir}.`] }; }
  if (p.t === 'vida') return { lengua: 'es', trozos: [g.misterios[p.m].vida] };
  const partes = partesDe(p), guia = partes.filter(x => x.quien === 'guia');
  return { lengua: cfg.lengua, trozos: (cfg.forma === 'guia' && guia.length ? guia : partes).flatMap(x => partir(x.texto)) };
}

function fraseMirar(mis, p) {
  const n = mis.mirar.length;
  return mis.mirar[Math.min(n - 1, Math.floor(p.k * n / 11))];
}

/* ---------- Rezo ---------- */
let S = null; // { ses, pasos }
let pausa = false, espera = null, sonando = false;

function silencio() { voz.callar(); clearTimeout(espera); sonando = false; }

function hablar() {
  silencio();
  if (cfg.forma === 'solo' || pausa || (cfg.forma === 'guia' && cfg.mudo)) return;
  const p = S.pasos[S.ses.paso], todos = $('.todos');
  const marcas = cfg.forma === 'todo' && p.t === 'oracion' ? todos.querySelectorAll('span') : [];
  sonando = true;
  const { trozos, lengua } = locucion(p, grupo(S.ses.grupo));
  voz.decir(trozos, {
    trozo: i => { todos.classList.toggle('sonando', marcas.length > 0); marcas.forEach((s, j) => s.classList.toggle('ahora', j === i)); },
    fin: () => {
      sonando = false; todos.classList.remove('sonando');
      if (cfg.forma === 'todo' && p.t !== 'vida') espera = setTimeout(() => avanzar(true), p.t === 'anuncio' ? 1500 : 700);
    },
    falla: () => { sonando = false; todos.classList.remove('sonando'); if (cfg.forma === 'todo') ponerPausa(true); },
  }, lengua);
}

function ponerPausa(v) {
  pausa = v;
  const b = $('[data-accion="pausa"]');
  if (b) { b.innerHTML = `<i class="ti ti-player-${v ? 'play' : 'pause'}"></i>`; b.setAttribute('aria-label', v ? 'Seguir con la voz' : 'Pausar la voz'); }
  ponerEtiqueta(S.pasos[S.ses.paso]);
  if (v) silencio(); else hablar();
}

// El parlante del rezo (A dos voces): calla la voz o la vuelve a activar, y se recuerda.
function pintarVoz(b) {
  b.innerHTML = `<i class="ti ti-volume${cfg.mudo ? '-off' : ''}"></i>`;
  b.setAttribute('aria-label', cfg.mudo ? 'Activar la voz' : 'Callar la voz');
}

// El anuncio ya tiene su botón "Empezar" y la pregunta para tu vida el suyo: ahí no va etiqueta.
function etiqueta(p) {
  if (p.t !== 'oracion') return '';
  if (cfg.forma === 'todo') return pausa ? 'En pausa' : p.etq;
  return p.etq + ' · tocá para seguir';
}
// La etiqueta de abajo es también el botón "siguiente", para quien no puede tocar
// cualquier parte de la pantalla (VoiceOver, teclado).
function ponerEtiqueta(p) {
  const e = $('.etq'), t = etiqueta(p);
  e.textContent = t;
  if (t) e.setAttribute('aria-label', t + '. Pasar a la siguiente');
  else e.removeAttribute('aria-label');
}

// Si el celular cortó la voz al bloquearse o al cambiar de app, retoma el paso.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && S && $('.rezo') && sonando && !voz.hablando()) hablar();
});

function iniciar(modo, gid, m) { abrirSesion({ fecha: hoyISO(), modo, grupo: gid, misterio: m || 0, paso: 0 }); }

function abrirSesion(ses) {
  pausa = false;
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
    <div class="cuerpo">
      <p class="lector" role="status"></p>
      <div class="credito lift"></div>
      <div class="k kicker lift"></div>
      <h2 class="t1 titulo"></h2>
      <div class="cita lift"></div>
      <p class="mira lift"></p>
      <div class="pide"><span class="k">En este misterio pedimos</span><span class="fruto"></span></div>
      <svg class="tira" viewBox="0 0 264 26" aria-hidden="true"></svg>
      <p class="guia"></p>
      <p class="todos"></p>
      <div class="vida-q"></div>
      <div class="acciones"></div>
      <div class="pie">
        <button class="ic chico" data-accion="atras" aria-label="Volver a la oración anterior"><i class="ti ti-arrow-back-up"></i></button>
        <button class="etq" data-accion="seguir"></button>
        ${cfg.forma === 'todo' ? '<button class="ic chico" data-accion="pausa" aria-label="Pausar la voz"><i class="ti ti-player-pause"></i></button>'
          : cfg.forma === 'guia' ? '<button class="ic chico" data-accion="voz"></button>' : '<span class="ic chico fantasma"></span>'}
      </div>
    </div>
  </section>`;
  dibujarMapa($('.ros'));
  const bv = $('[data-accion="voz"]');
  if (bv) pintarVoz(bv);
}

function ponerArte(mis) {
  const capas = app.querySelectorAll('.capa');
  const visible = [...capas].find(c => c.classList.contains('on')), estilo = estiloArte(mis);
  if (visible && visible.dataset.estilo === estilo) return;
  const otra = visible === capas[0] ? capas[1] : capas[0];
  otra.setAttribute('style', estilo);
  otra.dataset.estilo = estilo;
  otra.classList.add('on');
  if (visible) visible.classList.remove('on');
}

function actualizar() {
  const { ses, pasos } = S, p = pasos[ses.paso], g = grupo(ses.grupo);
  const enMisterio = p.m != null;
  // La Salve cierra el Rosario: lleva la última pintura rezada, no la del comienzo.
  const alFinal = p.o === 'salve';
  const mis = g.misterios[enMisterio ? p.m : (ses.modo === 'entero' ? (alFinal ? 4 : 0) : ses.misterio)];
  const r = $('.rezo');
  r.classList.toggle('es-anuncio', p.t === 'anuncio');
  r.classList.toggle('es-vida', p.t === 'vida');
  r.classList.toggle('es-oracion', p.t === 'oracion');
  ponerArte(mis);

  const kicker = p.t === 'vida' ? 'Antes de seguir' : enMisterio ? `${cap(ORDINAL[p.m])} misterio ${SINGULAR[g.id]}` : (alFinal ? 'Para terminar' : 'Para empezar');
  $('.kicker').textContent = kicker;
  $('.titulo').textContent = enMisterio ? mis.titulo : (alFinal ? 'Salve' : g.nombre);
  $('.cita').textContent = enMisterio ? mis.cita : '';
  $('.mira').textContent = p.t === 'oracion' ? (enMisterio ? fraseMirar(mis, p) : (p.nota || '')) : '';
  $('.fruto').textContent = enMisterio ? mis.pedir : '';
  $('.credito').innerHTML = enMisterio && conCredito(mis) ? `${esc(mis.autor)}, <em>${esc(mis.obra)}</em>` : '';

  const tira = $('.tira');
  tira.style.display = p.tira ? '' : 'none';
  if (p.tira) dibujarTira(tira, p.tira.n, p.tira.i);

  r.classList.toggle('sin-texto', p.t === 'oracion' && !textosEnteros() && !SIEMPRE_ENTERAS.includes(p.o));
  if (p.t === 'oracion') {
    // A dos voces se separa lo que reza cada uno. Solo o escuchando, la oración va entera.
    const t = textos(p), separar = cfg.forma === 'guia';
    const entera = separar ? t.todos : [t.guia, t.todos].filter(Boolean).join(' ');
    const todos = $('.todos');
    $('.guia').textContent = separar ? t.guia : '';
    if (cfg.forma === 'todo') todos.innerHTML = partesDe(p).map(x => partir(x.texto).map(f => `<span>${esc(f)}</span>`).join('')).join(' ');
    else todos.textContent = entera;
    todos.classList.remove('sonando');
    todos.classList.toggle('largo', entera.length > 230);
  }
  const acc = $('.acciones');
  if (p.t === 'anuncio') acc.innerHTML = '<button class="btn principal" data-accion="seguir" style="justify-content:center">Empezar</button>';
  else if (p.t === 'vida') {
    $('.vida-q').textContent = mis.vida;
    const siguiente = !p.ultimo ? 'Siguiente misterio' : (ses.modo === 'entero' ? 'Rezar la Salve' : 'Terminar');
    acc.innerHTML = `<button class="btn principal" data-accion="seguir" style="justify-content:center">${siguiente}</button>` +
      (!p.ultimo ? '<button class="enlace" data-accion="terminar">Terminar acá</button>' : '');
  } else acc.innerHTML = '';
  ponerEtiqueta(p);
  // Para el lector de pantalla, un aviso corto por paso (no todo el texto de nuevo).
  $('.lector').textContent = p.t === 'oracion' ? p.etq : `${kicker}. ${p.t === 'vida' ? mis.vida : mis.titulo}`;

  // Cinco círculos: uno por misterio del grupo
  const propios = pasos.filter(x => x.m === p.m);
  const avance = enMisterio ? (propios.indexOf(p) + 1) / propios.length : 0;
  app.querySelectorAll('.cinco i').forEach((c, i) => {
    const hecho = ses.modo === 'entero' ? (enMisterio ? i < p.m : alFinal)
      : ses.modo === 'salve' ? rezados(g.id).includes(i)
      : (rezados(g.id).includes(i) && i !== ses.misterio);
    c.className = hecho ? 'hecho' : (enMisterio && i === p.m ? 'ahora' : '');
    if (enMisterio && i === p.m) c.style.setProperty('--p', avance);
  });

  actualizarMapa(p, mis, g);
  guardar('sesion', ses);
  hablar();
}

function avanzar(solo) {
  const { ses, pasos } = S, p = pasos[ses.paso];
  if (p.o === 'gloria' && p.m != null) marcarRezado(ses.grupo, p.m);
  if (ses.paso < pasos.length - 1) { ses.paso++; if (!solo) vibrar(); actualizar(); }
  else terminar();
}
function atras() { if (S.ses.paso > 0) { S.ses.paso--; actualizar(); } }

function terminar() {
  borrar('sesion');
  vistaFin(S.ses);
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
  $('.mapa-t').textContent = p.m != null ? mis.titulo : (p.o === 'salve' ? 'Salve' : 'Las oraciones del comienzo');
  // En la pausa final, la pregunta va abajo del mapa y un toque sigue de largo.
  const vida = p.t === 'vida', aqui = $('.aqui');
  aqui.classList.toggle('es-pregunta', vida);
  if (vida) aqui.innerHTML = `<span class="k">Antes de seguir</span>${esc(mis.vida)}`;
  else aqui.textContent = 'Estás acá: ' + (p.t === 'anuncio' ? 'anuncio del misterio' : p.etq);
  $('.pista').textContent = !vida ? 'Tocá para seguir rezando desde acá'
    : !p.ultimo ? 'Tocá para pasar al siguiente misterio' : ses.modo === 'entero' ? 'Tocá para rezar la Salve' : 'Tocá para terminar';
}

/* ---------- Fin ---------- */
// El cierre: primero el Amén y lo que se pidió, en quietud. Las opciones para seguir
// aparecen unos segundos después (y mientras tanto no se pueden tocar sin querer).
function vistaFin(ses) {
  silencio(); soltarPantalla();
  const g = grupo(ses.grupo), uno = ses.modo === 'uno', salve = ses.modo === 'salve';
  const mis = g.misterios[ses.modo === 'entero' ? 4 : ses.misterio];
  const quedan = 5 - rezados(g.id).length;
  const manana = new Date(Date.now() + 864e5).getDay();
  const hoy = g.id === DEL_DIA[new Date().getDay()], siguiente = g.misterios[proximo(g.id)];
  const fruto = uno ? `<div class="pide"><span class="k">En este misterio pediste</span><span class="fruto">${esc(mis.pedir)}</span></div>` : '';
  let rezaste, detalle = '', botones;
  if (salve) {
    rezaste = 'Terminaste con la Salve, como termina el Rosario.';
    if (quedan === 0) detalle = `Hoy rezaste los cinco misterios ${g.id}: un Rosario entero.`;
    botones = '<button class="btn principal centro" data-accion="inicio">Volver al inicio</button>';
  } else if (uno) {
    rezaste = `Rezaste el ${ORDINAL[ses.misterio]} misterio ${SINGULAR[g.id]}.`;
    if (quedan > 0) {
      botones = `<button class="btn alt" data-accion="mas"><span>Un misterio más<small>${esc(siguiente.titulo)}</small></span><span class="min">4 min</span></button>
        <button class="btn alt centro" data-accion="salve">Rezar la Salve</button>
        <button class="enlace" data-accion="inicio">Volver al inicio</button>`;
    } else {
      detalle = `Con este completaste los cinco misterios ${g.id}${hoy ? ' de hoy' : ''}: un Rosario entero.`;
      botones = '<button class="btn principal centro" data-accion="salve">Rezar la Salve</button><button class="btn alt centro" data-accion="inicio">Volver al inicio</button>';
    }
  } else {
    rezaste = `Rezaste el Rosario entero: los cinco misterios ${g.id}.`;
    detalle = `Mañana, ${DIAS[manana]}, tocan los misterios ${DEL_DIA[manana]}.`;
    botones = '<button class="btn principal centro" data-accion="inicio">Volver al inicio</button>';
  }
  app.innerHTML = `
  <section class="vista fija fin">
    ${heroHTML(mis)}
    <header class="barra"><button class="ic" data-accion="inicio" aria-label="Volver al inicio"><i class="ti ti-x"></i></button><span></span></header>
    <div class="cuerpo">
      <h1 class="t1 amen">Amén</h1>
      <p class="sub">${rezaste}</p>
      ${fruto}
      ${detalle ? `<p class="sub detalle">${detalle}</p>` : ''}
      <div class="salidas">${botones}</div>
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
  { t: 'No hace falta saberse nada', formas: true,
    b: 'La app reza con vos y te muestra cada oración entera. Tocás la pantalla para pasar a la cuenta siguiente, y con el ícono del Rosario ves en qué parte estás. Elegí cómo querés rezar (lo podés cambiar cuando quieras en Ajustes).' },
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
      ${c.formas ? selector('forma') : ''}
      <button class="btn principal" data-accion="${ultimo ? 'primerRezo' : 'pv'}" data-v="${i + 1}" style="justify-content:center">${ultimo ? 'Rezar un misterio' : 'Siguiente'}</button>
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
// Las hojas son diálogos: llevan el foco adentro, se cierran con "Listo", con Esc o tocando
// afuera, y mientras están abiertas lo de atrás queda inactivo.
let abridor = null;
function hoja(titulo, html) {
  cerrarHoja();
  abridor = document.activeElement;
  const v = document.createElement('div');
  v.className = 'velo'; v.dataset.accion = 'cerrar';
  v.innerHTML = `<div class="hoja" data-accion="nada" role="dialog" aria-modal="true" aria-labelledby="hoja-t" tabindex="-1">
    <div class="hoja-cab"><h2 id="hoja-t">${titulo}</h2><button class="listo" data-accion="cerrar">Listo</button></div>${html}</div>`;
  document.body.appendChild(v);
  app.inert = true;
  v.querySelector('.hoja').focus({ preventScroll: true });
}
function cerrarHoja() {
  const v = $('.velo');
  if (!v) return;
  v.remove();
  app.inert = false;
  const volver = abridor && abridor.isConnected ? abridor : $('[data-accion="ajustes"]');
  if (volver) volver.focus({ preventScroll: true });
  abridor = null;
}

function hojaGrupos() {
  const hoy = DEL_DIA[new Date().getDay()];
  hoja('Elegí qué misterios rezar', D.grupos.map(g =>
    `<button class="fila${g.id === grupoInicio ? ' sel' : ''}" data-accion="grupo" data-v="${g.id}"><span><b>${g.nombre}</b><small>${g.dias}</small></span>${g.id === hoy ? '<span class="etiqueta">Hoy</span>' : ''}</button>`).join(''));
}
function descripcion(k) {
  const item = OPCIONES[k].items.find(x => x[0] === valor(k)) || OPCIONES[k].items[0];
  if (k === 'voz') {
    if (cfg.forma === 'solo') return 'Rezando solo no hay voz. Se usa en "A dos voces" y en "Escuchar".';
    if (cfg.forma === 'guia' && cfg.mudo) return 'Ahora la voz está callada. Se vuelve a activar con el parlante, abajo a la derecha, mientras rezás.';
    if (cfg.lengua === 'la' && !voz.latinItaliano()) return 'Tu celular no trae una voz para el latín, así que por ahora lo reza con acento castellano.';
    if (!voz.tiene(cfg.lengua)) return `Tu celular no trae una voz ${cfg.voz} ${cfg.lengua === 'la' ? 'para el latín' : 'en castellano'}, así que por ahora suena la que haya.`;
    return 'Por ahora es la voz del celular. Más adelante va a ser una voz grabada.';
  }
  if (k === 'imagenes' && !hayIlustraciones) return item[2] + ' Las ilustraciones están en preparación.';
  return item[2];
}
function selector(k) {
  const disponible = v => !(k === 'imagenes' && v === 'ilustraciones' && !hayIlustraciones);
  const desc = `<small class="opcion-desc" data-k="${k}">${descripcion(k)}</small>`;
  if (k === 'imagenes') {
    // Vista previa: la misma escena (el nacimiento de Jesús) en cada estilo.
    const nat = grupo('gozosos').misterios[2];
    const fondo = { pinturas: `background-image:url('${nat.imagen}');background-position:${nat.foco}`,
      ilustraciones: nat.ilustracion ? `background-image:url('${nat.ilustracion}')` : '', ninguna: luz('gozosos') };
    return `<div class="muestras" role="radiogroup" aria-label="${OPCIONES.imagenes.titulo}">${OPCIONES.imagenes.items.map(([v, t]) =>
      `<button class="muestra${cfg.imagenes === v ? ' sel' : ''}" role="radio" aria-checked="${cfg.imagenes === v}" data-accion="opcion" data-k="imagenes" data-v="${v}"${disponible(v) ? '' : ' disabled'}><span style="${fondo[v]}"></span>${t}</button>`).join('')}</div>${desc}`;
  }
  return `<div class="segmentos" role="radiogroup" aria-label="${OPCIONES[k].titulo}">${OPCIONES[k].items.map(([v, t]) =>
    `<button class="${valor(k) === v ? 'sel' : ''}" role="radio" aria-checked="${valor(k) === v}" data-accion="opcion" data-k="${k}" data-v="${v}"${disponible(v) ? '' : ' disabled'}>${t}</button>`).join('')}</div>${desc}`;
}
function hojaAjustes() {
  const bloque = k => `<div class="ajuste"><b>${OPCIONES[k].titulo}</b>${selector(k)}</div>`;
  const sw = (k, t, d) => `<button class="fila" data-accion="alternar" data-v="${k}" role="switch" aria-checked="${cfg[k]}"><span><b>${t}</b><small>${d}</small></span><span class="interruptor${cfg[k] ? ' on' : ''}"></span></button>`;
  hoja('Ajustes', `
    ${['forma', 'voz', 'lengua', 'textos', 'imagenes', 'modo'].map(bloque).join('')}
    ${sw('ohJesus', 'Oh Jesús mío', 'Después de cada Gloria')}
    ${sw('vida', 'Pregunta para tu vida', 'Al terminar cada misterio')}`);
}
// Una muestra corta para escuchar la voz (y, en el iPhone, habilitarla con este toque).
function muestra() {
  if (cfg.forma === 'solo') return voz.callar();
  voz.decir([cfg.lengua === 'la' ? 'Ave Maria, gratia plena, Dominus tecum.' : 'Dios te salve, María, llena eres de gracia.'], {}, cfg.lengua);
}

/* ---------- Acciones ---------- */
const acciones = {
  uno: () => iniciar('uno', grupoInicio, proximo(grupoInicio)),
  entero: () => iniciar('entero', grupoInicio, 0),
  retomar: () => { const s = leer('sesion', null); if (s) { grupoInicio = s.grupo; abrirSesion(s); } },
  mas: () => { const gid = S.ses.grupo; abrirSesion({ fecha: hoyISO(), modo: 'uno', grupo: gid, misterio: proximo(gid), paso: 0, seguido: true }); },
  salve: () => abrirSesion({ fecha: hoyISO(), modo: 'salve', grupo: S.ses.grupo, misterio: S.ses.misterio, paso: 0 }),
  seguir: () => avanzar(),
  terminar: () => terminar(),
  atras: () => atras(),
  salir: () => vistaInicio(),
  inicio: () => vistaInicio(),
  mapa: () => { const r = $('.rezo'); const m = r.classList.toggle('con-mapa'); $('.mapa').setAttribute('aria-hidden', !m); $('.cuerpo').inert = m; },
  primera: () => vistaPrimera(0),
  pv: b => vistaPrimera(+b.dataset.v),
  // Quien entra por "Es mi primera vez" reza con las oraciones enteras a la vista.
  primerRezo: () => { cfg.textos = 'completas'; guardar('ajustes', cfg); acciones.uno(); },
  acerca: () => vistaAcerca(),
  grupos: () => hojaGrupos(),
  grupo: b => { grupoInicio = b.dataset.v; cerrarHoja(); vistaInicio(); },
  ajustes: () => hojaAjustes(),
  opcion: b => {
    const k = b.dataset.k; cfg[k] = b.dataset.v;
    // Elegir una forma con voz es querer escucharla: se destraba el parlante.
    if (k === 'forma' && cfg.forma !== 'solo') cfg.mudo = false;
    guardar('ajustes', cfg);
    // Cambiar la lengua puede cambiar el texto que se ve (en latín, enteras): se repintan los dos.
    document.querySelectorAll(`[data-accion="opcion"][data-k="${k}"], [data-accion="opcion"][data-k="textos"]`).forEach(x => {
      const sel = x.dataset.v === valor(x.dataset.k);
      x.classList.toggle('sel', sel); x.setAttribute('aria-checked', sel);
    });
    document.querySelectorAll('.opcion-desc').forEach(x => { x.textContent = descripcion(x.dataset.k); });
    if (k === 'modo') aplicarTema();
    if (k === 'imagenes' && $('.inicio')) vistaInicio();
    if (k === 'forma' || k === 'voz' || k === 'lengua') muestra();
  },
  pausa: () => ponerPausa(!pausa),
  voz: b => { cfg.mudo = !cfg.mudo; guardar('ajustes', cfg); pintarVoz(b); if (cfg.mudo) silencio(); else hablar(); },
  alternar: b => {
    const k = b.dataset.v; cfg[k] = !cfg[k]; guardar('ajustes', cfg);
    b.setAttribute('aria-checked', cfg[k]); b.querySelector('.interruptor').classList.toggle('on', cfg[k]);
  },
  cerrar: () => cerrarHoja(),
  nada: () => {},
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-accion]');
  if (b) { acciones[b.dataset.accion](b); return; }
  // En la pantalla de rezo, un toque en cualquier parte pasa a la cuenta siguiente.
  if (S && S.pasos.length && e.target.closest('.rezo')) {
    if (S.pasos[S.ses.paso].t === 'vida' && !e.target.closest('.con-mapa')) return;
    avanzar();
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('.velo')) return cerrarHoja();
  if (!S || !S.pasos.length || !$('.rezo') || $('.velo')) return;
  // Con un botón enfocado, la barra espaciadora lo aprieta a él (no pasa la cuenta dos veces).
  if (e.key === ' ' && e.target.closest('button')) return;
  if (e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); if (S.pasos[S.ses.paso].t !== 'vida' || $('.con-mapa')) avanzar(); }
  if (e.key === 'ArrowLeft') atras();
});

vistaInicio();
})();
