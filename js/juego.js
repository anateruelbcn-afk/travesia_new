/* LA TRAVESÍA · MOTOR DE JUEGO
   Datos: js/contenido.js | Estilos: css/estilos.css
   Funciona abriendo index.html directamente con Chrome; sin servidores ni bibliotecas.
*/
(()=>{
'use strict';
const D=window.TRAVESIA;
const app=document.getElementById('app'), visor=document.getElementById('visor'),vc=document.getElementById('visor-cuerpo'),vt=document.getElementById('visor-titulo');
if(!D||!Array.isArray(D.etapas)){app.textContent='Falta el archivo js/contenido.js. Descomprime primero el ZIP completo.';return;}
const KEY='la_travesia_30_corregida_2026';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const escLines=s=>esc(s).replace(/\n/g,'<br>');
function saved(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
const prior=saved();
const empty=()=>({screen:'home',idx:0,results:{},wrongs:{},ending:null,notice:'',visits:0});
let state=empty();
if(prior && prior.results && typeof prior.idx==='number'){
 state={...empty(),...prior,screen:'home',notice:'',ending:null};
 if(state.idx>=D.etapas.length)state.idx=D.etapas.length-1;
}
let lastFocus=null,typing=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify({...state,screen:'home',notice:'',ending:null}));}catch(e){/* juego operativo sin almacenamiento */}}
function score(){return Object.values(state.results).reduce((n,r)=>n+(r.points||0),0);}
function solved(){return Object.keys(state.results).length;}
function stopTyping(){if(typing){clearInterval(typing);typing=null;}}
function stopMedia(){document.querySelectorAll('video').forEach(v=>{try{v.pause();}catch(e){}});}
const icon=(s)=>`<span aria-hidden="true">${s}</span>`;
function header(){return `<header class="topbar"><div class="topbar-inner"><button class="brand" data-action="home" title="Volver a la portada"><span class="brand-mark">✦</span> LA TRAVESÍA <span class="brand-lite">/ 30.º</span></button><div class="topbar-right"><span class="points">★ <b>${score()}</b> <span>puntos</span></span><button class="top-link" data-action="home">Inicio</button></div></div></header>`;}
function people(){return D.tripulacion.map(c=>`<div class="person"><img loading="eager" src="${esc(c.avatar)}" alt="Avatar ilustrado de ${esc(c.nombre)}"><div><strong>${esc(c.nombre)}</strong><p>${esc(c.texto)}</p></div></div>`).join('');}
function cover(){const has=prior||state.visits||solved();return `${header()}<main class="cover cover--new-poster"><section class="cover-poster" aria-label="Portada de La Travesía, edición 30 aniversario"><img class="cover-poster-image" src="recursos/Portada_La_Travesia_1996_30_Aniversario.png" alt="La Travesía 1996 · Ibiza - Antigua · Edición 30 aniversario. Velero navegando sobre el Atlántico bajo un cielo azul y nubes"><div class="cover-poster-actions"><button type="button" class="cover-jugar" data-action="prologue">JUGAR</button>${has?'<button type="button" class="cover-continuar" data-action="continue">Continuar partida →</button>':''}</div></section>${footer()}</main>`;}
function prologue(){return `${header()}<main class="intro-screen intro-prologue wrap"><div class="intro-layout"><div class="intro-paper"><span class="eyebrow">EL CUADERNO ORIGINAL</span><h1>Una travesía.<br>Un océano por delante.</h1><blockquote class="prologue">«${escLines(D.prologo)}»<footer>${esc(D.autor)}</footer></blockquote><p class="intro-note">${escLines(D.aviso)}</p><p class="caution">Esta aventura es un juego con el único fin de entretener.</p></div><figure class="intro-side-image"><img src="recursos/Portada 01.jpg" alt="Velero navegando al atardecer"><figcaption>IBIZA · GIBRALTAR · CANARIAS · ATLÁNTICO · ANTIGUA</figcaption></figure></div><nav class="intro-actions" aria-label="Navegación del prólogo"><button class="btn btn-ghost" data-action="home">← Volver</button><button class="btn btn-primary" data-action="crew">Conoce a la tripulación →</button></nav></main>${footer()}`;}
function crew(){return `${header()}<main class="intro-screen crew-screen wrap"><div class="crew-heading"><span class="eyebrow">A BORDO</span><h1>La tripulación</h1></div><div class="crew-grid">${people()}</div><nav class="intro-actions" aria-label="Navegación de la tripulación"><button class="btn btn-ghost" data-action="prologue">←</button><button class="btn btn-primary" data-action="new">¡Comienza la travesía! →</button></nav></main>${footer()}`;}
function route(){let x=state.idx,z=x<2?0:x<13?1:x<16?2:x<26?3:4;let names=['Ibiza','Gibraltar','Canarias','Atlántico','Antigua'];let pc=Math.round(((x+1)/D.etapas.length)*100);return `<section class="route" aria-label="Progreso de la ruta"><div class="route-line"><div class="route-fill" style="width:${pc}%"></div></div><div class="route-labels">${names.map((name,k)=>`<span class="${k===z?'route-current':''}">${name}</span>`).join('')}</div><div class="route-meta"><span>ETAPA ${x+1} DE ${D.etapas.length}</span><span>${pc}% del viaje</span></div></section>`;}
function caption(media){return `<figcaption><span>${esc(media.caption)}</span><em>${esc(media.credit||'Imagen')}</em></figcaption>`;}
function mediaBody(m,index,isMain){if(m.type==='missing')return `<div class="media-missing"><span>◌</span><strong>Recurso pendiente de ubicar</strong><p>${esc(m.caption)}</p></div>`;
 const large=isMain?'primary-media':'secondary-media';const url=esc(m.src);
 if(m.type==='video')return `<figure class="media-item ${large}"><button data-action="media" data-media="${index}" class="media-action video-action" aria-label="Reproducir vídeo: ${esc(m.caption)}">${m.poster?`<img loading="lazy" src="${esc(m.poster)}" alt="Fotograma del vídeo: ${esc(m.caption)}">`:`<div class="video-poster"><span class="waves">≋</span></div>`}<span class="video-play">▶</span><span class="video-pill">VÍDEO</span></button>${caption(m)}</figure>`;
 if(m.type==='alive')return `<figure class="media-item ${large} alive" data-preview="${esc(m.video)}"><button data-action="media" data-media="${index}" class="media-action" aria-label="Ver fotografía y vídeo: ${esc(m.caption)}"><img loading="${isMain?'eager':'lazy'}" src="${url}" alt="${esc(m.alt)}"><video class="hover-video" preload="none" loop playsinline muted aria-hidden="true"></video><span class="video-pill">▶ FOTO QUE COBRA VIDA</span></button>${caption(m)}</figure>`;
 return `<figure class="media-item ${large}"><button data-action="media" data-media="${index}" class="media-action" aria-label="Ampliar imagen: ${esc(m.caption)}"><img loading="${isMain?'eager':'lazy'}" src="${url}" alt="${esc(m.alt)}"><span class="media-zoom" aria-hidden="true">⤢</span></button>${caption(m)}</figure>`;}
