import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TestBrevo: React.FC = () => {
  const [testing, setTesting] = useState(false);

  const testBrevoConnection = async () => {
    setTesting(true);
    try {
      console.log('Testing Brevo connection...');
      const result = await supabase.functions.invoke('test-brevo');
      console.log('Test Brevo result:', result);
      
      if (result.error) {
        toast({
          title: 'Erreur Brevo',
          description: `Erreur: ${result.error}`,
          variant: 'destructive',
        });
      } else if (result.data?.success) {
        toast({
          title: 'Brevo OK',
          description: 'Connexion Brevo réussie!',
        });
      } else {
        toast({
          title: 'Erreur Brevo',
          description: 'Réponse inattendue de Brevo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Test Brevo error:', error);
      toast({
        title: 'Erreur Brevo',
        description: 'Impossible de tester la connexion Brevo',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const testBrevoSignup = async () => {
    setTesting(true);
    try {
      console.log('Testing Brevo signup...');
      const result = await supabase.functions.invoke('add-to-brevo', {
        body: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          listId: 2,
          tags: ['test_user', 'manual_test']
        }
      });
      console.log('Test signup result:', result);
      
      if (result.error) {
        toast({
          title: 'Erreur inscription Brevo',
          description: `Erreur: ${result.error}`,
          variant: 'destructive',
        });
      } else if (result.data?.success) {
        toast({
          title: 'Test inscription OK',
          description: 'Contact test ajouté à Brevo!',
        });
      } else {
        toast({
          title: 'Erreur inscription',
          description: 'Réponse inattendue pour l\'inscription',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Test signup error:', error);
      toast({
        title: 'Erreur inscription',
        description: 'Impossible de tester l\'inscription Brevo',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={testBrevoConnection}
        disabled={testing}
      >
        {testing ? 'Test...' : 'Test Brevo Connection'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={testBrevoSignup}
        disabled={testing}
      >
        {testing ? 'Test...' : 'Test Brevo Signup'}
      </Button>
    </div>
  );
};

export default TestBrevo;