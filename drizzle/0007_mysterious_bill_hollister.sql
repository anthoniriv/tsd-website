CREATE TABLE "order_sequence" (
	"id" text PRIMARY KEY NOT NULL,
	"value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
-- La secuencia arranca con los pedidos ya existentes: así el próximo número no
-- choca con los `TDS-YYYY-XXXX` ya emitidos (la antigua numeración usaba count+1).
INSERT INTO "order_sequence" ("id", "value")
SELECT 'seq', count(*) FROM "orders"
ON CONFLICT ("id") DO NOTHING;
