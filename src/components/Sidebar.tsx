'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV = [
  { href:'/dashboard',   label:'Dashboard',       icon:'grid' },
  { href:'/documentos',  label:'Documentos',      icon:'file', badge:'12' },
  { href:'/atas',        label:'Atas de Reunião', icon:'table', badge:'3' },
  { href:'/historico',   label:'Histórico',       icon:'clock' },
  { href:'/admin',       label:'Administração',   icon:'settings', section:'gestão' },
]

function Icon({ name }: { name: string }) {
  const cls = 'w-4 h-4 flex-shrink-0'
  if (name === 'grid')     return <svg className={cls} viewBox="0 0 17 17" fill="none"><rect x="1" y="1" width="6.5" height="6.5" rx="1.8" fill="currentColor"/><rect x="9.5" y="1" width="6.5" height="6.5" rx="1.8" fill="currentColor"/><rect x="1" y="9.5" width="6.5" height="6.5" rx="1.8" fill="currentColor"/><rect x="9.5" y="9.5" width="6.5" height="6.5" rx="1.8" fill="currentColor"/></svg>
  if (name === 'file')     return <svg className={cls} viewBox="0 0 17 17" fill="none"><path d="M3 2h8l3.5 3.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M11 2v3.5h3.5" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="5" y1="7.5" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1.3"/><line x1="5" y1="10.5" x2="10" y2="10.5" stroke="currentColor" strokeWidth="1.3"/></svg>
  if (name === 'table')    return <svg className={cls} viewBox="0 0 17 17" fill="none"><rect x="1.5" y="3.5" width="14" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="1.5" y1="7" x2="15.5" y2="7" stroke="currentColor" strokeWidth="1.3"/><line x1="5" y1="10.5" x2="12" y2="10.5" stroke="currentColor" strokeWidth="1.3"/></svg>
  if (name === 'clock')    return <svg className={cls} viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M8.5 5v4l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
  if (name === 'settings') return <svg className={cls} viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M8.5 1.5v2M8.5 13.5v2M1.5 8.5h2M13.5 8.5h2M3.5 3.5l1.4 1.4M12.1 12.1l1.4 1.4M3.5 13.5l1.4-1.4M12.1 4.9l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  if (name === 'logout')   return <svg className={cls} viewBox="0 0 17 17" fill="none"><path d="M6 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14H6M10 5l4 3.5L10 12M6 8.5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  return null
}

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const principal = NAV.filter(n => !n.section)
  const gestao    = NAV.filter(n => n.section)

  return (
    <aside style={{ width:230, minWidth:230, background:'#fff', borderRight:'1px solid #EAEAF0', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:100, overflowY:'auto' }}>
      {/* Logo */}
      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid #EAEAF0', display:'flex', alignItems:'center', gap:10 }}>
        <svg width="36" height="36" viewBox="0 0 38 38" fill="none">
          <rect x="1" y="1" width="36" height="36" rx="8" stroke="url(#sg)" strokeWidth="1.5" fill="white"/>
          <path d="M4 9Q19 5 34 9L34 23Q19 19 4 23Z" fill="url(#sg2)"/>
          <path d="M4 15Q19 11 34 17L34 23Q19 19 4 23Z" fill="white" opacity=".5"/>
          <path d="M4 19Q19 15 34 21L34 26Q19 22 4 26Z" fill="url(#sg3)" opacity=".6"/>
          <defs>
            <linearGradient id="sg"  x1="0" y1="0" x2="38" y2="38"><stop stopColor="#7F77DD"/><stop offset="1" stopColor="#C97A7A"/></linearGradient>
            <linearGradient id="sg2" x1="0" y1="0" x2="38" y2="0"><stop stopColor="#7F77DD"/><stop offset="1" stopColor="#C97A7A"/></linearGradient>
            <linearGradient id="sg3" x1="0" y1="0" x2="38" y2="0"><stop stopColor="#C97A7A"/><stop offset="1" stopColor="#7F77DD"/></linearGradient>
          </defs>
        </svg>
        <span className="brand-text" style={{ fontSize:19, fontWeight:800 }}>vegas</span>
      </div>

      {/* Nav principal */}
      <div style={{ padding:'14px 12px 4px' }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', color:'#AEADC0', textTransform:'uppercase', padding:'0 10px', marginBottom:6 }}>principal</div>
        {principal.map(n => (
          <Link key={n.href} href={n.href} className={`nav-item${path === n.href || path.startsWith(n.href+'/') ? ' active' : ''}`}>
            <Icon name={n.icon} />
            {n.label}
            {n.badge && <span style={{ marginLeft:'auto', background:'#C97A7A', color:'#fff', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:20 }}>{n.badge}</span>}
          </Link>
        ))}
      </div>

      {/* Nav gestão */}
      <div style={{ padding:'10px 12px 4px' }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', color:'#AEADC0', textTransform:'uppercase', padding:'0 10px', marginBottom:6 }}>gestão</div>
        {gestao.map(n => (
          <Link key={n.href} href={n.href} className={`nav-item${path === n.href || path.startsWith(n.href+'/') ? ' active' : ''}`}>
            <Icon name={n.icon} />
            {n.label}
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop:'auto', padding:'14px 16px', borderTop:'1px solid #EAEAF0', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#7F77DD,#C97A7A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:800, flexShrink:0 }}>MS</div>
        <div><p style={{ fontSize:12, fontWeight:700, color:'#2C2A40', lineHeight:1.3 }}>Maria Silva</p><span style={{ fontSize:11, color:'#AEADC0' }}>Administrador</span></div>
        <button onClick={handleLogout} style={{ marginLeft:'auto', width:28, height:28, borderRadius:8, border:'1px solid #EAEAF0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0', transition:'all .15s' }} title="Sair">
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  )
}

