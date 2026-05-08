import Database from "../utils/database.js";
import SaldoAdministradorEntity from "../entities/saldoAdministradorEntity.js";

export default class SaldoAdministradorRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new SaldoAdministradorEntity(
            row["sad_id"],
            row["usu_id"],
            row["sad_valor"],
            row["sad_dataatualizacao"]
        );
    }

    async buscarPorUsuario(usu_id) {
        const sql = "SELECT * FROM tb_saldoadministrador WHERE usu_id = ?";
        const params = [usu_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }
        return null;
    }

    async cadastrar(saldoEntidade) {
        const sql = `
            INSERT INTO tb_saldoadministrador (usu_id, sad_valor, sad_dataatualizacao)
            VALUES (?, ?, ?)
        `;
        const params = [
            saldoEntidade.usu_id,
            saldoEntidade.valor,
            saldoEntidade.dataatualizacao
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
        return id;
    }

    async creditar(usu_id, valor) {
        const saldoAtual = await this.buscarPorUsuario(usu_id);
        const agora = new Date();

        if (saldoAtual) {
            const sql = `
                UPDATE tb_saldoadministrador
                SET sad_valor = sad_valor + ?, sad_dataatualizacao = ?
                WHERE usu_id = ?
            `;
            const params = [valor, agora, usu_id];
            return await this.#banco.ExecutaComandoNonQuery(sql, params);
        }
        else {
            const sql = `
                INSERT INTO tb_saldoadministrador (usu_id, sad_valor, sad_dataatualizacao)
                VALUES (?, ?, ?)
            `;
            const params = [usu_id, valor, agora];
            const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
            return id > 0;
        }
    }

    async debitar(usu_id, valor) {
        const saldoAtual = await this.buscarPorUsuario(usu_id);
        if (!saldoAtual || Number(saldoAtual.valor) < Number(valor)) {
            return false;
        }
        const sql = `
            UPDATE tb_saldoadministrador
            SET sad_valor = sad_valor - ?, sad_dataatualizacao = ?
            WHERE usu_id = ?
        `;
        const params = [valor, new Date(), usu_id];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }
}
