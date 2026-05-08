import Database from "../utils/database.js";
import CotaEntity from "../entities/cotaEntity.js";

export default class CotaRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new CotaEntity(
            row["cot_id"],
            row["con_id"],
            row["usu_id"],
            row["cot_numero"],
            row["cot_status"]
        );
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_cota WHERE cot_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }

        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_cota";
        const rows = await this.#banco.ExecutaComando(sql);

        return rows.map(row => this.#mapear(row));
    }

    async listarPorConsorcio(con_id) {
        const sql = "SELECT * FROM tb_cota WHERE con_id = ? ORDER BY cot_numero";
        const params = [con_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async listarPorUsuario(usu_id) {
        const sql = "SELECT * FROM tb_cota WHERE usu_id = ?";
        const params = [usu_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async listarNaoContempladas(con_id) {
        const sql = "SELECT * FROM tb_cota WHERE con_id = ? AND cot_status <> 'CONTEMPLADA'";
        const params = [con_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async contarPorConsorcio(con_id) {
        const sql = "SELECT COUNT(*) AS total FROM tb_cota WHERE con_id = ?";
        const params = [con_id];
        const rows = await this.#banco.ExecutaComando(sql, params);
        return rows[0]?.total ?? 0;
    }

    async cadastrar(cotaEntidade) {
        const sql = `
            INSERT INTO tb_cota (con_id, usu_id, cot_numero, cot_status)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            cotaEntidade.con_id,
            cotaEntidade.usu_id,
            cotaEntidade.numero,
            cotaEntidade.status
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
        return id;
    }

    async deletar(id) {
        const sql = "DELETE FROM tb_cota WHERE cot_id = ?";
        const params = [id];
        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `
            UPDATE tb_cota
            SET con_id = ?, usu_id = ?, cot_numero = ?, cot_status = ?
            WHERE cot_id = ?
        `;
        const valores = [
            entidadeAtualizada.con_id,
            entidadeAtualizada.usu_id,
            entidadeAtualizada.numero,
            entidadeAtualizada.status,
            entidadeAtualizada.id
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }

    async alterarStatus(id, status) {
        const sql = "UPDATE tb_cota SET cot_status = ? WHERE cot_id = ?";
        const params = [status, id];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }
}
