// Registra o Service Worker. Só funciona em http(s) ou localhost (não em file://).
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(e => console.warn("Service Worker não registrado:", e)));
}
