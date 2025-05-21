import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Combine, ImageIcon, LayoutDashboard, PenTool, PencilRuler, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Sketch to Render",
    description: "Transform your hand-drawn sketches into photorealistic renderings.",
    href: "/sketch-to-render",
    icon: PencilRuler,
    aiHint: "architectural sketch"
  },
  {
    title: "Moodboard Render",
    description: "Merge two images to create unique architectural visualizations.",
    href: "/moodboard-render",
    icon: Combine,
    aiHint: "moodboard collage"
  },
  {
    title: "Text to Render",
    description: "Generate stunning visuals from your textual descriptions.",
    href: "/text-to-render",
    icon: PenTool,
    aiHint: "futuristic city"
  },
  {
    title: "Enhance Details",
    description: "Improve the resolution and clarity of your existing images.",
    href: "/enhance-details",
    icon: Sparkles,
    aiHint: "detailed architecture"
  },
  {
    title: "AI Style Suggestion",
    description: "Get AI-powered style recommendations for your projects.",
    href: "/style-suggestion",
    icon: ImageIcon,
    aiHint: "color palette"
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <header className="my-12">
        <LayoutDashboard className="h-24 w-24 text-primary mx-auto mb-6" />
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Welcome to <span className="text-primary">Nirman AI</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent partner for architectural design and visualization. Explore powerful AI tools to bring your visions to life.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-card/80 hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <feature.icon className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">{feature.title}</CardTitle>
              <CardDescription className="text-center min-h-[40px]">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
               <Link href={feature.href} className="mt-auto">
                <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Try Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
       <section className="my-12 w-full max-w-3xl p-6 bg-card/50 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold text-primary mb-4">Why Choose Nirman AI?</h2>
          <ul className="list-disc list-inside space-y-2 text-left text-foreground/80">
            <li><span className="font-semibold">Speed & Efficiency:</span> Generate renders and ideas in minutes, not days.</li>
            <li><span className="font-semibold">Creative Exploration:</span> Experiment with styles and concepts effortlessly.</li>
            <li><span className="font-semibold">Enhanced Quality:</span> Elevate your presentations with high-detail visualizations.</li>
            <li><span className="font-semibold">User-Friendly:</span> Intuitive interface designed for architects and designers.</li>
          </ul>
        </section>
    </div>
  );
}
