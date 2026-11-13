# Arcade Local

Portal arcade offline com 18 jogos (14 clássicos + 4 de futebol com física real), desenvolvido em HTML5, CSS3 e JavaScript puro.

## Como executar
1. Extraia `Arcade_Local.zip` para uma pasta.
2. Abra `index.html` em um navegador moderno (Chrome, Firefox, Edge ou Safari).
3. Não é necessário instalar dependências, iniciar servidor ou possuir conexão com a internet.

## Jogos
- **Snake:** setas ou WASD, pontuação e crescimento.
- **Tetris:** sete peças clássicas, rotação, próxima peça, níveis, linhas, pausa e queda instantânea.
- **Pong:** jogador contra CPU, placar até cinco pontos.
- **Flappy Bird:** gravidade, obstáculos e pontuação; espaço ou toque para voar.
- **Jogo da Velha:** jogador contra IA com bloqueio de jogadas vencedoras.
- **Jogo da Memória:** oito pares, tentativas e temporizador.
- **2048:** setas para mover, combinar peças e somar pontos.
- **Campo Minado:** tabuleiro 10×10 com dez minas; clique para revelar e botão direito para marcar.

## Novos jogos — Lote 1 (Futebol)
Todos seguem o mesmo padrão: tela inicial com instruções e dificuldade, **Começar**, **Pausar/Continuar**, **Reiniciar**, pontuação, tela de resultado com **Jogar Novamente** e recorde individual (integrado ao Ranking e às Estatísticas). Funcionam com mouse, toque e teclado.
- **Disputa de Pênaltis:** 5 cobranças contra o goleiro da IA, morte súbita em caso de empate. Mouse/toque: clique no ponto do gol, segure para carregar a força e solte. Teclado: setas + Espaço.
- **Seja o Goleiro:** 12 chutes (posições, velocidades e efeitos diferentes), 3 vidas. Arraste para mover o goleiro; setas no teclado.
- **Mira Certa:** acerte alvos no gol com vento lateral que desvia a bola.
- **Desafio do Travessão:** 10 chutes, cada um de mais longe; acerte a barra.
- **Física (js/physics.js):** gravidade, arrasto do ar, efeito Magnus (curva), quique com perda de energia, colisão real com traves e travessão, rede e vento. P pausa/continua em qualquer um deles.

## Funcionamento offline (Service Worker)
- O Service Worker (`sw.js`) e o manifesto (`manifest.webmanifest`) só funcionam quando o portal é servido por **http(s) ou localhost** (ex.: Vercel, GitHub Pages, `npx serve`). Abrir `index.html` direto do disco (`file://`) continua funcionando, mas sem instalação/cache do navegador.
- Instalação no Android: abra o endereço no Chrome > menu > "Instalar app".
- **A cada atualização de arquivos, aumente `CACHE_VERSION` em `sw.js`**, senão o navegador continua mostrando a versão antiga.

## Dados
Recordes, partidas, resultados e configurações são armazenados exclusivamente no `LocalStorage` do navegador. Os dados permanecem no dispositivo e no perfil de navegador utilizado. Limpar os dados do navegador pode removê-los.

## Estrutura
```text
Arcade_Local/
├── index.html
├── README.md
├── sw.js
├── manifest.webmanifest
├── css/style.css
├── js/app.js
├── js/games.js       (14 jogos originais)
├── js/games2.js      (framework padrão + jogos novos)
├── js/physics.js     (física da bola)
├── js/pwa.js         (registro do Service Worker)
├── js/storage.js
└── assets/           (ícones)
```

## Observações
- Sem frameworks, bibliotecas, fontes remotas ou backend.
- O portal e os jogos funcionam localmente após a extração.
- O progresso é local a cada navegador/dispositivo.
- Todos os jogos têm os botões **Iniciar** e **Reiniciar**; ao sair de um jogo ele é encerrado por completo.
- Novos jogos: Quebra-blocos, Space Invaders, Forca e Sudoku (12 no total) e visual renovado.
- Também: Xadrez e Damas contra a IA; Pong, Flappy, Quebra-blocos, Space Invaders, Forca, Sudoku, Xadrez e Damas têm níveis de dificuldade.
