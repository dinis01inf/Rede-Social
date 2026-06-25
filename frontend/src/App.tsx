import { useState, useEffect } from 'react'; 
import { Navbar } from './components/Navbar'; 
import { Perfil } from './components/Perfil'; 
import { CreateEvent } from './components/CreateEvent';
import { Login } from './components/LogIn';
import { SignIn } from './components/SignIn';
import { Feed } from './components/Feed';
import { EventDetails } from './components/EventDetails';
import { UserDetails } from './components/UserDetails';
import { Notificações } from './components/Notificações'; 
 
type View = 'Home' | 'Perfil' | 'Criar Evento' | 'Notificações' | 'Detalhes Evento' | 'Detalhes Utilizador'; 
 
type AuthView = 'LogIn'| 'SignIn' | 'App';
  
function App() {
  const tokenGuardado = localStorage.getItem('token');
  const userIdGuardado = Number(localStorage.getItem('userId')) || null;
  const [authView, setAuthView] = useState<AuthView>(tokenGuardado ? 'App' : 'LogIn'); 
  const [view, setView] = useState<View>('Home'); 
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(userIdGuardado);
  const [notifs, setNotifs] = useState<any[]>([]);

  if(authView === 'LogIn'){
    return <Login onLoginFeito={(token, id) => {localStorage.setItem('token', token);localStorage.setItem('userId', String(id));
      setUserId(id);setAuthView('App')}}
      irParaRegisto={() => setAuthView('SignIn')}/>;}

  else if(authView === 'SignIn'){
    return <SignIn onSignInFeito={() => setAuthView('App')} irParaLogIn={() => setAuthView('LogIn')} />;
  }

  else{
    return ( 
      <div className="min-h-screen bg-gray-50"> 
        <Navbar setView={(v) => setView(v as View)} currentView={view} Logout={() => { 
          localStorage.removeItem('token'); 
          localStorage.removeItem('userId'); 
          setUserId(null);
          setAuthView('LogIn');
        }}/>
        <main className="container mx-auto px-6 py-8"> 
  
          {view === 'Home' && <Feed
            onOpenEvent={(id: number) => {
              setSelectedEventId(id);
              setView('Detalhes Evento');
            }}
            onOpenUser={(id: number) => {
              setSelectedUserId(id);
              setView('Detalhes Utilizador');
            }}
          />} 
  
          {view === 'Perfil' && ( 
            <section> 
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Perfil do Utilizador</h2> 
              <Perfil
              onOpenEvent={(id: number) => {
                setSelectedEventId(id);
                setView('Detalhes Evento');
              }}
              /> 
            </section> 
          )} 
          {view === 'Criar Evento' && (
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Criar um evento</h2>
              <CreateEvent />
            </section>
          )} 
          {view === 'Detalhes Evento' && selectedEventId !== null && (
            <EventDetails eventId={selectedEventId} userId={userId!} />
          )}
          {view === 'Detalhes Utilizador' && selectedUserId !== null && (
            <UserDetails 
            followerId={userId!} 
            followingId={selectedUserId} 
            onOpenEvent={(id: number) => {
              setSelectedEventId(id);
              setView('Detalhes Evento');
            }}
            />
          )}
          {view === 'Notificações' && 
          <section>
            <Notificações notifs={notifs} setNotifs={setNotifs}/>
          </section>}
        </main> 
      </div> 
    ); 
  }
} 
 
export default App; 
