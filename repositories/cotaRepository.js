import Database from "../utils/database.js";
import CotaEntity from "../entities/cotaEntity.js";

export default class CotaRepository {
    
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_cota WHERE cot_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            const row = rows[0];
            const cota = new CotaEntity(
                row["cot_id"],
                row["cot_con_id"],
                row["cot_usu_id"],
                row["cot_numero"],
                row["cot_status"]
            );
            return cota;
        }

        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_cota";
        const rows = await this.#banco.ExecutaComando(sql);

        const cotas = rows.map(row =>
            new CotaEntity(
                row["cot_id"],
                row["cot_con_id"],
                row["cot_usu_id"],
                row["cot_numero"],
                row["cot_status"]
            )
        );

        return cotas;
    }

    async cadastrar(cotaEntidade) {
        const sql = `
            INSERT INTO tb_cota (cot_con_id, cot_usu_id, cot_numero, cot_status)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            cotaEntidade.con_id,
            cotaEntidade.usu_id,
            cotaEntidade.numero,
            cotaEntidade.status
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
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
            SET cot_con_id = ?, cot_usu_id = ?, cot_numero = ?, cot_status = ?
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
}