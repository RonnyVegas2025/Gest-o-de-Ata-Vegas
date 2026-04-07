# Vegas — Sistema de Gestão de Documentos

Stack: **Next.js 14** · **Supabase** · **Tailwind CSS** · **Vercel**

---

## Estrutura do projeto

```
vegas-lean/
├── src/
│   ├── app/
│   │   ├── auth/login/page.tsx     ← Tela de login
│   │   ├── dashboard/page.tsx      ← Dashboard com métricas
│   │   ├── documentos/
│   │   │   ├── page.tsx            ← Lista de documentos
│   │   │   └── novo/page.tsx       ← Formulário de cadastro
│   │   ├── atas/page.tsx           ← Atas de reunião (cards)
│   │   ├── historico/page.tsx      ← Log de ações
│   │   └── admin/page.tsx          ← Deptos, tipos, usuários
│   ├── components/
│   │   ├── Sidebar.tsx             ← Sidebar compartilhada
│   │   └── AppShell.tsx            ← Wrapper com sidebar
│   ├── lib/
│   │   └── supabase.ts             ← Client + Server Supabase
│   └── middleware.ts               ← Proteção de rotas
├── supabase/
│   └── schema.sql                  ← Schema completo do banco
└── .env.local.example              ← Variáveis de ambiente
```

---

## Passo 1 — Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project** e preencha:
   - Nome: `vegas-app`
   - Senha do banco: anote em lugar seguro
   - Região: escolha a mais próxima (South America)
3. Aguarde o projeto inicializar (~2 min)
4. No menu lateral, vá em **SQL Editor → New Query**
5. Cole todo o conteúdo de `supabase/schema.sql` e clique **Run**
6. Vá em **Storage → New Bucket**:
   - Nome: `documentos`
   - Marque **Private**
   - Clique em **Create bucket**
7. Em **Storage → Policies → documentos**, adicione:
   - **INSERT**: `(auth.role() = 'authenticated')`
   - **SELECT**: `(auth.role() = 'authenticated')`
8. Vá em **Settings → API** e copie:
   - `Project URL`
   - `anon / public key`

---

## Passo 2 — Clonar e configurar localmente

```bash
# Clone o repositório (após criar no GitHub)
git clone https://github.com/seu-usuario/vegas-app.git
cd vegas-app

# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente
cp .env.local.example .env.local
```

Edite `.env.local` com seus valores do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

```bash
# Rode o servidor de desenvolvimento
npm run dev
# Abra http://localhost:3000
```

---

## Passo 3 — Criar o primeiro usuário administrador

1. No Supabase, vá em **Authentication → Users → Invite user**
2. Digite o e-mail do administrador e clique **Send invite**
3. O usuário receberá um e-mail para definir a senha
4. Após o login, vá em **SQL Editor** e execute:

```sql
-- Substitua 'seu@email.com' pelo e-mail do admin
UPDATE perfis
SET perfil = 'admin'
WHERE email = 'seu@email.com';
```

---

## Passo 4 — GitHub

```bash
# Na pasta do projeto
git init
git add .
git commit -m "feat: projeto inicial Vegas"

# Crie um repositório no GitHub (github.com/new)
# Depois conecte:
git remote add origin https://github.com/seu-usuario/vegas-app.git
git branch -M main
git push -u origin main
```

---

## Passo 5 — Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **Add New → Project**
3. Selecione o repositório `vegas-app`
4. Em **Environment Variables**, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
   ```
5. Clique em **Deploy**
6. Aguarde ~2 minutos — sua URL ficará disponível em `https://vegas-app.vercel.app`

---

## Passo 6 — Configurar URL de retorno no Supabase

Após o deploy, volte ao Supabase:

1. **Authentication → URL Configuration**
2. Em **Site URL**, coloque: `https://vegas-app.vercel.app`
3. Em **Redirect URLs**, adicione: `https://vegas-app.vercel.app/**`
4. Salve

---

## Funcionalidades implementadas

| Tela          | Descrição                                              |
|---------------|--------------------------------------------------------|
| Login         | Autenticação com e-mail e senha via Supabase Auth      |
| Dashboard     | Métricas reais + documentos recentes do banco          |
| Documentos    | Lista com filtros por status/tipo + busca por título   |
| Novo Documento| Formulário completo com upload de arquivo para Storage |
| Atas          | Visualização em cards com participantes e status       |
| Histórico     | Timeline de todas as ações com usuário e horário       |
| Administração | Gerenciar departamentos, tipos de doc e usuários       |

---

## Próximos passos sugeridos (Fase 2)

- [ ] Página de detalhe do documento com versões
- [ ] Fluxo de aprovação (botões Aprovar/Reprovar)
- [ ] Notificações por e-mail (Supabase Edge Functions + Resend)
- [ ] Filtro por departamento na listagem
- [ ] Assinatura digital de atas
- [ ] Busca full-text dentro de PDFs (pgvector + OCR)

---

## Suporte

Dúvidas? Abra uma issue no repositório ou contate o administrador do sistema.

