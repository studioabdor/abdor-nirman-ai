import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Linkedin, Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <PageHeader 
        title="About Nirman AI" 
        description="Learn more about the vision and the creator behind Nirman AI." 
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="bg-card/80 shadow-lg">
            <CardHeader className="items-center text-center">
               <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary mb-4">
                <Image 
                  src="https://placehold.co/200x200.png" // Placeholder for Jatin's photo
                  alt="Jatin Sheoran" 
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint="professional headshot"
                />
              </div>
              <CardTitle className="text-2xl text-primary">Jatin Sheoran</CardTitle>
              <p className="text-muted-foreground">Architect & Creator of Nirman AI</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center text-muted-foreground mb-2">
                <Briefcase className="h-4 w-4 mr-2 text-primary" />
                <span>6+ Years of Experience</span>
              </div>
              <div className="flex items-center justify-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>Delhi, India</span>
              </div>
              <div className="mt-4">
                <Link href="https://www.linkedin.com/in/jatin-sheoran-example" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="bg-card/80 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Meet the Creator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90">
              <p>
                Jatin Sheoran is a passionate architect with over six years of professional experience in designing and executing a diverse range of architectural projects. Based in Delhi, India, Jatin has always been at the forefront of integrating technology with design to enhance creativity and efficiency in the architectural workflow.
              </p>
              <p>
                His journey into the world of AI-driven design tools began with a vision to empower architects and designers with intelligent solutions that could streamline complex tasks, foster innovation, and bring creative ideas to life more vividly and rapidly. Nirman AI is the culmination of this vision, born from Jatin's deep understanding of architectural challenges and his belief in the transformative power of artificial intelligence.
              </p>
              <h3 className="text-lg font-semibold text-primary pt-2">Our Mission</h3>
              <p>
                At Nirman AI, our mission is to provide architects, designers, and creators with cutting-edge AI tools that are intuitive, powerful, and seamlessly integrated into their creative process. We aim to democratize access to advanced visualization and design assistance, enabling users to explore new possibilities and achieve exceptional results.
              </p>
              <p>
                We are committed to continuous innovation, user-centric design, and building a community where technology and creativity converge to shape the future of architecture.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
