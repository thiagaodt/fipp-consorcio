import { z } from 'zod';

export const usuarioSchema = z.object({
    nome: z.string()
           .min(3, { message: "O nome deve ter no mínimo 3 caracteres." })
           .max(50, { message: "O nome não pode passar de 50 caracteres." }),
           
    email: z.string()
            .email({ message: "Insira um endereço de e-mail válido." }),
            
    senha: z.string()
            .min(4, { message: "A senha deve conter pelo menos 4 caracteres." })
});


