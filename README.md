# Arcade Local

Portal arcade offline com oito jogos, desenvolvido em HTML5, CSS3 e JavaScript Vanilla.

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

## Dados
Recordes, partidas, resultados e configurações são armazenados exclusivamente no `LocalStorage` do navegador. Os dados permanecem no dispositivo e no perfil de navegador utilizado. Limpar os dados do navegador pode removê-los.

## Estrutura
```text
Arcade_Local/
├── index.html
├── README.md
├── css/style.css
├── js/app.js
├── js/games.js
├── js/storage.js
└── assets/
```

## Observações
- Sem frameworks, bibliotecas, fontes remotas ou backend.
- O portal e os jogos funcionam localmente após a extração.
- O progresso é local a cada navegador/dispositivo.
- Todos os jogos têm os botões **Iniciar** e **Reiniciar**; ao sair de um jogo ele é encerrado por completo.
