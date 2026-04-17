import Database from "../utils/database.js";
import PagamentoEntity from "../entities/pagamentoEntity.js";

export default class PagamentoRepository {
    
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_pagamento WHERE pag_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            const row = rows[0];
            const pagamento = new PagamentoEntity(
                row["pag_id"],
                row["pag_cot_id"],
                row["pag_numero"],
                row["pag_status"]
            );
            return pagamento;
        }

        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_pagamento";
        const rows = await this.#banco.ExecutaComando(sql);

        const pagamentos = rows.map(row =>
            new PagamentoEntity(
                row["pag_id"],
                row["pag_cot_id"],
                row["pag_numero"],
                row["pag_status"]
            )
        );

        return pagamentos;
    }

    async cadastrar(pagamentoEntidade) {
        const sql = `
            INSERT INTO tb_pagamento (pag_cot_id, pag_numero, pag_status)
            VALUES (?, ?, ?)
        `;
        const params = [
            pagamentoEntidade.cot_id,
            pagamentoEntidade.numero,
            pagamentoEntidade.status
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async deletar(id) {
        const sql = "DELETE FROM tb_pagamento WHERE pag_id = ?";
        const params = [id];
        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `
            UPDATE tb_pagamento
            SET pag_cot_id = ?, pag_numero = ?, pag_status = ?
            WHERE pag_id = ?
        `;
        const valores = [
            entidadeAtualizada.cot_id,
            entidadeAtualizada.numero,
            entidadeAtualizada.status,
            entidadeAtualizada.id
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }
}   