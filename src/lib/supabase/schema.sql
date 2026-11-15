-- ========================================================
-- LIFORA: Intelligent Elderly Care & Wellness Platform
-- Production PostgreSQL Database Schema with RLS
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Elderly, Family, Caretaker)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('elderly', 'family', 'caretaker')),
    full_name TEXT NOT NULL,
    preferred_name TEXT,
    age INT,
    dob DATE,
    blood_type VARCHAR(10),
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    primary_conditions TEXT[] DEFAULT '{}',
    known_allergies TEXT[] DEFAULT '{}',
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    primary_physician JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT NOT NULL,
    form VARCHAR(30) NOT NULL CHECK (form IN ('tablet', 'capsule', 'liquid', 'inhaler', 'injection', 'drops', 'topical')),
    color VARCHAR(20) DEFAULT '#3B82F6',
    purpose TEXT NOT NULL,
    frequency VARCHAR(30) NOT NULL CHECK (frequency IN ('daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'weekly', 'as_needed')),
    schedule_times TEXT[] NOT NULL DEFAULT '{"08:00"}',
    with_food VARCHAR(20) NOT NULL CHECK (with_food IN ('before', 'with', 'after', 'anytime')),
    instructions TEXT,
    prescribing_doctor TEXT,
    refill_count INT DEFAULT 0,
    total_quantity INT DEFAULT 30,
    active BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. DOSE LOGS TABLE (Tracks individual daily doses)
CREATE TABLE IF NOT EXISTS public.dose_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'taken', 'missed', 'snoozed')),
    taken_at TIMESTAMP WITH TIME ZONE,
    taken_by UUID REFERENCES public.profiles(id),
    missed_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. CARE CIRCLE MEMBERS (Family & Caretakers connected to elderly user)
CREATE TABLE IF NOT EXISTS public.care_circle_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    elderly_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    relationship VARCHAR(40) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('family', 'caretaker')),
    phone TEXT,
    email TEXT NOT NULL,
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    can_manage_meds BOOLEAN DEFAULT TRUE,
    receive_instant_alerts BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    invite_status VARCHAR(20) DEFAULT 'accepted' CHECK (invite_status IN ('invited', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    facility TEXT NOT NULL,
    address TEXT,
    contact_number TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    notes TEXT,
    requires_escort BOOLEAN DEFAULT FALSE,
    assigned_escort TEXT,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'rescheduled', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. CARE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.care_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_role VARCHAR(20) CHECK (recipient_role IN ('all', 'elderly', 'family', 'caretaker')),
    type VARCHAR(40) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('urgent', 'warning', 'info', 'success')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    action_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profile
CREATE POLICY "Users can manage own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);

-- Allow care circle members to view the elderly person's profile
CREATE POLICY "Care circle can view elderly profile" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.care_circle_members ccm
    WHERE ccm.elderly_user_id = public.profiles.id
    AND ccm.member_user_id = auth.uid()
  )
);

-- Medications policies
CREATE POLICY "Elderly and authorized circle can manage medications" 
ON public.medications FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.care_circle_members ccm 
    WHERE ccm.elderly_user_id = public.medications.user_id 
    AND ccm.member_user_id = auth.uid()
    AND ccm.can_manage_meds = TRUE
  )
);

-- Dose logs policies
CREATE POLICY "Elderly and circle can manage dose logs" 
ON public.dose_logs FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.care_circle_members ccm 
    WHERE ccm.elderly_user_id = public.dose_logs.user_id 
    AND ccm.member_user_id = auth.uid()
  )
);
