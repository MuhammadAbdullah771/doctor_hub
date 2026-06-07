import { supabase } from '@/lib/supabase'

export interface AuditLogEntry {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  actor_name?: string | null
}

function mapRow(row: Record<string, unknown>): AuditLogEntry {
  const actor = row.actor as { full_name?: string } | null
  return {
    id: row.id as string,
    actor_id: row.actor_id as string | null,
    action: row.action as string,
    entity_type: row.entity_type as string,
    entity_id: row.entity_id as string | null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
    actor_name: actor?.full_name ?? null,
  }
}

export const auditService = {
  async getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, actor:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>))
  },
}
