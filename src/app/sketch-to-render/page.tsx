import { PageHeader } from '@/components/shared/PageHeader';
import SketchToRenderForm from './components/SketchToRenderForm';

export default function SketchToRenderPage() {
  return (
    <>
      <PageHeader 
        title="Sketch to Render" 
        description="Upload your architectural sketch, select your desired output settings, and let our AI transform it into a realistic image." 
      />
      <SketchToRenderForm />
    </>
  );
}
