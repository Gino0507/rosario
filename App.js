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

// Íconos de Tabler (licencia MIT), guardados como dibujo adentro de la app: pesan casi nada
// y funcionan sin conexión. Para sumar uno: copiar sus trazos de tabler.io/icons (versión "outline").
const ICONOS = {
  'adjustments-horizontal': '<path d="M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M4 6l8 0"/><path d="M16 6l4 0"/><path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M4 12l2 0"/><path d="M10 12l10 0"/><path d="M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M4 18l11 0"/><path d="M19 18l1 0"/>',
  'arrow-back-up': '<path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/>',
  'arrow-left': '<path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/>',
  'book-2': '<path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z"/><path d="M19 16h-12a2 2 0 0 0 -2 2"/><path d="M9 8h6"/>',
  'chevron-down': '<path d="M6 9l6 6l6 -6"/>',
  'chevron-up': '<path d="M6 15l6 -6l6 6"/>',
  'photo': '<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>',
  'player-pause': '<path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"/><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"/>',
  'player-play': '<path d="M7 4v16l13 -8z"/>',
  'sparkles': '<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"/>',
  'volume': '<path d="M15 8a5 5 0 0 1 0 8"/><path d="M17.7 5a9 9 0 0 1 0 14"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/>',
  'volume-off': '<path d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5 5 0 0 1 -.535 .464"/><path d="M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9 9 0 0 1 -.686 .615"/><path d="M9.069 5.054l.431 -.554a.8 .8 0 0 1 1.5 .5v2m0 4v8a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664"/><path d="M3 3l18 18"/>',
  'x': '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
};
const icono = (n, clase = '') => `<svg class="ico ${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n]}</svg>`;

const ICONO_ROSARIO = '<svg class="g-ros" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8.5" r="6" stroke-width="2.4" stroke-dasharray="0.01 2.75"/><path d="M12 15.2v2.3M12 18.6v4M10.2 20.2h3.6" stroke-width="1.6"/></svg>' + icono('photo', 'g-arte');

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
const cfg = Object.assign({ modo: 'auto', ohJesus: true, vida: true, forma: 'guia', voz: 'Isabela', lengua: 'es', imagenes: 'ilustraciones', mudo: false, textos: 'auto', letra: 'normal' }, leer('ajustes', {}));

// Formas de rezar (ver Decisiones.md, 6 de octubre)
const FORMAS = [
  ['solo', 'Solo', 'Rezás a tu ritmo, sin voz. Cada oración aparece entera.'],
  ['guia', 'A dos voces', 'Una voz guía y vos respondés, como cuando se reza en grupo. Tu parte va en letra grande.'],
  ['todo', 'Escuchar', 'Una voz reza todo y la app avanza sola. La acompañás en voz alta o en silencio.'],
];
// Las voces grabadas que eligió José (ver Decisiones.md, 8 de octubre): [nombre, descripción, género].
const VOCES = [
  ['Isabela', 'Cálida y serena.', 'femenina'],
  ['Nieve', 'Con la calma de una abuela.', 'femenina'],
  ['Amanda', 'Joven y cercana.', 'femenina'],
  ['Juan', 'Grave y envolvente.', 'masculina'],
  ['Edoardo', 'Grave y firme, de ritmo más ágil.', 'masculina'],
  ['Pablo', 'Cordobés, de voz grave.', 'masculina'],
  ['Octavio', 'Natural y serena.', 'masculina'],
];
// Antes se elegía "femenina" o "masculina"; ahora, una voz por su nombre. Fran se reemplazó por Edoardo.
if (!VOCES.some(v => v[0] === cfg.voz)) cfg.voz = { masculina: 'Juan', Fran: 'Edoardo' }[cfg.voz] || 'Isabela';
// El género de la voz elegida, para la voz del celular cuando falta un audio.
const generoVoz = () => (VOCES.find(v => v[0] === cfg.voz) || VOCES[0])[2];
// Opciones de Ajustes: [valor, etiqueta, descripción]
const OPCIONES = {
  forma: { titulo: 'Forma de rezar', items: FORMAS },
  voz: { titulo: 'Voz', items: VOCES.map(([n, d]) => [n, n, d]) },
  lengua: { titulo: 'Oraciones en', items: [
    ['es', 'Castellano', 'Las oraciones como se rezan en la Argentina.'],
    ['la', 'Latín', 'Las oraciones en latín, como se rezaron durante siglos. Anuncios, escenas y preguntas siguen en castellano.']] },
  textos: { titulo: 'Texto de las oraciones', items: [
    ['nombre', 'Solo el nombre', 'Solo el nombre de cada oración, para dejarle lugar a la pintura. El Credo y la Salve se ven siempre enteros.'],
    ['completas', 'Completas', 'Cada oración entera en pantalla, para leerla mientras rezás.']] },
  letra: { titulo: 'Tamaño de letra', items: [
    ['normal', 'Normal', 'La letra como viene.'],
    ['grande', 'Grande', 'Un poco más grande, para leer más cómodo.'],
    ['mayor', 'Muy grande', 'Bien grande. Si una oración larga no entra, se desplaza para leerla entera.']] },
  imagenes: { titulo: 'Imágenes', items: [
    ['pinturas', 'Pinturas', 'Obras de grandes maestros que muestran cada escena.'],
    ['ilustraciones', 'Ilustraciones', 'Ilustraciones de hoy, más simples y serenas.'],
    ['ninguna', 'Sin imágenes', 'Solo luz y color, para rezar sin nada que mirar.']] },
  modo: { titulo: 'Modo', items: [
    ['auto', 'Automático', 'Como esté el celular: si está en modo oscuro, la app también.'],
    ['dia', 'Claro', 'Fondo claro, para rezar de día o con mucha luz.'],
    ['noche', 'Oscuro', 'Fondo oscuro, para rezar de noche o con poca luz.']] },
};
const hayIlustraciones = D.grupos.some(g => g.misterios.some(m => m.ilustracion));
const oraciones = () => cfg.lengua === 'la' ? D.latin : D.oraciones;
// Texto de las oraciones (ver Decisiones.md, 7 de octubre): mientras no se elija, en castellano
// se ve solo el nombre (casi todos las saben) y en latín, enteras.
const textosEnteros = () => (cfg.textos === 'auto' ? (cfg.lengua === 'la' ? 'completas' : 'nombre') : cfg.textos) === 'completas';
const valor = k => k === 'textos' ? (textosEnteros() ? 'completas' : 'nombre') : cfg[k];
const SIEMPRE_ENTERAS = ['credo', 'salve'];
let grupoInicio = DEL_DIA[new Date().getDay()];

// Si este celular ya rezó alguna vez, el inicio es el de siempre; si no, la acción principal
// es "Es mi primera vez". Queda guardado en el celular: las actualizaciones de la app no lo borran.
// Quien rezó antes de que existiera esta marca tiene guardados sus misterios rezados o un rezo a medias.
function yaReza() {
  if (leer('yaReza', false)) return true;
  try {
    for (let i = 0; i < localStorage.length; i++)
      if (/^rosario\.(rezados\.|sesion$)/.test(localStorage.key(i))) { guardar('yaReza', true); return true; }
  } catch (e) {}
  return false;
}

