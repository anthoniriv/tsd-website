CREATE TABLE "site_media" (
	"key" text PRIMARY KEY NOT NULL,
	"img" text NOT NULL,
	"label" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
