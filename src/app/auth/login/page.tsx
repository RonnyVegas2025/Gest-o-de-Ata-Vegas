'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('E-mail ou senha incorretos.'); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Painel esquerdo */}
      <div style={{ width:'46%', background:'linear-gradient(145deg,#5B52C2,#8A6FC2 40%,#C08080)', display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,.07)' }}/>
        <div style={{ position:'absolute', bottom:-60, left:-60, width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,.06)' }}/>
        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:340 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:48 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <rect x="1.5" y="1.5" width="49" height="49" rx="11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="rgba(255,255,255,0.12)"/>
              <path d="M6 13Q26 7 46 13L46 30Q26 24 6 30Z" fill="rgba(255,255,255,0.35)"/>
              <path d="M6 20Q26 14 46 21L46 30Q26 24 6 30Z" fill="rgba(255,255,255,0.22)"/>
              <path d="M6 26Q26 20 46 27L46 34Q26 28 6 34Z" fill="rgba(255,255,255,0.18)"/>
            </svg>
            <span style={{ fontSize:28, fontWeight:800, color:'#fff' }}>vegas</span>
          </div>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.6)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:28 }}>Somos Todos Humanos</div>
          <div style={{ fontSize:26, fontWeight:800, color:'#fff', lineHeight:1.3, marginBottom:16 }}>Gestão de Documentos Inteligente</div>
          <div style={{ fontSize:13.5, color:'rgba(255,255,255,.72)', lineHeight:1.7 }}>Centralize, organize e controle todos os documentos da sua empresa com rastreabilidade completa.</div>
          {['Controle de acesso por departamento','Fluxo de aprovação de atas','Histórico completo de alterações','Busca rápida e versionamento'].map(f => (
            <div key={f} style={{ display:'flex', alignItems:'center', gap:10, marginTop:16, textAlign:'left' }}>
              <div style={{ width:26, height:26, borderRadius:8, background:'rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3L11 3" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize:13, color:'rgba(255,255,255,.85)', fontWeight:600 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 40px', background:'#F0EFF6' }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <h1 style={{ fontSize:23, fontWeight:800, color:'#2C2A40', marginBottom:5 }}>Bem-vindo de volta 👋</h1>
          <p style={{ fontSize:13, color:'#9E9DB5', marginBottom:32, lineHeight:1.5 }}>Acesse sua conta para continuar gerenciando documentos da Vegas.</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#5A5878', marginBottom:6 }}>E-mail corporativo</label>
              <input className="form-input" type="email" placeholder="seu@vegas.com.br" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#5A5878', marginBottom:6 }}>Senha</label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight:40 }}/>
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#AEADC0' }}>
                  <svg width="16" height="16" viewBox="0 0 17 17" fill="none"><ellipse cx="8.5" cy="8.5" rx="6.5" ry="4" stroke="currentColor" strokeWidth="1.3"/><circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>
                </button>
              </div>
            </div>
            {error && <p style={{ fontSize:12, color:'#A32D2D', marginBottom:12, background:'#FCEBEB', padding:'8px 12px', borderRadius:8 }}>{error}</p>}
            <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:12, fontSize:14, marginBottom:16 }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar na plataforma'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:11.5, color:'#BBBACE', marginTop:24 }}>
            Precisa de acesso? <a href="mailto:admin@vegas.com.br" style={{ color:'#7F77DD', fontWeight:700 }}>Fale com o administrador</a>
          </p>
        </div>
      </div>
    </div>
  )
}

