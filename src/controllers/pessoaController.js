const pessoaRepository = require('../repositories/pessoaRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const pessoa = await pessoaRepository.buscarPorEmail(email);

        if (!pessoa || !(await bcrypt.compare(senha, pessoa.senha_hash))) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: pessoa.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ mensagem: 'Login realizado com sucesso', token });
    } catch (erro) {
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

module.exports = { login };
