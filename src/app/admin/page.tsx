'use client'
import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('deptos')
  const [deptos,    setDeptos]    = useState<any[]>([])
  const [tipos,     setTipos]     = useState<any[]>([])
  const [usuarios,  setUsuarios]  = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [newDepto,  setNewDepto]  = useState({ nome:'', sigla:'' })
  const [newTipo,   setNewTipo]   = useState({ nome:'', prefixo:'', requer_aprovacao: true })
  const [showModal, setShowModal] = useState(false)
  const [newUser,   setNewUser]   = useState({ email:'', nome:'', perfil:'usuario', departamento_id:'' })
  const [saving,    setSaving]    = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    
    const { data: d, error: e1 } = await supabase
      .from('departamentos')
      .select('*')
    
    const { data: t, error: e2 } = await supabase
      .from('tipos_documento')
      .select('*')
    
    const { data: u, error: e3 } = await supabase
      .from('perfis')
      .select('*')

    console.log('DEPTOS:', d, 'ERRO:', e1)
    console.log('TIPOS:', t, 'ERRO:', e2)
    console.log('USERS:', u, 'ERRO:', e3)

    setDeptos(d ?? [])
    setTipos(t ?? [])
    setUsuarios(u ?? [])
    setLoading(false)
  }

  async function addDepto() {
    if (!newDepto.nome || !newDepto.sigla) return
    await supabase.from('departamentos').insert({ nome: newDepto.nome, sigla: newDepto.sigla.toUpperCase() })
    setNewDepto({ nome:'', sigla:'' })
    loadAll()
  }

  async function addTipo() {
    if (!newTipo.nome || !newTipo.prefixo) return
    await supabase.from('tipos_documento').insert({ nome: newTipo.nome, prefixo: newTipo.prefixo.toUpperCase(), requer_aprovacao: newTipo.requer_aprovacao })
    setNewTipo({ nome:'', prefixo:'', requer_aprovacao: true })
    loadAll()
  }

  async function deleteItem(table: string, id: string) {
    if (!confirm('Confirmar exclusão?')) return
    await (supabase.from(table as any) as any).update({ ativo: false }).eq('id', id)
    loadAll()
  }

  async function createUser() {
    if (!newUser.email || !newUser.nome) return
    setSaving(true)
    // Cria o usuário via Supabase Auth (Admin API não disponível no client — usar senha padrão)
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: 'Vegas@2026!',
      options: { data: { nome: newUser.nome, perfil: newUser.perfil } }
    })
    if (!error && data.user) {
      await supabase.from('perfis').update({
        nome: newUser.nome,
        perfil: newUser.perfil as any,
        departamento_id: newUser.departamento_id || null,
      }).eq('id', data.user.id)
    }
    setSaving(false)
    setShowModal(false)
    setNewUser({ email:'', nome:'', perfil:'usuario', departamento_id:'' })
    loadAll()
  }

  const TABS: { key: Tab; label: string }[] = [
    { key:'deptos',   label:'Departamentos' },
    { key:'tipos',    label:'Tipos de Documento' },
    { key:'usuarios', label:'Usuários' },
  ]

  const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    admin:   { bg:'#EEEDFE', color:'#5B52C2' },
    gestor:  { bg:'#E1F5EE', color:'#0F6E56' },
    usuario: { bg:'#F1EFE8', color:'#5F5E5A' },
  }

  return (
    <AppShell>
      <header style={{ background:'#fff', borderBottom:'1px solid #EAEAF0', padding:'14px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:5 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40' }}>Administração</div>
          <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Gerencie departamentos, tipos de documento e usuários</div>
        </div>
        {tab === 'usuarios' && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><line x1="6" y1="1" x2="6" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Novo Usuário
          </button>
        )}
      </header>

      <div style={{ padding:'22px 26px' }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:2, background:'#F5F4FC', borderRadius:10, padding:3, width:'fit-content', marginBottom:20 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding:'7px 16px', borderRadius:8, fontSize:12.5, fontWeight:700, cursor:'pointer', border:'none', fontFamily:'Nunito,sans-serif', transition:'all .15s', background: tab===t.key ? '#fff' : 'none', color: tab===t.key ? '#5B52C2' : '#7A798C', boxShadow: tab===t.key ? '0 1px 4px rgba(91,82,194,.12)' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign:'center', padding:40, color:'#AEADC0' }}>Carregando...</div>}

        {/* DEPARTAMENTOS */}
        {!loading && tab === 'deptos' && (
          <div className="card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Departamentos</div>
              <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Unidades organizacionais do sistema</div>
            </div>
            {deptos.map(d => (
              <div key={d.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:'1px solid #F4F4F8' }}>
                <div style={{ width:32, height:32, borderRadius:9, background: d.cor+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:800, color: d.cor }}>{d.sigla}</span>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#2C2A40' }}>{d.nome}</div>
                  <div style={{ fontSize:11, color:'#AEADC0', marginTop:1 }}>Sigla: {d.sigla}</div>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
                  <button onClick={() => deleteItem('departamentos', d.id)} style={{ width:26, height:26, borderRadius:7, border:'1px solid #EAEAF0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0', transition:'all .15s' }}
                    onMouseEnter={e => { (e.currentTarget.style.background='#FCEBEB'); (e.currentTarget.style.color='#A32D2D') }}
                    onMouseLeave={e => { (e.currentTarget.style.background='#fff'); (e.currentTarget.style.color='#AEADC0') }}>
                    <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2h3v1.5M4.5 3.5v7h4v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </div>
            ))}
            {/* Adicionar */}
            <div style={{ padding:'14px 18px', background:'#FAFAFA', borderTop:'1px solid #EAEAF0' }}>
              <div style={{ display:'flex', gap:8 }}>
                <input className="form-input" placeholder="Nome do departamento..." value={newDepto.nome} onChange={e => setNewDepto(p => ({ ...p, nome: e.target.value }))} style={{ flex:1 }}/>
                <input className="form-input" placeholder="Sigla" value={newDepto.sigla} onChange={e => setNewDepto(p => ({ ...p, sigla: e.target.value }))} style={{ width:80 }}/>
                <button className="btn-primary" onClick={addDepto}>Adicionar</button>
              </div>
            </div>
          </div>
        )}

        {/* TIPOS */}
        {!loading && tab === 'tipos' && (
          <div className="card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAEAF0' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#2C2A40' }}>Tipos de Documento</div>
              <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>Categorias disponíveis no cadastro</div>
            </div>
            {tipos.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:'1px solid #F4F4F8' }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'#EEEDFE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 17 17" fill="none"><path d="M3 2h8l3.5 3.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#7F77DD" strokeWidth="1.3" fill="none"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#2C2A40' }}>{t.nome}</div>
                  <div style={{ fontSize:11, color:'#AEADC0', marginTop:1 }}>Prefixo: {t.prefixo}</div>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background: t.requer_aprovacao ? '#FAEEDA' : '#F1EFE8', color: t.requer_aprovacao ? '#854F0B' : '#5F5E5A' }}>
                    {t.requer_aprovacao ? 'Aprovação obrigatória' : 'Aprovação opcional'}
                  </span>
                  <button onClick={() => deleteItem('tipos_documento', t.id)} style={{ width:26, height:26, borderRadius:7, border:'1px solid #EAEAF0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0' }}
                    onMouseEnter={e => { (e.currentTarget.style.background='#FCEBEB'); (e.currentTarget.style.color='#A32D2D') }}
                    onMouseLeave={e => { (e.currentTarget.style.background='#fff'); (e.currentTarget.style.color='#AEADC0') }}>
                    <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2h3v1.5M4.5 3.5v7h4v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </div>
            ))}
            <div style={{ padding:'14px 18px', background:'#FAFAFA', borderTop:'1px solid #EAEAF0' }}>
              <div style={{ display:'flex', gap:8 }}>
                <input className="form-input" placeholder="Nome do tipo..." value={newTipo.nome} onChange={e => setNewTipo(p => ({ ...p, nome: e.target.value }))} style={{ flex:1 }}/>
                <input className="form-input" placeholder="Prefixo" value={newTipo.prefixo} onChange={e => setNewTipo(p => ({ ...p, prefixo: e.target.value }))} style={{ width:80 }}/>
                <select className="form-input" value={String(newTipo.requer_aprovacao)} onChange={e => setNewTipo(p => ({ ...p, requer_aprovacao: e.target.value === 'true' }))} style={{ width:'auto' }}>
                  <option value="true">Aprovação obrigatória</option>
                  <option value="false">Aprovação opcional</option>
                </select>
                <button className="btn-primary" onClick={addTipo}>Adicionar</button>
              </div>
            </div>
          </div>
        )}

        {/* USUÁRIOS */}
        {!loading && tab === 'usuarios' && (
          <div className="card">
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#FAFAFA' }}>
                  {['Usuário','E-mail','Perfil','Departamento','Status'].map(h => (
                    <th key={h} style={{ fontSize:10.5, fontWeight:700, color:'#AEADC0', textAlign:'left', padding:'10px 16px', borderBottom:'1px solid #EAEAF0', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => {
                  const rc = ROLE_COLORS[u.perfil] ?? ROLE_COLORS.usuario
                  const initials = u.nome.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()
                  return (
                    <tr key={u.id} style={{ borderBottom:'1px solid #F4F4F8' }}>
                      <td style={{ padding:'11px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#7F77DD,#C97A7A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:800, flexShrink:0 }}>{initials}</div>
                          <div style={{ fontWeight:700, fontSize:12.5 }}>{u.nome}</div>
                        </div>
                      </td>
                      <td style={{ padding:'11px 16px', fontSize:11.5, color:'#7F77DD' }}>{u.email}</td>
                      <td style={{ padding:'11px 16px' }}><span style={{ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:10.5, fontWeight:700, background:rc.bg, color:rc.color }}>{u.perfil}</span></td>
                      <td style={{ padding:'11px 16px' }}>{u.departamentos?.sigla ? <span className="dept-chip">{u.departamentos.sigla}</span> : <span style={{ color:'#AEADC0', fontSize:12 }}>—</span>}</td>
                      <td style={{ padding:'11px 16px' }}><span className={u.ativo ? 'badge-aprovado' : 'badge-rascunho'}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                    </tr>
                  )
                })}
                {usuarios.length === 0 && (
                  <tr><td colSpan={5} style={{ padding:'32px 16px', textAlign:'center', color:'#AEADC0', fontSize:13 }}>Nenhum usuário cadastrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Usuário */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(44,42,64,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ background:'#fff', borderRadius:16, padding:24, width:'100%', maxWidth:480, boxShadow:'0 8px 40px rgba(44,42,64,.18)' }}>
            <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40', marginBottom:4 }}>Novo Usuário</div>
            <div style={{ fontSize:12, color:'#AEADC0', marginBottom:20 }}>A senha padrão será <strong>Vegas@2026!</strong> — o usuário deve alterar no primeiro acesso.</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div><label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Nome completo *</label><input className="form-input" placeholder="Ex: João Silva" value={newUser.nome} onChange={e => setNewUser(p => ({ ...p, nome: e.target.value }))}/></div>
              <div><label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>E-mail *</label><input className="form-input" type="email" placeholder="joao@vegas.com.br" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}/></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
              <div><label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Perfil *</label>
                <select className="form-input" value={newUser.perfil} onChange={e => setNewUser(p => ({ ...p, perfil: e.target.value }))}>
                  <option value="usuario">Usuário</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div><label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Departamento</label>
                <select className="form-input" value={newUser.departamento_id} onChange={e => setNewUser(p => ({ ...p, departamento_id: e.target.value }))}>
                  <option value="">Selecione</option>
                  {deptos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={createUser} disabled={saving}>{saving ? 'Criando...' : '✓ Criar Usuário'}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

