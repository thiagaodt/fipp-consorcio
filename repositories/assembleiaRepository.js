import Database from "../utils/database.js";
import AssembleiaEntity from "../entities/assembleiaEntity.js";

export default class AssembleiaRepository {
    
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_assembleia WHERE ass_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            const row = rows[0];
            const assembleia = new AssembleiaEntity(
                row["ass_id"],
                row["ass_nome"],
                row["ass_email"],
                row["ass_senha"]
            );
            return assembleia;
        }

        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_assembleia";
        const rows = await this.#banco.ExecutaComando(sql);

        const assembleias = rows.map(row =>
            new AssembleiaEntity(
                row["ass_id"],
                row["ass_nome"],
                row["ass_email"],
                row["ass_senha"]
            )
        );

        return assembleias;
    }

    async cadastrar(assembleiaEntidade) {
        const sql = `
            INSERT INTO tb_assembleia (ass_nome, ass_email, ass_senha)
            VALUES (?, ?, ?)
        `;
        const params = [
            assembleiaEntidade.nome,
            assembleiaEntidade.email,
            assembleiaEntidade.senha
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async deletar(id) {
        const sql = "DELETE FROM tb_assembleia WHERE ass_id = ?";
        const params = [id];
        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `
            UPDATE tb_assembleia
            SET ass_nome = ?, ass_email = ?, ass_senha = ?
            WHERE ass_id = ?
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