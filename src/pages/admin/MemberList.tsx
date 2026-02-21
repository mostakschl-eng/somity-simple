import { useQuery } from '@tanstack/react-query';
import { getAllMembers } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Eye } from 'lucide-react';

export default function MemberList() {
  const { data: members, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: getAllMembers,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">সদস্য তালিকা</h1>
          <p className="text-muted-foreground">সমিতির সকল সদস্য</p>
        </div>
        <Link to="/admin/members/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            নতুন সদস্য
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">লোড হচ্ছে...</div>
          ) : !members?.length ? (
            <div className="p-6 text-center text-muted-foreground">কোনো সদস্য পাওয়া যায়নি</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">সদস্য নং</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">নাম</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">মোবাইল</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">অর্থ বছর</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{m.member_no || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {m.name?.charAt(0)}
                          </div>
                          {m.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.mobile || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.financial_year || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={m.is_active ? 'default' : 'secondary'}>
                          {m.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/members/${m.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            দেখুন
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
