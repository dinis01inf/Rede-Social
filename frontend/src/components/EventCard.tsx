
interface Event {
  id: number;
  title: string;
  local: string;
  category: string;
  imageUrl: string;
  date: string;
}

interface Props extends Event {onOpen: (id: number) => void;}

export const EventCard = ({
  id,
  title,
  local,
  category,
  imageUrl,
  date,
  onOpen,
}: Props) => {
  return (
    <div style={{backgroundColor: 'white',
      borderRadius: '5px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      width: '250px',
      display: 'flex',
      flexDirection: 'column'}}>
      <div style={{ 
        position: 'relative', 
        height: '150px', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {<img 
          src={imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} 
          alt={title} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500';
          }}></img>}
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">{category}</span>
      </div>

      <div style={{ 
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: '#1e293b' 
        }}>{title}</h3>
        <br></br>
        <h5 style={{ 
          margin: 0, 
          fontSize: '1rem', 
          fontWeight: 'bold', 
          color: '#1e293b' 
        }}>{local}</h5>
        <p style={{ 
          margin: 0, 
          color: '#64748b', 
          fontSize: '0.9rem' 
        }}>{date}</p>

        <button
          type="button" onClick={() => onOpen(id)} style={{ 
            backgroundColor: '#6495ED', color: 'white', 
            padding: '5px 5px', borderRadius: '8px',
          cursor: 'pointer'}}>
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};