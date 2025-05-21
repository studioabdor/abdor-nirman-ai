import { PageHeader } from '@/components/shared/PageHeader';
import EnhanceDetailsForm from './components/EnhanceDetailsForm';

export default function EnhanceDetailsPage() {
  return (
    <>
      <PageHeader 
        title="Enhance Details" 
        description="Upload an image to improve its resolution and detail. Compare before and after." 
      />
      <EnhanceDetailsForm />
    </>
  );
}
