#!/usr/bin/env bash
#
# run.sh — one command to boot the Job Site Platform for a demo / review.
#
#   ./run.sh            normal start (installs deps + sets up DB only if needed)
#   ./run.sh --fresh    drop-in reseed: (re)create tables and reload sample data
#   ./run.sh --help     show this help
#
# What it does:
#   1. checks Node.js / npm
#   2. reads backend/.env for the DB settings
#   3. makes sure MySQL/MariaDB is running and the app DB user can connect
#      (offers to create the database + user if a root login is available)
#   4. installs npm dependencies (root, backend, frontend) when missing
#   5. creates the schema + seeds demo data when the DB is empty
#   6. starts the backend (http://localhost:5000) and frontend (http://localhost:3000)
#
set -euo pipefail

# ---------------------------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

FRESH=0
for arg in "$@"; do
  case "$arg" in
    --fresh) FRESH=1 ;;
    -h|--help)
      sed -n '3,16p' "$0" | sed 's/^#\( \|$\)//'
      exit 0 ;;
    *) echo "Unknown option: $arg (try --help)"; exit 1 ;;
  esac
done

# ---- pretty output --------------------------------------------------------
if [ -t 1 ]; then
  BOLD=$'\e[1m'; DIM=$'\e[2m'; RED=$'\e[31m'; GRN=$'\e[32m'; YLW=$'\e[33m'; BLU=$'\e[34m'; RST=$'\e[0m'
else
  BOLD=""; DIM=""; RED=""; GRN=""; YLW=""; BLU=""; RST=""
fi
step() { printf '%s\n' "${BLU}${BOLD}==>${RST} ${BOLD}$*${RST}"; }
ok()   { printf '    %s %s\n' "${GRN}✓${RST}" "$*"; }
warn() { printf '    %s %s\n' "${YLW}!${RST}" "$*"; }
die()  { printf '\n%s %s\n' "${RED}${BOLD}✗ ${RST}" "$*" >&2; exit 1; }

printf '\n%s\n' "${BOLD}Job Site Platform — local runner${RST}"
printf '%s\n\n' "${DIM}$ROOT_DIR${RST}"

# ---- 1. Node / npm ------------------------------------------------------------
step "Checking prerequisites"
command -v node >/dev/null 2>&1 || die "Node.js is not installed. Install Node 16+ and retry."
command -v npm  >/dev/null 2>&1 || die "npm is not installed."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 16 ] || warn "Node $(node -v) is old; 16+ recommended."
ok "node $(node -v), npm $(npm -v)"

# ---- 2. read backend/.env --------------------------------------------------
[ -f backend/.env ] || die "backend/.env is missing."
getenv() {
  grep -E "^$1=" backend/.env | head -1 | cut -d= -f2- | tr -d '\r' \
    | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}
DB_HOST="$(getenv DB_HOST)";      DB_HOST="${DB_HOST:-localhost}"
DB_PORT="$(getenv DB_PORT)";      DB_PORT="${DB_PORT:-3306}"
DB_USER="$(getenv DB_USER)";      DB_USER="${DB_USER:-root}"
DB_PASSWORD="$(getenv DB_PASSWORD)"
DB_NAME="$(getenv DB_NAME)";      DB_NAME="${DB_NAME:-job_site_db}"
APP_PORT="$(getenv PORT)";        APP_PORT="${APP_PORT:-5000}"
ok "config: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# ---- 3. database ---------------------------------------------------------------
step "Checking database"
# pick a client binary
if command -v mariadb >/dev/null 2>&1; then MYSQL=mariadb
elif command -v mysql >/dev/null 2>&1; then MYSQL=mysql
else die "No mysql/mariadb client found. Install MySQL or MariaDB (server + client)."; fi

# is a server listening on the port?
if ! (exec 3<>"/dev/tcp/${DB_HOST}/${DB_PORT}") 2>/dev/null; then
  die "Nothing is listening on ${DB_HOST}:${DB_PORT}. Start MySQL/MariaDB, e.g.:
       sudo systemctl start mariadb    # or: mysql.server start"
