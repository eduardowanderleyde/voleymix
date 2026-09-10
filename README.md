# VoleiTeam

App pra organizar peladas de vôlei: cadastra os jogadores com as 6 habilidades
do vôlei (saque, recepção, levantamento, ataque, bloqueio, defesa) e posição,
marca presença no dia e sorteia os times — aleatório ou balanceado por nível.
Guarda o histórico de peladas anteriores.

Stack: React Native (Expo SDK 57) + Firebase (Auth/Firestore), sem servidor
próprio.

## Rodando localmente

```
npm install
npx expo start --web
```

## Testes (e2e)

```bash
npm test
```

Roda o fluxo completo (cadastro → sortear times com múltiplas opções →
salvar pelada → marcar vencedor → avaliar jogadores → conferir selos e
rankings no Histórico) com Playwright, num navegador headless. Não toca no
Firebase de produção: `npm test` sobe os emuladores de Auth/Firestore
(`firebase emulators:exec`), aponta o app pra eles (`EXPO_PUBLIC_USE_EMULATOR=1`,
ver [`src/config/firebase.js`](src/config/firebase.js)) e derruba tudo no
final. Precisa do Chromium do Playwright instalado uma vez:
`npx playwright install chromium`.

Falha? Roda `npx playwright show-trace test-results/.../trace.zip` no
teste que quebrou — o trace mostra passo a passo o que a página tinha na
tela.

## Firebase

Projeto: `voley-mix` (console em https://console.firebase.google.com/project/voley-mix).
O app se chama **VoleiTeam** agora, mas o id do projeto Firebase, o bundle id
(`com.voleymix.app`) e o slug do Expo continuam com o codinome antigo —
trocar isso exigiria recriar o projeto/registrar os apps de novo no Firebase
e no Google Sign-In, então deixei como está.

**Passos manuais no console** (só quem tem acesso à conta consegue fazer):

1. Authentication → Sign-in method → habilitar **Email/Senha** e **Google**
   (no Google, escolher um "Project support email").
2. Firestore Database → Rules → colar o conteúdo de [`firestore.rules`](firestore.rules)
   e publicar (o texto local no repo pode estar à frente do que está publicado
   — sempre conferir antes de assumir que bate).

## Login com Google

- **Web**: já funciona assim que o provedor Google estiver habilitado no passo
  acima — usa `signInWithPopup` ([`src/config/googleAuth.web.js`](src/config/googleAuth.web.js)).
- **Android/iOS**: os apps já estão registrados no Firebase (pacote/bundle id
  `com.voleymix.app`) e `google-services.json`/`GoogleService-Info.plist` já
  estão na raiz do projeto. Falta só:
  1. Rodar `npx expo prebuild --clean` e depois `npx expo run:android` /
     `npx expo run:ios` — **não funciona no Expo Go**, precisa de build de
     desenvolvimento (Xcode/Android Studio instalados na máquina).
  2. `GOOGLE_WEB_CLIENT_ID` em [`src/config/firebase.js`](src/config/firebase.js)
     já está preenchido com o client ID web do projeto.

## Dados (Firestore)

- `users/{uid}`: perfil do organizador (`nome`, `email`)
- `jogadores/{id}`: `ownerId`, `nome`, `posicao`, as 6 notas de habilidade
  (`saque`, `recepcao`, `levantamento`, `ataque`, `bloqueio`, `defesa`, cada
  uma 1-5) e `nivelMedio` (média das 6, calculada em
  [`theme.js`](src/theme.js) `calcularNivelMedio`); opcionais, preenchidos
  conforme o grupo usa o app: `somaAvaliacoes`/`qtdAvaliacoes` (nota média
  recebida dos colegas, 1-5) e `vitorias`/`derrotas` (retrospecto — não entram
  no cálculo de `nivelMedio`, são só um selo à parte)
- `peladas/{id}`: `ownerId`, `modo` (`aleatorio`/`balanceado`), `numTimes`,
  `times` (array de `{ jogadores: [...] }` — **não pode ser array dentro de
  array**, o Firestore rejeita), `createdAt`; opcionais: `vencedorIndex`
  (índice do time em `times` que venceu), `avaliadaEm` (timestamp de quando
  os jogadores foram avaliados, trava reavaliação), `sessaoId`/`sessaoTitulo`
  (se a pelada nasceu de uma sessão agendada)
- `sessoes/{id}`: `ownerId`, `titulo`, `recorrente` (bool), `diaSemana`
  (0-6, só se recorrente) ou `data` (texto livre, só se não-recorrente),
  `horario`, `local` (opcionais), `presentes` (map `jogadorId → bool`,
  reaproveitado semana a semana), `ativa` (arquivar sem apagar)

Cada organizador só enxerga os próprios jogadores, peladas e sessões (regras
em `firestore.rules`).

## Próximos passos / ideias em aberto

Itens 1-6 da última revisão de UI já foram resolvidos:

1. [x] `PeladaDetalheScreen` reformulada: container `maxWidth`, fundo
       esportivo, e agora usa o componente `TimeCard`
       ([`src/components/TimeCard.js`](src/components/TimeCard.js))
       compartilhado com `SorteioScreen` — posição/nível em etiqueta, média
       no título, cor por time. Ganhou opção **Empate** além de "Time N
       venceu".
2. [x] Notificação in-app (`src/components/ToastHost.js` +
       `src/utils/toast.js`, montada em `App.js`) no lugar do alerta nativo
       pras confirmações de sucesso (salvar pelada, excluir, marcar
       resultado).
3. [x] `sortearBalanceado` agora marca `jogador.posicaoAdaptada` quando um
       curinga cobre uma posição faltante, e o `TimeCard` mostra
       "Central (adaptado)" nesse caso em vez de só "Qualquer".
4. [x] Card do Histórico mostra contagem de jogadores e ganhou ações **Ver
       times**, **Repetir sorteio** (pré-preenche times/modo/presença no
       Sorteio) e **Excluir**. Ranking do grupo só aparece depois de 3
       peladas salvas (`MIN_PELADAS_PARA_RANKING`).
5. [x] Fundo esportivo reduzido pra opacidade 0.4 (era 0.7) em
       `AuthBackground.js`.
6. [x] `paddingBottom: 90` conferido em Sessões/Sorteio/Jogadores/Histórico.

Menores, sem prioridade definida ainda:

- [ ] Filtro por nível (iniciante/intermediário/avançado) na aba Jogadores,
      além do filtro por posição que já existe
- [ ] Deixar claro o critério de "atacantes"/"defensores" nos indicadores
      da aba Jogadores (hoje é ponteiro+oposto / central+líbero, mas não é
      óbvio pra quem olha só o número)
- [ ] Botões de editar/excluir jogador são pequenos — aumentar a área de
      toque
- [ ] Painel lateral do Sorteio (config + composição) não fica claramente
      fixo durante a rolagem em telas largas — `position: sticky` está
      aplicado mas precisa de teste visual real num navegador
- [ ] Quando as 3 opções de sorteio empatam na diferença de nível, mostrar
      outro critério de comparação entre elas (hoje ficam indistinguíveis)
- [ ] Testar o login com Google de verdade num build de desenvolvimento
      (apps já registrados no Firebase, falta só `expo prebuild` + rodar)
- [ ] Ícone e splash personalizados (hoje é o padrão do Expo)
- [ ] Confirmação de presença que o próprio jogador faz (hoje quem marca é
      sempre o organizador) — exigiria conta por jogador ou link público,
      avaliado e adiado por enquanto
