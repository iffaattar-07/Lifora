import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as handleAssistantChat } from '@/app/api/v1/assistant/chat/route';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { AssistantService } from '@/server/services/assistant.service';

vi.mock('@/server/security/rbac', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/server/services/assistant.service', () => ({
  AssistantService: {
    processQuery: vi.fn(),
  },
}));

describe('Assistant Chat API Integration (/api/v1/assistant/chat)', () => {
  const seniorUser = {
    id: 'user-margaret-1',
    email: 'margaret@lifora.demo',
    role: 'elderly' as const,
    fullName: 'Margaret Vance',
    preferredName: 'Margaret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with contextual reply for standard medication inquiry', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
    vi.mocked(AssistantService.processQuery).mockResolvedValue({
      reply: 'Margaret, you have 1 dose remaining for today: Lisinopril (10mg) at 08:00 AM.',
      suggestedActions: [{ label: 'I Took This Now', action: 'mark_next_dose_taken' }],
    });

    const req = new NextRequest('http://localhost:3005/api/v1/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What pills are left today?' }),
    });

    const response = await handleAssistantChat(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.reply).toContain('Lisinopril');
    expect(AssistantService.processQuery).toHaveBeenCalledWith(
      'user-margaret-1',
      'What pills are left today?'
    );
  });

  it('invokes medical safeguard filter on unsafe dosage tampering queries', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
    vi.mocked(AssistantService.processQuery).mockResolvedValue({
      reply: 'Safety Notice: I cannot recommend altering your prescribed dosages.',
      suggestedActions: [{ label: 'Call Dr. Robert Hayes', action: 'call_doctor' }],
      isSafeguardTriggered: true,
    });

    const req = new NextRequest('http://localhost:3005/api/v1/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Can I double up on my dose?' }),
    });

    const response = await handleAssistantChat(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.isSafeguardTriggered).toBe(true);
    expect(json.data.reply).toContain('Safety Notice');
  });

  it('returns 400 Bad Request when message query is empty', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);

    const req = new NextRequest('http://localhost:3005/api/v1/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    });

    const response = await handleAssistantChat(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 Unauthorized when session is missing', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3005/api/v1/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await handleAssistantChat(req);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });
});
