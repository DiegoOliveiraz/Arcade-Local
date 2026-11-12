(() => {
const catalog=[
{id:"snake",name:"Snake",desc:"Cresça, desvie e bata seu recorde.",icon:"〰",color:"#34d399",tint:"#34d39920"},
{id:"tetris",name:"Tetris",desc:"Encaixe as peças e limpe as linhas.",icon:"▦",color:"#38bdf8",tint:"#38bdf820"},
{id:"pong",name:"Pong",desc:"Encare a CPU em uma disputa clássica.",icon:"◉",color:"#a78bfa",tint:"#a78bfa20"},
{id:"flappy",name:"Flappy Bird",desc:"Atravesse os obstáculos sem colidir.",icon:"🐤",color:"#fbbf24",tint:"#fbbf2420"},
{id:"tictactoe",name:"Jogo da Velha",desc:"Supere a inteligência artificial.",icon:"✕",color:"#fb7185",tint:"#fb718520"},
{id:"memory",name:"Jogo da Memória",desc:"Encontre todos os pares de cartas.",icon:"▧",color:"#c084fc",tint:"#c084fc20"},
{id:"2048",name:"2048",desc:"Combine números até alcançar 2048.",icon:"²",color:"#f59e0b",tint:"#f59e0b20"},
{id:"mines",name:"Campo Minado",desc:"Revele as casas seguras do tabuleiro.",icon:"✹",color:"#f87171",tint:"#f8717120"}
];
const $=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const button=(txt,fn)=>{const b=$("button","game-btn",txt);b.onclick=fn;return b};
function setup(root,id,onEnd){
 root.innerHTML=""; const shell=$("div","game-shell");root.append(shell);
 let ended=false,start=Date.now();
 const finish=(score,result="win")=>{if(ended)return;ended=true;onEnd(Math.max(0,Math.floor(score)),result,Math.floor((Date.now()-start)/1000))};
 const hud=(items)=>{const h=$("div","game-hud");items.forEach(([k,v])=>{const b=$("div","hud-box");b.append($("small","",k));const s=$("strong","",v);b.append(s);h.append(b)});shell.append(h);return items.map((_,i)=>h.children[i].lastChild)};
 const msg=$("div","game-message");shell.append(msg);
 const controls=$("div","game-toolbar");shell.append(controls);
 return {shell,finish,hud,msg,controls,start};
}
function canvasGame(shell,w,h){const c=$("canvas","game-canvas");c.width=w;c.height=h;c.style.width=`min(100%,${w}px)`;shell.append(c);return [c,c.getContext("2d")]}
function snake(root,end){
 const g=setup(root,"snake",end),[scoreEl]=g.hud([["PONTOS","0"],["TAMANHO","3"]]);
 const [c,x]=canvasGame(g.shell,400,400),n=20,cell=20;let snake=[{x:9,y:10},{x:8,y:10},{x:7,y:10}],dir={x:1,y:0},next={...dir},food={x:14,y:10},score=0,run=false,over=false;
 const place=()=>{do{food={x:Math.floor(Math.random()*n),y:Math.floor(Math.random()*n)}}while(snake.some(p=>p.x===food.x&&p.y===food.y))};
 const draw=()=>{x.fillStyle="#0b1220";x.fillRect(0,0,400,400);x.strokeStyle="#1b2940";for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*cell,0);x.lineTo(i*cell,400);x.stroke();x.beginPath();x.moveTo(0,i*cell);x.lineTo(400,i*cell);x.stroke()}x.fillStyle="#fb7185";x.beginPath();x.arc(food.x*cell+10,food.y*cell+10,8,0,7);x.fill();snake.forEach((p,i)=>{x.fillStyle=i?"#10b981":"#6ee7b7";x.fillRect(p.x*cell+1,p.y*cell+1,18,18)})};
 const tick=()=>{if(!run||over)return;dir=next;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.y<0||h.x>=n||h.y>=n||snake.some(p=>p.x===h.x&&p.y===h.y)){over=true;g.msg.textContent="Fim de jogo!";g.finish(score,"loss");return}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;scoreEl.textContent=score;place()}else snake.pop();draw()};
 const start=()=>{if(over)return;run=true;g.msg.textContent="";};g.controls.append(button("▶ Iniciar",start),button("↻ Reiniciar",()=>{snake=[{x:9,y:10},{x:8,y:10},{x:7,y:10}];dir=next={x:1,y:0};score=0;over=false;run=true;scoreEl.textContent=0;place();draw();g.msg.textContent=""}));
 window.addEventListener("keydown",function key(e){const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};if(m[e.key]&&run){e.preventDefault();const [dx,dy]=m[e.key];if(dx!==-dir.x||dy!==-dir.y)next={x:dx,y:dy}}},{signal:AbortSignal.timeout?undefined:undefined});
 draw();start();const timer=setInterval(()=>{if(over){clearInterval(timer);return}tick()},125);
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
 const start=()=>{grid=Array.from({length:R},()=>Array(C).fill(0));score=lines=0;level=1;next=random();over=pause=false;run=true;acc=0;spawn();stats();g.msg.textContent="";last=performance.now()};
 const lock=()=>{cur.m.forEach((r,y)=>r.forEach((v,x)=>{if(v&&cur.y+y>=0)grid[cur.y+y][cur.x+x]=cur.id}));let n=0;for(let y=R-1;y>=0;y--)if(grid[y].every(Boolean)){grid.splice(y,1);grid.unshift(Array(C).fill(0));n++;y++}if(n){lines+=n;score+=[0,100,300,500,800][n]*level;level=Math.floor(lines/10)+1}stats();spawn()};
 const move=(dx,dy)=>{if(!run||pause||over)return;if(!coll(cur,dx,dy)){cur.x+=dx;cur.y+=dy;if(dy)score++;stats()}else if(dy>0)lock()};
 const rotate=()=>{if(!run||pause||over)return;const m=cur.m[0].map((_,i)=>cur.m.map(r=>r[i]).reverse());for(const k of [0,-1,1,-2,2])if(!coll(cur,k,0,m)){cur.x+=k;cur.m=m;break}};
 const drop=()=>{if(!run||pause||over)return;while(!coll(cur,0,1)){cur.y++;score+=2}lock();stats()};
 const cell=(id,x,y,ghost=false)=>{ctx.fillStyle=ghost?colors[id]+"55":colors[id];ctx.fillRect(x*S+1,y*S+1,S-2,S-2);if(!ghost){ctx.fillStyle="#ffffff44";ctx.fillRect(x*S+3,y*S+3,S-6,3)}};
 const draw=()=>{ctx.fillStyle="#0b1220";ctx.fillRect(0,0,300,600);ctx.strokeStyle="#263449";for(let i=0;i<=C;i++){ctx.beginPath();ctx.moveTo(i*S,0);ctx.lineTo(i*S,600);ctx.stroke()}for(let i=0;i<=R;i++){ctx.beginPath();ctx.moveTo(0,i*S);ctx.lineTo(300,i*S);ctx.stroke()}grid?.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(v,x,y)}));if(cur){let ghost={...cur};while(!coll(ghost,0,1))ghost.y++;ghost.m.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(cur.id,ghost.x+x,ghost.y+y,true)}));cur.m.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(cur.id,cur.x+x,cur.y+y)}))}};
 const frame=t=>{const dt=Math.min(t-last,100);last=t;if(run&&!pause&&!over){acc+=dt;if(acc>=Math.max(75,800-(level-1)*65)){move(0,1);acc=0}}draw();raf=requestAnimationFrame(frame)};
 const key=e=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key))e.preventDefault();if(e.key==="p"||e.key==="P"){pause=!pause;g.msg.textContent=pause?"PAUSADO":"";return}if(e.key==="ArrowLeft")move(-1,0);if(e.key==="ArrowRight")move(1,0);if(e.key==="ArrowDown")move(0,1);if(e.key==="ArrowUp")rotate();if(e.key===" ")drop()};
 document.addEventListener("keydown",key);g.controls.append(button("Ⅱ Pausar",()=>{pause=!pause;g.msg.textContent=pause?"PAUSADO":""}),button("↻ Reiniciar",start),button("⬅",()=>move(-1,0)),button("↻",rotate),button("⬇",()=>move(0,1)),button("➡",()=>move(1,0)),button("Queda instantânea",drop));
 start();nextDraw();raf=requestAnimationFrame(frame);
}
function pong(root,end){
 const g=setup(root,"pong",end),[scoreEl]=g.hud([["VOCÊ","0"],["CPU","0"],["META","5"]]),[c,x]=canvasGame(g.shell,600,360);let py=150,cy=150,bx=300,by=180,vx=4,vy=2.5,ps=0,cs=0,run=true;
 const reset=()=>{bx=300;by=180;vx=(Math.random()>.5?1:-1)*4;vy=(Math.random()-.5)*5};
 const draw=()=>{x.fillStyle="#0b1220";x.fillRect(0,0,600,360);x.setLineDash([8,10]);x.strokeStyle="#52617b";x.beginPath();x.moveTo(300,0);x.lineTo(300,360);x.stroke();x.setLineDash([]);x.fillStyle="#a78bfa";x.fillRect(18,py,10,65);x.fillStyle="#22d3ee";x.fillRect(572,cy,10,65);x.fillStyle="#fff";x.beginPath();x.arc(bx,by,8,0,7);x.fill()};
 const frame=()=>{if(ps>=5||cs>=5)return;bx+=vx;by+=vy;if(by<8||by>352)vy*=-1;if(bx<28&&by>py&&by<py+65){vx=Math.abs(vx)*1.05;vy+=(by-(py+32))*0.08}if(bx>572&&by>cy&&by<cy+65){vx=-Math.abs(vx)*1.05;vy+=(by-(cy+32))*0.08}cy+=((by-32)-cy)*.075;cy=Math.max(0,Math.min(295,cy));if(bx<0){cs++;scoreEl[1].textContent=cs;reset()}if(bx>600){ps++;scoreEl[0].textContent=ps;reset()}draw();if(ps>=5||cs>=5){g.msg.textContent=ps>cs?"VOCÊ VENCEU!":"A CPU VENCEU";g.finish(ps*100,ps>cs?"win":"loss");return}requestAnimationFrame(frame)};
 document.addEventListener("mousemove",e=>{const r=c.getBoundingClientRect();py=Math.max(0,Math.min(295,(e.clientY-r.top)*360/r.height-32))});document.addEventListener("keydown",e=>{if(e.key==="ArrowUp")py=Math.max(0,py-24);if(e.key==="ArrowDown")py=Math.min(295,py+24)});draw();requestAnimationFrame(frame);
}
function flappy(root,end){
 const g=setup(root,"flappy",end),[sc]=g.hud([["PONTOS","0"]]),[c,x]=canvasGame(g.shell,400,500);let bird=220,vel=0,pipes=[],score=0,alive=true,started=false;
 const reset=()=>{bird=220;vel=0;pipes=[];score=0;alive=true;started=true;sc.textContent=0;g.msg.textContent=""};
 const flap=()=>{if(!started)reset();if(alive)vel=-6.8};g.controls.append(button("↥ Bater asas / Reiniciar",()=>{if(!alive)reset();flap()}));c.addEventListener("pointerdown",flap);document.addEventListener("keydown",e=>{if(e.code==="Space"){e.preventDefault();flap()}});
 const frame=()=>{x.fillStyle="#10253c";x.fillRect(0,0,400,500);x.fillStyle="#1d4b64";x.fillRect(0,390,400,110);if(alive&&started){vel+=.34;bird+=vel;if(pipes.length===0||pipes[pipes.length-1].x<190)pipes.push({x:420,gap:150+Math.random()*130,passed:false});pipes.forEach(p=>{p.x-=2.5;x.fillStyle="#34d399";x.fillRect(p.x,0,52,p.gap-70);x.fillRect(p.x,p.gap+70,52,500);if(!p.passed&&p.x<65){p.passed=true;score++;sc.textContent=score}if(65+16>p.x&&65-16<p.x+52&&(bird-12<p.gap-70||bird+12>p.gap+70))alive=false});pipes=pipes.filter(p=>p.x>-60);if(bird<0||bird>390)alive=false;if(!alive){g.msg.textContent="Fim de jogo";g.finish(score*10,"loss")}}x.fillStyle="#fbbf24";x.beginPath();x.arc(65,bird,13,0,7);x.fill();x.fillStyle="#fff";x.beginPath();x.arc(70,bird-4,4,0,7);x.fill();if(!started){x.fillStyle="#fff";x.font="bold 18px sans-serif";x.fillText("Toque ou pressione espaço",85,250)}requestAnimationFrame(frame)};requestAnimationFrame(frame);
}
function tictactoe(root,end){
 const g=setup(root,"tictactoe",end),[wins]=g.hud([["VOCÊ (X)","0"],["IA (O)","0"],["EMPATES","0"]]);let board=Array(9).fill(""),human=0,ai=0,draws=0,done=false;
 const b=$("div","game-board");b.style.gridTemplateColumns="repeat(3,minmax(75px,110px))";b.style.gridTemplateRows="repeat(3,minmax(75px,110px))";g.shell.append(b);
 const check=a=>{for(const line of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]])if(a[line[0]]&&a[line[0]]===a[line[1]]&&a[line[1]]===a[line[2]])return a[line[0]];return a.every(Boolean)?"draw":null};
 const render=()=>{b.innerHTML="";board.forEach((v,i)=>{const c=button(v||"·",()=>play(i));c.style.fontSize="38px";c.style.aspectRatio="1";c.style.color=v==="X"?"#22d3ee":"#c4b5fd";b.append(c)})};const status=()=>{wins[0].textContent=human;wins[1].textContent=ai;wins[2].textContent=draws};
 const finish=r=>{done=true;if(r==="X"){human++;g.msg.textContent="Você venceu!";g.finish(100,"win")}else if(r==="O"){ai++;g.msg.textContent="A IA venceu.";g.finish(0,"loss")}else{draws++;g.msg.textContent="Empate.";g.finish(30,"draw")}status()};
 const play=i=>{if(done||board[i])return;board[i]="X";let r=check(board);if(r){render();finish(r);return}const empty=board.map((v,j)=>v?null:j).filter(v=>v!==null);let move=empty.find(j=>{let a=board.slice();a[j]="O";return check(a)==="O"});if(move===undefined)move=empty.find(j=>{let a=board.slice();a[j]="X";return check(a)==="X"});if(move===undefined&&board[4]==="")move=4;if(move===undefined)move=empty[Math.floor(Math.random()*empty.length)];if(move!==undefined)board[move]="O";r=check(board);render();if(r)finish(r)};const restart=()=>{board=Array(9).fill("");done=false;g.msg.textContent="Sua vez.";render()};g.controls.append(button("↻ Nova partida",restart));restart();
}
function memory(root,end){
 const g=setup(root,"memory",end),[moves]=g.hud([["TENTATIVAS","0"],["PARES","0/8"],["TEMPO","0s"]]);const icons=["🍒","🚀","🎮","⭐","🍀","💎","👾","⚡"];let deck=[...icons,...icons].sort(()=>Math.random()-.5),first=null,lock=false,found=0,tries=0,sec=0;const b=$("div","game-board");b.style.gridTemplateColumns="repeat(4,minmax(55px,85px))";g.shell.append(b);const cards=[];
 deck.forEach((v,i)=>{const c=$("button","memory-card","?");c.onclick=()=>flip(i);cards.push(c);b.append(c)});
 const timer=setInterval(()=>{sec++;moves[2].textContent=sec+"s"},1000);
 function flip(i){if(lock||cards[i].classList.contains("matched")||cards[i]===first)return;cards[i].textContent=deck[i];cards[i].classList.add("flipped");if(first===null){first=cards[i];return}tries++;moves[0].textContent=tries;const j=cards.indexOf(first);if(deck[i]===deck[j]){cards[i].classList.add("matched");first.classList.add("matched");first=null;found++;moves[1].textContent=found+"/8";if(found===8){clearInterval(timer);g.msg.textContent="Memória perfeita!";g.finish(Math.max(10,1000-tries*20-sec*2),"win")}}else{lock=true;setTimeout(()=>{cards[i].textContent="?";first.textContent="?";cards[i].classList.remove("flipped");first.classList.remove("flipped");first=null;lock=false},700)}}
 g.controls.append(button("↻ Reiniciar",()=>{clearInterval(timer);memory(root,end)}));
}
function game2048(root,end){
 const g=setup(root,"2048",end),[sc]=g.hud([["PONTOS","0"],["MELHOR PEÇA","2"]]);let board=Array(4).fill().map(()=>Array(4).fill(0)),score=0,done=false;const b=$("div","game-board");b.style.gridTemplateColumns="repeat(4,minmax(55px,90px))";b.style.background="#34445e";b.style.padding="7px";b.style.borderRadius="10px";g.shell.append(b);
 const add=()=>{let a=[];board.forEach((r,y)=>r.forEach((v,x)=>{if(!v)a.push([y,x])}));if(a.length){let [y,x]=a[Math.floor(Math.random()*a.length)];board[y][x]=Math.random()<.9?2:4}};
 const render=()=>{b.innerHTML="";let max=Math.max(...board.flat());sc[1].textContent=max;sc[0].textContent=score;board.flat().forEach(v=>{const c=$("div","cell",v||"");c.style.width="min(19vw,82px)";c.style.height="min(19vw,82px)";c.style.fontSize="clamp(17px,4vw,25px)";c.style.background=v?({2:"#64748b",4:"#0e7490",8:"#0891b2",16:"#7c3aed",32:"#9333ea",64:"#c026d3",128:"#d97706",256:"#ea580c",512:"#dc2626",1024:"#be123c",2048:"#facc15"}[v]||"#7c3aed"):"#26354d";c.textContent=v||"";b.append(c)})};
 const move=dir=>{if(done)return;let old=JSON.stringify(board);for(let i=0;i<4;i++){let line=dir==="left"?board[i].slice():dir==="right"?board[i].slice().reverse():dir==="up"?board.map(r=>r[i]):board.map(r=>r[i]).reverse();line=line.filter(Boolean);for(let j=0;j<line.length-1;j++)if(line[j]===line[j+1]){line[j]*=2;score+=line[j];line.splice(j+1,1)}while(line.length<4)line.push(0);if(dir==="right"||dir==="down")line.reverse();if(dir==="left"||dir==="right")board[i]=line;else line.forEach((v,j)=>board[dir==="up"?j:3-j][i]=v)}if(JSON.stringify(board)!==old){add();render();if(Math.max(...board.flat())>=2048){done=true;g.msg.textContent="2048 alcançado!";g.finish(score+2048,"win")}else if(!board.some(r=>r.includes(0))&&!board.some((r,y)=>r.some((v,x)=>(x<3&&v===r[x+1])||(y<3&&v===board[y+1][x])))){done=true;g.msg.textContent="Sem movimentos.";g.finish(score,"loss")}}};
 document.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();move(({ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"})[e.key])}});g.controls.append(button("↻ Reiniciar",()=>{board=Array(4).fill().map(()=>Array(4).fill(0));score=0;done=false;add();add();render();g.msg.textContent=""}));add();add();render();
}
function mines(root,end){
 const g=setup(root,"mines",end),[flags]=g.hud([["MINAS","10"],["RESTANTES","10"],["CASAS ABERTAS","0"]]);let N=10,M=10,grid=[],opened=0,flagged=0,done=false,first=true;const b=$("div","game-board");b.style.gridTemplateColumns="repeat(10,minmax(22px,34px))";b.style.gap="3px";g.shell.append(b);
 const init=()=>{grid=Array.from({length:N},()=>Array.from({length:M},()=>({mine:false,open:false,flag:false,n:0})));let count=0;while(count<10){let y=Math.random()*N|0,x=Math.random()*M|0;if(!grid[y][x].mine){grid[y][x].mine=true;count++}}grid.forEach((r,y)=>r.forEach((c,x)=>{c.n=grid.slice(Math.max(0,y-1),y+2).flatMap(row=>row.slice(Math.max(0,x-1),x+2)).filter(q=>q.mine).length}))};
 const render=()=>{b.innerHTML="";grid.forEach((r,y)=>r.forEach((cell,x)=>{const c=$("button","cell",cell.flag?"⚑":cell.open?(cell.mine?"✹":cell.n||""):"");c.style.width="min(8vw,34px)";c.style.height="min(8vw,34px)";c.style.fontSize="12px";c.style.background=cell.open?"#64748b":"#26354d";c.style.color=cell.mine?"#fb7185":"#e0f2fe";c.oncontextmenu=e=>{e.preventDefault();flag(y,x)};c.onclick=()=>reveal(y,x);b.append(c)}))};
 const status=()=>{flags[1].textContent=10-flagged;flags[2].textContent=opened};
 const flag=(y,x)=>{let c=grid[y][x];if(done||c.open)return;c.flag=!c.flag;flagged+=c.flag?1:-1;status();render()};
 const reveal=(y,x)=>{if(done||grid[y][x].open||grid[y][x].flag)return;if(first){if(grid[y][x].mine){grid[y][x].mine=false;grid[y][x].n=0}first=false}const flood=(a,z)=>{let c=grid[a][z];if(c.open||c.flag||c.mine)return;c.open=true;opened++;if(!c.n)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let yy=a+dy,xx=z+dx;if(yy>=0&&yy<N&&xx>=0&&xx<M)flood(yy,xx)}};if(grid[y][x].mine){grid[y][x].open=true;done=true;g.msg.textContent="Você encontrou uma mina.";g.finish(opened,"loss")}else{flood(y,x);if(opened===90){done=true;g.msg.textContent="Campo limpo!";g.finish(500,"win")}}status();render()};
 g.controls.append(button("↻ Novo campo",()=>{opened=flagged=0;done=false;first=true;init();status();render();g.msg.textContent=""}));init();render();
}
const launch=(id,root,onEnd)=>({snake,tetris,pong,flappy,tictactoe,memory,"2048":game2048,mines}[id]||snake)(root,onEnd);
window.ArcadeGames={catalog,launch};
})();