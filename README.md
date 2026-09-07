# Vôlei Mix

App pra organizar peladas de vôlei: cadastra os jogadores com nível e posição,
marca presença no dia e sorteia os times — aleatório ou balanceado por nível.
Guarda o histórico de peladas anteriores.

Stack: React Native (Expo) + Firebase (Auth/Firestore), sem servidor próprio —
mesmo modelo do [Muda Recife](https://github.com/), adaptado.

## Rodando localmente

```
npm install
npx expo start
```

## Firebase

Projeto: `voley-mix` (console em https://console.firebase.google.com/project/voley-mix).

**Passo manual único:** antes do primeiro login funcionar, é preciso habilitar o
provedor de login por Email/Senha no console (Build → Authentication → Get started
→ Email/Senha → ativar). Esse primeiro clique não é possível via API.

Depois disso, `firebase deploy --only firestore:rules` publica as regras de segurança.

## Dados (Firestore)

- `users/{uid}`: perfil do organizador (nome, email)
- `jogadores/{id}`: `ownerId`, `nome`, `nivel` (1-5), `posicao`
- `peladas/{id}`: `ownerId`, `modo` (`aleatorio`/`balanceado`), `numTimes`, `times` (snapshot dos jogadores por time), `createdAt`

Cada organizador só enxerga os próprios jogadores e peladas.
