import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const TestIntegrations = () => {
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<{[key: string]: boolean | null}>({
    brevo: null,
    smtp: null,
    addToBrevo: null
  });
  const { toast } = useToast();

  const testBrevoConnection = async () => {
    setTesting('brevo');
    try {
      const { data, error } = await supabase.functions.invoke('test-brevo');
      
      if (error) {
        throw error;
      }

      setResults(prev => ({ ...prev, brevo: true }));
      toast({
        title: "✅ Brevo Connection",
        description: "Connexion Brevo réussie",
      });
    } catch (error: any) {
      setResults(prev => ({ ...prev, brevo: false }));
      toast({
        title: "❌ Brevo Connection",
        description: error.message || "Erreur de connexion Brevo",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const testPasswordReset = async () => {
    setTesting('smtp');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail('test@example.com', {
        redirectTo: window.location.origin
      });
      
      if (error) {
        throw error;
      }

      setResults(prev => ({ ...prev, smtp: true }));
      toast({
        title: "✅ SMTP Test",
        description: "Email de réinitialisation envoyé (vérifiez la console Supabase)",
      });
    } catch (error: any) {
      setResults(prev => ({ ...prev, smtp: false }));
      toast({
        title: "❌ SMTP Test",
        description: error.message || "Erreur SMTP",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const testAddToBrevo = async () => {
    setTesting('addToBrevo');
    try {
      const { data, error } = await supabase.functions.invoke('add-to-brevo', {
        body: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          tags: ['welcome']
        }
      });
      
      if (error) {
        throw error;
      }

      setResults(prev => ({ ...prev, addToBrevo: true }));
      toast({
        title: "✅ Add to Brevo",
        description: "Contact ajouté à Brevo avec succès",
      });
    } catch (error: any) {
      setResults(prev => ({ ...prev, addToBrevo: false }));
      toast({
        title: "❌ Add to Brevo",
        description: error.message || "Erreur ajout Brevo",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return null;
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="outline">Non testé</Badge>;
    return status ? 
      <Badge className="bg-green-500 hover:bg-green-600">✅ OK</Badge> : 
      <Badge variant="destructive">❌ Erreur</Badge>;
  };

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">🧪 Tests d'Intégration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(results.brevo)}
              <span className="font-medium">Connexion Brevo API</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(results.brevo)}
              <Button 
                size="sm" 
                onClick={testBrevoConnection}
                disabled={testing === 'brevo'}
              >
                {testing === 'brevo' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Tester
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(results.smtp)}
              <span className="font-medium">SMTP (Reset Password)</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(results.smtp)}
              <Button 
                size="sm" 
                onClick={testPasswordReset}
                disabled={testing === 'smtp'}
              >
                {testing === 'smtp' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Tester
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(results.addToBrevo)}
              <span className="font-medium">Ajout Contact Brevo</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(results.addToBrevo)}
              <Button 
                size="sm" 
                onClick={testAddToBrevo}
                disabled={testing === 'addToBrevo'}
              >
                {testing === 'addToBrevo' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Tester
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
          💡 Testez chaque intégration pour vérifier que tout fonctionne correctement
        </div>
        
      </CardContent>
    </Card>
  );
};

export default TestIntegrations;