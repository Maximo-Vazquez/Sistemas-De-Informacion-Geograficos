import { Cell, Label, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatPct } from "@/lib/format"

export type DonutItem = { key: string; label: string; value: number; color: string }

// Parte de un todo de un vistazo (skill dataviz): máximo 6 segmentos, colores de la paleta de
// gráficos en orden fijo (nunca por ranking), total en el centro y leyenda con importe y % que
// funciona también como vista en texto. Los segmentos en cero se omiten del anillo pero quedan
// en la leyenda para no perder categorías.
export function DonutChart({
  items,
  total,
  centerLabel,
  formatValue,
  ariaLabel,
}: {
  items: DonutItem[]
  total?: number
  centerLabel: string
  formatValue: (value: number) => string
  ariaLabel: string
}) {
  const suma = total ?? items.reduce((acc, item) => acc + item.value, 0)
  const visibles = items.filter((item) => item.value > 0)
  const config = Object.fromEntries(
    items.map((item) => [item.key, { label: item.label, color: item.color }]),
  ) satisfies ChartConfig
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <ChartContainer
        config={config}
        className="aspect-square h-56 w-56 shrink-0"
        aria-label={ariaLabel}
      >
        <PieChart accessibilityLayer>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="key"
                hideLabel
                formatter={(value, _name, entry) => (
                  <span className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">{entry.payload.label}</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatValue(Number(value))}
                    </span>
                  </span>
                )}
              />
            }
          />
          <Pie
            data={visibles}
            dataKey="value"
            nameKey="key"
            innerRadius="62%"
            outerRadius="100%"
            paddingAngle={visibles.length > 1 ? 1.5 : 0}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {visibles.map((item) => (
              <Cell key={item.key} fill={item.color} />
            ))}
            <Label
              content={({ viewBox }) =>
                viewBox && "cx" in viewBox ? (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - 8}
                      className="fill-foreground text-base font-semibold tabular-nums"
                    >
                      {formatValue(suma)}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 14}
                      className="fill-muted-foreground text-xs"
                    >
                      {centerLabel}
                    </tspan>
                  </text>
                ) : null
              }
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul
        className="flex w-full max-w-sm flex-col gap-2 text-sm"
        aria-label={`Detalle de ${ariaLabel}`}
      >
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-muted-foreground">{item.label}</span>
            <span className="font-medium tabular-nums">{formatValue(item.value)}</span>
            <span className="w-14 text-right text-xs text-muted-foreground tabular-nums">
              {suma ? formatPct((item.value / suma) * 100) : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
