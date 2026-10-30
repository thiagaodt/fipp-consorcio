import UsuarioEntity from "../entities/usuarioEntity.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import { usuarioSchema, usuarioAtualizarSchema } from "../schemas/usuarioSchema.js";
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

    async listarTodos(req, res) {
        try {
            let lista = await this.#repositorio.listarTodos();
            res.status(200).json(lista);
        }
        catch(exception) {
            console.log(exception);
            res.status(500).json({msg: "Erro ao processar requisição"});
        }
    }

    async toggleAtivo(req, res) {
        try {
            const { id } = req.params;
            const usuario = await this.#repositorio.buscarPorId(id);
            if(!usuario) {
                return res.status(404).json({msg: "Usuário não encontrado"});
            }
            if(usuario.id === req.usuarioLogado?.id) {
                return res.status(400).json({msg: "Não é possível alterar o próprio status"});
            }
            const novoAtivo = usuario.ativo === 'S' ? 'N' : 'S';
            await this.#repositorio.alterarAtivo(id, novoAtivo);
            return res.status(200).json({ msg: `Usuário ${novoAtivo === 'S' ? 'reativado' : 'desativado'} com sucesso`, ativo: novoAtivo });
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: exception.message});
        }
    }

    async cadastrar(req, res) {
        try {
            let validacao = usuarioSchema.safeParse(req.body);
            if(validacao.success) {
                let { nome, email, senha, perfil } = validacao.data;
                // Só um administrador logado pode criar outro administrador.
                const ehAdmin = req.usuarioLogado?.perfil === 'ADMINISTRADOR';
                let bcrypt = new Bcrypt();
                let hash = await bcrypt.hash(senha);
                let entidade = new UsuarioEntity(null, nome, email, hash, 'S', ehAdmin ? (perfil ?? 'PADRAO') : 'PADRAO');
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
            let { id } = req.params;
            // Usuário comum só altera o próprio cadastro e não muda o próprio perfil.
            const ehAdmin = req.usuarioLogado?.perfil === 'ADMINISTRADOR';
            if(!ehAdmin && String(req.usuarioLogado?.id) !== String(id)) {
                return res.status(403).json({msg: "Você só pode alterar o próprio cadastro"});
            }
            let validacao = usuarioAtualizarSchema.safeParse(req.body);
            if(validacao.success) {
                let existente = await this.#repositorio.buscarPorId(id);
                if(existente) {
                    let bcrypt = new Bcrypt();
                    let hash = validacao.data.senha
                        ? await bcrypt.hash(validacao.data.senha)
                        : existente.senha;
                    let entidade = new UsuarioEntity(id, validacao.data.nome, validacao.data.email, hash, existente.ativo, ehAdmin ? (validacao.data.perfil ?? existente.perfil) : existente.perfil);
                    if(await this.#repositorio.alterar(entidade))
                        res.status(200).json({msg: "Usuario alterado!", usuario: { id, nome: validacao.data.nome, email: validacao.data.email }});
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