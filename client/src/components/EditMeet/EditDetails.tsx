import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  MapPin,
  PoundSterling,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { MeetContent } from '@/types/meet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditDetailsProps {
  content: Partial<MeetContent>;
  id?: string;
  pathname: string;
  onSubmit: (id: string) => void;
}

const EditDetails = ({ content, id, pathname, onSubmit }: EditDetailsProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<MeetContent>>(content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when props load (crucial for Edit/Clone mode)
  useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If no ID exists, we are in "New" or "Clone" mode
      const endpoint = id ? `/api/meets/edit/${id}` : '/api/meets/new';
      const response = await axios.post(endpoint, formData);

      if (response.data.success) {
        onSubmit(response.data.id);
        // If it's a brand new meet, we might want to move to the ID-specific URL
        if (!id) navigate(`/committee/meets/edit/${response.data.id}`);
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-8 animate-in fade-in duration-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meet Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              placeholder="e.g. Refreshers Meet to North Wales"
              className="font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                className="pl-10"
                placeholder="Hut name or town"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meet Type</Label>
            <Select
              value={formData.type}
              onValueChange={val =>
                setFormData(prev => ({ ...prev, type: val as any }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Outdoor">
                  Outdoor (Climbing/Hiking)
                </SelectItem>
                <SelectItem value="Indoor">Indoor (Wall Session)</SelectItem>
                <SelectItem value="Social">Social (Pub/Dinner)</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Costs & Logistics */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (£)</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price || 0}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSignups">Capacity</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="maxSignups"
                  name="maxSignups"
                  type="number"
                  value={formData.maxSignups || 0}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="space-y-2">
              <Label>Who can sign up?</Label>
              <Select
                value={formData.signupControl}
                onValueChange={val =>
                  setFormData(prev => ({ ...prev, signupControl: val as any }))
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Privacy Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">
                    Default (Global Settings)
                  </SelectItem>
                  <SelectItem value="Members">Members Only</SelectItem>
                  <SelectItem value="Everyone">Public (Everyone)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disabled"
                checked={formData.disabled}
                onCheckedChange={checked =>
                  setFormData(prev => ({ ...prev, disabled: !!checked }))
                }
              />
              <Label htmlFor="disabled" className="text-rose-600 font-bold">
                Disable Signups
              </Label>
            </div>
            <p className="text-[11px] text-zinc-400 italic">
              Check this to temporarily close the form or hide it from the
              public site.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={4}
          placeholder="What's the plan? What gear is needed?"
        />
      </div>

      <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3 items-center">
        {!id && (
          <p className="text-[10px] text-amber-600 font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Save to enable questions
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !formData.title}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px] gap-2"
        >
          {isSubmitting ? (
            'Saving...'
          ) : (
            <>
              <Save className="h-4 w-4" />{' '}
              {id ? 'Update Details' : 'Create Meet'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditDetails;
