import PagamentoRepository from "../repositories/pagamentoRepository.js";
import PagamentoEntity from "../entities/pagamentoEntity.js";
import CotaRepository from "../repositories/cotaRepository.js";
import ConsorcioRepository from "../repositories/consorcioRepository.js";
import AssembleiaRepository from "../repositories/assembleiaRepository.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import SaldoConsorcioRepository from "../repositories/saldoConsorcioRepository.js";
import SaldoAdministradorRepository from "../repositories/saldoAdministradorRepository.js";
import MovimentacaoConsorcioRepository from "../repositories/movimentacaoConsorcioRepository.js";
import MovimentacaoConsorcioEntity from "../entities/movimentacaoConsorcioEntity.js";
import MovimentacaoAdministradorRepository from "../repositories/movimentacaoAdministradorRepository.js";
import MovimentacaoAdministradorEntity from "../entities/movimentacaoAdministradorEntity.js";
import { pagamentoSchema, pagamentoGerarPixSchema, webhookSchema } from "../schemas/pagamentoSchema.js";
import AbacatePay from "../utils/abacatePay.js";
import crypto from "crypto";

// Compara o segredo do webhook em tempo constante.
function segredoConfere(recebido, esperado) {
    const a = Buffer.from(String(recebido ?? ""));
    const b = Buffer.from(String(esperado));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default class PagamentoController {

    #repositorio;
    #cotaRepository;
    #consorcioRepository;
    #assembleiaRepository;
    #usuarioRepository;
    #saldoConsorcioRepository;
    #saldoAdministradorRepository;
    #movimentacaoConsorcioRepository;
    #movimentacaoAdministradorRepository;
    #abacatePay;

    constructor() {
        this.#repositorio = new PagamentoRepository();
        this.#cotaRepository = new CotaRepository();
        this.#consorcioRepository = new ConsorcioRepository();
        this.#assembleiaRepository = new AssembleiaRepository();
        this.#usuarioRepository = new UsuarioRepository();
        this.#saldoConsorcioRepository = new SaldoConsorcioRepository();
        this.#saldoAdministradorRepository = new SaldoAdministradorRepository();
        this.#movimentacaoConsorcioRepository = new MovimentacaoConsorcioRepository();
        this.#movimentacaoAdministradorRepository = new MovimentacaoAdministradorRepository();
        this.#abacatePay = new AbacatePay();
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

    async listarPorCota(req, res) {
        try {
            const { cot_id } = req.params;
            const lista = await this.#repositorio.listarPorCota(cot_id);
            if(lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({msg: "Nenhum pagamento encontrado para esta cota"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async listarPorAssembleia(req, res) {
        try {
            const { ass_id } = req.params;
            const lista = await this.#repositorio.listarPorAssembleia(ass_id);
            if(lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({msg: "Nenhum pagamento encontrado para esta assembleia"});
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async cadastrar(req, res) {
        try {
            const validacao = pagamentoSchema.safeParse(req.body);
            if(!validacao.success) {
                return res.status(400).json({
                    msg: "Falha na validação dos dados",
                    erros: validacao.error.format()
                });
            }
            const { cot_id, ass_id, valor, status } = validacao.data;
            const entidade = new PagamentoEntity(null, cot_id, ass_id, status ?? "PENDENTE", new Date(), null, valor);
            const id = await this.#repositorio.cadastrar(entidade);
            if(id)
                return res.status(200).json({msg: "Pagamento cadastrado com sucesso", pag_id: id});
            else
                throw new Error("Erro ao cadastrar pagamento. Não foi possível persisti-lo no banco de dados");
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
                    throw new Error("Erro ao deletar pagamento no banco de dados");
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
            const { id } = req.params;
            const validacao = pagamentoSchema.safeParse(req.body);
            if(!validacao.success) {
                return res.status(400).json({
                    msg: "Falha na validação dos dados",
                    erros: validacao.error.format()
                });
            }
            const existente = await this.#repositorio.buscarPorId(id);
            if(!existente) {
                return res.status(404).json({msg: "Pagamento não encontrado para alteração"});
            }
            const { cot_id, ass_id, valor, status } = validacao.data;
            const entidade = new PagamentoEntity(
                id,
                cot_id,
                ass_id,
                status ?? existente.status,
                existente.datageracao,
                existente.datapagamento,
                valor
            );
            if(await this.#repositorio.alterar(entidade))
                return res.status(200).json({msg: "Pagamento alterado!"});
            else
                throw new Error("Erro ao alterar pagamento no banco de dados");
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

    async gerarPix(req, res) {
        try {
            const validacao = pagamentoGerarPixSchema.safeParse(req.body);
            if(!validacao.success) {
                return res.status(400).json({
                    msg: "Falha na validação dos dados",
                    erros: validacao.error.format()
                });
            }
            const { cot_id, ass_id } = validacao.data;

            const cota = await this.#cotaRepository.buscarPorId(cot_id);
            if(!cota) {
                return res.status(404).json({msg: "Cota não encontrada"});
            }
            if(cota.usu_id !== req.usuarioLogado?.id) {
                return res.status(403).json({msg: "Apenas o titular da cota pode gerar o pagamento"});
            }

            const assembleia = await this.#assembleiaRepository.buscarPorId(ass_id);
            if(!assembleia) {
                return res.status(404).json({msg: "Assembleia não encontrada"});
            }
            if(assembleia.con_id !== cota.con_id) {
                return res.status(400).json({msg: "Assembleia não pertence ao consórcio da cota"});
            }

            const consorcio = await this.#consorcioRepository.buscarPorId(cota.con_id);
            if(!consorcio) {
                return res.status(404).json({msg: "Consórcio não encontrado"});
            }
            if(consorcio.status === "FINALIZADO") {
                return res.status(400).json({msg: "Consórcio já finalizado"});
            }

            const pagamentoExistente = await this.#repositorio.buscarPorCotaEAssembleia(cot_id, ass_id);
            if(pagamentoExistente && pagamentoExistente.status === "CONFIRMADO") {
                return res.status(400).json({msg: "Pagamento desta parcela já foi confirmado"});
            }

            const valor = Number(consorcio.valormensal);
            let pag_id;

            if(pagamentoExistente) {
                pag_id = pagamentoExistente.id;
            }
            else {
                const novo = new PagamentoEntity(null, cot_id, ass_id, "PENDENTE", new Date(), null, valor);
                pag_id = await this.#repositorio.cadastrar(novo);
                if(!pag_id) {
                    throw new Error("Não foi possível registrar o pagamento");
                }
            }

            const usuario = await this.#usuarioRepository.buscarPorId(cota.usu_id);

            let pixData;
            try {
                pixData = await this.#abacatePay.criarQrCodePix({
                    amount: Math.round(valor * 100),
                    expiresIn: 3600,
                    description: `Parcela ${assembleia.numero} - ${consorcio.nome}`,
                    customer: undefined,
                    externalId: pag_id
                });
            }
            catch(integracaoErro) {
                console.log(integracaoErro);
                return res.status(502).json({msg: "Falha na integração com AbacatePay", detalhe: integracaoErro.message});
            }

            // Guarda o id do PIX para a verificação e o webhook consultarem o AbacatePay pelo id certo.
            const abacateId = pixData?.data?.id ?? pixData?.id;
            if(abacateId) {
                await this.#repositorio.registrarAbacateId(pag_id, abacateId);
            }

            return res.status(200).json({
                msg: "PIX gerado com sucesso",
                pag_id,
                valor,
                pix: pixData
            });
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async webhook(req, res) {
        try {
            // O AbacatePay chama a URL cadastrada com ?webhookSecret=<segredo>.
            const segredo = process.env.ABACATE_WEBHOOK_SECRET;
            if(!segredo) {
                return res.status(503).json({msg: "Webhook não configurado (ABACATE_WEBHOOK_SECRET)"});
            }
            if(!segredoConfere(req.query.webhookSecret, segredo)) {
                return res.status(401).json({msg: "Webhook não autorizado"});
            }

            const externalId = req.body?.data?.pixQrCode?.externalId
                            ?? req.body?.data?.externalId
                            ?? req.body?.externalId
                            ?? req.body?.pag_id;
            const status = req.body?.data?.pixQrCode?.status
                        ?? req.body?.data?.status
                        ?? req.body?.status;

            const validacao = webhookSchema.safeParse({
                pag_id: Number(externalId),
                status: status
            });
            if(!validacao.success) {
                return res.status(400).json({
                    msg: "Payload do webhook inválido",
                    erros: validacao.error.format()
                });
            }

            const { pag_id } = validacao.data;
            const pagamento = await this.#repositorio.buscarPorId(pag_id);
            if(!pagamento) {
                return res.status(404).json({msg: "Pagamento não encontrado"});
            }
            if(pagamento.status === "CONFIRMADO") {
                return res.status(200).json({msg: "Pagamento já estava confirmado"});
            }

            const statusNormalizado = String(status ?? "").toUpperCase();
            const eventoConfirmacao = ["CONFIRMADO", "PAID", "APPROVED", "COMPLETED"].includes(statusNormalizado);
            if(!eventoConfirmacao) {
                return res.status(200).json({msg: "Evento ignorado", status: statusNormalizado});
            }

            // Confirma direto no AbacatePay antes de liberar o saldo.
            if(!pagamento.abacateid) {
                return res.status(409).json({msg: "Pagamento sem PIX registrado"});
            }
            const situacao = await this.#abacatePay.verificarStatusPix(pagamento.abacateid);
            if(situacao?.status !== "PAID") {
                return res.status(409).json({msg: "O AbacatePay ainda não confirma este pagamento", status: situacao?.status});
            }

            await this.#repositorio.confirmarPagamento(pag_id, new Date());
            await this.#aplicarDivisao(pagamento);

            return res.status(200).json({msg: "Pagamento confirmado e saldos atualizados"});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async verificarPagamento(req, res) {
        try {
            const { pag_id } = req.query;
            if (!pag_id) {
                return res.status(400).json({msg: "pag_id é obrigatório"});
            }

            const pagamento = await this.#repositorio.buscarPorId(pag_id);
            if (!pagamento) {
                return res.status(404).json({msg: "Pagamento não encontrado"});
            }
            if (pagamento.status === "CONFIRMADO") {
                return res.status(200).json({status: "PAID", confirmado: true});
            }
            // Usa o id do PIX gravado no pagamento, nunca um id vindo do navegador.
            if (!pagamento.abacateid) {
                return res.status(409).json({msg: "Pagamento sem PIX registrado"});
            }

            let abacateStatus;
            try {
                abacateStatus = await this.#abacatePay.verificarStatusPix(pagamento.abacateid);
            } catch (err) {
                return res.status(502).json({msg: "Falha ao consultar AbacatePay", detalhe: err.message});
            }

            if (abacateStatus?.status === "PAID") {
                await this.#repositorio.confirmarPagamento(Number(pag_id), new Date());
                await this.#aplicarDivisao(pagamento);
                return res.status(200).json({status: "PAID", confirmado: true});
            }

            return res.status(200).json({status: abacateStatus?.status ?? "PENDING", confirmado: false});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async simularDev(req, res) {
        try {
            const { abacate_id } = req.body;
            if (!abacate_id) {
                return res.status(400).json({msg: "abacate_id é obrigatório"});
            }
            await this.#abacatePay.simularPagamento(abacate_id);
            return res.status(200).json({msg: "Pagamento simulado no AbacatePay com sucesso"});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async #aplicarDivisao(pagamento) {
        const cota = await this.#cotaRepository.buscarPorId(pagamento.cot_id);
        if(!cota) throw new Error("Cota associada ao pagamento não encontrada");
        const consorcio = await this.#consorcioRepository.buscarPorId(cota.con_id);
        if(!consorcio) throw new Error("Consórcio associado ao pagamento não encontrado");

        const valor = Number(pagamento.valor);
        const taxa = Number(consorcio.taxaadministracao);
        const reserva = Number(consorcio.fundoreserva);

        const taxaAdm = Number((valor * taxa).toFixed(2));
        const fundoReserva = Number((valor * reserva).toFixed(2));
        const fundoPremio = Number((valor - taxaAdm - fundoReserva).toFixed(2));

        const valorConsorcio = Number((fundoPremio + fundoReserva).toFixed(2));
        const agora = new Date();

        await this.#saldoConsorcioRepository.creditar(consorcio.id, valorConsorcio);
        await this.#saldoAdministradorRepository.creditar(consorcio.usu_id, taxaAdm);

        const movConsorcio = new MovimentacaoConsorcioEntity(
            null,
            consorcio.id,
            pagamento.id,
            pagamento.ass_id,
            "ENTRADA",
            valorConsorcio,
            agora
        );
        await this.#movimentacaoConsorcioRepository.cadastrar(movConsorcio);

        const movAdm = new MovimentacaoAdministradorEntity(
            null,
            consorcio.usu_id,
            consorcio.id,
            pagamento.id,
            "CREDITO",
            taxaAdm,
            agora
        );
        await this.#movimentacaoAdministradorRepository.cadastrar(movAdm);
    }
}
