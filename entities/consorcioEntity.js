import Base from "./base.js";

export default class ConsorcioEntity extends Base {
    
    #id;
    #nome;
    #usu_id;
    #quantidadecotas;
    #valorpremio;
    #taxaadministracao;
    #fundoreserva;
    #valormensal;
    #diaassembleia;
    #datainicio;
    #datafim;
    #status;
    
    get id() { return this.#id } set id(value) { this.#id = value }
    get nome() { return this.#nome } set nome(value) { this.#nome = value }
    get usu_id() { return this.#usu_id } set usu_id(value) { this.#usu_id = value }
    get quantidadecotas() { return this.#quantidadecotas } set quantidadecotas(value) { this.#quantidadecotas = value }
    get valorpremio() { return this.#valorpremio } set valorpremio(value) { this.#valorpremio = value }
    get taxaadministracao() { return this.#taxaadministracao } set taxaadministracao(value) { this.#taxaadministracao = value }
    get fundoreserva() { return this.#fundoreserva } set fundoreserva(value) { this.#fundoreserva = value }
    get valormensal() { return this.#valormensal } set valormensal(value) { this.#valormensal = value }
    get diaassembleia() { return this.#diaassembleia } set diaassembleia(value) { this.#diaassembleia = value }
    get datainicio() { return this.#datainicio } set datainicio(value) { this.#datainicio = value }
    get datafim() { return this.#datafim } set datafim(value) { this.#datafim = value }
    get status() { return this.#status } set status(value) { this.#status = value }

    constructor(con_id, con_nome, usu_id, con_quantidadecotas, con_valorpremio, con_taxaadministracao, con_fundoreserva, con_valormensal, con_diaassembleia, con_datainicio, con_datafim, con_status) {
        super();
        this.#id = con_id;
        this.#nome = con_nome;
        this.#usu_id = usu_id;
        this.#quantidadecotas = con_quantidadecotas;
        this.#valorpremio = con_valorpremio;
        this.#taxaadministracao = con_taxaadministracao;
        this.#fundoreserva = con_fundoreserva;
        this.#valormensal = con_valormensal;
        this.#diaassembleia = con_diaassembleia;
        this.#datainicio = con_datainicio;
        this.#datafim = con_datafim;
        this.#status = con_status;
    }
}