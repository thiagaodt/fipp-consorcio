import Base from "./base.js";

export default class PagamentoEntity extends Base {
    
    #id;
    #cot_id;
    #ass_id;
    #status;
    #datageracao;
    #datapagamento;
    #valor;
    
    get id() { return this.#id } set id(value) { this.#id = value }
    get cot_id() { return this.#cot_id } set cot_id(value) { this.#cot_id = value }
    get ass_id() { return this.#ass_id } set ass_id(value) { this.#ass_id = value }
    get status() { return this.#status } set status(value) { this.#status = value }
    get datageracao() { return this.#datageracao } set datageracao(value) { this.#datageracao = value }
    get datapagamento() { return this.#datapagamento } set datapagamento(value) { this.#datapagamento = value }
    get valor() { return this.#valor } set valor(value) { this.#valor = value }

    constructor(pag_id, cot_id, ass_id, pag_status, pag_datageracao, pag_datapagamento, pag_valor) {
        super();
        this.#id = pag_id;
        this.#cot_id = cot_id;
        this.#ass_id = ass_id;
        this.#status = pag_status;
        this.#datageracao = pag_datageracao;
        this.#datapagamento = pag_datapagamento;
        this.#valor = pag_valor;
    }
}