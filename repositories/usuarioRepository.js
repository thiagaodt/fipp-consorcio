import Database from "../utils/database.js";
import UsuarioEntity from "../entities/usuarioEntity.js";

export default class UsuarioRepository {

    #banco;
    
    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new UsuarioEntity(
            row["usu_id"],
            row["usu_nome"],
            row["usu_email"],
            row["usu_senha"],
            row["usu_ativo"],
            row["usu_perfil"]
        );
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_usuario WHERE usu_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) return this.#mapear(rows[0]);
        return null;
    }

    async buscarPorEmail(email) {
        const sql = "SELECT * FROM tb_usuario WHERE usu_email = ?";
        const params = [email];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) return this.#mapear(rows[0]);
        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_usuario WHERE usu_ativo = 'S'";
        const rows = await this.#banco.ExecutaComando(sql);
        return rows.map(row => this.#mapear(row));
    }

    async listarTodos() {
        const sql = "SELECT * FROM tb_usuario ORDER BY usu_ativo DESC, usu_nome ASC";
        const rows = await this.#banco.ExecutaComando(sql);
        return rows.map(row => this.#mapear(row));
    }

    async alterarAtivo(id, ativo) {
        const sql = "UPDATE tb_usuario SET usu_ativo = ? WHERE usu_id = ?";
        const params = [ativo, id];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }

    async cadastrar(usuarioEntidade) {
        const sql = `
            INSERT INTO tb_usuario (usu_nome, usu_email, usu_senha, usu_ativo, usu_perfil)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            usuarioEntidade.nome,
            usuarioEntidade.email,
            usuarioEntidade.senha,
            usuarioEntidade.ativo,
            usuarioEntidade.perfil
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
            SET usu_nome = ?, usu_email = ?, usu_senha = ?, usu_perfil = ?
            WHERE usu_id = ?
        `;
        const valores = [
            entidadeAtualizada.nome,
            entidadeAtualizada.email,
            entidadeAtualizada.senha,
            entidadeAtualizada.perfil,
            entidadeAtualizada.id
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }
}