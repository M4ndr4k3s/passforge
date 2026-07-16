# PassForge — instruções para o Claude

Gerador de senhas e gerenciador de cofre **local e offline** da Mdk Software.
Hoje o repositório contém apenas `index.html` (política de privacidade, servida via GitHub Pages — **não mover nem renomear**, a URL é pública). O código do app entrará aqui seguindo a estrutura descrita em `docs/ROADMAP.md`.

## Princípios de produto (invioláveis)

- **Zero coleta de dados**: sem contas, login, analytics, anúncios ou telemetria.
- **Tudo local**: cofres `.pfdb` criptografados com AES-256-GCM; chave derivada da senha mestre via PBKDF2-HMAC-SHA256. A senha mestre nunca é armazenada.
- **Única conexão de rede permitida**: verificação de vazamentos via Have I Been Pwned com k-anonymity (apenas os 5 primeiros caracteres do hash SHA-1 saem do dispositivo), e somente se o usuário acionar.
- Qualquer feature que contrarie esses pontos exige atualização da política de privacidade **antes** do merge.

## Convenções

- Idioma da UI e das respostas: **português** (com i18n en-US como no ForgeTV).
- Identidade visual: teal `#00C4A0` / `#007A68`, fundo escuro `#0f1115` (ver `index.html`).
- Fluxo de trabalho: issue → branch `claude/<slug>` → PR pequeno → merge na `main`. Nunca commitar direto na `main`.
- Convenções novas (helpers, formatos de arquivo, chaves de storage) entram neste CLAUDE.md no mesmo PR que as introduz.
