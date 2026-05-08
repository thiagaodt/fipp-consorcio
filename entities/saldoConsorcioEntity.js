import Base from "./base.js";

export default class SaldoConsorcioEntity extends Base {

    #id;
    #con_id;
    #valor;
    #dataatualizacao;

    get id() { return this.#id } set id(value) { this.#id = value }
    get con_id() { return this.#con_id } set con_id(value) { this.#con_id = value }
    get valor() { return this.#valor } set valor(value) { this.#valor = value }
    get dataatualizacao() { return this.#dataatualizacao } set dataatualizacao(value) { this.#dataatualizacao = value }

    constructor(sal_id, con_id, sal_valor, sal_dataatualizacao) {
        super();
        this.#id = sal_id;
        this.#con_id = con_id;
        this.#valor = sal_valor;
        this.#dataatualizacao = sal_dataatualizacao;
    }
}
