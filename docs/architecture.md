# OptiTime Architecture

## Overview
OptiTime is designed as a multi-client, multi-service system:

- Clients: Web, iOS, Android
- Core Backend: NestSJ API (business logic, data, and queue producer)
- AI Service: FastAPI for sentiment, RAG, personalization, and coaching
- Worker: BullMQ processors for Async workloads
- Data: MongoDB (source of truth), Weaviate (semantic memory), Redis (queues)

---

## System Diagram (logical)
```txt
        ┌───────────────┐     HTTPS     ┌───────────────┐
        │   Web (Next)   │──────────────►│   NestJS API   │
        └───────────────┘               └───────┬───────┘
                                                │
        ┌───────────────┐     HTTPS             │ MongoDB
        │  iOS (Swift)   │──────────────►       │ (source of truth)
        └───────────────┘                       ▼
                                           ┌───────────┐
        ┌───────────────┐     HTTPS        │  MongoDB  │
        │Android (Kotlin)│──────────────►  └───────────┘
        └───────────────┘

                     ┌─────────────────────────────────────┐
                     │            Redis + BullMQ            │
                     └───────────────┬─────────────────────┘
                                     │ jobs
                                     ▼
                              ┌───────────────┐
                              │ Worker (Node)  │
                              └───────┬───────┘
                                      │ calls
                                      ▼
                              ┌───────────────┐
                              │  AI (FastAPI)  │
                              └───────┬───────┘
                                      │ RAG / upserts
                                      ▼
                                 ┌──────────┐
                                 │ Weaviate │
                                 └──────────┘