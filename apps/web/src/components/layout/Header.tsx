interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="border-b border-zinc-700/50 bg-zinc-900/50 px-8 py-5">
      <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-100">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      )}
    </header>
  );
}
