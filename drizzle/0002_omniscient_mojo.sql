CREATE TYPE "public"."order_email_kind" AS ENUM('confirmation', 'status_update', 'notification');--> statement-breakpoint
CREATE TYPE "public"."order_email_status" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"shipping_cents" integer DEFAULT 0 NOT NULL,
	"shipping_eta" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"kind" "order_email_kind" NOT NULL,
	"status" "order_email_status" NOT NULL,
	"recipient" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_emails" ADD CONSTRAINT "order_emails_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_emails_order_idx" ON "order_emails" USING btree ("order_id","created_at");