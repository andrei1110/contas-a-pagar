# Contas a pagar
REST API para um sistema de controle de contas a pagar.

## Instruções de inicialização

### Requisitos
As seguintes portas devem estar livres:
* 3001 (API REST)
* 3006 (Banco de dados)
* 3000 (Frontend)

### Usando o docker-compose
**APENAS LINUX:** Se você utiliza Linux, primeiro siga esse tutorial: [Como instalar o Docker engine Linux](https://docs.docker.com/engine/install/#server)

Siga o tutorial para instalação do Docker e Docker compose de acordo com o seu sistema operacional: [Como instalar o Docker Compose](https://docs.docker.com/compose/install/)

Após a instalação do Docker Compose, entre na pasta raíz do repositório e rode o comando:

```
docker-compose up
```

### Rodando a fora do compose

**Banco de dados**

Você deve ter um servidor mysql com um banco de dados 
(database) chamado ```contas-a-pagar``` ou deve alterar o nome do banco no arquivo ```.env```.

**Backend**

Outro requisito é o ```NodeJS``` com o gerenciador de pactoes ```npm``` instalado no computador que irá rodar a aplicação

Após ter o banco de dados configurado, entre no diretório ```server``` e execute os seguintes comandos:

```
npm -i yarn -g && yarn && yarn knex:migrate && yarn knex:seeds && yarn dev
```

**Frontend**

Assim como o **Backend**, o Front precisa do ```NodeJS``` e ```Yarn``` para funcionar. 

Entre no diretório ```front``` e execute os seguintes comandos:

Se você **não** rodou o backend:
````
npm -i yarn -g && yarn start
````
Se você rodou o backend:
```
yarn start```
```

Para acessar o frontend, utilize o endereço [http://localhost:3000](http://localhost:3000)

## Documentação API

URL padrão: ```http://localhost:3001```

Header: 
```
Content-type: application/json
```

**GET**: ```/contas```

Retorno ```200```: 
```
{
    "id_conta": Number,
    "nome_conta": String,
    "data_vencimento": Datetime,
    "data_pagamento": Datetime,
    "valor_original": Number,
    "dias_atraso": Number,
    "valor_final": Number,
    "id_regra: : Number,
    "nome_regra": String,
    "qtd_dias_inicial": Number,
    "qtd_dias_final": Number
    "qtd_multa": Number,
    "qtd_juros": Number,
    "tipo_juros": "simples" | "composto"
}
```

Retorno ```204```

Retorno ```503```:
```
{
    "msg": "Falha na comunicação com o banco de dados. Tente novamente."
}
```

**POST**: ```/conta```

Body: 
```
{
    "nome_conta": String,
    "data_vencimento": Datetime,
    "data_pagamento": Datetime,
    "valor_original": Number,
    "tipo_juros: "simples" | "composto"
}
```

Retorno ```200```:
```
{
    "msg": "Conta cadastrada com sucesso.",
    "id_conta": Number
}
```

Retorno ```400```
```
{
    "msg": "Erro ao cadastrar conta.",
    "erorr": Error 
}
```

Retorno ```503```:
```
{
    "msg": "Falha na comunicação com o banco de dados. Tente novamente."
}
```

## Testes (REST API - Backend)

Para rodar os testes, é necessário entrar no diretório ```server``` e rodar o seguinte comando:
```
yarn && yarn test
```

Foram apenas criados testes para os casos triviais e de sucesso. Os testes realizados são:
* Juros Compostos
* Juros Simples
* Regras de atraso:
  - 1 dia atrasado
  - 4 dias atrasado
  - 30 dias atrasado
  - 3 dias adiantado (-3)
  - Paga em dia (0)

## Tecnologias usadas
* NodeJS
* Mysql
* Docker
* ReactJS

### Pacotes usados NodeJS (API-Backend)
* Express
* Cors
* MomentJS
* Knex
* Mysql2
* Typescript
* Jest
* TS-Jest

### Pacotes usados no ReactJS (Front-end)
* Axios
* React Bootstrap
* Sweetalerts
* MomentJS
* React-dotenv

### Linguagem de programação
* JavaScript (TypeScript)

## Estrutura dos arquivos e pastas
```
server
  └── src
    └── __tests__
      └── regras.test.ts
    └── controllers
      └── index.ts
    └── database
      └── migrations
        └── 00_create_regras.ts
        └── 01_create_contas.ts
      └── seeds
        └── create_regras.ts
      └── connect.ts
    └── routes
      └── index.ts
    └── server.ts
  └── .env
  └── Dockerfile
  └── package.json
  └── tsconfig.json
front
  └── public
  └── src
    └── compontents
      └── Contas
        └── index.tsx
      └── ModalCadastraConta
        └── index.tsx
    └── pages
      └── index.tsx
    └── services
      └── api.tsx
    └── App.tsx
    └── index.css
    └── index.tsx
    └── routes.tsx
  └── .env
  └── DockerFile
  └── package.json
  └── tsconfig.json
docker-compose.yml
```