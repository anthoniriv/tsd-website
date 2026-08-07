-- Renovaciones y ampliaciones de cobertura son productos de catálogo, pero no
-- encajaban en laptop/cable/finder. Cada una tendrá su grid en /producto y su
-- filtro en /tienda.
ALTER TYPE "public"."product_category" ADD VALUE 'renewal';--> statement-breakpoint
ALTER TYPE "public"."product_category" ADD VALUE 'upgrade';
