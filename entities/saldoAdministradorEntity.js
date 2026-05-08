import Base from "./base.js";

export default class SaldoAdministradorEntity extends Base {

    #id;
    #usu_id;
    #valor;
    #dataatualizacao;

    get id() { return this.#id } set id(value) { this.#id = value }
    get usu_id() { return this.#usu_id } set usu_id(value) { this.#usu_id = value }
    get valor() { return this.#valor } set valor(value) { this.#valor = value }
    get dataatualizacao() { return this.#dataatualizacao } set dataatualizacao(value) { this.#dataatualizacao = value }

    constructor(sad_id, usu_id, sad_valor, sad_dataatualizacao) {
        super();
        this.#id = sad_id;
        this.#usu_id = usu_id;
        this.#valor = sad_valor;
        this.#dataatualizacao = sad_dataatualizacao;
    }
}
