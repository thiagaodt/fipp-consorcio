import CotaRepository from "../repositories/cotaRepository.js";
import CotaEntity from "../entities/cotaEntity.js";
import ConsorcioRepository from "../repositories/consorcioRepository.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import { cotaSchema, cotaVendaSchema } from "../schemas/cotaSchema.js";

export default class CotaController {

    #repositorio;
    #consorcioRepository;
    #usuarioRepository;

    constructor() {
        this.#repositorio = new CotaRepository();
        this.#consorcioRepository = new ConsorcioRepository();
        this.#usuarioRepository = new UsuarioRepository();
    }

    async listar(req, res) {
        try {
            let lista = await this.#repositorio.listar();
            if(lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({msg: "Nenhuma cota foi encontrada!"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async listarPorConsorcio(req, res) {
        try {
            const { con_id } = req.params;
            const lista = await this.#repositorio.listarPorConsorcio(con_id);
            if(lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({msg: "Nenhuma cota encontrada para este consórcio"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async listarMinhas(req, res) {
        try {
            const usu_id = req.usuarioLogado?.id;
            const lista = await this.#repositorio.listarPorUsuario(usu_id);
            if(lista.length > 0) {
                const listaEnriquecida = await Promise.all(lista.map(async (cota) => {
                    const consorcio = await this.#consorcioRepository.buscarPorId(cota.con_id);
                    return {
                        ...cota.toJSON(),
                        con_nome: consorcio ? consorcio.nome : "Desconhecido"
                    };
                }));
                res.status(200).json(listaEnriquecida);
            }
            else
                res.status(404).json({msg: "Nenhuma cota encontrada"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async cadastrar(req, res) {
        try {
            let validacao = cotaVendaSchema.safeParse(req.body);
            if(!validacao.success) {
                return res.status(400).json({
                    msg: "Falha na validação dos dados",
                    erros: validacao.error.format()
                });
            }

            const { con_id, usu_id } = validacao.data;

            const consorcio = await this.#consorcioRepository.buscarPorId(con_id);
            if(!consorcio) {
                return res.status(404).json({msg: "Consórcio não encontrado"});
            }
            if(consorcio.status === "FINALIZADO") {
                return res.status(400).json({msg: "Consórcio finalizado, não é possível adicionar novas cotas"});
            }

            const usuario = await this.#usuarioRepository.buscarPorId(usu_id);
            if(!usuario) {
                return res.status(404).json({msg: "Usuário não encontrado"});
            }

            const cotasExistentes = await this.#repositorio.contarPorConsorcio(con_id);
            if(cotasExistentes >= consorcio.quantidadecotas) {
                return res.status(400).json({msg: "Todas as cotas deste consórcio já foram vendidas"});
            }

            const proximoNumero = cotasExistentes + 1;
            const entidade = new CotaEntity(null, con_id, usu_id, proximoNumero, "REGULAR");
            const id = await this.#repositorio.cadastrar(entidade);
            if(id)
                return res.status(200).json({msg: "Cota cadastrada com sucesso", cot_id: id, cot_numero: proximoNumero});
            else
                throw new Error("Erro ao cadastrar cota. Não foi possível persisti-la no banco de dados");
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
                    return res.status(200).json({msg: "Cota excluída com sucesso!"});
                else
                    throw new Error("Erro ao deletar cota no banco de dados");
            }
            else {
                return res.status(404).json({msg: "Cota não encontrada para deleção"});
            }
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const validacao = cotaSchema.safeParse(req.body);
            if(!validacao.success) {
                return res.status(400).json({
                    msg: "Falha na validação dos dados",
                    erros: validacao.error.format()
                });
            }

            const cotaExistente = await this.#repositorio.buscarPorId(id);
            if(!cotaExistente) {
                return res.status(404).json({msg: "Cota não encontrada para alteração"});
            }

            const { con_id, usu_id, numero, status } = validacao.data;
            const entidade = new CotaEntity(id, con_id, usu_id, numero, status ?? cotaExistente.status);
            if(await this.#repositorio.alterar(entidade))
                return res.status(200).json({msg: "Cota alterada!"});
            else
                throw new Error("Erro ao alterar cota no banco de dados");
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async obterPorId(req, res) {
        try{
            let {id} = req.params;
            let cota = await this.#repositorio.buscarPorId(id);
            if(cota) {
                return res.status(200).json(cota);
            }
            else
                return res.status(404).json({msg: "Cota não encontrada!"});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }
}
