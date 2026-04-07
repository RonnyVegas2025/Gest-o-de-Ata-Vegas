'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { createBrowserClient } from '@supabase/ssr'

export default function EditarDocumentoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [tipos,   setTipos]   = useState<any[]>([])
  const [deptos,  setDeptos]  = useState<any[]>([])
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [file,    setFile]    = useState<File | null>(null)
  const [form, setForm] = useState({
    titulo:'', tipo_id:'', departamento_id:'', data_documento:'',
    observacoes:'', status:'rascunho', numero_ata:'', participantes:'',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function load() {
      const [{ data: doc }, { data: t }, { data: d }] = await Promise.all([
        supabase.from('documentos').select('*,atas(*)').eq('id', id).single(),
        supabase.from('tipos_documento').select('id,nome').eq('ativo', true),
        supabase.from('departamentos').select('id,nome').eq('ativo', true),
      ])
      if (doc) {
        const ata = Array.isArray(doc.atas) ? doc.atas[0] : doc.atas
        setForm({
          titulo:          doc.titulo ?? '',
          tipo_id:         doc.tipo_id ?? '',
          departamento_id: doc.departamento_id ?? '',
          data_documento:  doc.data_documento ?? '',
          observacoes:     doc.observacoes ?? '',
          status:          doc.status ?? 'rascunho',
          numero_ata:      ata?.numero_ata ?? '',
          participantes:   ata?.participantes?.join(', ') ?? '',
        })
      }
      setTipos(t ?? [])
      setDeptos(d ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error } = await supabase.from('documentos').update({
      titulo:          form.titulo,
      tipo_id:         form.tipo_id,
      departamento_id: form.departamento_id,
      data_documento:  form.data_documento || null,
      observacoes:     form.observacoes || null,
      status:          form.status as any,
    }).eq('id', id)

    if (error) { alert('Erro: ' + error.message); setSaving(false); return }

    // Atualiza ata se existir
    if (form.numero_ata) {
      const { data: ataExist } = await supabase.from('atas').select('id').eq('documento_id', id).single()
      const ataData = {
        documento_id: id,
        numero_ata: form.numero_ata,
        participantes: form.participantes.split(',').map(p => p.trim()).filter(Boolean),
      }
      if (ataExist) {
        await supabase.from('atas').update(ataData).eq('documento_id', id)
      } else {
        await supabase.from('atas').insert(ataData)
      }
    }

    // Upload novo arquivo se selecionado
    if (file) {
      const path = `${id}/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from('documentos').upload(path, file)
      if (!upErr) {
        const { data: docAtual } = await supabase.from('documentos').select('versao_atual').eq('id', id).single()
        const versao = (docAtual?.versao_atual ?? 0) + 1
        await supabase.from('arquivos').insert({
          documento_id: id, nome_arquivo: file.name,
          caminho_storage: path, tamanho_bytes: file.size,
          mime_type: file.type, versao, enviado_por: user.id,
        })
        await supabase.from('documentos').update({ versao_atual: versao }).eq('id', id)
      }
    }

    await supabase.from('historico').insert({
      documento_id: id, usuario_id: user.id,
      acao: 'edicao', descricao: `Documento "${form.titulo}" editado`,
    })

    router.push(`/documentos/${id}`)
  }

  const inp = (field: string) => ({
    value: (form as any)[field],
    onChange: (e: any) => setForm(p => ({ ...p, [field]: e.target.value }))
  })

  if (loading) return (
    <AppShell>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#AEADC0', fontSize:14 }}>
        Carregando...
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      <header style={{ background:'#fff', borderBottom:'1px solid #EAEAF0', padding:'14px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:5 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => router.back()} style={{ width:30, height:30, borderRadius:9, border:'1px solid #EAEAF0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0' }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M8.5 2L4 6.5l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40' }}>Editar Documento</div>
            <div style={{ fontSize:11.5, color:'#AEADC0' }}>{form.titulo}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancelar</button>
          <button form="form-edit" type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : '✓ Salvar alterações'}
          </button>
        </div>
      </header>

      <div style={{ padding:'22px 26px' }}>
        <form id="form-edit" onSubmit={handleSave}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:18 }}>
            <div>
              <div className="card" style={{ marginBottom:16 }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Informações do Documento</div>
                </div>
                <div style={{ padding:18 }}>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Título *</label>
                    <input className="form-input" required {...inp('titulo')}/>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                    <div>
                      <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Tipo *</label>
                      <select className="form-input" required {...inp('tipo_id')}>
                        <option value="">Selecione</option>
                        {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Departamento *</label>
                      <select className="form-input" required {...inp('departamento_id')}>
                        <option value="">Selecione</option>
                        {deptos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Data do documento</label>
                    <input className="form-input" type="date" {...inp('data_documento')}/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Observações</label>
                    <textarea className="form-input" rows={3} style={{ resize:'vertical' }} {...inp('observacoes')}/>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom:16 }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Dados da Ata</div>
                </div>
                <div style={{ padding:18 }}>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Número da ata</label>
                    <input className="form-input" placeholder="Ex: ATA-2026-032" {...inp('numero_ata')}/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Participantes <span style={{ color:'#AEADC0', fontWeight:400 }}>(separados por vírgula)</span></label>
                    <input className="form-input" placeholder="Carlos Mendes, Ana Rocha, ..." {...inp('participantes')}/>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Adicionar novo arquivo</div>
                  <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Gera uma nova versão do documento</div>
                </div>
                <div style={{ padding:18 }}>
                  {!file ? (
                    <label style={{ display:'block', border:'2px dashed #D4D2EA', borderRadius:12, padding:'24px 18px', textAlign:'center', background:'#FAFAFA', cursor:'pointer' }}>
                      <input type="file" style={{ display:'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" onChange={e => setFile(e.target.files?.[0] ?? null)}/>
                      <div style={{ fontSize:13, fontWeight:700, color:'#2C2A40', marginBottom:4 }}>Clique para selecionar</div>
                      <div style={{ fontSize:11.5, color:'#AEADC0' }}>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</div>
                    </label>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#FAFAFA', border:'1px solid #EAEAF0', borderRadius:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700 }}>{file.name}</div>
                        <div style={{ fontSize:10.5, color:'#AEADC0' }}>{(file.size/1024/1024).toFixed(1)} MB</div>
                      </div>
                      <button type="button" onClick={() => setFile(null)} style={{ width:24, height:24, borderRadius:6, border:'1px solid #EAEAF0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0' }}>
                        <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><line x1="2" y1="2" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="2" x2="2" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Status</div>
                </div>
                <div style={{ padding:16 }}>
                  {[
                    { v:'rascunho', label:'Rascunho',              desc:'Não visível para outros' },
                    { v:'pendente', label:'Pendente de Aprovação', desc:'Enviado para o gestor' },
                    { v:'aprovado', label:'Aprovado',              desc:'Visível para o departamento' },
                    { v:'reprovado',label:'Reprovado',             desc:'Retornou para ajuste' },
                  ].map(s => (
                    <label key={s.v} onClick={() => setForm(p => ({ ...p, status: s.v }))}
                      style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 12px', borderRadius:10, border:`1.5px solid ${form.status === s.v ? '#7F77DD' : '#E4E3F0'}`, background: form.status === s.v ? '#F5F4FC' : '#fff', cursor:'pointer', marginBottom:8, transition:'all .15s' }}>
                      <input type="radio" name="status" value={s.v} checked={form.status === s.v} onChange={() => setForm(p => ({ ...p, status: s.v }))} style={{ accentColor:'#7F77DD' }}/>
                      <div>
                        <div style={{ fontSize:12.5, fontWeight:700, color: s.v==='rascunho'?'#5F5E5A':s.v==='pendente'?'#854F0B':s.v==='aprovado'?'#0F6E56':'#A32D2D' }}>{s.label}</div>
                        <div style={{ fontSize:10.5, color:'#AEADC0', marginTop:1 }}>{s.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

