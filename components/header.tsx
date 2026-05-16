export default function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-30 transition-[padding] duration-200 ease-linear">
      <div className="flex items-center px-4 w-full justify-between">
        {children}
      </div>
    </header>
  );
}
