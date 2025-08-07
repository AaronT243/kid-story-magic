import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Politique de confidentialité</h1>
        
        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Données collectées</h2>
            <p className="leading-relaxed">
              Nous collectons uniquement les informations nécessaires pour générer les livres personnalisés 
              (nom, âge, passions de l'enfant, photo facultative, email, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Utilisation des données</h2>
            <p className="mb-3">Les données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Créer et personnaliser les histoires</li>
              <li>Envoyer des emails liés au service (confirmation, rappels, newsletters si consentement)</li>
              <li>Gérer l'abonnement de l'utilisateur</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Conservation & sécurité</h2>
            <p className="leading-relaxed">
              Les données sont conservées tant que l'abonnement est actif. Elles sont stockées de manière sécurisée 
              et ne sont jamais revendues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Services tiers</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Paiement sécurisé via Stripe</li>
              <li>Génération d'images et de textes via OpenAI API</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Vos droits</h2>
            <p className="mb-3">Conformément au RGPD, vous pouvez demander à tout moment :</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>L'accès à vos données</li>
              <li>Leur modification</li>
              <li>Leur suppression</li>
            </ul>
            <p className="font-medium">Contact : support@storykidai.com</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;