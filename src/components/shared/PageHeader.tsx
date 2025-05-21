interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 text-center md:text-left">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2">{title}</h1>
      <p className="text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
