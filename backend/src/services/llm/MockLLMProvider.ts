//isto tava com o ILLMProvider sublinhado a vermelho e quando eu escrevi "type" o vermelho desapareceu
import type { ILLMProvider } from "./ILLMProvider.js";

export class MockLLMProvider implements ILLMProvider {
    async generateResponse(prompt: string): Promise<string> {
        const adjetivos = ["fascinante", "complexo", "intrigante", "melancólico"];
        const conclusoes = ["uma obra prima.", "um marco da literatura.", "altamente recomendado."];
        const randomAdj = adjetivos[Math.floor(Math.random() * adjetivos.length)];
        const randomConc = conclusoes[Math.floor(Math.random() * conclusoes.length)];

        return `[MOCK AI]: Analisando o prompt "${prompt.substring(0, 20)}...", considero
        este tema ${randomAdj} e, em suma, é ${randomConc}`;
    }
}