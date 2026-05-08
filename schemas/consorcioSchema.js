import { z } from 'zod';

export const consorcioSchema = z.object({
    nome: z.string()
           .min(3, { message: "O nome deve ter no mínimo 3 caracteres." })
           .max(200, { message: "O nome não pode passar de 200 caracteres." }),

    quantidadecotas: z.number()
                      .int({ message: "A quantidade de cotas deve ser um número inteiro." })
                      .min(2, { message: "O consórcio deve ter no mínimo 2 cotas." })
                      .max(120, { message: "O consórcio não pode passar de 120 cotas." }),

    valorpremio: z.number()
                  .positive({ message: "O valor do prêmio deve ser positivo." }),

    taxaadministracao: z.number()
                        .min(0, { message: "A taxa de administração não pode ser negativa." })
                        .max(0.99, { message: "A taxa de administração deve ser menor que 1 (ex: 0.10 = 10%)." }),

    fundoreserva: z.number()
                   .min(0, { message: "O fundo de reserva não pode ser negativo." })
                   .max(0.99, { message: "O fundo de reserva deve ser menor que 1 (ex: 0.05 = 5%)." }),

    diaassembleia: z.number()
                    .int({ message: "O dia da assembleia deve ser um número inteiro." })
                    .min(1, { message: "O dia da assembleia deve ser entre 1 e 28." })
                    .max(28, { message: "O dia da assembleia deve ser entre 1 e 28." }),

    datainicio: z.string()
                 .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "A data de início deve estar no formato YYYY-MM-DD." })
}).refine(data => (data.taxaadministracao + data.fundoreserva) < 1, {
    message: "A soma da taxa de administração e do fundo de reserva deve ser menor que 1.",
    path: ["taxaadministracao"]
});
