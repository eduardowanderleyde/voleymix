# Texto pra loja (App Store / Google Play)

Copiar e colar direto nos formulários do App Store Connect e do Google Play
Console. Ajustar antes de publicar se algo mudar no app.

## Nome do app

**VoleiTeam**

## Subtítulo (Apple, até 30 caracteres)

Peladas de vôlei organizadas

## Descrição curta (Google Play, até 80 caracteres)

Cadastre jogadores, sorteie times equilibrados e organize suas peladas.

## Descrição completa

```
VoleiTeam é o app pra quem organiza pelada de vôlei e cansou de sortear
time no grito.

CADASTRE OS JOGADORES
Cada jogador tem 6 notas de habilidade — saque, recepção, levantamento,
ataque, bloqueio e defesa — além da posição preferida. O app calcula o
nível médio automaticamente.

SORTEIE TIMES DE VERDADE
Modo balanceado: distribui as posições entre os times primeiro, usa os
jogadores "qualquer" pra tapar buracos, e só depois equilibra o nível.
Modo aleatório, pra quando é só brincadeira. Sempre com aviso claro se
algum time ficou sem alguma posição.

VÁRIAS OPÇÕES, VOCÊ ESCOLHE
Gere até 3 sorteios diferentes com a mesma turma e escolha o que ficou
mais justo.

HISTÓRICO E ESTATÍSTICAS
Toda pelada salva fica no histórico, com os times, o resultado e quem
mais aparece. Depois de algumas peladas, veja o ranking de presença e
de vitórias do grupo.

AVALIAÇÃO ENTRE JOGADORES
Depois do jogo, avalie os colegas — o nível de cada um evolui com o
tempo, não fica travado no cadastro inicial.

SESSÕES RECORRENTES
Cadastre a pelada de toda terça (ou qualquer dia fixo) uma vez só e
reaproveite a lista de presença toda semana.

Sem anúncios. Sem coleta de dados desnecessária. Feito pra organizador
de pelada de verdade.
```

## Palavras-chave (Apple, até 100 caracteres, separadas por vírgula)

```
vôlei,volei,pelada,sorteio,times,esporte,time,jogadores,volleyball,escalação
```

## Categoria

Esportes (Sports)

## URL da política de privacidade

https://claude.ai/code/artifact/d03f6c43-3d17-4869-83d2-911bbf34bc57

## Suporte / contato

wanderley.eduardo@gmail.com

## Checklist antes de submeter

- [ ] Screenshots do app (Jogadores, Sorteio, Resultado, Histórico) — nos
      tamanhos que cada loja pede (iPhone 6.7", Android phone)
- [ ] Confirmar se o nome "VoleiTeam" é o definitivo (ver nota no
      [README](README.md) sobre o bundle id ainda usar o codinome antigo
      `com.voleymix.app` — não impede a publicação, só é o identificador
      interno)
- [ ] Rodar `eas build --platform ios` e `eas build --platform android`
      (perfil `production` em [`eas.json`](eas.json))
- [ ] Conta Apple Developer Program ativa (US$ 99/ano) e app criado no
      App Store Connect
- [ ] Conta Google Play Console ativa (US$ 25 taxa única) e app criado
- [ ] `eas submit` pra cada loja depois do build aprovado
