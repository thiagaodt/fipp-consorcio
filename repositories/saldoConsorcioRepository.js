import Database from "../utils/database.js";
import SaldoConsorcioEntity from "../entities/saldoConsorcioEntity.js";

export default class SaldoConsorcioRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new SaldoConsorcioEntity(
            row["sal_id"],
            row["con_id"],
            row["sal_valor"],
            row["sal_dataatualizacao"]
        );
    }

    async buscarPorConsorcio(con_id) {
        const sql = "SELECT * FROM tb_saldoconsorcio WHERE con_id = ?";
        const params = [con_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }
        return null;
    }

    async cadastrar(saldoEntidade) {
        const sql = `
            INSERT INTO tb_saldoconsorcio (con_id, sal_valor, sal_dataatualizacao)
            VALUES (?, ?, ?)
        `;
        const params = [
            saldoEntidade.con_id,
            saldoEntidade.valor,
            saldoEntidade.dataatualizacao
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
        return id;
    }

    async creditar(con_id, valor) {
        const saldoAtual = await this.buscarPorConsorcio(con_id);
        const agora = new Date();

        if (saldoAtual) {
            const sql = `
                UPDATE tb_saldoconsorcio
                SET sal_valor = sal_valor + ?, sal_dataatualizacao = ?
                WHERE con_id = ?
            `;
            const params = [valor, agora, con_id];
            return await this.#banco.ExecutaComandoNonQuery(sql, params);
        }
        else {
            const sql = `
                INSERT INTO tb_saldoconsorcio (con_id, sal_valor, sal_dataatualizacao)
                VALUES (?, ?, ?)
            `;
            const params = [con_id, valor, agora];
            const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
            return id > 0;
        }
    }

    async debitar(con_id, valor) {
        const saldoAtual = await this.buscarPorConsorcio(con_id);
        if (!saldoAtual || Number(saldoAtual.valor) < Number(valor)) {
            return false;
        }
        const sql = `
            UPDATE tb_saldoconsorcio
            SET sal_valor = sal_valor - ?, sal_dataatualizacao = ?
            WHERE con_id = ?
        `;
        const params = [valor, new Date(), con_id];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }
}