function gallery(stage){let arr=stage.medios;return `<section class="stage-media" aria-label="Material gráfico de la etapa">${arr.map((m,i)=>mediaBody(m,i,true)).join('')}</section>`;}
function bookButton(s){return `<button class="journal-button" data-action="journal" aria-label="Abrir el cuaderno de bitácora original de Miguel, ${esc(s.fecha)}"><span class="journal-icon" aria-hidden="true">▤</span><b>Abrir la bitácora original de Miguel</b><span class="journal-arrow" aria-hidden="true">↗</span></button>`;}
function diagram(){const marks=[['mayor','Vela mayor','13%','31%'],['mastil','Mástil','40%','13%'],['botavara','Botavara','13%','65%'],['estay','Estay de proa','75%','31%'],['mesana','Mesana','76%','57%'],['casco','Casco','59%','80%']];return `<div class="diagram"><div class="diagram-head">EXAMINA EL VELERO <span>Una etiqueta no corresponde a lo que señala</span></div><div class="diagram-art"><svg viewBox="0 0 1000 600" role="img" aria-label="Esquema de perfil de un velero de un mástil, con casco, vela mayor a popa y génova a proa."><defs><linearGradient id="dsea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d6edf0"/><stop offset="1" stop-color="#f8f7ec"/></linearGradient></defs><rect width="1000" height="600" fill="url(#dsea)"/><path d="M0 472 Q120 459 230 473 T480 473 T730 472 T1000 473 V600H0Z" fill="#a8cdda"/><path d="M110 461 Q520 453 870 461 L793 522H247Q166 510 110 461Z" fill="#173b51" stroke="#173b51" stroke-width="5"/><path d="M122 465 L855 465 789 506 248 506Z" fill="#f6f2e8"/><line x1="514" y1="66" x2="514" y2="464" stroke="#193e4a" stroke-width="13"/><line x1="230" y1="432" x2="516" y2="432" stroke="#5b5346" stroke-width="13"/><path d="M501 100L501 411 248 414Z" fill="#fff6da" stroke="#6d8d94" stroke-width="4"/><path d="M530 150 L538 424 806 425Z" fill="#fbffff" stroke="#668b97" stroke-width="4"/><line x1="514" y1="70" x2="840" y2="463" stroke="#7d959d" stroke-width="4"/><line x1="514" y1="70" x2="215" y2="462" stroke="#7d959d" stroke-width="4"/><line x1="380" y1="535" x2="326" y2="396" stroke="#8da7af" stroke-width="3"/><g fill="none" stroke="#2e7289" stroke-width="2" stroke-dasharray="7 5" opacity=".8"><path d="M193 256 L356 285"/><path d="M240 390 L354 433"/><path d="M475 168 L512 128"/><path d="M795 245 L665 256"/><path d="M795 375 L679 355"/><path d="M728 515 L687 488"/></g></svg>${marks.map(([id,t,left,top])=>`<button type="button" class="diagram-tag" style="left:${left};top:${top}" data-action="diagram" data-term="${id}" aria-label="Seleccionar la etiqueta ${esc(t)}">${esc(t)}</button>`).join('')}</div><p class="diagram-help">Pulsa directamente sobre el término que consideres incorrecto. Todos tienen el mismo aspecto.</p></div>`;}
function question(s){let q=s.reto,r=state.results[s.id],choices='';const wrongs=state.wrongs?.[s.id]||[];
 if(q.type==='abc'){choices=`<div class="answer-list">${q.options.map((o,i)=>`<button class="answer ${r&&i===q.correct?'is-right':wrongs.includes(i)?'is-wrong':''}" ${r||wrongs.includes(i)?'disabled':''} data-action="choice" data-choice="${i}"><span class="answer-letter">${'ABC'[i]}</span><span>${esc(o)}</span>${r&&i===q.correct?'<span class="tick">✓</span>':''}${!r&&wrongs.includes(i)?'<span class="wrong-tick" aria-label="Ya probada">✕</span>':''}</button>`).join('')}</div>`;}
 else if(q.type==='dilemma'){choices=`<div class="answer-list">${q.options.map((o,i)=>`<button class="answer dilemma-answer ${r?'is-choice-locked':''}" ${r?'disabled':''} data-action="choice" data-choice="${i}"><span class="answer-letter">${'ABC'[i]}</span><span>${esc(o.label)}</span></button>`).join('')}</div>`;}
 else if(q.type==='free'){choices=`<form id="open-answer" class="open-answer"><label for="user-answer">Tu respuesta</label><div class="open-answer-row"><input id="user-answer" name="answer" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta…" ${r?'disabled':''} value="${r?esc(r.choice):''}" required><button class="btn btn-small" type="submit" ${r?'disabled':''}>Comprobar →</button></div>${q.hint?`<p class="hint">Pista: ${esc(q.hint)}</p>`:''}</form>`;}
 else if(q.type==='diagram')choices=diagram();
 let feedback='';
 if(r){let explain=q.type==='dilemma'?q.options[r.choice].consequence:q.explain;
  feedback=`<div class="feedback feedback-right" role="status"><strong>✓ ¡Correcto! ${r.points?'+'+r.points+' puntos':''}</strong><p>${esc(explain)}</p>${q.type==='free'?`<p class="answer-reveal">Solución: ${esc(q.answer)}</p>`:''}</div>`;
 }else if(state.notice){feedback=`<div class="feedback feedback-wrong" role="status"><strong>Mmmm... seguro?</strong>${q.type==='abc'?'':`<p>${esc(state.notice)}</p>`}</div>`;}
 return `<section class="challenge ${q.type==='dilemma'?'challenge-fiction':''}" id="reto"><div class="challenge-top"><div class="challenge-label">${q.type==='dilemma'?'DILEMA DE LA TRAVESÍA':'RETO'}</div><span class="challenge-num">${String(s.numero).padStart(2,'0')} / ${D.etapas.length}</span></div><h2>${esc(q.q)}</h2>${q.type==='abc'?'':`<p class="challenge-intro">${q.type==='diagram'?'Observa el aparejo. No hay opciones A, B ni C.':q.type==='dilemma'?'Tu decisión cambia el desenlace de esta escena.':'No es un test: escribe el nombre que recuerdes.'}</p>`}${choices}${feedback}</section>`;}
