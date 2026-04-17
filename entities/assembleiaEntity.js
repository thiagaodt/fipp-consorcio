import Base from "./base.js";

export default class AssembleiaEntity extends Base {
    
    #id;
    #con_id;
    #usu_id;
    #numero;
    #data;
    #status;
    
    get id() { return this.#id } set id(value) { this.#id = value }
    get con_id() { return this.#con_id } set con_id(value) { this.#con_id = value }
    get usu_id() { return this.#usu_id } set usu_id(value) { this.#usu_id = value }
    get numero() { return this.#numero } set numero(value) { this.#numero = value }
    get data() { return this.#data } set data(value) { this.#data = value }
    get status() { return this.#status } set status(value) { this.#status = value }

    constructor(ass_id, con_id, usu_id, ass_numero, ass_data, ass_status) {
        super();
        this.#id = ass_id;
        this.#con_id = con_id;
        this.#usu_id = usu_id;
        this.#numero = ass_numero;
        this.#data = ass_data;
        this.#status = ass_status;
    }
}
