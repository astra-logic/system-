# Putting this on a real URL

Roughly 20 minutes, and it ends with a link you can send to the factory.

You run these steps, not me — they need accounts and payment details I don't have, and the
environment I work in can reach only GitHub and npm.

> **Tested and untested, stated honestly.** The application code, the serverless connection
> handling and the migration path are verified locally. The Vercel and Neon steps below are
> written from their documented behaviour — I could not reach either service to run them. If a
> step doesn't match what you see, tell me what it actually says and I'll correct this file.

---

## 1 · A database that lives somewhere

Vercel runs no database, so the app needs a hosted PostgreSQL. **Neon** has a free tier that fits
this comfortably.

1. Sign up at [neon.tech](https://neon.tech) and create a project. Pick the region nearest Egypt —
   **Frankfurt (`eu-central-1`)**.
2. Name the database `mos`.
3. Copy the connection string, and make sure you take the **pooled** one. Neon shows both; the
   pooled host has `-pooler` in it:

   ```
   postgres://user:pass@ep-something-pooler.eu-central-1.aws.neon.tech/mos?sslmode=require
   ```

**Take the pooled string, not the direct one.** Each serverless instance opens its own connection,
so under real use the direct endpoint runs out of connections. The app detects `-pooler` in the URL
and turns off prepared statements automatically, because a transaction-mode pooler hands each
transaction to a different backend and a prepared statement doesn't survive that. Get this wrong and
the deployment works fine for you alone, then fails the moment two people use it at once.

## 2 · Create the tables

From your machine, against the hosted database:

```bash
DATABASE_URL="<your pooled connection string>" npm run db:push
```

You should see each migration applied once. Re-running is a no-op — a `_migrations` table records
what has run.

### Do you want the demo factory in there?

**To show the client what it does**, yes — it's the corpus every screen was designed against:

```bash
DATABASE_URL="<your pooled connection string>" npm run db:seed
```

⚠️ **This empties every table first.** Never run it once real factory data is in.

Everything it creates is marked `isDemo` in the database, so the DEMO DATA banner appears on every
screen. That disclosure is structural — don't remove it while demo data is loaded.

**To start clean** for real data, skip the seed. The app shows proper empty states that tell the
user what to import.

## 3 · Deploy

The simplest route is connecting the repository.

1. Sign up at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project**, and import `astra-logic/system-`.
3. Vercel detects Next.js on its own. Leave the build settings alone.
4. Before deploying, open **Environment Variables** and add:

   | Name | Value | Environments |
   |---|---|---|
   | `DATABASE_URL` | your pooled connection string | Production, Preview, Development |

5. Deploy.

### The branch matters

All of this work is on `claude/new-system-project-setup-z04mr4`, and Vercel deploys your
**production branch** — `main` by default, which does not have any of it.

Either set the production branch under **Settings → Git → Production Branch**, or merge the work
into `main` first.

## 4 · Check it

Open the URL Vercel gives you and walk the same path:

- **Today** — should report what needs attention
- **Orders** — the first row is PO-1008, with its customs hold, both dates, and what to do
- **Make** — pick a product, enter `10,000`, press Check
- **Settings** — save a delivery time, then look at Stock

If a page shows *"Something went wrong"*, it is almost always the database. Vercel's
**Deployments → your deployment → Runtime Logs** will name it. The two usual causes:

| What the log says | What it means |
|---|---|
| `ECONNREFUSED` / `timeout` | `DATABASE_URL` is wrong, or you used the direct host instead of the pooled one |
| `relation "items" does not exist` | Step 2 didn't run against this database |
| `prepared statement ... already exists` | A pooled endpoint the URL check didn't recognise — send me the host and I'll widen the detection |

---

## Notes on what was configured, and why

**`vercel.json` pins the region to `fra1` (Frankfurt).** It is Vercel's closest region to Egypt.
Left to itself Vercel would default to Washington DC, putting a transatlantic round trip between
every page and its own database.

**`.env` is no longer committed.** It previously held `app:app` on localhost, which was harmless —
but the file was tracked, so the first real password written into it would have gone to GitHub. It
is now in `.gitignore`, `npm run setup` writes it locally, and `.env.example` documents the shape.

**Connection handling changes by itself in serverless.** One connection per instance instead of
ten, and idle connections released quickly. Nothing changes when you run it locally.

**None of this touches how figures are calculated.** Disabling prepared statements changes how a
query is sent, not how a value is decoded — `numeric` still arrives as a string, so no money or
quantity ever passes through a floating-point number. That is checked rather than assumed: the test
suite asserts it, and it was verified directly with prepared statements both on and off.

## Cost

Free at this size — Neon's free tier and Vercel's Hobby plan both cover a single-site demo
comfortably.

⚠️ **Vercel's Hobby plan is for non-commercial use.** The moment this is running the factory's real
operations, you need a Pro plan. Worth knowing before it becomes an awkward conversation.
