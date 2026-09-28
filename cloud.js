/* Diario Casal na Rota — sincronização V1.2 */
(function () {
  const cfg = window.DIARIO_SUPABASE_CONFIG || {};
  const configured = cfg.url && cfg.key && !String(cfg.url).startsWith("COLE_") && !String(cfg.key).startsWith("COLE_");
  let client = null;
  let session = null;
  let syncing = false;

  function setStatus(text, type = "") {
    const el = document.getElementById("cloudStatus");
    if (el) { el.textContent = text; el.className = "cloud-status " + type; }
    const small = document.getElementById("cloudHeaderStatus");
    if (small) small.textContent = text;
  }

  function updateUI() {
    const logged = !!session;
    const user = document.getElementById("cloudUser");
    const authBox = document.getElementById("cloudAuthBox");
    const loggedBox = document.getElementById("cloudLoggedBox");
    if (user) user.textContent = logged ? (session.user.email || "Conta conectada") : "Não conectado";
    if (authBox) authBox.classList.toggle("hidden", logged);
    if (loggedBox) loggedBox.classList.toggle("hidden", !logged);
    if (!configured) setStatus("Nuvem ainda não configurada", "warning");
    else if (logged) setStatus("☁️ Sincronização ativa", "ok");
    else setStatus("Faça login para sincronizar", "warning");
  }

  function openModal() { document.getElementById("cloudModal").classList.remove("hidden"); updateUI(); }
  function closeModal() { document.getElementById("cloudModal").classList.add("hidden"); }
  window.openCloudModal = openModal;
  window.closeCloudModal = closeModal;

  async function init() {
    if (!configured || !window.supabase) { updateUI(); return; }
    client = window.supabase.createClient(cfg.url, cfg.key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    const { data } = await client.auth.getSession();
    session = data.session;
    updateUI();
    client.auth.onAuthStateChange((_event, newSession) => {
      session = newSession;
      updateUI();
      if (session) setTimeout(syncNow, 0);
    });
    if (session) await syncNow();
  }

  function getLocalTrips() {
    try { return JSON.parse(localStorage.getItem("diario_biker_v1") || "[]"); } catch { return []; }
  }
  function getLocalBikes() {
    try { return JSON.parse(localStorage.getItem("diario_casal_na_rota_motos_v1") || "[]"); } catch { return []; }
  }
  function putLocalTrips(items) { localStorage.setItem("diario_biker_v1", JSON.stringify(items)); }
  function putLocalBikes(items) { localStorage.setItem("diario_casal_na_rota_motos_v1", JSON.stringify(items)); }

  async function syncNow() {
    if (!client || !session || syncing) return;
    syncing = true;
    setStatus("☁️ Sincronizando...", "syncing");
    try {
      const uid = session.user.id;
      let localTrips = getLocalTrips();
      let localBikes = getLocalBikes();
      const now = new Date().toISOString();
      localTrips = localTrips.map(x => ({ ...x, id: String(x.id), updated_at: x.updated_at || now }));
      localBikes = localBikes.map(x => ({ ...x, id: String(x.id), updated_at: x.updated_at || now }));

      if (localTrips.length) {
        const rows = localTrips.map(t => ({
          id: String(t.id), user_id: uid, name: t.name || "", date: t.date || null,
          km: Number(t.km || 0), origin: t.origin || "", destination: t.destination || "",
          notes: t.notes || "", expenses: t.expenses || [], status: t.status || "realizada",
          bike_id: t.bikeId ? String(t.bikeId) : null, updated_at: t.updated_at || now
        }));
        const { error } = await client.from("trips").upsert(rows, { onConflict: "id" });
        if (error) throw error;
      }

      if (localBikes.length) {
        const rows = localBikes.map(b => ({
          id: String(b.id), user_id: uid, name: b.name || "", year: b.year || "",
          consumption: Number(b.consumption || 0), status: b.status || "comigo",
          acquired: b.acquired || null, sold: b.sold || null,
          purchase: Number(b.purchase || 0), sale: Number(b.sale || 0),
          notes: b.notes || "", photo: b.photo || null, updated_at: b.updated_at || now
        }));
        const { error } = await client.from("bikes").upsert(rows, { onConflict: "id" });
        if (error) throw error;
      }

      const [{ data: remoteTrips, error: tripError }, { data: remoteBikes, error: bikeError }] = await Promise.all([
        client.from("trips").select("*").order("date", { ascending: false }),
        client.from("bikes").select("*").order("updated_at", { ascending: false })
      ]);
      if (tripError) throw tripError;
      if (bikeError) throw bikeError;

      const tripMap = new Map(localTrips.map(x => [String(x.id), x]));
      (remoteTrips || []).forEach(r => {
        if (!tripMap.has(String(r.id))) {
          tripMap.set(String(r.id), {
            id: String(r.id), name: r.name, date: r.date || "", km: Number(r.km || 0),
            origin: r.origin || "", destination: r.destination || "", notes: r.notes || "",
            expenses: r.expenses || [], status: r.status || "realizada", bikeId: r.bike_id || "",
            updated_at: r.updated_at
          });
        }
      });
      const bikeMap = new Map(localBikes.map(x => [String(x.id), x]));
      (remoteBikes || []).forEach(r => {
        if (!bikeMap.has(String(r.id))) {
          bikeMap.set(String(r.id), {
            id: String(r.id), name: r.name, year: r.year || "", consumption: Number(r.consumption || 0),
            status: r.status || "comigo", acquired: r.acquired || "", sold: r.sold || "",
            purchase: Number(r.purchase || 0), sale: Number(r.sale || 0), notes: r.notes || "", photo: r.photo || null,
            updated_at: r.updated_at
          });
        }
      });
      putLocalTrips([...tripMap.values()]);
      putLocalBikes([...bikeMap.values()]);
      if (window.reloadAppData) window.reloadAppData();
      setStatus("☁️ Sincronizado agora", "ok");
    } catch (err) {
      console.error(err);
      setStatus("⚠️ Erro na sincronização", "error");
      const msg = document.getElementById("cloudMessage");
      if (msg) msg.textContent = err.message || "Verifique a configuração da nuvem.";
    } finally { syncing = false; }
  }

  async function signIn() {
    if (!client) { setStatus("Configure o Supabase primeiro", "warning"); return; }
    const email = document.getElementById("cloudEmail").value.trim();
    const password = document.getElementById("cloudPassword").value;
    const msg = document.getElementById("cloudMessage");
    msg.textContent = "Entrando...";
    const { error } = await client.auth.signInWithPassword({ email, password });
    msg.textContent = error ? error.message : "Login realizado. Sincronizando...";
    if (!error) setTimeout(closeModal, 500);
  }

  async function signUp() {
    if (!client) { setStatus("Configure o Supabase primeiro", "warning"); return; }
    const email = document.getElementById("cloudEmail").value.trim();
    const password = document.getElementById("cloudPassword").value;
    const msg = document.getElementById("cloudMessage");
    if (password.length < 6) { msg.textContent = "A senha precisa ter pelo menos 6 caracteres."; return; }
    msg.textContent = "Criando conta...";
    const { data, error } = await client.auth.signUp({ email, password });
    msg.textContent = error ? error.message : (data.session ? "Conta criada e conectada." : "Conta criada. Verifique o e-mail para confirmar e depois entre no app.");
  }

  async function signOut() { if (client) await client.auth.signOut(); closeModal(); }
  window.cloudSignIn = signIn;
  window.cloudSignUp = signUp;
  window.cloudSignOut = signOut;
  window.cloudSyncNow = syncNow;

  document.addEventListener("DOMContentLoaded", init);
})();
