(() => {
const catalog=[
{id:"snake",name:"Snake",desc:"Cresça, desvie e bata seu recorde.",icon:"〰",color:"#34d399",tint:"#34d39920"},
{id:"tetris",name:"Tetris",desc:"Encaixe as peças e limpe as linhas.",icon:"▦",color:"#38bdf8",tint:"#38bdf820"},
{id:"pong",name:"Pong",desc:"Encare a CPU em uma disputa clássica.",icon:"◉",color:"#a78bfa",tint:"#a78bfa20"},
{id:"flappy",name:"Flappy Bird",desc:"Atravesse os obstáculos sem colidir.",icon:"🐤",color:"#fbbf24",tint:"#fbbf2420"},
{id:"tictactoe",name:"Jogo da Velha",desc:"Supere a inteligência artificial.",icon:"✕",color:"#fb7185",tint:"#fb718520"},
{id:"memory",name:"Jogo da Memória",desc:"Encontre todos os pares de cartas.",icon:"▧",color:"#c084fc",tint:"#c084fc20"},
{id:"2048",name:"2048",desc:"Combine números até alcançar 2048.",icon:"²",color:"#f59e0b",tint:"#f59e0b20"},
{id:"mines",name:"Campo Minado",desc:"Revele as casas seguras do tabuleiro.",icon:"✹",color:"#f87171",tint:"#f8717120"},
{id:"breakout",name:"Quebra-blocos",desc:"Destrua todos os blocos com a bola.",icon:"▬",color:"#fb923c",tint:"#fb923c20"},
{id:"invaders",name:"Space Invaders",desc:"Defenda a Terra contra a invasão.",icon:"👾",color:"#4ade80",tint:"#4ade8020"},
{id:"hangman",name:"Forca",desc:"Descubra a palavra antes do boneco.",icon:"✎",color:"#f472b6",tint:"#f472b620"},
{id:"sudoku",name:"Sudoku",desc:"Preencha a grade sem repetir números.",icon:"▩",color:"#2dd4bf",tint:"#2dd4bf20"},
{id:"chess",name:"Xadrez",desc:"Enfrente a IA em uma partida completa.",icon:"♞",color:"#94a3b8",tint:"#94a3b820"},
{id:"checkers",name:"Damas",desc:"Capture todas as peças da IA.",icon:"◎",color:"#f43f5e",tint:"#f43f5e20"}
];
const $=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const button=(txt,fn)=>{const b=$("button","game-btn",txt);b.onclick=fn;return b};
let disposers=[];
const stopAll=()=>{disposers.forEach(f=>{try{f()}catch(e){}});disposers=[]};
const listen=(t,ev,fn)=>{t.addEventListener(ev,fn);disposers.push(()=>t.removeEventListener(ev,fn))};
const every=(fn,ms)=>{const id=setInterval(fn,ms);disposers.push(()=>clearInterval(id))};
const loop=fn=>{let id;const step=t=>{fn(t);id=requestAnimationFrame(step)};id=requestAnimationFrame(step);disposers.push(()=>cancelAnimationFrame(id))};
function setup(root,id,onEnd){
 stopAll();root.innerHTML="";const shell=$("div","game-shell");root.append(shell);
 let ended=false,t0=Date.now();
 const finish=(score,result="win")=>{if(ended)return;ended=true;onEnd(Math.max(0,Math.floor(score)),result,Math.floor((Date.now()-t0)/1000))};
 const rearm=()=>{ended=false;t0=Date.now()};
 const hud=(items)=>{const h=$("div","game-hud");items.forEach(([k,v])=>{const b=$("div","hud-box");b.append($("small","",k));b.append($("strong","",v));h.append(b)});shell.append(h);return items.map((_,i)=>h.children[i].lastChild)};
 const msg=$("div","game-message");shell.append(msg);
 const controls=$("div","game-toolbar");shell.append(controls);
 return {shell,finish,rearm,hud,msg,controls};
}
const loopDt=fn=>{let p=0;loop(t=>{const d=p?Math.min((t-p)/16.667,2):1;p=t;fn(d)})};
const picker=(g,opts,def)=>{let cur=def;const row=$("div","game-toolbar pick");g.shell.insertBefore(row,g.msg);const bs=Object.keys(opts).map(k=>{const b=button(k,()=>{cur=k;paint()});row.append(b);return b});const paint=()=>bs.forEach(b=>b.classList.toggle("on",b.textContent===cur));paint();return ()=>opts[cur]};
function canvasGame(shell,w,h){const c=$("canvas","game-canvas");c.width=w;c.height=h;c.style.width=`min(100%,${w}px)`;shell.append(c);return [c,c.getContext("2d")]}
function snake(root,end){
 const g=setup(root,"snake",end),[scoreEl,sizeEl]=g.hud([["PONTOS","0"],["TAMANHO","3"]]);
 const [c,x]=canvasGame(g.shell,400,400),n=20,cell=20,STEP=105;let body,dir,q,food,score,run=false,over=false,last=0;
 const place=()=>{do{food={x:Math.floor(Math.random()*n),y:Math.floor(Math.random()*n)}}while(body.some(p=>p.x===food.x&&p.y===food.y))};
 const rr=(a,b,w,h,r)=>{x.beginPath();x.roundRect(a,b,w,h,r);x.fill()};
 const draw=()=>{x.fillStyle="#0b1220";x.fillRect(0,0,400,400);for(let i=0;i<n;i++)for(let j=0;j<n;j++)if((i+j)%2===0){x.fillStyle="#ffffff08";x.fillRect(i*cell,j*cell,cell,cell)}
  x.shadowColor="#fb7185";x.shadowBlur=14;x.fillStyle="#fb7185";x.beginPath();x.arc(food.x*cell+10,food.y*cell+10,7,0,7);x.fill();x.shadowBlur=0;
  body.forEach((p,i)=>{x.fillStyle=i?`hsl(${165-i*2},65%,${48-Math.min(i,16)}%)`:"#6ee7b7";rr(p.x*cell+1,p.y*cell+1,18,18,i?5:8)})};
 const reset=()=>{body=[{x:9,y:10},{x:8,y:10},{x:7,y:10}];dir={x:1,y:0};q=[];score=0;run=false;over=false;scoreEl.textContent=0;sizeEl.textContent=3;place();g.rearm();draw()};
 const tick=()=>{if(!run||over)return;if(q.length)dir=q.shift();const h={x:body[0].x+dir.x,y:body[0].y+dir.y};
  if(h.x<0||h.y<0||h.x>=n||h.y>=n||body.some(p=>p.x===h.x&&p.y===h.y)){over=true;run=false;g.msg.textContent="Fim de jogo! Clique em Reiniciar.";g.finish(score,"loss");return}
  body.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;scoreEl.textContent=score;place()}else body.pop();sizeEl.textContent=body.length;draw()};
 const turn=m=>{const ref=q.length?q[q.length-1]:dir;if(q.length>=3||(m[0]===ref.x&&m[1]===ref.y)||(m[0]===-ref.x&&m[1]===-ref.y))return;q.push({x:m[0],y:m[1]});const now=performance.now();if(now-last>STEP*.45){last=now;tick()}};
 const start=()=>{if(over)reset();if(!run){run=true;last=performance.now();g.msg.textContent=""}};
 g.controls.append(button("▶ Iniciar",start),button("↻ Reiniciar",()=>{reset();run=true;last=performance.now();g.msg.textContent=""}));
 listen(document,"keydown",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key,m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[k];if(!m)return;e.preventDefault();if(run)turn(m)});
 let sx,sy;listen(c,"pointerdown",e=>{sx=e.clientX;sy=e.clientY});listen(c,"pointerup",e=>{if(!run||sx===undefined)return;const a=e.clientX-sx,b=e.clientY-sy;if(Math.max(Math.abs(a),Math.abs(b))<20)return;turn(Math.abs(a)>Math.abs(b)?[a>0?1:-1,0]:[0,b>0?1:-1])});
 loop(t=>{if(run&&t-last>=STEP){last=t;tick()}});reset();g.msg.textContent="Clique em Iniciar";
}
function tetris(root,end){
 const g=setup(root,"tetris",end),[sc,ln,lv]=g.hud([["PONTOS","0"],["LINHAS","0"],["NÍVEL","1"]]);
 const layout=$("div","tetris-layout");g.shell.append(layout);const wrap=$("div");layout.append(wrap);
 const c=$("canvas","game-canvas");c.width=300;c.height=600;c.style.width="min(65vw,300px)";wrap.append(c);const ctx=c.getContext("2d");
 const side=$("div","tetris-side");layout.append(side);side.append($("small","","PRÓXIMA"));const nc=$("canvas");nc.width=100;nc.height=100;side.append(nc);const nx=nc.getContext("2d");
 const C=10,R=20,S=30,colors=["","#38bdf8","#2563eb","#f59e0b","#facc15","#22c55e","#a855f7","#ef4444"],shapes=[null,[[1,1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1],[1,1]],[[0,1,1],[1,1,0]],[[0,1,0],[1,1,1]],[[1,1,0],[0,1,1]]];
 let grid,cur,next,score=0,lines=0,level=1,run=false,pause=false,over=false,last=0,acc=0,raf;
 const random=()=>1+Math.floor(Math.random()*7),piece=id=>{let m=shapes[id].map(r=>r.slice());return{id,m,x:Math.floor((C-m[0].length)/2),y:0}};
 const coll=(p,dx=0,dy=0,m=p.m)=>m.some((r,y)=>r.some((v,x)=>v&&(p.x+x+dx<0||p.x+x+dx>=C||p.y+y+dy>=R||(p.y+y+dy>=0&&grid[p.y+y+dy][p.x+x+dx]))));
 const stats=()=>{sc.textContent=score;ln.textContent=lines;lv.textContent=level};
 const nextDraw=()=>{nx.clearRect(0,0,100,100);const m=shapes[next],s=20,ox=(100-m[0].length*s)/2,oy=(100-m.length*s)/2;nx.fillStyle=colors[next];m.forEach((r,y)=>r.forEach((v,x)=>{if(v)nx.fillRect(ox+x*s+1,oy+y*s+1,18,18)}))};
 const spawn=()=>{cur=piece(next);next=random();nextDraw();if(coll(cur)){over=true;run=false;g.msg.textContent="Fim de jogo — "+score+" pontos";g.finish(score,"loss")}};
 const start=()=>{g.rearm();grid=Array.from({length:R},()=>Array(C).fill(0));score=lines=0;level=1;next=random();over=pause=false;run=true;acc=0;spawn();stats();g.msg.textContent="";last=performance.now()};
 const lock=()=>{cur.m.forEach((r,y)=>r.forEach((v,x)=>{if(v&&cur.y+y>=0)grid[cur.y+y][cur.x+x]=cur.id}));let n=0;for(let y=R-1;y>=0;y--)if(grid[y].every(Boolean)){grid.splice(y,1);grid.unshift(Array(C).fill(0));n++;y++}if(n){lines+=n;score+=[0,100,300,500,800][n]*level;level=Math.floor(lines/10)+1}stats();spawn()};
 const move=(dx,dy)=>{if(!run||pause||over)return;if(!coll(cur,dx,dy)){cur.x+=dx;cur.y+=dy;if(dy)score++;stats()}else if(dy>0)lock()};
 const rotate=()=>{if(!run||pause||over)return;const m=cur.m[0].map((_,i)=>cur.m.map(r=>r[i]).reverse());for(const k of [0,-1,1,-2,2])if(!coll(cur,k,0,m)){cur.x+=k;cur.m=m;break}};
 const drop=()=>{if(!run||pause||over)return;while(!coll(cur,0,1)){cur.y++;score+=2}lock();stats()};
 const cell=(id,x,y,ghost=false)=>{ctx.fillStyle=ghost?colors[id]+"55":colors[id];ctx.fillRect(x*S+1,y*S+1,S-2,S-2);if(!ghost){ctx.fillStyle="#ffffff44";ctx.fillRect(x*S+3,y*S+3,S-6,3)}};
 const draw=()=>{ctx.fillStyle="#0b1220";ctx.fillRect(0,0,300,600);ctx.strokeStyle="#263449";for(let i=0;i<=C;i++){ctx.beginPath();ctx.moveTo(i*S,0);ctx.lineTo(i*S,600);ctx.stroke()}for(let i=0;i<=R;i++){ctx.beginPath();ctx.moveTo(0,i*S);ctx.lineTo(300,i*S);ctx.stroke()}grid?.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(v,x,y)}));if(cur){let ghost={...cur};while(!coll(ghost,0,1))ghost.y++;ghost.m.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(cur.id,ghost.x+x,ghost.y+y,true)}));cur.m.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(cur.id,cur.x+x,cur.y+y)}))}};
 const frame=t=>{const dt=Math.min(t-last,100);last=t;if(run&&!pause&&!over){acc+=dt;if(acc>=Math.max(75,800-(level-1)*65)){move(0,1);acc=0}}draw()};
 const togglePause=()=>{if(!run||over)return;pause=!pause;g.msg.textContent=pause?"PAUSADO":""};
 const key=e=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key))e.preventDefault();if(e.key==="p"||e.key==="P"){togglePause();return}if(e.key==="ArrowLeft")move(-1,0);if(e.key==="ArrowRight")move(1,0);if(e.key==="ArrowDown")move(0,1);if(e.key==="ArrowUp")rotate();if(e.key===" ")drop()};
 listen(document,"keydown",key);g.controls.append(button("▶ Iniciar",()=>{if(!run||over)start();else if(pause)togglePause()}),button("Ⅱ Pausar",togglePause),button("↻ Reiniciar",start),button("⬅",()=>move(-1,0)),button("↻",rotate),button("⬇",()=>move(0,1)),button("➡",()=>move(1,0)),button("Queda instantânea",drop));
 next=random();nextDraw();g.msg.textContent="Clique em Iniciar";last=performance.now();loop(frame);
}
function pong(root,end){
 const g=setup(root,"pong",end),[pe,ce]=g.hud([["VOCÊ","0"],["CPU","0"],["META","5"]]),[c,x]=canvasGame(g.shell,600,360);
 const pick=picker(g,{"Fácil":{v:5.5,cpu:3,k:.06,mx:10,gr:1.03},"Normal":{v:7,cpu:4.6,k:.09,mx:12.5,gr:1.05},"Difícil":{v:8.5,cpu:6.4,k:.13,mx:14,gr:1.06}},"Normal");
 let py,cy,bx,by,vx,vy,ps,cs,run=false,over=false;const lim=v=>Math.max(-8,Math.min(8,v));
 const serve=()=>{const v=pick().v;bx=300;by=180;vx=(Math.random()>.5?1:-1)*v;vy=(Math.random()-.5)*v*.8};
 const draw=()=>{x.fillStyle="#0b1220";x.fillRect(0,0,600,360);x.setLineDash([8,10]);x.strokeStyle="#52617b";x.beginPath();x.moveTo(300,0);x.lineTo(300,360);x.stroke();x.setLineDash([]);x.fillStyle="#a78bfa";x.fillRect(18,py,10,65);x.fillStyle="#22d3ee";x.fillRect(572,cy,10,65);x.fillStyle="#fff";x.beginPath();x.arc(bx,by,8,0,7);x.fill()};
 const reset=()=>{py=cy=147;ps=cs=0;pe.textContent=0;ce.textContent=0;run=false;over=false;serve();g.rearm();draw()};
 const step=d=>{if(!run||over)return;const P=pick();bx+=vx*d;by+=vy*d;if(by<8||by>352){vy*=-1;by=by<8?8:352}
  if(vx<0&&bx<28&&bx>2&&by>py-4&&by<py+69){vx=Math.min(Math.abs(vx)*P.gr,P.mx);vy=lim(vy+(by-(py+32))*.12);bx=28}
  if(vx>0&&bx>572&&bx<598&&by>cy-4&&by<cy+69){vx=-Math.min(Math.abs(vx)*P.gr,P.mx);vy=lim(vy+(by-(cy+32))*.12);bx=572}
  const df=(vx>0?by-32:147)-cy;cy+=Math.max(-P.cpu*d,Math.min(P.cpu*d,df*P.k*d));cy=Math.max(0,Math.min(295,cy));
  if(bx<0){cs++;ce.textContent=cs;serve()}else if(bx>600){ps++;pe.textContent=ps;serve()}
  if(ps>=5||cs>=5){over=true;run=false;g.msg.textContent=ps>cs?"VOCÊ VENCEU!":"A CPU VENCEU";g.finish(ps*100,ps>cs?"win":"loss")}};
 const start=()=>{if(over)reset();if(!run){run=true;g.msg.textContent=""}};
 g.controls.append(button("▶ Iniciar",start),button("↻ Reiniciar",()=>{reset();run=true;g.msg.textContent=""}));
 listen(document,"mousemove",e=>{const r=c.getBoundingClientRect();py=Math.max(0,Math.min(295,(e.clientY-r.top)*360/r.height-32))});
 listen(document,"keydown",e=>{if(e.key==="ArrowUp"){e.preventDefault();py=Math.max(0,py-28)}if(e.key==="ArrowDown"){e.preventDefault();py=Math.min(295,py+28)}});
 loopDt(d=>{step(d);draw()});reset();g.msg.textContent="Clique em Iniciar";
}
function flappy(root,end){
 const g=setup(root,"flappy",end),[sc]=g.hud([["PONTOS","0"]]),[c,x]=canvasGame(g.shell,400,500);
 const pick=picker(g,{"Fácil":{h:80,s:2.6,g:.32,f:-6.6,sp:230},"Normal":{h:66,s:3.3,g:.38,f:-7.2,sp:200},"Difícil":{h:56,s:4.1,g:.44,f:-7.8,sp:180}},"Normal");
 let bird,vel,pipes,score,alive,run=false;
 const reset=()=>{bird=220;vel=0;pipes=[];score=0;alive=true;run=false;sc.textContent=0;g.rearm()};
 const start=()=>{if(!alive)reset();run=true;g.msg.textContent=""};
 const flap=()=>{if(run&&alive)vel=pick().f};
 g.controls.append(button("▶ Iniciar",start),button("↻ Reiniciar",()=>{reset();run=true;g.msg.textContent=""}),button("↥ Bater asas",flap));
 listen(c,"pointerdown",flap);listen(document,"keydown",e=>{if(e.code==="Space"||e.key==="ArrowUp"){e.preventDefault();flap()}});
 loopDt(d=>{const P=pick();
  if(run&&alive){vel+=P.g*d;bird+=vel*d;const lp=pipes[pipes.length-1];if(!lp||lp.x<420-P.sp)pipes.push({x:420,c:P.h+40+Math.random()*(390-2*P.h-80),passed:false});
   pipes.forEach(p=>{p.x-=P.s*d;if(!p.passed&&p.x<65){p.passed=true;score++;sc.textContent=score}if(81>p.x&&49<p.x+52&&(bird-12<p.c-P.h||bird+12>p.c+P.h))alive=false});
   pipes=pipes.filter(p=>p.x>-60);if(bird<12||bird>378)alive=false;
   if(!alive){run=false;g.msg.textContent="Fim de jogo! Clique em Reiniciar.";g.finish(score*10,"loss")}}
  x.fillStyle="#10253c";x.fillRect(0,0,400,500);x.fillStyle="#34d399";pipes.forEach(p=>{x.fillRect(p.x,0,52,p.c-P.h);x.fillRect(p.x,p.c+P.h,52,500)});
  x.fillStyle="#1d4b64";x.fillRect(0,390,400,110);x.fillStyle="#fbbf24";x.beginPath();x.arc(65,bird,13,0,7);x.fill();x.fillStyle="#fff";x.beginPath();x.arc(70,bird-4,4,0,7);x.fill();
  if(!run&&alive){x.font="bold 18px sans-serif";x.fillStyle="#fff";x.fillText("Clique em Iniciar",125,250)}
 });
 reset();g.msg.textContent="Clique em Iniciar";
}
function tictactoe(root,end){
 const g=setup(root,"tictactoe",end),[he,ae,de]=g.hud([["VOCÊ (X)","0"],["IA (O)","0"],["EMPATES","0"]]);let board=Array(9).fill(""),human=0,ai=0,draws=0,playing=false;
 const b=$("div","game-board");b.style.gridTemplateColumns="repeat(3,minmax(75px,110px))";b.style.gridTemplateRows="repeat(3,minmax(75px,110px))";g.shell.append(b);
 const check=a=>{for(const l of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]])if(a[l[0]]&&a[l[0]]===a[l[1]]&&a[l[1]]===a[l[2]])return a[l[0]];return a.every(Boolean)?"draw":null};
 const render=()=>{b.innerHTML="";board.forEach((v,i)=>{const c=button(v||"·",()=>play(i));c.style.fontSize="38px";c.style.aspectRatio="1";c.style.color=v==="X"?"#22d3ee":"#c4b5fd";b.append(c)})};
 const status=()=>{he.textContent=human;ae.textContent=ai;de.textContent=draws};
 const over=r=>{playing=false;if(r==="X"){human++;g.msg.textContent="Você venceu! Clique em Iniciar para outra rodada.";g.finish(100,"win")}else if(r==="O"){ai++;g.msg.textContent="A IA venceu. Clique em Iniciar para outra rodada.";g.finish(0,"loss")}else{draws++;g.msg.textContent="Empate. Clique em Iniciar para outra rodada.";g.finish(30,"draw")}status()};
 const play=i=>{if(!playing||board[i])return;board[i]="X";let r=check(board);if(r){render();over(r);return}const empty=board.map((v,j)=>v?null:j).filter(v=>v!==null);let move=empty.find(j=>{let a=board.slice();a[j]="O";return check(a)==="O"});if(move===undefined)move=empty.find(j=>{let a=board.slice();a[j]="X";return check(a)==="X"});if(move===undefined&&board[4]==="")move=4;if(move===undefined)move=empty[Math.floor(Math.random()*empty.length)];board[move]="O";r=check(board);render();if(r)over(r)};
 const round=()=>{board=Array(9).fill("");playing=true;g.rearm();g.msg.textContent="Sua vez.";render()};
 g.controls.append(button("▶ Iniciar",()=>{if(!playing)round()}),button("↻ Reiniciar",round),button("Zerar placar",()=>{human=ai=draws=0;status()}));
 render();g.msg.textContent="Clique em Iniciar";
}
function memory(root,end){
 const g=setup(root,"memory",end),[mv,pr,tm]=g.hud([["TENTATIVAS","0"],["PARES","0/8"],["TEMPO","0s"]]);const icons=["🍒","🚀","🎮","⭐","🍀","💎","👾","⚡"];
 let deck,cards,first,lock,found,tries,sec,playing=false;const b=$("div","game-board");b.style.gridTemplateColumns="repeat(4,minmax(55px,85px))";g.shell.append(b);
 const reset=()=>{deck=[...icons,...icons].sort(()=>Math.random()-.5);first=null;lock=false;found=tries=sec=0;playing=false;mv.textContent=0;pr.textContent="0/8";tm.textContent="0s";b.innerHTML="";cards=deck.map((v,i)=>{const c=$("button","memory-card","?");c.onclick=()=>flip(i);b.append(c);return c});g.rearm()};
 every(()=>{if(playing){sec++;tm.textContent=sec+"s"}},1000);
 function flip(i){if(!playing||lock||cards[i].classList.contains("matched")||cards[i]===first)return;const a=cards[i];a.textContent=deck[i];a.classList.add("flipped");if(first===null){first=a;return}tries++;mv.textContent=tries;const f=first,j=cards.indexOf(f);first=null;
  if(deck[i]===deck[j]){a.classList.add("matched");f.classList.add("matched");found++;pr.textContent=found+"/8";if(found===8){playing=false;g.msg.textContent="Memória perfeita!";g.finish(Math.max(10,1000-tries*20-sec*2),"win")}}
  else{lock=true;setTimeout(()=>{a.textContent="?";f.textContent="?";a.classList.remove("flipped");f.classList.remove("flipped");lock=false},700)}}
 const begin=()=>{reset();playing=true;g.msg.textContent=""};
 g.controls.append(button("▶ Iniciar",()=>{if(!playing)begin()}),button("↻ Reiniciar",begin));reset();g.msg.textContent="Clique em Iniciar";
}
function game2048(root,end){
 const g=setup(root,"2048",end),[sc,bt]=g.hud([["PONTOS","0"],["MELHOR PEÇA","2"]]);let board,score,playing=false;const b=$("div","game-board");b.style.gridTemplateColumns="repeat(4,minmax(55px,90px))";b.style.background="#34445e";b.style.padding="7px";b.style.borderRadius="10px";g.shell.append(b);
 const add=()=>{let a=[];board.forEach((r,y)=>r.forEach((v,x)=>{if(!v)a.push([y,x])}));if(a.length){let [y,x]=a[Math.floor(Math.random()*a.length)];board[y][x]=Math.random()<.9?2:4}};
 const colors={2:"#64748b",4:"#0e7490",8:"#0891b2",16:"#7c3aed",32:"#9333ea",64:"#c026d3",128:"#d97706",256:"#ea580c",512:"#dc2626",1024:"#be123c",2048:"#facc15"};
 const render=()=>{b.innerHTML="";bt.textContent=Math.max(...board.flat());sc.textContent=score;board.flat().forEach(v=>{const c=$("div","cell",v||"");c.style.width="min(19vw,82px)";c.style.height="min(19vw,82px)";c.style.fontSize="clamp(17px,4vw,25px)";c.style.background=v?(colors[v]||"#7c3aed"):"#26354d";b.append(c)})};
 const reset=()=>{board=Array.from({length:4},()=>Array(4).fill(0));score=0;add();add();render();g.rearm()};
 const move=dir=>{if(!playing)return;const old=JSON.stringify(board);
  for(let i=0;i<4;i++){let line=dir==="left"?board[i].slice():dir==="right"?board[i].slice().reverse():dir==="up"?board.map(r=>r[i]):board.map(r=>r[i]).reverse();
   line=line.filter(Boolean);for(let j=0;j<line.length-1;j++)if(line[j]===line[j+1]){line[j]*=2;score+=line[j];line.splice(j+1,1)}
   while(line.length<4)line.push(0);if(dir==="right"||dir==="down")line.reverse();
   if(dir==="left"||dir==="right")board[i]=line;else line.forEach((v,j)=>{board[j][i]=v})}
  if(JSON.stringify(board)===old)return;add();render();
  if(Math.max(...board.flat())>=2048){playing=false;g.msg.textContent="2048 alcançado!";g.finish(score+2048,"win")}
  else if(!board.some(r=>r.includes(0))&&!board.some((r,y)=>r.some((v,x)=>(x<3&&v===r[x+1])||(y<3&&v===board[y+1][x])))){playing=false;g.msg.textContent="Sem movimentos. Clique em Reiniciar.";g.finish(score,"loss")}};
 const begin=()=>{reset();playing=true;g.msg.textContent=""};
 listen(document,"keydown",e=>{const m={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"}[e.key];if(!m)return;e.preventDefault();move(m)});
 g.controls.append(button("▶ Iniciar",()=>{if(!playing)begin()}),button("↻ Reiniciar",begin));reset();g.msg.textContent="Clique em Iniciar";
}
function mines(root,end){
 const g=setup(root,"mines",end),[,re,op]=g.hud([["MINAS","10"],["RESTANTES","10"],["CASAS ABERTAS","0"]]);const NC=["","#60a5fa","#34d399","#f87171","#a78bfa","#fb923c","#22d3ee","#e5e7eb","#9ca3af"],N=10,M=10,K=10;let grid,opened,flagged,planted,playing=false,flagMode=false;
 const b=$("div","game-board");b.style.gridTemplateColumns="repeat(10,minmax(22px,34px))";b.style.gap="3px";g.shell.append(b);
 const init=()=>{grid=Array.from({length:N},()=>Array.from({length:M},()=>({mine:false,open:false,flag:false,n:0})));opened=flagged=0;planted=false;playing=false;g.rearm()};
 const plant=(y0,x0)=>{let k=0;while(k<K){const y=Math.random()*N|0,x=Math.random()*M|0;if(grid[y][x].mine||(Math.abs(y-y0)<=1&&Math.abs(x-x0)<=1))continue;grid[y][x].mine=true;k++}grid.forEach((r,y)=>r.forEach((c,x)=>{let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(grid[y+dy]?.[x+dx]?.mine)n++;c.n=n}));planted=true};
 const status=()=>{re.textContent=K-flagged;op.textContent=opened};
 const render=()=>{b.innerHTML="";grid.forEach((r,y)=>r.forEach((cell,x)=>{const c=$("button","cell",cell.open?(cell.mine?"✹":cell.n||""):cell.flag?"⚑":"");c.style.width="min(8vw,34px)";c.style.height="min(8vw,34px)";c.style.fontSize="13px";c.style.background=cell.open?"#64748b":"#26354d";c.style.color=cell.open?(cell.mine?"#fb7185":NC[cell.n]||"#e0f2fe"):"#e0f2fe";c.oncontextmenu=e=>{e.preventDefault();flag(y,x)};c.onclick=()=>reveal(y,x);b.append(c)}))};
 const flag=(y,x)=>{const c=grid[y][x];if(!playing||c.open)return;c.flag=!c.flag;flagged+=c.flag?1:-1;status();render()};
 const flood=(a,z)=>{const c=grid[a][z];if(c.open||c.flag||c.mine)return;c.open=true;opened++;if(!c.n)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const yy=a+dy,xx=z+dx;if(yy>=0&&yy<N&&xx>=0&&xx<M)flood(yy,xx)}};
 const reveal=(y,x)=>{if(!playing)return;if(flagMode){flag(y,x);return}const c=grid[y][x];if(c.open||c.flag)return;if(!planted)plant(y,x);
  if(c.mine){grid.forEach(r=>r.forEach(q=>{if(q.mine)q.open=true}));playing=false;g.msg.textContent="Você encontrou uma mina. Clique em Reiniciar.";g.finish(opened,"loss")}
  else{flood(y,x);if(opened===N*M-K){playing=false;g.msg.textContent="Campo limpo!";g.finish(500,"win")}}status();render()};
 const begin=()=>{init();playing=true;status();render();g.msg.textContent=""};
 const fb=button("⚑ Bandeira: off",()=>{flagMode=!flagMode;fb.textContent="⚑ Bandeira: "+(flagMode?"on":"off")});
 g.controls.append(button("▶ Iniciar",()=>{if(!playing)begin()}),button("↻ Reiniciar",begin),fb);init();status();render();g.msg.textContent="Clique em Iniciar";
}
const WORDS={"Animais":"gato,cachorro,elefante,girafa,leao,tigre,zebra,macaco,golfinho,tartaruga,cavalo,coelho,pinguim,jacare,borboleta,ornitorrinco,hipopotamo,camaleao,crocodilo,rinoceronte,avestruz,flamingo,tamandua,capivara,lobo guara,urso polar,arara azul,tubarao,aguia,coruja",
"Frutas":"banana,laranja,morango,abacaxi,melancia,manga,uva,pera,limao,goiaba,mamao,cereja,kiwi,acerola,framboesa,jabuticaba,tangerina,maracuja,caju,pitanga,carambola,lichia,amora,figo,pessego,ameixa,coco,cupuacu,graviola",
"Países":"brasil,argentina,portugal,japao,canada,mexico,franca,italia,espanha,egito,chile,peru,india,alemanha,australia,colombia,uruguai,paraguai,noruega,suecia,grecia,turquia,russia,china,africa do sul,nova zelandia,coreia do sul,inglaterra,holanda,suica",
"Tecnologia":"teclado,internet,programa,algoritmo,navegador,servidor,computador,monitor,roteador,software,javascript,variavel,compilador,processador,memoria,banco de dados,inteligencia artificial,aplicativo,notebook,smartphone,criptografia,firewall,bluetooth,realidade virtual,nuvem,python,linux,github,pixel,hardware",
"Animes":"naruto,goku,luffy,zoro,sasuke,sakura,kakashi,itachi,vegeta,gohan,ichigo,eren,mikasa,levi,tanjiro,nezuko,zenitsu,deku,all might,light yagami,edward elric,sailor moon,pikachu,ash ketchum,killua,saitama,genos,megumin,inuyasha,one piece,dragon ball,death note,attack on titan,demon slayer,my hero academia,jujutsu kaisen,gojo,sukuna,itadori,denji,gon freecss,hinata,boruto,jiraiya,tsunade,trunks,bulma,piccolo,freeza,sanji,nami,chopper,usopp,nico robin",
"Desenhos":"mickey,minnie,pato donald,pateta,pluto,bob esponja,patrick,lula molusco,sirigueijo,simba,elsa,anna,olaf,woody,buzz lightyear,shrek,bugs bunny,patolino,pernalonga,tom,jerry,scooby doo,salsicha,homer simpson,bart,lisa,stewie,finn,jake,ben 10,monica,cebolinha,cascao,magali,pica pau,taz,stitch,moana,maui,nemo,dory,mike wazowski,sulley,rapunzel,aladdin,mulan,tarzan,popeye,fred flintstone,pantera cor de rosa,dexter,coragem,chaves,kiko",
"Esportes":"futebol,basquete,volei,natacao,tenis,judo,boxe,atletismo,handebol,surfe,skate,ciclismo,ginastica,remo,esgrima,golfe,rugby,capoeira,tenis de mesa,formula um,jiu jitsu,karate,beisebol,hoquei,badminton,maratona,triatlo,patinacao,escalada,polo aquatico",
"Comidas":"pizza,lasanha,feijoada,hamburguer,brigadeiro,coxinha,pastel,tapioca,acaraje,pamonha,macarrao,sorvete,pudim,pao de queijo,arroz,feijao,churrasco,sushi,taco,bolo,panqueca,omelete,estrogonofe,moqueca,esfiha,beijinho,quindim,cuscuz,farofa,salada",
"Profissões":"medico,engenheiro,professor,programador,bombeiro,piloto,dentista,advogado,arquiteto,chef,padeiro,motorista,eletricista,jornalista,fotografo,veterinario,enfermeiro,psicologo,mecanico,pedreiro,astronauta,cientista,policial,juiz,designer,musico,ator,fazendeiro,pescador,carteiro",
"Games":"minecraft,fortnite,zelda,mario,sonic,tetris,pacman,pokemon,roblox,free fire,gta,league of legends,super mario,call of duty,among us,street fighter,mortal kombat,crash bandicoot,donkey kong,fifa,valorant,counter strike,god of war,the last of us,resident evil,dark souls,overwatch,stardew valley,hollow knight,undertale,terraria,kirby,metroid"};
function breakout(root,end){
 const g=setup(root,"breakout",end),[sc,lv,lvl]=g.hud([["PONTOS","0"],["VIDAS","3"],["FASE","1"]]),[c,x]=canvasGame(g.shell,480,520);
 const pick=picker(g,{"Fácil":{v:6.2,pw:104},"Normal":{v:7.6,pw:86},"Difícil":{v:9,pw:68}},"Normal");
 const W=480,H=520,rows=6,cols=10,bw=44,bh=18,cc=["#f87171","#fb923c","#fbbf24","#34d399","#22d3ee","#a78bfa"];
 let px=0,bx,by,vx,vy,bricks,score,lives,level,run=false,over=false,L=false,Rt=false;
 const spd=()=>pick().v+(level-1)*.5;
 const build=()=>{bricks=[];for(let r=0;r<rows;r++)for(let k=0;k<cols;k++)bricks.push({x:k*(bw+2)+6,y:r*(bh+4)+50,r,alive:true})};
 const serve=()=>{px=W/2-pick().pw/2;bx=W/2;by=H-60;const a=Math.random()*.6-.3;vx=spd()*Math.sin(a);vy=-spd()*Math.cos(a)};
 const draw=()=>{x.fillStyle="#070b16";x.fillRect(0,0,W,H);bricks.forEach(b=>{if(!b.alive)return;x.fillStyle=cc[b.r];x.beginPath();x.roundRect(b.x,b.y,bw,bh,4);x.fill()});
  x.fillStyle="#22d3ee";x.beginPath();x.roundRect(px,H-28,pick().pw,12,6);x.fill();x.shadowColor="#fff";x.shadowBlur=14;x.fillStyle="#fff";x.beginPath();x.arc(bx,by,6,0,7);x.fill();x.shadowBlur=0};
 const reset=()=>{score=0;lives=3;level=1;sc.textContent=0;lv.textContent=3;lvl.textContent=1;build();serve();run=false;over=false;g.rearm();draw()};
 const step=d=>{if(!run)return;const PW=pick().pw;if(L)px-=10*d;if(Rt)px+=10*d;px=Math.max(0,Math.min(W-PW,px));bx+=vx*d;by+=vy*d;
  if(bx<6||bx>W-6){vx*=-1;bx=bx<6?6:W-6}if(by<6){vy*=-1;by=6}
  if(vy>0&&by>H-34&&by<H-10&&bx>px-4&&bx<px+PW+4){const o=(bx-(px+PW/2))/(PW/2),ang=o*1.05;vx=spd()*Math.sin(ang);vy=-spd()*Math.cos(ang);by=H-34}
  for(const b of bricks){if(b.alive&&bx+6>b.x&&bx-6<b.x+bw&&by+6>b.y&&by-6<b.y+bh){b.alive=false;score+=(rows-b.r)*10;sc.textContent=score;vy*=-1;break}}
  if(!bricks.some(b=>b.alive)){level++;lvl.textContent=level;build();serve()}
  if(by>H){lives--;lv.textContent=lives;run=false;if(lives<=0){over=true;g.msg.textContent="Fim de jogo! Clique em Reiniciar.";g.finish(score,"loss")}else{serve();g.msg.textContent="Vida perdida. Clique em Iniciar."}}};
 const start=()=>{if(over)reset();if(!run){run=true;g.msg.textContent=""}};
 g.controls.append(button("▶ Iniciar",start),button("↻ Reiniciar",()=>{reset();run=true;g.msg.textContent=""}));
 listen(c,"pointermove",e=>{const r=c.getBoundingClientRect();px=(e.clientX-r.left)*W/r.width-pick().pw/2});
 const kk=(e,v)=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==="ArrowLeft"||k==="a"){L=v;e.preventDefault()}if(k==="ArrowRight"||k==="d"){Rt=v;e.preventDefault()}};
 listen(document,"keydown",e=>kk(e,true));listen(document,"keyup",e=>kk(e,false));
 loopDt(d=>{step(d);draw()});reset();g.msg.textContent="Clique em Iniciar";
}
function invaders(root,end){
 const g=setup(root,"invaders",end),[sc,lv,wv]=g.hud([["PONTOS","0"],["VIDAS","3"],["ONDA","1"]]),[c,x]=canvasGame(g.shell,480,560);
 const pick=picker(g,{"Fácil":{l:5,sp:.9,bomb:60,bs:3},"Normal":{l:3,sp:1.25,bomb:42,bs:4},"Difícil":{l:3,sp:1.7,bomb:28,bs:5}},"Normal");
 const W=480,H=560,R=5,C=8;let px,ox,oy,dir,alive,shots,bombs,blocks,score,lives,wave,run=false,over=false,L=false,Rt=false,nb=40,cd=0;
 const ov=(a,b,w,h,a2,b2,w2,h2)=>a<a2+w2&&a+w>a2&&b<b2+h2&&b+h>b2;
 const newWave=()=>{alive=Array.from({length:R},()=>Array(C).fill(true));ox=40;oy=60;dir=1;shots=[];bombs=[];nb=50};
 const barriers=()=>{blocks=[];for(let b=0;b<4;b++)for(let r=0;r<3;r++)for(let k=0;k<7;k++)if(!(r===2&&k>1&&k<5))blocks.push({x:36+b*112+k*9,y:440+r*9})};
 const draw=()=>{x.fillStyle="#070b16";x.fillRect(0,0,W,H);for(let i=0;i<30;i++){x.fillStyle=i%3?"#ffffff22":"#ffffff55";x.fillRect((i*97)%W,(i*53)%H,2,2)}
  x.font="22px serif";x.textBaseline="top";alive.forEach((row,i)=>row.forEach((v,j)=>{if(v)x.fillText("👾",ox+j*44,oy+i*34)}));
  x.fillStyle="#34d399";blocks.forEach(b=>x.fillRect(b.x,b.y,8,8));x.fillStyle="#fbbf24";shots.forEach(t=>x.fillRect(t.x-1.5,t.y,3,12));x.fillStyle="#fb7185";bombs.forEach(b=>x.fillRect(b.x-2,b.y,4,12));
  x.fillStyle="#22d3ee";x.beginPath();x.moveTo(px+18,500);x.lineTo(px+36,522);x.lineTo(px,522);x.closePath();x.fill()};
 const reset=()=>{score=0;lives=pick().l;wave=1;sc.textContent=0;lv.textContent=lives;wv.textContent=1;px=222;cd=0;barriers();newWave();run=false;over=false;g.rearm();draw()};
 const lose=()=>{over=true;run=false;g.msg.textContent="Fim de jogo! Clique em Reiniciar.";g.finish(score,"loss")};
 const step=d=>{if(!run)return;const P=pick();if(L)px-=7*d;if(Rt)px+=7*d;px=Math.max(0,Math.min(W-36,px));
  let mn=C,mx=-1,low=-1,cnt=0;alive.forEach((row,i)=>row.forEach((v,j)=>{if(v){cnt++;mn=Math.min(mn,j);mx=Math.max(mx,j);low=Math.max(low,i)}}));
  ox+=dir*(1.1+wave*.2)*P.sp*(1+(R*C-cnt)/12)*d;if((ox+mx*44+28>W-6&&dir>0)||(ox+mn*44<6&&dir<0)){dir*=-1;oy+=14}
  if(oy+low*34+20>=495){lose();return}
  cd-=d;if(cd<=0){shots.push({x:px+18,y:498});cd=15}
  nb-=d;if(nb<=0){const cs=[];for(let j=0;j<C;j++)if(alive.some(r=>r[j]))cs.push(j);const j=cs[Math.random()*cs.length|0];let i=R-1;while(!alive[i][j])i--;bombs.push({x:ox+j*44+14,y:oy+i*34+20});nb=Math.max(12,P.bomb-wave*3)*(.6+Math.random()*.8)}
  shots.forEach(t=>t.y-=11*d);bombs.forEach(b=>b.y+=(P.bs+wave*.3)*d);
  shots=shots.filter(t=>{if(t.y<-14)return false;for(let k=blocks.length-1;k>=0;k--){const b=blocks[k];if(ov(t.x-1.5,t.y,3,14,b.x,b.y,9,9)){blocks.splice(k,1);return false}}
   for(let i=0;i<R;i++)for(let j=0;j<C;j++)if(alive[i][j]&&ov(t.x-1.5,t.y,3,14,ox+j*44,oy+i*34,28,22)){alive[i][j]=false;score+=(R-i)*10;sc.textContent=score;return false}return true});
  let hurt=false;bombs=bombs.filter(b=>{if(b.y>H)return false;for(let k=blocks.length-1;k>=0;k--){const q=blocks[k];if(ov(b.x-2,b.y,4,12,q.x,q.y,9,9)){blocks.splice(k,1);return false}}if(ov(b.x-2,b.y,4,12,px,500,36,22)){hurt=true;return false}return true});
  if(hurt){lives--;lv.textContent=lives;bombs=[];if(lives<=0){lose();return}}
  if(!alive.flat().some(Boolean)){wave++;wv.textContent=wave;newWave()}};
 const start=()=>{if(over)reset();if(!run){run=true;g.msg.textContent=""}};
 g.controls.append(button("▶ Iniciar",start),button("↻ Reiniciar",()=>{reset();run=true;g.msg.textContent=""}));
 listen(c,"pointermove",e=>{const r=c.getBoundingClientRect();px=Math.max(0,Math.min(W-36,(e.clientX-r.left)*W/r.width-18))});
 const kk=(e,v)=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==="ArrowLeft"||k==="a"){L=v;e.preventDefault()}if(k==="ArrowRight"||k==="d"){Rt=v;e.preventDefault()}};
 listen(document,"keydown",e=>kk(e,true));listen(document,"keyup",e=>kk(e,false));
 loopDt(d=>{step(d);draw()});reset();g.msg.textContent="Clique em Iniciar (o tiro é automático)";
}
function hangman(root,end){
 const g=setup(root,"hangman",end),[he,er,st]=g.hud([["ACERTOS","0"],["ERROS","0/6"],["SEQUÊNCIA","0"]]);
 const all=Object.entries(WORDS).flatMap(([k,a])=>a.split(",").map(w=>[k,w.toUpperCase()]));
 const opts={"Aleatória":"*"};Object.keys(WORDS).forEach(k=>opts[k]=k);
 let word="",cat="",used=new Set(),errors=0,wins=0,streak=0,playing=false;
 const box=$("div","game-shell"),art=$("div"),info=$("div","muted"),wd=$("div","word"),kb=$("div","keys");box.append(art,info,wd,kb);g.shell.insertBefore(box,g.msg);
 const pick=picker(g,opts,"Aleatória");
 const parts=['<circle cx="130" cy="58" r="14"/>','<path d="M130 72v46"/>','<path d="M130 82l-22 22"/>','<path d="M130 82l22 22"/>','<path d="M130 118l-20 28"/>','<path d="M130 118l20 28"/>'];
 const keys=[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(l=>{const b=$("button","key",l);b.onclick=()=>guess(l);kb.append(b);return b});
 const done=q=>q===" "||used.has(q);
 const render=()=>{art.innerHTML=`<svg viewBox="0 0 200 170" width="190" height="160" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M20 160h110M50 160V15h80v28" stroke="#22d3ee"/>${parts.slice(0,errors).join("")}</svg>`;
  info.textContent=cat?"CATEGORIA: "+cat.toUpperCase():"ESCOLHA UMA CATEGORIA E CLIQUE EM INICIAR";wd.textContent=word?[...word].map(l=>l===" "?"\u00a0\u00a0":(done(l)||(!playing&&errors>=6)?l:"_")).join(" "):"? ? ? ? ?";
  keys.forEach(b=>{const l=b.textContent;b.className="key"+(used.has(l)?(word.includes(l)?" hit":" miss"):"");b.disabled=!playing||used.has(l)})};
 const newRound=()=>{const sel=pick(),pool=sel==="*"?all:all.filter(([k])=>k===sel);let n;do{n=pool[Math.random()*pool.length|0]}while(pool.length>1&&n[1]===word);[cat,word]=n;used=new Set();errors=0;playing=true;g.rearm();g.msg.textContent="";er.textContent="0/6";render()};
 const guess=l=>{if(!playing||used.has(l))return;used.add(l);if(!word.includes(l)){errors++;er.textContent=errors+"/6"}
  if([...word].every(done)){playing=false;wins++;streak++;he.textContent=wins;st.textContent=streak;g.msg.textContent="Você acertou! Clique em Iniciar para a próxima.";g.finish(100+(6-errors)*20,"win")}
  else if(errors>=6){playing=false;streak=0;st.textContent=0;g.msg.textContent="Era "+word+". Clique em Iniciar para tentar outra.";g.finish(0,"loss")}render()};
 g.controls.append(button("▶ Iniciar",()=>{if(!playing)newRound()}),button("↻ Reiniciar",()=>{streak=0;st.textContent=0;newRound()}));
 listen(document,"keydown",e=>{if(/^[a-z]$/i.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey)guess(e.key.toUpperCase())});
 render();g.msg.textContent="Clique em Iniciar";
}
function sudoku(root,end){
 const g=setup(root,"sudoku",end),[er,tm,fl]=g.hud([["ERROS","0/3"],["TEMPO","0:00"],["PREENCHIDAS","0/81"]]);
 const ok=(b,i,v)=>{const r=i/9|0,c=i%9,br=r-r%3,bc=c-c%3;for(let k=0;k<9;k++){if(b[r*9+k]===v||b[k*9+c]===v||b[(br+(k/3|0))*9+bc+k%3]===v)return false}return true};
 let found;const solve=(b,lim,rand)=>{let best=-1,opts=null;for(let i=0;i<81;i++)if(!b[i]){const o=[];for(let v=1;v<=9;v++)if(ok(b,i,v))o.push(v);if(!o.length)return 0;if(!opts||o.length<opts.length){best=i;opts=o;if(o.length===1)break}}
  if(best<0){found=b.slice();return 1}if(rand)opts.sort(()=>Math.random()-.5);let n=0;for(const v of opts){b[best]=v;n+=solve(b,lim-n,rand);if(n>=lim){b[best]=0;return n}}b[best]=0;return n};
 const make=clues=>{solve(Array(81).fill(0),1,true);const sol=found,pz=sol.slice(),idx=[...Array(81).keys()].sort(()=>Math.random()-.5);let rm=0;for(const i of idx){if(rm>=81-clues)break;const v=pz[i];pz[i]=0;if(solve(pz.slice(),2,false)===1)rm++;else pz[i]=v}return [sol,pz]};
 const levels={"Fácil":40,"Médio":32,"Difícil":26};let sol=Array(81).fill(0),cells=Array(81).fill(0),given=Array(81).fill(false),sel=-1,errors=0,sec=0,playing=false;
 const grid=$("div","sd-grid");g.shell.insertBefore(grid,g.msg);const pad=$("div","keys");g.shell.insertBefore(pad,g.msg);
 const render=()=>{grid.innerHTML="";const sv=sel>=0?cells[sel]:0;cells.forEach((v,i)=>{const r=i/9|0,c=i%9;let k="sd-cell"+(c%3===2&&c<8?" c3":"")+(r%3===2&&r<8?" r3":"")+(given[i]?" given":"");
   if(sel>=0){const sr=sel/9|0,sc=sel%9;if(i===sel)k+=" sel";else if(r===sr||c===sc||(r/3|0)===(sr/3|0)&&(c/3|0)===(sc/3|0))k+=" rel";if(sv&&v===sv&&i!==sel)k+=" same"}
   if(v&&v!==sol[i])k+=" err";const b=$("button",k,v||"");b.onclick=()=>{sel=i;render()};grid.append(b)});
  fl.textContent=cells.filter(Boolean).length+"/81";er.textContent=errors+"/3"};
 const put=v=>{if(!playing||sel<0||given[sel])return;cells[sel]=v;if(v&&v!==sol[sel]){errors++;if(errors>=3){playing=false;g.msg.textContent="3 erros. Clique em Reiniciar.";g.finish(0,"loss")}}
  else if(cells.every((q,i)=>q===sol[i])){playing=false;g.msg.textContent="Sudoku completo!";g.finish(Math.max(100,1000-sec-errors*50),"win")}render()};
 for(let n=1;n<=9;n++){const b=$("button","key",n);b.onclick=()=>put(n);pad.append(b)}const del=$("button","key","⌫");del.onclick=()=>put(0);pad.append(del);
 const begin=()=>{[sol,cells]=make(pick());cells=cells.slice();given=cells.map(Boolean);sel=-1;errors=0;sec=0;tm.textContent="0:00";playing=true;g.rearm();g.msg.textContent="";render()};
 every(()=>{if(playing){sec++;tm.textContent=(sec/60|0)+":"+String(sec%60).padStart(2,"0")}},1000);
 g.controls.append(button("▶ Iniciar",()=>{if(!playing)begin()}),button("↻ Reiniciar",begin));
 const pick=picker(g,levels,"Médio");
 listen(document,"keydown",e=>{if(/^[1-9]$/.test(e.key))put(+e.key);else if(e.key==="Backspace"||e.key==="Delete"||e.key==="0")put(0);else if(sel>=0&&e.key.startsWith("Arrow")){e.preventDefault();const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-9,ArrowDown:9}[e.key];const n=sel+d;if(n>=0&&n<81&&!(d===-1&&sel%9===0)&&!(d===1&&sel%9===8)){sel=n;render()}}});
 render();g.msg.textContent="Clique em Iniciar";
}
const inb=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
const CHK=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]],CHD=[[1,1],[1,-1],[-1,1],[-1,-1]],CHR=[[1,0],[-1,0],[0,1],[0,-1]],CHA=CHD.concat(CHR);
const CV={p:100,n:320,b:330,r:500,q:900,k:0},CH={P:"♟",N:"♞",B:"♝",R:"♜",Q:"♛",K:"♚"};
const chW=p=>p!=="."&&p===p.toUpperCase();
const chAtt=(b,sq,byW)=>{const r=sq>>3,c=sq&7,pr=byW?r+1:r-1,pc=byW?"P":"p";
 for(const dc of[-1,1])if(inb(pr,c+dc)&&b[pr*8+c+dc]===pc)return true;
 for(const[dr,dc]of CHK){const rr=r+dr,cc=c+dc;if(inb(rr,cc)&&b[rr*8+cc]===(byW?"N":"n"))return true}
 for(const[dr,dc]of CHA){const rr=r+dr,cc=c+dc;if(inb(rr,cc)&&b[rr*8+cc]===(byW?"K":"k"))return true}
 for(const[dr,dc]of CHA){const dg=dr&&dc;let rr=r+dr,cc=c+dc;while(inb(rr,cc)){const p=b[rr*8+cc];if(p!=="."){const u=p.toUpperCase();if(chW(p)===byW&&(u==="Q"||(dg?u==="B":u==="R")))return true;break}rr+=dr;cc+=dc}}
 return false};
