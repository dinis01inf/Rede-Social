import { useState, useEffect } from 'react';

interface EventWeatherProps {
  cidade: string;
  dataEvento: string;
}

export const EventWeather = ({ cidade, dataEvento }: EventWeatherProps) => {
  const [clima, setClima] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const diasAteEvento = Math.ceil((new Date(dataEvento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  useEffect(() => {
    const buscarClima = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://127.0.0.1:3000/api/weather/${cidade}`);
        if (!res.ok) throw new Error("Local não suportado pela meteorologia");
        
        const dados = await res.json();
        setClima(dados);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (cidade && diasAteEvento <= 5 && diasAteEvento >= 0) {
      buscarClima();
    }
  }, [cidade, diasAteEvento]);

  if (diasAteEvento > 5) return <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>☁️ Previsão disponível 5 dias antes do evento.</p>;
  if (diasAteEvento < 0) return null;
  if (loading) return <p style={{ color: '#64748b', fontSize: '14px' }}>A verificar a meteorologia...</p>;
  if (erro) return <p style={{ color: '#ef4444', fontSize: '14px' }}>⚠️ {erro}</p>;
  if (!clima) return null;

  return (
    <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #bae6fd', width: 'fit-content', marginTop: '10px', marginBottom: '20px' }}>
      <img 
        src={`https://openweathermap.org/img/wn/${clima.icone}@2x.png`} 
        alt={clima.descricao} 
        style={{ width: '50px', height: '50px' }}
      />
      <div>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 4px 0' }}>
          {Math.round(clima.temperatura)}°C
        </p>
        <p style={{ fontSize: '14px', color: '#1d4ed8', margin: 0, textTransform: 'capitalize' }}>
          {clima.descricao} em {cidade}
        </p>
      </div>
    </div>
  );
};