import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllMembers, updateProfile } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserPlus, Eye, Search, Filter, Users, Phone, Hash, 
  ToggleLeft, ToggleRight, Edit, ArrowUpDown
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function MemberList() {
  const { data: members, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: getAllMembers,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateProfile(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'স্ট্যাটাস আপডেট হয়েছে' });
    },
  });

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    let result = [...members];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.member_no?.toLowerCase().includes(q) ||
        m.mobile?.includes(q)
      );
    }
    if (statusFilter === 'active') result = result.filter(m => m.is_active);
    if (statusFilter === 'inactive') result = result.filter(m => !m.is_active);
    if (sortBy === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (sortBy === 'member_no') result.sort((a, b) => (a.member_no || '').localeCompare(b.member_no || ''));
    if (sortBy === 'oldest') result.reverse();
    return result;
  }, [members, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            সদস্য তালিকা
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">মোট {members?.length ?? 0} জন</p>
        </div>
        <Link to="/admin/members/new">
          <Button size="sm" className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">নতুন সদস্য</span>
            <span className="sm:hidden">যোগ</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-2.5 sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="নাম, নং বা মোবাইল..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 h-9 text-xs sm:text-sm">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব</SelectItem>
                  <SelectItem value="active">সক্রিয়</SelectItem>
                  <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-32 h-9 text-xs sm:text-sm">
                  <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                  <SelectValue placeholder="সর্ট" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">নতুন আগে</SelectItem>
                  <SelectItem value="oldest">পুরনো আগে</SelectItem>
                  <SelectItem value="name">নাম</SelectItem>
                  <SelectItem value="member_no">সদস্য নং</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {searchQuery && (
        <p className="text-xs text-muted-foreground">{filteredMembers.length} জন পাওয়া গেছে</p>
      )}

      {/* Mobile: Card view, Desktop: Table view */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground text-sm">লোড হচ্ছে...</div>
      ) : !filteredMembers.length ? (
        <div className="p-8 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'কোনো সদস্য পাওয়া যায়নি' : 'কোনো সদস্য নেই'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-2 sm:hidden">
            {filteredMembers.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                      {m.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        #{m.member_no || '-'} • {m.mobile || '-'}
                      </p>
                    </div>
                    <Badge variant={m.is_active ? 'default' : 'secondary'} className="text-[10px] px-1.5 shrink-0">
                      {m.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border">
                    <Link to={`/admin/members/${m.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8">
                        <Eye className="h-3.5 w-3.5" /> দেখুন
                      </Button>
                    </Link>
                    <Link to={`/admin/members/${m.id}/update`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8">
                        <Edit className="h-3.5 w-3.5" /> রেকর্ড
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => toggleActive.mutate({ id: m.id, is_active: !m.is_active })}
                    >
                      {m.is_active ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop table view */}
          <Card className="hidden sm:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">সদস্য</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">মোবাইল</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">অর্থ বছর</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">স্ট্যাটাস</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                              {m.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{m.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Hash className="h-3 w-3" />{m.member_no || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />{m.mobile || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.financial_year || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="ghost" size="sm" className="gap-1.5"
                            onClick={() => toggleActive.mutate({ id: m.id, is_active: !m.is_active })}>
                            {m.is_active ? (
                              <><ToggleRight className="h-4 w-4 text-success" /><span className="text-xs text-success">সক্রিয়</span></>
                            ) : (
                              <><ToggleLeft className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">নিষ্ক্রিয়</span></>
                            )}
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/admin/members/${m.id}`}>
                              <Button variant="ghost" size="sm" className="gap-1.5">
                                <Eye className="h-4 w-4" /> দেখুন
                              </Button>
                            </Link>
                            <Link to={`/admin/members/${m.id}/update`}>
                              <Button variant="ghost" size="sm" className="gap-1.5">
                                <Edit className="h-4 w-4" /> রেকর্ড
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
