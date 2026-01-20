import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Settings2, HelpCircle, AlertCircle, Lock } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import EditQuestions from '@/components/EditMeet/EditQuestions';
import EditDetails from '@/components/EditMeet/EditDetails';
import { MeetContent } from '@/types/meet';

const EditMeet = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [content, setContent] = useState<MeetContent>({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'Outdoor',
    signupControl: 'Default',
    disabled: false,
    hidden: false,
    questions: [],
    price: 0,
  });

  const [activeTab, setActiveTab] = useState('details');
  const [newID, setNewID] = useState<string | undefined>(id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);

  const isClone = location.pathname.includes('/clone');
  const isNewPath = location.pathname.includes('/new');
  const isNew = isNewPath || isClone;

  const hasBeenSaved = !!newID && (id !== undefined || !isClone);

  useEffect(() => {
    if (id && !isNew) {
      axios
        .get(`/api/meets/signups/${id}`)
        .then(res => {
          if (res.data.err) {
            setError(res.data.err);
          } else {
            const data = res.data;
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);

            setContent({
              ...data,
              startTime: startDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              endTime: endDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              id: data.id,
            });
            setNewID(data.id.toString());
          }
        })
        .catch(() => setError('Could not load meet data'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleTabChange = (value: string) => {
    if (value === 'questions' && !hasBeenSaved) {
      setError(
        'Please save the Logistics & Details first to enable questions.'
      );
      return;
    }
    setError(null);
    setActiveTab(value);
  };

  if (loading)
    return (
      <div className="p-8 text-center animate-pulse font-black uppercase tracking-widest text-zinc-400">
        Loading Form...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {error && (
        <Alert
          variant="destructive"
          className="animate-in fade-in slide-in-from-top-2"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            {isNew && !hasBeenSaved
              ? 'Create New Meet'
              : isClone
                ? 'Clone Meet'
                : 'Edit Meet'}
          </h2>
          <p className="text-zinc-500 font-medium">
            {isClone
              ? `Creating a copy of ${content.title}`
              : 'Configure logistics and signup questions.'}
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <Card className="border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="p-0 bg-zinc-50/50 border-b border-zinc-200">
            <TabsList className="w-full justify-start rounded-none bg-transparent h-14 p-0">
              <TabsTrigger
                value="details"
                className="flex-1 sm:flex-none h-14 px-8 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none gap-2"
              >
                <Settings2 className="h-4 w-4" />
                Logistics & Details
              </TabsTrigger>

              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="flex-1 sm:flex-none">
                      <TabsTrigger
                        value="questions"
                        disabled={!hasBeenSaved}
                        className="w-full h-14 px-8 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!hasBeenSaved ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <HelpCircle className="h-4 w-4" />
                        )}
                        Signup Questions
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  {!hasBeenSaved && (
                    <TooltipContent>
                      <p>Save details first to enable questions</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-8">
            <TabsContent value="details" className="mt-0 space-y-4">
              <EditDetails
                content={content}
                id={hasBeenSaved ? newID : undefined}
                pathname={location.pathname}
                onSubmit={updatedMeet => {
                  const startDate = new Date(updatedMeet.startDate);
                  const endDate = new Date(updatedMeet.endDate);

                  const formattedMeet = {
                    ...updatedMeet,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                  };

                  const stringId = updatedMeet.id?.toString();
                  setNewID(stringId);
                  setContent(formattedMeet);
                  setError(null);
                  setActiveTab('questions');

                  if (isNewPath || isClone) {
                    navigate(`/committee/meets/edit/${stringId}`, {
                      replace: true,
                    });
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="questions" className="mt-0 space-y-4">
              <EditQuestions
                content={content}
                id={newID}
                pathname={location.pathname}
                newID={newID}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default EditMeet;
