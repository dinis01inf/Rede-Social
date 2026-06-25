//isto tava com o ILLMProvider sublinhado a vermelho e quando eu escrevi "type" o vermelho desapareceu
import type { ILLMProvider } from "./ILLMProvider.js";

export class GenericAPIProvider implements ILLMProvider {
    constructor(
        private apiUrl: string,
        private modelName: string,
        private apiKey?: string, // Opcional para APIs locais (ex: Ollama)
        private inputField = "prompt" // "prompt", "inputs" ou "messages"
    ) {}

    async generateResponse(prompt: string): Promise<string> {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        
        if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
        
        // Montagem genérica: se o campo for 'messages', encapsula o prompt num array
        const inputContent = this.inputField === "messages"
            ? [{ role: "user", content: prompt }]
            : prompt;
        
        const res = await fetch(this.apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: this.modelName,
                [this.inputField]: inputContent,
                stream: false,
            }),
        });

        if (!res.ok) throw new Error(`Erro API (${res.status}): ${await res.text()}`);
        
        const data = await res.json();
        // Extração genérica: tenta todos os caminhos comuns de resposta
        
        return (
            data.choices?.[0]?.message?.content || // Padrão OpenAI / HF Router
            (Array.isArray(data) ? data[0]?.generated_text : null) || // Padrão HF Inference
            data.response || // Padrão Ollama
            data.output || // Outros
            "Sem resposta."
        );
    }
}
