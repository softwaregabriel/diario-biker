const TRIP_KEY="diario_biker_v1";
const BIKE_KEY="diario_casal_na_rota_motos_v1";
let trips=JSON.parse(localStorage.getItem(TRIP_KEY)||"[]").map(t=>({...t,status:t.status||"realizada",bikeId:t.bikeId||""}));
let bikes=JSON.parse(localStorage.getItem(BIKE_KEY)||"[]");
let tripFilter="todas";
let bikeFilter="comigo";
let tripStatus="realizada";
const ROUTE_KEY="diario_casal_na_rota_biker_v1";
let routeFilter="todos";
let routeSearch="";
const ROTA_BIKER=[
 [1,"Serpenteando Café","Bocaiúva do Sul — PR","carimbando"],[2,"Monumento 2","Localização em atualização","atualizacao"],
 [3,"Mirante do 12","Lauro Müller — SC","carimbando"],[4,"Rota 370","Urubici — SC","carimbando"],[5,"Parada Rota 218","Carlópolis — PR","carimbando"],
 [6,"Parada Rota Bike Café","Rio dos Cedros — SC","carimbando"],[7,"Container da Serra","Doutor Pedrinho — SC","carimbando"],[8,"Parada 261","Guapiara — SP","carimbando"],
 [9,"Posto Rota 090","Piraí do Sul — PR","carimbando"],[10,"Terrasul Motos","Jaguarão — RS","carimbando"],[11,"Pad Bier Cervejaria","Paranoá — DF","carimbando"],
 [12,"Centro Cultural Movimento","Socorro — SP","carimbando"],[13,"Rota 513","Ponta Grossa — PR","carimbando"],[14,"Parador 158","Itaara — RS","carimbando"],
 [15,"Garimpo em Atividade","Ametista do Sul — RS","carimbando"],[16,"Bar Original – Pier SP-270","Piraju — SP","carimbando"],[17,"Armazém Canastra","Piumhi — MG","carimbando"],
 [18,"Box 1200","Jundiaí — SP","carimbando"],[19,"Rancho Terra Crua","Salesópolis — SP","carimbando"],[20,"Casa Rural","Barra do Ribeiro — RS","carimbando"],
 [21,"Parada Penhasco","Penha — SC","carimbando"],[22,"Restaurante Mata Virgem","Três Corações — MG","carimbando"],[23,"Bar do Hélio","Santo Antônio da Alegria — SP","carimbando"],
 [24,"Pousada e Camping Poço do Caixão","Timbé do Sul — SC","carimbando"],[25,"Os Independentes","Barretos — SP","carimbando"],[26,"Restaurante Portal Grill","Porto União — SC","carimbando"],
 [27,"Restaurante Pedra do Baú","São Bento do Sapucaí — SP","carimbando"],[28,"Hotel Barra Bonita","Barra Bonita — SP","carimbando"],[29,"Rancho Gastronomia e Cultura","São José do Barreiro — SP","carimbando"],
 [30,"Drei Schritte Restô Bar","Katueté — Paraguai","carimbando"],[31,"Pro Tork","Siqueira Campos — PR","carimbando"],[32,"Hell's Dogs Motorcycle Bar","Foz do Iguaçu — PR","carimbando"],
 [33,"Zapata Garage","Garça — SP","carimbando"],[34,"Parada da Búfala","Sete Barras — SP","carimbando"],[35,"Portal de São Lourenço","São Lourenço — MG","carimbando"],
 [36,"Route 60","Goiás — GO","carimbando"],[37,"Bela Vista Mall","Conceição do Mato Dentro — MG","construcao"],[38,"MAPY","Mauá da Serra — PR","carimbando"],
 [39,"MAR & SOL PRAIA HOTEL","Prado — BA","construcao"],[40,"QUIOSQUE ROMANO","Morro Redondo — RS","construcao"],[41,"ROTA 15","Casca — RS","construcao"],
 [42,"TAPIOCA DO IRMÃO FIRMINO","Cajá — PB","construcao"],[43,"Parada Route","Rod. GO 139 Km 166 — São Miguel do Passa Quatro — GO","construcao"]
].map(([numero,nome,local,status])=>({numero,nome,local,status}));
let routeStamps=JSON.parse(localStorage.getItem(ROUTE_KEY)||"{}");
function saveRouteStamps(){localStorage.setItem(ROUTE_KEY,JSON.stringify(routeStamps));if(window.cloudSyncNow)setTimeout(window.cloudSyncNow,150);}
function setRouteFilter(f){routeFilter=f;document.querySelectorAll(".route-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.filter===f));renderRoute();}
function setRouteSearch(v){routeSearch=v||"";renderRoute();}
function toggleRouteStamp(n){const k=String(n);routeStamps[k]=routeStamps[k]?false:new Date().toISOString();saveRouteStamps();renderRoute();}
function routeStatusLabel(s){return s==="carimbando"?"🟢 Carimbando":s==="construcao"?"🟡 Em construção":"⚪ Localização em atualização";}
function routeMapUrl(r){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(r.nome+", "+r.local);}
function renderRoute(){
 const list=document.getElementById("routeList");if(!list)return;
 const q=routeSearch.trim().toLowerCase();
 const filtered=ROTA_BIKER.filter(r=>{
   const stamped=!!routeStamps[String(r.numero)];
   const matchesFilter=routeFilter==="todos"||(routeFilter==="peguei"&&stamped)||(routeFilter==="falta"&&!stamped)||(routeFilter==="disponiveis"&&r.status==="carimbando");
   const matchesSearch=!q||(String(r.numero).includes(q)||r.nome.toLowerCase().includes(q)||r.local.toLowerCase().includes(q));
   return matchesFilter&&matchesSearch;
 });
 const total=ROTA_BIKER.length, stamped=Object.keys(routeStamps).filter(k=>ROTA_BIKER.some(r=>String(r.numero)===k)).length;
 const pct=Math.round((stamped/total)*100);
 document.getElementById("routeProgress").textContent=`${stamped} de ${total} carimbos`;
 document.getElementById("routeProgressPct").textContent=pct+"%";
 document.getElementById("routeProgressBar").style.width=pct+"%";
 document.getElementById("routeCount").textContent=`${filtered.length} monumento${filtered.length===1?"":"s"}`;
 list.innerHTML=filtered.length?filtered.map(r=>{
   const stamped=!!routeStamps[String(r.numero)];
   const date=stamped?new Date(routeStamps[String(r.numero)]).toLocaleDateString("pt-BR"):"";
   return `<article class="route-card ${stamped?"route-stamped":""}">
     <div class="route-card-icon"><img src="icons/rota-biker-monumento.png" alt="Monumento Rota Biker"></div>
     <div class="route-card-body"><div class="route-number">ROTA ${String(r.numero).padStart(2,"0")}</div><h3>${escapeHtml(r.nome)}</h3><p>📍 ${escapeHtml(r.local)}</p><span class="route-status route-status-${r.status}">${routeStatusLabel(r.status)}</span>${stamped?`<small class="route-stamp-date">✓ Carimbo concluído em ${date}</small>`:`<small class="route-stamp-pending">⏳ Carimbo pendente</small>`}</div>
     <div class="route-card-actions"><a class="ghost-btn" href="${routeMapUrl(r)}" target="_blank" rel="noopener">📍 Mapa</a><button class="stamp-btn ${stamped?"done":"pending"}" onclick="toggleRouteStamp(${r.numero})">${stamped?"✓ Carimbo concluído":"⏳ Carimbo pendente"}</button></div>
   </article>`;
 }).join(""):"<div class=\"empty\">Nenhum monumento encontrado.</div>";
}


function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
function saveTrips(){localStorage.setItem(TRIP_KEY,JSON.stringify(trips));if(window.cloudSyncNow) setTimeout(window.cloudSyncNow,150);}
function saveBikes(){localStorage.setItem(BIKE_KEY,JSON.stringify(bikes));if(window.cloudSyncNow) setTimeout(window.cloudSyncNow,150);}
function showScreen(name){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));document.getElementById("screen-"+name).classList.add("active");document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.screen===name));window.scrollTo({top:0,behavior:"smooth"});render();}
function closeModal(id){document.getElementById(id).classList.add("hidden");}
function openTripModal(status="realizada"){
  document.getElementById("tripForm").reset();document.getElementById("tripDate").value=new Date().toISOString().slice(0,10);document.getElementById("expenses").innerHTML="";addExpense();setTripStatus(status);populateBikeSelect("tripBike");
  document.getElementById("tripModal").classList.remove("hidden");updateTripEstimate();
}
function setTripStatus(status){tripStatus=status;document.getElementById("tripStatusDone").classList.toggle("active",status==="realizada");document.getElementById("tripStatusPlan").classList.toggle("active",status==="planejada");document.getElementById("tripModalTitle").textContent=status==="realizada"?"Nova viagem":"Planejar viagem";document.getElementById("tripModalSub").textContent=status==="realizada"?"Registre sua aventura":"Deixe a próxima rota preparada";document.getElementById("tripEstimateBox").classList.toggle("hidden",status!=="planejada");}
function addExpense(){const row=document.createElement("div");row.className="expense-row";row.innerHTML=`<input class="expense-name" placeholder="Ex.: Combustível"><input class="expense-value" type="number" min="0" step="0.01" placeholder="R$"><button type="button" onclick="this.parentElement.remove()">×</button>`;document.getElementById("expenses").appendChild(row);}
function openBikeModal(){document.getElementById("bikeForm").reset();document.getElementById("bikeModal").classList.remove("hidden");}

