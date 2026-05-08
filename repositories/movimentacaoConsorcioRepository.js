import Database from "../utils/database.js";
import MovimentacaoConsorcioEntity from "../entities/movimentacaoConsorcioEntity.js";

export default class MovimentacaoConsorcioRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    #mapear(row) {
        return new MovimentacaoConsorcioEntity(
            row["mov_id"],
            row["con_id"],
            row["pag_id"],
            row["ass_id"],
            row["mov_tipo"],
            row["mov_valor"],
            row["mov_data"]
        );
    }

    async listarPorConsorcio(con_id) {
        const sql = `
            SELECT * FROM tb_movimentacaoconsorcio
            WHERE con_id = ?
            ORDER BY mov_data DESC
        `;
        const params = [con_id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        return rows.map(row => this.#mapear(row));
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_movimentacaoconsorcio WHERE mov_id = ?";
        const params = [id];
        const rows = await this.#banco.ExecutaComando(sql, params);

        if (rows.length > 0) {
            return this.#mapear(rows[0]);
        }
        return null;
    }

    async cadastrar(movimentacaoEntidade) {
        const sql = `
            INSERT INTO tb_movimentacaoconsorcio (con_id, pag_id, ass_id, mov_tipo, mov_valor, mov_data)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            movimentacaoEntidade.con_id,
            movimentacaoEntidade.pag_id,
            movimentacaoEntidade.ass_id,
            movimentacaoEntidade.tipo,
            movimentacaoEntidade.valor,
            movimentacaoEntidade.data
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, params);
        return id;
    }
}
