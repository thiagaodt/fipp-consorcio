import AssembleiaRepository from "../repositories/assembleiaRepository.js";
import AssembleiaEntity from "../entities/assembleiaEntity.js";

export default class AssembleiaController {

    #repositorio;

    constructor() {
        this.#repositorio = new AssembleiaRepository();
    }

    async listar(req, res) {
        try {
            let lista = await this.#repositorio.listar();
            if(lista.length > 0)
                res.status(200).json(lista);
            else 
                res.status(404).json({msg: "Nenhuma assembleia foi encontrada!"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async cadastrar(req, res) {
        try {
            let {con_id, usu_id, numero, status} = req.body;
            if(con_id && usu_id && numero && status) {
                let entidade = new AssembleiaEntity(null, con_id, usu_id, numero, status);
                let success = await this.#repositorio.cadastrar(entidade);
                if(success)
                    return res.status(200).json({msg: "Assembleia cadastrada com sucesso"});
                else
                    throw new Error("Erro ao cadastrar assembleia. Não foi possível persisti-la no banco de dados");
            }
            else {
                return res.status(400).json({msg: "A assembleia precisa ter con_id, usu_id, numero e status definidos!"})
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
                    return res.status(200).json({msg: "Assembleia excluída com sucesso!"});
                else
                    throw new Error("Erro ao deletar assembleia no banco de dados")
            }
            else {
                return res.status(404).json({msg: "Assembleia não encontrada para deleção"});
            }

        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async atualizar(req, res) {
        try {
            let {id, con_id, usu_id, numero, status} = req.body;

            if(id && con_id && usu_id && numero && status) {
                if(await this.#repositorio.buscarPorId(id)) {
                    let entidade = new AssembleiaEntity(id, con_id, usu_id, numero, status);
                    if(await this.#repositorio.alterar(entidade))
                        res.status(200).json({msg: "Assembleia alterada!"});
                    else
                        throw new Error("Erro ao alterar assembleia no banco de dados");
                }
                else {
                    res.status(404).json({msg: "Assembleia não encontrada para alteração"});
                }
            }
            else {
                res.status(400).json({msg: "As informações da assembleia não estão corretas!"})
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
            let assembleia = await this.#repositorio.buscarPorId(id);
            if(assembleia) {
                return res.status(200).json(assembleia);
            }
            else
                return res.status(404).json({msg: "Assembleia não encontrada!"});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

}