const grupo = id => D.grupos.find(g => g.id === id);
const rezados = id => leer('rezados.' + hoyISO() + '.' + id, []);
function marcarRezado(id, m) { const r = rezados(id); if (!r.includes(m)) { r.push(m); guardar('rezados.' + hoyISO() + '.' + id, r); } }
function proximo(id) { const r = rezados(id); for (let i = 0; i < 5; i++) if (!r.includes(i)) return i; return 0; }

/* ---------- Tamaño de letra ---------- */
// Todos los tamaños de letra de Estilos.css se multiplican por --letra (los íconos no).
const LETRA = { normal: 1, grande: 1.15, mayor: 1.3 };
function aplicarLetra() { document.documentElement.style.setProperty('--letra', LETRA[cfg.letra] || 1); }
aplicarLetra();

/* ---------- Tema ---------- */
// Automático sigue al celular (ver Decisiones.md, 8 de octubre), y cambia en el momento si el celular cambia.
const oscuroCelular = matchMedia('(prefers-color-scheme: dark)');
function aplicarTema() {
  const noche = cfg.modo === 'noche' || (cfg.modo === 'auto' && oscuroCelular.matches);
  document.body.className = noche ? 'noche' : 'dia';
  $('meta[name="theme-color"]').setAttribute('content', noche ? '#0d1120' : '#f6f6f4');
}
oscuroCelular.addEventListener('change', aplicarTema);

/* ---------- Pantalla encendida mientras se reza ---------- */
let bloqueo = null;
async function mantenerEncendida() { try { if ('wakeLock' in navigator) bloqueo = await navigator.wakeLock.request('screen'); } catch (e) {} }
function soltarPantalla() { try { bloqueo && bloqueo.release(); } catch (e) {} bloqueo = null; }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S && $('.rezo')) mantenerEncendida(); });

/* ---------- Respuesta al pasar una cuenta ---------- */
// Safari en el iPhone no tiene navigator.vibrate. Desde iOS 18, tocar un interruptor nativo
// (<input switch>) da un toque háptico: se toca uno invisible, fuera de la pantalla de rezo.
const tactil = matchMedia('(pointer: coarse)');
function vibrar() {
  try {
    if (navigator.vibrate) return navigator.vibrate(10);
    if (!tactil.matches) return;
    const l = document.createElement('label'), i = document.createElement('input');
    i.type = 'checkbox'; i.setAttribute('switch', '');
    l.setAttribute('aria-hidden', 'true'); l.style.display = 'none';
    l.appendChild(i); document.head.appendChild(l); l.click(); l.remove();
  } catch (e) {}
}
// Un texto nuevo aparece con un fundido; si no cambió, queda quieto.
function fundir(el) { if (el.animate && el.textContent) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'ease-out' }); }
function ponerTexto(el, t) { if (el.textContent !== t) { el.textContent = t; fundir(el); } }
// Fundido entre pantallas (View Transitions). Donde no existe, el cambio es directo. Si el
// navegador lo saltea (por ejemplo, con la pantalla oculta), el cambio igual se hace.
function transicion(fn) {
  if (!document.startViewTransition) return fn();
  document.startViewTransition(fn).ready.catch(() => {});
}

