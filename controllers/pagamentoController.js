import PagamentoRepository from "../repositories/pagamentoRepository.js";
import PagamentoEntity from "../entities/pagamentoEntity.js";

export default class PagamentoController {
    
    #repositorio;

    constructor() {
        this.#repositorio = new PagamentoRepository();
    }

    async listar(req, res) {
        try {
            let lista = await this.#repositorio.listar();
            if(lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({msg: "Nenhum pagamento foi encontrado!"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async cadastrar(req, res) {
        try {
            let {cot_id, valor, data_pagamento, status} = req.body;
            if(cot_id && valor && data_pagamento && status) {
                let entidade = new PagamentoEntity(null, cot_id, valor, data_pagamento, status);
                let success = await this.#repositorio.cadastrar(entidade);
                if(success)
                    return res.status(200).json({msg: "Pagamento cadastrado com sucesso"});
                else
                    throw new Error("Erro ao cadastrar pagamento. Não foi possível persisti-lo no banco de dados");
            }
            else {
                return res.status(400).json({msg: "O pagamento precisa ter cot_id, valor, data_pagamento e status definidos!"})
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
                    return res.status(200).json({msg: "Pagamento excluído com sucesso!"});
                else
                    throw new Error("Erro ao deletar pagamento no banco de dados")
            }
            else {
                return res.status(404).json({msg: "Pagamento não encontrado para deleção"});
            }

        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async atualizar(req, res) {
        try {
            let {id, cot_id, valor, data_pagamento, status} = req.body;

            if(id && cot_id && valor && data_pagamento && status) {
                if(await this.#repositorio.buscarPorId(id)) {
                    let entidade = new PagamentoEntity(id, cot_id, valor, data_pagamento, status);
                    if(await this.#repositorio.alterar(entidade))
                        res.status(200).json({msg: "Pagamento alterado!"});
                    else
                        throw new Error("Erro ao alterar pagamento no banco de dados");
                }
                else {
                    res.status(404).json({msg: "Pagamento não encontrado para alteração"});
                }
            }
            else {
                res.status(400).json({msg: "As informações do pagamento não estão corretas!"})
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
            let pagamento = await this.#repositorio.buscarPorId(id);
            if(pagamento) {
                return res.status(200).json(pagamento);
            }
            else
                return res.status(404).json({msg: "Pagamento não encontrado!"});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

}   