const chGen=s=>{const b=s.b,W=s.t==="w",out=[],cr=s.cr;
 for(let i=0;i<64;i++){const p=b[i];if(p==="."||chW(p)!==W)continue;const u=p.toUpperCase(),r=i>>3,c=i&7,add=(t,x)=>out.push({f:i,t,...x});
  if(u==="P"){const d=W?-1:1,st=W?6:1,pr=W?0:7,one=(r+d)*8+c;
   if(inb(r+d,c)&&b[one]==="."){add(one,r+d===pr?{pr:1}:{});if(r===st&&b[one+d*8]===".")add(one+d*8,{dp:1})}
   for(const dc of[-1,1])if(inb(r+d,c+dc)){const to=(r+d)*8+c+dc,q=b[to];if(q!=="."&&chW(q)!==W)add(to,r+d===pr?{pr:1}:{});else if(q==="."&&to===s.ep)add(to,{ep:1})}}
  else if(u==="N"||u==="K"){for(const[dr,dc]of u==="N"?CHK:CHA){const rr=r+dr,cc=c+dc;if(!inb(rr,cc))continue;const q=b[rr*8+cc];if(q==="."||chW(q)!==W)add(rr*8+cc)}
   if(u==="K"){const A=(a,w)=>chAtt(b,a,w);
    if(W&&i===60){if(cr.K&&b[61]==="."&&b[62]==="."&&b[63]==="R"&&!A(60,false)&&!A(61,false)&&!A(62,false))add(62,{ca:1});if(cr.Q&&b[59]==="."&&b[58]==="."&&b[57]==="."&&b[56]==="R"&&!A(60,false)&&!A(59,false)&&!A(58,false))add(58,{ca:1})}
    if(!W&&i===4){if(cr.k&&b[5]==="."&&b[6]==="."&&b[7]==="r"&&!A(4,true)&&!A(5,true)&&!A(6,true))add(6,{ca:1});if(cr.q&&b[3]==="."&&b[2]==="."&&b[1]==="."&&b[0]==="r"&&!A(4,true)&&!A(3,true)&&!A(2,true))add(2,{ca:1})}}}
  else{for(const[dr,dc]of u==="B"?CHD:u==="R"?CHR:CHA){let rr=r+dr,cc=c+dc;while(inb(rr,cc)){const q=b[rr*8+cc];if(q===".")add(rr*8+cc);else{if(chW(q)!==W)add(rr*8+cc);break}rr+=dr;cc+=dc}}}}
 return out};
