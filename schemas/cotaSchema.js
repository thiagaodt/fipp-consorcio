import { z } from 'zod';

export const cotaSchema = z.object({
    con_id: z.number()
             .int({ message: "O id do consórcio deve ser um número inteiro." })
             .positive({ message: "O id do consórcio deve ser positivo." }),

    usu_id: z.number()
             .int({ message: "O id do usuário deve ser um número inteiro." })
             .positive({ message: "O id do usuário deve ser positivo." }),

    numero: z.number()
             .int({ message: "O número da cota deve ser um número inteiro." })
             .positive({ message: "O número da cota deve ser positivo." }),

    status: z.enum(["REGULAR", "CONTEMPLADA", "INADIMPLEMTE"], {
        message: "O status da cota deve ser REGULAR, CONTEMPLADA ou INADIMPLEMTE."
    }).optional()
});

export const cotaVendaSchema = z.object({
    con_id: z.number()
             .int({ message: "O id do consórcio deve ser um número inteiro." })
             .positive({ message: "O id do consórcio deve ser positivo." }),

    usu_id: z.number()
             .int({ message: "O id do usuário deve ser um número inteiro." })
             .positive({ message: "O id do usuário deve ser positivo." })
});
