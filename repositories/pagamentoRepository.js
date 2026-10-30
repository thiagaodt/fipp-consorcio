import Database from "../utils/database.js";
import PagamentoEntity from "../entities/pagamentoEntity.js";

export default class PagamentoRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new PagamentoEntity(
            row["pag_id"],
            row["cot_id"],
            row["ass_id"],
            row["pag_status"],
            row["pag_datageracao"],
            row["pag_datapagamento"],
            row["pag_valor"],
            row["pag_abacateid"]
        );
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_pagamento WHERE pag_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }

        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_pagamento ORDER BY pag_datageracao DESC";
        const rows = await this.#banco.ExecutaComando(sql);

        return rows.map(row => this.#mapear(row));
    }

    async listarPorCota(cot_id) {
        const sql = "SELECT * FROM tb_pagamento WHERE cot_id = ? ORDER BY pag_datageracao DESC";
        const params = [cot_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async listarPorAssembleia(ass_id) {
        const sql = "SELECT * FROM tb_pagamento WHERE ass_id = ?";
        const params = [ass_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async buscarPorCotaEAssembleia(cot_id, ass_id) {
        const sql = "SELECT * FROM tb_pagamento WHERE cot_id = ? AND ass_id = ?";
        const params = [cot_id, ass_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }
        return null;
    }

    async todasConfirmadasNaAssembleia(ass_id, totalCotas) {
        const sql = `
            SELECT COUNT(*) AS confirmadas
            FROM tb_pagamento
            WHERE ass_id = ? AND pag_status = 'CONFIRMADO'
        `;
        const params = [ass_id];
        const rows = await this.#banco.ExecutaComando(sql, params);
        const confirmadas = rows[0]?.confirmadas ?? 0;
        return confirmadas >= totalCotas;
    }

    async cadastrar(pagamentoEntidade) {
        const sql = `
            INSERT INTO tb_pagamento (cot_id, ass_id, pag_status, pag_datageracao, pag_datapagamento, pag_valor)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            pagamentoEntidade.cot_id,
            pagamentoEntidade.ass_id,
            pagamentoEntidade.status,
            pagamentoEntidade.datageracao,
            pagamentoEntidade.datapagamento,
            pagamentoEntidade.valor
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
        return id;
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
            SET cot_id = ?, ass_id = ?, pag_status = ?, pag_datageracao = ?, pag_datapagamento = ?, pag_valor = ?
            WHERE pag_id = ?
        `;
        const valores = [
            entidadeAtualizada.cot_id,
            entidadeAtualizada.ass_id,
            entidadeAtualizada.status,
            entidadeAtualizada.datageracao,
            entidadeAtualizada.datapagamento,
            entidadeAtualizada.valor,
            entidadeAtualizada.id
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }

    async registrarAbacateId(id, abacateId) {
        const sql = "UPDATE tb_pagamento SET pag_abacateid = ? WHERE pag_id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [abacateId, id]);
    }

    async confirmarPagamento(id, dataPagamento) {
        const sql = `
            UPDATE tb_pagamento
            SET pag_status = 'CONFIRMADO', pag_datapagamento = ?
            WHERE pag_id = ?
        `;
        const params = [dataPagamento, id];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }
}
