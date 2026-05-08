import SaldoConsorcioRepository from "../repositories/saldoConsorcioRepository.js";
import SaldoAdministradorRepository from "../repositories/saldoAdministradorRepository.js";
import MovimentacaoConsorcioRepository from "../repositories/movimentacaoConsorcioRepository.js";
import MovimentacaoAdministradorRepository from "../repositories/movimentacaoAdministradorRepository.js";
import MovimentacaoAdministradorEntity from "../entities/movimentacaoAdministradorEntity.js";
import ConsorcioRepository from "../repositories/consorcioRepository.js";

export default class SaldoController {

    #saldoConsorcioRepository;
    #saldoAdministradorRepository;
    #movimentacaoConsorcioRepository;
    #movimentacaoAdministradorRepository;
    #consorcioRepository;

    constructor() {
        this.#saldoConsorcioRepository = new SaldoConsorcioRepository();
        this.#saldoAdministradorRepository = new SaldoAdministradorRepository();
        this.#movimentacaoConsorcioRepository = new MovimentacaoConsorcioRepository();
        this.#movimentacaoAdministradorRepository = new MovimentacaoAdministradorRepository();
        this.#consorcioRepository = new ConsorcioRepository();
    }

    async obterSaldoConsorcio(req, res) {
        try {
            const { con_id } = req.params;
            const consorcio = await this.#consorcioRepository.buscarPorId(con_id);
            if(!consorcio) {
                return res.status(404).json({msg: "Consórcio não encontrado"});
            }
            const saldo = await this.#saldoConsorcioRepository.buscarPorConsorcio(con_id);
            return res.status(200).json(saldo ?? { con_id: Number(con_id), valor: 0 });
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async listarMovimentacoesConsorcio(req, res) {
        try {
            const { con_id } = req.params;
            const lista = await this.#movimentacaoConsorcioRepository.listarPorConsorcio(con_id);
            if(lista.length > 0)
                return res.status(200).json(lista);
            return res.status(404).json({msg: "Nenhuma movimentação encontrada"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async obterMeuSaldoAdministrador(req, res) {
        try {
            const usu_id = req.usuarioLogado?.id;
            const saldo = await this.#saldoAdministradorRepository.buscarPorUsuario(usu_id);
            return res.status(200).json(saldo ?? { usu_id, valor: 0 });
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async listarMinhasMovimentacoesAdministrador(req, res) {
        try {
            const usu_id = req.usuarioLogado?.id;
            const lista = await this.#movimentacaoAdministradorRepository.listarPorUsuario(usu_id);
            if(lista.length > 0)
                return res.status(200).json(lista);
            return res.status(404).json({msg: "Nenhuma movimentação encontrada"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async sacarSaldoAdministrador(req, res) {
        try {
            const { valor } = req.body;
            const usu_id = req.usuarioLogado?.id;

            const valorNumerico = Number(valor);
            if(!valorNumerico || valorNumerico <= 0) {
                return res.status(400).json({msg: "Valor de saque inválido"});
            }

            const saldo = await this.#saldoAdministradorRepository.buscarPorUsuario(usu_id);
            if(!saldo || Number(saldo.valor) < valorNumerico) {
                return res.status(400).json({msg: "Saldo insuficiente para saque"});
            }

            const sucesso = await this.#saldoAdministradorRepository.debitar(usu_id, valorNumerico);
            if(!sucesso) {
                throw new Error("Falha ao debitar saldo do administrador");
            }

            const movimentacao = new MovimentacaoAdministradorEntity(
                null,
                usu_id,
                null,
                null,
                "SAQUE",
                valorNumerico,
                new Date()
            );
            await this.#movimentacaoAdministradorRepository.cadastrar(movimentacao);

            return res.status(200).json({msg: "Saque realizado com sucesso", valor: valorNumerico});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: exception.message});
        }
    }
}
