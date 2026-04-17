import ConsorcioRepository from "../repositories/consorcioRepository.js";
import ConsorcioEntity from "../entities/consorcioEntity.js";

export default class ConsorcioController {
    
    #repositorio;

    constructor() {
        this.#repositorio = new ConsorcioRepository();
    }

    async listar(req, res) {
        try {
            let lista = await this.#repositorio.listar();
            if(lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({msg: "Nenhum consorcio foi encontrado!"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async cadastrar(req, res) {
        try {
            let {nome, email, senha} = req.body;
            if(nome && email && senha) {
                let entidade = new ConsorcioEntity(null, nome, email, senha);
                let success = await this.#repositorio.cadastrar(entidade);
                if(success)
                    return res.status(200).json({msg: "Consorcio cadastrado com sucesso"});
                else
                    throw new Error("Erro ao cadastrar consorcio. Não foi possível persisti-lo no banco de dados");
            }
            else {
                return res.status(400).json({msg: "O consorcio precisa ter nome, email e senha definidos!"})
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
                    return res.status(200).json({msg: "Consorcio excluído com sucesso!"});
                else
                    throw new Error("Erro ao deletar consorcio no banco de dados")
            }
            else {
                return res.status(404).json({msg: "Consorcio não encontrado para deleção"});
            }

        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async atualizar(req, res) {
        try {
            let {id, nome, email, senha} = req.body;

            if(id && nome && email && senha) {
                if(await this.#repositorio.buscarPorId(id)) {
                    let entidade = new ConsorcioEntity(id, nome, email, senha);
                    if(await this.#repositorio.alterar(entidade))
                        res.status(200).json({msg: "Consorcio alterado!"});
                    else
                        throw new Error("Erro ao alterar consorcio no banco de dados");
                }
                else {
                    res.status(404).json({msg: "Consorcio não encontrado para alteração"});
                }
            }
            else {
                res.status(400).json({msg: "As informações do consorcio não estão corretas!"})
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
            let consorcio = await this.#repositorio.buscarPorId(id);
            if(consorcio) {
                return res.status(200).json(consorcio);
            }
            else
                return res.status(404).json({msg: "Consorcio não encontrado!"});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

}   