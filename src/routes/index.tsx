import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TTT — Hyvinvoinnin moduulipohjainen analyysialusta" },
      {
        name: "description",
        content:
          "Avoin pipeline tuottaa JSON-näkymät; jokainen visualisointimoduuli rakentuu pluginina. Suomen hyvinvointi tiedolla, koodilla ja kuvilla.",
      },
    ],
  }),
  component: Landing,
});

type ModuleEntry = {
  module_id: string;
  title: string;
  priority: number;
  view: string;
  status: "stub" | "partial" | "ready" | string;
  sources_used: string[];
  sources_missing: string[];
};

type ModulesIndex = {
  generated_at: string;
  modules: ModuleEntry[];
};

const PRIORITY_LABELS: Record<number, string> = {
  1: "Kriittinen",
  2: "Strateginen",
  3: "Laajennus",
};

const STATUS_LABELS: Record<string, string> = {
  ready: "Valmis",
  partial: "Osittainen",
  stub: "Suunnitteilla",
};

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />
      <Hero />
      <Manifesto />
      <ModuleShowcase />
      <Pipeline />
      <CTA />
      <SiteFooter />
    </div>
  );
}

/* ───────────────────────── Header ───────────────────────── */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <Mark />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight">TTT</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Tieto · Trendit · Toimenpiteet
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#moduulit" className="transition-colors hover:text-foreground">
            Moduulit
          </a>
          <a href="#pipeline" className="transition-colors hover:text-foreground">
            Pipeline
          </a>
          <a href="#manifesti" className="transition-colors hover:text-foreground">
            Periaatteet
          </a>
          <Link
            to="/plugins"
            className="transition-colors hover:text-foreground"
          >
            Plugin-käynnistin
          </Link>
        </nav>
        <Link
          to="/plugins"
          className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Avaa demo
          <span aria-hidden>→</span>
        </Link>
      </div>
    </header>
  );
}

function Mark() {
  return (
    <span
      className="grid h-9 w-9 place-items-center rounded-md text-sm font-bold"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-accent), var(--brand-accent-soft))",
        color: "var(--brand-ink)",
        boxShadow: "var(--shadow-elev)",
      }}
    >
      T·
    </span>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-border/60"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <Grid />
      <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-20 md:pt-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Avoin alusta · v0.10
        </span>
        <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl lg:text-[88px]">
          Hyvinvoinnin
          <br />
          <span
            className="italic"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--brand-accent-soft), var(--brand-accent))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            pitkät linjat
          </span>{" "}
          — moduuleina.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          TTT on avoin pipeline ja plugin-arkkitehtuuri, joka muuttaa Tilastokeskuksen,
          THL:n, OECD:n ja Eurostatin datasarjat tarkistettaviksi JSON-näkymiksi.
          Jokainen visualisointi on itsenäinen moduuli — laajenna, korvaa, haarauta.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/plugins"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            Käynnistä plugin-host
            <span aria-hidden>→</span>
          </Link>
          <a
            href="#moduulit"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-card"
          >
            Selaa 10 moduulia
          </a>
        </div>
        <dl className="mt-20 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border/50 pt-10 md:grid-cols-4">
          <Stat k="10" v="moduulia" sub="moduli011–020" />
          <Stat k="80+" v="JSON-näkymää" sub="pipelinen tuottamia" />
          <Stat k="35 v" v="aikasarjoja" sub="1990 → 2024" />
          <Stat k="MIT" v="lisenssi" sub="haarauta vapaasti" />
        </dl>
      </div>
    </section>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div>
      <div className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {k}
      </div>
      <div className="mt-1 text-sm font-medium">{v}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Grid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage:
          "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }}
    />
  );
}

/* ───────────────────────── Manifesto ───────────────────────── */

