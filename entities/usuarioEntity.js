import Base from "./base.js";

export default class UsuarioEntity extends Base {

    #id;
    #nome;
    #email;
    #senha;
    #ativo;
    #perfil;

    get id() { return this.#id } set id(value) { this.#id = value }
    get nome() { return this.#nome } set nome(value) { this.#nome = value }
    get email() { return this.#email } set email(value) { this.#email = value }
    get senha() { return this.#senha } set senha(value) { this.#senha = value }
    get ativo() { return this.#ativo } set ativo(value) { this.#ativo = value }
    get perfil() { return this.#perfil } set perfil(value) { this.#perfil = value }

    constructor(usu_id, usu_nome, usu_email, usu_senha, usu_ativo, usu_perfil) {
        super();
        this.#id = usu_id;
        this.#nome = usu_nome;
        this.#email = usu_email;
        this.#senha = usu_senha;
        this.#ativo = usu_ativo;
        this.#perfil = usu_perfil ?? 'PADRAO';
    }
}
