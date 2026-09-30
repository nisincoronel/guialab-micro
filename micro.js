let fichas=[], juego=[], preguntaActual=0, puntuacion=0, respondida=false;
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

async function cargar(){
 try{
  const [a,b]=await Promise.all([fetch("microbiologia.json"),fetch("micro_juego.json")]);
  fichas=await a.json(); juego=await b.json();
  document.getElementById("statFichas").textContent=fichas.length;
  render();
 }catch(e){console.error(e);document.getElementById("microList").innerHTML="<li><div><strong>No se pudo cargar la base microbiológica.</strong></div></li>"}
}
function render(){
 const q=document.getElementById("searchInput").value.trim().toLowerCase(), g=document.getElementById("groupSelect").value;
 document.getElementById("hub").hidden=!!q||!!g;
 const filtered=fichas.filter(f=>{
  const t=Object.values(f).join(" ").toLowerCase();
  return (!q||t.includes(q))&&(!g||f.grupo===g);
 });
 const list=document.getElementById("microList");
 if(!q&&!g){list.innerHTML="";document.getElementById("resultsSummary").textContent="Usá el buscador o elegí una categoría.";return}
 document.getElementById("resultsSummary").textContent=`${filtered.length} resultado${filtered.length===1?"":"s"}`;
 list.innerHTML=filtered.length?filtered.map(f=>`<li class="micro-result" onclick="mostrarDetalle(${f.id})"><div><strong>${esc(f.nombre)}</strong><small>${esc(f.tipo)} · ${esc(f.grupo)}</small></div><i class="fas fa-chevron-right"></i></li>`).join(""):"<li><div><strong>No encontramos coincidencias.</strong><br><small>Probá con otro término.</small></div></li>";
}
function mostrarDetalle(id){
 const f=fichas.find(x=>x.id===id);if(!f)return;
 const c=(a,b)=>`<div class="micro-detail-card"><small>${esc(a)}</small><div>${esc(b||"No especifica.")}</div></div>`;
 document.getElementById("modalData").innerHTML=`<div class="modal-micro-head"><h2 class="modal-title">${esc(f.nombre)}</h2><span class="micro-chip">${esc(f.tipo)}</span><span class="micro-chip">${esc(f.grupo)}</span></div><p class="modal-texto" style="margin-top:14px">${esc(f.descripcion)}</p><div class="micro-detail-grid">${c("Muestra",f.muestra)}${c("Medio",f.medio)}${c("Incubación",f.incubacion)}${c("Atmósfera",f.atmosfera)}${c("Identificación",f.identificacion)}${c("Pruebas",f.pruebas)}</div><div class="dato-complementario" style="margin-top:12px"><strong>Utilidad:</strong><br>${esc(f.utilidad)}</div><div class="alerta-tecnica" style="margin-top:12px"><strong>Observación:</strong> ${esc(f.observaciones)}</div>`;
 document.getElementById("modal").style.display="flex";
}
function cerrarModal(){document.getElementById("modal").style.display="none"}

document.getElementById("searchInput").addEventListener("input",render);
document.getElementById("groupSelect").addEventListener("change",render);
document.getElementById("clearFilters").addEventListener("click",()=>{document.getElementById("searchInput").value="";document.getElementById("groupSelect").value="";render();window.scrollTo({top:0,behavior:"smooth"})});
document.querySelectorAll("[data-group]").forEach(b=>b.addEventListener("click",()=>{document.getElementById("groupSelect").value=b.dataset.group;document.getElementById("searchInput").value="";render();document.getElementById("microList").scrollIntoView({behavior:"smooth"})}));
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")cerrarModal()});

function abrirJuego(){preguntaActual=0;puntuacion=0;document.getElementById("gameModal").style.display="flex";mostrarPregunta()}
function cerrarJuego(){document.getElementById("gameModal").style.display="none"}
function mostrarPregunta(){
 const p=juego[preguntaActual];respondida=false;
 document.getElementById("gameProgress").innerHTML=`<strong>${preguntaActual+1}/${juego.length}</strong> · Puntaje: ${puntuacion}`;
 document.getElementById("gameQuestion").textContent=p.q;
 document.getElementById("gameFeedback").textContent="";
 document.getElementById("gameNext").style.display="none";
 document.getElementById("gameOptions").innerHTML=p.options.map((o,i)=>`<button class="game-option" onclick="responder(${i})">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join("");
}
function responder(i){
 if(respondida)return;respondida=true;
 const p=juego[preguntaActual], opts=document.querySelectorAll(".game-option");
 opts[p.answer].classList.add("correct");
 if(i===p.answer){puntuacion++;document.getElementById("gameFeedback").innerHTML="✅ Correcto. "+esc(p.explanation)}
 else{opts[i].classList.add("wrong");document.getElementById("gameFeedback").innerHTML="❌ No es esa. "+esc(p.explanation)}
 const next=document.getElementById("gameNext");next.style.display="inline-block";next.textContent=preguntaActual===juego.length-1?"Ver resultado":"Siguiente";
}
document.getElementById("gameNext").addEventListener("click",()=>{
 if(preguntaActual<juego.length-1){preguntaActual++;mostrarPregunta()}
 else{document.getElementById("gameProgress").innerHTML=`<strong>Resultado final</strong>`;document.getElementById("gameQuestion").textContent=`Obtuviste ${puntuacion} de ${juego.length}`;document.getElementById("gameOptions").innerHTML="";document.getElementById("gameFeedback").textContent=puntuacion===juego.length?"¡Excelente!":"Podés volver a intentarlo y reforzar los temas.";document.getElementById("gameNext").style.display="none"}
});
document.getElementById("openGame").addEventListener("click",abrirJuego);
document.getElementById("gameModal").addEventListener("click",e=>{if(e.target.id==="gameModal")cerrarJuego()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){cerrarModal();cerrarJuego()}});
cargar();
