**Projeto: API em Camadas com Autenticação JWT e Transações SQL** **Documentação de Implementação**

1. Visão Geral

Implementar API Node.js/Express com PostgreSQL, autenticação JWT, arquitetura em camadas (Controller, Repository, Middleware) e controle transacional para pedidos.

2. Escopo

Login JWT, cadastro e consulta de entidades, controle de estoque, criação de pedidos com COMMIT/ROLLBACK e testes.

3. Estrutura do Projeto

src/config, src/controllers, src/repositories, src/routes, src/middlewares e banco PostgreSQL.

4. Requisitos Técnicos

Node.js, Express, PostgreSQL, pg, bcrypt, jsonwebtoken, dotenv.

5. Plano de Implementação

Preparar banco, criar repositórios, implementar autenticação, implementar transações, validar rotas e executar testes.

6. Plano de Testes

Teste de login, acesso protegido, pedido válido, estoque insuficiente e rollback simulado.

7. Critérios de Aceite

JWT funcional, estoque atualizado corretamente, rollback restaurando dados em falhas e rotas respondendo conforme esperado.

8. Checklist de Entrega

Banco configurado, variáveis .env, APIs publicadas, documentação e testes executados.
