import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Ticket,
  Film,
  MapPin,
  Calendar,
  Info,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import PayPalButtons from '@/components/PayPalButton/PayPalButtons';
import { PublicBritRockEvent } from '@cumc/shared-types';
import { formatPrice, formatShowtime } from '@/lib/britrock';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Below this, the checkout shows how many seats are left
const LOW_STOCK = 20;

const BritRock = () => {
  const [event, setEvent] = useState<PublicBritRockEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [ticket, setTicket] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get('/api/britrock')
      .then(res => setEvent(res.data))
      .catch(() => setErr('Could not load BritRock. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-zinc-400">
        Loading BritRock...
      </div>
    );
  }

  if (ticket && event) {
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
                Your Ticket ID
              </p>
              <p className="text-5xl font-black font-mono text-zinc-900">
                #{ticket}
              </p>
            </div>
            <div className="h-px bg-zinc-100 w-full" />
            <p className="text-zinc-600 font-medium leading-relaxed">
              Please take a screenshot of this ID and show it, or give your
              name, at the {event.location} entrance on{' '}
              {formatShowtime(event.startsAt)}.
            </p>
            {event.refundNote && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 text-left">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs font-bold">
                  {event.refundNote}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        {err && (
          <Alert variant="destructive" className="text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{err}</AlertDescription>
          </Alert>
        )}
        <Film className="h-12 w-12 mx-auto text-zinc-300" />
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          BritRock <span className="text-primary">CUMC</span>
        </h1>
        <p className="text-zinc-500 font-medium">
          There's no BritRock screening on sale right now. Keep an eye on the
          mailing list for next year's tour.
        </p>
      </div>
    );
  }

  const detailsReady = formData.name.trim() !== '' && EMAIL.test(formData.email.trim());
  const price = event.price.toFixed(2);

  const checkout = () => {
    if (event.status === 'draft') {
      return (
        <p className="text-xs font-bold text-zinc-500 uppercase">
          Payments open once the event is set to on sale.
        </p>
      );
    }
    if (event.status === 'closed') {
      return (
        <p className="text-sm font-black text-zinc-900 uppercase italic">
          Ticket sales have closed
        </p>
      );
    }
    if (event.soldOut) {
      return (
        <p className="text-sm font-black text-zinc-900 uppercase italic">
          Sold out
        </p>
      );
    }
    if (!detailsReady) {
      return (
        <p className="text-xs font-bold text-zinc-500 uppercase">
          Enter your name and email to pay.
        </p>
      );
    }
    return (
      <PayPalButtons
        price={price}
        description={`${event.title} - guest ticket`}
        intent="britrock"
        form={formData}
        onSuccess={result => setTicket(result?.ticket ?? null)}
        onError={e => setErr(e)}
      />
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
      {event.status === 'draft' && (
        <Alert className="bg-amber-50 border-amber-300 text-amber-900">
          <EyeOff className="h-4 w-4" />
          <AlertTitle>Draft preview</AlertTitle>
          <AlertDescription>
            Only committee can see this page until it's set to on sale.
          </AlertDescription>
        </Alert>
      )}
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
          {event.title}
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
              {event.description && (
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                    <Film className="h-5 w-5 text-primary" /> The Program
                  </h3>
                  <p className="text-zinc-600 leading-relaxed font-medium text-sm whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400">
                      Location
                    </p>
                    <p className="text-xs font-bold leading-tight">
                      {event.location}
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
                      {formatShowtime(event.startsAt)}
                    </p>
                  </div>
                </div>
              </div>

              {event.memberMeetID && (
                <Alert className="bg-zinc-900 border-none text-white">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-[10px] font-bold uppercase tracking-tight">
                    Members: Sign in and register{' '}
                    <a
                      href={`/meets/upcoming/view/${event.memberMeetID}`}
                      className="text-primary underline"
                    >
                      here
                    </a>{' '}
                    for member pricing.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Checkout */}
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
                    {formatPrice(event.price)}
                  </p>
                  {event.remaining !== null &&
                    !event.soldOut &&
                    event.remaining <= LOW_STOCK && (
                      <p className="text-[10px] font-black uppercase text-primary">
                        Only {event.remaining} left
                      </p>
                    )}
                </div>

                {checkout()}

                {event.refundNote && (
                  <p className="text-[10px] font-medium text-zinc-400">
                    {event.refundNote}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BritRock;
