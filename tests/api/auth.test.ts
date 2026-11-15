import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as handleLogin } from '@/app/api/v1/auth/login/route';
import { POST as handleSignup } from '@/app/api/v1/auth/signup/route';
import { prisma } from '@/lib/db';
import { createServerSideClient } from '@/lib/supabase/server';

vi.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSideClient: vi.fn(),
}));

describe('Auth API Integration (/api/v1/auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 with user profile and token for registered user', async () => {
      vi.mocked(createServerSideClient).mockResolvedValue(null as any);
      vi.mocked(prisma.profile.findFirst).mockResolvedValue({
        id: 'user-db-123',
        email: 'margaret@vance.com',
        fullName: 'Margaret Vance',
        preferredName: 'Margaret',
        role: 'elderly',
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'margaret@vance.com',
          password: 'Password@123',
        }),
      });

      const response = await handleLogin(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.user.fullName).toBe('Margaret Vance');
      expect(json.data.user.role).toBe('elderly');
      expect(json.data.token).toBeDefined();
    });

    it('returns demo senior user when logging in with margaret demo email offline', async () => {
      vi.mocked(createServerSideClient).mockResolvedValue(null as any);
      vi.mocked(prisma.profile.findFirst).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'margaret@lifora.demo',
          password: 'Margaret@123',
        }),
      });

      const response = await handleLogin(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.user.fullName).toBe('Margaret Vance');
      expect(json.data.user.role).toBe('elderly');
    });

    it('returns demo family user when logging in with sarah demo email offline', async () => {
      vi.mocked(createServerSideClient).mockResolvedValue(null as any);
      vi.mocked(prisma.profile.findFirst).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sarah@lifora.demo',
          password: 'Sarah@123',
        }),
      });

      const response = await handleLogin(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.user.fullName).toBe('Sarah Vance');
      expect(json.data.user.role).toBe('family');
    });

    it('returns 400 Bad Request with VALIDATION_ERROR on malformed request body', async () => {
      const req = new NextRequest('http://localhost:3005/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          password: '',
        }),
      });

      const response = await handleLogin(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/signup', () => {
    it('returns 201 Created on valid registration input', async () => {
      vi.mocked(createServerSideClient).mockResolvedValue(null as any);
      vi.mocked(prisma.profile.upsert).mockResolvedValue({
        id: 'new-user-1',
        email: 'newuser@lifora.demo',
        fullName: 'New User',
        preferredName: 'New',
        role: 'elderly',
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@lifora.demo',
          password: 'SecurePassword123',
          fullName: 'New User',
          preferredName: 'New',
          role: 'elderly',
          phone: '(503) 555-0199',
        }),
      });

      const response = await handleSignup(req);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.user.email).toBe('newuser@lifora.demo');
      expect(json.data.message).toContain('Account registered successfully');
    });

    it('returns 400 Bad Request on invalid input', async () => {
      const req = new NextRequest('http://localhost:3005/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bad-email',
          password: 'short',
          fullName: '',
          role: 'unknown',
        }),
      });

      const response = await handleSignup(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
