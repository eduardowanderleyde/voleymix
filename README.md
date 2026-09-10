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

Resolvidos na rodada seguinte:

- [x] Filtro por nível (iniciante/intermediário/avançado) na aba Jogadores,
      além do filtro por posição
- [x] Legenda explicando "atacantes" (ponteiro+oposto) / "defensores"
      (central+líbero) abaixo dos indicadores
- [x] Botões de editar/excluir jogador com área de toque maior (32×32,
      fundo próprio)
- [x] Quando as opções de sorteio empatam na diferença de nível, mostra
      ataque/defesa como critério extra (`diferencaHabilidade` em
      `sorteio.js`)
- [x] Médias e diferenças mostram vírgula (`3,2`) em vez de ponto (`3.2`)
- [x] **Login com Google não quebra mais no Expo Go**: o pacote nativo
      (`@react-native-google-signin/google-signin`) lançava um erro na hora
      da importação se o app não tivesse o código nativo compilado — travava
      a tela de Login inteira ao abrir no celular sem build customizado.
      Agora carrega sob demanda (só quando o botão é apertado) com
      try/catch — resto do app funciona normal no Expo Go, só o botão do
      Google mostra aviso de que precisa de build de desenvolvimento.

Ainda em aberto:

- [ ] Painel lateral do Sorteio (config + composição) não fica claramente
      fixo durante a rolagem em telas largas — `position: sticky` está
      aplicado mas precisa de teste visual real num navegador
- [ ] Testar o login com Google de verdade num build de desenvolvimento
      (apps já registrados no Firebase, falta só `expo prebuild` + rodar)
- [ ] Ícone e splash personalizados (hoje é o padrão do Expo)
### Conta por jogador — plano em fases

Decidido fazer: cada jogador confirma a própria presença, edita as próprias
notas e avalia os colegas, em vez de só o organizador mexer em tudo. É uma
mudança de arquitetura grande (dois papéis: organizador e jogador
vinculado), por isso está dividida em fases pra não arriscar tudo de uma
vez — cada fase deveria dar pra testar isoladamente antes de seguir pra
próxima.

- [x] **Fase 1 — convite, pedido e aprovação** (feita em `392915b`).
      Código de convite em `users/{uid}.codigoConvite` (gerado automático,
      mostrado no Perfil). Jogador cria conta, digita o código em "Entrar
      numa pelada", isso cria um doc em `solicitacoes/{id}` com
      `status: 'pendente'`. Organizador vê em "Pedidos pra entrar" no
      Perfil e aprova/recusa. Aprovar cria `jogadores/{uid do jogador}`
      (doc ID = uid da conta, não um ID aleatório — decisão de design que
      as próximas fases dependem) com `ownerId` do organizador e notas
      padrão 3. Regras do `solicitacoes` já publicadas em
      `firestore.rules`.

- [ ] **Fase 2 — jogador vinculado enxerga os dados do organizador**.
      Hoje toda tela consulta `where('ownerId', '==', auth.currentUser.uid)`
      (via `useMinhaColecao`) — pra um jogador vinculado isso retorna vazio,
      porque ele não é dono de nada, é dono do *organizador*.
      - Criar hook `useEffectiveOwnerId()`: se existir
        `jogadores/{meu uid}`, uso o `ownerId` de dentro dele; senão, uso
        meu próprio uid (sou organizador).
      - `SorteioScreen`, `JogadoresScreen`, `HistoricoScreen`,
        `SessoesScreen` (e os writes de `NovoJogadorScreen`/
        `NovaSessaoScreen`) trocam `auth.currentUser.uid` por esse id
        efetivo.
      - Esconder da UI o que só organizador pode fazer quando o usuário é
        jogador vinculado: "Adicionar jogador", "Nova sessão", editar/
        excluir jogador, configurar e disparar o sorteio (não estava nas
        permissões pedidas — jogador só vê o resultado, não configura).
      - Regras do Firestore: liberar leitura de `peladas`/`sessoes`/
        `jogadores` pro jogador vinculado do mesmo grupo (comparando
        `resource.data.ownerId` com o `ownerId` do meu próprio doc
        `jogadores/{auth.uid}`, via `get()` na regra).

- [ ] **Fase 3 — ações que o próprio jogador faz**.
      - Confirmar a própria presença: `sessoes.presentes` é um mapa
        `jogadorId → bool` — como `jogadorId` agora pode ser o próprio
        `auth.uid` do jogador vinculado, a regra de update pode checar
        `request.resource.data.presentes.diff(resource.data.presentes)
        .affectedKeys().hasOnly([request.auth.uid])` (só mexe na própria
        entrada do mapa, não nas dos outros).
      - Editar as próprias 6 notas de habilidade em
        `jogadores/{auth.uid}` — regra de update restrita a esses campos
        (`saque`/`recepcao`/`levantamento`/`ataque`/`bloqueio`/`defesa`/
        `nivelMedio`), nunca `ownerId`, `vitorias`, `derrotas`,
        `somaAvaliacoes`, `qtdAvaliacoes`.
      - Avaliar os colegas: abrir `AvaliarPeladaScreen` pra jogador
        vinculado (hoje só quem tem `ownerId` acessa) e permitir, via
        regra, escrever `somaAvaliacoes`/`qtdAvaliacoes` em *outro*
        `jogadores/{id}` contanto que os dois tenham o mesmo `ownerId`
        (checagem com `get()`).
      - Essa fase é a que mexe em mais regra fina — vale testar contra o
        emulador (`npm test` já sobe Auth+Firestore local) antes de
        publicar em produção.

- [ ] **Fase 4 — polimento e casos de borda**.
      - Indicador visual no app ("Você faz parte da pelada de [nome]" vs
        "Você é organizador") — hoje não tem nada na tela dizendo qual dos
        dois papéis a pessoa está usando.
      - Jogador sair do grupo / organizador remover um jogador vinculado
        (hoje só existe `allow delete` pro organizador em `jogadores`, dá
        pra reaproveitar, mas falta o botão).
      - Decidir o que fazer se a pessoa tentar entrar em *dois* grupos
        diferentes — a Fase 1 só guarda "meu pedido mais recente"
        (`minhaSolicitacao` em `PerfilScreen`), múltiplos vínculos não são
        suportados ainda nem bloqueados explicitamente.
      - Reconferir com o emulador o fluxo inteiro de ponta a ponta
        (convite → aprovação → jogador confirma presença → sorteio →
        jogador avalia colega) antes de considerar pronto.
