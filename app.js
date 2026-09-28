const KEY="diario_biker_v1";
let trips=JSON.parse(localStorage.getItem(KEY)||"[]");

function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
function save(){localStorage.setItem(KEY,JSON.stringify(trips));render();}
function totalSpent(){return trips.reduce((s,t)=>s+(t.expenses||[]).reduce((a,e)=>a+Number(e.value||0),0),0);}
function totalKm(){return trips.reduce((s,t)=>s+Number(t.km||0),0);}

function showScreen(name){
  document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
  document.getElementById("screen-"+name).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.screen===name));
  window.scrollTo({top:0,behavior:"smooth"});
  render();
}

function openNewTrip(){
  document.getElementById("tripForm").reset();
  document.getElementById("tripDate").value=new Date().toISOString().slice(0,10);
  document.getElementById("expenses").innerHTML="";
  addExpense();
  document.getElementById("tripModal").classList.remove("hidden");
}
function closeModal(){document.getElementById("tripModal").classList.add("hidden")}

function addExpense(){
  const row=document.createElement("div");
  row.className="expense-row";
  row.innerHTML=`<input class="expense-name" placeholder="Ex.: Combustível"><input class="expense-value" type="number" min="0" step="0.01" placeholder="R$"><button type="button" onclick="this.parentElement.remove()">×</button>`;
  document.getElementById("expenses").appendChild(row);
}

document.getElementById("tripForm").addEventListener("submit",e=>{
  e.preventDefault();
  const expenses=[...document.querySelectorAll(".expense-row")].map(r=>({
    name:r.querySelector(".expense-name").value.trim()||"Outros",
    value:Number(r.querySelector(".expense-value").value||0)
  })).filter(x=>x.value>0);
  trips.unshift({
    id:Date.now(),
    name:document.getElementById("tripName").value.trim(),
    date:document.getElementById("tripDate").value,
    km:Number(document.getElementById("tripKm").value||0),
    origin:document.getElementById("tripOrigin").value.trim(),
    destination:document.getElementById("tripDestination").value.trim(),
    notes:document.getElementById("tripNotes").value.trim(),
    expenses
  });
  save(); closeModal(); showScreen("trips");
});

function tripCard(t){
  const spent=(t.expenses||[]).reduce((a,e)=>a+Number(e.value||0),0);
  const route=[t.origin,t.destination].filter(Boolean).join(" → ")||"Rota não informada";
  return `<article class="trip-card">
    <div class="title">${escapeHtml(t.name)}</div>
    <div class="route">${escapeHtml(route)}</div>
    <div class="trip-meta"><span>🛣️ ${Number(t.km||0).toLocaleString("pt-BR")} km</span><span>💰 ${money(spent)}</span><span>📅 ${formatDate(t.date)}</span></div>
  </article>`;
}
function formatDate(d){if(!d)return"--";const [y,m,day]=d.split("-");return`${day}/${m}/${y}`;}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function render(){
  const km=totalKm(), spent=totalSpent();
  document.getElementById("totalKm").textContent=km.toLocaleString("pt-BR")+" km";
  document.getElementById("totalTrips").textContent=trips.length;
  document.getElementById("totalSpent").textContent=money(spent);
  document.getElementById("totalWins").textContent="0";
  document.getElementById("statsKm").textContent=km.toLocaleString("pt-BR")+" km";
  document.getElementById("statsTrips").textContent=trips.length;
  document.getElementById("statsSpent").textContent=money(spent);
  const recent=document.getElementById("recentTrips"), all=document.getElementById("allTrips");
  recent.innerHTML=trips.length?trips.slice(0,3).map(tripCard).join(""):`<div class="empty">Ainda não há viagens registradas.<br><br>Comece sua primeira aventura. 🏍️</div>`;
  all.innerHTML=trips.length?trips.map(tripCard).join(""):`<div class="empty">Nenhuma viagem registrada ainda.</div>`;
}
render();

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));}
