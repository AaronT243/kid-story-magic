import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Mail, Clock, HelpCircle } from "lucide-react";
const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Besoin d'aide ou de renseignements ?</h1>
          <p className="text-lg text-muted-foreground">Notre équipe est là pour vous aider !</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Mail className="w-8 h-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Contactez-nous par email :</p>
              <a 
                href="mailto:support@storykidai.com" 
                className="text-primary hover:underline font-medium"
              >
                support@storykidai.com
              </a>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="w-8 h-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">Horaires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Disponible du lundi au vendredi</p>
              <p className="font-medium text-foreground">de 9h à 18h</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <HelpCircle className="w-8 h-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Consultez notre section d'aide</p>
              <p className="text-foreground font-medium">pour les questions fréquentes</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;