import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  HelpCircle,
  Save,
  Check,
  AlertCircle,
  Type,
  CheckSquare,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import defaults from './defaults';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MeetContent, Question } from '@/types/meet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const activeID = id || newID;

  useEffect(() => {
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

  const applyTemplate = (category: keyof typeof defaults) => {
    const template = defaults[category].map(q => ({
      ...q,
      id: Date.now() + Math.floor(Math.random() * 1000), // Ensure unique string IDs
      type: (q as any).type ?? 'text',
    }));
    setQuestions([...questions, ...template]);
  };

  const addQuestion = (type: 'text' | 'checkbox' = 'text') => {
    const newQ: Question = {
      id: Date.now(),
      title: '',
      help: '',
      text: '',
      required: false,
      type: type,
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
      {/* Header with Template and Add Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900 p-4 rounded-xl text-white shadow-lg gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-white/10 rounded-lg text-emerald-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight italic">
              Form Designer
            </h4>
            <p className="text-[11px] text-zinc-400 font-medium">
              Design your signup requirements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Template Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 text-white hover:bg-white/20 font-bold gap-2"
              >
                <Sparkles className="h-4 w-4 text-amber-400" /> Templates{' '}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Choose Template</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => applyTemplate('outdoor')}>
                Outdoor Meet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate('indoor')}>
                Indoor Session
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate('car')}>
                Car / Transport
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Question Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-900 border-none font-bold gap-2"
              >
                <Plus className="h-4 w-4" /> Add Question{' '}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => addQuestion('text')}
                className="gap-2"
              >
                <Type className="h-4 w-4" /> Short Answer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => addQuestion('checkbox')}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" /> Yes/No Checkbox
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card
            key={q.id}
            className="group border-zinc-200 hover:border-zinc-400 transition-all shadow-sm"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-zinc-100 text-zinc-400 font-black text-xs group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  {q.type === 'checkbox' ? (
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Type className="h-4 w-4 text-zinc-300" />
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                        {q.type === 'checkbox'
                          ? 'Checkbox Label'
                          : 'Question Label'}
                      </Label>
                      <Input
                        placeholder={
                          q.type === 'checkbox'
                            ? 'e.g. Do you have a harness?'
                            : 'e.g. Your experience...'
                        }
                        value={q.title}
                        onChange={e =>
                          updateQuestion(index, { title: e.target.value })
                        }
                        className="border-zinc-200 focus-visible:ring-zinc-900 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                        Helpful Hint (Placeholder)
                      </Label>
                      <Input
                        placeholder="Guidance for the user..."
                        value={q.help || ''}
                        onChange={e =>
                          updateQuestion(index, { help: e.target.value })
                        }
                        className="border-zinc-200 text-zinc-500 text-sm italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                      Small Print / Instructions (Optional)
                    </Label>
                    <Input
                      placeholder="Extra details shown below the field..."
                      value={q.text || ''}
                      onChange={e =>
                        updateQuestion(index, { text: e.target.value })
                      }
                      className="border-zinc-200 text-zinc-500 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <div className="flex items-center space-x-6">
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
                          Required
                        </Label>
                      </div>
                      <div className="text-[9px] px-2 py-0.5 rounded bg-zinc-100 font-bold uppercase text-zinc-400">
                        Type: {q.type || 'text'}
                      </div>
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

      <div className="pt-8 flex items-center justify-between">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {questions.length} Question{questions.length !== 1 ? 's' : ''} in form
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !activeID}
          className={`min-w-45 h-12 gap-2 font-black uppercase tracking-widest italic transition-all duration-500 shadow-lg ${
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
