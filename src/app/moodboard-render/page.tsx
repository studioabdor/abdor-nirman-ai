import { PageHeader } from '@/components/shared/PageHeader';
import MoodboardRenderForm from './components/MoodboardRenderForm';

export default function MoodboardRenderPage() {
  return (
    <>
      <PageHeader 
        title="Moodboard Render" 
        description="Merge two images with a chosen architectural style to create compelling new visuals." 
      />
      <MoodboardRenderForm />
    </>
  );
}