/* ---------- Voz ---------- */
// La voz grabada con ElevenLabs (ver App/Voz.md): un audio por parte de oración, anuncio o
// pregunta, con el momento en que empieza cada frase para resaltar la que se dice. Los audios
// los arma Generar audios.py y se buscan por el texto exacto: si a un texto le falta su audio
// (el latín, por ahora, o una oración corregida que todavía no se volvió a grabar), habla la
// voz del celular, como antes.
// partes: los textos a decir, en orden. al: { trozo(i), fin(), falla(), luego, silencio(s) },
// donde luego son los segundos de silencio antes de fin() y silencio(s) avisa que empezaron.
const voz = (() => {
  const A = window.AUDIOS || { textos: {}, tiempos: {} };
  const sintesis = window.speechSynthesis;
  let turno = 0, reloj = null, cuadro = 0, grabada = false;

  /* La voz del celular, de respaldo */
  const RARAS = /eddy|flo|grand|reed|rocko|sandy|shelley|bahh|bells|boing|bubbles|cellos|wobble|news|jester|organ|superstar|trinoids|whisper|zarvox|albert|fred|junior|kathy|ralph/i;
  // Acento: rioplatense primero. Para el latín, una voz italiana, que es la
  // pronunciación más cercana al latín de la Iglesia.
  const ORDEN = { es: ['es-ar', 'es-419', 'es-us', 'es-mx', 'es-co', 'es-cl', 'es-es'], it: ['it-it'] };
  // La API no dice si una voz es de varón o de mujer: se deduce por el nombre.
  const VARONES = /\b(jorge|juan|diego|carlos|pablo|ra[uú]l|[aá]lvaro|tom[aá]s|gonzalo|enrique|andr[eé]s|luca|cosimo|giuseppe|benigno|rinaldo)\b/i;
  const MUJERES = /\b(m[oó]nica|paulina|ang[eé]lica|isabela|isabella|marisol|soledad|francisca|helena|laura|sabina|elvira|dalia|elena|alice|federica|paola|elsa|emma|google)\b/i;
  const genero = v => VARONES.test(v.name) ? 'masculina' : MUJERES.test(v.name) ? 'femenina' : '';
  const candidatas = idioma => sintesis ? sintesis.getVoices().filter(v => v.lang.toLowerCase().startsWith(idioma) && !RARAS.test(v.name)) : [];
  const latinItaliano = () => candidatas('it').length > 0;
  function elegir(lengua) {
    const idioma = lengua === 'la' && latinItaliano() ? 'it' : 'es', orden = ORDEN[idioma], quiero = generoVoz();
    const nota = v => {
      const g = genero(v), i = orden.indexOf(v.lang.replace('_', '-').toLowerCase());
      return (g === quiero ? 0 : g ? 20 : 10) + (i < 0 ? orden.length : i);
    };
    return candidatas(idioma).sort((a, b) => nota(a) - nota(b))[0] || null;
  }
  function celular(trozos, al, lengua, yo) {
    if (!sintesis || !trozos.length) return;
    const elegida = elegir(lengua);
    const vivas = trozos.map((t, i) => {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = elegida ? elegida.lang : 'es-AR';
      if (elegida) u.voice = elegida;
      u.rate = .92;
      u.onstart = () => { if (yo === turno && al.trozo) al.trozo(i); };
      u.onerror = () => { if (yo === turno && al.falla) al.falla(); };
      if (i === trozos.length - 1) u.onend = () => { if (yo === turno) { clearTimeout(reloj); despues(al, yo); } };
      return u;
    });
    vivas.forEach(u => sintesis.speak(u));
    // Seguro: si la voz del celular se traba y no avisa que terminó, se sigue igual.
    // Con la pantalla oculta no se hace nada, para no avanzar a escondidas.
    const limite = 4000 + trozos.join('').length * 150;
    const vigilar = () => {
      if (yo !== turno) return;
      if (document.visibilityState !== 'visible') { reloj = setTimeout(vigilar, 2000); return; }
      sintesis.cancel(); despues(al, yo);
    };
    reloj = setTimeout(vigilar, limite);
  }

  /* La voz grabada */
  const audio = new Audio();
  audio.preload = 'auto';
  // Que suene aunque el iPhone esté en silencio.
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  // Silencio de los segundos que se pidan, como audio: con la pantalla bloqueada, Safari frena
  // los temporizadores, pero deja seguir un audio que suena.
  const silencios = {};
  function silencioDe(seg) {
    if (silencios[seg]) return silencios[seg];
    const hz = 8000, n = Math.round(hz * seg), b = new DataView(new ArrayBuffer(44 + n));
    const txt = (o, s) => [...s].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
    txt(0, 'RIFF'); b.setUint32(4, 36 + n, true); txt(8, 'WAVEfmt '); b.setUint32(16, 16, true);
    b.setUint16(20, 1, true); b.setUint16(22, 1, true); b.setUint32(24, hz, true); b.setUint32(28, hz, true);
    b.setUint16(32, 1, true); b.setUint16(34, 8, true); txt(36, 'data'); b.setUint32(40, n, true);
    for (let i = 0; i < n; i++) b.setUint8(44 + i, 128);
    return (silencios[seg] = URL.createObjectURL(new Blob([b], { type: 'audio/wav' })));
  }
  // En el iPhone, un audio solo puede empezar solo si antes sonó con un toque. El primer toque
  // en la app lo despierta con un instante de silencio, y desde ahí puede seguir solo, también
  // con la pantalla bloqueada.
  let despierto = false;
  document.addEventListener('click', () => {
    if (despierto) return;
    despierto = true;
    audio.src = silencioDe(.1);
    audio.play().catch(e => { if (e.name === 'NotAllowedError') despierto = false; });
  }, true);
  // Si algo de afuera corta el audio (una llamada, otra app), se sabe que ya no suena. Si ya
  // empezó otro audio (paused vuelve a ser false), la pausa era del anterior y no cuenta.
  audio.addEventListener('pause', () => { if (!audio.ended && audio.paused) grabada = false; });

  // Las tomas de un mismo texto se van turnando, para que no suene a disco rayado.
  const tomas = {};
  const urlDe = (archivo, t) => `Audio/${cfg.voz}/${archivo}.mp3?${t.h}`;
  function pista(texto, avanzar) {
    const archivos = A.textos[texto], tiempos = A.tiempos[cfg.voz];
    if (!archivos || !tiempos) return null;
    const n = tomas[texto] || 0, archivo = archivos[n % archivos.length], t = tiempos[archivo];
    if (!t) return null;
    if (avanzar) tomas[texto] = n + 1;
    const url = urlDe(archivo, t);
    return { url: enMemoria.get(url) || url, f: t.f };
  }
  // Los audios del rezo se bajan de antemano y quedan en memoria: así cada oración empieza
  // enseguida. Pedirlos a la red en cada toque tardaba medio segundo o más (8 de octubre).
  const enMemoria = new Map(); // url → blob:, cuando ya bajó
  const pedidos = new Set();
  let fila = [], bajando = 0;
  function bajar() {
    while (bajando < 2 && fila.length) {
      const url = fila.shift();
      if (pedidos.has(url)) continue;
      pedidos.add(url); bajando++;
      fetch(url).then(r => r.ok ? r.blob() : Promise.reject())
        .then(b => enMemoria.set(url, URL.createObjectURL(b)))
        .catch(() => pedidos.delete(url))
        .finally(() => { bajando--; bajar(); });
    }
  }
  // textos: lo que se va a decir, en el orden en que se dice (con todas sus tomas). Con primero,
  // pasan adelante de lo que ya estaba esperando.
  function precargar(textos, primero) {
    const tiempos = A.tiempos[cfg.voz];
    if (!tiempos) return;
    const urls = textos.flatMap(t => (A.textos[t] || []).filter(a => tiempos[a]).map(a => urlDe(a, tiempos[a])))
      .filter(u => !pedidos.has(u));
    fila = primero ? [...new Set([...urls, ...fila])] : [...new Set([...fila, ...urls])];
    bajar();
  }
  const preparar = partes => precargar(partes, true);
  function grabadas(partes, al, yo) {
    const pistas = partes.map(t => pista(t, false));
    if (pistas.some(p => !p)) return false;
    partes.forEach(t => pista(t, true));
    let i = 0, base = 0, actual = -1;
    grabada = true;
    // Resalta la frase que se está diciendo (solo se nota con la pantalla a la vista).
    const marcar = () => {
      if (yo !== turno) return;
      const f = pistas[i].f, t = audio.currentTime;
      let j = 0;
      while (j + 1 < f.length && t >= f[j + 1]) j++;
      if (base + j !== actual) { actual = base + j; if (al.trozo) al.trozo(actual); }
      cuadro = requestAnimationFrame(marcar);
    };
    const tocar = () => {
      if (yo !== turno) return;
      if (i >= pistas.length) { grabada = false; return despues(al, yo); }
      audio.onended = () => { cancelAnimationFrame(cuadro); base += pistas[i].f.length; i++; tocar(); };
      // Si un audio no carga (sin conexión, por ejemplo), sigue la voz del celular desde ahí.
      audio.onerror = () => {
        if (yo !== turno) return;
        cancelAnimationFrame(cuadro); grabada = false;
        const desde = base;
        celular(partes.slice(i).flatMap(partir), { ...al, trozo: k => al.trozo && al.trozo(desde + k) }, 'es', yo);
      };
      audio.src = pistas[i].url;
      audio.play().then(() => { if (yo === turno) marcar(); }).catch(e => {
        if (yo !== turno || e.name === 'AbortError') return;
        grabada = false;
        if (al.falla) al.falla();
      });
    };
    tocar();
    return true;
  }
  // Lo que viene después de decir todo: el silencio pedido (como audio, si se puede) y fin().
  function despues(al, yo) {
    const s = al.luego || 0, fin = () => { if (yo === turno) { grabada = false; if (al.fin) al.fin(); } };
    if (!s) return fin();
    if (al.silencio) al.silencio(s);
    if (!despierto) { reloj = setTimeout(fin, s * 1000); return; }
    grabada = true;
    audio.onended = fin;
    audio.onerror = () => { reloj = setTimeout(fin, s * 1000); };
    audio.src = silencioDe(s);
    audio.play().catch(e => { if (e.name !== 'AbortError') reloj = setTimeout(fin, s * 1000); });
  }

  function callar() {
    turno++; clearTimeout(reloj); cancelAnimationFrame(cuadro); grabada = false;
    audio.onended = audio.onerror = null;
    if (!audio.paused) audio.pause();
    if (sintesis) sintesis.cancel();
  }
  function decir(partes, al = {}, lengua = 'es') {
    callar();
    if (!partes.length) return;
    const yo = turno;
    if (!grabadas(partes, al, yo)) celular(partes.flatMap(partir), al, lengua, yo);
  }
  const hablando = () => grabada || (!!sintesis && sintesis.speaking);
  return { decir, callar, preparar, precargar, latinItaliano, hablando };
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
// La imagen que corresponde a cada misterio según el estilo elegido (sin imágenes: ninguna).
function urlArte(mis) {
  if (cfg.imagenes === 'ninguna') return null;
  return cfg.imagenes === 'ilustraciones' && mis.ilustracion ? mis.ilustracion : mis.imagen;
}
// La imagen del misterio siguiente se baja de antemano, para que el fundido no empiece antes de que llegue.
const precargadas = new Set();
function precargar(mis) {
  const u = mis && urlArte(mis);
  if (!u || precargadas.has(u)) return;
  precargadas.add(u);
  new Image().src = u;
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
  const acerca = `<button class="mini" data-accion="acerca">${icono('book-2')}Acerca del Rosario</button>`;
  let opciones;
  if (!yaReza()) {
    // La primera vez en este celular: lo principal es que te acompañen.
    opciones = `
      <button class="btn principal primera" data-accion="primera"><span>Es mi primera vez<small>Te acompañamos cuenta por cuenta</small></span></button>
      <button class="btn alt centro" data-accion="yaSe">Ya sé rezarlo</button>
      <button class="enlace solo-acerca" data-accion="acerca">${icono('book-2')}Acerca del Rosario</button>`;
  } else {
    // Con un rezo a medias, lo principal es retomarlo, y se dice dónde.
    const ses = leer('sesion', null);
    let retomar = '';
    if (ses && ses.fecha === hoyISO() && ses.modo !== 'salve' && ses.paso > 0) {
      const pasos = construirPasos(ses), i = Math.min(ses.paso, pasos.length - 1), p = pasos[i];
      const donde = p.m != null ? `${cap(ORDINAL[p.m])} misterio ${SINGULAR[ses.grupo]}: ${grupo(ses.grupo).misterios[p.m].titulo}`
        : p.o === 'salve' ? 'La Salve, para terminar' : 'Las oraciones del comienzo';
      const faltan = Math.max(1, Math.round((ses.modo === 'entero' ? 20 : 4) * (pasos.length - i) / pasos.length));
      retomar = `<button class="btn principal" data-accion="retomar"><span>Retomar<small>${esc(donde)}</small></span><span class="min">${faltan} min</span></button>`;
    }
    opciones = `
      ${retomar || '<div class="pregunta">¿Cuánto tiempo tenés hoy?</div>'}
      <button class="btn ${retomar ? 'alt' : 'principal'}" data-accion="uno"><span>Un misterio<small>${esc(mis.titulo)}</small></span><span class="min">4 min</span></button>
      <button class="btn alt" data-accion="entero"><span>El Rosario entero</span><span class="min">20 min</span></button>
      <div class="accesos">
        <button class="mini" data-accion="primera">${icono('sparkles')}Es mi primera vez</button>
        ${acerca}
      </div>`;
  }
  app.innerHTML = `
  <section class="vista inicio">
    ${heroHTML(mis)}
    <header class="barra"><span></span><button class="ic" data-accion="ajustes" aria-label="Ajustes">${icono('adjustments-horizontal')}</button></header>
    <div class="cuerpo">
      <div class="k lift">${cap(DIAS[hoy.getDay()])} ${hoy.getDate()} de ${MESES[hoy.getMonth()]}</div>
      <h1 class="t1 grupo-t"><button class="grupo-sel" data-accion="grupos">${g.nombre}${icono('chevron-down')}<span class="lector">. Elegir otros misterios</span></button></h1>
      <p class="sub lift">${esc(g.subtitulo)}</p>
      ${opciones}
    </div>
  </section>`;
}

/* ---------- Pasos de un rezo ---------- */
// pos: lugar en el mapa. cruz, p1 (primera cuenta grande), t0-t2 (tres cuentas),
// c0 (hilo antes de la medalla), p2 (cuenta junto a la medalla), L0-L53 (vuelta),
// h0-h4 (hilo después de cada decena), med (medalla).
function cuentaGrande(m) { return m === 0 ? 'p2' : 'L' + ((m - 1) * 11 + 10); }
const NOTA_SALVE = 'Saludamos a María, nuestra Madre.';
// La primera vez que aparecen en cada rezo, el Gloria y el Oh Jesús mío llevan una línea que los
// explica (en lugar de la frase para mirar). Borrador para Pablo.
const NOTA_PRIMERA = {
  gloria: 'Alabamos a Dios, que es Padre, Hijo y Espíritu Santo.',
  ohjesus: 'La pidió la Virgen en Fátima, en 1917: pedimos perdón y el cielo para todos.',
};

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
  Object.keys(NOTA_PRIMERA).forEach(o => { const x = P.find(q => q.o === o); if (x) x.nota = NOTA_PRIMERA[o]; });
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

// Lo que dice la voz en cada paso: los textos, tal como están grabados (un audio por texto).
// A dos voces, solo la parte de quien guía (las oraciones que se rezan todos juntos, como el
// Credo, las reza con vos), y la pregunta para tu vida no se lee: es para pensarla en silencio.
// Anuncios y preguntas van siempre en castellano; las oraciones, en la lengua elegida.
// El anuncio tiene que coincidir con el que graba Generar audios.py.
function locucion(p, g) {
  if (p.t === 'anuncio') { const mis = g.misterios[p.m]; return { lengua: 'es', partes: [`${cap(ORDINAL[p.m])} misterio ${SINGULAR[g.id]}. ${mis.titulo}. En este misterio pedimos ${mis.pedir}.`] }; }
  if (p.t === 'vida') return { lengua: 'es', partes: cfg.forma === 'todo' ? [g.misterios[p.m].vida] : [] };
  const partes = partesDe(p), guia = partes.filter(x => x.quien === 'guia');
  return { lengua: cfg.lengua, partes: (cfg.forma === 'guia' && guia.length ? guia : partes).map(x => x.texto) };
}

function fraseMirar(mis, p) {
  const n = mis.mirar.length;
  return mis.mirar[Math.min(n - 1, Math.floor(p.k * n / 11))];
}

/* ---------- Rezo ---------- */
let S = null; // { ses, pasos }
let pausa = false, sonando = false;

function silencio() {
  voz.callar(); sonando = false;
  const b = $('.esperando');
  if (b) b.classList.remove('esperando');
}

function hablar() {
  silencio();
  if (cfg.forma === 'solo' || pausa || (cfg.forma === 'guia' && cfg.mudo)) return;
  const { ses, pasos } = S, p = pasos[ses.paso], todos = $('.todos'), g = grupo(ses.grupo);
  const { partes, lengua } = locucion(p, g);
  if (!partes.length) return;
  const marcas = cfg.forma === 'todo' && p.t === 'oracion' ? todos.querySelectorAll('span') : [];
  sonando = true;
  ponerMedios(p, g);
  const escuchar = cfg.forma === 'todo';
  voz.decir(partes, {
    // Escuchando, la app sigue sola: un respiro después de cada oración, uno más largo después
    // del anuncio, y ocho segundos de silencio después de la pregunta para tu vida.
    luego: !escuchar ? 0 : p.t === 'vida' ? 8 : p.t === 'anuncio' ? 1.5 : .7,
    trozo: i => { todos.classList.toggle('sonando', marcas.length > 0); marcas.forEach((s, j) => s.classList.toggle('ahora', j === i)); },
    // Para que se vea que el rezo sigue y no que se cortó: el botón se va llenando mientras dura
    // el silencio, y una línea lo dice.
    silencio: s => {
      if (p.t !== 'vida') return;
      const b = $('.es-vida .acciones .principal');
      if (b) { b.style.setProperty('--espera', s + 's'); b.classList.add('esperando'); }
      $('.pista-rezo').textContent = 'Un momento en silencio, y el rezo sigue solo.';
    },
    fin: () => {
      sonando = false; todos.classList.remove('sonando');
      if (escuchar) avanzar(true);
    },
    falla: () => {
      sonando = false; todos.classList.remove('sonando');
      if (!escuchar) return;
      // Escuchando, la app queda en pausa y dice por qué (antes se detenía sin avisar).
      ponerPausa(true);
      const aviso = 'Se cortó la voz. Para que siga, tocá el botón de abajo a la derecha, o tocá la pantalla para seguir sin voz.';
      $('.pista-rezo').textContent = aviso; $('.lector').textContent = aviso;
    },
  }, lengua);
  // Lo que se dice en el paso siguiente se baja de antemano.
  if (pasos[ses.paso + 1]) voz.preparar(locucion(pasos[ses.paso + 1], g).partes);
}

// Todo lo que va a decir la voz en este rezo, desde donde se está, se baja de antemano.
function precargarRezo() {
  if (!S || cfg.forma === 'solo') return;
  const g = grupo(S.ses.grupo);
  voz.precargar(S.pasos.slice(S.ses.paso).flatMap(p => locucion(p, g).partes));
}

// En la pantalla bloqueada se ve qué se está rezando, con la imagen del misterio. Escuchando,
// desde ahí se pausa y se sigue.
function ponerMedios(p, g) {
  if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
  const { ses } = S, mis = g.misterios[p.m != null ? p.m : ses.modo === 'entero' ? (p.o === 'salve' ? 4 : 0) : ses.misterio];
  const titulo = p.t === 'anuncio' ? mis.titulo : p.t === 'vida' ? 'Pregunta para tu vida' : p.etq;
  const escuchar = cfg.forma === 'todo', arte = urlArte(mis);
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: titulo, artist: g.nombre, album: 'Rosario', artwork: arte ? [{ src: new URL(arte, location.href).href }] : [] });
    navigator.mediaSession.setActionHandler('pause', escuchar ? () => ponerPausa(true) : null);
    navigator.mediaSession.setActionHandler('play', escuchar ? () => ponerPausa(false) : null);
  } catch (e) {}
}

