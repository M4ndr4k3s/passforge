# PassForge — Plano de Desenvolvimento

> Gerador de senhas + cofre local criptografado, offline-first, da **Mdk Software**.
> Status: **pré-código** — o repo hoje só publica a política de privacidade (`index.html`, GitHub Pages).

## Estrutura de pastas planejada

```
passforge/
├── index.html          # política de privacidade (GitHub Pages) — não mover
├── CLAUDE.md           # memória do projeto para o Claude Code
├── docs/
│   └── ROADMAP.md      # este arquivo
├── src/
│   ├── app.html        # UI em arquivo único (mesmo modelo do ForgeTV)
│   └── crypto/         # se crescer: derivação de chave, formato .pfdb
├── main.js             # bootstrap Electron
├── package.json
└── .github/workflows/  # build/release por tag
```

Modelo de código: começar como **arquivo único HTML+CSS+JS vanilla** (padrão que já funciona no ForgeTV), com Electron por cima para desktop. Modularizar só quando doer.

## Fase 1 — MVP

1. Gerador de senhas: comprimento, classes de caractere, frases-senha (diceware pt-BR), medidor de força
2. Cofre `.pfdb`: criar/abrir/salvar — AES-256-GCM, PBKDF2-HMAC-SHA256 com iterações configuráveis
3. Entradas: título, usuário, senha, URL, notas; busca instantânea
4. Segurança de sessão: limpeza automática do clipboard, bloqueio por inatividade e ao minimizar, PIN opcional
5. Temas claro/escuro; i18n pt-BR/en-US

## Fase 2 — Qualidade e distribuição

1. Verificação de vazamentos (HIBP k-anonymity) — recurso opcional, off por padrão
2. Importar/exportar CSV (com aviso de segurança na exportação)
3. Testes das rotinas de criptografia (vetores conhecidos, round-trip do `.pfdb`)
4. Builds Windows + Mac via GitHub Actions (reaproveitar o modelo do ForgeTV)
5. Publicação na Microsoft Store (conta Mdk Software)

## Fase 3 — Extras

- Gerador de TOTP (2FA) nas entradas do cofre
- Auditoria do cofre: senhas fracas, repetidas, antigas
- Auto-update via releases do GitHub

## Convenções de trabalho

Iguais ao ForgeTV: issue com label (`feature`, `bug`, `qa`, `release`) → branch → PR pequeno → merge. Roadmap revisado a cada release.
