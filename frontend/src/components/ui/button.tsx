import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Sólidos con brillo interno sutil; alturas alineadas con Input y Select (h-9 = 36 px).
// En pantallas táctiles (pointer-coarse) crecen a 44 px: mínimo de Apple HIG y WCAG 2.5.5.
const solid =
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.12)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_2px_6px_-1px_rgb(0_0_0/0.18)] active:shadow-[inset_0_1px_2px_rgb(0_0_0/0.18)]"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-0 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 motion-reduce:transition-none motion-reduce:active:scale-100 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground hover:bg-primary/90 ${solid}`,
        success: `bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/40 ${solid}`,
        destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40 ${solid}`,
        warning: `bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning/50 ${solid}`,
        outline:
          "border-input bg-background shadow-xs hover:border-primary/40 hover:bg-accent hover:text-accent-foreground aria-expanded:border-primary/40 aria-expanded:bg-accent aria-expanded:text-accent-foreground dark:bg-input/20 dark:hover:bg-accent",
        // Acción secundaria con texto de marca ("Administrar", "Renovar"): suma color sin competir
        // con el botón primario relleno.
        "outline-primary":
          "border-input bg-background text-primary shadow-xs hover:border-primary/40 hover:bg-primary/5 aria-expanded:border-primary/40 aria-expanded:bg-primary/5 dark:bg-input/20 dark:hover:bg-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_6%)] aria-expanded:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_6%)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        link: "h-auto! px-0! text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 pointer-coarse:h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 pointer-coarse:h-9 rounded-md px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 pointer-coarse:h-10 rounded-md px-3 text-[0.8125rem] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 pointer-coarse:h-12 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9 pointer-coarse:size-11",
        "icon-xs": "size-7 rounded-md pointer-coarse:size-9 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-md pointer-coarse:size-10",
        "icon-lg": "size-10 pointer-coarse:size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
