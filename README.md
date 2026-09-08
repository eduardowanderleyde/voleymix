# Vôlei Mix

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

## Firebase

Projeto: `voley-mix` (console em https://console.firebase.google.com/project/voley-mix).

**Passos manuais no console** (só quem tem acesso à conta consegue fazer):

1. Authentication → Sign-in method → habilitar **Email/Senha** e **Google**
   (no Google, escolher um "Project support email").
2. Firestore Database → Rules → colar o conteúdo de [`firestore.rules`](firestore.rules)
   e publicar (o texto local no repo pode estar à frente do que está publicado
   — sempre conferir antes de assumir que bate).

## Login com Google

- **Web**: já funciona assim que o provedor Google estiver habilitado no passo
  acima — usa `signInWithPopup` ([`src/config/googleAuth.web.js`](src/config/googleAuth.web.js)).
- **Android/iOS (pendente)**: o código já está pronto
  ([`src/config/googleAuth.native.js`](src/config/googleAuth.native.js), pacote
  `@react-native-google-signin/google-signin`, plugin já em `app.json`), mas
  falta:
  1. No Firebase Console → Configurações do projeto → Seus apps, registrar um
     app **Android** (pacote `com.voleymix.app`) e um **iOS** (bundle id
     `com.voleymix.app`), baixando `google-services.json` e
     `GoogleService-Info.plist` e colocando na raiz do projeto.
  2. Rodar `npx expo prebuild --clean` e depois `npx expo run:android` /
     `npx expo run:ios` — **não funciona no Expo Go**, precisa de build de
     desenvolvimento.
  3. `GOOGLE_WEB_CLIENT_ID` em [`src/config/firebase.js`](src/config/firebase.js)
     já está preenchido com o client ID web do projeto.

## Dados (Firestore)

- `users/{uid}`: perfil do organizador (`nome`, `email`)
- `jogadores/{id}`: `ownerId`, `nome`, `posicao`, as 6 notas de habilidade
  (`saque`, `recepcao`, `levantamento`, `ataque`, `bloqueio`, `defesa`, cada
  uma 1-5) e `nivelMedio` (média das 6, calculada em
  [`theme.js`](src/theme.js) `calcularNivelMedio`)
- `peladas/{id}`: `ownerId`, `modo` (`aleatorio`/`balanceado`), `numTimes`,
  `times` (snapshot dos jogadores por time), `createdAt`

Cada organizador só enxerga os próprios jogadores e peladas (regras em
`firestore.rules`).

## Próximos passos / ideias em aberto

- [ ] Fazer o login com Google funcionar no celular (ver checklist acima)
- [ ] Revisar telas de Histórico/Detalhe da pelada com o mesmo polimento
      visual que Sorteio/Jogadores já receberam
- [ ] Considerar dropdown de filtro de posição (hoje é uma fileira de chips)
