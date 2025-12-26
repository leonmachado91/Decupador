"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectedFrom") || "/"

  const supabase = createSupabaseBrowserClient()

  const handleAuth = async () => {
    setError(null)
    setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setError("Sessão não retornada.")
      setLoading(false)
      return
    }

    router.push(redirectTo)
  }

  const handleSignup = async () => {
    setError(null)
    setLoading(true)
    const { error: signError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (signError) {
      setError(signError.message)
      setLoading(false)
      return
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-muted-foreground">
            Use seu email para entrar ou criar uma conta.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleAuth} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" /> Entrar
              </>
            )}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleSignup} disabled={loading}>
            Criar conta
          </Button>
        </div>
      </Card>
    </div>
  )
}