const chPlay=(s,m)=>{const b=s.b.slice(),p=b[m.f],W=chW(p),cr={...s.cr};let ep=-1;const cap=b[m.t]!=="."||!!m.ep;
 b[m.t]=p;b[m.f]=".";if(m.ep)b[m.t+(W?8:-8)]=".";if(m.pr)b[m.t]=W?"Q":"q";if(m.dp)ep=(m.f+m.t)/2;
 if(m.ca){if(m.t===62){b[61]=b[63];b[63]="."}else if(m.t===58){b[59]=b[56];b[56]="."}else if(m.t===6){b[5]=b[7];b[7]="."}else{b[3]=b[0];b[0]="."}}
 if(p==="K")cr.K=cr.Q=false;if(p==="k")cr.k=cr.q=false;
 for(const q of[m.f,m.t]){if(q===63)cr.K=false;if(q===56)cr.Q=false;if(q===7)cr.k=false;if(q===0)cr.q=false}
 return {b,t:W?"b":"w",cr,ep,cap}};
const chInCheck=s=>chAtt(s.b,s.b.indexOf(s.t==="w"?"K":"k"),s.t==="b");
const chLegal=s=>chGen(s).filter(m=>{const n=chPlay(s,m);return !chAtt(n.b,n.b.indexOf(s.t==="w"?"K":"k"),s.t!=="w")});
const chEv=b=>{let v=0;for(let i=0;i<64;i++){const p=b[i];if(p===".")continue;const u=p.toLowerCase(),r=i>>3,c=i&7,W=chW(p),cen=3.5-Math.max(Math.abs(r-3.5),Math.abs(c-3.5));const x=CV[u]+(u==="p"?(W?6-r:r-1)*10+cen*4:u==="k"?0:cen*8);v+=W?x:-x}return v};
const chSearch=(s,d,al,be)=>{const ms=chLegal(s);if(!ms.length)return chInCheck(s)?(s.t==="w"?-99999-d:99999+d):0;if(d===0)return chEv(s.b);
 ms.sort((x,y)=>(s.b[y.t]!=="."?1:0)-(s.b[x.t]!=="."?1:0));
 if(s.t==="w"){let best=-Infinity;for(const m of ms){best=Math.max(best,chSearch(chPlay(s,m),d-1,al,be));al=Math.max(al,best);if(al>=be)break}return best}
 let best=Infinity;for(const m of ms){best=Math.min(best,chSearch(chPlay(s,m),d-1,al,be));be=Math.min(be,best);if(al>=be)break}return best};
