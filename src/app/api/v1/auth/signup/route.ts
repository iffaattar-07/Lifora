import { NextRequest, NextResponse } from 'next/server';
import { SignupRequestSchema, createSuccessResponse, createErrorResponse } from '@/types/api';
import { prisma } from '@/lib/db';
import { createServerSideClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid signup input parameters', parsed.error.format()),
        { status: 400 }
      );
    }

    const { email, password, fullName, preferredName, role, phone, timezone } = parsed.data;

    let supabaseUserId: string | null = null;

    // 1. Attempt Supabase Auth user registration if configured
    try {
      const supabase = await createServerSideClient();
      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              preferred_name: preferredName,
              role,
            },
          },
        });

        if (authError && !authError.message.includes('already registered')) {
          console.warn('[Signup API] Supabase signup error, continuing with database profile:', authError.message);
        } else if (authData?.user) {
          supabaseUserId = authData.user.id;
        }
      }
    } catch (err) {
      console.warn('[Signup API] Supabase Auth skipped/mock fallback:', err);
    }

    // 2. Upsert profile in local database
    const profile = await prisma.profile.upsert({
      where: { email },
      update: {
        fullName,
        preferredName,
        role,
        phone,
        timezone,
      },
      create: {
        id: supabaseUserId || undefined,
        email,
        fullName,
        preferredName,
        role,
        phone,
        timezone,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(preferredName)}`,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          preferredName: profile.preferredName,
          role: profile.role,
        },
        message: 'Account registered successfully.',
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error('[Signup API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to complete registration'),
      { status: 500 }
    );
  }
}
