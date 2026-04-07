import AppShell from '@/components/AppShell'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function AtasPage() {
  const supabase = createServerSupabase()

  const { data: atas } = await supabase
    .from('documentos')
    .select('id,titulo,status,criado_em,numero_doc,tipos_documento!inner(nome),departamentos(nome,sigla),perfis(nome),atas(numero_ata,data_reuniao,participantes)')
    .eq('tipos_documento.nome', 'Ata de Reunião')
    .order('criado_em', { ascending: false })

  return (
    <AppShell>
      <header style={{ background:'#fff', borderBottom:'1px solid #EAEAF0', padding:'14px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:5 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40' }}>Atas de Reunião</div>
          <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>{atas?.length ?? 0} atas no total</div>
        </div>
        <a href="/documentos/novo" className="btn-primary">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><line x1="6" y1="1" x2="6" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Nova Ata
        </a>
      </header>

      <div style={{ padding:'22px 26px' }}>
        {/* Cards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {(atas ?? []).map((d: any) => {
            const ata = Array.isArray(d.atas) ? d.atas[0] : d.atas
            const parts: string[] = ata?.participantes ?? []
            return (
              <a key={d.id} href={`/documentos/${d.id}`} style={{ textDecoration:'none' }}>
                <div className="card" style={{ padding:16, cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(91,82,194,.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.transform = '' }}>
                  <div style={{ fontSize:10.5, fontWeight:700, color:'#AEADC0', marginBottom:6 }}>
                    {ata?.numero_ata ?? d.numero_doc ?? '—'}
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40', lineHeight:1.3, marginBottom:8 }}>{d.titulo}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                    {ata?.data_reuniao && (
                      <span style={{ fontSize:10.5, color:'#9E9DB5', display:'flex', alignItems:'center', gap:3 }}>
                        <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="2" width="10" height="9" rx="1.5" stroke="#AEADC0" strokeWidth="1.2" fill="none"/><line x1="1.5" y1="5" x2="11.5" y2="5" stroke="#AEADC0" strokeWidth="1.2"/></svg>
                        {new Date(ata.data_reuniao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <span style={{ fontSize:10.5, color:'#9E9DB5', display:'flex', alignItems:'center', gap:3 }}>
                      <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2" stroke="#AEADC0" strokeWidth="1.2" fill="none"/><path d="M2 11c0-2 2-3.5 4.5-3.5S11 9 11 11" stroke="#AEADC0" strokeWidth="1.2" fill="none"/></svg>
                      {d.perfis?.nome ?? '—'}
                    </span>
                    <span className="dept-chip" style={{ fontSize:10 }}>{d.departamentos?.sigla ?? '—'}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid #F4F4F8' }}>
                    {/* Avatares participantes */}
                    <div style={{ display:'flex' }}>
                      {parts.slice(0,3).map((p,i) => (
                        <div key={i} style={{ width:22, height:22, borderRadius:'50%', border:'2px solid #fff', background:'linear-gradient(135deg,#7F77DD,#5B52C2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, color:'#fff', marginLeft: i===0?0:-6, zIndex:3-i }}>
                          {p.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                      ))}
                      {parts.length > 3 && (
                        <div style={{ width:22, height:22, borderRadius:'50%', border:'2px solid #fff', background:'#E4E3F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, fontWeight:800, color:'#7A798C', marginLeft:-6 }}>
                          +{parts.length-3}
                        </div>
                      )}
                    </div>
                    <span className={`badge-${d.status}`}>{d.status}</span>
                  </div>
                </div>
              </a>
            )
          })}

          {(atas?.length ?? 0) === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'48px 16px', color:'#AEADC0', fontSize:13 }}>
              Nenhuma ata encontrada.{' '}
              <a href="/documentos/novo" style={{ color:'#7F77DD', fontWeight:700 }}>Criar nova ata</a>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

