import { useEffect, useState } from 'react';
import { EventCard } from './EventCard';
import imagempredefinida from '../assets/hero.png';

export const UserDetails = ({
  followerId,
  followingId,
  onOpenEvent,
}: {
  followerId: number;
  followingId: number;
  onOpenEvent: (id:number) => void;
}) => {

  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchAll= () => {
      fetch(`/api/users/public/${followingId}`, { headers })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.log(err));

      fetch(`/api/userFollows?followerId=${followerId}&followingId=${followingId}`, { headers })
      .then(res => res.json())
      .then(data => setIsFollowing(data.isFollowing))
      .catch(err => console.log(err));
    };

      //atualizaçoes de 10 em 10 segundos
      fetchAll();
      const interval = setInterval(fetchAll, 5000);
      return () => clearInterval(interval);

  }, [followingId, followerId]);

  //eventos criados pelo user
    const fetchEvents = async () => {
        try {
            //vai buscar o id, e manda o token para provar q esta logado
            const res = await fetch(`http://127.0.0.1:3000/api/users/${followingId}/events`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });

            //guarda o id num json senao lança um erro
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro na conta');
            
            setEvents(data);

        } catch (err: any) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    }

    //corre o fetch quando a pag esta a carregar
    useEffect(() => { 
        fetchEvents();
    }, [followingId]);


  const handleFollowEvent = async () => {
    const token = localStorage.getItem('token');
    const method = isFollowing ? "DELETE" : "POST";

    try {
      const response = await fetch("/api/userFollows", {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          followerId: followerId,
          followingId: followingId,
        })
      });
      if (response.ok) {
        setIsFollowing(prev => !prev);
      }
    } catch (error) {
      console.error(error);
    }
  };
  if (!user) return <p>A carregar...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'Inter, system-ui, sans-serif'}}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-4xl">
          {user.fullName.charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{user.fullName}</h1>
          <p style={{ fontSize: '16px', color: '#666', margin: '4px 0 0 0' }}>{user.email}</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' , borderBottom:'1px solid #e5e7eb'}}>
        <thead>
          <tr>
            {['Seguindo', 'Seguidores', 'Eventos Criados', 'Eventos Seguidos'].map(label => (
              <th key={label} style={{ fontSize: '20px', textAlign: 'center', padding: '8px', color: '#666', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {[user.following?.length ?? 0, user.followed?.length ?? 0, user.creatorEvents?.length ?? 0, user.followedEvents?.length ?? 0].map((val, i) => (
              <td key={i} style={{ textAlign: 'center', padding: '12px 8px', fontSize: '28px', fontWeight: 'bold' }}>
                {val}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* botão */}
      <button
        type="button"
        onClick={handleFollowEvent}
        style={{
          fontSize: '16px', fontWeight: 'bold',
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundColor:  '#00002a',
          color: 'cornflowerblue',
          width: '180px',
          padding: '10px 15px', borderRadius: '8px',
          border: 'none', cursor: 'pointer'
        }}
      >
        {isFollowing ? 'Deixar de Seguir' : 'Seguir'}
      </button>

      <div>
        <h3 className="text-lg font-bold text-slate-800" style={{marginTop: '20px'}}>Eventos Criados:</h3>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {events.map((event: any) => (
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
        </div>
      </div>

    </div>
  );
};
