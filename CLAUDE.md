# PassForge — instruções para o Claude

Gerador de senhas e gerenciador de cofre **local e offline** da Mdk Software.
App em **arquivo único** `src/app.html` (HTML+CSS+JS vanilla, sem build), desktop via Electron (`main.js`, `npm start`; `npm run dist` via electron-builder). `index.html` na raiz é a política de privacidade servida via GitHub Pages — **não mover nem renomear**, a URL é pública. Roadmap em `docs/ROADMAP.md`.

## Mapa do arquivo (marcadores `// ══ NOME ══` ou `/* ══ NOME ══ */`)

CSS: TOKENS(temas dark/light) · LOCK SCREEN · APP LAYOUT · GENERATOR/METER · MODAL · TOAST
JS: HELPERS(qs,eh/ea,b64,toast) · STATE(ST, CFG em localStorage `pf_cfg`) · I18N(dicionário pt/en, T(), applyI18n) · CRYPTO(deriveKey/encryptVault/decryptVault) · LOCK/UNLOCK(autolock) · PIN(sessão: softLock/pinUnlock, cofre cifrado em memória c/ chave do PIN, 3 erros → senha mestre, nunca persiste) · SAVE(FS Access API+fallback download) · ENTRIES(renderList/editEntry) · CLIPBOARD(copySec c/ limpeza) · GERADOR(genPassword/genPassphrase/strength) · SETTINGS · MODAL · INIT

## Formato `.pfdb`

Texto: linha mágica `PFDB1\n` + JSON `{v:1, iter, salt, iv, ct}` (base64). Payload = JSON do cofre `{entries:[...]}` cifrado com AES-256-GCM; chave via PBKDF2-HMAC-SHA256 (600k iterações padrão, configurável). Qualquer mudança no formato incrementa `v` e mantém leitura das versões anteriores.

## Teste

`npm test` roda `test/crypto-roundtrip.mjs` (Node ≥ 20, WebCrypto): round-trip, senha errada, adulteração de ciphertext e magic inválido. Rodar sempre que tocar no bloco CRYPTO.

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
