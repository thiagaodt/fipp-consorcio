import Database from "../utils/database.js";
import ConsorcioEntity from "../entities/consorcioEntity.js";

export default class ConsorcioRepository {
    
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_consorcio WHERE con_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            const row = rows[0];
            const consorcio = new ConsorcioEntity(
                row["con_id"],
                row["con_nome"],
                row["con_email"],
                row["con_senha"]
            );
            return consorcio;
        }

        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_consorcio";
        const rows = await this.#banco.ExecutaComando(sql);

        const consorcios = rows.map(row =>
            new ConsorcioEntity(
                row["con_id"],
                row["con_nome"],
                row["con_email"],
                row["con_senha"]
            )
        );

        return consorcios;
    }

    async cadastrar(consorcioEntidade) {
        const sql = `
            INSERT INTO tb_consorcio (con_nome, con_email, con_senha)
            VALUES (?, ?, ?)
        `;
        const params = [
            consorcioEntidade.nome,
            consorcioEntidade.email,
            consorcioEntidade.senha
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async deletar(id) {
        const sql = "DELETE FROM tb_consorcio WHERE con_id = ?";
        const params = [id];
        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `
            UPDATE tb_consorcio
            SET con_nome = ?, con_email = ?, con_senha = ?
            WHERE con_id = ?
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