(() => {
  const KEY = "arcadeLocal.v1";
  const defaults = {scores:{}, games:{}, settings:{theme:"dark",volume:50}};
  function read(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(defaults)}}
  function write(data){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.warn("LocalStorage indisponível",e)}}
  window.ArcadeStore = {
    get: read,
    record(id,score,meta={}) {
      const d=read(), old=d.scores[id]||0;
      d.scores[id]=Math.max(old,Math.floor(score||0));
      const g=d.games[id]||{played:0,wins:0,losses:0,draws:0,seconds:0};
      g.played++; if(meta.result==="win")g.wins++; if(meta.result==="loss")g.losses++; if(meta.result==="draw")g.draws++;
      g.seconds += Math.max(0,Math.floor(meta.seconds||0)); d.games[id]=g; write(d);
      return d.scores[id];
    },
    saveSettings(settings){const d=read();d.settings={...d.settings,...settings};write(d)},
    clear(){localStorage.removeItem(KEY)},
    reset(){write(structuredClone(defaults))}
  };
})();