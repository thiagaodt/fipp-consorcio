import dotenv from "dotenv";

dotenv.config();

const ABACATE_API_URL = process.env.ABACATE_API_URL || "https://api.abacatepay.com";
const ABACATE_API_KEY = process.env.ABACATE_API_KEY;

export default class AbacatePay {

    #apiKey;
    #apiUrl;

    constructor() {
        this.#apiKey = ABACATE_API_KEY;
        this.#apiUrl = ABACATE_API_URL;
    }

    async criarQrCodePix({ amount, expiresIn, description, customer, externalId }) {
        if (!this.#apiKey) {
            throw new Error("Chave do AbacatePay não configurada (ABACATE_API_KEY).");
        }

        const url = `${this.#apiUrl}/v1/pixQrCode/create`;

        const body = {
            amount: amount,
            expiresIn: expiresIn ?? 3600,
            description: description ?? "Parcela de consórcio",
            customer: customer,
            externalId: externalId ? String(externalId) : undefined
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.#apiKey}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.error || data?.message || `AbacatePay retornou status ${response.status}`);
        }

        return data;
    }
}
