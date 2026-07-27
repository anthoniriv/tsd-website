"use client";

// País + estado/provincia dependientes. La lista completa (249 países ISO con sus
// regiones, sin ciudades) vive en `country-region-data` y solo entra al bundle del
// checkout. Los `name` de los controles NO cambian (`{prefix}_country` / `{prefix}_state`),
// así la Server Action y `pickAddress` no se tocan. El valor guardado es el NOMBRE.

import { useMemo, useState } from "react";
import { allCountries } from "country-region-data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const SELECT_CLASS =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

export function CountryStateFields({
  prefix,
  autoPrefix,
  stateLabel,
  countryLabel,
  defaultCountry = "United States",
}: {
  prefix: "ship" | "bill";
  autoPrefix: "shipping" | "billing";
  stateLabel: string;
  countryLabel: string;
  defaultCountry?: string;
}) {
  const [country, setCountry] = useState(defaultCountry);
  const regions = useMemo(
    () => allCountries.find((c) => c[0] === country)?.[2] ?? [],
    [country],
  );

  return (
    <>
      <div className="space-y-1.5">
        <Label>{countryLabel}</Label>
        <select
          name={`${prefix}_country`}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          autoComplete={`${autoPrefix} country-name`}
          className={SELECT_CLASS}
        >
          {allCountries.map(([name]) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>{stateLabel}</Label>
        {regions.length > 0 ? (
          // `key` fuerza remount al cambiar de país → el valor previo no queda "pegado".
          <select
            key={country}
            name={`${prefix}_state`}
            defaultValue=""
            autoComplete={`${autoPrefix} address-level1`}
            className={SELECT_CLASS}
          >
            <option value="" disabled>
              —
            </option>
            {regions.map(([name]) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          // Países sin regiones listadas → texto libre.
          <Input name={`${prefix}_state`} autoComplete={`${autoPrefix} address-level1`} />
        )}
      </div>
    </>
  );
}
