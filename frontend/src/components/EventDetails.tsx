import { useEffect, useState } from 'react';
import { EventWeather } from './EventWeather';


export const EventDetails = ({ eventId, userId}: { eventId: number ;  userId: number }) => {
  const [event, setEvent] = useState<any>(null);
  const[ isFollowing, setIsFollowing] = useState(false);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<number | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [progressList, setProgressList] = useState<any[]>([]);
  const idGuardado = Number(localStorage.getItem('userId'));
  const [isCreator, setIsCreator]= useState(false);
  const [creatorName, setCreatorName] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState({name: '', description: '', local:'', visibility: true});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchEvent = () => {
      fetch(`/api/events/${eventId}`, { headers })
        .then(res => res.json())
        .then(async data => {
          setIsCreator(data.createdBy === idGuardado);
          setEvent(data);
          setEdit({
            name: data.name,
            description: data.description,
            local: data.local ?? '',
            visibility: data.visibility
          });
          const resCreator = await fetch(`/api/users/public/${data.createdBy}`, {headers});
          const creatorData = await resCreator.json();
          setCreatorName(creatorData.fullName);
        })
        .catch(err => console.log(err));
    };

    const fetchFollows = () => {
      fetch(`/api/eventFollows?userId=${userId}&eventId=${eventId}`, { headers })
        .then(res => {
          if (!res.ok) throw new Error('Erro ao verificar inscrição');
          return res.json();
        })
        .then(data => {
          setIsFollowing(!!data.isFollowing);
        })
        .catch(err => console.log(err));
    }

    const fetchProgress = () => {
      fetch(`/api/events/${eventId}/progress`, { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProgressList(data);
          }
        })
        .catch(err => console.log(err));
    }

    const fetchAll = () => {
        fetchEvent();
        fetchFollows();
        fetchProgress();
    };

    //atualizações de 10 em 10 segundos
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [eventId, userId]);

  const handleFollowEvent = async () => {
    try {
      if(isFollowing){
        const response = await fetch("/api/eventFollows", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            eventId: eventId
          })
        });
        await response.json();
      
        setEvent((prev: any) => ({
            ...prev,
            _count: { ...prev._count, followed: Math.max(0, (prev._count?.followed || 0) - 1) }
          }));
      }
      else{
        const response = await fetch("/api/eventFollows", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: userId,
                eventId: eventId
            })
        })
        await response.json();
        setEvent((prev: any) => ({
          ...prev,
          _count: { ...prev._count, followed: (prev._count?.followed || 0) + 1 }
        }));
      }

      setIsFollowing ( prev => !prev)
    } catch (error) {
        console.error(error)
    }
  }

  const handleSubmeterProgresso = async (objectiveId: number) => {
    const token = localStorage.getItem('token');
    if (!progressMessage.trim()) return;

    try {
      const response = await fetch(`/api/events/${eventId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          objectiveId,
          message: progressMessage
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(`Objetivo atualizado: ${progressMessage}`);
        setProgressList(prev => [...prev, {
          userId: userId,
          objectiveId: objectiveId,
          message: progressMessage,
          createdAt: new Date(),
          user: {fullName: data.progress?.user?.fullName },
        }]);
        setProgressMessage('');
        setSelectedObjectiveId(null);
        // Desaparece ao fim de 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.error || "Erro ao registar progresso");
      }
    } catch (error) {
      console.error("Erro no envio:", error);
    }
  };

  //tratar do edit de eventos
  const handleSubmeterEdicao = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(edit)
      });

      if (response.ok) {
        setEvent((prev: any) => ({ ...prev, ...edit}));
        setIsEditing(false);
        alert("Evento atualizado com sucesso!");
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao atualizar evento");
      }
    } catch (error) {
      console.error("Erro na edição:", error);
    }
  };

  // APAGAR EVENTO
  const handleApagarEvento = async () => {
    setIsDeleting(true);

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDeleteSuccess(true);
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao apagar evento");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Erro ao apagar:", error);
      setIsDeleting(false)
    }
  };

  if (!event) return <p>A carregar...</p>;
  const participantesCount = event._count?.followed ?? 0;

  return (
    <div style={{ display: "flex", gap: "60px", alignItems: "flex-start", padding: "20px" }}>
      <div style={{ flex: 1 }}>
        {isEditing ? (
          <div style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0 }}>Modo de Edição</h3>
            <input 
              type="text" 
              value={edit.name} 
              onChange={(e) => setEdit(prev => ({ ...prev, name: e.target.value }))}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', fontSize: '24px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <textarea 
              value={edit.description} 
              onChange={(e) => setEdit(prev => ({ ...prev, description: e.target.value }))}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '100px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSubmeterEdicao} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                💾 Gravar Alterações
              </button>
              <button onClick={() => setIsEditing(false)} style={{ backgroundColor: '#94a3b8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <></>
        )}
        <h1 style={{ fontSize: "65px", fontWeight: "bold", fontFamily: 'Inter, system-ui,  sans-serif', color: '#042e4e', margin: '0 0 10px 0' }}>{event.name}</h1>
        <p style={{ fontSize: "23px", fontFamily: 'Inter, system-ui, sans-serif', color: '#042e4e', marginBottom: '30px' }}>{event.description}</p>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '30px' }}>
          <p style={{ fontSize: "18px", margin: '0 0 10px 0' }}><strong>  Início:</strong> {new Date(event.startDate).toLocaleString('pt-PT')}</p>
          <p style={{ fontSize: "18px", margin: '0 0 10px 0' }}><strong>  Fim:</strong> {new Date(event.endDate).toLocaleString('pt-PT')}</p>
          <p style={{ fontSize: "18px", margin: '0 0 15px 0' }}><strong>  Localização:</strong> {event.local}</p>
          <EventWeather cidade={event.local} dataEvento={event.startDate} />
          <p style={{ fontSize: "16px", margin: '15px 0 0 0', color: '#64748b' }}>  Criado por: <strong>{creatorName}</strong></p>
        </div>
        {/* SECÇÃO DAS TO-DO BOXES (OBJETIVOS) */}
        <div style={{ marginTop: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#042e4e', marginBottom: '15px' }}>Objetivos</h3>
          
          {successMessage && (
            <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #bbf7d0' }}>
              {successMessage}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {event.objectives?.map((obj: any) => (
              <div key={obj.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', backgroundColor: '#fff',color: '#042e4e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '500' }}>{obj.name}</span>
                {isFollowing && (
                  <button 
                    onClick={() => setSelectedObjectiveId(selectedObjectiveId === obj.id ? null : obj.id)}
                    style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    {selectedObjectiveId === obj.id ? 'Cancelar' : 'Check'}
                  </button>
                )}
              </div>

              {selectedObjectiveId === obj.id && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <input 
                    type="text"
                      placeholder="Deixa uma mensagem de progresso (ex: Feito!)..."
                    value={progressMessage}
                    onChange={(e) => setProgressMessage(e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <button 
                    onClick={() => handleSubmeterProgresso(obj.id)}
                    style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Enviar
                  </button>
                </div>
              )}

              {/* LISTA DE CHECKPOINTS PRIVADOS */}
              <div style={{ marginTop: '12px' }}>
                {progressList
                  .filter((p: any) => p.objectiveId === obj.id)
                  .map((p: any, index: number) => (
                    <div 
                      key={index} 
                      style={{ 
                        backgroundColor: '#f8fafc', 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        marginTop: '6px', 
                        borderLeft: '4px solid cornflowerblue',
                        fontSize: '14px',
                        color: '#334155'
                      }}
                    >
                      <strong>✓ Progresso:</strong> {p.message}
                      <br></br>
                      <p>User: {p.user.fullName}</p>
                    </div>
                  ))
                }
            </div>

            </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "400px" }}>
          <div style={{
          width: "400px", 
          height: "400px", 
          backgroundColor: "#e5e7eb",
          borderRadius: "12px", 
          display: "flex",
          alignItems: "center", 
          justifyContent: "center", 
          color: "#666"
          }}><img 
            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} 
            alt={event.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500';
            }}
          /></div>

          <p style={{ 
          fontSize: "18px", 
          fontFamily: 'Inter, system-ui, sans-serif', 
          color: '#042e4e',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0'
          }}> 
            <strong>{participantesCount}</strong> {participantesCount === 1 ? 'participante' : 'participantes'}
          </p>
          <button type="button" 
          onClick={handleFollowEvent}
          style={{ 
            fontFamily: 'Inter, system-ui, sans-serif', 
            fontSize: "18px", 
            fontWeight: "bold",
            backgroundColor: '#76abd4', 
            color: '#042e4e', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            border: 'none',
            cursor: 'pointer',
            width: '100%'
          }}>
          {isFollowing ? 'Sair do Evento' : 'Participar no Evento'}
          </button>

          {isCreator && (
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#475569', marginRight: 'auto' }}>
              Gestão do Evento
            </span>
            
            <button 
              onClick={() => {
                setIsEditing(true);
              }} 
              style={{ backgroundColor: '#eab308', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Editar
            </button>

            <button 
              onClick={() => setShowDeleteModal(true)} 
              style={{ flex: 1, backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
              Apagar
            </button>
          </div>
        )}
        </div>
    {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(4, 46, 78, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            {deleteSuccess ? (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#042e4e', fontSize: '20px', fontWeight: 'bold' }}>
                  Evento Eliminado!
                </h3>
                <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                  O evento foi apagado do sistema com sucesso .
                </p>
                <button 
                  onClick={() => window.location.href = '/'} 
                  style={{ width: '100%', backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                  Ok
                </button>
              </div>
            ) : ( <>
            <div>
              ⚠️
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#042e4e', fontSize: '18px', fontWeight: 'bold' }}>Eliminar este evento?</h3>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>Esta ação é <strong>irreversível</strong>. Todos os dados, objetivos e checkpoints serão apagados permanentemente.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button disabled={isDeleting} onClick={() => setShowDeleteModal(false)} style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                Cancelar
              </button>
              <button disabled={isDeleting} onClick={handleApagarEvento} style={{ flex: 1, backgroundColor: isDeleting ? '#fca5a5' : '#ef4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: isDeleting ? 'not-allowed' : 'pointer', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                {isDeleting ? 'A eliminar...' : 'Sim, Apagar'}
              </button>
            </div>
          </>
        )}
     </div>
    </div>
  )}
  </div>
  );
};