import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Guidelines() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 pt-24">
      <h1 className="text-3xl font-bold mb-6">Student Housing Guidelines</h1>
      
      <Tabs defaultValue="renting" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="renting">Renting Guide</TabsTrigger>
          <TabsTrigger value="tips">Living Tips</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="renting" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Guide to Renting Student Housing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Understanding Your Options</h3>
                <p>
                  Student housing comes in various forms, from on-campus dormitories to off-campus apartments and shared houses. Each option has its advantages and disadvantages regarding cost, location, amenities, and social atmosphere.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">On-Campus Housing</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Convenient location close to classes</li>
                      <li>Meal plans usually available</li>
                      <li>Built-in community and social events</li>
                      <li>Typically more expensive per square foot</li>
                      <li>Limited privacy and space</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Off-Campus Housing</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>More space and privacy options</li>
                      <li>Often more affordable</li>
                      <li>Greater independence</li>
                      <li>May require transportation to campus</li>
                      <li>Responsibility for utilities and amenities</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">The Rental Process</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Determine your budget</span> - Include rent, utilities, food, transportation, and other expenses.
                  </li>
                  <li>
                    <span className="font-medium">Start your search early</span> - The best properties near campus tend to get taken quickly.
                  </li>
                  <li>
                    <span className="font-medium">Visit properties in person</span> - If possible, see the actual unit you'll be renting.
                  </li>
                  <li>
                    <span className="font-medium">Read the lease carefully</span> - Understand your rights and responsibilities before signing.
                  </li>
                  <li>
                    <span className="font-medium">Consider roommates carefully</span> - Ensure you have compatible living habits and expectations.
                  </li>
                  <li>
                    <span className="font-medium">Document everything</span> - Take photos of the property before moving in to record pre-existing damage.
                  </li>
                </ol>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Required Documents</h3>
                <p>Most landlords or property managers will require the following documents:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Proof of income or financial aid</li>
                  <li>Credit check (or a co-signer if you have limited credit history)</li>
                  <li>Student ID or proof of enrollment</li>
                  <li>References from previous landlords (if applicable)</li>
                  <li>Security deposit (typically equal to one month's rent)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tips" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Living Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Budgeting & Finances</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Create a monthly budget that includes all expenses</li>
                    <li>Cook at home instead of eating out to save money</li>
                    <li>Look for student discounts on services and products</li>
                    <li>Consider sharing costs for common household items with roommates</li>
                    <li>Track your spending using a budgeting app</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Safety & Security</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Always lock doors and windows when leaving</li>
                    <li>Get to know your neighbors</li>
                    <li>Have emergency contacts programmed in your phone</li>
                    <li>Consider renter's insurance for your belongings</li>
                    <li>Be aware of campus security resources</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Living with Roommates</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Establish house rules and expectations early</li>
                    <li>Create a cleaning schedule everyone agrees to</li>
                    <li>Communicate openly about issues before they become problems</li>
                    <li>Respect each other's personal space and belongings</li>
                    <li>Plan occasional roommate activities to build positive relationships</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Academic Success</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Create a dedicated study space in your housing</li>
                    <li>Establish a routine that balances study and relaxation</li>
                    <li>Utilize campus resources like libraries and study lounges</li>
                    <li>Form study groups with classmates</li>
                    <li>Minimize distractions during dedicated study times</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Pro Tip: Building Community</h3>
                <p>
                  Get involved in campus activities and organizations to make friends and build connections outside your housing. This can enhance your college experience and provide additional support networks.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>When should I start looking for student housing?</AccordionTrigger>
                  <AccordionContent>
                    It's recommended to begin your search 3-6 months before your intended move-in date. For fall semester housing, start looking in the spring. The best properties near campus tend to be reserved quickly, so starting early gives you more options.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>What's typically included in the rent?</AccordionTrigger>
                  <AccordionContent>
                    This varies by property. Some include utilities (water, electricity, gas), internet, and trash service, while others require you to set up and pay for these separately. Always ask what's included and estimate additional costs when comparing properties.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Do I need a guarantor or co-signer?</AccordionTrigger>
                  <AccordionContent>
                    Many landlords require students to have a guarantor (usually a parent or guardian) who agrees to cover the rent if you cannot pay. This is especially common if you don't have established credit or sufficient income. International students may need to pay additional security deposits if they don't have a U.S.-based guarantor.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>What questions should I ask when viewing a property?</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>What's included in the rent?</li>
                      <li>Are there any additional fees (for amenities, parking, etc.)?</li>
                      <li>What's the policy on guests?</li>
                      <li>How are maintenance issues handled?</li>
                      <li>What's the noise level like?</li>
                      <li>Is there secure storage available?</li>
                      <li>What's the transportation situation to campus?</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>Can I sublet my room during summer break?</AccordionTrigger>
                  <AccordionContent>
                    Subletting policies vary by property. Some leases prohibit subletting entirely, while others allow it with landlord approval. Always check your lease and get written permission before subletting to avoid lease violations.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger>How do I resolve conflicts with roommates?</AccordionTrigger>
                  <AccordionContent>
                    Address issues directly and early with open communication. Create a roommate agreement at the beginning that covers cleaning, guests, quiet hours, and shared expenses. If problems persist, many universities offer mediation services through residential life or student affairs offices.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-7">
                  <AccordionTrigger>What should I do if I need to break my lease?</AccordionTrigger>
                  <AccordionContent>
                    Review your lease for early termination clauses. Some options include finding someone to take over your lease (lease assumption), paying an early termination fee, or subletting if allowed. Always communicate with your landlord rather than simply abandoning the property, which could result in legal action and damage to your credit.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
