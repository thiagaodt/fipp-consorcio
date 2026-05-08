import Base from "./base.js";

export default class MovimentacaoConsorcioEntity extends Base {

    #id;
    #con_id;
    #pag_id;
    #ass_id;
    #tipo;
    #valor;
    #data;

    get id() { return this.#id } set id(value) { this.#id = value }
    get con_id() { return this.#con_id } set con_id(value) { this.#con_id = value }
    get pag_id() { return this.#pag_id } set pag_id(value) { this.#pag_id = value }
    get ass_id() { return this.#ass_id } set ass_id(value) { this.#ass_id = value }
    get tipo() { return this.#tipo } set tipo(value) { this.#tipo = value }
    get valor() { return this.#valor } set valor(value) { this.#valor = value }
    get data() { return this.#data } set data(value) { this.#data = value }

    constructor(mov_id, con_id, pag_id, ass_id, mov_tipo, mov_valor, mov_data) {
        super();
        this.#id = mov_id;
        this.#con_id = con_id;
        this.#pag_id = pag_id;
        this.#ass_id = ass_id;
        this.#tipo = mov_tipo;
        this.#valor = mov_valor;
        this.#data = mov_data;
    }
}
