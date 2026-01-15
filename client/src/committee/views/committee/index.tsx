import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Layers,
  ArrowRightCircle,
  Info,
  History,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Committee, CommitteeRole } from '@cumc/shared-types';

const CommitteeManager = () => {
  const [currentCommittee, setCurrentCommittee] = useState<Committee[]>([]);
  const [stagedCommittee, setStagedCommittee] = useState<Committee[]>([]);
  const [roles, setRoles] = useState<CommitteeRole[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'staged'>('current');
  const [showDialog, setShowDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    year: '2024-2025',
    role_id: null,
    person_name: '',
    person_email: '',
    sort_order: 0,
    is_current: true,
  });

  const getAcademicYear = (offset = 0) => {
    const year = new Date().getFullYear() + offset;
    return `${year}-${year + 1}`;
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this officer?'))
      return;

    try {
      await axios.delete(`/api/committee/members/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [adminData, rolesResponse] = await Promise.all([
        axios.get('/api/committee/admin/list'),
        axios.get('/api/committee/roles/active'),
      ]);

      setCurrentCommittee(adminData.data.current);
      setStagedCommittee(adminData.data.staged);
      setRoles(rolesResponse.data);
    } catch (err) {
      console.error('Fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!formData.role_id || !formData.person_name) {
      alert('Please fill in the name and select a role.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        status: formData.is_current ? 'current' : 'staged',
      };

      if (editingMember) {
        await axios.put(`/api/committee/members/${editingMember.id}`, payload);
      } else {
        await axios.post('/api/committee/members', payload);
      }

      setShowDialog(false);
      fetchData(); // Refresh the table
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save committee member.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (member: Committee | null = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        year: member.year,
        role_id: member.role_id,
        person_name: member.person_name,
        person_email: member.person_email,
        sort_order: member.sort_order,
        is_current: member.is_current,
      });
    } else {
      setEditingMember(null);

      const currentYear = getAcademicYear(0);
      const nextYear = getAcademicYear(1);

      setFormData({
        year:
          activeTab === 'staged'
            ? stagedCommittee[0]?.year || nextYear
            : currentYear,
        role_id: '',
        person_name: '',
        person_email: '',
        sort_order: 0,
        is_current: activeTab === 'current',
      });
    }
    setShowDialog(true);
  };

  const handleTransition = async () => {
    if (
      !window.confirm(
        'Transition now? Current members will be archived and staged members will become active.'
      )
    )
      return;
    try {
      await axios.post('/api/committee/transition-year');
      fetchData();
      setActiveTab('current');
    } catch (err) {
      alert('Transition failed');
    }
  };

  const activeList =
    activeTab === 'current' ? currentCommittee : stagedCommittee;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Governance Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Committee Governance
          </h2>
          <p className="text-zinc-500 font-medium">
            Manage current officers and stage future transitions.
          </p>
        </div>
        <div className="flex gap-2">
          {stagedCommittee.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              onClick={handleTransition}
            >
              <ArrowRightCircle className="h-4 w-4" /> Transition Year
            </Button>
          )}
          <Button
            className="gap-2 bg-zinc-900"
            onClick={() => handleOpenDialog()}
          >
            <UserPlus className="h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={v => setActiveTab(v as any)}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-zinc-100 p-1">
            <TabsTrigger
              value="current"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              Current Executive
            </TabsTrigger>
            <TabsTrigger
              value="staged"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              Staged for Next Year
              {stagedCommittee.length > 0 && (
                <span className="ml-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <Card className="border-zinc-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/50 border-b border-zinc-100">
                <tr className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  <th className="px-6 py-4 text-left">Position</th>
                  <th className="px-6 py-4 text-left">Officer Name</th>
                  <th className="px-6 py-4 text-left">Contact Alias</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {activeList
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map(member => (
                    <tr
                      key={member.id}
                      className="group hover:bg-zinc-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-black uppercase italic text-zinc-900">
                          {member.role}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {member.year}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-700">
                          {member.person_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <History className="h-3 w-3 text-zinc-300" />
                          {member.person_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {member.is_current ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none text-[9px] uppercase">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-zinc-400 text-[9px] uppercase"
                          >
                            Staged
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(member)}
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(member.id)}
                            className="h-8 w-8 text-zinc-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {activeList.length === 0 && (
              <div className="p-20 text-center text-zinc-400 italic flex flex-col items-center">
                <Layers className="h-10 w-10 mb-4 opacity-20" />
                No members found in this view.
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {activeTab === 'staged' && stagedCommittee.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 font-black uppercase text-xs italic">
            Staging Environment
          </AlertTitle>
          <AlertDescription className="text-amber-700 text-sm">
            You are viewing the upcoming committee for {stagedCommittee[0].year}
            . These records are inactive until the Year Transition is performed.
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight">
              {editingMember ? 'Update Appointment' : 'Appoint New Officer'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Year</Label>
                <Input
                  value={formData.year}
                  onChange={e =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  placeholder="2025-2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Constitutional Role</Label>
                <Select
                  value={formData.role_id?.toString() || ''}
                  onValueChange={v => {
                    const selectedRole = roles.find(r => r.id.toString() === v);
                    setFormData({
                      ...formData,
                      role_id: parseInt(v),
                      person_email:
                        selectedRole?.email_alias || formData.person_email,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Officer Full Name</Label>
              <Input
                value={formData.person_name}
                onChange={e =>
                  setFormData({ ...formData, person_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Official Email Alias</Label>
              <Input
                type="email"
                value={formData.person_email}
                onChange={e =>
                  setFormData({ ...formData, person_email: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
              <Checkbox
                id="is_current"
                checked={formData.is_current}
                onCheckedChange={v =>
                  setFormData({ ...formData, is_current: !!v })
                }
              />
              <Label
                htmlFor="is_current"
                className="text-xs font-bold uppercase cursor-pointer"
                title="Add to staging or not"
              >
                Immediate Active Status
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-zinc-900 uppercase font-black italic tracking-widest py-6"
              onClick={handleSave}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommitteeManager;
