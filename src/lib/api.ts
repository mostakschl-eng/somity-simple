import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  member_no: string | null;
  name: string;
  mobile: string | null;
  photo_url: string | null;
  financial_year: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type MonthlyRecord = {
  id: string;
  member_id: string;
  year: number;
  month_name: string;
  month_number: number;
  date: string | null;
  monthly_deposit: number | null;
  misc_expense: number | null;
  late_fine: number | null;
  one_time: number | null;
  total_amount: number | null;
  due: number | null;
  total_deposit: number | null;
  total_expense: number | null;
  current_balance: number | null;
  receipt_no: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: 'super_admin' | 'member';
};

export async function getMyRole(): Promise<'super_admin' | 'member' | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return (data?.role as 'super_admin' | 'member') ?? null;
}

export async function getAllMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function getMember(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getMemberRecords(memberId: string, year?: number) {
  let query = supabase
    .from('monthly_records')
    .select('*')
    .eq('member_id', memberId)
    .order('year', { ascending: false })
    .order('month_number', { ascending: true });

  if (year) {
    query = query.eq('year', year);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as MonthlyRecord[];
}

export async function createRecord(record: Omit<MonthlyRecord, 'id' | 'total_amount' | 'receipt_no' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('monthly_records')
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data as MonthlyRecord;
}

export async function updateRecord(id: string, updates: Partial<MonthlyRecord>) {
  // Remove total_amount since it's a generated column
  const { total_amount, ...safeUpdates } = updates;
  const { data, error } = await supabase
    .from('monthly_records')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as MonthlyRecord;
}

export async function deleteRecord(id: string) {
  const { error } = await supabase
    .from('monthly_records')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getDashboardStats() {
  const { data: members, error: mErr } = await supabase
    .from('profiles')
    .select('id, is_active');
  if (mErr) throw mErr;

  const { data: records, error: rErr } = await supabase
    .from('monthly_records')
    .select('total_amount, total_deposit, current_balance, due');
  if (rErr) throw rErr;

  const totalMembers = members?.length ?? 0;
  const activeMembers = members?.filter(m => m.is_active).length ?? 0;
  const totalDeposit = records?.reduce((s, r) => s + (Number(r.total_amount) || 0), 0) ?? 0;
  const totalDue = records?.reduce((s, r) => s + (Number(r.due) || 0), 0) ?? 0;

  return { totalMembers, activeMembers, totalDeposit, totalDue };
}

// Create member via edge function (handles auth.users creation)
export async function createMemberViaEdge(data: {
  email: string;
  password: string;
  name: string;
  member_no: string;
  mobile?: string;
  financial_year?: string;
}) {
  const { data: result, error } = await supabase.functions.invoke('create-member', {
    body: data,
  });
  if (error) throw error;
  return result;
}
