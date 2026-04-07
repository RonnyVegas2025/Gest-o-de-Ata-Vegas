-- ============================================================
-- VEGAS — Execute no Supabase Dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABELAS ─────────────────────────────────────────────────────

CREATE TABLE departamentos (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome  TEXT NOT NULL,
  sigla TEXT NOT NULL UNIQUE,
  cor   TEXT DEFAULT '#7F77DD',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tipos_documento (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome             TEXT NOT NULL,
  prefixo          TEXT NOT NULL UNIQUE,
  requer_aprovacao BOOLEAN DEFAULT TRUE,
  ativo            BOOLEAN DEFAULT TRUE,
  criado_em        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE perfis (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  perfil          TEXT NOT NULL DEFAULT 'usuario' CHECK (perfil IN ('admin','gestor','usuario')),
  departamento_id UUID REFERENCES departamentos(id),
  ativo           BOOLEAN DEFAULT TRUE,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documentos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo          TEXT NOT NULL,
  tipo_id         UUID NOT NULL REFERENCES tipos_documento(id),
  departamento_id UUID NOT NULL REFERENCES departamentos(id),
  responsavel_id  UUID NOT NULL REFERENCES perfis(id),
  status          TEXT NOT NULL DEFAULT 'rascunho'
                  CHECK (status IN ('rascunho','pendente','aprovado','reprovado')),
  numero_doc      TEXT,
  data_documento  DATE,
  observacoes     TEXT,
  versao_atual    INTEGER DEFAULT 1,
  criado_em       TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE atas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_id UUID NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
  numero_ata   TEXT,
  data_reuniao DATE,
  participantes TEXT[],
  criado_em    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE arquivos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_id    UUID NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
  nome_arquivo    TEXT NOT NULL,
  caminho_storage TEXT NOT NULL,
  tamanho_bytes   BIGINT,
  mime_type       TEXT,
  versao          INTEGER DEFAULT 1,
  enviado_por     UUID REFERENCES perfis(id),
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE historico (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
  usuario_id   UUID REFERENCES perfis(id) ON DELETE SET NULL,
  acao         TEXT NOT NULL CHECK (acao IN ('upload','edicao','aprovacao','reprovacao','exclusao','visualizacao','criacao')),
  descricao    TEXT,
  criado_em    TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES ─────────────────────────────────────────────────────

CREATE INDEX idx_docs_depto    ON documentos(departamento_id);
CREATE INDEX idx_docs_status   ON documentos(status);
CREATE INDEX idx_docs_tipo     ON documentos(tipo_id);
CREATE INDEX idx_hist_doc      ON historico(documento_id);
CREATE INDEX idx_hist_created  ON historico(criado_em DESC);

-- TRIGGER: criar perfil ao registrar usuário ──────────────────

CREATE OR REPLACE FUNCTION fn_criar_perfil()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfis (id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email,'@',1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'perfil','usuario')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_novo_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_criar_perfil();

-- TRIGGER: atualizar timestamp ────────────────────────────────

CREATE OR REPLACE FUNCTION fn_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_docs_updated
  BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

-- ROW LEVEL SECURITY ──────────────────────────────────────────

ALTER TABLE departamentos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis          ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico       ENABLE ROW LEVEL SECURITY;

-- Departamentos e tipos: todos leem, só admin escreve
CREATE POLICY "deptos_read"  ON departamentos FOR SELECT USING (true);
CREATE POLICY "deptos_write" ON departamentos FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'admin'));

CREATE POLICY "tipos_read"  ON tipos_documento FOR SELECT USING (true);
CREATE POLICY "tipos_write" ON tipos_documento FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'admin'));

-- Perfis: cada um vê o próprio; admin vê todos
CREATE POLICY "perfis_read" ON perfis FOR SELECT
  USING (id = auth.uid() OR
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'admin'));
CREATE POLICY "perfis_update" ON perfis FOR UPDATE USING (id = auth.uid());
CREATE POLICY "perfis_insert" ON perfis FOR INSERT WITH CHECK (true);

-- Documentos: usuário vê só seu depto; admin vê tudo
CREATE POLICY "docs_read" ON documentos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM perfis p WHERE p.id = auth.uid()
    AND (p.perfil = 'admin' OR p.departamento_id = documentos.departamento_id)
  ));
CREATE POLICY "docs_insert" ON documentos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('admin','gestor')));
CREATE POLICY "docs_update" ON documentos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM perfis p WHERE p.id = auth.uid()
    AND (p.perfil = 'admin' OR (p.perfil = 'gestor' AND p.departamento_id = documentos.departamento_id))
  ));
CREATE POLICY "docs_delete" ON documentos FOR DELETE
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'admin'));

-- Atas e arquivos: herdam a regra de documentos (simplificado)
CREATE POLICY "atas_all"     ON atas     FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "arquivos_all" ON arquivos FOR ALL USING (auth.uid() IS NOT NULL);

-- Histórico: admin vê tudo, outros veem próprias ações
CREATE POLICY "hist_read" ON historico FOR SELECT
  USING (usuario_id = auth.uid() OR
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'admin'));
CREATE POLICY "hist_insert" ON historico FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- DADOS INICIAIS ──────────────────────────────────────────────

INSERT INTO departamentos (nome, sigla, cor) VALUES
  ('Recursos Humanos',         'RH',  '#7F77DD'),
  ('Tecnologia da Informação', 'TI',  '#1D9E75'),
  ('Financeiro',               'FIN', '#BA7517'),
  ('Jurídico',                 'JUR', '#185FA5'),
  ('Diretoria',                'DIR', '#D85A30');

INSERT INTO tipos_documento (nome, prefixo, requer_aprovacao) VALUES
  ('Ata de Reunião', 'ATA', true),
  ('Contrato',       'CON', true),
  ('Procedimento',   'PRO', false),
  ('Relatório',      'REL', false),
  ('Política',       'POL', true),
  ('Manual',         'MAN', false),
  ('Proposta',       'PRP', false);

-- STORAGE: crie o bucket manualmente em Storage → New Bucket
-- Nome: "documentos"  |  Acesso: Private
-- Política sugerida (adicionar em Storage → Policies):
-- INSERT: (auth.role() = 'authenticated')
-- SELECT: (auth.role() = 'authenticated')

