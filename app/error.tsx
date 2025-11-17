"use client"

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-3">
        <h2 className="text-2xl font-bold">Algo deu errado</h2>
        <p className="text-muted-foreground">{error.message || 'Erro inesperado'}</p>
      </div>
    </div>
  )
}