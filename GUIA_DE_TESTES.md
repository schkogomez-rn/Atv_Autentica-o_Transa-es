# Guia Prático de Testes: API com Autenticação JWT e Transações SQL

Este guia contém o passo a passo completo para executar e validar as rotas da API, testar a autenticação com JWT e comprovar o funcionamento das transações SQL (`BEGIN`, `COMMIT` e `ROLLBACK`) utilizando o **Thunder Client** (ou Postman/Insomnia).

---

## 🛠️ 1. Pré-requisitos

1. **Banco de Dados PostgreSQL:**
   - Certifique-se de que o serviço do PostgreSQL está em execução.
   - O banco de dados definido no arquivo `.env` (ex: `atv_transacoes`) deve estar criado.
   - Execute o script `schema.sql` no banco de dados para criar as tabelas e os dados de teste iniciais.

2. **Iniciar o Servidor:**
   No terminal, execute o comando:
   ```bash
   node server.js
   # ou com recarregamento automático:
   npm run dev
   ```
   *Mensagem esperada no console:* `Servidor rodando na porta 3000`.

---

## 🔑 2. Teste 1: Autenticação e Obtenção do Token JWT

> **Objetivo:** Autenticar com o usuário inserido pelo `schema.sql` e receber o token JWT.

- **Método:** `POST`
- **URL:** `http://localhost:3000/pessoas/login`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "email": "admin@empresa.com",
    "senha": "admin123"
  }
  ```

### Resultado Esperado:
- **Status:** `200 OK`
- **Resposta:**
  ```json
  {
    "mensagem": "Login realizado com sucesso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```
> **Atenção:** Copie todo o conteúdo do `token` (sem as aspas) para utilizar nos próximos testes.

---

## 🛒 3. Teste 2: Realizar Pedido (Transação com `COMMIT`)

> **Objetivo:** Fazer um pedido protegido por autenticação, garantindo que o pedido é registrado e o estoque é atualizado simultaneamente dentro de uma transação.

- **Método:** `POST`
- **URL:** `http://localhost:3000/pedidos`
- **Autenticação:**
  - No Thunder Client, abra a aba **Auth**.
  - Selecione **Bearer Token**.
  - Cole o token copiado no Teste 1 no campo **Token**.
- **Body (JSON):**
  ```json
  {
    "produto_id": 1,
    "quantidade_solicitada": 5
  }
  ```

### Resultado Esperado:
- **Status:** `201 Created`
- **Resposta:**
  ```json
  {
    "mensagem": "Pedido realizado com sucesso!",
    "pedido": {
      "id": 1,
      "pessoa_id": 1,
      "produto_id": 1,
      "quantidade": 5,
      "criado_em": "2026-10-27T..."
    }
  }
  ```

### Verificação no Banco de Dados:
Execute no seu cliente SQL:
```sql
SELECT * FROM produtos WHERE id = 1;
SELECT * FROM pedidos;
```
- O produto ID 1 ("Papel A4") que possuía 50 unidades agora terá **45 unidades**.
- A tabela `pedidos` terá o novo pedido registrado com sucesso.

---

## 💥 4. Teste 3: A Prova de Fogo da Transação (Testando o `ROLLBACK`)

> **Objetivo:** Comprovar a atomicidade da transação. Se houver falha após debitar o estoque mas antes de salvar o pedido, a transação deve ser desfeita por completo (`ROLLBACK`), mantendo a integridade do banco.

### Passo 1: Simular a Falha no Código
1. Abra o arquivo `src/controllers/pedidoController.js`.
2. Localize o bloco do **TESTE DO CAOS** (por volta da linha 30) e **descomente** a linha do erro:
   ```javascript
   // ==============================================================
   // TESTE DO CAOS: Descomente a linha abaixo para testar o ROLLBACK
   throw new Error('Servidor falhou antes de registrar o recibo do pedido!');
   // ==============================================================
   ```
3. Salve o arquivo. *(Se estiver usando `node server.js`, reinicie o servidor no terminal. Se estiver usando `npm run dev`, ele reiniciará automaticamente).*

### Passo 2: Executar a Requisição
1. Volte ao Thunder Client na mesma requisição do **Teste 2** (`POST http://localhost:3000/pedidos`).
2. Clique em **Send** novamente para tentar comprar mais 5 unidades.

### Resultado Esperado:
- **Status:** `400 Bad Request`
- **Resposta:**
  ```json
  {
    "erro": "Servidor falhou antes de registrar o recibo do pedido!"
  }
  ```

### A Mágica da Transação (Conferência no Banco):
Execute no seu banco de dados:
```sql
SELECT * FROM produtos WHERE id = 1;
```
- **O estoque continuará exatamente em 45 unidades!**
- Mesmo que a query de `UPDATE` tenha sido executada no código, a falha disparou o bloco `catch`, que executou `conexao_exclusiva.query('ROLLBACK')`. O banco de dados descartou as alterações e não salvou a baixa do estoque.

---

## 🧹 5. Finalização

Após concluir o teste de Rollback, retorne ao arquivo `src/controllers/pedidoController.js` e comente novamente a linha do erro:
```javascript
// ==============================================================
// TESTE DO CAOS: Descomente a linha abaixo para testar o ROLLBACK
// throw new Error('Servidor falhou antes de registrar o recibo do pedido!');
// ==============================================================
```
Salve o arquivo para que a API volte a processar pedidos normalmente.
