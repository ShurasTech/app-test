import './style.css';

const STORAGE_KEY = 'app-test:discord-webhook-url';

type FeedbackKind = 'success' | 'error' | 'info';

function renderApp(root: HTMLElement): void {
  root.innerHTML = `
    <main class="card">
      <h1>Discord Webhook Sender</h1>
      <p class="subtitle">Envie uma mensagem direto para o seu webhook do Discord. Nada passa por um servidor — tudo acontece aqui no seu navegador.</p>

      <form id="send-form" novalidate>
        <label for="webhook-url">URL do Webhook do Discord</label>
        <input
          id="webhook-url"
          name="webhook-url"
          type="url"
          placeholder="https://discord.com/api/webhooks/..."
          autocomplete="off"
          required
        />

        <label for="message">Mensagem</label>
        <textarea
          id="message"
          name="message"
          rows="4"
          placeholder="Escreva sua mensagem..."
          required
        ></textarea>

        <button type="submit" id="submit-btn">Enviar</button>
      </form>

      <p id="feedback" role="status" aria-live="polite"></p>
    </main>
  `;
}

function getWebhookInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#webhook-url')!;
}

function getMessageInput(): HTMLTextAreaElement {
  return document.querySelector<HTMLTextAreaElement>('#message')!;
}

function getFeedbackEl(): HTMLElement {
  return document.querySelector<HTMLElement>('#feedback')!;
}

function loadSavedWebhook(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    getWebhookInput().value = saved;
  }
}

function setFeedback(message: string, kind: FeedbackKind): void {
  const el = getFeedbackEl();
  el.textContent = message;
  el.className = `feedback feedback--${kind}`;
}

function isLikelyDiscordWebhook(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === 'discord.com' || parsed.hostname === 'discordapp.com') &&
      parsed.pathname.includes('/api/webhooks/')
    );
  } catch {
    return false;
  }
}

async function sendToDiscord(webhookUrl: string, content: string): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(`Discord respondeu HTTP ${response.status}`);
  }
}

function attachFormHandler(): void {
  const form = document.querySelector<HTMLFormElement>('#send-form')!;
  const submitBtn = document.querySelector<HTMLButtonElement>('#submit-btn')!;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const webhookUrl = getWebhookInput().value.trim();
    const message = getMessageInput().value.trim();

    if (!webhookUrl || !message) {
      setFeedback('Preencha a URL do webhook e a mensagem antes de enviar.', 'error');
      return;
    }

    if (!isLikelyDiscordWebhook(webhookUrl)) {
      setFeedback('Essa URL não parece ser um webhook válido do Discord.', 'error');
      return;
    }

    submitBtn.disabled = true;
    setFeedback('Enviando...', 'info');

    try {
      await sendToDiscord(webhookUrl, message);
      localStorage.setItem(STORAGE_KEY, webhookUrl);
      getMessageInput().value = '';
      setFeedback('Mensagem enviada com sucesso! ✅', 'success');
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'erro desconhecido';
      setFeedback(`Falha ao enviar a mensagem: ${detail}`, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function main(): void {
  const root = document.querySelector<HTMLDivElement>('#app')!;
  renderApp(root);
  loadSavedWebhook();
  attachFormHandler();
}

main();
