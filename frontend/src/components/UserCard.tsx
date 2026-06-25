
interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Props extends User {onOpen: (id: number) => void;}

export const UserCard = ({
  id,
  fullName,
  email,
  onOpen,
}: Props) => {
  return (
    <div>
      <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-4xl">
        {fullName.charAt(0)}
      </div>
      <div>
        <h3 className="font-bold">{fullName}</h3>
        <p>{email}</p>
        <br></br>

        <button
          type="button" onClick={() => onOpen(id)} style={{ 
            backgroundColor: '#6495ED', color: 'white', 
            padding: '10px 16px', borderRadius: '8px',
          cursor: 'pointer'}}>
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};