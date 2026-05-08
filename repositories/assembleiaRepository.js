import Database from "../utils/database.js";
import AssembleiaEntity from "../entities/assembleiaEntity.js";

export default class AssembleiaRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new AssembleiaEntity(
            row["ass_id"],
            row["ass_numero"],
            row["con_id"],
            row["ass_data"],
            row["cot_id"]
        );
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_assembleia WHERE ass_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }

        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_assembleia ORDER BY ass_data DESC, ass_id DESC";
        const rows = await this.#banco.ExecutaComando(sql);

        return rows.map(row => this.#mapear(row));
    }

    async listarPorConsorcio(con_id) {
        const sql = "SELECT * FROM tb_assembleia WHERE con_id = ? ORDER BY ass_numero";
        const params = [con_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async buscarAssembleiaCorrente(con_id) {
        const sql = `
            SELECT * FROM tb_assembleia
            WHERE con_id = ? AND cot_id IS NULL
            ORDER BY ass_numero ASC
            LIMIT 1
        `;
        const params = [con_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }
        return null;
    }

    async contarPorConsorcio(con_id) {
        const sql = "SELECT COUNT(*) AS total FROM tb_assembleia WHERE con_id = ?";
        const params = [con_id];
        const rows = await this.#banco.ExecutaComando(sql, params);
        return rows[0]?.total ?? 0;
    }

    async cadastrar(assembleiaEntidade) {
        const sql = `
            INSERT INTO tb_assembleia (ass_numero, con_id, ass_data, cot_id)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            assembleiaEntidade.numero,
            assembleiaEntidade.con_id,
            assembleiaEntidade.data,
            assembleiaEntidade.cot_id
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
        return id;
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
            SET ass_numero = ?, con_id = ?, ass_data = ?, cot_id = ?
            WHERE ass_id = ?
        `;
        const valores = [
            entidadeAtualizada.numero,
            entidadeAtualizada.con_id,
            entidadeAtualizada.data,
            entidadeAtualizada.cot_id,
            entidadeAtualizada.id
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }

    async definirCotaContemplada(ass_id, cot_id) {
        const sql = "UPDATE tb_assembleia SET cot_id = ? WHERE ass_id = ?";
        const params = [cot_id, ass_id];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }
}
