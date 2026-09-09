// @ts-check
const { test, expect } = require('@playwright/test');

// O React Navigation no web mantém telas anteriores montadas (ocultas) na
// DOM durante a transição, então um `getByText(...).click()` simples às
// vezes acerta um elemento antigo e invisível. Estes helpers sempre pegam o
// primeiro elemento realmente visível.
async function clicar(page, texto) {
  const candidatos = await page.getByText(texto, { exact: true }).all();
  for (const candidato of candidatos) {
    if (await candidato.isVisible()) {
      await candidato.click();
      return;
    }
  }
  throw new Error(`Nenhum elemento visível com o texto "${texto}"`);
}

async function preencherPorLabel(page, label, valor) {
  const rotulos = await page.locator('text=' + JSON.stringify(label)).all();
  for (const rotulo of rotulos) {
    if (await rotulo.isVisible()) {
      await rotulo.locator('xpath=following-sibling::*[1]/descendant-or-self::input').fill(valor);
      return;
    }
  }
  throw new Error(`Nenhum campo visível com o rótulo "${label}"`);
}

test.describe('VoleiTeam', () => {
  test('cadastro → sorteio com opções → resultado → avaliação → histórico', async ({ page }) => {
    const email = `e2e-${Date.now()}@voleymix.test`;
    const senha = 'senha123456';

    await test.step('criar conta', async () => {
      await page.goto('/');
      await expect(page.getByText('Entre para acessar sua conta', { exact: true })).toBeVisible({
        timeout: 30_000,
      });
      await clicar(page, 'Criar conta');
      await expect(page.getByText('Crie sua conta para começar', { exact: true })).toBeVisible();
      await preencherPorLabel(page, 'Nome', 'Testador E2E');
      await preencherPorLabel(page, 'E-mail', email);
      await preencherPorLabel(page, 'Senha', senha);
      await preencherPorLabel(page, 'Confirmar senha', senha);
      await clicar(page, 'Criar conta');
      await expect(page.getByText('📅 Sessões', { exact: true })).toBeVisible({ timeout: 20_000 });
    });

    await test.step('semear jogadores de teste', async () => {
      await clicar(page, 'Jogadores');
      await expect(page.getByText('Nenhum jogador cadastrado ainda.', { exact: true })).toBeVisible();
      await clicar(page, 'ou adicionar 12 jogadores de teste');
      await expect(page.getByText('Karina', { exact: true }).first()).toBeVisible({ timeout: 20_000 });
    });

    await test.step('sortear times gera múltiplas opções balanceadas', async () => {
      await clicar(page, 'Sorteio');
      await expect(page.getByText('Quem vai jogar?', { exact: true })).toBeVisible();
      await clicar(page, 'Sortear times');
      await expect(page.getByText('Opção 1', { exact: true })).toBeVisible();
      await expect(page.getByText('Opção 2', { exact: true })).toBeVisible();
      await expect(page.getByText('Opção 3', { exact: true })).toBeVisible();
      await clicar(page, 'Opção 2');
    });

    await test.step('salvar pelada no histórico', async () => {
      await clicar(page, '💾 Salvar no histórico');
      await expect(page.getByText('📋 Histórico de peladas', { exact: true })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('Nenhuma pelada salva ainda.', { exact: true })).not.toBeVisible();
    });

    await test.step('marcar time vencedor', async () => {
      await page.getByText(/times ·/).last().click();
      await expect(page.getByText('Resultado', { exact: true }).last()).toBeVisible();
      await clicar(page, 'Time 1');
      await expect(page.getByText('Time 1 venceu', { exact: true })).toBeVisible();
    });

    await test.step('avaliar jogadores da pelada', async () => {
      await clicar(page, 'Avaliar jogadores dessa pelada');
      await expect(page.getByText('⭐ Avaliar jogadores', { exact: true })).toBeVisible();
      await clicar(page, '5');
      await clicar(page, 'Salvar avaliações');
      await expect(page.getByText('Jogadores já avaliados', { exact: true })).toBeVisible({ timeout: 15_000 });
    });

    await test.step('selo de reputação e retrospecto aparecem nos jogadores', async () => {
      await page.goto('/');
      await expect(page.getByText('📅 Sessões', { exact: true })).toBeVisible({ timeout: 20_000 });
      await clicar(page, 'Jogadores');
      await expect(page.getByText(/\d\.\d \(\d+\)/).first()).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/\dV · \dD/).first()).toBeVisible();
    });

    await test.step('rankings aparecem no histórico', async () => {
      await clicar(page, 'Histórico');
      await expect(page.getByText('Mais presentes', { exact: true })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('Mais vitórias', { exact: true })).toBeVisible();
    });

    await test.step('sessão recorrente: criar, confirmar presença e sortear a partir dela', async () => {
      await clicar(page, 'Sessões');
      await expect(page.getByText('Criar sessão', { exact: true })).toBeVisible({ timeout: 15_000 });
      await clicar(page, 'Nova sessão');
      await expect(page.getByText('📅 Nova sessão', { exact: true })).toBeVisible();
      await preencherPorLabel(page, 'Nome', 'Pelada de terça');
      await clicar(page, 'Ter');
      await preencherPorLabel(page, 'Horário (opcional)', '19h');
      await clicar(page, 'Criar sessão');
      await expect(page.getByText('Pelada de terça', { exact: true }).last()).toBeVisible({ timeout: 15_000 });

      await clicar(page, 'Pelada de terça');
      await expect(page.getByText('Quem confirmou?', { exact: true })).toBeVisible({ timeout: 15_000 });
      await clicar(page, 'Karina');
      await clicar(page, 'Ana');
      await clicar(page, 'Salvar presença');

      await clicar(page, '🔀 Sortear times');
      await expect(page.getByText('🔀 Pelada de terça', { exact: true })).toBeVisible({ timeout: 15_000 });
      await clicar(page, 'Sortear times');
      await expect(page.getByText('Resultado', { exact: true }).last()).toBeVisible();
      await clicar(page, '💾 Salvar no histórico');
      await expect(page.getByText('📋 Histórico de peladas', { exact: true }).last()).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('Pelada de terça', { exact: true }).last()).toBeVisible();
    });
  });
});