function ponerPausa(v) {
  pausa = v;
  const b = $('[data-accion="pausa"]');
  if (b) { b.innerHTML = icono(v ? 'player-play' : 'player-pause'); b.setAttribute('aria-label', v ? 'Seguir con la voz' : 'Pausar la voz'); }
  ponerEtiqueta(S.pasos[S.ses.paso]);
  if (v) silencio(); else hablar();
}

// El parlante del rezo (A dos voces): calla la voz o la vuelve a activar, y se recuerda.
function pintarVoz(b) {
  b.innerHTML = icono(cfg.mudo ? 'volume-off' : 'volume');
  b.setAttribute('aria-label', cfg.mudo ? 'Activar la voz' : 'Callar la voz');
}

// El anuncio ya tiene su botón "Empezar" y la pregunta para tu vida el suyo: ahí no va etiqueta.
function etiqueta(p) {
  if (p.t !== 'oracion') return '';
  return cfg.forma === 'todo' && pausa ? 'En pausa' : p.etq;
}
// La oración se ve entera o solo su nombre según Ajustes (el Credo y la Salve, siempre enteras).
// Tocando el nombre, abajo, se muestra u oculta, y lo elegido vale para todas las oraciones que
// siguen en ese rezo (también al retomarlo o al seguir con "un misterio más"). Se guarda en ses.texto.
function conTexto(p) {
  return S.ses.texto != null ? S.ses.texto : textosEnteros() || SIEMPRE_ENTERAS.includes(p.o);
}
// La etiqueta de abajo es el nombre de la oración y el botón para verla entera. Para pasar a la
// siguiente se toca cualquier otra parte; con VoiceOver o teclado está el botón "Pasar a la siguiente".
function ponerEtiqueta(p) {
  const e = $('.etq'), t = etiqueta(p), visible = p.t === 'oracion' && conTexto(p);
  e.classList.toggle('vacia', !t);
  e.innerHTML = t ? `<span>${esc(t)}${icono(visible ? 'chevron-down' : 'chevron-up')}</span>` : '';
  if (t) { e.setAttribute('aria-label', `${t}. ${visible ? 'Ocultar' : 'Mostrar'} la oración`); e.setAttribute('aria-expanded', visible); }
  else { e.removeAttribute('aria-label'); e.removeAttribute('aria-expanded'); }
  // Las dos primeras oraciones de cada rezo llevan una pista de cómo se usa la pantalla.
  const { ses, pasos } = S, previas = pasos.slice(0, ses.paso).filter(x => x.t === 'oracion').length;
  const ver = `el nombre para ${visible ? 'ocultar' : 'ver'} la oración`;
  $('.pista-rezo').textContent = p.t !== 'oracion' || ses.seguido || ses.modo === 'salve' || previas > 1 ? ''
    : cfg.forma === 'todo' ? `Tocá ${ver}.` : `Tocá la pantalla para seguir, y ${ver}.`;
}
function aplicarTexto(p) {
  $('.rezo').classList.toggle('sin-texto', p.t === 'oracion' && !conTexto(p));
  ponerEtiqueta(p);
}

