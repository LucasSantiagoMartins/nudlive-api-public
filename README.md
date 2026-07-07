# NudLive — Backend Architecture (Public Edition)

## Event-Driven · Modular Monolith + Microservices

> **⚠️ Public Repository**
>
> This repository is the **public edition** of the NudLive backend. It is intended to showcase the project's architecture, engineering practices, and foundational implementation.
>
> The production version includes significantly more advanced features, infrastructure, security mechanisms, financial services, media processing, distributed workflows, and proprietary business logic. These components are maintained in a **private repository** and are **not included** here.

NudLive is a live streaming platform designed to scale from regional to global deployments with a strong focus on **performance**, **financial security**, **high availability**, and **maintainability**.

The architecture combines a **Modular Monolith** (Core Service) for stable business domains with **independently scalable Microservices** for high-throughput domains such as **Real-time Communication**, **Media & Live Streaming**, and **Finance**. All services communicate through an **Event-Driven Architecture (EDA)** powered by **Apache Kafka**.

---

## Índice

- [Filosofia Arquitetural](#filosofia-arquitetural)
- [Diagrama de Arquitetura Geral](#diagrama-de-arquitetura-geral)
- [Decomposição por Domínio](#decomposição-por-domínio)
- [Arquitetura de Comunicação (EDA)](#arquitetura-de-comunicação-eda)
- [Diagrama de Fluxo (Kafka)](#diagrama-de-fluxo-kafka)
- [Fluxo Crítico: Acesso a Sala Privada](#fluxo-crítico-acesso-a-sala-privada)
- [Pilares de Performance e Resiliência](#pilares-de-performance-e-resiliência)
- [Diagrama de Infraestrutura](#diagrama-de-infraestrutura)
- [Estrutura de Tópicos (Apache Kafka)](#estrutura-de-tópicos-apache-kafka)
- [Stack Tecnológica e DevOps](#stack-tecnológica-e-devops)

---

## Filosofia Arquitetural

A arquitetura do NudLive segue o princípio de **isolamento de falhas e padrões de carga**. Não fragmentamos o sistema prematuramente; agrupamos por contexto de negócio e isolamos apenas os serviços que exigem escalabilidade independente ou possuem requisitos de estado distintos (stateful vs. stateless). O módulo financeiro é mantido como uma entidade imutável e isolada para garantir integridade absoluta sob qualquer condição de tráfego.

---

## Diagrama de Arquitetura Geral

![Arquitetura Geral](https://github.com/user-attachments/assets/deb07696-dfa5-4fbf-8586-c99dab9129cf)
---

## Decomposição por Domínio

### 1. Core Service (Monolito Modular)
Responsável pelos módulos de Autenticação, Perfil, Início/Descoberta e Explorar. Utiliza o mesmo modelo de dados de utilizador, otimizado para operações de leitura frequentes com baixa latência.

### 2. Real-time Service (Microsserviço Stateful)
Gerencia o Chat Global das Lives, o Chat de Salas Privadas e o sistema de Mensagens Diretas (P2P).
- **Responsabilidade:** Manutenção de conexões WebSocket persistentes para interação instantânea.
- **Sincronização:** Utiliza Redis Pub/Sub para orquestrar mensagens entre instâncias escaladas horizontalmente.

### 3. Media & Live Service (Microsserviço de Estado de Sessão)
Gerencia o ciclo de vida das transmissões.
- **Responsabilidade:** Criação de lives, validação de presença em salas privadas e controle de permissões de acesso em tempo real.
- **Integração:** Delega o streaming de vídeo pesado (transcodificação/distribuição) para o LiveKit.

### 4. Finance Service (Microsserviço de Alta Criticidade)
Responsável pelo Sistema Financeiro, Métodos de Pagamento e Carteira.
- **Responsabilidade:** Processamento de pagamentos, reconciliação e gestão de saldo.
- **Garantia:** Ledger imutável (append-only) que garante que transações sejam auditáveis e seguras, independentemente da carga nos demais serviços.

---

## Arquitetura de Comunicação (EDA)

A comunicação síncrona (REST/gRPC) é limitada a operações de consulta imediata. Para efeitos colaterais entre domínios, utilizamos **Apache Kafka**. Este desacoplamento garante que, em caso de instabilidade num serviço (ex: Media & Live), o Finance Service continue processando transações e o evento seja entregue assim que o consumidor retornar (garantia de entrega "at-least-once").

---

## Diagrama de Fluxo (Kafka)

![Fluxo EDA](https://github.com/user-attachments/assets/98283ecd-c4f6-41cb-808a-bd5dacdf886d)

---

## Fluxo Crítico: Acesso a Sala Privada

1. **Solicitação:** Espectador solicita acesso via REST ao *Media & Live Service*.
2. **Intent:** *Media & Live* solicita criação de *Payment Intent* ao *Finance Service*.
3. **Pagamento:** Utilizador efetua pagamento via Gateway (Multicaixa/Stripe).
4. **Evento:** Após confirmação, o *Finance Service* publica `payment.confirmed` no Kafka.
5. **Liberação:** *Media & Live Service* consome o evento e autoriza o acesso do utilizador à sala na base de dados.
6. **Notificação:** *Real-time Service* consome o evento e envia via WebSocket a confirmação final ao cliente.

---

## Pilares de Performance e Resiliência

- **Redis Caching & Pub/Sub:** Utilizado para gestão de sessões, contadores de audiência em tempo real e sincronização de instâncias do Real-time Service.
- **Circuit Breaker:** Implementado em todas as chamadas para APIs externas de pagamento, evitando o efeito cascata em caso de falhas de provedores.
- **Read Replicas:** PostgreSQL (- com Read Replicas) configurado com réplicas de leitura para isolar queries pesadas de descoberta do banco de escrita principal.
- **Auto-scaling:** Horizontal Pod Autoscaler (HPA) baseado em métricas customizadas (conexões WS ativas e carga de CPU).

---

## Diagrama de Infraestrutura

![Infraestrutura Kubernetes](https://github.com/user-attachments/assets/79801c10-fca6-4887-b53e-b20fc630d7e5)

---

## Estrutura de Tópicos (Apache Kafka)

### Produtor: Finance Service
| Tópico | Descrição |
|---|---|
| `payment.confirmed` | Pagamento validado com sucesso |
| `payment.failed` | Falha no processamento financeiro |
| `wallet.balance.updated` | Saldo da conta foi alterado |
| `payout.processed` | Levantamento efetuado pelo criador |
| `transaction.refunded` | Estorno de valor realizado |
| `ledger.entry.created` | Registo de auditoria imutável |

### Produtor: Media & Live Service
| Tópico | Descrição |
|---|---|
| `room.access.granted` | Acesso liberado após pagamento |
| `live.started` | Transmissão de vídeo iniciada |
| `live.ended` | Transmissão encerrada |
| `room.participant.joined` | Espectador entrou na sala |
| `room.participant.left` | Espectador saiu da sala |
| `stream.quality.alert` | Alerta de degradação da live |

### Produtor: Real-time Service
| Tópico | Descrição |
|---|---|
| `chat.message.sent` | Mensagem enviada no chat da live |
| `private.message.sent` | Mensagem direta P2P enviada |
| `chat.moderation.flag` | Mensagem sinalizada por moderador |
| `user.typing.status` | Estado de escrita do utilizador |
| `chat.room.muted` | Sala de chat colocada em silêncio |
| `user.connection.lost` | Queda de conexão WebSocket |

---

## Stack Tecnológica e DevOps

| Categoria | Tecnologia |
|---|---|
| **Linguagem/Framework** | TypeScript, NestJS |
| **Broker de Eventos** | Apache Kafka |
| **Banco de Dados** | PostgreSQL (com Read Replicas) |
| **Cache/State** | Redis (Cluster Mode) |
| **Streaming Engine** | LiveKit |
| **Infraestrutura** | Kubernetes (EKS/GKE), Terraform |
| **CI/CD** | GitHub Actions (Pipeline automatizado) |
| **Segurança** | Cloudflare (CDN/WAF), Fail2Ban, JWT |

---
*NudLive — Arquitetura de Alta Performance | Desenvolvido para Escalar*