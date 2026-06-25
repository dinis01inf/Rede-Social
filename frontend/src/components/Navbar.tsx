import { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';

interface NavbarProps { 
  setView: (view: string) => void; 
  currentView: string; 
  Logout: () => void;
}

export const Navbar = ({ setView, currentView, Logout }: NavbarProps) => {
  const [notifsNum, setNotifsNum] = useState(0);
  const [MenuOpen, setMenuOpen] = useState(false); 
  const navItems = [ 
    { id: 'Criar Evento', label: 'Criar Evento'     }, 
    { id: 'Perfil', label: 'Perfil'     },  
    { id: 'Notificações',   label: 'Notificações' , badge: notifsNum },    
  ]; 

  useEffect(() => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
        
      fetch(`/api/notification/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {setNotifsNum(data.filter(n => !n.read).length);}
      })
      .catch(err => console.log(err));
  }, [currentView]);

  return (
      <nav className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      
      <button onClick={() => setView('Home')} className="text-2xl font-black tracking-tighter text-blue-400 hover:text-blue-300 transition-colors">
        EVENTLY
      </button>

      <div className="Menu">
        <button onClick={() => setMenuOpen(!MenuOpen)} className="p-2 hover:bg-slate-800 rounded-full transition-colors border border-slate-700">
          <Menu className="w-6 h-6 text-slate-300" />
        </button>

            {notifsNum > 0 && (
              <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  backgroundColor: 'red', color: 'white',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '11px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
              }}>
                  {notifsNum}
              </span>
            )}

        {MenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}>
            </div>
            
            <div className="absolute right-0 mt-3 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
              
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                    ${currentView === item.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="h-px bg-slate-700 my-1"></div>
              <button 
                onClick={() => {
                  Logout();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};