function Manifesto() {
  const points = [
    {
      n: "01",
      title: "Data on lähde, ei lopputuote.",
      body: "Pipeline lukee viralliset rekisterit ja kirjoittaa versioidut JSON-näkymät. Jokainen luku on jäljitettävissä taulukkoon ja koodiriviin.",
    },
    {
      n: "02",
      title: "Visualisointi on plugin.",
      body: "Etusivun ydin pysyy pienenä. Uusi näkökulma tarkoittaa uutta kansiota — ei haaraa monoliittiin.",
    },
    {
      n: "03",
      title: "Hypoteesit testataan.",
      body: "Detrendaus, viive- ja falsifiointitestit ajetaan automaattisesti. Korrelaatio ei ole väite, ennen kuin se kestää.",
    },
  ];
  return (
    <section id="manifesti" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <SectionEyebrow>Periaatteet</SectionEyebrow>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Kolme sääntöä, joista kaikki muu seuraa.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            TTT on rakennettu siten, että sama pipeline palvelee tutkijaa,
            toimittajaa ja päättäjää — ilman mustaa laatikkoa.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {points.map((p) => (
            <article
              key={p.n}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-colors hover:border-accent/60"
            >
              <div className="font-mono text-xs text-muted-foreground">{p.n}</div>
              <h3 className="mt-6 font-display text-2xl font-semibold leading-snug tracking-tight">
                {p.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)",
                }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Modules ───────────────────────── */

function ModuleShowcase() {
  const [data, setData] = useState<ModulesIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "1" | "2" | "3">("all");

  useEffect(() => {
    fetch("/data/views/_modules_index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const modules = data?.modules ?? [];
  const visible =
    filter === "all"
      ? modules
      : modules.filter((m) => String(m.priority) === filter);

  return (
    <section id="moduulit" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionEyebrow>Moduulikartta</SectionEyebrow>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Kymmenen näkökulmaa Suomen hyvinvointiin.
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Jokainen moduuli on oma JSON-näkymä ja oma plugin. Lisää uusi
              haaraan <code className="font-mono text-foreground">moduli021_…</code>{" "}
              ja se ilmestyy tähän automaattisesti.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "1", "2", "3"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={
                  "rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition-colors " +
                  (filter === k
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-muted-foreground hover:text-foreground")
                }
              >
                {k === "all" ? "Kaikki" : PRIORITY_LABELS[Number(k)]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Moduulihakemiston lataus epäonnistui: {error}
          </div>
        )}

        {!data && !error && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-border bg-card/40"
              />
            ))}
          </div>
        )}

        {data && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((m) => (
              <ModuleCard key={m.module_id} m={m} />
            ))}
            <AddModuleCard />
          </div>
        )}

        {data && (
          <p className="mt-10 text-xs text-muted-foreground">
            Hakemisto päivitetty:{" "}
            <span className="font-mono text-foreground/70">
              {new Date(data.generated_at).toLocaleString("fi-FI")}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}

function ModuleCard({ m }: { m: ModuleEntry }) {
  const id = m.module_id.split("_")[0]; // moduli011
  const subtitle = m.title.split("—").pop()?.trim() ?? m.title;
  const statusLabel = STATUS_LABELS[m.status] ?? m.status;
  const accent =
    m.status === "ready"
      ? "text-accent border-accent/40 bg-accent/10"
      : m.status === "partial"
        ? "text-foreground border-border bg-muted/40"
        : "text-muted-foreground border-border/60 bg-transparent";

  return (
    <a
      href={`/${m.view}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-[var(--shadow-elev)]"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {id}
          </span>
          <span
            className={
              "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider " +
              accent
            }
          >
            {statusLabel}
          </span>
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold leading-snug tracking-tight">
          {subtitle}
        </h3>
        <p className="mt-3 text-xs text-muted-foreground">
          {PRIORITY_LABELS[m.priority] ?? `P${m.priority}`} ·{" "}
          {m.sources_used.length} / {m.sources_used.length + m.sources_missing.length}{" "}
          lähdettä
        </p>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted-foreground/70 truncate">
          {m.view}
        </span>
        <span
          aria-hidden
          className="text-accent transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </a>
  );
}

function AddModuleCard() {
  return (
    <div className="flex flex-col items-start justify-between rounded-2xl border border-dashed border-border/60 bg-transparent p-6 text-muted-foreground">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider">+ uusi</div>
        <h3 className="mt-5 font-display text-xl font-semibold leading-snug tracking-tight text-foreground">
          Lisää moduli021
        </h3>
        <p className="mt-3 text-xs leading-relaxed">
          Määrittele <code className="font-mono">MODULE_SPECS</code>-listaan,
          aja pipeline ja kortti ilmestyy tähän automaattisesti.
        </p>
      </div>
      <code className="mt-8 rounded-md bg-muted/40 px-2 py-1 font-mono text-[10px] text-foreground/70">
        scripts/ttt_pipeline.py --step module_views
      </code>
    </div>
  );
}

/* ───────────────────────── Pipeline ───────────────────────── */

function Pipeline() {
  const steps = [
    {
      k: "01",
      t: "Lähteet",
      d: "Tilastokeskus, THL, OECD, Eurostat, World Bank — REST & CSV.",
    },
    {
      k: "02",
      t: "Pipeline",
      d: "Python lataa, normalisoi, detrendaa ja testaa hypoteesit.",
    },
    {
      k: "03",
      t: "JSON-näkymät",
      d: "Versionhallitut tiedostot kansiossa public/data/views/.",
    },
    {
      k: "04",
      t: "Plugin-host",
      d: "Selaimessa: jokainen moduuli mounttaa oman näkymänsä.",
    },
  ];
  return (
    <section
      id="pipeline"
      className="relative overflow-hidden border-b border-border/60"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-24">
        <SectionEyebrow>Arkkitehtuuri</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Datasta moduuliksi neljässä vaiheessa.
        </h2>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {steps.map((s) => (
            <li key={s.k} className="bg-card p-8">
              <div className="font-mono text-xs text-accent">{s.k}</div>
              <div className="mt-6 font-display text-2xl font-semibold tracking-tight">
                {s.t}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-background/60 p-6 font-mono text-xs leading-relaxed text-muted-foreground md:grid-cols-2">
          <div>
            <div className="mb-2 text-foreground">$ ajaa koko ketjun</div>
            <pre className="whitespace-pre-wrap text-foreground/80">
{`python scripts/ttt_pipeline.py
  → fetch · transform · validate
  → write public/data/views/*.json
  → emit  _modules_index.json`}
            </pre>
          </div>
          <div>
            <div className="mb-2 text-foreground">$ uusi visualisointi</div>
            <pre className="whitespace-pre-wrap text-foreground/80">
{`mkdir public/plugins/oma-moduli
echo '{ "id": "oma-moduli", … }' > manifest.json
# core.data.load('/data/views/v_moduli021_*.json')`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */

function CTA() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div
          className="relative overflow-hidden rounded-3xl border border-border p-12 md:p-16"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          <Grid />
          <div className="relative max-w-3xl">
            <SectionEyebrow>Aloita</SectionEyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Avaa demo, kloonaa repo,
              <br />
              rakenna oma näkemys.
            </h2>
            <p className="mt-6 max-w-xl text-base text-muted-foreground">
              Plugin-käynnistin näyttää kaikki rekisterissä olevat moduulit.
              Pipeline ja koodi ovat avoimia — ehdota muutoksia GitHubissa.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/plugins"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                Avaa plugin-käynnistin →
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-card"
              >
                GitHub-repo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Footer ───────────────────────── */

function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-12 text-sm text-muted-foreground md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Mark />
          <div>
            <div className="font-display text-base font-semibold text-foreground">
              TTT
            </div>
            <div className="text-xs">© {new Date().getFullYear()} · MIT-lisenssi</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <a href="#moduulit" className="hover:text-foreground">
            Moduulit
          </a>
          <a href="#pipeline" className="hover:text-foreground">
            Pipeline
          </a>
          <Link to="/plugins" className="hover:text-foreground">
            Plugin-host
          </Link>
        </div>
      </div>
    </footer>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
      <span className="h-px w-8 bg-accent" />
      {children}
    </div>
  );
}
