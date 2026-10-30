import { z } from 'zod';

export const pagamentoSchema = z.object({
    cot_id: z.number()
             .int({ message: "O id da cota deve ser um número inteiro." })
             .positive({ message: "O id da cota deve ser positivo." }),

    ass_id: z.number()
             .int({ message: "O id da assembleia deve ser um número inteiro." })
             .positive({ message: "O id da assembleia deve ser positivo." }),

    valor: z.number()
            .positive({ message: "O valor do pagamento deve ser positivo." }),

    status: z.enum(["PENDENTE", "CONFIRMADO"], {
        message: "O status do pagamento deve ser PENDENTE ou CONFIRMADO."
    }).optional()
});

export const pagamentoGerarPixSchema = z.object({
    cot_id: z.number()
             .int({ message: "O id da cota deve ser um número inteiro." })
             .positive({ message: "O id da cota deve ser positivo." }),

    ass_id: z.number()
             .int({ message: "O id da assembleia deve ser um número inteiro." })
             .positive({ message: "O id da assembleia deve ser positivo." })
});

export const webhookSchema = z.object({
    pag_id: z.number()
             .int({ message: "O id do pagamento deve ser um número inteiro." })
             .positive({ message: "O id do pagamento deve ser positivo." }),

    status: z.string().optional()
});
