// Mock del cliente Drizzle (`@/db`) para pruebas funcionales sin una BD real.
//
// Drizzle encadena métodos (`db.select().from().where()…`) y el resultado es "thenable"
// (se resuelve al hacer `await`). Este proxy imita eso: cualquier método devuelve el
// mismo proxy y registra la llamada; al hacer `await` saca el próximo valor de una cola
// que la prueba prepara de antemano. Así se controla qué "devuelve la BD" en cada paso
// y se pueden inspeccionar los argumentos (p. ej. el objeto que se intenta insertar).

type Call = { method: string; args: unknown[] };

export function installDbMock() {
  const queue: unknown[] = [];
  const calls: Call[] = [];

  const handler: ProxyHandler<(...a: unknown[]) => unknown> = {
    get(_t, prop) {
      if (prop === "then") {
        // `await proxy` → resuelve con el próximo valor encolado (o [] si no hay).
        return (resolve: (v: unknown) => void) =>
          resolve(queue.length ? queue.shift() : []);
      }
      return (...args: unknown[]) => {
        calls.push({ method: String(prop), args });
        return proxy;
      };
    },
    apply() {
      return proxy;
    },
  };

  const proxy = new Proxy(function () {}, handler) as unknown;
  (globalThis as Record<string, unknown>).__dbmock = { queue, calls };
  return proxy;
}

function store() {
  return (globalThis as Record<string, unknown>).__dbmock as {
    queue: unknown[];
    calls: Call[];
  };
}

/** Encola los valores que `await` irá devolviendo, en orden de consulta. */
export function queueDb(...values: unknown[]) {
  store().queue.push(...values);
}

/** Todas las llamadas registradas (método + argumentos), en orden. */
export function dbCalls(): Call[] {
  return store().calls;
}

/** El primer objeto pasado a `.values(...)` que contenga la clave dada (p. ej. un insert). */
export function valuesWith(key: string): Record<string, unknown> | undefined {
  for (const c of store().calls) {
    if (c.method === "values") {
      const arg = c.args[0] as Record<string, unknown> | undefined;
      if (arg && key in arg) return arg;
    }
  }
  return undefined;
}

export function resetDb() {
  const m = store();
  if (m) {
    m.queue.length = 0;
    m.calls.length = 0;
  }
}