fi
exec 3>&- 2>/dev/null || true
ok "server reachable on ${DB_HOST}:${DB_PORT}"

app_sql() { "$MYSQL" -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} "$@" 2>/dev/null; }

if app_sql -e "USE \`$DB_NAME\`;" ; then
  ok "connected as '$DB_USER', database '$DB_NAME' exists"
else
  warn "cannot connect as '$DB_USER' to '$DB_NAME' — attempting to create it"
  BOOTSTRAP_SQL="CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;"
  done_bootstrap=0
  # try a passwordless root, then MYSQL_ROOT_PASSWORD, then interactive prompt
  if "$MYSQL" -h"$DB_HOST" -P"$DB_PORT" -uroot -e "SELECT 1" >/dev/null 2>&1; then
    printf '%s\n' "$BOOTSTRAP_SQL" | "$MYSQL" -h"$DB_HOST" -P"$DB_PORT" -uroot && done_bootstrap=1
  elif [ -n "${MYSQL_ROOT_PASSWORD:-}" ] && \
       "$MYSQL" -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
    printf '%s\n' "$BOOTSTRAP_SQL" | "$MYSQL" -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$MYSQL_ROOT_PASSWORD" && done_bootstrap=1
  else
    echo
    ROOTPW=""
    read -r -p "    MySQL root password (leave blank to skip auto-setup): " -s ROOTPW || true
    echo
    if [ -n "$ROOTPW" ] && "$MYSQL" -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$ROOTPW" -e "SELECT 1" >/dev/null 2>&1; then
      printf '%s\n' "$BOOTSTRAP_SQL" | "$MYSQL" -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$ROOTPW" && done_bootstrap=1
    fi
  fi

  if [ "$done_bootstrap" -eq 1 ] && app_sql -e "USE \`$DB_NAME\`;"; then
    ok "database and user created"
  else
    die "Could not set up the database automatically.
    Run this once as a MySQL admin, then re-run ./run.sh:

$(printf '%s\n' "$BOOTSTRAP_SQL" | sed 's/^/        /')"
  fi
fi

# schema present & seeded?
USER_COUNT="$(app_sql -N -e "SELECT COUNT(*) FROM \`$DB_NAME\`.users;" || echo "NA")"

# ---- 4. dependencies ----------------------------------------------------------
step "Installing dependencies"
need_install=0
[ -d node_modules ] || need_install=1
[ -d backend/node_modules ] || need_install=1
[ -d frontend/node_modules ] || need_install=1
if [ "$need_install" -eq 1 ]; then
  warn "node_modules missing somewhere — running full install (this can take a minute)"
  npm run install-all
  ok "dependencies installed"
else
  ok "already installed (root, backend, frontend)"
fi

# ---- 5. schema + seed -------------------------------------------------------
step "Preparing schema and demo data"
if [ "$FRESH" -eq 1 ]; then
  warn "--fresh: recreating tables and reloading sample data"
  npm run setup-db
  npm run seed
  ok "database reset with fresh demo data"
elif [ "$USER_COUNT" = "NA" ]; then
  warn "tables not found — creating schema and seeding"
  npm run setup-db
  npm run seed
  ok "schema created and seeded"
elif [ "$USER_COUNT" = "0" ]; then
  warn "no users found — seeding demo data"
  npm run seed
  ok "demo data seeded"
else
  ok "schema present, $USER_COUNT users already in the database"
fi

# ---- 6. start ------------------------------------------------------------------
step "Starting the app"
cat <<EOF

  ${BOLD}Frontend${RST}  http://localhost:3000
  ${BOLD}Backend${RST}   http://localhost:${APP_PORT}/api/health

  ${BOLD}Demo logins${RST}
    admin      admin@jobsite.com       / admin123
    recruiter  sarah.wilson@example.com / password123
    seeker     john.doe@example.com     / password123

  ${DIM}Press Ctrl+C to stop both servers.${RST}

EOF

exec npm run dev
