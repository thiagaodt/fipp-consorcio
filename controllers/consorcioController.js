import ConsorcioRepository from "../repositories/consorcioRepository.js";
import ConsorcioEntity from "../entities/consorcioEntity.js";
import AssembleiaRepository from "../repositories/assembleiaRepository.js";
import AssembleiaEntity from "../entities/assembleiaEntity.js";
import { consorcioSchema } from "../schemas/consorcioSchema.js";

export default class ConsorcioController {

    #repositorio;
    #assembleiaRepository;

    constructor() {
        this.#repositorio = new ConsorcioRepository();
        this.#assembleiaRepository = new AssembleiaRepository();
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

    async listarMeus(req, res) {
        try {
            const usu_id = req.usuarioLogado?.id;
            let lista = await this.#repositorio.listarPorAdministrador(usu_id);
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
            let validacao = consorcioSchema.safeParse(req.body);
            if(!validacao.success) {
                return res.status(400).json({
                    msg: "Falha na validação dos dados",
                    erros: validacao.error.format()
                });
            }

            const { nome, quantidadecotas, valorpremio, taxaadministracao, fundoreserva, diaassembleia, datainicio } = validacao.data;
            const usu_id = req.usuarioLogado?.id;

            if(!usu_id) {
                return res.status(401).json({msg: "Usuário não autenticado"});
            }

            const fatorLiquido = 1 - Number(taxaadministracao) - Number(fundoreserva);
            if(fatorLiquido <= 0) {
                return res.status(400).json({msg: "A soma da taxa de administração e do fundo de reserva deve ser menor que 1"});
            }

            const valormensal = Number((Number(valorpremio) / (Number(quantidadecotas) * fatorLiquido)).toFixed(2));

            const inicio = new Date(datainicio);
            const datafim = new Date(inicio);
            datafim.setMonth(datafim.getMonth() + Number(quantidadecotas));
            const datafimStr = datafim.toISOString().slice(0, 10);

            const entidade = new ConsorcioEntity(
                null,
                nome,
                usu_id,
                quantidadecotas,
                valorpremio,
                taxaadministracao,
                fundoreserva,
                valormensal,
                diaassembleia,
                datainicio,
                datafimStr,
                "EM PROCESSO"
            );

            const id = await this.#repositorio.cadastrar(entidade);
            if(!id) {
                throw new Error("Erro ao cadastrar consorcio. Não foi possível persisti-lo no banco de dados");
            }

            await this.#gerarAssembleiasIniciais(id, quantidadecotas, datainicio, diaassembleia);

            return res.status(200).json({
                msg: "Consorcio cadastrado com sucesso",
                con_id: id,
                con_valormensal: valormensal,
                con_datafim: datafimStr
            });
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async #gerarAssembleiasIniciais(con_id, quantidadecotas, datainicio, diaassembleia) {
        const inicio = new Date(datainicio);
        for (let i = 1; i <= quantidadecotas; i++) {
            const dataAssembleia = new Date(inicio);
            dataAssembleia.setMonth(dataAssembleia.getMonth() + (i - 1));
            dataAssembleia.setDate(diaassembleia);
            const dataStr = dataAssembleia.toISOString().slice(0, 10);

            const assembleia = new AssembleiaEntity(null, i, con_id, dataStr, null);
            await this.#assembleiaRepository.cadastrar(assembleia);
        }
    }

    async deletar(req, res) {
        try{
            let {id} = req.params;
            const consorcio = await this.#repositorio.buscarPorId(id);
            if(!consorcio) {
                return res.status(404).json({msg: "Consorcio não encontrado para deleção"});
            }

            if(consorcio.usu_id !== req.usuarioLogado?.id) {
                return res.status(403).json({msg: "Apenas o administrador do consórcio pode excluí-lo"});
            }

            if(await this.#repositorio.deletar(id))
                return res.status(200).json({msg: "Consorcio excluído com sucesso!"});
            else
                throw new Error("Erro ao deletar consorcio no banco de dados");
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async atualizar(req, res) {
        try {
            let {id} = req.params;
            let validacao = consorcioSchema.safeParse(req.body);

            if(!validacao.success) {
                return res.status(400).json({
                    msg: "Falha na validação dos dados ao atualizar",
                    erros: validacao.error.format()
                });
            }

            const consorcio = await this.#repositorio.buscarPorId(id);
            if(!consorcio) {
                return res.status(404).json({msg: "Consorcio não encontrado para alteração"});
            }
            if(consorcio.usu_id !== req.usuarioLogado?.id) {
                return res.status(403).json({msg: "Apenas o administrador do consórcio pode alterá-lo"});
            }

            const { nome, quantidadecotas, valorpremio, taxaadministracao, fundoreserva, diaassembleia, datainicio } = validacao.data;
            const fatorLiquido = 1 - Number(taxaadministracao) - Number(fundoreserva);
            const valormensal = Number((Number(valorpremio) / (Number(quantidadecotas) * fatorLiquido)).toFixed(2));

            const inicio = new Date(datainicio);
            const datafim = new Date(inicio);
            datafim.setMonth(datafim.getMonth() + Number(quantidadecotas));
            const datafimStr = datafim.toISOString().slice(0, 10);

            const entidade = new ConsorcioEntity(
                id,
                nome,
                consorcio.usu_id,
                quantidadecotas,
                valorpremio,
                taxaadministracao,
                fundoreserva,
                valormensal,
                diaassembleia,
                datainicio,
                datafimStr,
                consorcio.status
            );

            if(await this.#repositorio.alterar(entidade))
                res.status(200).json({msg: "Consorcio alterado!"});
            else
                throw new Error("Erro ao alterar consorcio no banco de dados");
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
