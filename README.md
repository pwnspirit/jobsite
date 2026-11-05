# Job Site Platform

This project has a React/Vite frontend, an Express API, and a MySQL database.

## Run with Docker Compose

Docker Compose starts MySQL, the API, and the frontend together. From the project root:

```sh
cp .env.example .env
docker compose up --build
```

Open <http://localhost:3000>. The API health endpoint is available at <http://localhost:3000/api/health>.

The sample secrets in `.env.example` are for local development only. Change them before deploying. To stop the containers, press Ctrl+C. To remove the database volume as well, use `docker compose down -v` (this deletes local database data).

## Run the frontend and API with local MySQL

You need Node.js 20.19+ (or 22.12+), npm, and a running MySQL or MariaDB server. Create a database user that can create tables, then run:

```sh
cp backend/.env.example backend/.env
npm run install-all
npm run setup-db
npm run seed
npm run dev
```

If your MySQL connection differs from the example, edit `backend/.env` first. The setup script recreates the application's tables, so only run it when you are ready to initialize or reset the schema.

Open <http://localhost:3000>. Vite forwards `/api` requests to the backend on port 5000. You can check the backend directly at <http://localhost:5000/api/health>.
