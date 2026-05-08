import Base from "./base.js";

export default class AssembleiaEntity extends Base {

    #id;
    #numero;
    #con_id;
    #data;
    #cot_id;

    get id() { return this.#id } set id(value) { this.#id = value }
    get numero() { return this.#numero } set numero(value) { this.#numero = value }
    get con_id() { return this.#con_id } set con_id(value) { this.#con_id = value }
    get data() { return this.#data } set data(value) { this.#data = value }
    get cot_id() { return this.#cot_id } set cot_id(value) { this.#cot_id = value }

    constructor(ass_id, ass_numero, con_id, ass_data, cot_id) {
        super();
        this.#id = ass_id;
        this.#numero = ass_numero;
        this.#con_id = con_id;
        this.#data = ass_data;
        this.#cot_id = cot_id;
    }
}
