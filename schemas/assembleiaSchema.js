import { z } from 'zod';

export const assembleiaSchema = z.object({
    numero: z.number()
             .int({ message: "O número da assembleia deve ser um número inteiro." })
             .positive({ message: "O número da assembleia deve ser positivo." }),

    con_id: z.number()
             .int({ message: "O id do consórcio deve ser um número inteiro." })
             .positive({ message: "O id do consórcio deve ser positivo." }),

    data: z.string()
           .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "A data deve estar no formato YYYY-MM-DD." }),

    cot_id: z.number()
             .int()
             .positive()
             .nullable()
             .optional()
});
