const gameState={questions:[],index:0,score:0,correct:0,streak:0,bestStreak:0,answered:false};
const byId=id=>document.getElementById(id);
function shuffle(items){return [...items].sort(()=>Math.random()-.5)}
async function loadQuestions(){
  try { const response=await fetch("micro_juego.json"); if(!response.ok) throw new Error("No se pudo cargar el desafío"); gameState.questions=shuffle(await response.json()); }
  catch(error){ byId("gameStart").innerHTML='<div class="game-start-icon"><i class="fas fa-triangle-exclamation"></i></div><h1>No se pudo cargar el desafío</h1><p>Volvé a intentarlo desde GuíaLab Micro.</p>'; console.error(error); }
}
function show(view){["gameStart","gamePlay","gameResults"].forEach(id=>byId(id).hidden=id!==view)}
function startGame(){Object.assign(gameState,{index:0,score:0,correct:0,streak:0,bestStreak:0,answered:false,questions:shuffle(gameState.questions)});show("gamePlay");renderQuestion()}
function renderQuestion(){
  const question=gameState.questions[gameState.index]; gameState.answered=false;
  byId("gameCount").textContent=`Pregunta ${gameState.index+1} de ${gameState.questions.length}`;
  byId("gameScore").textContent=gameState.score; byId("gameStreak").textContent=gameState.streak;
  byId("gameProgress").style.width=`${(gameState.index/gameState.questions.length)*100}%`;
  byId("gameQuestion").textContent=question.q; byId("gameFeedback").hidden=true; byId("nextGame").hidden=true;
  byId("gameOptions").innerHTML=question.options.map((option,index)=>`<button type="button" class="micro-game-option" data-index="${index}"><span>${String.fromCharCode(65+index)}</span>${escapeHtml(option)}</button>`).join("");
  byId("gameOptions").querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>answer(Number(button.dataset.index))));
}
function answer(selected){
  if(gameState.answered)return; gameState.answered=true; const question=gameState.questions[gameState.index]; const buttons=[...byId("gameOptions").querySelectorAll("button")];
  buttons.forEach(button=>button.disabled=true); buttons[question.answer]?.classList.add("is-correct");
  const feedback=byId("gameFeedback");
  if(selected===question.answer){gameState.correct++;gameState.streak++;gameState.bestStreak=Math.max(gameState.bestStreak,gameState.streak);const earned=100+(gameState.streak-1)*25;gameState.score+=earned;feedback.innerHTML=`<strong><i class="fas fa-circle-check"></i> ¡Correcto! +${earned} puntos</strong><span>${escapeHtml(question.explanation||"")}</span>`;feedback.className="game-feedback is-correct";}
  else {buttons[selected]?.classList.add("is-wrong");gameState.streak=0;feedback.innerHTML=`<strong><i class="fas fa-circle-xmark"></i> Casi.</strong><span>${escapeHtml(question.explanation||"")}</span>`;feedback.className="game-feedback is-wrong";}
  byId("gameScore").textContent=gameState.score;byId("gameStreak").textContent=gameState.streak;feedback.hidden=false;byId("nextGame").hidden=false;byId("nextGame").innerHTML=gameState.index===gameState.questions.length-1?'Ver resultado <i class="fas fa-arrow-right"></i>':'Siguiente <i class="fas fa-arrow-right"></i>';
}
function next(){if(gameState.index<gameState.questions.length-1){gameState.index++;renderQuestion()}else showResults()}
function showResults(){
  const total=gameState.questions.length,ratio=gameState.correct/total; byId("resultScore").textContent=gameState.score;byId("resultCorrect").textContent=`${gameState.correct}/${total}`;byId("resultBestStreak").textContent=gameState.bestStreak;
  byId("resultTitle").textContent=ratio===1?"¡Excelente dominio!":ratio>=.7?"¡Muy buen trabajo!":"¡Seguí practicando!";
  byId("resultMessage").textContent=ratio>=.7?"Tu repaso microbiológico viene muy bien. Podés volver a jugar para superar tu racha.":"Cada intento fortalece el repaso. Volvé a las fichas o probá otra ronda.";show("gameResults");
}
function escapeHtml(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}
byId("startGame").addEventListener("click",startGame);byId("restartGame").addEventListener("click",startGame);byId("nextGame").addEventListener("click",next);loadQuestions();
