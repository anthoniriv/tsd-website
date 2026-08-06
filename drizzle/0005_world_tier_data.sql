-- Fusión de tiers: el negocio solo distingue USA/Canadá del resto del mundo.
--
-- `es` pasa a ser `world` (son los precios que el cliente aprobó en las láminas)
-- y `latam` desaparece del catálogo. Los pedidos NO se tocan: `orders.tier` es un
-- snapshot histórico de con qué tarifa se cotizó cada uno.

UPDATE "product_prices" SET "tier" = 'world' WHERE "tier" = 'es';
DELETE FROM "product_prices" WHERE "tier" = 'latam';
