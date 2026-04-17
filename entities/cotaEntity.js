import Base from "./base.js";

export default class CotaEntity extends Base {
    
    #id;
    #con_id;
    #usu_id;
    #numero;
    #status;
    
    get id() { return this.#id } set id(value) { this.#id = value }
    get con_id() { return this.#con_id } set con_id(value) { this.#con_id = value }
    get usu_id() { return this.#usu_id } set usu_id(value) { this.#usu_id = value }
    get numero() { return this.#numero } set numero(value) { this.#numero = value }
    get status() { return this.#status } set status(value) { this.#status = value }

    constructor(cot_id, con_id, usu_id, cot_numero, cot_status) {
        super();
        this.#id = cot_id;
        this.#con_id = con_id;
        this.#usu_id = usu_id;
        this.#numero = cot_numero;
        this.#status = cot_status;
    }
}   