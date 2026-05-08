import Base from "./base.js";

export default class MovimentacaoAdministradorEntity extends Base {

    #id;
    #usu_id;
    #con_id;
    #pag_id;
    #tipo;
    #valor;
    #data;

    get id() { return this.#id } set id(value) { this.#id = value }
    get usu_id() { return this.#usu_id } set usu_id(value) { this.#usu_id = value }
    get con_id() { return this.#con_id } set con_id(value) { this.#con_id = value }
    get pag_id() { return this.#pag_id } set pag_id(value) { this.#pag_id = value }
    get tipo() { return this.#tipo } set tipo(value) { this.#tipo = value }
    get valor() { return this.#valor } set valor(value) { this.#valor = value }
    get data() { return this.#data } set data(value) { this.#data = value }

    constructor(mva_id, usu_id, con_id, pag_id, mva_tipo, mva_valor, mva_data) {
        super();
        this.#id = mva_id;
        this.#usu_id = usu_id;
        this.#con_id = con_id;
        this.#pag_id = pag_id;
        this.#tipo = mva_tipo;
        this.#valor = mva_valor;
        this.#data = mva_data;
    }
}
