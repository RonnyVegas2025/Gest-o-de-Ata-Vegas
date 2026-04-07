'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { createBrowserClient } from '@supabase/ssr'

export default function NovoDocumentoPage() {
  // ... estados existentes ...
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export default async function DocumentosPage({ searchParams }: { searchParams: { status?: string; busca?: string } }) {
  const supabase = createServerSupabase()

  let query = supabase
    .from('documentos')
    .select('id,titulo,status,numero_doc,criado_em,tipos_documento(nome),departamentos(nome,sigla),perfis(nome)')
    .order('criado_em', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.busca)  query = query.ilike('titulo', `%${searchParams.busca}%`)

  const { data: docs } = await query
  const { data: tipos } = await supabase.from('tipos_documento').select('id,nome').eq('ativo',true)
  const { data: deptos } = await supabase.from('departamentos').select('id,nome,sigla').eq('ativo',true)

  const statusOpts = ['rascunho','pendente','aprovado','reprovado']

  return (
    <AppShell>
      <header style={{ background:'#fff', borderBottom:'1px solid #EAEAF0', padding:'14px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:5 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:'#2C2A40' }}>Documentos</div>
          <div style={{ fontSize:11.5, color:'#AEADC0', marginTop:2 }}>{docs?.length ?? 0} documentos encontrados</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <a href="/documentos/novo" className="btn-primary">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><line x1="6" y1="1" x2="6" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Novo Documento
          </a>
        </div>
      </header>

      <div style={{ padding:'22px 26px' }}>
        {/* Filtros */}
        <div className="card" style={{ padding:'14px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <form style={{ display:'contents' }}>
            <div style={{ flex:1, minWidth:200, position:'relative' }}>
              <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#AEADC0" strokeWidth="1.4"/><line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#AEADC0" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <input className="form-input" name="busca" defaultValue={searchParams.busca} placeholder="Buscar por título..." style={{ paddingLeft:30 }}/>
            </div>
            <select className="form-input" name="status" defaultValue={searchParams.status} style={{ width:'auto' }}>
              <option value="">Todos os status</option>
              {statusOpts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" className="btn-secondary">Filtrar</button>
          </form>
        </div>

        {/* Tabela */}
        <div className="card">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#FAFAFA' }}>
                {['Documento','Tipo','Departamento','Responsável','Data','Status','Ações'].map(h => (
                  <th key={h} style={{ fontSize:10.5, fontWeight:700, color:'#AEADC0', textAlign:'left', padding:'10px 16px', borderBottom:'1px solid #EAEAF0', textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(docs ?? []).map((d: any) => (
                <tr key={d.id} style={{ borderBottom:'1px solid #F4F4F8' }}>
                  <td style={{ padding:'11px 16px' }}>
                    <div style={{ fontWeight:700, fontSize:12.5 }}>{d.titulo}</div>
                    {d.numero_doc && <div style={{ fontSize:10.5, color:'#AEADC0' }}>{d.numero_doc}</div>}
                  </td>
                  <td style={{ padding:'11px 16px', fontSize:12, color:'#9E9DB5', fontWeight:600 }}>{d.tipos_documento?.nome ?? '—'}</td>
                  <td style={{ padding:'11px 16px' }}><span className="dept-chip">{d.departamentos?.sigla ?? '—'}</span></td>
                  <td style={{ padding:'11px 16px', fontSize:12 }}>{d.perfis?.nome ?? '—'}</td>
                  <td style={{ padding:'11px 16px', fontSize:11, color:'#AEADC0', whiteSpace:'nowrap' }}>{new Date(d.criado_em).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding:'11px 16px' }}><span className={`badge-${d.status}`}>{d.status}</span></td>
                  <td style={{ padding:'11px 16px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      <a href={`/documentos/${d.id}`} style={{ width:26, height:26, borderRadius:7, border:'1px solid #EAEAF0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0', textDecoration:'none' }} title="Visualizar">
                        <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><ellipse cx="6.5" cy="6.5" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
                      </a>
                      <a href={`/documentos/${d.id}/editar`} style={{ width:26, height:26, borderRadius:7, border:'1px solid #EAEAF0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#AEADC0', textDecoration:'none' }} title="Editar">
                        <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {(docs?.length ?? 0) === 0 && (
                <tr><td colSpan={7} style={{ padding:'32px 16px', textAlign:'center', color:'#AEADC0', fontSize:13 }}>
                  Nenhum documento encontrado. <a href="/documentos/novo" style={{ color:'#7F77DD', fontWeight:700 }}>Criar novo</a>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}

