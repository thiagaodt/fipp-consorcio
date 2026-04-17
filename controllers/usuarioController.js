import UsuarioEntity from "../entities/usuarioEntity.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import { usuarioSchema } from "../schemas/usuarioSchema.js";
import Bcrypt from "../utils/bcrypt.js";

export default class UsuarioController {

    #repositorio;

    constructor() {
        this.#repositorio = new UsuarioRepository();
    }

    async listar(req, res) {
        try {
            let lista = await this.#repositorio.listar();
            if(lista.length > 0)
                res.status(200).json(lista);
            else 
                res.status(404).json({msg: "Nenhum usuario foi encontrado!"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async cadastrar(req, res) {
        try {
            let {nome, email, senha} = req.body;
            let validacao = usuarioSchema.safeParse(req.body);
            if(validacao.success) {
                let bcrypt = new Bcrypt();
                let hash = await bcrypt.hash(senha);
                let entidade = new UsuarioEntity(null, nome, email, hash, 'S');
                let success = await this.#repositorio.cadastrar(entidade);
                if(success)
                    return res.status(200).json({msg: "Usuario cadastrado com sucesso"});
                else
                    throw new Error("Erro ao cadastrar usuario. Não foi possível persisti-lo no banco de dados");
            }
            else {
                return res.status(400).json({
                    msg: "Falha na validação dos dados",
                    erros: validacao.error.format()
                });
            }
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async deletar(req, res) {
        try{
            let {id} = req.params;
            if(await this.#repositorio.buscarPorId(id)) {
                if(await this.#repositorio.deletar(id))
                    return res.status(200).json({msg: "Usuario excluído com sucesso!"});
                else
                    throw new Error("Erro ao deletar usuario no banco de dados")
            }
            else {
                return res.status(404).json({msg: "Usuario não encontrado para deleção"});
            }

        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async atualizar(req, res) {
        try {
            let {id} = req.params;
            let {nome, email, senha} = req.body;
            let validacao = usuarioSchema.safeParse(req.body);
            if(validacao.success) {
                if(await this.#repositorio.buscarPorId(id)) {
                    let bcrypt = new Bcrypt();
                    let hash = await bcrypt.hash(senha);
                    let entidade = new UsuarioEntity(id, nome, email, hash);
                    if(await this.#repositorio.alterar(entidade))
                        res.status(200).json({msg: "Usuario alterado!"});
                    else
                        throw new Error("Erro ao alterar usuario no banco de dados");
                }
                else {
                    res.status(404).json({msg: "Usuario não encontrado para alteração"});
                }
            }
            else {
                res.status(400).json({
                    msg: "Falha na validação dos dados ao atualizar",
                    erros: validacao.error.format()
                });
            }

        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async obterPorId(req, res) {
        try{
            let {id} = req.params;
            let usuario = await this.#repositorio.buscarPorId(id);
            if(usuario) {
                return res.status(200).json(usuario);
            }
            else
                return res.status(404).json({msg: "Usuario não encontrado!"});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

}