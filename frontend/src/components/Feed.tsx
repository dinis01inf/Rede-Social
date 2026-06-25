import { EventCard } from './EventCard';
import { UserCard} from './UserCard';
import { useState, useEffect } from 'react';

export const Feed = ({ onOpenEvent, onOpenUser }: { onOpenEvent: (id: number) => void, onOpenUser: (id: number) => void }) => {  
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [resultados, setResultados] = useState<{events: any[], users: any[], categories: any[]}| null>(null);

  // 1. Atualizei o useEffect para enviar o Token
  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchEvents = () =>{
      fetch('http://localhost:3000/api/events', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Acesso não autorizado');
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            setEvents(data);
          } else {
            setEvents([]);
          }
        })
        .catch(error => console.error("Erro ao carregar eventos:", error));
    };
  
    //atualizacao de 5 em 5 segundos
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);


  // 2. Atualizar a Pesquisa para também enviar o Token
  const handleSearch = () =>{
    if(search.trim() === ''){
      setResultados(null);
      return;
    }
    const url = `http://127.0.0.1:3000/api`;
    const token = localStorage.getItem('token');
    
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    Promise.all([
      fetch(`${url}/events/search?keyword=${search}`, { method: 'GET', headers }).then(r => r.json()),
      fetch(`${url}/users/search?keyword=${search}`, { method: 'GET', headers }).then(r => r.json()),
      fetch(`${url}/category/search?keyword=${search}`, { method: 'GET', headers }).then(r => r.json()),
    ]).then(([events, users, categories]) => {
      setResultados({ 
        events: Array.isArray(events) ? events : [], 
        users: Array.isArray(users) ? users : [],
        categories : Array.isArray(categories) ? categories : [],
      });
    }).catch(console.error);

  };


  const categorias = [...new Set(events.map(e => e.categoria?.nome).filter(Boolean))];

  return (
    <div>
      <input
      type='text' 
      placeholder='Barra de pesquisa (Eventos/Pessoas)'
      value={search}
      onChange={e => setSearch(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleSearch()}
      className=" w-full border border-blue-800 rounded-lg px-4 py-3 mb-2 text-base">
      </input>

      {resultados ? (
        <div>
          {resultados.events?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-3">Eventos</h2>~
              
              {resultados.events.map((event: any) => (
                <div key={event.id} className="flex-shrink-0">
                  <EventCard
                  
                  id={event.id}
                  title={event.name}
                  local={event.local}
                  category={event.categoria?.nome}
                  imageUrl={event.imageUrl}
                  date={new Date(event.startDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                  onOpen={onOpenEvent}
                />
                </div>
              ))}
            </section>
          )}

          {resultados.users?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-3">Pessoas</h2>
              {resultados.users.map((user: any) => (
                <div key={user.id} className="flex-shrink-0">
                  <UserCard
                    
                    id={user.id}
                    fullName={user.fullName}
                    email={user.email}
                    onOpen={onOpenUser}
                  />
                </div>
              ))}
            </section>
          )}

          {resultados.categories?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-3">Categorias</h2>
              {resultados.categories.map((cat: any) => (
                <div key={cat.id}>
                  <h3 className="text-lg font-bold text-slate-700 mb-3">{cat.nome}</h3>
                  <div style={{ display: 'flex', gap: '30px', overflowX: 'auto', paddingBottom: '20px' }}>
                    {events
                      .filter(e => e.categoria?.nome === cat.nome)  // filtra eventos desta categoria
                      .map(event => (
                        <div key={event.id} className="flex-shrink-0">
                          <EventCard
                            
                            id={event.id}
                            title={event.name}
                            local={event.local}
                            category={cat.nome}
                            imageUrl={event.imageUrl}
                            date={new Date(event.startDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                            onOpen={onOpenEvent}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {resultados.events?.length === 0 && resultados.users?.length === 0 && resultados.categories?.length === 0 && (
            <p>Nenhum resultado encontrado.</p>
          )}
        </div>
      ) : (
        
        categorias.length === 0 ? (
          <p>Nenhum evento criado.</p>
        ) : (
          categorias.map(cat => (
            <section key={cat}>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{cat}</h2>
              <div style={{display: 'flex', overflowX: 'auto', gap:'30px', paddingBottom:'40px'}}>
                {events
                  .filter(e => e.categoria?.nome === cat)
                  .map(event => (
                    <div key={event.id} className="flex-shrink-0">
                     <EventCard
                        
                        id={event.id}
                        title={event.name}
                        local={event.local}
                        category={cat}
                        imageUrl={event.imageUrl}
                        date={new Date(event.startDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                        onOpen={onOpenEvent}
                      />
                    </div>
                  ))}
              </div>
            </section>
          ))
        )
      )}
    </div>
  );
};