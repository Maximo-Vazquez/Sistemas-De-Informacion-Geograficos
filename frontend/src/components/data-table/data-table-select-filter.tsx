import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Option = { value: string; label: string }
const ALL = "__todos__"

// Filtro rápido de un valor; se aplica al elegir. Vacío equivale a "todos".
export function DataTableSelectFilter({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string
  allLabel: string
  options: Option[]
  value: string
  onChange: (value: string) => void
}) {
  const items = [{ value: ALL, label: allLabel }, ...options]
  return (
    <Select
      items={items}
      value={value || ALL}
      onValueChange={(next) => onChange(!next || next === ALL ? "" : String(next))}
    >
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