// Si el celular cortó la voz al bloquearse o al cambiar de app, retoma el paso.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && S && $('.rezo') && sonando && !voz.hablando()) hablar();
});

function iniciar(modo, gid, m) { abrirSesion({ fecha: hoyISO(), modo, grupo: gid, misterio: m || 0, paso: 0 }); }

function abrirSesion(ses) {
  pausa = false;
  guardar('yaReza', true);
  S = { ses, pasos: construirPasos(ses) };
  if (ses.paso >= S.pasos.length) ses.paso = 0;
  precargarRezo();
  montarRezo();
  actualizar();
  mantenerEncendida();
}

function montarRezo() {
  app.innerHTML = `
  <section class="vista fija rezo es-oracion">
    <div class="hero"><div class="arte capa"></div><div class="arte capa"></div><div class="fundido"></div></div>
    <header class="barra">
      <button class="ic" data-accion="salir" aria-label="Salir">${icono('x')}</button>
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
        <button class="ic chico" data-accion="atras" aria-label="Volver a la oración anterior">${icono('arrow-back-up')}</button>
        <button class="etq" data-accion="texto"></button>
        <button class="siguiente" data-accion="seguir">Pasar a la siguiente</button>
        ${cfg.forma === 'todo' ? `<button class="ic chico" data-accion="pausa" aria-label="Pausar la voz">${icono('player-pause')}</button>`
          : cfg.forma === 'guia' ? '<button class="ic chico" data-accion="voz"></button>' : '<span class="ic chico fantasma"></span>'}
      </div>
      <p class="pista-rezo"></p>
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
  // El acercamiento hace una sola pasada: arranca de nuevo con cada imagen que entra.
  otra.style.animation = 'none'; void otra.offsetWidth; otra.style.animation = '';
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
  precargar(g.misterios[(enMisterio ? p.m : ses.modo === 'entero' ? 0 : ses.misterio) + 1]);

  const kicker = p.t === 'vida' ? 'Antes de seguir' : enMisterio ? `${cap(ORDINAL[p.m])} misterio ${SINGULAR[g.id]}` : (alFinal ? 'Para terminar' : 'Para empezar');
  $('.kicker').textContent = kicker;
  $('.titulo').textContent = enMisterio ? mis.titulo : (alFinal ? 'Salve' : g.nombre);
  $('.cita').textContent = enMisterio ? mis.cita : '';
  ponerTexto($('.mira'), p.t === 'oracion' ? (p.nota || (enMisterio ? fraseMirar(mis, p) : '')) : '');
  $('.fruto').textContent = enMisterio ? mis.pedir : '';
  $('.credito').innerHTML = enMisterio && conCredito(mis) ? `${esc(mis.autor)}, <em>${esc(mis.obra)}</em>` : '';

  const tira = $('.tira');
  tira.style.display = p.tira ? '' : 'none';
  if (p.tira) dibujarTira(tira, p.tira.n, p.tira.i);

  r.classList.toggle('sin-texto', p.t === 'oracion' && !conTexto(p));
  if (p.t === 'oracion') {
    // A dos voces se separa lo que reza cada uno. Solo o escuchando, la oración va entera.
    const t = textos(p), separar = cfg.forma === 'guia';
    const entera = separar ? t.todos : [t.guia, t.todos].filter(Boolean).join(' ');
    const todos = $('.todos'), antes = todos.textContent;
    ponerTexto($('.guia'), separar ? t.guia : '');
    if (cfg.forma === 'todo') todos.innerHTML = partesDe(p).map(x => partir(x.texto).map(f => `<span>${esc(f)}</span>`).join('')).join(' ');
    else todos.textContent = entera;
    if (todos.textContent !== antes) fundir(todos);
    todos.classList.remove('sonando');
    todos.classList.toggle('largo', entera.length > 230);
  }
  const acc = $('.acciones');
  if (p.t === 'anuncio') acc.innerHTML = '<button class="btn principal centro" data-accion="seguir">Empezar</button>';
  else if (p.t === 'vida') {
    $('.vida-q').textContent = mis.vida;
    const siguiente = !p.ultimo ? 'Siguiente misterio' : (ses.modo === 'entero' ? 'Rezar la Salve' : 'Terminar');
    acc.innerHTML = `<button class="btn principal centro" data-accion="seguir">${siguiente}</button>` +
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

// Pasar de una oración a otra es inmediato; pasar del anuncio a la oración, o de la oración a la
// pregunta para tu vida, cambia la pantalla entera y lleva un fundido.
function avanzar(solo) {
  const { ses, pasos } = S, p = pasos[ses.paso];
  if (p.o === 'gloria' && p.m != null) marcarRezado(ses.grupo, p.m);
  if (ses.paso < pasos.length - 1) {
    ses.paso++;
    if (!solo) vibrar();
    if (pasos[ses.paso].t !== p.t) transicion(actualizar); else actualizar();
  } else transicion(terminar);
}
function atras() {
  const { ses, pasos } = S;
  if (ses.paso > 0) { ses.paso--; if (pasos[ses.paso].t !== pasos[ses.paso + 1].t) transicion(actualizar); else actualizar(); }
}

function terminar() {
  borrar('sesion');
  vistaFin(S.ses);
}

/* ---------- Las cuentas se deslizan, como en el Rosario físico ---------- */
// Ver Decisiones.md, 8 de octubre. Cada decena funciona como un contador: el Padrenuestro queda
// fijo y las diez Avemarías corren por el hilo entre dos nudos. Al empezar están todas del lado
// de adelante; con cada Avemaría una cuenta pasa hacia el Padrenuestro, y al final queda libre
// el hilo de adelante, donde se rezan el Gloria y el Oh Jesús mío. Lo mismo las tres del comienzo.
// Dónde va la Avemaría j de un tramo cuando ya se pasaron k: las pasadas, juntas al principio;
// las otras, juntas al final; la holgura del hilo, en el medio.
const lugarCuenta = (desde, hasta, n, paso, j, k) => j < k ? desde + paso / 2 + j * paso : hasta - paso / 2 - (n - 1 - j) * paso;

// Cuántas Avemarías de la decena m ya se pasaron en el paso p.
function corridas(m, p) {
  const { ses } = S;
  if (p.m === m) return p.t === 'vida' ? 10 : p.tira ? Math.min(p.tira.i, 10) : 0;
  if (ses.modo === 'entero') return (p.m != null && m < p.m) || p.o === 'salve' ? 10 : 0;
  // Rezando por partes, las decenas que ya se rezaron hoy quedan con las cuentas pasadas.
  return rezados(ses.grupo).includes(m) && !(ses.modo === 'uno' && m === ses.misterio) ? 10 : 0;
}
// Y de las tres del comienzo (solo en el Rosario entero).
function corridasComienzo(p) {
  if (S.ses.modo !== 'entero') return 0;
  if (p.m != null || p.o === 'salve') return 3;
  return p.tira ? Math.min(p.tira.i, 3) : 0;
}

/* ---------- Tira de cuentas (el tramo que se está rezando) ---------- */
// i: 0 el Padrenuestro, 1 a n las Avemarías, n + 1 el Gloria. Todo el tramo va centrado.
const TIRA = { grande: 8, chica: 6.2, paso: 13, holgura: 30 };
function dibujarTira(svg, n, i) {
  const T = TIRA, largo = n * T.paso + T.holgura;
  const c = 132 - (2 * T.grande + 9.2 + largo) / 2 + T.grande;   // centro del Padrenuestro
  const desde = c + T.grande + 5, hasta = desde + largo;
  if (svg.dataset.n !== String(n)) {
    // El hilo sale un poco de cada lado del tramo y se pierde, como el resto del Rosario.
    const izq = c - T.grande - 22, der = hasta + 4.2 + 22, f = 22 / (der - izq);
    let h = `<defs><linearGradient id="hebra-g" gradientUnits="userSpaceOnUse" x1="${izq}" x2="${der}" y1="0" y2="0">` +
      `<stop offset="0" style="stop-color:var(--line);stop-opacity:0"/><stop offset="${f}" style="stop-color:var(--line)"/>` +
      `<stop offset="${1 - f}" style="stop-color:var(--line)"/><stop offset="1" style="stop-color:var(--line);stop-opacity:0"/></linearGradient></defs>`;
    h += `<line class="hebra" x1="${izq}" y1="13" x2="${der}" y2="13" stroke="url(#hebra-g)"/>`;
    h += `<line class="hilo" x1="${desde + n * T.paso}" y1="13" x2="${hasta}" y2="13"/>`;
    h += `<circle class="nudo" cx="${c + T.grande + 2.6}" cy="13" r="1.8"/><circle class="nudo" cx="${hasta + 2.4}" cy="13" r="1.8"/>`;
    h += `<circle class="padre" cx="${c}" cy="13" r="${T.grande}"/>`;
    for (let j = 0; j < n; j++) h += `<circle class="ave" cx="0" cy="13" r="${T.chica}" style="--x:${lugarCuenta(desde, hasta, n, T.paso, j, Math.min(i, n))}"/>`;
    svg.innerHTML = h;
    svg.dataset.n = n;
  }
  svg.querySelector('.padre').setAttribute('class', 'padre ' + (i > 0 ? 'hecha' : 'actual'));
  svg.querySelectorAll('.ave').forEach((e, j) => {
    e.style.setProperty('--x', lugarCuenta(desde, hasta, n, T.paso, j, Math.min(i, n)));
    e.setAttribute('class', 'ave ' + (j < i - 1 ? 'hecha' : j === i - 1 ? 'actual' : ''));
  });
  svg.querySelector('.hilo').classList.toggle('actual', i === n + 1);
}

/* ---------- Mapa completo ---------- */
// La vuelta se mide en grados desde la medalla (abajo), en el sentido en que se reza. Cada decena
// tiene su tramo de hilo; entre tramo y tramo, la cuenta grande del Padrenuestro siguiente.
const CX = 100, CY = 92, R = 74;
const V = { inicio: 9, grande: 10, paso: 4.7, margen: 1.2 };
V.tramo = (360 - 2 * V.inicio - 4 * V.grande) / 5;
const enVuelta = t => { const a = (90 - t) * Math.PI / 180; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; };
const tramo = m => { const a = V.inicio + m * (V.tramo + V.grande); return [a + V.margen, a + V.tramo - V.margen]; };
// El comienzo, hacia arriba desde el Padrenuestro de abajo: la altura de cada punto del hilo.
const COMIENZO = { abajo: 231.2, largo: 36.4, paso: 6 };
const enComienzo = u => COMIENZO.abajo - u;

function moverCuenta(e, x, y) { e.style.setProperty('--x', x); e.style.setProperty('--y', y); }
function ponerCuentasMapa(svg, p) {
  for (let m = 0; m < 5; m++) {
    const [a, b] = tramo(m), k = p ? corridas(m, p) : 0;
    for (let j = 0; j < 10; j++) moverCuenta(svg.querySelector(`[data-pos="L${m * 11 + j}"]`), ...enVuelta(lugarCuenta(a, b, 10, V.paso, j, k)));
  }
  const k = p ? corridasComienzo(p) : 0;
  for (let j = 0; j < 3; j++) moverCuenta(svg.querySelector(`[data-pos="t${j}"]`), 100, enComienzo(lugarCuenta(0, COMIENZO.largo, 3, COMIENZO.paso, j, k)));
}

function dibujarMapa(svg) {
  let h = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="var(--line)" stroke-width=".8"/>`;
  h += `<line x1="100" y1="${CY + R}" x2="100" y2="252" stroke="var(--line)" stroke-width=".8"/>`;
  // Hilos del Gloria: la holgura de cada tramo, cuando ya se pasaron todas las cuentas.
  for (let m = 0; m < 5; m++) {
    const [a, b] = tramo(m), [x1, y1] = enVuelta(a + 10 * V.paso), [x2, y2] = enVuelta(b);
    h += `<path class="cadena" data-pos="h${m}" d="M${x1} ${y1}A${R} ${R} 0 0 0 ${x2} ${y2}"/>`;
  }
  h += `<line class="cadena" data-pos="c0" x1="100" y1="${enComienzo(3 * COMIENZO.paso)}" x2="100" y2="${enComienzo(COMIENZO.largo)}"/>`;
  // Nudos al principio y al final de cada tramo, donde se frenan las cuentas.
  for (let m = 0; m < 5; m++) {
    const [a, b] = tramo(m);
    [a - .9, b + .9].forEach(t => { const [x, y] = enVuelta(t); h += `<circle class="nudo" cx="${x}" cy="${y}" r="1"/>`; });
  }
  [enComienzo(-.9), enComienzo(COMIENZO.largo + .9)].forEach(y => { h += `<circle class="nudo" cx="100" cy="${y}" r="1"/>`; });
  // Las cuentas grandes (fijas) y las Avemarías (se mueven).
  for (let m = 1; m < 5; m++) {
    const [x, y] = enVuelta(V.inicio + m * (V.tramo + V.grande) - V.grande / 2);
    h += `<circle class="cuenta" data-pos="L${m * 11 - 1}" cx="${x}" cy="${y}" r="4.6"/>`;
  }
  for (let m = 0; m < 5; m++) for (let j = 0; j < 10; j++) h += `<circle class="cuenta mov" data-pos="L${m * 11 + j}" cx="0" cy="0" r="2.8"/>`;
  h += `<rect class="cuenta solida" data-pos="med" x="93" y="162" width="14" height="16" rx="6"/>`;
  h += `<circle class="cuenta" data-pos="p2" cx="100" cy="188" r="4.6"/>`;
  for (let j = 0; j < 3; j++) h += `<circle class="cuenta mov" data-pos="t${j}" cx="0" cy="0" r="2.8"/>`;
  h += `<circle class="cuenta" data-pos="p1" cx="100" cy="238" r="4.6"/>`;
  h += `<path class="cuenta solida" data-pos="cruz" d="M98 248h4v6h6v4h-6v12h-4v-12h-6v-4h6z"/>`;
  svg.innerHTML = h;
  ponerCuentasMapa(svg, null);
}

