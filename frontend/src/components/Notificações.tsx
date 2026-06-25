import { useEffect } from "react";

export const Notificações = ({ notifs, setNotifs }: { 
  notifs: any[], 
  setNotifs: (notifs: any[]) => void,
  }) => {
  const TrashIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={{ width: '18px', height: '18px' }} // Tamanho do ícone
    >
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      <line x1="10" x2="10" y1="11" y2="17"/>
      <line x1="14" x2="14" y1="11" y2="17"/>
    </svg>
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const fetchNotifs = () => {
      fetch(`/api/notification/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
          const arr = Array.isArray(data) ? data : [];
          setNotifs(arr);
      })
      .catch(console.error); 
    }

    //atualizaçoes de 3 em 3 segundos
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/notification/read/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        method: 'PUT',
    });

    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/notification/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao eliminar');

      // Remove do ecrã na hora
      setNotifs(notifs.filter(n => n.id !== id));
    } catch (error) {
      console.error(error);
      alert("Não foi possível eliminar a notificação.");
    }
  };
  if (notifs.length === 0) return <p>Sem notificações.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
      {notifs.map(n => (
        <div key={n.id} style={{
          padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0',
          backgroundColor: n.read ? '#f8fafc' : '#eff6ff',
          borderLeft: n.read ? '4px solid #e2e8f0' : '4px solid #3b82f6',
          display: 'flex',
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '16px',
          transition: 'all 0.3s ease'
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <p style={{ margin: 0 }}>{n.message}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            {new Date(n.createdAt).toLocaleString('pt-PT')}
          </p>
          {!n.read && (
            <button onClick ={() => handleRead(n.id)}
            style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginTop: '5px', alignSelf: 'flex-start',}}>
              Marcar como lida
            </button>
          )}
        </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => handleDelete(n.id)}
              style={{ 
                backgroundColor: 'transparent', 
                color: '#ef4444', 
                border: '1px solid #fee2e2', 
                width: '38px', 
                height: '38px',
                borderRadius: '8px', 
                cursor: 'pointer', 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#fee2e2';
              }}
            >
            <TrashIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};