document.getElementById("tripForm").addEventListener("submit",e=>{e.preventDefault();const expenses=[...document.querySelectorAll(".expense-row")].map(r=>({name:r.querySelector(".expense-name").value.trim()||"Outros",value:Number(r.querySelector(".expense-value").value||0)})).filter(x=>x.value>0);const bikeId=document.getElementById("tripBike").value;trips.unshift({id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()),name:document.getElementById("tripName").value.trim(),date:document.getElementById("tripDate").value,km:Number(document.getElementById("tripKm").value||0),origin:document.getElementById("tripOrigin").value.trim(),destination:document.getElementById("tripDestination").value.trim(),notes:document.getElementById("tripNotes").value.trim(),expenses,status:tripStatus,bikeId});saveTrips();closeModal("tripModal");tripFilter=tripStatus;showScreen("trips");});

document.getElementById("bikeForm").addEventListener("submit",e=>{e.preventDefault();bikes.unshift({id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()),name:document.getElementById("bikeName").value.trim(),year:document.getElementById("bikeYear").value.trim(),consumption:Number(document.getElementById("bikeConsumption").value||0),status:document.getElementById("bikeStatus").value,acquired:document.getElementById("bikeAcquired").value,sold:document.getElementById("bikeSold").value,purchase:Number(document.getElementById("bikePurchase").value||0),sale:Number(document.getElementById("bikeSale").value||0),notes:document.getElementById("bikeNotes").value.trim()});saveBikes();closeModal("bikeModal");render();});

