import Database from "../utils/database.js";
import UsuarioEntity from "../entities/usuarioEntity.js";

export default class UsuarioRepository {

    #banco;
    
    constructor() {
        this.#banco = new Database();
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_usuario WHERE usu_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            const row = rows[0];
            const usuario = new UsuarioEntity(
                row["usu_id"],
                row["usu_nome"],
                row["usu_email"],
                row["usu_senha"],
                row["usu_ativo"]
            );
            return usuario;
        }

        return null;
    }

    async buscarPorEmail(email) {
        const sql = "SELECT * FROM tb_usuario WHERE usu_email = ?";
        const params = [email];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            const row = rows[0];
            const usuario = new UsuarioEntity(
                row["usu_id"],
                row["usu_nome"],
                row["usu_email"],
                row["usu_senha"],
                row["usu_ativo"]
            )
            return usuario;
        }
    }

    async listar() {
        const sql = "SELECT * FROM tb_usuario where usu_ativo = 'S'";
        const rows = await this.#banco.ExecutaComando(sql);

        const usuarios = rows.map(row =>
            new UsuarioEntity(
                row["usu_id"],
                row["usu_nome"],
                row["usu_email"],
                row["usu_senha"],
                row["usu_ativo"]
            )
        );

        return usuarios;
    }

    async cadastrar(usuarioEntidade) {
        const sql = `
            INSERT INTO tb_usuario (usu_nome, usu_email, usu_senha, usu_ativo)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            usuarioEntidade.nome,
            usuarioEntidade.email,
            usuarioEntidade.senha,
            usuarioEntidade.ativo
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async deletar(id) {
        const sql = "UPDATE tb_usuario SET usu_ativo = 'N' WHERE usu_id = ?";
        const params = [id];
        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `
            UPDATE tb_usuario
            SET usu_nome = ?, usu_email = ?, usu_senha = ?
            WHERE usu_id = ?
        `;
        const valores = [
            entidadeAtualizada.nome,
            entidadeAtualizada.email,
            entidadeAtualizada.senha,
            entidadeAtualizada.id
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }
}