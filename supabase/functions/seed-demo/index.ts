import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Reset admin password
    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin')
      .single();

    if (adminRole) {
      await supabaseAdmin.auth.admin.updateUserById(adminRole.user_id, {
        password: 'admin123456',
      });
    }

    // Get all members (non-admin)
    const { data: members } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'member');

    const memberIds = members?.map(m => m.user_id) || [];

    // Add mock monthly records for each member
    const months = [
      { month_name: 'জানুয়ারি', month_number: 1 },
      { month_name: 'ফেব্রুয়ারি', month_number: 2 },
      { month_name: 'মার্চ', month_number: 3 },
      { month_name: 'এপ্রিল', month_number: 4 },
      { month_name: 'মে', month_number: 5 },
      { month_name: 'জুন', month_number: 6 },
      { month_name: 'জুলাই', month_number: 7 },
      { month_name: 'আগস্ট', month_number: 8 },
      { month_name: 'সেপ্টেম্বর', month_number: 9 },
      { month_name: 'অক্টোবর', month_number: 10 },
      { month_name: 'নভেম্বর', month_number: 11 },
      { month_name: 'ডিসেম্বর', month_number: 12 },
    ];

    const records: any[] = [];
    let totalDep = 0;

    for (const memberId of memberIds) {
      totalDep = 0;
      for (let i = 0; i < 6; i++) {
        const m = months[i];
        const deposit = 500 + Math.floor(Math.random() * 500);
        const expense = Math.floor(Math.random() * 100);
        const fine = Math.random() > 0.7 ? 50 : 0;
        const oneTime = i === 0 ? 1000 : 0;
        totalDep += deposit + oneTime;
        const totalExp = expense + fine;
        const balance = totalDep - totalExp;
        const due = Math.random() > 0.5 ? Math.floor(Math.random() * 200) : 0;

        records.push({
          member_id: memberId,
          year: 2025,
          month_name: m.month_name,
          month_number: m.month_number,
          date: `2025-${String(m.month_number).padStart(2, '0')}-05`,
          monthly_deposit: deposit,
          misc_expense: expense,
          late_fine: fine,
          one_time: oneTime,
          due: due,
          total_deposit: totalDep,
          total_expense: totalExp,
          current_balance: balance,
        });
      }
    }

    if (records.length > 0) {
      // Delete existing mock records first
      for (const memberId of memberIds) {
        await supabaseAdmin
          .from('monthly_records')
          .delete()
          .eq('member_id', memberId)
          .eq('year', 2025);
      }

      const { error: insertErr } = await supabaseAdmin
        .from('monthly_records')
        .insert(records);
      if (insertErr) throw insertErr;
    }

    // Create a couple more demo members if less than 5
    if (memberIds.length < 3) {
      const demoMembers = [
        { email: 'rahim@demo.com', name: 'আব্দুর রহিম', member_no: 'S-002', mobile: '01812345678' },
        { email: 'karim@demo.com', name: 'আব্দুল করিম', member_no: 'S-003', mobile: '01912345678' },
        { email: 'fatema@demo.com', name: 'ফাতেমা বেগম', member_no: 'S-004', mobile: '01612345678' },
      ];

      for (const dm of demoMembers) {
        try {
          const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email: dm.email,
            password: 'member123456',
            email_confirm: true,
            user_metadata: { name: dm.name },
          });
          if (createErr) continue;

          await supabaseAdmin
            .from('profiles')
            .update({ member_no: dm.member_no, mobile: dm.mobile, name: dm.name, financial_year: '2024-2025' })
            .eq('id', newUser.user!.id);

          await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: newUser.user!.id, role: 'member' });

          // Add records for new member
          let dep = 0;
          const newRecords: any[] = [];
          for (let i = 0; i < 6; i++) {
            const m = months[i];
            const deposit = 500 + Math.floor(Math.random() * 500);
            const expense = Math.floor(Math.random() * 100);
            const fine = Math.random() > 0.7 ? 50 : 0;
            const oneTime = i === 0 ? 1000 : 0;
            dep += deposit + oneTime;
            newRecords.push({
              member_id: newUser.user!.id,
              year: 2025,
              month_name: m.month_name,
              month_number: m.month_number,
              date: `2025-${String(m.month_number).padStart(2, '0')}-05`,
              monthly_deposit: deposit,
              misc_expense: expense,
              late_fine: fine,
              one_time: oneTime,
              due: Math.random() > 0.5 ? Math.floor(Math.random() * 200) : 0,
              total_deposit: dep,
              total_expense: expense + fine,
              current_balance: dep - (expense + fine),
            });
          }
          await supabaseAdmin.from('monthly_records').insert(newRecords);
        } catch {
          // skip if user exists
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo data seeded! Login: admin@somity.com / admin123456',
        credentials: {
          admin: { email: 'admin@somity.com', password: 'admin123456' },
          members: [
            { email: 'test1@member.com', password: 'member123456' },
            { email: 'rahim@demo.com', password: 'member123456' },
            { email: 'karim@demo.com', password: 'member123456' },
            { email: 'fatema@demo.com', password: 'member123456' },
          ]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
