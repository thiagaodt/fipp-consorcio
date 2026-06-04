import AssembleiaRepository from "../repositories/assembleiaRepository.js";
import AssembleiaEntity from "../entities/assembleiaEntity.js";
import ConsorcioRepository from "../repositories/consorcioRepository.js";
import CotaRepository from "../repositories/cotaRepository.js";
import PagamentoRepository from "../repositories/pagamentoRepository.js";
import SaldoConsorcioRepository from "../repositories/saldoConsorcioRepository.js";
import MovimentacaoConsorcioRepository from "../repositories/movimentacaoConsorcioRepository.js";
import MovimentacaoConsorcioEntity from "../entities/movimentacaoConsorcioEntity.js";
import { assembleiaSchema } from "../schemas/assembleiaSchema.js";

export default class AssembleiaController {
  #repositorio;
  #consorcioRepository;
  #cotaRepository;
  #pagamentoRepository;
  #saldoConsorcioRepository;
  #movimentacaoConsorcioRepository;

  constructor() {
    this.#repositorio = new AssembleiaRepository();
    this.#consorcioRepository = new ConsorcioRepository();
    this.#cotaRepository = new CotaRepository();
    this.#pagamentoRepository = new PagamentoRepository();
    this.#saldoConsorcioRepository = new SaldoConsorcioRepository();
    this.#movimentacaoConsorcioRepository =
      new MovimentacaoConsorcioRepository();
  }

  async listar(req, res) {
    try {
      let lista = await this.#repositorio.listar();
      if (lista.length > 0) res.status(200).json(lista);
      else res.status(404).json({ msg: "Nenhuma assembleia foi encontrada!" });
    } catch (exception) {
      console.log(exception);
      res.status(500).json({ msg: "Erro ao processar requisição" });
    }
  }

  async listarPorConsorcio(req, res) {
    try {
      const { con_id } = req.params;
      const lista = await this.#repositorio.listarPorConsorcio(con_id);
      if (lista.length > 0) res.status(200).json(lista);
      else
        res
          .status(404)
          .json({ msg: "Nenhuma assembleia encontrada para este consórcio" });
    } catch (exception) {
      console.log(exception);
      res.status(500).json({ msg: "Erro ao processar requisição" });
    }
  }

  async cadastrar(req, res) {
    try {
      let validacao = assembleiaSchema.safeParse(req.body);
      if (!validacao.success) {
        return res.status(400).json({
          msg: "Falha na validação dos dados",
          erros: validacao.error.format(),
        });
      }
      const { numero, con_id, data, cot_id } = validacao.data;
      const entidade = new AssembleiaEntity(
        null,
        numero,
        con_id,
        data,
        cot_id ?? null,
      );
      const id = await this.#repositorio.cadastrar(entidade);
      if (id)
        return res
          .status(200)
          .json({ msg: "Assembleia cadastrada com sucesso", ass_id: id });
      else
        throw new Error(
          "Erro ao cadastrar assembleia. Não foi possível persisti-la no banco de dados",
        );
    } catch (exception) {
      console.log(exception);
      return res.status(500).json({ msg: exception.message });
    }
  }

