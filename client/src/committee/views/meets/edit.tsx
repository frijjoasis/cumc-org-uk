import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Settings2, HelpCircle, AlertCircle, Save } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import EditQuestions from '@/components/EditMeet/EditQuestions';
import EditDetails from '@/components/EditMeet/EditDetails';
import { MeetContent } from '@/types/meet';

const EditMeet = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [content, setContent] = useState<Partial<MeetContent>>({ questions: [] });
  const [newID, setNewID] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);

  const isClone = location.pathname.includes('/clone');
  const isNew = location.pathname.includes('/new');

  useEffect(() => {
    if (id && !isNew) {
      axios.post('/api/meets/signups', { id })
        .then(res => {
          if (res.data.err) {
            setError(res.data.err);
          } else {
            const data = res.data;
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);

            // Clean date formatting for <input type="date" />
            setContent({
              ...data,
              startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              // If cloning, we strip the ID so the backend creates a new entry
              id: isClone ? undefined : data.id 
            });
          }
        })
        .catch(() => setError("Could not load meet data"))
        .finally(() => setLoading(false));
    }
  }, [id, isClone, isNew]);

  if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase tracking-widest text-zinc-400">Loading Form...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            {isNew ? 'Create New Meet' : isClone ? 'Clone Meet' : 'Edit Meet'}
          </h2>
          <p className="text-zinc-500 font-medium">
            {isClone ? `Creating a copy of ${content.title}` : 'Configure logistics and signup questions.'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
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
              <TabsTrigger 
                value="questions" 
                className="flex-1 sm:flex-none h-14 px-8 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Signup Questions
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-8">
            <TabsContent value="details" className="mt-0 space-y-4">
              <div className="mb-6">
                <CardTitle className="text-lg font-bold">Logistics</CardTitle>
                <CardDescription>Set the dates, location, and driver requirements.</CardDescription>
              </div>
              <EditDetails
                content={content}
                id={isClone || isNew ? undefined : id}
                pathname={location.pathname}
                onSubmit={(id) => {
                  setNewID(id);
                  // Optional: redirect to questions tab or view meet
                }}
              />
            </TabsContent>

            <TabsContent value="questions" className="mt-0 space-y-4">
              <div className="mb-6">
                <CardTitle className="text-lg font-bold">Questionnaire Design</CardTitle>
                <CardDescription>Add custom fields for dietary requirements, gear needs, or experience.</CardDescription>
              </div>
              <EditQuestions
                content={content}
                id={isClone || isNew ? undefined : id}
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