function actualizarMapa(p, mis, g) {
  const { ses, pasos } = S;
  const hechos = new Set(pasos.slice(0, ses.paso).map(x => x.pos));
  // Rezando por partes, también se marcan las decenas que ya se rezaron hoy.
  if (ses.modo !== 'entero') rezados(g.id).forEach(m => {
    if (ses.modo === 'uno' && m === ses.misterio) return;
    [cuentaGrande(m), 'h' + m, ...Array.from({ length: 10 }, (_, j) => 'L' + (m * 11 + j))].forEach(x => hechos.add(x));
  });
  hechos.delete(p.pos);
  ponerCuentasMapa($('.ros'), p);
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
    <header class="barra"><button class="ic" data-accion="inicio" aria-label="Volver al inicio">${icono('x')}</button><span></span></header>
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
  { t: 'No hace falta saberse nada', voz: true,
    b: 'La app te muestra cada oración entera. Tocás la pantalla para pasar a la cuenta siguiente, y con el ícono del Rosario, arriba, ves en qué parte estás.' },
];
// La última tarjeta cuenta cómo suena la forma de rezar que está elegida, sin pedir que se elija
// antes de haber rezado (se cambia después, en Ajustes).
const VOZ_PRIMERA = {
  guia: 'Una voz dice la primera parte de cada oración y vos respondés la segunda. Si preferís rezar en silencio, tocá el parlante, abajo a la derecha.',
  todo: 'Una voz reza todo y la app avanza sola. Con el botón de abajo a la derecha la ponés en pausa.',
  solo: 'Rezás a tu ritmo, sin voz.',
};
function vistaPrimera(i) {
  const c = PRIMERA[i], ultimo = i === PRIMERA.length - 1;
  app.innerHTML = `
  <section class="vista fija pv">
    ${heroHTML(grupo('gozosos').misterios[0])}
    <header class="barra"><button class="ic" data-accion="inicio" aria-label="Cerrar">${icono('x')}</button><span></span></header>
    <div class="cuerpo">
      <div class="puntos">${PRIMERA.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>
      <h1 class="t1">${esc(c.t)}</h1>
      ${c.tira ? '<svg class="tira" viewBox="0 0 264 26" aria-hidden="true"></svg>' : ''}
      <p>${esc(c.b)}</p>
      ${c.voz ? `<p>${VOZ_PRIMERA[cfg.forma]}</p>` : ''}
      <div class="pv-nav">
        ${i > 0 ? `<button class="btn alt" data-accion="pv" data-v="${i - 1}">Anterior</button>` : ''}
        <button class="btn principal centro" data-accion="${ultimo ? 'primerRezo' : 'pv'}" data-v="${i + 1}">${ultimo ? 'Rezar un misterio' : 'Siguiente'}</button>
      </div>
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
    <header class="barra"><button class="ic" data-accion="inicio" aria-label="Volver al inicio">${icono('arrow-left')}</button><span></span></header>
    <div class="cuerpo">
      <h1 class="t1">Acerca del Rosario</h1>
      <p class="sub">Para conocerlo a fondo, de a un capítulo.</p>
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
    // El latín todavía no está grabado: lo reza la voz del celular.
    if (cfg.lengua === 'la') return item[2] + (voz.latinItaliano() ? ' En latín, por ahora, reza la voz del celular.'
      : ' En latín, por ahora, reza la voz del celular, y la tuya no trae una para el latín: suena con acento castellano.');
    return item[2] + ' Tocá un nombre para escucharla.';
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
  // Las voces van en dos renglones: primero las de mujer y abajo las de varón.
  const corte = v => k === 'voz' && v === VOCES.find(x => x[2] === 'masculina')[0] ? '<span class="corte"></span>' : '';
  return `<div class="segmentos${k === 'voz' ? ' voces' : ''}" role="radiogroup" aria-label="${OPCIONES[k].titulo}">${OPCIONES[k].items.map(([v, t]) =>
    `${corte(v)}<button class="${valor(k) === v ? 'sel' : ''}" role="radio" aria-checked="${valor(k) === v}" data-accion="opcion" data-k="${k}" data-v="${v}"${disponible(v) ? '' : ' disabled'}>${t}</button>`).join('')}</div>${desc}`;
}
function hojaAjustes() {
  const bloque = k => `<div class="ajuste"><b>${OPCIONES[k].titulo}</b>${selector(k)}</div>`;
  const sw = (k, t, d) => `<button class="fila" data-accion="alternar" data-v="${k}" role="switch" aria-checked="${cfg[k]}"><span><b>${t}</b><small>${d}</small></span><span class="interruptor${cfg[k] ? ' on' : ''}"></span></button>`;
  hoja('Ajustes', `
    ${['forma', 'voz', 'lengua', 'textos', 'letra', 'imagenes', 'modo'].map(bloque).join('')}
    ${sw('ohJesus', 'Oh Jesús mío', 'Después de cada Gloria')}
    ${sw('vida', 'Pregunta para tu vida', 'Al terminar cada misterio')}`);
}
// Una muestra corta para escuchar la voz (y, en el iPhone, habilitarla con este toque).
// Al elegir una voz suena siempre, en castellano, también rezando solo: es para conocerla.
function muestra(k) {
  if (cfg.forma === 'solo' && k !== 'voz') return voz.callar();
  const latin = cfg.lengua === 'la' && k !== 'voz';
  voz.decir([latin ? 'Ave Maria, gratia plena, Dominus tecum.' : 'Dios te salve, María, llena eres de gracia.'], {}, latin ? 'la' : 'es');
}

/* ---------- Acciones ---------- */
// Las acciones que cambian de pantalla pasan por transicion() para el fundido.
const acciones = {
  uno: () => transicion(() => iniciar('uno', grupoInicio, proximo(grupoInicio))),
  entero: () => transicion(() => iniciar('entero', grupoInicio, 0)),
  retomar: () => { const s = leer('sesion', null); if (s) transicion(() => { grupoInicio = s.grupo; abrirSesion(s); }); },
  mas: () => { const { grupo: gid, texto } = S.ses; transicion(() => abrirSesion({ fecha: hoyISO(), modo: 'uno', grupo: gid, misterio: proximo(gid), paso: 0, seguido: true, texto })); },
  salve: () => { const { grupo: gid, misterio, texto } = S.ses; transicion(() => abrirSesion({ fecha: hoyISO(), modo: 'salve', grupo: gid, misterio, paso: 0, texto })); },
  seguir: () => avanzar(),
  // El nombre de la oración muestra u oculta su texto entero (sin cortar la voz), y así sigue.
  texto: () => {
    const p = S.pasos[S.ses.paso];
    S.ses.texto = !conTexto(p);
    guardar('sesion', S.ses);
    aplicarTexto(p);
    if (conTexto(p)) { fundir($('.guia')); fundir($('.todos')); }
  },
  terminar: () => transicion(terminar),
  atras: () => atras(),
  salir: () => transicion(vistaInicio),
  inicio: () => transicion(vistaInicio),
  mapa: () => { const r = $('.rezo'); const m = r.classList.toggle('con-mapa'); $('.mapa').setAttribute('aria-hidden', !m); $('.cuerpo').inert = m; },
  primera: () => transicion(() => vistaPrimera(0)),
  pv: b => transicion(() => vistaPrimera(+b.dataset.v)),
  // Quien entra por "Es mi primera vez" reza con las oraciones enteras a la vista.
  primerRezo: () => { cfg.textos = 'completas'; guardar('ajustes', cfg); acciones.uno(); },
  // La primera vez, "Ya sé rezarlo" lleva al inicio de siempre (y queda recordado).
  yaSe: () => { guardar('yaReza', true); transicion(vistaInicio); },
  acerca: () => transicion(vistaAcerca),
  grupos: () => hojaGrupos(),
  grupo: b => { grupoInicio = b.dataset.v; transicion(() => { cerrarHoja(); vistaInicio(); }); },
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
    if (k === 'letra') aplicarLetra();
    if (k === 'imagenes' && $('.inicio')) vistaInicio();
    if (k === 'forma' || k === 'voz' || k === 'lengua') { muestra(k); precargarRezo(); }
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
