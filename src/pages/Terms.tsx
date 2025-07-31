import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Conditions Générales d'Utilisation (CGU)</h1>
        <p className="text-muted-foreground mb-6">Dernière mise à jour : 31/07/2025</p>
        
        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Présentation du service</h2>
            <p className="leading-relaxed">
              StoryKid AI est une plateforme en ligne permettant aux parents de créer des livres personnalisés pour enfants, 
              générés par intelligence artificielle, incluant texte et illustrations. Le site est accessible à l'adresse : https://storykidai.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Éditeur du site</h2>
            <div className="space-y-2">
              <p>Nom commercial : StoryKid AI</p>
              <p>Propriétaire du domaine : enregistré chez Société Ligne Web Services (LWS) via LwsPanel</p>
              <p>Contact : support@storykidai.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Accès au service</h2>
            <p className="leading-relaxed">
              Le service est accessible via abonnement mensuel. L'utilisateur doit créer un compte pour bénéficier des 
              fonctionnalités de génération de livres. Toute inscription implique l'acceptation sans réserve des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Utilisation du contenu</h2>
            <p className="leading-relaxed">
              Les livres générés sont destinés à un usage personnel et familial. L'utilisateur s'engage à ne pas 
              redistribuer commercialement les contenus générés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Données personnelles</h2>
            <p className="leading-relaxed">
              Les données saisies par l'utilisateur (prénom de l'enfant, photo, préférences, etc.) sont strictement 
              utilisées pour la personnalisation du livre. Voir Politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Responsabilité</h2>
            <p className="leading-relaxed">
              StoryKid AI ne peut être tenu responsable des erreurs de contenu généré automatiquement ni de l'usage 
              fait des PDF exportés par l'utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Paiement & abonnement</h2>
            <p className="leading-relaxed">
              Le paiement s'effectue via Stripe. Deux formules sont proposées (Starter & Premium). L'utilisateur peut 
              résilier son abonnement à tout moment depuis son espace personnel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Modification du service</h2>
            <p className="leading-relaxed">
              StoryKid AI se réserve le droit de modifier les fonctionnalités ou les tarifs à tout moment. Les utilisateurs 
              seront informés à l'avance de toute modification importante.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;