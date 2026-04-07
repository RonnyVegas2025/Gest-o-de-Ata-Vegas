import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <div style={{ flex:1, marginLeft:230, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {children}
      </div>
    </div>
  )
}

