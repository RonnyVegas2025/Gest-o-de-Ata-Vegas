'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

export default function NovoDocumentoPage() {
  const router = useRouter()
  const [tipos,  setTipos]  = useState<any[]>([])
  const [deptos, setDeptos] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [file,   setFile]   = useState<File | null>(null)
  const [form, setForm] = useState({
    titulo:'', tipo_id:'', departamento_id:'', data_documento:'',
    observacoes:'', status:'rascunho', numero_ata:'', participantes:'',
  })

  useEffect(() => {
    supabase.from('tipos_documento').select('id,nome').eq('ativo',true).then(r => setTipos(r.data ?? []))
    supabase.from('departamentos').select('id,nome').eq('ativo',true).then(r => setDeptos(r.data ?? []))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data: doc, error } = await supabase.from('documentos').insert({
      titulo: form.titulo,
      tipo_id: form.tipo_id,
      departamento_id: form.departamento_id,
      responsavel_id: user.id,
      data_documento: form.data_documento || null,
      observacoes: form.observacoes || null,
      status: form.status as any,
    }).select().single()

    if (error || !doc) { setSaving(false); alert('Erro ao salvar: ' + error?.message); return }

    // Cria ata se preenchida
    if (form.numero_ata) {
      await supabase.from('atas').insert({
        documento_id: doc.id,
        numero_ata: form.numero_ata,
        participantes: form.participantes.split(',').map(p => p.trim()).filter(Boolean),
      })
    }

    // Upload arquivo
    if (file) {
      const path = `${doc.id}/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from('documentos').upload(path, file)
      if (!upErr) {
        await supabase.from('arquivos').insert({
          documento_id: doc.id, nome_arquivo: file.name,
          caminho_storage: path, tamanho_bytes: file.size,
          mime_type: file.type, versao: 1, enviado_por: user.id,
        })
      }
    }

    // Log
    await supabase.from('historico').insert({ documento_id: doc.id, usuario_id: user.id, acao:'criacao', descricao:`Documento "${form.titulo}" criado` })

    router.push('/documentos')
  }

  const inp = (field: string) => ({ value: (form as any)[field], onChange: (e: any) => setForm(p => ({ ...p, [field]: e.target.value })) })

  return (
    <AppShell>
      <header style={{ background:'#fff', borderBottom:'1px solid #EAEAF0', padding:'14px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:5 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => router.back()} style={{ width:30, height:30, borderRadius:9, border:'1px solid #EAEAF0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0' }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M8.5 2L4 6.5l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40' }}>Novo Documento</div>
            <div style={{ fontSize:11.5, color:'#AEADC0' }}>Preencha os dados e faça o upload</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancelar</button>
          <button form="form-doc" type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : '✓ Salvar documento'}
          </button>
        </div>
      </header>

      <div style={{ padding:'22px 26px' }}>
        <form id="form-doc" onSubmit={handleSave}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:18 }}>
            {/* Coluna principal */}
            <div>
              {/* Informações */}
              <div className="card" style={{ marginBottom:16 }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Informações do Documento</div>
                  <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Campos com * são obrigatórios</div>
                </div>
                <div style={{ padding:18 }}>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Título <span style={{ color:'#C97A7A' }}>*</span></label>
                    <input className="form-input" required placeholder="Ex: Ata de Reunião Geral — Março 2026" {...inp('titulo')}/>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                    <div>
                      <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Tipo <span style={{ color:'#C97A7A' }}>*</span></label>
                      <select className="form-input" required {...inp('tipo_id')}>
                        <option value="">Selecione</option>
                        {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Departamento <span style={{ color:'#C97A7A' }}>*</span></label>
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
                    <textarea className="form-input" rows={3} placeholder="Informações adicionais..." style={{ resize:'vertical' }} {...inp('observacoes')}/>
                  </div>
                </div>
              </div>

              {/* Dados da ata */}
              <div className="card" style={{ marginBottom:16 }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Dados da Ata</div>
                  <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Preencha apenas se for Ata de Reunião</div>
                </div>
                <div style={{ padding:18 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                    <div>
                      <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Número da ata</label>
                      <input className="form-input" placeholder="Ex: ATA-2026-032" {...inp('numero_ata')}/>
                    </div>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Participantes <span style={{ color:'#AEADC0', fontWeight:400 }}>(separados por vírgula)</span></label>
                    <input className="form-input" placeholder="Carlos Mendes, Ana Rocha, ..." {...inp('participantes')}/>
                  </div>
                </div>
              </div>

              {/* Upload */}
              <div className="card">
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Arquivo</div>
                  <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Limite de 50MB</div>
                </div>
                <div style={{ padding:18 }}>
                  {!file ? (
                    <label style={{ display:'block', border:'2px dashed #D4D2EA', borderRadius:12, padding:'28px 18px', textAlign:'center', background:'#FAFAFA', cursor:'pointer', transition:'all .2s' }}>
                      <input type="file" style={{ display:'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" onChange={e => setFile(e.target.files?.[0] ?? null)}/>
                      <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#EEEDFE,#FAF0EE)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                        <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 15V5M7 9l4-4 4 4" stroke="#7F77DD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h16" stroke="#C08080" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </div>
                      <div style={{ fontSize:13.5, fontWeight:700, color:'#2C2A40', marginBottom:4 }}>Clique para selecionar</div>
                      <div style={{ fontSize:11.5, color:'#AEADC0' }}>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</div>
                    </label>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#FAFAFA', border:'1px solid #EAEAF0', borderRadius:10 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:'#FAECE7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3.5 3.5V13a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#D85A30" strokeWidth="1.3" fill="none"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700 }}>{file.name}</div>
                        <div style={{ fontSize:10.5, color:'#AEADC0' }}>{(file.size/1024/1024).toFixed(1)} MB</div>
                      </div>
                      <button type="button" onClick={() => setFile(null)} style={{ marginLeft:'auto', width:24, height:24, borderRadius:6, border:'1px solid #EAEAF0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0' }}>
                        <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><line x1="2" y1="2" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="2" x2="2" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna lateral */}
            <div>
              <div className="card">
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Status</div>
                </div>
                <div style={{ padding:16 }}>
                  {[
                    { v:'rascunho', label:'Rascunho', desc:'Não visível para outros' },
                    { v:'pendente', label:'Pendente de Aprovação', desc:'Enviado para o gestor' },
                    { v:'aprovado', label:'Aprovado', desc:'Visível para o departamento' },
                  ].map(s => (
                    <label key={s.v} onClick={() => setForm(p => ({ ...p, status: s.v }))} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 12px', borderRadius:10, border:`1.5px solid ${form.status === s.v ? '#7F77DD' : '#E4E3F0'}`, background: form.status === s.v ? '#F5F4FC' : '#fff', cursor:'pointer', marginBottom:8, transition:'all .15s' }}>
                      <input type="radio" name="status" value={s.v} checked={form.status === s.v} onChange={() => setForm(p => ({ ...p, status: s.v }))} style={{ accentColor:'#7F77DD' }}/>
                      <div>
                        <div style={{ fontSize:12.5, fontWeight:700, color: s.v==='rascunho'?'#5F5E5A':s.v==='pendente'?'#854F0B':'#0F6E56' }}>{s.label}</div>
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

