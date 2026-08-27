# Retomar aqui — 2026-08-26

## ⚠️ Antes de tudo: há trabalho não commitado

`git status` está sujo. Foram corrigidos 2 bugs reais e ligada a checagem estrita de tipos:

| Arquivo | O que mudou |
|---|---|
| `src/components/web/WebBackoffice.tsx:99-100` | Filtro lia `'credito'`/`'debito'`; agora `'cartao_credito'`/`'cartao_debito'` — é o que o `BillSplitModal` grava. **O DRE mostrava R$ 0,00 em cartões.** |
| `src/components/common/ExportReportsModal.tsx:87-91` | CSV de auditoria lia 5 campos que não existem no tipo (`fromTableCode`, `toTableCode`, `type`, `requestedBy`, `itemsTransferred`). Agora usa `sourceTableCode`/`targetTableCode`/`transferType`/`waiterName` + contagens. |
| `tsconfig.json` | `"strict": true` |
| `package.json` | `@types/react`, `@types/react-dom` |

**Por que os types importam:** sem eles o TypeScript degradava todo JSX para `any` e `npm run lint` dava **0 erros mascarando os 2 bugs**. Com types + strict, `tsc --noEmit` dá 0 erros de verdade. Build passa (444 kB).

→ **Ação: revisar o diff e commitar.**

## Sincronizar com o AI Studio

Estes 4 arquivos existem **só no AI Studio**, não no repo:

- `src/data/schema.sql`
- `src/data/seed.sql`
- `src/data/dbScripts.ts`
- `src/components/common/DatabaseScriptsModal.tsx`

Exportar via "Export to ZIP" / "Export to GitHub".

> ⚠️ **Não deixar o `package.json` e o `tsconfig.json` do AI Studio sobrescreverem os locais** — perde os types e o `strict`, e o lint volta a mentir.

## Pedir ao Gemini

O schema e o seed foram validados por script: **0 colunas inexistentes, 0 obrigatórias faltando, 0 valores fora dos CHECKs, 0 FKs órfãs.** Sobraram 2 lacunas de cobertura:

> Faltaram os 12 setores dos tenants `restaurante-bar`, `rooftop-lounge` e `foodpark-complexo` — o seed só traz os 4 de `quiosque-praia` (o cabeçalho diz 16). Como `tables_spots.sector_id` é NOT NULL, esses perfis não podem ter mesas e o app quebra ao trocar de ambiente.
>
> Incluir também um `cash_shifts` aberto e pagamentos em `cartao_credito`, `cartao_debito` e `dinheiro` — o seed só exercita Pix, então não prova o CHECK de `payment_method` nem o fechamento de caixa por modalidade.

## Contexto do projeto

Protótipo de demonstração comercial, **sem backend**: nenhum `fetch`, nenhum cliente de banco. Estado em `localStorage` + `BroadcastChannel` (`src/utils/syncEngine.ts`), dados em `src/data/mockData.ts`.

**Lacuna conhecida:** o "Consultor AI" não usa Gemini — é `if/else` de palavras-chave em `src/components/ai/RequirementsAssistant.tsx`, apesar de `metadata.json` declarar a capability e `@google/genai` estar nas dependências (nunca importado, assim como `express`, `dotenv` e `motion`). Decisão pendente: implementar de verdade ou remover a promessa.

## Feito em outro projeto

Calculadora de ROI genérica (multi-app) adicionada ao **SoftHam-ADM** em `src/views/RoiCalculator.tsx`, ligada ao menu. Build passou. Atenção: o SoftHam-ADM **não é repositório git**.
