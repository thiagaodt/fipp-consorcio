import Database from "../utils/database.js";
import MovimentacaoAdministradorEntity from "../entities/movimentacaoAdministradorEntity.js";

export default class MovimentacaoAdministradorRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new MovimentacaoAdministradorEntity(
            row["mva_id"],
            row["usu_id"],
            row["con_id"],
            row["pag_id"],
            row["mva_tipo"],
            row["mva_valor"],
            row["mva_data"]
        );
    }

    async listarPorUsuario(usu_id) {
        const sql = `
            SELECT * FROM tb_movimentacaoadministrador
            WHERE usu_id = ?
            ORDER BY mva_data DESC
        `;
        const params = [usu_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_movimentacaoadministrador WHERE mva_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }
        return null;
    }

    async cadastrar(movimentacaoEntidade) {
        const sql = `
            INSERT INTO tb_movimentacaoadministrador (usu_id, con_id, pag_id, mva_tipo, mva_valor, mva_data)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            movimentacaoEntidade.usu_id,
            movimentacaoEntidade.con_id,
            movimentacaoEntidade.pag_id,
            movimentacaoEntidade.tipo,
            movimentacaoEntidade.valor,
            movimentacaoEntidade.data
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
        return id;
    }
}
