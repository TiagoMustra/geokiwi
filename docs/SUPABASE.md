# Contas GeoKiwi · Supabase

O projeto **geokiwi**, na organização **Kiwi Corp**, está ligado em `https://ngoldetzdfrbrsqpcwdv.supabase.co`. A migração foi aplicada e os testes de acesso passaram no projeto real. O Site URL é `https://geokiwi.pages.dev`; os redirecionamentos exatos do site público, do Site privado e do desenvolvimento local foram guardados. A configuração local usa apenas a chave pública em `.env.local`, que não entra no Git.

**Pendente para registos públicos:** configurar SMTP próprio. O projeto continua com o remetente de teste do Supabase, pelo que confirmações e recuperações de acesso têm destinatários e volume limitados. A confirmação por email continua ativada. A entrega de emails e a primeira inscrição com confirmação ainda não foram verificadas de ponta a ponta.

Sem configuração de ambiente, o código continua a funcionar como convidado e esconde o botão de conta.

## Recriar a configuração

1. Cria um projeto no Supabase, de preferência numa região europeia próxima dos jogadores. Guarda a palavra-passe da base de dados; não a coloques no código nem no chat.
2. No SQL Editor, executa uma vez [a migração](../supabase/migrations/202611100001_accounts.sql). Cria `profiles`, `game_progress`, políticas de acesso e a função de sincronização. Numa migração posterior usa um ficheiro novo, não voltes a executar esta criação de tabelas.
3. Em Authentication → URL Configuration:
   - Site URL: `https://geokiwi.pages.dev`
   - Redirect URLs: `https://geokiwi.pages.dev/` e `https://geokiwi.pages.dev/?auth=recovery`.
   - Para desenvolvimento, acrescenta os equivalentes `http://127.0.0.1:5173/` e `http://127.0.0.1:5173/?auth=recovery`.
   - Só acrescenta outro domínio quando for realmente utilizado. Não uses curingas de produção.
4. Ativa Email/password e mantém a confirmação por email. Para inscrições públicas, configura **SMTP próprio**: o remetente de teste do Supabase só envia para endereços autorizados da equipa e tem um limite muito baixo. Configura também as regras de palavra-passe e os limites de pedidos em Authentication.
5. Copia o Project URL e a chave **pública Publishable** de Connect/API Keys. Localmente, copia `.env.example` para `.env.local` e preenche:

   ```dotenv
   VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   A chave `anon` antiga também é suportada. Nunca uses `secret` ou `service_role`: essas chaves contornam a proteção dos dados. O prebuild rejeita chaves de serviço e configuração incompleta.
6. Para publicar com o deploy manual atual, define estas variáveis no ambiente de compilação local e executa `npm run cloudflare:deploy`. Se passares a usar builds automáticos Cloudflare Pages/GitHub, configura-as também nas variáveis de **build** de produção desse serviço e volta a compilar. Vite incorpora os valores públicos no JavaScript; mudar variáveis de runtime sem recompilar não altera o site.
7. Testa inscrição, email de confirmação, entrada, alteração de nome, recuperação de palavra-passe, saída e continuação noutro navegador. Confirma o isolamento usando duas contas diferentes. Só considera a ativação concluída depois destas verificações no projeto real.

O SDK oficial gere a sessão e os links de confirmação/recuperação de uma SPA. A recuperação abre o formulário de nova palavra-passe. Não há uma segunda troca manual de códigos que possa consumir duas vezes o mesmo link.

## Onde fica cada coisa

- **Cloudflare Pages** distribui HTML, JavaScript, mapas e imagens. O computador do criador pode estar desligado.
- **Supabase Auth** gere emails, palavras-passe e sessões. O código do jogo nunca guarda a palavra-passe.
- **Postgres/Supabase** guarda o nome de apresentação em `profiles` e um snapshot privado das partidas, recordes, histórico do quiz e estatísticas em `game_progress`.
- **O navegador** mantém uma cópia local do progresso para resposta rápida e uso sem rede. Tema, idioma e preferências continuam neste dispositivo.
- A sessão é persistida pelo SDK no navegador. Terminar sessão remove a sessão desse dispositivo; a cópia local das partidas da conta permanece, separada das outras contas. Limpar os dados do navegador remove essa cópia. Isto não é encriptação local: em computadores partilhados, cada pessoa deve usar o seu perfil de navegador.

```text
Jogador ← ficheiros do site ← Cloudflare Pages
   ↓ entrada / confirmação de email
Supabase Auth → sessão do jogador
   ↓ pedidos autenticados com o ID da própria conta
Postgres → perfil + progresso privado → cópia local no navegador
```

## Convidados, conflitos e segurança

O progresso de convidado mantém as chaves locais antigas. Cada conta usa um espaço identificado pelo seu UUID, para não misturar partidas entre contas. Uma conta vazia pode importar explicitamente as partidas de convidado; não há importação automática nem remoção dos originais.

A sincronização espera a leitura inicial, agrupa alterações e usa uma revisão comparada no servidor. Se dois dispositivos alterarem a mesma versão, pede ao jogador para escolher a cópia local ou a da conta. Não tenta juntar automaticamente rondas incompatíveis. Alterações noutro separador recarregam o estado local do jogo; ao mudar de conta, a interface é remontada e pedidos antigos são cancelados.

As políticas RLS permitem a cada jogador ler apenas o seu perfil e progresso. Os clientes não podem escrever diretamente na tabela de progresso: a função `save_game_progress` verifica o utilizador autenticado e a revisão. Chaves desconhecidas, tokens e preferências não entram no snapshot. O snapshot tem um limite conservador de 2 MB em UTF-8.

**Estes recordes são dados privados de conveniência, não resultados competitivos certificados.** Um ranking futuro deve validar rondas e pontos no servidor; não deve confiar nos números enviados pelo navegador. Os badges desenhados continuam apenas como proposta visual.

## Estado de validação e custos

Os 184 testes da aplicação passaram, incluindo 12 testes de isolamento, sincronização, conflitos e falhas. Os ecrãs foram verificados no navegador com um serviço simulado local: confirmação pendente, importação, troca de contas, recuperação e layout móvel. A migração e o teste [access.sql](../supabase/tests/access.sql) passaram num PostgreSQL temporário (PGlite), com a camada Auth simulada, incluindo RLS e rejeição de acesso entre contas. A mesma migração e o teste `access.sql` também foram executados com sucesso no projeto Supabase real, incluindo isolamento entre contas, revisão CAS, rejeição de escrita direta e acesso anónimo. Os dados temporários do teste foram revertidos por rollback. A API Auth respondeu à chave pública correta, com Email/password ativo e confirmação de email obrigatória. A entrega de emails e o ciclo completo de inscrição/confirmação permanecem por verificar.

O plano gratuito é adequado para começar. À data da consulta (10/11/2026), inclui 50 mil utilizadores ativos por mês e 500 MB de base de dados, mas projetos gratuitos podem ser pausados após uma semana de inatividade. Confirmar os limites atuais e o custo do serviço SMTP antes de abrir inscrições públicas.

Documentação oficial: [Auth React](https://supabase.com/docs/guides/auth/quickstarts/react), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [chaves API](https://supabase.com/docs/guides/getting-started/api-keys), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [planos](https://supabase.com/pricing).
