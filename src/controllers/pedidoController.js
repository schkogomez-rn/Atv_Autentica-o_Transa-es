const pool = require('../config/db');
const produtoRepository = require('../repositories/produtoRepository');
const pedidoRepository = require('../repositories/pedidoRepository');

const criarPedido = async (req, res) => {
    // 1. Obtém o ID da pessoa através do Token JWT
    const pessoa_id = req.usuario_id;
    const { produto_id, quantidade_solicitada } = req.body;

    // 2. Aluga uma CONEXÃO EXCLUSIVA para garantir a transação
    const conexao_exclusiva = await pool.connect();

    try {
        // 3. Inicia a transação na conexão exclusiva
        await conexao_exclusiva.query('BEGIN');

        // 4. Repassamos a 'conexao_exclusiva' para os repositórios rodarem DENTRO da mesma transação
        const produto = await produtoRepository.buscarPorId(produto_id, conexao_exclusiva);

        if (!produto) {
            throw new Error('Produto não encontrado.');
        }
        if (produto.quantidade_estoque < quantidade_solicitada) {
            throw new Error('Estoque insuficiente.');
        }

        // 5. Operação A: Baixa no estoque
        await produtoRepository.atualizarEstoque(produto_id, quantidade_solicitada, conexao_exclusiva);

        // ==============================================================
        // TESTE DO CAOS: Descomente a linha abaixo para testar o ROLLBACK
        // throw new Error('Servidor falhou antes de registrar o recibo do pedido!');
        // ==============================================================

        // 6. Operação B: Registra o pedido
        const novoPedido = await pedidoRepository.criar(pessoa_id, produto_id, quantidade_solicitada, conexao_exclusiva);

        // 7. Salva permanentemente as duas operações no banco
        await conexao_exclusiva.query('COMMIT');

        res.status(201).json({ mensagem: 'Pedido realizado com sucesso!', pedido: novoPedido });

    } catch (erro) {
        // 8. Desfaz tudo se qualquer linha acima der erro
        await conexao_exclusiva.query('ROLLBACK');
        res.status(400).json({ erro: erro.message });
    } finally {
        // 9. Devolve a conexão exclusiva para o pool
        conexao_exclusiva.release();
    }
};

module.exports = { criarPedido };
