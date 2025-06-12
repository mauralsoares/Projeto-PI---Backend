# Ver pasta Documentação_api_DSN:
- Estrutura da base de dados em pdf
- Documentação Postman em pdf
- Link Para documentação Postman publicada online (Documentação_API.txt)
- estrutura actual de pastas do projecto em txt

Realizado por:

Ana-Maria Straistari | asian3@iscte-iul.pt | @straistariam | Developer
Maura Lopes deAlmeida Soares |  mldass@iscte-iul.pt | @mauralsoares | ProductOwner
Tomáss Miguel Cunha Manarte | tmcme@iscte-iul.pt @Tomas-Manarte | ScrumMaster



# Final Project
## Programação para Web e Desenvolvimento de Software para a Nuvem

### Backend application NodeJS + ExpressJS + MongoDB.


[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) [![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)](https://nodejs.org/) [![Express.js](https://img.shields.io/badge/Express.js-4.18-black?logo=express)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com/) [![Docker](https://img.shields.io/badge/Docker-24.0-blue?logo=docker)](https://www.docker.com/) [![Version](https://img.shields.io/badge/Version-1.0-blue)](https://semver.org/)


1. Clone este repositório em sua máquina usando o seguinte comando:
```bash
git clone git@github.com:StorThiago/dsa-backend.git
```


2. Entre no repositório clonado
```bash
cd dsa-backend/
```


3. Crie o arquivo `.env` que armazena variáveis sensíveis/configuration a partir do exemplo:
```bash
cd dsa-backend/backend/ && cp .env.example .env
```


4. Crie a network caso não exista
```bash
docker network create --driver bridge dsa-network
```


5. Setting as variáveis de ambiente (nome da base, user e pass do user da sua app) e acesso ao Mongo em:
```bash
- MONGO_INITDB_DATABASE=
- MONGO_INITDB_ROOT_PASSWORD=
- MONGO_INITDB_PASSWORD=
```


6. No diretório raiz do projeto, execute o seguinte comando para instalar as dependências:
```bash
docker-compose up -d --build
```


7. A aplicação está ouvindo em:
http://localhost:3000/


8. API References
Registar novo usuário
```html
POST /api/auth/register
```
```json
{
  "name": "Usuario Teste",
  "email": "teste@email.com",
  "password": "senhaSegura123"
}
```

Fazer login
```html
POST /api/auth/register
```
```json
{
  "email": "teste@example.com",
  "password": "123456"
}
```

## Folder struture

```bash
dsa-backend/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   └── config/
│   │       └── db.js
│   └── .env
└── mongo-init.js
```


```bash
dsa-backend/
├── docker-compose.yml          # Configuração do ambiente Docker
├── backend/                    # Pasta do aplicativo Node.js
└── mongo-init.js               # Script de inicialização do MongoDB
```


## Arquivos Raiz
### docker-compose.yml
- **Função**: Orquestra os containers Docker (Node.js + MongoDB)
- **Contém**:
  - Definição de serviços (backend e MongoDB)
  - Configurações de rede, volumes e variáveis de ambiente
- **Importância**: Permite rodar todo o ambiente com um único comando (docker-compose up)


### mongo-init.js
- **Função**: Script executado quando o MongoDB inicia pela primeira vez
- **O que faz**:
  - Cria usuários e permissões
  - Inicializa coleções necessári


## Pasta backend/ (Aplicação Node.js)
### Dockerfile
- **Função**: "Receita" para construir a imagem Docker do backend
- **Contém**:
  - Base image (ex: node:18-alpine)
  - Instalação de dependências
  - Comando de inicialização (npm start)


### package.json
- **Função**: Manifesto do projeto Node.js
- **Contém**:
  - Dependências (express, mongoose, etc.)
  - Scripts (start, dev, test)


## Pasta src/ (Código Fonte)


### app.js
entry point of the application. Add your endpoints / routes
- **Função**: Arquivo principal da aplicação
- **Responsabilidades**:
  - Configuração do Express
  - Conexão com o MongoDB
  - Middlewares globais (CORS, JSON parsing)
  - Inicialização do servidor


| Pasta   | Função       | Ficheiro Exemplo                           |
| :---------- | :--------- | :---------------------------------- |
| `models/` | `Define a estrutura dos dados (Mongoose schemas)` | `User.js` |
| `controllers/` | `Lógica de negócio (manipulação de dados)` | `authController.js` |
| `routes/` | `Definição dos endpoints da API  ` | `authRoutes.js` |
| `config/` | `Configurações globais (banco de dados, autenticação)` | `db.js` |



## Documentation

[Express JS](https://expressjs.com/)

[Json Web Tokens](https://www.npmjs.com/package/jsonwebtoken)

[MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)

[Docker](https://docs.docker.com/)


## Autores

- [@StorThiago](https://www.github.com/StorThiago)
- [@joaomatosiscte](https://www.github.com/joaomatosiscte)
