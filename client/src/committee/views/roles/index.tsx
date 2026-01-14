import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  Plus, 
  Mail, 
  Settings2, 
  ChevronDown, 
  AlertTriangle,
  Users,
  EyeOff,
  Edit3
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommitteeRole } from '@/types/models';

// Interface definitions from your provided types
interface RoleStatusInfo {
  id: number;
  current_members: number;
  needs_filling: boolean;
  is_full: boolean;
}

const RolesManager = () => {
  const [roles, setRoles] = useState<CommitteeRole[]>([]);
  const [rolesStatus, setRolesStatus] = useState<RoleStatusInfo[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<CommitteeRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string, variant: 'default' | 'destructive' } | null>(null);

  const [formData, setFormData] = useState({
    role_name: '',
    role_slug: '',
    description: '',
    email_alias: '',
    is_required: false,
    max_positions: 1,
    sort_order: 0,
    is_active: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const [rolesRes, statusRes] = await Promise.all([
        axios.get('/api/committee/roles'),
        axios.get('/api/committee/roles/status')
      ]);
      setRoles(rolesRes.data);
      setRolesStatus(statusRes.data);
    } catch (error) {
      setAlert({ message: 'Failed to sync role data', variant: 'destructive' });
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenDialog = (role: CommitteeRole | null = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        role_name: role.role_name,
        role_slug: role.role_slug,
        description: role.description || '',
        email_alias: role.email_alias || '',
        is_required: role.is_required || false,
        max_positions: role.max_positions || 1,
        sort_order: role.sort_order || 0,
        is_active: role.is_active !== false,
      });
    } else {
      setEditingRole(null);
      setFormData({
        role_name: '',
        role_slug: '',
        description: '',
        email_alias: '',
        is_required: false,
        max_positions: 1,
        sort_order: 0,
        is_active: true,
      });
    }
    setShowDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'role_name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim();
      setFormData(prev => ({ ...prev, role_name: value, role_slug: slug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRole) {
        await axios.put(`/api/committee/roles/${editingRole.id}`, formData);
      } else {
        await axios.post('/api/committee/roles', formData);
      }
      setShowDialog(false);
      fetchData();
      setAlert({ message: 'Database updated successfully', variant: 'default' });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ message: 'Error saving changes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Roles & Governance
          </h2>
          <p className="text-zinc-500 font-medium">Define committee positions and institutional structure.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-zinc-900">
          <Plus className="h-4 w-4" /> Add Role
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.variant === 'destructive' ? 'destructive' : 'default'} className="animate-in fade-in slide-in-from-top-2">
          <AlertDescription className="font-bold uppercase tracking-tight italic">
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">Current Structure</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/30 border-b border-zinc-100">
                <tr className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">
                  <th className="px-6 py-4 text-left">Role Definition</th>
                  <th className="px-6 py-4 text-left">Email Alias</th>
                  <th className="px-6 py-4 text-center">Staffing</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {roles.sort((a,b) => a.sort_order - b.sort_order).map(role => {
                  const status = rolesStatus.find(s => s.id === role.id);
                  return (
                    <tr key={role.id} className={`group hover:bg-zinc-50/50 transition-colors ${!role.is_active ? 'opacity-50 grayscale' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-black uppercase italic text-zinc-900 flex items-center gap-2">
                            {role.role_name}
                            {role.is_required && <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary border-none uppercase">Required</Badge>}
                          </span>
                          <span className="text-xs text-zinc-500 max-w-xs truncate">{role.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {role.email_alias ? (
                          <div className="flex items-center gap-2 text-zinc-600 font-medium">
                            <Mail className="h-3 w-3 text-zinc-400" />
                            {role.email_alias}
                          </div>
                        ) : <span className="text-zinc-300 italic">No alias</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-zinc-400" />
                            <span className="font-bold">{status?.current_members || 0} / {role.max_positions}</span>
                          </div>
                          {status?.needs_filling && role.is_active && (
                            <Badge className="bg-rose-50 text-rose-600 border-rose-100 shadow-none text-[9px] uppercase">Vacant</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(role)} className="h-8 w-8 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200">
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          {role.is_active && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-600">
                              <EyeOff className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic italic tracking-tight">
              {editingRole ? 'Update Role' : 'Create New Position'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input name="role_name" value={formData.role_name} onChange={handleInputChange} required placeholder="e.g. Secretary" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Slug (Auto)</Label>
                <Input value={formData.role_slug} readOnly className="bg-zinc-50 text-zinc-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="What does this person do?" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Email Alias</Label>
                <Input name="email_alias" value={formData.email_alias} onChange={handleInputChange} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Max Positions</Label>
                <Input name="max_positions" type="number" value={formData.max_positions} onChange={handleInputChange} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input name="sort_order" type="number" value={formData.sort_order} onChange={handleInputChange} />
              </div>
            </div>

            <div className="flex gap-6 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_required" 
                  checked={formData.is_required} 
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, is_required: !!checked }))} 
                />
                <Label htmlFor="is_required" className="text-xs font-bold uppercase cursor-pointer">Required Position</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_active" 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, is_active: !!checked }))} 
                />
                <Label htmlFor="is_active" className="text-xs font-bold uppercase cursor-pointer">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full bg-zinc-900 uppercase font-black italic tracking-widest">
                {loading ? 'Processing...' : editingRole ? 'Save Changes' : 'Launch Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesManager;