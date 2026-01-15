import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Users,
  UserPlus,
  Trash2,
  Edit3,
  ArrowRightCircle,
  Info,
  Plus,
  Camera,
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
import {
  AdminPublicCommitteeModel,
  CommitteeRole,
  User,
} from '@cumc/shared-types';

const CommitteeManager = () => {
  const [currentCommittee, setCurrentCommittee] = useState<
    AdminPublicCommitteeModel[]
  >([]);
  const [stagedCommittee, setStagedCommittee] = useState<
    AdminPublicCommitteeModel[]
  >([]);
  const [roles, setRoles] = useState<CommitteeRole[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'staged'>('current');
  const [showDialog, setShowDialog] = useState(false);
  const [editingMember, setEditingMember] =
    useState<AdminPublicCommitteeModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    year: '',
    role_id: 0,
    person_name: '',
    person_email: '',
    sort_order: 0,
    is_current: true,
  });

  useEffect(() => {
    if (showDialog) {
      axios.get('/api/user/list-all').then(res => setAllUsers(res.data));
    }
  }, [showDialog]);

  const getAcademicYear = (offset = 0) => {
    const year = new Date().getFullYear() + offset;
    return `${year}-${year + 1}`;
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePhotoUpload = async (
    memberId: number,
    year: string,
    type: 'profile' | 'cover',
    file: File
  ) => {
    const data = new FormData();

    data.append('id', memberId.toString());
    data.append('year', year);
    data.append('type', type);
    data.append('image', file);
    try {
      setLoading(true);
      await axios.post('/api/committee/upload-photo', data);
      await fetchData(); // Refresh to get new hashes/cache busters
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this officer?')) return;
    try {
      await axios.delete(`/api/committee/members/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleOpenDialog = (
    member: AdminPublicCommitteeModel | null = null
  ) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        year: member.year,
        role_id: member.role_id || 0,
        person_name: member.person_name,
        person_email: member.person_email || '',
        sort_order: member.sort_order,
        is_current: member.is_current,
      });
    } else {
      setEditingMember(null);
      setFormData({
        year: activeTab === 'staged' ? getAcademicYear(1) : getAcademicYear(0),
        role_id: 0,
        person_name: '',
        person_email: '',
        sort_order: 0,
        is_current: activeTab === 'current',
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingMember) {
        await axios.put(`/api/committee/members/${editingMember.id}`, formData);
      } else {
        await axios.post('/api/committee/members', formData);
      }
      setShowDialog(false);
      fetchData();
    } catch (err) {
      alert('Save failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async () => {
    if (
      !window.confirm(
        'Transition Year? This archives current and activates staged.'
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
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Committee Manager
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Organize appointments and media.
          </p>
        </div>
        <div className="flex gap-2">
          {stagedCommittee.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 border-emerald-200 text-emerald-700 bg-emerald-50"
              onClick={handleTransition}
            >
              <ArrowRightCircle className="h-4 w-4" /> Transition Year
            </Button>
          )}
          <Button
            className="gap-2 bg-zinc-900"
            onClick={() => handleOpenDialog()}
          >
            <UserPlus className="h-4 w-4" /> Add Officer
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
        <TabsList className="bg-zinc-100 mb-4">
          <TabsTrigger
            value="current"
            className="px-8 font-bold uppercase text-[10px]"
          >
            Current
          </TabsTrigger>
          <TabsTrigger
            value="staged"
            className="px-8 font-bold uppercase text-[10px]"
          >
            Staging {stagedCommittee.length > 0 && '•'}
          </TabsTrigger>
        </TabsList>

        <Card className="border-none shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr className="text-[10px] uppercase font-black text-zinc-400">
                  <th className="px-6 py-4 text-left">Role & Year</th>
                  <th className="px-6 py-4 text-left">Officer</th>
                  <th className="px-6 py-4 text-left">Media</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeList.map(member => (
                  <tr key={member.id} className="group hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="font-black uppercase italic text-zinc-900">
                        {member.role}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {member.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-700">
                      {member.person_name}
                      <div className="text-[10px] font-normal text-zinc-400 lowercase">
                        {member.person_email}
                      </div>
                    </td>

                    {/* MEDIA COLUMN */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Profile Upload */}
                        <div className="relative h-10 w-10 rounded-full bg-zinc-100 border overflow-hidden group/img">
                          <img
                            src={
                              member.profile_hash
                                ? `/img/committee/${member.year}/${member.profile_hash}.jpg?t=${Date.now()}`
                                : '/assets/img/default-avatar.jpg'
                            }
                            className="h-full w-full object-cover"
                            alt=""
                          />
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            <Camera className="h-3 w-3 text-white" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={e =>
                                e.target.files?.[0] &&
                                handlePhotoUpload(
                                  member.id,
                                  member.year,
                                  'profile',
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                        </div>
                        {/* Cover Upload */}
                        <label className="flex items-center gap-1 text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-900 cursor-pointer border border-dashed p-1 rounded">
                          <Plus className="h-2 w-2" /> Cover
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={e =>
                              e.target.files?.[0] &&
                              handlePhotoUpload(
                                member.id,
                                member.year,
                                'cover',
                                e.target.files[0]
                              )
                            }
                          />
                        </label>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={
                          member.is_current
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[9px]'
                            : 'bg-zinc-100 text-zinc-500 uppercase text-[9px]'
                        }
                      >
                        {member.is_current ? 'Active' : 'Staged'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(member)}
                          className="h-8 w-8"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member.id)}
                          className="h-8 w-8 text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Tabs>

      {/* STAGING ALERT */}
      {activeTab === 'staged' && stagedCommittee.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 font-black uppercase text-xs italic">
            Staging Environment
          </AlertTitle>
          <AlertDescription className="text-amber-700 text-sm">
            Records here are for {stagedCommittee[0].year}. They won't appear on
            the public 'About' page until you perform a Year Transition.
          </AlertDescription>
        </Alert>
      )}

      {/* FORM DIALOG */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic">
              {editingMember ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-zinc-400">
                  Academic Year
                </Label>
                <Input
                  value={formData.year}
                  onChange={e =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-zinc-400">
                  Constitutional Role
                </Label>
                <Select
                  value={formData.role_id?.toString()}
                  onValueChange={v =>
                    setFormData({ ...formData, role_id: parseInt(v) })
                  }
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

            {/* CRSid Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-zinc-400">
                Link CRSid (Member)
              </Label>
              <Select
                value={formData.member_id?.toString()}
                onValueChange={val => {
                  const found = allMembers.find(m => m.id.toString() === val);
                  setFormData({
                    ...formData,
                    member_id: val,
                    // Pre-fill the name if the override is currently empty
                    person_name:
                      formData.person_name || found?.user?.displayName || '',
                  });
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select a member..." />
                </SelectTrigger>
                <SelectContent>
                  {allMembers.map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.id} ({m.user?.displayName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-zinc-400">
                Public Display Name
              </Label>
              <Input
                value={formData.person_name}
                onChange={e =>
                  setFormData({ ...formData, person_name: e.target.value })
                }
                placeholder="Enter name (overrides system name)"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-zinc-400">
                Officer Name
              </Label>
              <Input
                value={formData.person_name}
                onChange={e =>
                  setFormData({ ...formData, person_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-zinc-400">
                Email / Social
              </Label>
              <Input
                value={formData.person_email}
                onChange={e =>
                  setFormData({ ...formData, person_email: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2 p-3 bg-zinc-50 rounded border">
              <Checkbox
                id="is_current"
                checked={formData.is_current}
                onCheckedChange={v =>
                  setFormData({ ...formData, is_current: !!v })
                }
              />
              <Label
                htmlFor="is_current"
                className="text-[10px] uppercase font-bold cursor-pointer"
              >
                Set as Active (Bypasses Staging)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-zinc-900 font-black uppercase tracking-widest"
              onClick={handleSave}
            >
              Save Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommitteeManager;
