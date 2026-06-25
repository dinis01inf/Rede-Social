import { Router } from 'express';

const router = Router();

router.get('/:cidade', async (req, res) => {
  try {
    const { cidade } = req.params;
    const apiKey = process.env.WEATHER_API_KEY;

    // Limpa o nome da cidade para evitar erros em nomes compostos
    const cidadeLimpa = encodeURIComponent(cidade.trim());
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidadeLimpa}&units=metric&appid=${apiKey}&lang=pt`;

    const resposta = await fetch(url);

    if (!resposta.ok) {
      return res.status(404).json({ error: "Localização não reconhecida" });
    }

    const dados = await resposta.json();

    // Envia para o frontend apenas o essencial
    res.status(200).json({
      temperatura: dados.main.temp,
      descricao: dados.weather[0].description,
      icone: dados.weather[0].icon
    });
  } catch (error) {
    console.error("Erro na API de Clima:", error);
    res.status(500).json({ error: "Erro interno no servidor de meteorologia." });
  }
});

export default router;