function footerControls(s){const r=state.results[s.id];return `<nav class="journey-nav" aria-label="Controles de navegación"><button class="nav-back" data-action="prev" ${state.idx===0?'disabled':''} aria-label="Atrás">←</button><div class="nav-center">${r?'✓ Etapa superada':''}</div><button class="nav-next" data-action="next" ${r?'':'disabled'}>${state.idx===D.etapas.length-1?'VER EL FINAL':'SIGUIENTE ETAPA'} <span>→</span></button></nav>`;}
function stage(){let s=D.etapas[state.idx];return `${header()}<main class="wrap game-main">${route()}<article class="chapter"><div class="chapter-head"><div class="chapter-upper"><span>${esc(s.fecha)}</span><span>◌ ${esc(s.lugar)}</span></div>${s.ficcion?'':'<div class="chapter-kicker">DEL CUADERNO DE MIGUEL</div>'}<h1>${esc(s.titulo)}</h1><p class="chapter-story">${esc(s.relato).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')}</p>${s.posicion?`<div class="position">✧ ${esc(s.posicion)}</div>`:''}</div>${gallery(s)}${bookButton(s)}${question(s)}${footerControls(s)}</article><div class="under-game"><button data-action="home">⌂ Portada</button><button data-action="reset">↻ Reiniciar partida</button></div></main>${footer()}`;}
function footer(){return `<footer class="footer-site">Una recreación lúdica de los acontecimientos de 1996–1997 · Textos originales de Miguel Bonnin Costa</footer>`;}
function ending(){let e=state.ending,step=D.etapas[state.idx];return `${header()}<main class="ending-screen wrap"><span class="eyebrow">FINAL ALTERNATIVO</span><div class="ending-symbol">${e?.id==='macaco'?'🐒':'☎'}</div><h1>${e?.id==='macaco'?'El pasaporte no regresa':'Miguel desembarca en Gibraltar'}</h1><p>${esc(e?.text||'Un final inesperado interrumpe la travesía.')}</p><div class="ending-actions"><button class="btn btn-primary" data-action="retry-ending">↻ Probar otra decisión</button><button class="btn btn-outline" data-action="home">Volver a la portada</button></div><p class="ending-small">Puedes volver al dilema y recuperar la ruta de 1996.</p></main>${footer()}`;}
function finish(){return `${header()}<main class="finish-screen"><div class="finish-hero"><div class="finish-shade"></div><div class="finish-inner"><span class="overline">23 DE ENERO DE 1997 · ANTIGUA</span><h1>¡LLEGAMOS!</h1><p>Falmouth Harbour. Después de 47 días, quince de ellos atrapados en Gibraltar, el Wall Street alcanza el Caribe.</p><div class="finish-score">★ ${score()} puntos <span>· ${solved()} de ${D.etapas.length} retos</span></div></div></div><div class="finish-paper wrap"><h2>«¿QUIÉN SABE?...»</h2><p>En abril de 1997, Miguel relee su cuaderno y confiesa que volvería a repetir la experiencia. Con una excepción: la larguísima escala en Gibraltar.</p><div class="finish-gallery"><button data-action="finish-picture" aria-label="Ampliar foto original de la llegada"><img src="recursos/Bitacora (19).jpg" alt="Fotografía histórica nocturna del grupo al llegar a Antigua"></button><button data-action="finish-picture2" aria-label="Ampliar postal original de Antigua"><img src="recursos/Bitacora Postal (4 Antigua).jpg" alt="Postal histórica del puerto de Antigua"></button></div><div class="finish-buttons"><button class="btn btn-primary" data-action="new">↻ Volver a jugar</button><button class="btn btn-outline" data-action="home">⌂ Volver al inicio</button><button class="btn btn-outline" data-action="epilogue">▤ Últimas páginas del cuaderno</button></div></div></main>${footer()}`;}
function render(){state.notice=state.notice||'';stopMedia();app.innerHTML=state.screen==='home'?cover():state.screen==='prologue'?prologue():state.screen==='crew'?crew():state.screen==='ending'?ending():state.screen==='finish'?finish():stage();setupHover();save();}
function scrollUp(){window.scrollTo({top:0,behavior:'instant'});}
function go(i){state.idx=Math.max(0,Math.min(D.etapas.length-1,i));state.screen='stage';state.notice='';state.ending=null;state.visits++;render();scrollUp();}
function feedback(choice){const s=D.etapas[state.idx],q=s.reto;if(state.results[s.id])return;
 if(q.type==='abc'){
  const index=Number(choice);if(!Number.isInteger(index)||index<0||index>=q.options.length)return;
  state.wrongs[s.id]=state.wrongs[s.id]||[];
  if(index!==q.correct){
    if(!state.wrongs[s.id].includes(index))state.wrongs[s.id].push(index);
    // No revelar la respuesta ni bloquear las demás. Mostrar una explicación que no contenga el acierto.
    state.notice='Mmmm... seguro?';
    render();document.getElementById('reto')?.scrollIntoView({block:'start',behavior:'smooth'});return;
  }
  const points=state.wrongs[s.id].length?5:10;
  state.results[s.id]={choice:index,correct:true,points};state.notice='';render();document.getElementById('reto')?.scrollIntoView({block:'start',behavior:'smooth'});return;
 }
 if(q.type==='diagram'){
  const ok=choice===q.correct;if(!ok){state.notice='Esa etiqueta es correcta. Busca una que nombre otra parte del aparejo.';render();document.getElementById('reto')?.scrollIntoView({block:'start',behavior:'smooth'});return;}
  state.results[s.id]={choice,correct:true,points:15};state.notice='';render();document.getElementById('reto')?.scrollIntoView({block:'start',behavior:'smooth'});return;
 }
 if(q.type==='dilemma'){
  let index=Number(choice),op=q.options[index];if(!op)return;
  if(op.kind==='ending'){state.ending={id:s.id,text:op.consequence};state.screen='ending';render();scrollUp();return;}
  if(op.kind==='retry'){state.notice=op.consequence;render();document.getElementById('reto')?.scrollIntoView({block:'start',behavior:'smooth'});return;}
  state.results[s.id]={choice:index,correct:true,points:op.points||0};state.notice='';render();document.getElementById('reto')?.scrollIntoView({block:'start',behavior:'smooth'});return;
 }
}
function open(title,contents,mode='book'){lastFocus=document.activeElement;stopTyping();visor.classList.toggle('visor-foto',mode==='photo');visor.classList.remove('foto-ajustada');vt.textContent=title;vc.innerHTML=contents;if(!visor.open)visor.showModal();document.getElementById('cerrar-visor').focus();}
function close(){stopTyping();visor.querySelectorAll('video').forEach(v=>v.pause());visor.close();visor.classList.remove('visor-foto','foto-ajustada');if(lastFocus&&lastFocus.isConnected)lastFocus.focus();}
function journal(ids,title){const logs=ids.map(k=>D.bitacora[k]).filter(Boolean);const html=`<div class="journal-doc"><button hidden class="type-button" data-journal="type">⌨ Mostrar efecto máquina de escribir</button><button hidden class="type-button" data-journal="all">Leer todo</button>${logs.map(l=>`<section class="journal-entry"><div class="entry-date">${esc(l.fecha)} · ${esc(l.lugar)}</div><pre class="journal-text">${esc(l.texto)}</pre></section>`).join('')}</div>`;open('Bitácora de Miguel · '+title,html);startJournalTyping();}
function startJournalTyping(){
 const notes=[...vc.querySelectorAll('pre.journal-text')];if(!notes.length)return;
 stopTyping();
 const originals=notes.map(n=>n.textContent);notes.forEach(n=>{n.textContent='';});
 let entry=0,offset=0;
 typing=setInterval(()=>{
  if(!visor.open||entry>=notes.length){stopTyping();return;}
  const full=originals[entry];offset=Math.min(offset+4,full.length);
  notes[entry].textContent=full.slice(0,offset);
  if(offset>=full.length){entry++;offset=0;if(entry>=notes.length)stopTyping();}
 },28);
}
function media(i){const s=D.etapas[state.idx],m=s.medios[i];if(!m||m.type==='missing')return;
 if(m.type==='image'){
  const out=`<div class="expanded-media"><div class="media-toolbar"><button type="button" class="type-button" data-journal="fit">Ajustar a pantalla</button><span>Imagen ampliada a todo el ancho · Desliza para ver el resto</span></div><img src="${esc(m.src)}" alt="${esc(m.alt)}"><p>${esc(m.caption)} · ${esc(m.credit)}</p></div>`;
  open('Fotografía o documento original',out,'photo');return;
 }
 let src=m.type==='alive'?m.video:m.src;
 const out=`<div class="expanded-media"><video src="${esc(src)}" controls autoplay playsinline preload="metadata" aria-label="${esc(m.alt)}">Vídeo no compatible con este navegador.</video><p>${esc(m.caption)} · Vídeo recreado, no grabación histórica.</p>${m.type==='alive'?`<button class="type-button" data-journal="photo" data-photo="${esc(m.src)}">Ver la fotografía original ampliada</button>`:''}</div>`;
 open('Vídeo · Recreación',out,'photo');
}
function setupHover(){document.querySelectorAll('.alive').forEach(el=>{let vid=el.querySelector('video');if(!vid)return;
  el.addEventListener('mouseenter',()=>{if(!matchMedia('(hover:hover)').matches)return;vid.src=el.dataset.preview;vid.muted=true;vid.playsInline=true;vid.loop=true;vid.currentTime=0;vid.play().then(()=>el.classList.add('playing')).catch(()=>{});});
  el.addEventListener('mouseleave',()=>{vid.pause();el.classList.remove('playing');});
 });}
