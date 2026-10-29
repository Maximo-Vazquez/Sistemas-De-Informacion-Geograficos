import googleG from "@/assets/google-g.svg"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Botón estándar "Continuar con Google": fondo neutro, borde y la G oficial a color.
// Envía un POST real al login de allauth (SOCIALACCOUNT_LOGIN_ON_GET = False).
export function GoogleLoginButton({
  action,
  csrf,
  next,
  label = "Continuar con Google",
  className,
}: {
  action: string
  csrf: string
  next?: string
  label?: string
  className?: string
}) {
  return (
    <form method="post" action={action} className={className}>
      <input type="hidden" name="csrfmiddlewaretoken" value={csrf} />
      <input type="hidden" name="process" value="login" />
      {next && <input type="hidden" name="next" value={next} />}
      <Button type="submit" size="lg" variant="outline" className={cn("w-full gap-3 font-medium")}>
        <img src={googleG} alt="" aria-hidden="true" className="size-5" />
        {label}
      </Button>
    </form>
  )
}
