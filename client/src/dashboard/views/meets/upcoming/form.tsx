import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  ClipboardCheck,
  User,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PayPalButtons from '@/components/PayPalButton/PayPalButtons';
import { User as UserModel } from '@/types/models';

interface MeetFormProps {
  user: UserModel;
}

const MeetForm = ({ user }: MeetFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meet, setMeet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    axios
      .post('/api/meets/view', { id })
      .then(res => {
        if (res.data.err) setErr(res.data.err);
        else setMeet(res.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    setSubmitting(true);

    // Collect custom question answers
    const answers = meet.questions.map((q: any) => {
      const input = document.getElementById(q.id) as HTMLInputElement;
      return { id: q.id, value: input?.value || '' };
    });

    const submissionData = { answers, meetID: id };

    try {
      const res = await axios.post('/api/paypal/required', submissionData);
      if (res.data.err) {
        setErr(res.data.err);
        window.scrollTo(0, 0);
      } else if (res.data) {
        // Meet requires payment
        setRegistrationData(submissionData);
        setShowPayment(true);
      } else {
        // Free meet or registration successful
        navigate(`/meets/upcoming/view/${id}`);
      }
    } catch (e) {
      setErr('Submission failed. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center font-black animate-pulse">
        LOADING FORM...
      </div>
    );
  if (!user || meet?.disabled) return <Navigate to="/404" replace />;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          Trip Registration
        </h1>
        <p className="text-zinc-500 font-medium italic">
          Finalize your spot for{' '}
          <span className="text-zinc-900 font-bold underline decoration-primary underline-offset-4">
            {meet.title}
          </span>
        </p>
      </div>

      {err && (
        <Alert variant="destructive" className="border-2 shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Registration Error</AlertTitle>
          <AlertDescription>{err}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Step 1: Identity (Read Only) */}
        <Card className="border-zinc-200 shadow-sm bg-zinc-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <User className="h-3 w-3" /> Identity Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-zinc-500">
                Official Name
              </Label>
              <Input
                value={user.displayName}
                readOnly
                className="bg-white border-zinc-200 font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-zinc-500">
                Contact Email
              </Label>
              <Input
                value={user.email}
                readOnly
                className="bg-white border-zinc-200 font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Custom Questions */}
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Required
              Logistics
            </CardTitle>
            <CardDescription className="text-xs">
              The organizer needs this information to prepare the meet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {meet.questions?.map((q: any) => (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 py-1">
                  {q.type === 'checkbox' ? (
                    <div className="flex items-center justify-between w-full gap-4 py-3 px-4 bg-zinc-50/50 rounded-xl border border-transparent hover:border-zinc-200 transition-all group">
                      <div className="space-y-1">
                        <Label
                          htmlFor={q.id}
                          className="font-black uppercase italic text-xs tracking-tight cursor-pointer select-none text-zinc-700 group-hover:text-zinc-900 transition-colors"
                        >
                          {q.title}
                          {q.required && (
                            <span className="ml-1 text-rose-500 font-bold">
                              *
                            </span>
                          )}
                        </Label>
                        {q.text && (
                          <p className="text-[10px] leading-tight text-zinc-500 font-medium italic">
                            {q.text}
                          </p>
                        )}
                      </div>

                      <Checkbox
                        id={q.id}
                        required={q.required}
                        className="h-5 w-5 mt-0.5 border-zinc-300 rounded-md transition-transform active:scale-90 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                      />
                    </div>
                  ) : (
                    /* Standard Layout for Text Inputs */
                    <div className="w-full space-y-2">
                      <Label
                        htmlFor={q.id}
                        className="font-black uppercase italic text-xs tracking-tight"
                      >
                        {q.title}
                        {q.required && (
                          <span className="ml-1 text-rose-500">*</span>
                        )}
                      </Label>
                      <Input
                        id={q.id}
                        required={q.required}
                        placeholder={q.required ? 'Required' : 'Optional'}
                        className={`h-12 border-zinc-200 focus:ring-zinc-900 ${validated && q.required ? 'invalid:border-rose-500' : ''}`}
                      />
                    </div>
                  )}
                </div>

                {/* Display the 'text' / small-print if it exists */}
                {q.text && (
                  <p
                    className={`text-[10px] font-medium text-zinc-500 italic ${q.type === 'checkbox' ? 'pl-8' : ''}`}
                  >
                    {q.text}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 3: Legal & Consent */}
        <div className="p-6 bg-zinc-900 rounded-2xl text-white space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="data-consent"
              required
              className="mt-1 border-white data-[state=checked]:bg-primary data-[state=checked]:border-blue-700 data-[state=checked]:text-blue-700"
            />
            <Label
              htmlFor="data-consent"
              className="text-xs font-bold leading-relaxed text-zinc-300 cursor-pointer"
            >
              <p>
                I agree to the club's{' '}
                <span className="text-white underline">Data Safety Policy</span>
                , Protection Statement, and the{' '}
                <span className="text-white underline">
                  BMC Participation Statement
                </span>
                .
              </p>
            </Label>
          </div>
        </div>

        {/* Action Area: Submit or Pay */}
        <div className="pt-4">
          {!showPayment ? (
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-16 bg-zinc-900 text-white font-black uppercase italic tracking-widest text-lg group shadow-xl hover:shadow-primary/20"
            >
              {submitting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  Complete Registration{' '}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          ) : (
            <Card className="border-2 border-primary bg-zinc-50 shadow-2xl overflow-hidden">
              <CardHeader className="bg-primary text-zinc-900 p-4">
                <CardTitle className="text-xs font-black text-white uppercase tracking-widest text-center italic">
                  Final Step: Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-zinc-400">
                    Total Due
                  </p>
                  <p className="text-4xl font-black italic tracking-tighter">
                    £{Number(meet.price).toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-center">
                  <PayPalButtons
                    price={meet.price}
                    description={`Registration for ${meet.title}`}
                    intent="register"
                    form={registrationData}
                    onSuccess={() => navigate(`/meets/upcoming/view/${id}`)}
                    payer={{ email_address: user.email }}
                    onError={err => setErr(err)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
};

export default MeetForm;
