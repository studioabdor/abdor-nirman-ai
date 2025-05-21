import { PageHeader } from '@/components/shared/PageHeader';
import StyleSuggestionForm from './components/StyleSuggestionForm';

export default function StyleSuggestionPage() {
  return (
    <>
      <PageHeader 
        title="AI Style Suggestion" 
        description="Get intelligent style and enhancement recommendations based on your input and (mocked) project history." 
      />
      <StyleSuggestionForm />
    </>
  );
}
