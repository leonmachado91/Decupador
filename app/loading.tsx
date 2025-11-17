export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Carregando...</span>
      </div>
    </div>
  )
}