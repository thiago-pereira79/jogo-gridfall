# 🧩 Gridfall

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)
![Stack](https://img.shields.io/badge/Feito%20com-HTML%20%2B%20CSS%20%2B%20JavaScript%20%2B%20Canvas-blue)
![Python](https://img.shields.io/badge/Python-Servidor%20local-3776AB?logo=python&logoColor=white)
![Layout](https://img.shields.io/badge/Layout-Responsivo-8C5CE6)
![Fases](https://img.shields.io/badge/Fases-6%20%2B%20Infinito-D1795C)

---

## 🧠 Sobre o projeto

**Gridfall** é um puzzle de blocos desenvolvido com **HTML, CSS, JavaScript e HTML5 Canvas**, inspirado nas mecânicas clássicas de jogos com peças geométricas que descem por um tabuleiro.

O objetivo é mover, girar e encaixar as peças para completar linhas horizontais. Cada linha eliminada libera espaço no tabuleiro, aumenta a pontuação e aproxima o jogador do próximo nível.

O projeto foi desenvolvido com foco em lógica de jogo, progressão de dificuldade, experiência responsiva, organização modular do código, clareza visual, acessibilidade e identidade visual própria.

A campanha possui seis fases temáticas, aumento progressivo de velocidade e um modo Infinito que continua enquanto o jogador conseguir sobreviver.

🔗 **Jogo disponível aqui:**  
https://thiago-pereira79.github.io/jogo-gridfall/

---

## 🚀 Principais recursos

| Recurso | Descrição |
|---------|-----------|
| 🧩 Sete formatos de peças | Conjunto completo de peças formadas por quatro blocos |
| 🎯 Campanha progressiva | A partida começa no nível 1 e avança automaticamente |
| 🗺️ Seis fases temáticas | Início, Pulso, Aceleração, Fluxo, Sobrecarga e Infinito |
| ♾️ Modo Infinito | Progressão contínua após o nível 16 |
| 🎨 Temas por fase | Fundo, grid, bordas e destaques mudam durante a jornada |
| 👁️ Próxima peça | A interface mostra qual peça será gerada em seguida |
| 📊 Sistema de pontuação | Exibe pontuação, nível, linhas e recorde da sessão |
| ⏸️ Estados do jogo | Menu, partida, pausa, reinício e Game Over |
| ⌨️ Controles por teclado | Movimentação, rotação, queda acelerada e queda instantânea |
| 👆 Controles por toque | Interface adaptada para celulares, tablets e iPads |
| 📱 Experiência vertical | Dispositivos móveis foram priorizados no modo retrato |
| 🔄 Orientação mobile | Em telas horizontais, o jogo orienta o usuário a voltar para o modo vertical |
| ♿ Acessibilidade | Foco visível, contraste, botões semânticos e áreas de toque adequadas |
| ⚡ Performance | Game loop controlado com `requestAnimationFrame` |
| 🧱 Código modular | Lógica, controles, peças, renderização e armazenamento separados |

---

## 🗺️ Fases da campanha

A campanha avança automaticamente conforme o jogador elimina linhas e sobe de nível.

| Fase | Níveis | Atmosfera visual | Característica |
|------|--------|------------------|----------------|
| 🟣 **Início** | 1–3 | Violeta e azul-marinho | Introdução ao ritmo e à organização do tabuleiro |
| 🩷 **Pulso** | 4–6 | Roxo e magenta | A velocidade começa a exigir decisões mais rápidas |
| 🔵 **Aceleração** | 7–9 | Azul elétrico | Menos tempo para pensar e maior necessidade de precisão |
| 🟢 **Fluxo** | 10–12 | Ciano e verde-petróleo | Ritmo contínuo e pressão constante |
| 🔴 **Sobrecarga** | 13–15 | Vinho e rosa-avermelhado | Velocidade alta e pouco espaço para hesitar |
| 🟠 **Infinito** | 16+ | Preto, cobre e variações temáticas | Progressão sem limite final |

Cada nível exige **10 linhas eliminadas**.

A progressão funciona da seguinte forma:

```text
0–9 linhas     → nível 1
10–19 linhas   → nível 2
20–29 linhas   → nível 3
30–39 linhas   → nível 4
```

Ao eliminar várias linhas simultaneamente, as linhas excedentes continuam sendo contabilizadas para o próximo nível.

---

## ⚡ Progressão de velocidade

A velocidade das peças aumenta conforme o jogador avança pela campanha.

| Nível | Fase | Intervalo aproximado de queda |
|------:|------|-------------------------------:|
| 1 | Início | 1000 ms |
| 4 | Pulso | 700 ms |
| 7 | Aceleração | 470 ms |
| 10 | Fluxo | 290 ms |
| 13 | Sobrecarga | 185 ms |
| 16 | Infinito I | 135 ms |
| 21 | Infinito II | 110 ms |
| 26 | Infinito III | 85 ms |
| 31 | Infinito IV | 80 ms |
| 41+ | Infinito avançado | 70 ms |

O intervalo mínimo de segurança é de **70 milissegundos**.

Depois que esse limite é atingido:

- o nível continua aumentando;
- as linhas continuam sendo contabilizadas;
- a pontuação continua aumentando;
- os ciclos do modo Infinito continuam avançando;
- a velocidade permanece dentro do limite definido.

---

## ♾️ Como funciona o modo Infinito

O modo Infinito começa no nível 16 e continua sem um limite final definido.

Os ciclos são organizados em grupos de cinco níveis:

```text
Níveis 16–20  → Infinito I
Níveis 21–25  → Infinito II
Níveis 26–30  → Infinito III
Níveis 31–35  → Infinito IV
Níveis 36–40  → Infinito V
```

A sequência continua enquanto o jogador sobreviver.

Exemplos:

```text
Nível 41  → Infinito VI
Nível 50  → Infinito VII
Nível 100 → Infinito XVII
```

Mesmo depois que a velocidade atinge o limite mínimo, a progressão de níveis, linhas, pontuação e ciclos continua normalmente.

---

## 🎮 Como jogar

### Desktop e notebook

Use o teclado para controlar as peças:

| Tecla | Ação |
|------|------|
| `←` | Mover para a esquerda |
| `→` | Mover para a direita |
| `↓` | Acelerar a descida |
| `↑` | Girar a peça |
| `Espaço` | Realizar queda instantânea |
| `P` | Pausar ou continuar |
| `Esc` | Pausar ou acessar o menu, conforme o estado atual |

No desktop, os controles por toque permanecem ocultos.

A interface apresenta um painel compacto com os principais comandos disponíveis.

### Celular, tablet e iPad

Em dispositivos com tela sensível ao toque, o jogo apresenta botões para:

- mover a peça para a esquerda;
- mover a peça para a direita;
- acelerar a descida;
- girar a peça;
- realizar a queda instantânea.

O Gridfall foi projetado prioritariamente para funcionar em **orientação vertical**.

Ao virar o dispositivo para a orientação horizontal:

- a partida é pausada automaticamente;
- os comandos ficam temporariamente bloqueados;
- a peça deixa de cair;
- uma mensagem solicita que o dispositivo retorne ao modo vertical;
- o estado atual da partida é preservado.

Ao retornar para a posição vertical, o jogo permanece pausado até que o jogador escolha continuar.

---

## 🕹️ Fluxo da experiência

### ▶️ Jogar campanha

Inicia uma nova campanha com:

```text
Nível 1
Fase Início
Pontuação 0
Linhas 0
Recorde 0
```

O jogador avança automaticamente pelas fases ao eliminar linhas e subir de nível.

### 🗺️ Ver fases

Apresenta o mapa completo da jornada, contendo:

- nome da fase;
- intervalo de níveis;
- descrição;
- identidade visual;
- estado alcançado ou bloqueado.

Essa tela possui função exclusivamente informativa.

Não é possível iniciar diretamente em uma fase avançada.

### ❔ Como jogar?

Apresenta:

- objetivo da partida;
- comandos de teclado;
- controles por toque;
- regras básicas;
- funcionamento da pontuação;
- condição de Game Over.

---

## 🧮 Pontuação e recorde

A pontuação é atualizada durante a partida conforme o jogador:

- elimina linhas;
- utiliza a queda acelerada;
- realiza a queda instantânea;
- elimina múltiplas linhas em uma única jogada.

O recorde pertence somente à **sessão atual da página**.

Isso significa que:

- toda nova abertura começa com recorde `0`;
- atualizar a página redefine o recorde;
- fechar e abrir novamente redefine o recorde;
- nenhuma pontuação de outro jogador é exibida;
- o recorde não é compartilhado entre dispositivos;
- nenhuma pontuação é armazenada permanentemente no navegador.

Durante a mesma sessão, o recorde permanece disponível enquanto o jogador reinicia partidas sem atualizar ou fechar a página.

---

## 🎨 Identidade visual

O Gridfall utiliza uma estética escura, minimalista e inspirada em interfaces contemporâneas de jogos.

A identidade visual combina:

- fundo azul-marinho quase preto;
- grid discreto;
- bordas temáticas;
- tipografia de alto contraste;
- cards compactos;
- hierarquia visual clara;
- transições suaves;
- cores próprias para cada fase.

As cores das peças permanecem fixas durante toda a campanha, facilitando o reconhecimento visual.

A ambientação muda conforme a fase:

```text
Início       → violeta
Pulso        → magenta
Aceleração   → azul elétrico
Fluxo        → ciano e verde-petróleo
Sobrecarga   → vinho e rosa-avermelhado
Infinito     → cobre e fundo quase preto
```

---

## 🧠 Decisões de UX/UI

A interface foi desenvolvida para reduzir carga cognitiva e manter o tabuleiro como principal elemento da experiência.

No desktop, a tela é organizada em três áreas:

```text
Jornada          Jogo          Informações
esquerda         centro        direita
```

### Jornada

Apresenta:

- fase atual;
- progresso para o próximo nível;
- próxima fase;
- melhor nível alcançado.

### Jogo

Concentra:

- pontuação;
- nível;
- linhas;
- recorde;
- próxima peça;
- tabuleiro;
- pausa;
- reinício;
- acesso ao menu.

### Informações

Apresenta:

- resumo dos comandos;
- dica contextual;
- orientação rápida sem repetir toda a tela “Como jogar?”.

Em celulares, tablets e iPads, o tabuleiro e os controles recebem prioridade. Os conteúdos secundários são reorganizados abaixo da área principal.

---

## 🛠️ Conceitos explorados

- JavaScript modular
- Manipulação de estados
- HTML5 Canvas
- Canvas API
- Game loop com `requestAnimationFrame`
- Matrizes bidimensionais
- Geração de peças
- Detecção de colisão
- Rotação de matrizes
- Wall kick
- Soft drop
- Hard drop
- Lock delay
- Limpeza de linhas
- Sistema de pontuação
- Progressão por níveis
- Progressão por fases
- Modo Infinito
- Temas dinâmicos
- Atualização de interface
- Eventos de teclado
- Pointer Events
- Controles por toque
- Controle de orientação
- CSS Grid
- Flexbox
- Media queries
- Acessibilidade
- Separação de responsabilidades
- Validação de estados
- Servidor local auxiliar com Python
- Performance em diferentes tamanhos de tela
- Deploy estático com GitHub Pages

---

## 🧰 Ferramentas e tecnologias utilizadas

| Etapa | Tecnologia | Finalidade |
|-------|------------|------------|
| Edição de código | Visual Studio Code | Organização e desenvolvimento do projeto |
| Estrutura | HTML5 | Organização semântica das telas |
| Lógica | JavaScript | Motor, estados e regras do jogo |
| Renderização | Canvas API | Tabuleiro, peças e grid |
| Interface | CSS3 | Layout, temas e responsividade |
| Execução de scripts | Node.js e npm | Instalação, checagem e inicialização do projeto |
| Servidor local | Python | Servir os arquivos durante o desenvolvimento |
| Versionamento | Git e GitHub | Controle de versão e publicação |
| Deploy | GitHub Pages | Hospedagem pública do jogo |

> O Python é utilizado somente como servidor local auxiliar durante o desenvolvimento.  
> O motor e as regras do jogo são executados em JavaScript diretamente no navegador.

---

## 📁 Estrutura do projeto

```text
jogo-gridfall/
|-- scripts/
|   `-- dev-server.py
|
|-- src/
|   |-- css/
|   |   `-- styles.css
|   |
|   `-- js/
|       |-- controls.js
|       |-- game.js
|       |-- main.js
|       |-- pieces.js
|       |-- renderer.js
|       `-- storage.js
|
|-- .gitignore
|-- index.html
|-- LICENSE
|-- package-lock.json
|-- package.json
`-- README.md
```

### Responsabilidade dos principais arquivos

| Arquivo | Responsabilidade |
|---------|------------------|
| `index.html` | Estrutura das telas e elementos da interface |
| `main.js` | Inicialização da aplicação e controle das telas |
| `game.js` | Regras, estados, níveis, fases e progressão |
| `pieces.js` | Formatos, cores e geração das peças |
| `renderer.js` | Renderização do tabuleiro, grid e peças |
| `controls.js` | Teclado, toque, pausa e comandos do jogador |
| `storage.js` | Gerenciamento dos dados locais permitidos pelo projeto |
| `styles.css` | Layout, temas, breakpoints e identidade visual |
| `dev-server.py` | Servidor local auxiliar desenvolvido em Python |
| `.gitignore` | Arquivos e diretórios ignorados pelo Git |
| `LICENSE` | Termos da licença MIT |

---

## 💻 Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/thiago-pereira79/jogo-gridfall.git
```

### 2. Entre na pasta do projeto

```bash
cd jogo-gridfall
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Verifique o código principal

```bash
npm run check
```

### 5. Inicie o servidor local

```bash
npm run dev
```

### 6. Abra no navegador

```text
http://localhost:5173
```

O comando `npm run dev` inicia o servidor local em Python por meio do arquivo:

```text
scripts/dev-server.py
```

Para encerrar o servidor, pressione:

```text
Ctrl + C
```

A mensagem `KeyboardInterrupt` exibida após esse comando apenas informa que o servidor Python foi encerrado manualmente.

---

## 🔍 Comandos disponíveis

```bash
npm install
```

Instala e valida as dependências do projeto.

```bash
npm run check
```

Executa a checagem de sintaxe do arquivo principal JavaScript.

```bash
npm run dev
```

Inicia o servidor local do Gridfall em:

```text
http://localhost:5173
```

---

## ✅ Validações realizadas

O projeto foi validado em diferentes tamanhos de tela.

### Desktop e notebook

- 1280 × 720
- 1366 × 768
- 1440 × 900
- 1920 × 1080
- 2560 × 1440

### Celulares no modo vertical

- 360 × 640
- 375 × 667
- 390 × 844
- 412 × 915
- 430 × 932

### Tablets e iPads no modo vertical

- 768 × 1024
- 810 × 1080
- 820 × 1180
- 834 × 1194
- 1024 × 1366

Também foram verificados:

- carregamento dos arquivos com resposta HTTP `200`;
- início da campanha;
- progressão entre níveis;
- transição entre fases;
- modo Infinito;
- exibição da próxima peça;
- pausa e continuação;
- reinício;
- retorno ao menu;
- controles por teclado;
- controles por toque;
- bloqueio da orientação horizontal;
- ausência de sobreposição;
- ausência de overflow horizontal;
- preservação da proporção do Canvas;
- execução com um único game loop;
- funcionamento dos níveis avançados do modo Infinito;
- funcionamento até o nível 100 por simulação controlada.

---

## 🧩 Próximas melhorias possíveis

- efeitos sonoros opcionais;
- estatísticas detalhadas da sessão;
- sistema de conquistas;
- desafios temporários;
- temas desbloqueáveis;
- opções adicionais de acessibilidade;
- configuração personalizada dos controles;
- modo com tempo limitado;
- suporte opcional a gamepad;
- animações adicionais na limpeza de linhas;
- testes automatizados;
- versão Progressive Web App.

---

## ⚖️ Observação sobre o projeto

Gridfall é um projeto autoral inspirado em mecânicas clássicas de puzzles de blocos.

O projeto não utiliza:

- marca oficial de terceiros;
- logotipos oficiais;
- músicas oficiais;
- assets oficiais;
- identidade visual oficial de outras franquias.

Foi desenvolvido para fins de estudo, portfólio e demonstração de habilidades em:

- desenvolvimento front-end;
- UX Engineering;
- UI Design;
- responsividade;
- acessibilidade;
- lógica de jogos;
- JavaScript;
- HTML5 Canvas.

---

## 📄 Licença

Este projeto está sob a licença **MIT** - sinta-se livre para estudar, adaptar ou evoluir. 

Consulte o arquivo `LICENSE` para mais informações.

---

💻 Desenvolvido por **Thiago Pereira**