document.getElementById("tripBike").addEventListener("change",updateTripEstimate);
document.getElementById("tripKm").addEventListener("input",updateTripEstimate);
function populateBikeSelect(id){const s=document.getElementById(id);const opts=bikes.filter(b=>b.status!=="vendida");s.innerHTML=`<option value="">Selecionar moto</option>`+opts.map(b=>`<option value="${b.id}">${escapeHtml(b.name)}${b.consumption?` • ${b.consumption} km/L`:""}</option>`).join("");}
function bikeById(id){return bikes.find(b=>String(b.id)===String(id));}
function updateTripEstimate(){const bike=bikeById(document.getElementById("tripBike").value);const km=Number(document.getElementById("tripKm").value||0);const box=document.getElementById("tripEstimateBox");if(tripStatus!=="planejada"||!bike||!bike.consumption||!km){box.classList.add("hidden");return}const fuelPrice=Number(localStorage.getItem("casal_fuel_price")||6.20);const liters=km/bike.consumption;const fuel=liters*fuelPrice;document.getElementById("tripEstimatedFuel").textContent=money(fuel);document.getElementById("tripEstimatedTolls").textContent="Cadastre na calculadora";document.getElementById("tripEstimatedTotal").textContent=money(fuel);box.classList.remove("hidden");}
function setTripFilter(f){tripFilter=f;document.querySelectorAll(".segmented button").forEach(b=>b.classList.remove("active"));document.getElementById(f==="todas"?"filterAll":f==="realizada"?"filterDone":"filterPlan").classList.add("active");renderTrips();}
function setBikeFilter(f){bikeFilter=f;document.querySelectorAll(".bike-tabs button").forEach(b=>b.classList.remove("active"));const idx={comigo:0,vendida:1,planejada:2}[f];document.querySelectorAll(".bike-tabs button")[idx].classList.add("active");renderBikes();}
function tripCard(t){const spent=(t.expenses||[]).reduce((a,e)=>a+Number(e.value||0),0);const route=[t.origin,t.destination].filter(Boolean).join(" → ")||"Rota não informada";const bike=bikeById(t.bikeId);return `<article class="trip-card"><span class="trip-status ${t.status==="planejada"?"status-planejada":"status-realizada"}">${t.status==="planejada"?"📅 PRÓXIMA VIAGEM":"✓ REALIZADA"}</span><div class="title">${escapeHtml(t.name)}</div><div class="route">${escapeHtml(route)}</div><div class="trip-meta"><span>🛣️ ${Number(t.km||0).toLocaleString("pt-BR")} km</span><span>📅 ${formatDate(t.date)}</span>${bike?`<span>🏍️ ${escapeHtml(bike.name)}</span>`:""}${spent?`<span>💰 ${money(spent)}</span>`:""}</div>${t.status==="planejada"&&t.notes?`<div class="bike-details">${escapeHtml(t.notes)}</div>`:""}</article>`;}
function renderTrips(){const all=document.getElementById("allTrips");const filtered=trips.filter(t=>tripFilter==="todas"||t.status===tripFilter).sort((a,b)=>String(a.date).localeCompare(String(b.date))*(tripFilter==="planejada"?1:-1));document.getElementById("tripSummary").textContent=`${filtered.length} ${filtered.length===1?"viagem":"viagens"} nesta categoria`;all.innerHTML=filtered.length?filtered.map(tripCard).join(""):`<div class="empty">Nenhuma viagem nesta categoria.</div>`;}
function renderBikes(){const list=document.getElementById("bikeList");const arr=bikes.filter(b=>b.status===bikeFilter);list.innerHTML=arr.length?arr.map(b=>`<article class="bike-card"><div class="bike-top"><div><span class="bike-status ${b.status==="comigo"?"status-realizada":b.status==="planejada"?"status-planejada":""}">${b.status==="comigo"?"🟢 COMIGO":b.status==="vendida"?"🔴 VENDIDA":"🟡 PLANEJADA"}</span><div class="title">${escapeHtml(b.name)}</div></div>${b.year?`<b>${escapeHtml(b.year)}</b>`:""}</div><div class="bike-details">${b.consumption?`⛽ Média: ${b.consumption} km/L<br>`:""}${b.purchase?`💰 Compra: ${money(b.purchase)}<br>`:""}${b.sale?`💵 Venda: ${money(b.sale)}<br>`:""}${b.notes?escapeHtml(b.notes):""}</div></article>`).join(""):`<div class="empty">Nenhuma moto cadastrada aqui.<br><br><button class="ghost-btn" onclick="openBikeModal()">＋ Cadastrar moto</button></div>`;}
function calculateTrip(){const km=Number(document.getElementById("calcKm").value||0),cons=Number(document.getElementById("calcConsumption").value||0),price=Number(document.getElementById("calcFuelPrice").value||0),tolls=Number(document.getElementById("calcTolls").value||0);localStorage.setItem("casal_fuel_price",price);const liters=cons?km/cons:0,fuel=liters*price,total=fuel+tolls;document.getElementById("calcLiters").textContent=liters.toLocaleString("pt-BR",{maximumFractionDigits:1})+" L";document.getElementById("calcFuel").textContent=money(fuel);document.getElementById("calcTollResult").textContent=money(tolls);document.getElementById("calcTotal").textContent=money(total);}
function updateCalcDefaults(){const b=bikeById(document.getElementById("calcBike").value);if(b?.consumption)document.getElementById("calcConsumption").value=b.consumption;calculateTrip();}
function useCalcForTrip(){const km=document.getElementById("calcKm").value;const bikeId=document.getElementById("calcBike").value;openTripModal("planejada");document.getElementById("tripKm").value=km;document.getElementById("tripBike").value=bikeId;updateTripEstimate();showScreen("trips");document.getElementById("tripModal").classList.remove("hidden");}
function nextPlanned(){return trips.filter(t=>t.status==="planejada"&&t.date).sort((a,b)=>a.date.localeCompare(b.date))[0];}
function renderHome(){const planned=trips.filter(t=>t.status==="planejada"),done=trips.filter(t=>t.status!=="planejada"),km=done.reduce((s,t)=>s+Number(t.km||0),0),spent=done.reduce((s,t)=>s+(t.expenses||[]).reduce((a,e)=>a+Number(e.value||0),0),0);document.getElementById("totalKm").textContent=km.toLocaleString("pt-BR")+" km";document.getElementById("totalTrips").textContent=done.length;document.getElementById("totalSpent").textContent=money(spent);document.getElementById("plannedTrips").textContent=planned.length;const n=nextPlanned();document.getElementById("nextTrip").innerHTML=n?`<div class="next-highlight"><div class="date">${formatDate(n.date)}</div><h3>${escapeHtml(n.name)}</h3><p>${escapeHtml([n.origin,n.destination].filter(Boolean).join(" → ")||"Rota ainda não informada")}</p></div>`:`<div class="empty">Nenhuma próxima viagem cadastrada ainda. 🗺️</div>`;document.getElementById("recentTrips").innerHTML=done.length?done.slice(0,3).map(tripCard).join(""):`<div class="empty">Ainda não há viagens realizadas.</div>`;}
function render(){renderHome();renderTrips();renderBikes();renderRoute();populateBikeSelect("calcBike");calculateTrip();document.getElementById("statsKm").textContent=trips.filter(t=>t.status!=="planejada").reduce((s,t)=>s+Number(t.km||0),0).toLocaleString("pt-BR")+" km";document.getElementById("statsTrips").textContent=trips.filter(t=>t.status!=="planejada").length;document.getElementById("statsSpent").textContent=money(trips.filter(t=>t.status!=="planejada").reduce((s,t)=>s+(t.expenses||[]).reduce((a,e)=>a+Number(e.value||0),0),0));document.getElementById("statsPlanned").textContent=trips.filter(t=>t.status==="planejada").length;}
function formatDate(d){if(!d)return"--";const [y,m,day]=d.split("-");return`${day}/${m}/${y}`;}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
window.reloadAppData=function(){
  routeStamps=JSON.parse(localStorage.getItem(ROUTE_KEY)||"{}");
  trips=JSON.parse(localStorage.getItem(TRIP_KEY)||"[]").map(t=>({...t,status:t.status||"realizada",bikeId:t.bikeId||""}));
  bikes=JSON.parse(localStorage.getItem(BIKE_KEY)||"[]");
  render();
};
render();

// Tela de abertura: mostra a logo rapidamente e entra no app sem exigir rolagem.
window.addEventListener("load",()=>{
  setTimeout(()=>document.getElementById("splash")?.classList.add("hide"),650);
});

// PWA V1.5.6: procura atualizações ao abrir e ao voltar para o app.
if("serviceWorker" in navigator){
  window.addEventListener("load",async()=>{
    try{
      const registration=await navigator.serviceWorker.register("sw.js?v=1.5.6",{updateViaCache:"none"});
      await registration.update();
      document.addEventListener("visibilitychange",()=>{
        if(document.visibilityState==="visible") registration.update().catch(()=>{});
      });
      navigator.serviceWorker.addEventListener("controllerchange",()=>{
        if(!sessionStorage.getItem("dcr-sw-reloaded-v156")){
          sessionStorage.setItem("dcr-sw-reloaded-v156","1");
          window.location.reload();
        }
      });
    }catch(e){}
  });
}
