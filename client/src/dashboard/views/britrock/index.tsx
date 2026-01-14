import React, { useState, useMemo } from 'react';
import {
  Ticket,
  Film,
  MapPin,
  Calendar,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import PayPalButtons from '@/components/PayPalButton/PayPalButtons';

const BritRock = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Generate ID once and persist it through re-renders
  const ticketId = useMemo(() => {
    const part1 = Math.floor(Math.random() * 900) + 100;
    const part2 = Math.floor(Math.random() * 900) + 100;
    return `${part1}-${part2}`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-2 border-emerald-500 shadow-2xl overflow-hidden">
          <div className="bg-emerald-500 p-8 text-center text-white">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">
              Booking Confirmed!
            </h2>
          </div>
          <CardContent className="p-8 space-y-6 text-center">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                Your Digital Ticket ID
              </p>
              <p className="text-5xl font-black font-mono text-zinc-900">
                #{ticketId}
              </p>
            </div>
            <div className="h-px bg-zinc-100 w-full" />
            <p className="text-zinc-600 font-medium leading-relaxed">
              Please take a screenshot of this ID. It has been sent to your
              PayPal email address. Present this ID at the Divinity School
              entrance for admission.
            </p>
            <Alert className="bg-amber-50 border-amber-200 text-amber-800 text-left">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs font-bold">
                Refunds are not available after November 15th.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
      {err && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{err}</AlertDescription>
        </Alert>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-primary text-zinc-900 font-black italic tracking-widest uppercase py-1 px-4">
          2025 Film Tour
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
          BritRock <span className="text-primary">CUMC</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Event Details */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-none bg-zinc-50 rounded-3xl p-8">
            <CardContent className="p-0 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" /> The Program
                </h3>
                <p className="text-zinc-600 leading-relaxed font-medium text-sm">
                  The Brit Rock Film Tour 2025 program presents a stunning
                  line-up of the UK’s best climbing and adventure films. Three
                  superb films capturing all the action, wild characters and
                  stunning locations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400">
                      Location
                    </p>
                    <p className="text-xs font-bold leading-tight">
                      Divinity School, St John's College
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400">
                      Date & Time
                    </p>
                    <p className="text-xs font-bold leading-tight">
                      17 Nov 2025 @ 7:30pm
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="bg-zinc-900 border-none text-white">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-[10px] font-bold uppercase tracking-tight">
                  Members: Sign in and register{' '}
                  <a
                    href="/meets/upcoming/view/352"
                    className="text-primary underline"
                  >
                    here
                  </a>{' '}
                  for member pricing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Right: Checkout stub */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-zinc-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <CardHeader className="bg-zinc-900 text-white pb-6">
              <CardTitle className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
                <Ticket className="h-4 w-4" /> Guest Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-black uppercase text-zinc-400"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="climb@example.com"
                    onChange={handleChange}
                    className="border-zinc-200 focus:ring-zinc-900 rounded-none h-12"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="name"
                    className="text-[10px] font-black uppercase text-zinc-400"
                  >
                    Attendee Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Full Name"
                    onChange={handleChange}
                    className="border-zinc-200 focus:ring-zinc-900 rounded-none h-12"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-dashed border-zinc-200 text-center space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-zinc-400">
                    Total Due
                  </p>
                  <p className="text-4xl font-black italic tracking-tighter text-zinc-900">
                    £12.00
                  </p>
                </div>

                <PayPalButtons
                  price="12.00"
                  description={`Brit Rock Ticket - ID ${ticketId}`}
                  intent="britrock"
                  form={{ ...formData, ticket: ticketId }}
                  onSuccess={() => setSuccess(true)}
                  onError={e => setErr(e)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BritRock;
