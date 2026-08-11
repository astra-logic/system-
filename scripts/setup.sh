#!/usr/bin/env bash
#
# ONE COMMAND TO A RUNNING SYSTEM.
#
#   npm run setup
#
# Creates the database and role the app expects, applies the migrations, loads
# the demo factory, and tells you what to run next.
#
# ⚠ THIS IS DESTRUCTIVE ON SECOND RUN. The seed step empties every table before
# it loads fixtures. That is what makes it repeatable — and what makes it unsafe
# against data you care about. It asks before doing it, and `--yes` skips the
# question for scripted use.
#
# Every step is idempotent apart from the seed: an existing role or database is
# left alone rather than treated as an error, and migrations already applied are
# skipped by their own ledger.
set -euo pipefail

DB=mos
ROLE=app
PASS=app
ASSUME_YES=${1:-}

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  ✓ %s\n' "$*"; }
warn() { printf '  ! %s\n' "$*"; }
die()  { printf '\n\033[31m✗ %s\033[0m\n\n' "$*" >&2; exit 1; }

# --- what we need before we start -------------------------------------------
say "Checking what's installed"

command -v node >/dev/null || die "Node is not installed. Get it from https://nodejs.org (version 20 or newer)."
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 20 ] || die "Node $(node -v) is too old. This needs 20 or newer."
ok "Node $(node -v)"

command -v psql >/dev/null || die "PostgreSQL is not installed, or psql is not on your PATH.
  Mac:     brew install postgresql@16 && brew services start postgresql@16
  Linux:   sudo apt install postgresql-16 && sudo service postgresql start
  Windows: https://www.postgresql.org/download/windows/ then use the SQL Shell"
ok "$(psql --version)"

# --- find a way in ----------------------------------------------------------
# Which command can create a database here differs by platform: Homebrew makes
# your own account a superuser, Debian gives that to the `postgres` user only.
# Rather than guess, try each and use whichever answers.
if psql -d postgres -c 'SELECT 1' >/dev/null 2>&1; then
  VIA=(psql)
elif sudo -n -u postgres psql -d postgres -c 'SELECT 1' >/dev/null 2>&1; then
  VIA=(sudo -u postgres psql)
else
  die "Can't connect to PostgreSQL as a user who may create databases.
  Is the server running?
    Mac:   brew services start postgresql@16
    Linux: sudo service postgresql start
  If it is running, try again with:  sudo -u postgres npm run setup"
fi
ok "Connected to PostgreSQL"

# The same access method, pointed at whichever database we need. Written as a
# function rather than by rewriting an array: the connection is several separate
# arguments, so a string substitution over them silently matches nothing and
# leaves every command aimed at the wrong database.
on_db() { local target="$1"; shift; "${VIA[@]}" -d "$target" "$@"; }
PSQL=(on_db postgres)

# --- role and database ------------------------------------------------------
say "Setting up the database"

if "${PSQL[@]}" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$ROLE'" | grep -q 1; then
  ok "Role '$ROLE' already exists"
else
  "${PSQL[@]}" -q -c "CREATE ROLE $ROLE LOGIN PASSWORD '$PASS'"
  ok "Created role '$ROLE'"
fi

if "${PSQL[@]}" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB'" | grep -q 1; then
  ok "Database '$DB' already exists"
else
  "${PSQL[@]}" -q -c "CREATE DATABASE $DB OWNER $ROLE"
  ok "Created database '$DB'"
fi

"${PSQL[@]}" -q -c "GRANT ALL PRIVILEGES ON DATABASE $DB TO $ROLE"
# ⚠ Postgres 15 stopped granting CREATE on the public schema by default, which
# is why an existing database can still refuse every table this app creates —
# and why the failure shows up three steps later as a confusing migration error.
on_db "$DB" -q -c "GRANT ALL ON SCHEMA public TO $ROLE" \
  || warn "Couldn't grant on the public schema. If the next step fails, run:
      psql -d $DB -c 'GRANT ALL ON SCHEMA public TO $ROLE'"
ok "Granted access to '$ROLE'"

# The test suite uses its own database, so a fresh clone can run `npm test`.
if ! "${PSQL[@]}" -tAc "SELECT 1 FROM pg_database WHERE datname='${DB}_test'" | grep -q 1; then
  "${PSQL[@]}" -q -c "CREATE DATABASE ${DB}_test OWNER $ROLE"
  on_db "${DB}_test" -q -c "GRANT ALL ON SCHEMA public TO $ROLE" || true
  ok "Created test database '${DB}_test'"
fi

# --- local configuration ----------------------------------------------------
# `.env` is deliberately NOT in the repository — the day a real database
# password goes in it, a committed file puts that password on GitHub. So it is
# written here instead, and only when it is missing.
if [ -f .env ]; then
  ok ".env already present, left alone"
else
  printf 'DATABASE_URL=postgres://%s:%s@localhost:5432/%s\n' "$ROLE" "$PASS" "$DB" > .env
  ok "Wrote .env"
fi

# --- the app ----------------------------------------------------------------
say "Installing dependencies"
npm install --silent
ok "Dependencies installed"

say "Creating the tables"
npm run --silent db:push
ok "Tables ready"

# --- the destructive step, asked for out loud -------------------------------
say "Loading the demo factory"
if [ "$ASSUME_YES" != "--yes" ]; then
  printf '  This EMPTIES every table, then loads generated demo data.\n'
  printf '  Continue? [y/N] '
  read -r reply
  case "$reply" in
    [yY]*) ;;
    *) printf '\n  Skipped. Run "npm run db:seed" when you want it.\n\n'; exit 0 ;;
  esac
fi
npm run --silent db:seed
ok "Demo factory loaded"

printf '\n\033[1mReady.\033[0m Start it with:\n\n    npm run dev\n\nThen open http://localhost:3000\n\n'
