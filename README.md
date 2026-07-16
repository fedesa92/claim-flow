# Claim-Flow

A mobile-first demo for guided motor claim reporting and loss adjuster appointment booking. The project applies the stack described by D4Next—Kotlin, Quarkus, Kafka, MongoDB, React, and TypeScript—to a concrete insurance use case.

> Technical prototype: this is not a legally valid CAI/CID form. Use fictional data only.

## Features

- Installable, responsive, and accessible PWA
- Complete Italian and English interface with a persistent language preference
- Five-step guided flow with progressive saving
- Drivers, vehicles, policies, accident dynamics, circumstances, and photos
- Server-side validation and `STANDARD`/`URGENT` triage
- Claim submission with a unique reference number
- Loss adjuster availability search and appointment booking
- Kafka events: `ClaimSubmitted` and `AppointmentBooked`
- Document-oriented persistence in MongoDB
- Frontend local fallback for infrastructure-free demonstrations
- OpenAPI specification and Swagger UI

## Quick start

Prerequisite: Docker Desktop with Docker Compose.

```bash
docker compose up --build
```

Then open:

- Application: http://localhost:3000
- Swagger UI: http://localhost:8080/q/swagger-ui
- Kafka console: http://localhost:8081

On the home screen, select **Precompila demo** to complete the full flow in under two minutes.

## Frontend development

```bash
cd frontend
pnpm install
pnpm dev
```

The PWA calls the API at `http://localhost:8080/api`. If the API is unavailable, it transparently switches to a `localStorage` adapter, keeping a statically deployed demo fully interactive.

## Technical decisions

- **React PWA instead of a native Android application:** easy access from a link, installability, and a mobile-first experience. Kotlin remains on the backend, matching the target stack.
- **One modular Quarkus service:** appropriate for the MVP and avoids decorative microservices. The `appointments` boundary can be extracted when load or team ownership justifies it.
- **Events represent domain facts:** the HTTP request completes the MongoDB transaction; Kafka decouples notifications, audit, and future search projections.
- **MongoDB:** a claim is naturally represented as a document aggregate with nested sections and an evolving schema.
- **Local fallback:** a deliberate demo-product decision, isolated inside the frontend API adapter and separate from the real backend path.

See the [architecture notes](docs/architecture.md) and [demo script](docs/demo-script.md).

## Project structure

```text
claimflow/
|-- backend/              Kotlin + Quarkus
|-- frontend/             React + TypeScript + Vite PWA
|-- infra/k8s/            Demonstration Kubernetes manifests
|-- docs/                 Architecture and presentation material
`-- docker-compose.yml    Reproducible local stack
```

## Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/claims` | Create a draft claim |
| `PUT` | `/api/claims/{id}` | Update a draft claim |
| `POST` | `/api/claims/{id}/submit` | Validate and submit a claim |
| `GET` | `/api/adjusters/slots?date=YYYY-MM-DD` | Retrieve available slots |
| `POST` | `/api/claims/{id}/appointments` | Book a loss adjuster |

## Production-oriented next steps

- OIDC authentication and resource-level authorization
- Object storage uploads through signed URLs
- Transactional outbox for reliable Kafka publishing
- Elasticsearch projection for the operator dashboard
- Electronic signature through a certified provider
- OpenTelemetry observability