app.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;let act=b.dataset.action;
 if(act==='new'){state=empty();go(0);}else if(act==='prologue'){state.screen='prologue';render();scrollUp();}else if(act==='crew'){state.screen='crew';render();scrollUp();}else if(act==='continue'){go(state.idx);}else if(act==='home'){state.screen='home';state.notice='';state.ending=null;render();scrollUp();}
 else if(act==='reset'){if(window.confirm('¿Reiniciar el juego y borrar los puntos de esta partida?')){state=empty();go(0);}}
 else if(act==='next'){if(!state.results[D.etapas[state.idx].id])return;if(state.idx===D.etapas.length-1){state.screen='finish';render();scrollUp();}else go(state.idx+1);}
 else if(act==='prev'){go(state.idx-1);}
 else if(act==='journal'){const s=D.etapas[state.idx];journal(s.fragmentos,s.fecha);}
 else if(act==='media'){media(Number(b.dataset.media));}
 else if(act==='choice'||act==='diagram'){feedback(act==='choice'?b.dataset.choice:b.dataset.term);}
 else if(act==='retry-ending'){state.screen='stage';state.ending=null;state.notice='';render();scrollUp();}
 else if(act==='finish-picture')open('Llegada a Antigua',`<div class="expanded-media"><img src="recursos/Bitacora (19).jpg" alt="Celebración nocturna real de la tripulación"></div>`,'photo');
 else if(act==='finish-picture2')open('Postal original de Antigua',`<div class="expanded-media"><img src="recursos/Bitacora Postal (4 Antigua).jpg" alt="Postal original de Antigua"></div>`,'photo');
 else if(act==='epilogue')journal(['41','42'],'Enero y abril de 1997');
});
app.addEventListener('submit',e=>{if(e.target.id!=='open-answer')return;e.preventDefault();const s=D.etapas[state.idx],q=s.reto;let val=e.target.elements.answer.value.trim();if(!val)return;if(q.variants.map(norm).includes(norm(val))){state.results[s.id]={choice:val,correct:true,points:15};state.notice='';render();document.getElementById('reto')?.scrollIntoView({block:'start',behavior:'smooth'});}else{state.notice='No coincide con las respuestas admitidas. Revisa el término o utiliza la pista y vuelve a intentarlo.';render();document.getElementById('reto')?.scrollIntoView({block:'start',behavior:'smooth'});}});
app.addEventListener('keydown',e=>{let b=e.target.closest('.diagram-tag');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();feedback(b.dataset.term);}});
document.getElementById('cerrar-visor').addEventListener('click',close);
visor.addEventListener('click',e=>{if(e.target===visor)close();const btn=e.target.closest('[data-journal]');if(!btn)return;let mode=btn.dataset.journal;
 if(mode==='photo'){open('Fotografía original',`<div class="expanded-media"><div class="media-toolbar"><button class="type-button" data-journal="fit">Ajustar a pantalla</button></div><img src="${esc(btn.dataset.photo)}" alt="Fotografía original a bordo"></div>`,'photo');return;}
 if(mode==='fit'){visor.classList.toggle('foto-ajustada');btn.textContent=visor.classList.contains('foto-ajustada')?'Ampliar al ancho':'Ajustar a pantalla';return;}
 // La bitácora se presenta exclusivamente con efecto de máquina de escribir.
 // No existe ya ninguna acción para mostrar la transcripción de golpe.
});
visor.addEventListener('close',()=>{stopTyping();visor.querySelectorAll('video').forEach(v=>v.pause());});
render();
})();
