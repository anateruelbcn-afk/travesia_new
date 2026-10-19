/* Editor local: modifica el modelo en memoria y exporta el JS, sin escrituras remotas. */
(()=>{'use strict';const D=window.TRAVESIA;
 if(!D){document.body.textContent='No se ha podido cargar js/contenido.js';return;}
 const $=id=>document.getElementById(id);
 const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
 let selected=0,dirty=false;
 D.etapas.forEach((s,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${String(i+1).padStart(2,'0')} · ${s.fecha} · ${s.titulo}`;$('choose').appendChild(o);});
 function form(){const s=D.etapas[selected],q=s.reto; $('e-date').value=s.fecha;$('e-place').value=s.lugar;$('e-title').value=s.titulo;$('e-story').value=s.relato;$('e-question').value=q.q;
  $('editor-type').textContent='Formato: '+({'abc':'Tres opciones (A / B / C)','dilemma':'Dilema con consecuencias','free':'Pregunta abierta','diagram':'Esquema interactivo'}[q.type]||q.type);
  $('resource-list').textContent='Recursos de esta etapa: '+s.medios.map(m=>m.name||m.caption).join(' · ');
  let code='';
  if(q.type==='abc')code='<p><strong>Opciones y solución</strong></p>'+q.options.map((x,i)=>`<label for="opt-${i}">Opción ${'ABC'[i]}</label><input id="opt-${i}" value="${escape(x)}">${q.feedbacks?`<label for="fb-${i}">Mensaje al responder ${'ABC'[i]}</label><textarea rows="2" id="fb-${i}">${escape(q.feedbacks[i])}</textarea>`:''}<label class="correct-radio"><input type="radio" name="correct" value="${i}" ${i===q.correct?'checked':''}> Es la respuesta correcta</label>`).join('');
  else if(q.type==='dilemma')code='<p><strong>Alternativas del dilema</strong></p>'+q.options.map((x,i)=>`<label for="opt-${i}">Opción ${'ABC'[i]}</label><input id="opt-${i}" value="${escape(x.label)}"><label for="out-${i}">Consecuencia ${'ABC'[i]}</label><textarea rows="3" id="out-${i}">${escape(x.consequence)}</textarea>`).join('');
  else if(q.type==='free')code='<label for="correct-free">Respuesta principal</label><input id="correct-free" value="'+escape(q.answer)+'"><p class="simple-list">Para admitir otras variantes, edita la lista «variants» del archivo js/contenido.js después de descargarlo.</p>';
  else code='<p class="simple-list">Las etiquetas y la solución del esquema se definen en js/juego.js; puedes cambiar el enunciado arriba.</p>';
  $('editor-options').innerHTML=code;
  $('editor-explain').innerHTML=q.type==='abc'||q.type==='free'||q.type==='diagram'?`<label for="e-explain">Explicación educativa</label><textarea rows="3" id="e-explain">${escape(q.explain)}</textarea>`:'';
  $('editor-status').textContent='';
 }
 function apply(){const s=D.etapas[selected],q=s.reto;s.fecha=$('e-date').value.trim();s.lugar=$('e-place').value.trim();s.titulo=$('e-title').value.trim();s.relato=$('e-story').value.trim();q.q=$('e-question').value.trim();
  if(q.type==='abc'){q.options=q.options.map((o,i)=>$('opt-'+i).value.trim());q.correct=Number(document.querySelector('input[name=correct]:checked')?.value||0);if(q.feedbacks)q.feedbacks=q.feedbacks.map((t,i)=>$('fb-'+i)?.value.trim()||t);}
  if(q.type==='dilemma')q.options.forEach((o,i)=>{o.label=$('opt-'+i).value.trim();o.consequence=$('out-'+i).value.trim();});
  if(q.type==='free'){q.answer=$('correct-free').value.trim();if(!q.variants.some(x=>x.toLocaleLowerCase()===q.answer.toLocaleLowerCase()))q.variants.unshift(q.answer);}
  if($('e-explain'))q.explain=$('e-explain').value.trim();dirty=true;$('editor-status').textContent='Cambios aplicados en esta sesión. Ahora puedes pasar a otra etapa o descargar el archivo.';return true;}
 $('choose').addEventListener('change',()=>{apply();selected=Number($('choose').value);form();});
 $('keep').addEventListener('click',apply);
 $('export').addEventListener('click',()=>{apply();const body='/* Archivo exportado desde editar.html */\nwindow.TRAVESIA = '+JSON.stringify(D,null,2)+';\n';const blob=new Blob([body],{type:'text/javascript;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='contenido.js';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('editor-status').textContent='Archivo descargado. Sustituye js/contenido.js por este archivo (no basta con guardarlo en Descargas).';dirty=false;});
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 form();
})();
