// Cria (ou promove) o primeiro administrador.
// Uso: npm run criar-admin -- <email> <senha> [nome]
//  ou defina ADMIN_EMAIL, ADMIN_SENHA e ADMIN_NOME no .env e rode: npm run criar-admin
import "../utils/env.js";
import Bcrypt from "../utils/bcrypt.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import UsuarioEntity from "../entities/usuarioEntity.js";
import Database from "../utils/database.js";

const [emailArg, senhaArg, nomeArg] = process.argv.slice(2);
const email = emailArg || process.env.ADMIN_EMAIL;
const senha = senhaArg || process.env.ADMIN_SENHA;
const nome = nomeArg || process.env.ADMIN_NOME || "Administrador";

if (!email || !senha || senha.length < 8) {
    console.error("Informe e-mail e senha (mínimo de 8 caracteres): npm run criar-admin -- <email> <senha> [nome]");
    process.exit(1);
}

const repositorio = new UsuarioRepository();
const hash = await new Bcrypt().hash(senha);
const existente = await repositorio.buscarPorEmail(email);

if (existente) {
    const banco = new Database();
    await banco.ExecutaComandoNonQuery(
        "UPDATE tb_usuario SET usu_senha = ?, usu_perfil = 'ADMINISTRADOR', usu_ativo = 'S' WHERE usu_id = ?",
        [hash, existente.id]
    );
    console.log(`Usuário ${email} promovido a administrador.`);
} else {
    await repositorio.cadastrar(new UsuarioEntity(null, nome, email, hash, "S", "ADMINISTRADOR"));
    console.log(`Administrador ${email} criado.`);
}
process.exit(0);
