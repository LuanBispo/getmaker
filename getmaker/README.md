# GetMaker

> Conectamos quem precisa automatizar com quem sabe executar.

MVP para conectar clientes com projetos de automação a técnicos capacitados.

---

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS**
- **Supabase** (banco de dados + autenticação)
- **TypeScript**

---

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/enviar-projeto` | Público | Formulário de envio de projetos |
| `/login` | Público | Login para técnicos e admin |
| `/tecnico` | Técnico (auth) | Dashboard com projetos disponíveis |
| `/admin` | Admin (auth) | Gestão de projetos e técnicos |

---

## Instalação

### 1. Clone e instale

```bash
git clone <repo>
cd getmaker
npm install
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse **Settings > API** e copie:
   - `Project URL`
   - `anon public` key
   - `service_role` key (mantenha **secreta**)

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas chaves.

### 4. Execute o schema SQL

No Supabase, acesse **SQL Editor** e cole o conteúdo de `supabase/schema.sql`.

### 5. Crie o usuário admin

No Supabase, acesse **Authentication > Users > Add user**:
- E-mail: `seu@email.com`
- Senha: (forte, guarde bem)
- Marque **Auto Confirm User**

Depois execute no SQL Editor (substituindo o UUID):

```sql
insert into public.profiles (user_id, role, name, email)
values (
  'UUID_DO_USUARIO_COPIADO',
  'admin',
  'Seu Nome',
  'seu@email.com'
);
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## Deploy na Vercel

1. Faça push para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Deploy na Netlify

Use `@netlify/plugin-nextjs`. Configure as mesmas variáveis de ambiente.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── enviar-projeto/     # Formulário público
│   ├── login/              # Login
│   ├── tecnico/            # Dashboard do técnico (protegido)
│   ├── admin/              # Dashboard admin (protegido)
│   └── api/
│       ├── technicians/    # POST — cria técnico (service role)
│       └── projects/[id]/status/  # PATCH — atualiza status
├── actions/
│   ├── projects.ts         # Server action: enviar projeto
│   └── interests.ts        # Server action: registrar interesse
├── components/
│   ├── TechnicianDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectDetailModal.tsx
│   ├── AddTechnicianForm.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── supabase/client.ts  # Browser client
│   ├── supabase/server.ts  # Server client (SSR)
│   └── utils.ts
└── types/index.ts
```

---

## Banco de dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários autenticados (role: admin/technician) |
| `technicians` | Dados extras dos técnicos |
| `projects` | Projetos enviados pelos clientes |
| `project_interests` | Interesses dos técnicos em projetos |
| `project_closures` | *(futuro)* Registro de fechamentos |

### Status dos projetos

| Valor | Label |
|-------|-------|
| `new` | Novo |
| `analyzing` | Em análise |
| `sent_to_technicians` | Enviado para técnicos |
| `negotiating` | Em negociação |
| `closed` | Fechado |
| `cancelled` | Cancelado |

---

## Segurança

- Clientes enviam projetos sem login (RLS permite insert anônimo)
- WhatsApp dos clientes visível apenas para usuários autenticados
- `/tecnico` e `/admin` protegidos por middleware + layout server-side
- Criação de técnicos usa `SUPABASE_SERVICE_ROLE_KEY` (somente servidor)
- Admin não pode ser criado pela plataforma — apenas via Supabase dashboard

---

## Funcionalidades futuras (estrutura preparada)

- [ ] Ranking de técnicos (taxa de fechamento, avaliações)
- [ ] Sistema de fechamento com atribuição de técnico
- [ ] Notificações via WhatsApp/e-mail (novos projetos)
- [ ] Plano pago com acesso antecipado a projetos
- [ ] Tabela `project_closures` já criada no schema
