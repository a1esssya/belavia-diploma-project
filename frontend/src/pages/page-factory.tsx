import { AppNav } from '@/components/layout/app-nav';
import { PageShell } from '@/components/ui/page-shell';
import { PlaceholderCard } from '@/components/ui/placeholder-card';

type Props = {
  title: string;
  subtitle: string;
  blocks: Array<{ title: string; description: string }>;
};

export function PlaceholderPage({ title, subtitle, blocks }: Props) {
  return (
    <PageShell subtitle={subtitle} title={title}>
      <AppNav />
      {blocks.map((block) => (
        <PlaceholderCard key={block.title} title={block.title} description={block.description} />
      ))}
    </PageShell>
  );
}
