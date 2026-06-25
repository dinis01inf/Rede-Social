import { useEffect, useState } from 'react';


export const CreateEvent = () => {
  const [name, setName] = useState('');
  const [local, setLocal] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [visibility, setVisibility] = useState(true);
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [categorias, setCategorias] = useState<{id: Number, nome: string}[]>([]);
  const createdBy = Number(localStorage.getItem('userId'));
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(()=> {
    fetch ('http://127.0.0.1:3000/api/category')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setCategorias(data);
    })
    .catch(err => console.error('Erro ao carregar categorias:', err));
  }, []);
  const [loadingAI, setLoadingAI] = useState(false);

const handleMagicFill = async () => {
    if (!description.trim()) {
      alert("Por favor, escreve pelo menos uma breve ideia na Descrição primeiro!");
      return;
    }

    setLoadingAI(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ draftDescription: description })
      });

      if (!response.ok) throw new Error("Erro na resposta da IA");
      
      const data = await response.json();

      setName(data.name);
      setObjectives(data.objectives && data.objectives.length > 0 ? data.objectives : ['']);

    } catch (error) {
      console.error(error);
      alert("Não foi possível processar a ideia com o Ollama de momento. Verifica se o terminal está ativo.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const handleAddObjective = () => {
    setObjectives([...objectives, '']);
  };

  const handleRemoveObjective = (index: number) => {
    if (objectives.length > 1) {
      const newObjectives = objectives.filter((_, i) => i !== index);
      setObjectives(newObjectives);
    } else {
      setObjectives(['']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoriaNumber = parseInt(categoriaId, 10);
    const token = localStorage.getItem('token');
    const categoriaSelecionada = categorias.find(cat => Number(cat.id) === categoriaNumber);
    const nomeCategoria = categoriaSelecionada ? categoriaSelecionada.nome.toLowerCase() : '';

    let imagemPredefinida = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'; // Geral / Default
    
    if (nomeCategoria.includes('outros')) {
      imagemPredefinida = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500';
    } else if (nomeCategoria.includes('workshop')) {
      imagemPredefinida = 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500';
    } else if (nomeCategoria.includes('música') || nomeCategoria.includes('musica')) {
      imagemPredefinida = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
    } else if (nomeCategoria.includes('desporto')) {
      imagemPredefinida = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500';
    }
    try {
      const response = await fetch('http://127.0.0.1:3000/api/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          local,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          categoria: categoriaNumber,
          createdBy,
          objectives: objectives.map(obj => obj.trim()).filter(Boolean),
          imageUrl: imagemPredefinida
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar evento');
      }

      setShowSuccessModal(true);

      setName('');
      setLocal('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setCategoriaId('');
      setObjectives(['']);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '100%' }}>
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '50%',
        margin: '0 auto',
      }}
    >
      <label style={{ 
            fontWeight: 'bold', 
            fontSize: '20px', 
            color: '#042e4e',
            margin: 0
          }}>
            Nome do Evento:
      </label>

      <input
        type="text"
        placeholder="Nome do evento"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        required
      />

      <label style={{ 
            fontWeight: 'bold', 
            fontSize: '15px', 
            color: '#042e4e',
            margin: 0
          }}>
            Local de Evento:
      </label>

      <input
        type="text"
        placeholder="Local do evento"
        value={local}
        onChange={e => setLocal(e.target.value)}
        style={{padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
      />

      <label style={{ 
            fontWeight: 'bold', 
            fontSize: '15px', 
            color: '#042e4e',
            margin: 0
          }}>
            Descrição do Evento:
      </label>
      <textarea
        placeholder="Descrição"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
      />
      <button
          type="button"
          onClick={handleMagicFill}
          disabled={loadingAI}
          style={{
            backgroundColor: '#042e4e',
            color: '#76abd4',
            border: '1px solid #76abd4',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: loadingAI ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          {loadingAI ? 'O Ollama está a pensar...' : 'Usar IA para sugerir nome e objetivos.'}
        </button>
      <label style={{ 
            fontWeight: 'bold', 
            fontSize: '20px', 
            color: '#042e4e',
            margin: 0
          }}>
            Início do evento
          </label>
      <input
        type="datetime-local"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
        style={{padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        required
      />
      <label style={{ 
            fontWeight: 'bold', 
            fontSize: '20px', 
            color: '#042e4e',
            margin: 0
          }}>
            Fim do evento
          </label>
      <input
        type="datetime-local"
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
        style={{padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        required
      />

      <label style={{ 
            fontWeight: 'bold', 
            fontSize: '20px', 
            color: '#042e4e',
            margin: 0
          }}>Categoria</label>
      <select
        //placeholder="ID da categoria"
        value={categoriaId}
        style={{padding: '10px', borderRadius: '6px', border: '1px solid #042e4e' }}
        onChange={e => setCategoriaId(e.target.value)}
        required
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={String(cat.id)} value={String(cat.id)}>
              {cat.nome}
            </option>
          ))}
        </select>
      

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px'}}>
          <label style={{ 
            fontWeight: 'bold', 
            fontSize: '20px', 
            color: '#042e4e',
            margin: 0
          }}>
            Objetivos do Evento
          </label>
          
          <button
            type="button"
            onClick={handleAddObjective}
            style={{
              backgroundColor: '#76abd4',
              color: '#042e4e',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              lineHeight: '1',
              display: 'inline-flex',
              alignItems: 'center',
              height: '28px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5c97c4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#76abd4'}
          >
            + Adicionar outro
          </button>
        </div>

        {objectives.map((objective, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={`Objetivo #${index + 1}`}
              value={objective}
              onChange={e => handleObjectiveChange(index, e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              required={index === 0}
            />
            
            <button
              type="button"
              onClick={() => handleRemoveObjective(index)}
              style={{
                backgroundColor: '#042e4e',
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              X
            </button>
          </div>
        ))}

        
      </div>

      <button style={{
            backgroundColor: '#76abd4',
            color: '#042e4e',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '5px'
          }} type="submit">Criar Evento</button>
    </form>
    {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(4, 46, 78, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '14px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#042e4e', fontSize: '22px', fontWeight: 'bold' }}>
              Evento Criado!
            </h3>
            <p style={{ margin: '0 0 26px 0', color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>
              O teu evento foi publicado com sucesso.
            </p>
            <button 
              onClick={() => window.location.href = '/'} 
              style={{ width: '100%', backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
            >
              Ok. Ir para a página inicial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
