import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    frequency: "/month",
    description: "Get started with basic features.",
    features: [
      "Limited Sketch to Render",
      "Limited Moodboard Renders",
      "Basic Text to Render",
      "Community Support"
    ],
    cta: "Sign Up for Free"
  },
  {
    name: "Pro",
    price: "$29",
    frequency: "/month",
    description: "For professionals and serious hobbyists.",
    features: [
      "Unlimited Sketch to Render",
      "Unlimited Moodboard Renders",
      "Advanced Text to Render Options",
      "High-Resolution Enhancements",
      "AI Style Suggestions",
      "Priority Email Support"
    ],
    cta: "Get Started with Pro",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    frequency: "",
    description: "Tailored solutions for teams and businesses.",
    features: [
      "All Pro Features",
      "Team Collaboration Tools",
      "Custom Model Training (soon)",
      "Dedicated Account Manager",
      "API Access (soon)",
      "24/7 Premium Support"
    ],
    cta: "Contact Sales"
  }
];

export default function PricingPage() {
  return (
    <>
      <PageHeader 
        title="Pricing Plans" 
        description="Choose the plan that best suits your architectural design and rendering needs." 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col bg-card/80 ${tier.popular ? 'border-primary border-2 shadow-primary/30 shadow-lg' : ''}`}>
            {tier.popular && (
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                {tier.frequency && <span className="text-muted-foreground">{tier.frequency}</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <div className="mt-12 text-center bg-card/50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-primary mb-2">Need a custom solution?</h3>
        <p className="text-muted-foreground mb-4">Contact us for bespoke enterprise plans and volume discounts.</p>
        <Button variant="secondary">Talk to Our Team</Button>
      </div>
    </>
  );
}
