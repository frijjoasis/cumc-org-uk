import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Gem,
  Package,
  Search,
  Plus,
  History,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Define the interface based on your gear list API
interface GearItem {
  id: number;
  name: string;
  category: string;
  condition: 'Good' | 'Fair' | 'Poor' | 'Retired';
  status: 'Available' | 'On Loan' | 'Maintenance';
  lastChecked?: string;
}

const Treasure = () => {
  const [items, setItems] = useState<GearItem[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {}, []);

  const filteredItems = items.filter(
    item =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.category.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusBadge = (status: GearItem['status']) => {
    switch (status) {
      case 'Available':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Available
          </Badge>
        );
      case 'On Loan':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none">
            <History className="mr-1 h-3 w-3" /> On Loan
          </Badge>
        );
      case 'Maintenance':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none">
            <Wrench className="mr-1 h-3 w-3" /> Maintenance
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900 flex items-center gap-3">
            <Gem className="h-8 w-8 text-primary" />
            Club Treasure
          </h2>
          <p className="text-zinc-500 font-medium font-mono text-sm uppercase tracking-widest">
            Inventory & Asset Management
          </p>
        </div>
        <Button className="gap-2 bg-zinc-900">
          <Plus className="h-4 w-4" /> Add New Asset
        </Button>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search inventory (e.g. Ropes, Helmets...)"
                className="pl-10 bg-white"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-zinc-100"
              >
                All
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-zinc-100"
              >
                Technical
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-zinc-100"
              >
                Camping
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/30 border-b border-zinc-100">
                <tr className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  <th className="px-6 py-4 text-left">Item Name</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-left">Condition</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-100 rounded text-zinc-500 group-hover:bg-white transition-colors">
                            <Package className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-zinc-900">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-500 font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold ${
                            item.condition === 'Good'
                              ? 'text-emerald-600'
                              : item.condition === 'Fair'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                          }`}
                        >
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-bold uppercase text-[10px] tracking-widest"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-20 text-center flex flex-col items-center justify-center gap-2"
                    >
                      <Package className="h-10 w-10 text-zinc-200" />
                      <p className="text-zinc-400 italic font-medium">
                        No items found in the treasure chest.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Treasure;
