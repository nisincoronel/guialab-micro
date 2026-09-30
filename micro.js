let fichas = [];

const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

async function cargarMicro(){
  try{
    const r = await fetch("microbiologia.json",{cache:"no-store"});
    if(!r.ok) throw new Error("HTTP "+r.status);
    fichas = await r.json();
    document.getElementById("statDeterminaciones").textContent = fichas.length;
    render();
  }catch(e){
    console.error(e);
    document.getElementById("microList").innerHTML =
      '<li><div><strong>No se pudo cargar la base microbiológica.</strong><br><small>Verificá microbiologia.json.</small></div></li>';
  }
}

function render(){
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const g = document.getElementById("groupSelect").value;
  const hub = document.getElementById("learningHub");
  const list = document.getElementById("microList");
  const summary = document.getElementById("resultsSummary");

  const filtered = fichas.filter(f=>{
    const text = [
      f.nombre,f.tipo,f.grupo,f.descripcion,f.muestra,f.medio,f.incubacion,
      f.atmosfera,f.identificacion,f.pruebas,f.utilidad,f.observaciones
    ].filter(Boolean).join(" ").toLowerCase();
    return (!q || text.includes(q)) && (!g || f.grupo===g);
  });

  const browsing = !!q || !!g;
  hub.hidden = browsing;

  if(!browsing){
    list.innerHTML="";
    summary.textContent="Usá el buscador o elegí una categoría.";
    return;
  }

  summary.textContent = `${filtered.length} resultado${filtered.length===1?"":"s"}`;
  list.innerHTML = filtered.length ? filtered.map(f=>`
    <li class="micro-result" onclick="mostrarDetalle(${f.id})" style="cursor:pointer">
      <div>
        <strong>${esc(f.nombre)}</strong>
        <small>${esc(f.tipo)} · ${esc(f.grupo)}</small>
      </div>
      <i class="fas fa-chevron-right"></i>
    </li>
  `).join("") :
  '<li><div><strong>No encontramos coincidencias.</strong><br><small>Probá con otro término o categoría.</small></div></li>';
}

function mostrarDetalle(id){
  const f = fichas.find(x=>x.id===id);
  if(!f) return;
  document.getElementById("modalData").innerHTML = `
    <div class="modal-micro-head">
      <h2 class="modal-title">${esc(f.nombre)}</h2>
      <span class="micro-chip">${esc(f.tipo)}</span>
      <span class="micro-chip">${esc(f.grupo)}</span>
    </div>
    <p class="modal-texto" style="margin-top:14px">${esc(f.descripcion)}</p>
    <div class="micro-detail-grid">
      ${card("Muestra",f.muestra)}
      ${card("Medio",f.medio)}
      ${card("Incubación",f.incubacion)}
      ${card("Atmósfera",f.atmosfera)}
      ${card("Identificación",f.identificacion)}
      ${card("Pruebas",f.pruebas)}
    </div>
    <div class="dato-complementario" style="margin-top:12px">
      <strong>Utilidad:</strong><br>${esc(f.utilidad)}
    </div>
    <div class="alerta-tecnica" style="margin-top:12px;background:#eef8f4;border:1px solid #cfe9dd;color:#07512f;font-size:.8rem;padding:10px;border-radius:8px">
      <i class="fas fa-circle-info"></i>
      <strong>Observación:</strong> ${esc(f.observaciones)}
    </div>
  `;
  document.getElementById("modal").style.display="flex";
}

function card(label,value){
  return `<div class="micro-detail-card"><small>${esc(label)}</small><div>${esc(value || "No especifica.")}</div></div>`;
}

function cerrarModal(){ document.getElementById("modal").style.display="none"; }
document.getElementById("modal").addEventListener("click",e=>{
  if(e.target.id==="modal") cerrarModal();
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape") cerrarModal(); });

document.getElementById("searchInput").addEventListener("input",render);
document.getElementById("groupSelect").addEventListener("change",render);
document.getElementById("clearFilters").addEventListener("click",()=>{
  document.getElementById("searchInput").value="";
  document.getElementById("groupSelect").value="";
  render();
  window.scrollTo({top:0,behavior:"smooth"});
});

document.querySelectorAll("[data-group]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.getElementById("groupSelect").value=btn.dataset.group;
    document.getElementById("searchInput").value="";
    render();
    document.getElementById("microList").scrollIntoView({behavior:"smooth",block:"start"});
  });
});

cargarMicro();
