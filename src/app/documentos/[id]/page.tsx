import AppShell from '@/components/AppShell'
import { createServerSupabase } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'

export default async function DocumentoPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase()

  const { data: doc } = await supabase
    .from('documentos')
    .select('*,tipos_documento(nome),departamentos(nome,sigla,cor),perfis(nome,email),atas(*),arquivos(*)')
    .eq('id', params.id)
    .single()

  if (!doc) notFound()

  const { data: logs } = await supabase
    .from('historico')
    .select('*,perfis(nome)')
    .eq('documento_id', params.id)
    .order('criado_em', { ascending: false })
    .limit(20)

  const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    rascunho:  { bg:'#F1EFE8', color:'#5F5E5A' },
    pendente:  { bg:'#FAEEDA', color:'#854F0B' },
    aprovado:  { bg:'#E1F5EE', color:'#0F6E56' },
    reprovado: { bg:'#FCEBEB', color:'#A32D2D' },
  }
  const sc = STATUS_COLORS[doc.status] ?? STATUS_COLORS.rascunho

  const ata = Array.isArray(doc.atas) ? doc.atas[0] : doc.atas
  const arquivos = doc.arquivos ?? []

  return (
    <AppShell>
      <header style={{ background:'#fff', borderBottom:'1px solid #EAEAF0', padding:'14px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:5 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <a href="/documentos" style={{ width:30, height:30, borderRadius:9, border:'1px solid #EAEAF0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0', textDecoration:'none' }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M8.5 2L4 6.5l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40' }}>{doc.titulo}</div>
            <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>
              {(doc as any).tipos_documento?.nome} · {(doc as any).departamentos?.nome}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:20, fontSize:11.5, fontWeight:700, background:sc.bg, color:sc.color }}>
            {doc.status}
          </span>
          <a href={`/documentos/${params.id}/editar`} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid #EAEAF0', background:'#fff', color:'#7A798C', fontSize:12.5, fontWeight:600, textDecoration:'none' }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
            Editar
          </a>
        </div>
      </header>

      <div style={{ padding:'22px 26px', display:'grid', gridTemplateColumns:'1fr 320px', gap:18, alignItems:'start' }}>

        {/* Coluna principal */}
        <div>
          {/* Informações */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Informações do Documento</div>
            </div>
            <div style={{ padding:18 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  { label:'Título',        value: doc.titulo },
                  { label:'Tipo',          value: (doc as any).tipos_documento?.nome ?? '—' },
                  { label:'Departamento',  value: (doc as any).departamentos?.nome ?? '—' },
                  { label:'Responsável',   value: (doc as any).perfis?.nome ?? '—' },
                  { label:'Data',          value: doc.data_documento ? new Date(doc.data_documento).toLocaleDateString('pt-BR') : '—' },
                  { label:'Versão atual',  value: `v${doc.versao_atual}` },
                  { label:'Criado em',     value: new Date(doc.criado_em).toLocaleDateString('pt-BR') },
                  { label:'Atualizado em', value: new Date(doc.atualizado_em).toLocaleDateString('pt-BR') },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize:11, color:'#AEADC0', fontWeight:600, marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#2C2A40' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {doc.observacoes && (
                <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid #F4F4F8' }}>
                  <div style={{ fontSize:11, color:'#AEADC0', fontWeight:600, marginBottom:6 }}>Observações</div>
                  <div style={{ fontSize:13, color:'#2C2A40', lineHeight:1.6 }}>{doc.observacoes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Dados da Ata */}
          {ata && (
            <div className="card" style={{ marginBottom:16 }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Dados da Ata</div>
              </div>
              <div style={{ padding:18 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:11, color:'#AEADC0', fontWeight:600, marginBottom:3 }}>Número da Ata</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#2C2A40' }}>{ata.numero_ata ?? '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:'#AEADC0', fontWeight:600, marginBottom:3 }}>Data da Reunião</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#2C2A40' }}>
                      {ata.data_reuniao ? new Date(ata.data_reuniao).toLocaleDateString('pt-BR') : '—'}
                    </div>
                  </div>
                </div>
                {ata.participantes && ata.participantes.length > 0 && (
                  <div>
                    <div style={{ fontSize:11, color:'#AEADC0', fontWeight:600, marginBottom:8 }}>Participantes</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {ata.participantes.map((p: string, i: number) => (
                        <span key={i} style={{ padding:'3px 10px', borderRadius:20, background:'#EEEDFE', color:'#5B52C2', fontSize:12, fontWeight:700 }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Arquivos */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Arquivos ({arquivos.length})</div>
            </div>
            <div style={{ padding: arquivos.length ? 0 : 18 }}>
              {arquivos.length === 0 && (
                <div style={{ textAlign:'center', color:'#AEADC0', fontSize:13 }}>Nenhum arquivo anexado.</div>
              )}
              {arquivos.map((arq: any) => (
                <div key={arq.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:'1px solid #F4F4F8' }}>
                  <div style={{ width:34, height:34, borderRadius:8, background:'#FAECE7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3.5 3.5V13a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#D85A30" strokeWidth="1.3" fill="none"/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12.5, fontWeight:700, color:'#2C2A40' }}>{arq.nome_arquivo}</div>
                    <div style={{ fontSize:11, color:'#AEADC0', marginTop:1 }}>
                      v{arq.versao} · {arq.tamanho_bytes ? (arq.tamanho_bytes/1024/1024).toFixed(1)+' MB' : '—'} · {new Date(arq.criado_em).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#EEEDFE', color:'#5B52C2' }}>
                    v{arq.versao}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico */}
          <div className="card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Histórico de Alterações</div>
            </div>
            {(logs ?? []).length === 0 && (
              <div style={{ padding:18, textAlign:'center', color:'#AEADC0', fontSize:13 }}>Nenhum registro ainda.</div>
            )}
            {(logs ?? []).map((log: any) => (
              <div key={log.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 18px', borderBottom:'1px solid #F4F4F8' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#7F77DD', marginTop:5, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:'#2C2A40' }}>{log.descricao ?? log.acao}</div>
                  <div style={{ fontSize:11, color:'#AEADC0', marginTop:2 }}>
                    {log.perfis?.nome ?? '—'} · {new Date(log.criado_em).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna lateral */}
        <div>
          {/* Status */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Status</div>
            </div>
            <div style={{ padding:16 }}>
              {['rascunho','pendente','aprovado','reprovado'].map(s => {
                const c = STATUS_COLORS[s]
                const active = doc.status === s
                return (
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 12px', borderRadius:10, border:`1.5px solid ${active ? '#7F77DD' : '#E4E3F0'}`, background: active ? '#F5F4FC' : '#fff', marginBottom:8 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background: c.color, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:700, color: c.color, textTransform:'capitalize' }}>{s}</div>
                    </div>
                    {active && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, color:'#7F77DD' }}>atual</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info rápida */}
          <div className="card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Informações</div>
            </div>
            <div style={{ padding:'14px 18px' }}>
              {[
                { label:'Número',      value: doc.numero_doc ?? '—' },
                { label:'Versão',      value: `v${doc.versao_atual}` },
                { label:'Criado em',   value: new Date(doc.criado_em).toLocaleDateString('pt-BR') },
                { label:'Responsável', value: (doc as any).perfis?.nome ?? '—' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid #F4F4F8' }}>
                  <span style={{ fontSize:11.5, color:'#AEADC0', fontWeight:600 }}>{item.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#2C2A40' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