const chAI=(s,d,noise)=>{const ms=chLegal(s).sort(()=>Math.random()-.5);let best=null,bs=Infinity;for(const m of ms){const v=chSearch(chPlay(s,m),d-1,-Infinity,Infinity)+Math.random()*noise;if(v<bs){bs=v;best=m}}return best};
function chess(root,end){
 const g=setup(root,"chess",end),[tu,cp,mh]=g.hud([["TURNO","Brancas"],["CAPTURAS","0"],["JOGADAS","0"]]);
 const pick=picker(g,{"Fácil":1,"Médio":2,"Difícil":3},"Médio"),SZ="min(10.8vw,58px)";
 const board=$("div","game-board");board.style.gridTemplateColumns=`repeat(8,${SZ})`;board.style.gap="0";board.style.borderRadius="10px";board.style.overflow="hidden";g.shell.insertBefore(board,g.msg);
 const init=()=>({b:[..."rnbqkbnr"+"pppppppp"+".".repeat(32)+"PPPPPPPP"+"RNBQKBNR"],t:"w",cr:{K:1,Q:1,k:1,q:1},ep:-1});
 let s=init(),sel=-1,tg=[],lm=null,playing=false,busy=false,caps=0,cnt=0;
 const render=()=>{board.innerHTML="";const kq=playing&&chInCheck(s)?s.b.indexOf(s.t==="w"?"K":"k"):-1;
  for(let i=0;i<64;i++){const r=i>>3,c=i&7,p=s.b[i],t=tg.find(m=>m.t===i),el=$("button","cell",p!=="."?CH[p.toUpperCase()]+"\uFE0E":t?"•":"");
   let bg=(r+c)%2?"#4a5a8a":"#c3cdea";if(lm&&(i===lm.f||i===lm.t))bg=(r+c)%2?"#8a7a3a":"#e6d58a";if(i===sel)bg="#22d3ee99";if(i===kq)bg="#f87171aa";if(t)bg=(r+c)%2?"#2f8f9f":"#7fd6e6";
   el.style.cssText=`width:${SZ};height:${SZ};border:0;border-radius:0;background:${bg};font-size:clamp(24px,7vw,40px);color:${chW(p)?"#fff":"#10162a"};text-shadow:${chW(p)?"0 0 3px #000,0 0 3px #000":"0 0 3px #fff"}`;
   el.onclick=()=>click(i);board.append(el)}};
 const after=()=>{const ms=chLegal(s),ck=chInCheck(s);tu.textContent=s.t==="w"?"Você (brancas)":"IA (pretas)";
  if(!ms.length){playing=false;busy=false;if(ck){const win=s.t==="b";g.msg.textContent=win?"Xeque-mate! Você venceu!":"Xeque-mate. A IA venceu.";g.finish(win?pick()*400+Math.max(0,200-cnt*4):0,win?"win":"loss")}else{g.msg.textContent="Empate por afogamento.";g.finish(100,"draw")}render();return}
  g.msg.textContent=ck?"Xeque!":"";render();if(s.t==="b"){busy=true;tu.textContent="IA pensando…";setTimeout(ai,40)}};
 const ai=()=>{if(!playing||s.t!=="b")return;const d=pick(),m=chAI(s,d,[0,160,20,0][d]);busy=false;if(!m)return;s=chPlay(s,m);lm=m;after()};
 const doMove=m=>{if(s.b[m.t]!=="."||m.ep){caps++;cp.textContent=caps}cnt++;mh.textContent=cnt;s=chPlay(s,m);lm=m;sel=-1;tg=[];after()};
 const click=i=>{if(!playing||busy||s.t!=="w")return;const m=tg.find(q=>q.t===i);if(m){doMove(m);return}const p=s.b[i];if(p!=="."&&chW(p)){sel=i;tg=chLegal(s).filter(q=>q.f===i)}else{sel=-1;tg=[]}render()};
 const begin=()=>{s=init();sel=-1;tg=[];lm=null;caps=cnt=0;cp.textContent=0;mh.textContent=0;tu.textContent="Você (brancas)";playing=true;busy=false;g.rearm();g.msg.textContent="Você joga com as brancas.";render()};
 g.controls.append(button("▶ Iniciar",()=>{if(!playing)begin()}),button("↻ Reiniciar",begin));render();g.msg.textContent="Clique em Iniciar";
}
const CD=[[1,1],[1,-1],[-1,1],[-1,-1]];
const ckMoves=(b,side)=>{const caps=[],plain=[];
 for(let i=0;i<64;i++){const p=b[i];if(!p||Math.sign(p)!==side)continue;const king=Math.abs(p)===2,bd=b.slice();bd[i]=0;
  const dfs=(pos,path,taken)=>{let found=false;
   for(const[dr,dc]of CD){let r=(pos>>3)+dr,c=(pos&7)+dc;if(king)while(inb(r,c)&&bd[r*8+c]===0){r+=dr;c+=dc}
    if(!inb(r,c))continue;const q=r*8+c,t=bd[q];if(!t||Math.sign(t)===side||taken.includes(q))continue;
    let lr=r+dr,lc=c+dc;while(inb(lr,lc)&&bd[lr*8+lc]===0){found=true;const L=lr*8+lc;if(!dfs(L,[...path,L],[...taken,q]))caps.push({f:i,path:[...path,L],taken:[...taken,q]});if(!king)break;lr+=dr;lc+=dc}}
   return found};
  dfs(i,[],[]);
  for(const[dr,dc]of CD){if(!king&&dr!==-side)continue;let r=(i>>3)+dr,c=(i&7)+dc;while(inb(r,c)&&bd[r*8+c]===0){plain.push({f:i,path:[r*8+c],taken:[]});if(!king)break;r+=dr;c+=dc}}}
 if(caps.length){const mx=Math.max(...caps.map(m=>m.taken.length));return caps.filter(m=>m.taken.length===mx)}return plain};
