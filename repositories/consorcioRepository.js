import Database from "../utils/database.js";
import ConsorcioEntity from "../entities/consorcioEntity.js";

export default class ConsorcioRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new ConsorcioEntity(
            row["con_id"],
            row["con_nome"],
            row["usu_id"],
            row["con_quantidadecotas"],
            row["con_valorpremio"],
            row["con_taxaadministracao"],
            row["con_fundoreserva"],
            row["con_valormensal"],
            row["con_diaassembleia"],
            row["con_datainicio"],
            row["con_datafim"],
            row["con_status"]
        );
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_consorcio WHERE con_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }

        return null;
    }

    async listar() {
        const sql = "SELECT * FROM tb_consorcio";
        const rows = await this.#banco.ExecutaComando(sql);

        return rows.map(row => this.#mapear(row));
    }

    async listarPorAdministrador(usu_id) {
        const sql = "SELECT * FROM tb_consorcio WHERE usu_id = ?";
        const params = [usu_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async cadastrar(consorcioEntidade) {
        const sql = `
            INSERT INTO tb_consorcio
                (con_nome, usu_id, con_quantidadecotas, con_valorpremio,
                 con_taxaadministracao, con_fundoreserva, con_valormensal,
                 con_diaassembleia, con_datainicio, con_datafim, con_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            consorcioEntidade.nome,
            consorcioEntidade.usu_id,
            consorcioEntidade.quantidadecotas,
            consorcioEntidade.valorpremio,
            consorcioEntidade.taxaadministracao,
            consorcioEntidade.fundoreserva,
            consorcioEntidade.valormensal,
            consorcioEntidade.diaassembleia,
            consorcioEntidade.datainicio,
            consorcioEntidade.datafim,
            consorcioEntidade.status
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
        return id;
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
            SET con_nome = ?, con_quantidadecotas = ?, con_valorpremio = ?,
                con_taxaadministracao = ?, con_fundoreserva = ?, con_valormensal = ?,
                con_diaassembleia = ?, con_datainicio = ?, con_datafim = ?, con_status = ?
            WHERE con_id = ?
        `;
        const valores = [
            entidadeAtualizada.nome,
            entidadeAtualizada.quantidadecotas,
            entidadeAtualizada.valorpremio,
            entidadeAtualizada.taxaadministracao,
            entidadeAtualizada.fundoreserva,
            entidadeAtualizada.valormensal,
            entidadeAtualizada.diaassembleia,
            entidadeAtualizada.datainicio,
            entidadeAtualizada.datafim,
            entidadeAtualizada.status,
            entidadeAtualizada.id
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }

    async alterarStatus(id, status) {
        const sql = "UPDATE tb_consorcio SET con_status = ? WHERE con_id = ?";
        const params = [status, id];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }
}
