import AppShell from '@/components/AppShell'
import { createServerSupabase } from '@/lib/supabase-server'

const ACAO_CONFIG: Record<string, { label: string; bg: string; color: string; iconColor: string }> = {
  criacao:      { label:'Criação',     bg:'#EEEDFE', color:'#5B52C2', iconColor:'#7F77DD' },
  upload:       { label:'Upload',      bg:'#EEEDFE', color:'#5B52C2', iconColor:'#7F77DD' },
  edicao:       { label:'Edição',      bg:'#E6F1FB', color:'#185FA5', iconColor:'#378ADD' },
  aprovacao:    { label:'Aprovação',   bg:'#E1F5EE', color:'#0F6E56', iconColor:'#1D9E75' },
  reprovacao:   { label:'Reprovação',  bg:'#FCEBEB', color:'#A32D2D', iconColor:'#E24B4A' },
  exclusao:     { label:'Exclusão',    bg:'#FAECE7', color:'#993C1D', iconColor:'#D85A30' },
  visualizacao: { label:'Visualização',bg:'#F1EFE8', color:'#5F5E5A', iconColor:'#888780' },
}

export default async function HistoricoPage({ searchParams }: { searchParams: { acao?: string; usuario?: string } }) {
  const supabase = createServerSupabase()

  let query = supabase
    .from('historico')
    .select('id,acao,descricao,criado_em,documentos(titulo),perfis(nome,perfil)')
    .order('criado_em', { ascending: false })
    .limit(50)

  if (searchParams.acao)    query = query.eq('acao', searchParams.acao)
  if (searchParams.usuario) query = query.ilike('perfis.nome', `%${searchParams.usuario}%`)

  const { data: logs } = await query

  return (
    <AppShell>
      <header style={{ background:'#fff', borderBottom:'1px solid #EAEAF0', padding:'14px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:5 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40' }}>Histórico de Ações</div>
          <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Rastreabilidade completa de todas as operações</div>
        </div>
      </header>

      <div style={{ padding:'22px 26px' }}>
        {/* Filtros */}
        <div className="card" style={{ padding:'14px 18px', marginBottom:16, display:'flex', gap:10, flexWrap:'wrap' }}>
          <form style={{ display:'contents' }}>
            <select className="form-input" name="acao" defaultValue={searchParams.acao} style={{ width:'auto' }}>
              <option value="">Todas as ações</option>
              {Object.entries(ACAO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button type="submit" className="btn-secondary">Filtrar</button>
          </form>
        </div>

        {/* Timeline */}
        <div className="card">
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Log de Atividades</span>
            <span style={{ fontSize:11.5, color:'#AEADC0', fontWeight:600 }}>{logs?.length ?? 0} registros</span>
          </div>

          {(logs ?? []).map((log: any) => {
            const cfg = ACAO_CONFIG[log.acao] ?? ACAO_CONFIG.visualizacao
            const initials = (log.perfis?.nome ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()
            const relTime = (() => {
              const diff = Date.now() - new Date(log.criado_em).getTime()
              const m = Math.floor(diff/60000)
              if (m < 1) return 'agora'
              if (m < 60) return `há ${m}min`
              const h = Math.floor(m/60)
              if (h < 24) return `há ${h}h`
              return new Date(log.criado_em).toLocaleDateString('pt-BR')
            })()

            return (
              <div key={log.id} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 18px', borderBottom:'1px solid #F4F4F8', transition:'background .12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFE')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <div style={{ width:34, height:34, borderRadius:9, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    {log.acao === 'aprovacao' && <path d="M2 7l3.5 3.5L12 4" stroke={cfg.iconColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
                    {log.acao === 'reprovacao' && <><line x1="3" y1="3" x2="11" y2="11" stroke={cfg.iconColor} strokeWidth="1.6" strokeLinecap="round"/><line x1="11" y1="3" x2="3" y2="11" stroke={cfg.iconColor} strokeWidth="1.6" strokeLinecap="round"/></>}
                    {log.acao === 'exclusao' && <path d="M2 3.5h10M5 3.5V2h4v1.5M4.5 3.5v8h5v-8" stroke={cfg.iconColor} strokeWidth="1.4" strokeLinecap="round"/>}
                    {(log.acao === 'upload' || log.acao === 'criacao') && <><path d="M7 10V3M4 6l3-3 3 3" stroke={cfg.iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="2" y1="12" x2="12" y2="12" stroke={cfg.iconColor} strokeWidth="1.5" strokeLinecap="round"/></>}
                    {log.acao === 'edicao' && <path d="M10 1.5l2.5 2.5L4.5 11.5H2V9L10 1.5z" stroke={cfg.iconColor} strokeWidth="1.4" fill="none"/>}
                    {log.acao === 'visualizacao' && <><ellipse cx="7" cy="7" rx="5.5" ry="3.5" stroke={cfg.iconColor} strokeWidth="1.4"/><circle cx="7" cy="7" r="1.8" stroke={cfg.iconColor} strokeWidth="1.4" fill="none"/></>}
                  </svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:'#2C2A40', lineHeight:1.3 }}>
                    {log.descricao ?? `${cfg.label} realizada`}
                  </div>
                  {log.documentos?.titulo && (
                    <div style={{ fontSize:11.5, color:'#7F77DD', fontWeight:600, marginTop:2 }}>{log.documentos.titulo}</div>
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#7F77DD,#C97A7A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:800 }}>{initials}</div>
                      <span style={{ fontSize:11, color:'#AEADC0' }}>{log.perfis?.nome ?? 'Usuário'}</span>
                    </div>
                    <span style={{ fontSize:11, color:'#AEADC0' }}>{relTime}</span>
                  </div>
                </div>
                <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:cfg.bg, color:cfg.color, flexShrink:0 }}>{cfg.label}</span>
              </div>
            )
          })}

          {(logs?.length ?? 0) === 0 && (
            <div style={{ padding:'32px 16px', textAlign:'center', color:'#AEADC0', fontSize:13 }}>
              Nenhum registro no histórico ainda.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

