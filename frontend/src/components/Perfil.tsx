import { useState, useEffect, useCallback } from 'react';
import { EventCard } from './EventCard';
import imagempredefinida from '../assets/hero.png';

export const Perfil = ({ onOpenEvent}: { onOpenEvent: (id: number) => void}) => {
    //vai buscar o id
    const id = localStorage.getItem('userId');
    //info que pode mudar
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const[user, setUser] = useState<any>(null);
    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [createdEvents, setCreatedEvents] = useState<any[]>([]);
    const [followedEvents, setFollowedEvents] = useState<any[]>([])

    //user
    const fetchUser = async () => {
        setLoading(true);
        setError(null);

        try {
            //vai buscar o id, e manda o token para provar q esta logado
            const res = await fetch(`http://127.0.0.1:3000/api/users/${id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });

            //guarda o id num json senao lança um erro
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro na conta');
            
            setUser(data);

        } catch (err: any) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    };

    //seguidores
    const fetchFollowers = async () => {
        try {
            //vai buscar o id, e manda o token para provar q esta logado
            const res = await fetch(`http://127.0.0.1:3000/api/users/${id}/followers`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });

            //guarda o id num json senao lança um erro
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro na conta');
            
            setFollowers(data);

        } catch (err: any) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    }

    //a seguir
    const fetchFollowing = async () => {
        try {
            //vai buscar o id, e manda o token para provar q esta logado
            const res = await fetch(`http://127.0.0.1:3000/api/users/${id}/following`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });

            //guarda o id num json senao lança um erro
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro na conta');
            
            setFollowing(data);

        } catch (err: any) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    }

    //eventos que o user segue
    const fetchEventsFollowed = async () => {
        try {
            //vai buscar o id, e manda o token para provar q esta logado
            const res = await fetch(`http://127.0.0.1:3000/api/events/user/${id}/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });

            //guarda o id num json senao lança um erro
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro na conta');
            
            setFollowedEvents(data);

        } catch (err: any) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    }

    //eventos que o user criou
    const fetchCreatedEvents = async () => {
        try {
            //vai buscar o id, e manda o token para provar q esta logado
            const res = await fetch(`http://127.0.0.1:3000/api/users/${id}/events`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });

            //guarda o id num json senao lança um erro
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro na conta');
            
            setCreatedEvents(data);

        } catch (err: any) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    }

    //corre o fetch quando a pag esta a carregar
    useEffect(() => { 
        const fetchAll = () =>{
            fetchUser();
            fetchFollowers();
            fetchFollowing();
            fetchEventsFollowed();
            fetchCreatedEvents();
        }
        setLoading(false);
        //atualizacoes de 10 em 10 segundos
        fetchAll();
        const interval = setInterval(fetchAll, 10000);
        return () => clearInterval(interval);
    }, []);

    //se n tiver user:
    if (!user) return null;
    
    return(
        <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-40 h-40 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-6xl">
                    {user.fullName.charAt(0)}
                </div>
                <div>
                    <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{user.fullName}</h1>
                    <p style={{ fontSize: '16px', color: '#666', margin: '4px 0 0 0' }}>{user.email}</p>
                </div>
            </div>

            <div className="flex gap-8 mt-6 border-t pt-4">
                <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">Seguidores: {followers.length}</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">Seguindo: {following.length}</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">Eventos Criados: {createdEvents.length}</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">Eventos Seguidos: {followedEvents.length}</p>
                </div>
            </div>

            <br></br>

            <div>
                <h3 className="text-lg font-bold text-slate-800">Eventos Criados:</h3>{createdEvents.length === 0 && (<h3>0</h3>)}
                
                <div className="flex gap-4 overflow-x-auto pb-2 ">
                    {createdEvents.map((event: any) => (
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

            <br></br>

            <div>
                <h3 className="text-lg font-bold text-slate-800">Eventos a Participar:</h3>{followedEvents.length === 0 && (<h3>0</h3>)}
                
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {followedEvents.map((event: any) => (
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

            <div className="text-xs text-gray-400 border-t pt-2">
                Registado a: {new Date(user.createdAt).toLocaleDateString()}
            </div>
        </div>
    );
}