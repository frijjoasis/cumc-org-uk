import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  GripVertical,
  HelpCircle,
  Save,
  Check,
  AlertCircle,
  Type,
  AlignLeft,
  CheckSquare,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MeetContent, Question } from '@/types/meet';

interface EditQuestionsProps {
  content: MeetContent;
  id?: string;
  newID?: string;
  pathname?: string;
}

const EditQuestions = ({ content, id, newID }: EditQuestionsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );

  // The activeID will be the 21-digit string ID
  const activeID = id || newID;

  useEffect(() => {
    // If we have questions in the initial content, load them
    if (content.questions && Array.isArray(content.questions)) {
      setQuestions(content.questions);
    }
  }, [content.questions]);

  const handleSave = async () => {
    if (!activeID) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await axios.post(`/api/meets/edit/${activeID}/questions`, {
        questions,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save questions:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now(), // Temp ID for the frontend list
      title: '',
      help: '',
      required: false,
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Informational Header */}
      <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg text-emerald-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight italic">
              Form Designer
            </h4>
            <p className="text-[11px] text-zinc-400 font-medium">
              Add custom questions for meet signups.
            </p>
          </div>
        </div>
        <Button
          onClick={addQuestion}
          variant="secondary"
          size="sm"
          className="font-bold gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 border-none"
        >
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card
            key={q.id}
            className="group border-zinc-200 hover:border-zinc-400 transition-all shadow-sm"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Visual Indicator of Question Number */}
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-zinc-100 text-zinc-400 font-black text-xs shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  {index + 1}
                </div>

                <div className="flex-1 space-y-4">
                  {/* Title / Main Question */}
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                      Question Label
                    </Label>
                    <Input
                      placeholder="e.g. Do you have a mountain leader qualification?"
                      value={q.title}
                      onChange={e =>
                        updateQuestion(index, { title: e.target.value })
                      }
                      className="border-zinc-200 focus-visible:ring-zinc-900 font-bold"
                    />
                  </div>

                  {/* Help Text */}
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                      Helpful Hint (Optional)
                    </Label>
                    <Input
                      placeholder="e.g. Please specify the awarding body"
                      value={q.help || ''}
                      onChange={e =>
                        updateQuestion(index, { help: e.target.value })
                      }
                      className="border-zinc-200 text-zinc-500 text-sm italic"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`req-${q.id}`}
                        checked={q.required}
                        onCheckedChange={checked =>
                          updateQuestion(index, { required: !!checked })
                        }
                      />
                      <Label
                        htmlFor={`req-${q.id}`}
                        className="text-xs font-bold uppercase text-zinc-500 cursor-pointer"
                      >
                        Mark as Required
                      </Label>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 gap-2 h-8"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Remove
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <HelpCircle className="h-10 w-10 text-zinc-200 mb-4" />
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs italic">
              No questions defined
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-8 flex items-center justify-between">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {questions.length} Question{questions.length !== 1 ? 's' : ''} in form
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !activeID}
          className={`min-w-[180px] h-12 gap-2 font-black uppercase tracking-widest italic transition-all duration-500 shadow-lg ${
            saveStatus === 'success'
              ? 'bg-emerald-500 hover:bg-emerald-500'
              : saveStatus === 'error'
                ? 'bg-rose-500'
                : 'bg-zinc-900'
          }`}
        >
          {isSaving ? (
            'Saving...'
          ) : saveStatus === 'success' ? (
            <>
              <Check className="h-5 w-5" /> Saved
            </>
          ) : saveStatus === 'error' ? (
            <>
              <AlertCircle className="h-5 w-5" /> Try Again
            </>
          ) : (
            <>
              <Save className="h-5 w-5" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditQuestions;
