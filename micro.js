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
 const student=document.body.classList.contains("student-mode-active");
 document.getElementById("modalData").innerHTML=`<div class="modal-micro-head"><h2 class="modal-title">${esc(f.nombre)}</h2><span class="micro-chip">${esc(f.tipo)}</span><span class="micro-chip">${esc(f.grupo)}</span></div>${student?crearTarjetasEstudio(f):""}<div id="microReference" style="display:${student?"none":"block"}"><p class="modal-texto" style="margin-top:14px">${esc(f.descripcion)}</p><div class="micro-detail-grid">${c("Muestra",f.muestra)}${c("Medio",f.medio)}${c("Incubación",f.incubacion)}${c("Atmósfera",f.atmosfera)}${c("Identificación",f.identificacion)}${c("Pruebas",f.pruebas)}</div><div class="dato-complementario" style="margin-top:12px"><strong>Utilidad:</strong><br>${esc(f.utilidad)}</div><div class="alerta-tecnica" style="margin-top:12px"><strong>Observación:</strong> ${esc(f.observaciones)}</div></div>`;
 document.getElementById("modal").style.display="flex";
}
function cerrarModal(){document.getElementById("modal").style.display="none"}

function crearTarjetasEstudio(f){
 const cards=[["fa-prescription-bottle","¿Qué muestra corresponde?",f.muestra],["fa-vial","¿Qué medio se utiliza?",f.medio],["fa-clock","¿Qué incubación requiere?",f.incubacion],["fa-wind","¿Qué atmósfera corresponde?",f.atmosfera],["fa-microscope","¿Cómo se orienta la identificación?",f.identificacion]];
 return `<section class="micro-study"><div class="micro-study-head"><i class="fas fa-graduation-cap"></i><div><span>Modo estudiante</span><h3>Antes de mirar la ficha...</h3><p>Intentá responder y revelá cada dato cuando estés listo.</p></div></div>${cards.map(card=>`<article class="micro-study-card"><i class="fas ${card[0]}"></i><div><strong>${esc(card[1])}</strong><span hidden>${esc(card[2]||"No especifica.")}</span></div><button type="button" onclick="revelarMicro(this)"><i class="fas fa-eye"></i> Revelar</button></article>`).join("")}<div class="micro-study-actions"><button type="button" onclick="revelarTodoMicro()"><i class="fas fa-lightbulb"></i> Revelar todas</button><button type="button" class="micro-full-file" onclick="verFichaMicro()">Ver ficha completa <i class="fas fa-arrow-down"></i></button></div></section>`;
}
function revelarMicro(button){const answer=button.parentElement.querySelector("span");if(!answer)return;const open=!answer.hidden;answer.hidden=open;button.innerHTML=open?'<i class="fas fa-eye"></i> Revelar':'<i class="fas fa-eye-slash"></i> Ocultar';}
function revelarTodoMicro(){document.querySelectorAll(".micro-study-card").forEach(card=>{const answer=card.querySelector("span"),button=card.querySelector("button");answer.hidden=false;button.innerHTML='<i class="fas fa-eye-slash"></i> Ocultar';});}
function verFichaMicro(){document.getElementById("microReference").style.display="block";document.querySelector(".micro-study")?.remove();}

document.getElementById("searchInput").addEventListener("input",render);
document.getElementById("groupSelect").addEventListener("change",render);
document.getElementById("clearFilters").addEventListener("click",()=>{document.getElementById("searchInput").value="";document.getElementById("groupSelect").value="";render();window.scrollTo({top:0,behavior:"smooth"})});
document.querySelectorAll("[data-group]").forEach(b=>b.addEventListener("click",()=>{document.getElementById("groupSelect").value=b.dataset.group;document.getElementById("searchInput").value="";render();document.getElementById("microList").scrollIntoView({behavior:"smooth"})}));
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")cerrarModal()});

const studentModeButton=document.getElementById("studentModeButton"),studentModePanel=document.getElementById("studentModePanel"),themeToggle=document.getElementById("themeToggle"),utilitiesToggle=document.getElementById("utilitiesToggle"),utilitiesMenu=document.getElementById("utilitiesMenu");
studentModeButton?.addEventListener("click",()=>{const active=document.body.classList.toggle("student-mode-active");studentModeButton.setAttribute("aria-pressed",String(active));studentModeButton.querySelector(".guide-toggle i").className=active?"fas fa-toggle-on":"fas fa-toggle-off";studentModePanel.hidden=!active;});
function actualizarTema(dark){document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("guialabMicroTheme",dark?"dark":"light");document.querySelector('meta[name="theme-color"]')?.setAttribute("content",dark?"#062918":"#07512f");themeToggle.setAttribute("aria-pressed",String(dark));themeToggle.setAttribute("aria-label",dark?"Activar modo claro":"Activar modo oscuro");themeToggle.innerHTML=dark?'<i class="fas fa-sun"></i><span>Claro</span>':'<i class="fas fa-moon"></i><span>Oscuro</span>';}
if(themeToggle){actualizarTema(document.documentElement.dataset.theme==="dark");themeToggle.addEventListener("click",()=>actualizarTema(document.documentElement.dataset.theme!=="dark"));}
utilitiesToggle?.addEventListener("click",()=>{const open=utilitiesToggle.getAttribute("aria-expanded")==="true";utilitiesToggle.setAttribute("aria-expanded",String(!open));utilitiesMenu.hidden=open;});
document.addEventListener("keydown",e=>{if(e.key==="Escape")cerrarModal()});
cargar();
