# TeamPulse

TeamPulse is a full-stack employee activity monitoring project with a Spring Boot API, React dashboard, and Python desktop agent. It supports local H2 or MySQL development and a Render deployment. This source copy does not include the upstream Git history or remote.

## Project layout

- `backend/` — Spring Boot REST API (Java 17, Maven)
- `frontend/` — React dashboard (Vite)
- `agent/` — Python desktop activity agent

## Prerequisites

- Java 17 or newer
- Maven 3.9+
- Node.js 20+ and npm
- Docker Desktop or Docker Engine with Compose (for local MySQL)

## Run the backend

From the project root:

```sh
cd backend
mvn spring-boot:run
```

The API runs at `http://localhost:8080`. By default it uses a local H2 database at `backend/data/teampulse`. The frontend `/admin` screen supports account signup as an admin or manager. Managers can view activity and reports; employee record changes are admin-only. You can also bootstrap an initial admin from environment variables.

To start a local backend with an initial admin account and agent upload key, set secrets in the shell before running the API:

```sh
BOOTSTRAP_ADMIN_USERNAME=admin BOOTSTRAP_ADMIN_PASSWORD='use-a-private-password-at-least-12-characters' AGENT_API_KEY='use-a-separate-private-agent-key' mvn -f backend/pom.xml spring-boot:run
```

Passwords are BCrypt-hashed. If the configured bootstrap username already exists, bootstrap grants that account the admin role but does not reset its password. Admins receive a full JWT-authenticated dashboard; managers receive read-only access; the agent's `POST /activity` and employee verification require `X-Agent-API-Key`.

### Run with local MySQL

From the project root, start MySQL with the local-only Compose credentials:

```sh
docker compose up -d mysql
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

The MySQL profile connects to `localhost:3306` and uses database/user `teampulse`. Change credentials with `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_ROOT_PASSWORD` in an untracked root `.env` file. Set matching `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` for the backend if you change those defaults. Stop the local database with `docker compose down`; its data remains in the `teampulse_mysql` volume. Use `docker compose down -v` only when you intend to delete that local database data.

## Run the frontend

In another terminal:

```sh
cd frontend
npm install
npm run dev
```

The React development server runs at `http://localhost:4173` and defaults to the local API at `http://localhost:8080`. The production preview command uses port `4174`. To override the API URL, create `frontend/.env` from `.env.example` and set `VITE_API_BASE_URL`.

## Run the Python agent

```sh
cd agent
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
python -m pip install -r requirements.txt
python agent.py
```

On first launch, enter the backend URL, employee ID, and agent API key. The agent verifies employee existence through an API-key-protected endpoint that returns no employee details. You can optionally enable startup-at-sign-in from the setup screen. Its private `config.json` stores the connection settings locally and should not be committed. Typed text and pointer coordinates are never saved. Foreground app and window reporting is supported on Windows, macOS (with Accessibility permission), and Linux/X11 with `xdotool` installed. Inactivity and suspicious-flag actions are configurable in `config.json`; the default action is `none`.

## Deploy to Render

The root `render.yaml` Blueprint describes a public API, static React dashboard, and a private MySQL service on Render's private network. It generates database, JWT, and agent upload secrets, prompts for an initial admin username/password, connects the frontend to the API, and mounts persistent storage for MySQL. The MySQL service uses Render's official example repository. Render documents a 10 GB baseline disk for MySQL; persistent disks require paid services. Review the plan and current prices in Render before creating the Blueprint. A persistent database disk disables zero-downtime deploys for that database service.

To deploy, push this project to a GitHub repository, connect that repository to your Render account, then create a Blueprint Instance from its `render.yaml`. The deployment cannot start until the repository is available to Render. Once deployed, check `https://<your-api>.onrender.com/health`; the dashboard is published at its own Render URL.

For manual deployment, configure the backend with `SPRING_PROFILES_ACTIVE=mysql`, `DB_HOSTPORT=<private-mysql-host>:3306`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `AGENT_API_KEY`, `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD`, and `CORS_ORIGINS=<dashboard-https-url>`. Provide the generated `AGENT_API_KEY` privately to each agent installer; never publish it in the frontend or source repository. Do not use local development credentials in a live environment.

## Prepare a new GitHub repository

This folder is a source copy without the original repository's `.git` history or remote. Initialize and connect your new repository when you are ready:

```sh
git init
git add .
git commit -m "Initial TeamPulse full-stack project"
```
