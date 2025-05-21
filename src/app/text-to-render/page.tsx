import { PageHeader } from '@/components/shared/PageHeader';
import TextToRenderForm from './components/TextToRenderForm';

export default function TextToRenderPage() {
  return (
    <>
      <PageHeader 
        title="Text to Render" 
        description="Describe your vision in words, and our AI will generate a corresponding image." 
      />
      <TextToRenderForm />
    </>
  );
}