const ckPlay=(b,m)=>{const n=b.slice(),p=n[m.f],to=m.path[m.path.length-1];n[m.f]=0;m.taken.forEach(t=>{n[t]=0});const r=to>>3;n[to]=(p===1&&r===0)?2:(p===-1&&r===7)?-2:p;return n};
const ckEv=b=>{let v=0;for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const r=i>>3,sg=Math.sign(p);v+=sg*(Math.abs(p)===2?320:100+(sg>0?7-r:r)*5)}return v};
const ckSearch=(b,side,d,al,be)=>{const ms=ckMoves(b,side);if(!ms.length)return side>0?-9999-d:9999+d;if(d===0)return ckEv(b);
 if(side>0){let best=-Infinity;for(const m of ms){best=Math.max(best,ckSearch(ckPlay(b,m),-1,d-1,al,be));al=Math.max(al,best);if(al>=be)break}return best}
 let best=Infinity;for(const m of ms){best=Math.min(best,ckSearch(ckPlay(b,m),1,d-1,al,be));be=Math.min(be,best);if(al>=be)break}return best};
function checkers(root,end){
 const g=setup(root,"checkers",end),[tu,mp,ap]=g.hud([["TURNO","Você"],["SUAS PEÇAS","12"],["PEÇAS DA IA","12"]]);
 const pick=picker(g,{"Fácil":2,"Médio":4,"Difícil":6},"Médio"),SZ="min(10.8vw,58px)";
 const board=$("div","game-board");board.style.gridTemplateColumns=`repeat(8,${SZ})`;board.style.gap="0";board.style.borderRadius="10px";board.style.overflow="hidden";g.shell.insertBefore(board,g.msg);
 const init=()=>{const b=Array(64).fill(0);for(let i=0;i<64;i++){const r=i>>3,c=i&7;if((r+c)%2){if(r<3)b[i]=-1;else if(r>4)b[i]=1}}return b};
 let b=init(),turn=1,sel=-1,tg=[],lm=null,playing=false,busy=false;
 const count=()=>{let a=0,z=0;b.forEach(p=>{if(p>0)a++;else if(p<0)z++});mp.textContent=a;ap.textContent=z;return a};
 const render=()=>{board.innerHTML="";for(let i=0;i<64;i++){const r=i>>3,c=i&7,p=b[i],dark=(r+c)%2,t=tg.find(m=>m.path[m.path.length-1]===i),el=$("button","cell",p?(Math.abs(p)===2?"♛":"●"):t?"•":"");
   let bg=dark?"#34406b":"#c3cdea";if(lm&&(i===lm.f||i===lm.path[lm.path.length-1]))bg="#6a5d2e";if(i===sel)bg="#22d3ee88";if(t)bg="#2f8f9f";
   el.style.cssText=`width:${SZ};height:${SZ};border:0;border-radius:0;background:${bg};font-size:clamp(26px,8vw,42px);color:${p>0?"#f8fafc":"#f43f5e"};text-shadow:0 0 4px #000`;
   if(dark)el.onclick=()=>click(i);board.append(el)}};
 const after=()=>{const ms=ckMoves(b,turn),a=count();tu.textContent=turn===1?"Você":"IA";
  if(!ms.length){playing=false;busy=false;const win=turn===-1;g.msg.textContent=win?"Você venceu!":"A IA venceu.";g.finish(win?pick()*150+a*25:0,win?"win":"loss")}
  else if(turn===-1){busy=true;tu.textContent="IA pensando…";setTimeout(ai,350)}
  render()};
 const apply=m=>{b=ckPlay(b,m);lm=m;sel=-1;tg=[];turn=-turn;after()};
 const ai=()=>{if(!playing||turn!==-1)return;const d=pick(),ms=ckMoves(b,-1).sort(()=>Math.random()-.5);let best=ms[0],bs=Infinity;for(const m of ms){const v=ckSearch(ckPlay(b,m),1,d-1,-Infinity,Infinity)+(d<3?Math.random()*60:0);if(v<bs){bs=v;best=m}}busy=false;if(best)apply(best)};
 const click=i=>{if(!playing||busy||turn!==1)return;const m=tg.find(q=>q.path[q.path.length-1]===i);if(m){apply(m);return}if(b[i]>0){const ms=ckMoves(b,1).filter(q=>q.f===i);sel=ms.length?i:-1;tg=ms}else{sel=-1;tg=[]}render()};
 const begin=()=>{b=init();turn=1;sel=-1;tg=[];lm=null;playing=true;busy=false;count();tu.textContent="Você";g.rearm();g.msg.textContent="Você joga com as brancas. Capturar é obrigatório.";render()};
 g.controls.append(button("▶ Iniciar",()=>{if(!playing)begin()}),button("↻ Reiniciar",begin));count();render();g.msg.textContent="Clique em Iniciar";
}
const launch=(id,root,onEnd)=>({snake,tetris,pong,flappy,tictactoe,memory,"2048":game2048,mines,breakout,invaders,hangman,sudoku,chess,checkers}[id]||snake)(root,onEnd);
window.ArcadeGames={catalog,launch,stop:stopAll};
})();