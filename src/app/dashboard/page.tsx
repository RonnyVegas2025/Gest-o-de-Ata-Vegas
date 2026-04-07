import AppShell from '@/components/AppShell'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = createServerSupabase()

  // Busca dados reais do Supabase
  const [{ count: totalDocs }, { count: pendentes }, { data: recentes }] = await Promise.all([
    supabase.from('documentos').select('*', { count:'exact', head:true }),
    supabase.from('documentos').select('*', { count:'exact', head:true }).eq('status','pendente'),
    supabase.from('documentos').select('id,titulo,status,criado_em,tipos_documento(nome),departamentos(sigla),perfis(nome)').order('criado_em',{ascending:false}).limit(5),
  ])

  const metrics = [
    { label:'Total de Documentos', value: totalDocs ?? 0,  color:'#EEEDFE', iconColor:'#7F77DD', change:'Total cadastrados', up:true },
    { label:'Pendentes de Aprovação', value: pendentes ?? 0, color:'#FAEEDA', iconColor:'#BA7517', change:'Aguardando aprovação', up:false },
  ]

  return (
    <AppShell>
      {/* Topbar */}
      <header style={{ background:'#fff', borderBottom:'1px solid #EAEAF0', padding:'14px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:5 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40' }}>Dashboard</div>
          <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Bem-vinda de volta · {new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</div>
        </div>
        <a href="/documentos/novo" className="btn-primary">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><line x1="6" y1="1" x2="6" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Novo Documento
        </a>
      </header>

      <div style={{ padding:'22px 26px' }}>
        {/* Metrics */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:20 }}>
          {metrics.map(m => (
            <div key={m.label} className="card" style={{ padding:18 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:11.5, color:'#9E9DB5', fontWeight:600 }}>{m.label}</span>
                <div style={{ width:32, height:32, borderRadius:9, background:m.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="14" viewBox="0 0 17 17" fill="none"><path d="M3 2h8l3.5 3.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke={m.iconColor} strokeWidth="1.4" fill="none"/><line x1="5" y1="7.5" x2="12" y2="7.5" stroke={m.iconColor} strokeWidth="1.4"/></svg>
                </div>
              </div>
              <div style={{ fontSize:30, fontWeight:800, color:'#2C2A40' }}>{m.value}</div>
              <div style={{ fontSize:11, fontWeight:700, color: m.up ? '#1D9E75' : '#D85A30', marginTop:6 }}>{m.change}</div>
            </div>
          ))}
        </div>

        {/* Documentos Recentes */}
        <div className="card">
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Documentos Recentes</span>
            <a href="/documentos" style={{ fontSize:11.5, color:'#6B62D4', fontWeight:700 }}>Ver todos →</a>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#FAFAFA' }}>
                {['Documento','Tipo','Status','Data'].map(h => (
                  <th key={h} style={{ fontSize:10.5, fontWeight:700, color:'#AEADC0', textAlign:'left', padding:'9px 16px', borderBottom:'1px solid #EAEAF0', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentes ?? []).map((d: any) => (
                <tr key={d.id} style={{ borderBottom:'1px solid #F4F4F8', cursor:'pointer' }}>
                  <td style={{ padding:'11px 16px', fontWeight:700, fontSize:12 }}>{d.titulo}</td>
                  <td style={{ padding:'11px 16px', fontSize:11.5, color:'#9E9DB5' }}>{d.tipos_documento?.nome ?? '—'}</td>
                  <td style={{ padding:'11px 16px' }}>
                    <span className={`badge-${d.status}`}>{d.status}</span>
                  </td>
                  <td style={{ padding:'11px 16px', fontSize:11, color:'#AEADC0' }}>{new Date(d.criado_em).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {(recentes?.length ?? 0) === 0 && (
                <tr><td colSpan={4} style={{ padding:'24px 16px', textAlign:'center', color:'#AEADC0', fontSize:12 }}>Nenhum documento ainda. <a href="/documentos/novo" style={{ color:'#7F77DD', fontWeight:700 }}>Criar primeiro documento</a></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}

