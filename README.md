## Desafio Hackathon: **Portal de Compras & Fornecedores**
**GRUPO: Delete sem WHERE**
![41f38680-6dbc-4a2f-acc6-86c8ee2afa99](https://github.com/user-attachments/assets/f49f234f-e464-4c8d-8ba6-8bfc582b8ce9)

## Integrantes

- **Kaio Muniz**
- **João Pedro Marques**
- **Robert Porteles**

---

## Estrutura da Solução (Repositórios)

Nossa solução foi dividida em **4 projetos independentes e integrados**, atendendo a todos os requisitos do desafio:

- **API Login**  
  Responsável pela **autenticação** e **segurança** do portal.  
  https://github.com/KaioMuniz/hackApiLogin

- **API Fornecedor**  
  Gerenciamento de **dados**, **cadastros** e **propostas** do lado do fornecedor.  
  https://github.com/KaioMuniz/hackApiFornecedor

- **API Empresa**  
  Backend para o **backoffice** da empresa contratante (**gestão e cotações**).  
  https://github.com/KaioMuniz/hackApiEmpresa

- **Interface / Portal do Fornecedor**  
  **Interface front-end** dedicada à experiência do fornecedor.  
  https://github.com/RobertPorteles/fornecedorHackatom




---

## Fluxo
![fb3e8aaa-6bd2-4a8a-a5dc-c2e45fd4daee](https://github.com/user-attachments/assets/9eba1b8e-2a7e-496a-9227-48baa585b834)

![540fea4c-397f-45c6-adaf-28a1925db63c](https://github.com/user-attachments/assets/9fb9f32b-1dfc-4637-960f-cb2890f9eed7)

![53410a41-ff39-4241-9606-1b1d493b157d](https://github.com/user-attachments/assets/2c2ec764-fa8f-4354-a031-8e365a3a35e6)

![60901e2a-3761-4e04-aa5e-740fdd094354](https://github.com/user-attachments/assets/903447f1-e0d2-4de5-ae6a-661d286fd4a8)




---

## Objetivo do Projeto

Criar uma **solução digital simples e eficiente** que conecte **Empresas Contratantes** e **Fornecedores**, atendendo às necessidades de **gestão, cotação e acompanhamento de processos**, com **segurança e clareza**.

---

## Visão Geral da Solução

- A **Empresa publica ou convida** fornecedores para participar de cotações  
- O **Fornecedor responde e acompanha** suas propostas  
- O **sistema centraliza todo o fluxo** de comunicação e decisão  

**Não é apenas um cadastro — é um processo completo de relacionamento comercial.**

---

## Fluxo Simplificado (Empresa ⇔ Fornecedor)

1. A empresa cria uma **cotação** de produto ou serviço  
2. Fornecedores são **convidados** ou visualizam oportunidades abertas  
3. Fornecedores **enviam propostas**  
4. A empresa **acompanha, compara e decide**  
5. Todo o histórico fica **registrado no sistema**

---

## Empresa Contratante (Backoffice)

A Empresa possui um **portal administrativo** para:

- Cadastrar e manter a empresa
- Cadastrar e gerenciar **fornecedores**
- Criar **cotações** de produtos ou serviços
- Convidar fornecedores para cotar
- Acompanhar e comparar propostas
- Manter **histórico dos processos**

**Foco:** controle, organização e tomada de decisão

---

## Fornecedor (Portal do Fornecedor)

O Fornecedor possui um **portal próprio e seguro** para:

- Acessar via **login (e-mail) e senha**
- Manter seus dados cadastrais
- Se cadastrar como **fornecedor candidato**
- Visualizar oportunidades de cotação
- Enviar propostas
- Acompanhar processos em andamento

**Foco:** transparência, facilidade e confiança

---

## Ideia de Arquitetura (Conceitual)

- Arquitetura baseada em **APIs REST**
- Separação de responsabilidades por domínio
- Autenticação centralizada via **API Login**
- Comunicação entre serviços via HTTP
- Front-end desacoplado do backend

---

## Diferenciais da Proposta

- Separação clara entre **Empresa** e **Fornecedor**
- Processo de cotação **centralizado e rastreável**
- Estrutura modular e escalável
- Segurança desde a autenticação
- Facilidade de uso para ambos os perfis
- Notificações em tempo real
- Dashboard com métricas e relatórios

---


