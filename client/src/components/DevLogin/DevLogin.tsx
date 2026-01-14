import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Unlock, CheckCircle2, LayoutDashboard } from 'lucide-react';
import axios from 'axios';

const DevLogin = () => {
  const [status, setStatus] = useState({
    devMode: false,
    authenticated: false,
    user: null,
    adminBypass: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await axios.get('/api/auth/dev-status');
        setStatus(data);
      } catch (e) {
        setStatus(prev => ({ ...prev, devMode: false }));
      }
    };
    checkStatus();
  }, []);

  const handleLogin = () => {
    setLoading(true);
    // Directly navigate to the endpoint. 
    // The backend will handle the session and redirect back to home.
    window.location.href = '/api/auth/dev-login';
  };

  if (!status.devMode || !status.adminBypass) return null;

  return (
    <div className="container max-w-2xl mx-auto mt-10 px-4">
      <Card className="border-amber-500 shadow-lg bg-amber-50/50">
        <CardHeader className="border-b border-amber-200 bg-amber-100/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-900 tracking-tight">Development Bypass</CardTitle>
          </div>
          <CardDescription className="text-amber-800 font-medium">
            Internal tool: Access admin features without Google/Raven login.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {!status.authenticated ? (
            <div className="space-y-4">
              <p className="text-sm text-amber-900">
                You are currently in a development environment. Click below to generate a mock admin session.
              </p>
              <Button 
                onClick={handleLogin} 
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
              >
                <Unlock className="h-4 w-4" />
                {loading ? "Initializing..." : "Login as Dev Admin"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-emerald-100 border-emerald-500 text-emerald-900">
                <CheckCircle2 className="h-4 w-4 mt-1" stroke="#065f46" />
                <AlertTitle className="font-bold">Authenticated</AlertTitle>
                <AlertDescription>
                  Logged in as <strong>{status.user?.displayName}</strong>
                </AlertDescription>
              </Alert>
              
              <div className="text-sm space-y-1 py-2 text-zinc-600">
                <p><strong>ID:</strong> {status.user?.id}</p>
                <p><strong>Email:</strong> {status.user?.email}</p>
              </div>

              <Button asChild className="w-full gap-2">
                <a href="/committee">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Committee Dashboard
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevLogin;