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
            ...(customer ? { customer } : {}),
            ...(externalId ? { externalId: String(externalId) } : {})
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

    // Consulta o status atual de um QR Code PIX pelo ID do AbacatePay.
    async verificarStatusPix(id) {
        const url = `${this.#apiUrl}/v1/pixQrCode/check?id=${encodeURIComponent(id)}`;
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${this.#apiKey}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.error || data?.message || `AbacatePay retornou status ${response.status}`);
        }
        // v1 envelopa em { data: { status, expiresAt }, error, success }
        return data?.data ?? data;
    }

    // Simula o pagamento de um QR Code em ambiente de desenvolvimento.
    async simularPagamento(id) {
        const url = `${this.#apiUrl}/v1/pixQrCode/simulate-payment?id=${encodeURIComponent(id)}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${this.#apiKey}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.error || data?.message || `AbacatePay retornou status ${response.status}`);
        }
        return data;
    }
}