  async deletar(req, res) {
    try {
      let { id } = req.params;
      if (await this.#repositorio.buscarPorId(id)) {
        if (await this.#repositorio.deletar(id))
          return res
            .status(200)
            .json({ msg: "Assembleia excluída com sucesso!" });
        else throw new Error("Erro ao deletar assembleia no banco de dados");
      } else {
        return res
          .status(404)
          .json({ msg: "Assembleia não encontrada para deleção" });
      }
    } catch (exception) {
      console.log(exception);
      return res.status(500).json({ msg: exception.message });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const validacao = assembleiaSchema.safeParse(req.body);
      if (!validacao.success) {
        return res.status(400).json({
          msg: "Falha na validação dos dados",
          erros: validacao.error.format(),
        });
      }
      const existente = await this.#repositorio.buscarPorId(id);
      if (!existente) {
        return res
          .status(404)
          .json({ msg: "Assembleia não encontrada para alteração" });
      }
      const { numero, con_id, data, cot_id } = validacao.data;
      const entidade = new AssembleiaEntity(
        id,
        numero,
        con_id,
        data,
        cot_id ?? existente.cot_id,
      );
      if (await this.#repositorio.alterar(entidade))
        return res.status(200).json({ msg: "Assembleia alterada!" });
      else throw new Error("Erro ao alterar assembleia no banco de dados");
    } catch (exception) {
      console.log(exception);
      return res.status(500).json({ msg: exception.message });
    }
  }

  async obterPorId(req, res) {
    try {
      let { id } = req.params;
      let assembleia = await this.#repositorio.buscarPorId(id);
      if (assembleia) {
        return res.status(200).json(assembleia);
      } else return res.status(404).json({ msg: "Assembleia não encontrada!" });
    } catch (exception) {
      console.log(exception);
      return res.status(500).json({ msg: exception.message });
    }
  }

  async statusAssembleiaCorrente(req, res) {
    try {
      const { con_id } = req.params;
      const consorcio = await this.#consorcioRepository.buscarPorId(con_id);
      if (!consorcio) {
        return res.status(404).json({ msg: "Consórcio não encontrado" });
      }

      const assembleia =
        await this.#repositorio.buscarAssembleiaCorrente(con_id);
      if (!assembleia) {
        return res
          .status(404)
          .json({ msg: "Não há assembleia em aberto para este consórcio" });
      }

      const totalCotas = await this.#cotaRepository.contarPorConsorcio(con_id);
      const pagamentos = await this.#pagamentoRepository.listarPorAssembleia(
        assembleia.id,
      );
      const confirmadas = pagamentos.filter(
        (p) => p.status === "CONFIRMADO",
      ).length;

      return res.status(200).json({
        assembleia,
        totalCotas,
        pagamentosConfirmados: confirmadas,
        podeRealizarSorteio: confirmadas >= totalCotas && totalCotas > 0,
      });
    } catch (exception) {
      console.log(exception);
      return res.status(500).json({ msg: exception.message });
    }
  }

  async realizarAssembleia(req, res) {
    try {
      const { id } = req.params;
      const assembleia = await this.#repositorio.buscarPorId(id);
      if (!assembleia) {
        return res.status(404).json({ msg: "Assembleia não encontrada" });
      }
      if (assembleia.cot_id) {
        return res
          .status(400)
          .json({ msg: "Esta assembleia já foi realizada" });
      }

      const consorcio = await this.#consorcioRepository.buscarPorId(
        assembleia.con_id,
      );
      if (!consorcio) {
        return res.status(404).json({ msg: "Consórcio não encontrado" });
      }
      if (consorcio.usu_id !== req.usuarioLogado?.id) {
        return res
          .status(403)
          .json({
            msg: "Apenas o administrador do consórcio pode realizar a assembleia",
          });
      }

      const totalCotas = await this.#cotaRepository.contarPorConsorcio(
        consorcio.id,
      );
      if (totalCotas <= 0) {
        return res
          .status(400)
          .json({ msg: "O consórcio não possui cotas vendidas" });
      }
      const todasPagas =
        await this.#pagamentoRepository.todasConfirmadasNaAssembleia(
          id,
          totalCotas,
        );
      if (!todasPagas) {
        return res
          .status(400)
          .json({
            msg: "Nem todas as cotas estão com pagamento confirmado para esta assembleia",
          });
      }

      const naoContempladas = await this.#cotaRepository.listarNaoContempladas(
        consorcio.id,
      );
      if (naoContempladas.length === 0) {
        return res
          .status(400)
          .json({ msg: "Não há cotas elegíveis para sorteio" });
      }

      const sorteada =
        naoContempladas[Math.floor(Math.random() * naoContempladas.length)];

      const saldoConsorcio =
        await this.#saldoConsorcioRepository.buscarPorConsorcio(consorcio.id);
      if (
        !saldoConsorcio ||
        Number(saldoConsorcio.valor) < Number(consorcio.valorpremio)
      ) {
        return res
          .status(400)
          .json({ msg: "Saldo do consórcio insuficiente para pagar o prêmio" });
      }

      const debito = await this.#saldoConsorcioRepository.debitar(
        consorcio.id,
        consorcio.valorpremio,
      );
      if (!debito) {
        return res
          .status(500)
          .json({ msg: "Falha ao debitar prêmio do saldo do consórcio" });
      }

      await this.#repositorio.definirCotaContemplada(id, sorteada.id);
      await this.#cotaRepository.alterarStatus(sorteada.id, "CONTEMPLADA");

      const movimentacao = new MovimentacaoConsorcioEntity(
        null,
        consorcio.id,
        null,
        id,
        "SAIDA",
        consorcio.valorpremio,
        new Date(),
      );
      await this.#movimentacaoConsorcioRepository.cadastrar(movimentacao);

      const totalAssembleias = await this.#repositorio.contarPorConsorcio(
        consorcio.id,
      );
      const assembleiasRealizadas = (
        await this.#repositorio.listarPorConsorcio(consorcio.id)
      ).filter((a) => a.cot_id !== null && a.cot_id !== undefined).length;
      if (assembleiasRealizadas >= totalAssembleias) {
        await this.#consorcioRepository.alterarStatus(
          consorcio.id,
          "FINALIZADO",
        );
      }

      return res.status(200).json({
        msg: "Assembleia realizada com sucesso",
        ass_id: Number(id),
        cot_contemplada: sorteada.id,
        cot_numero: sorteada.numero,
        valorpremio: consorcio.valorpremio,
      });
    } catch (exception) {
      console.log(exception);
      return res.status(500).json({ msg: exception.message });
    }
  }
}
