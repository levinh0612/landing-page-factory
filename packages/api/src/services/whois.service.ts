export async function fetchWhoisData(domain: string): Promise<{
  expiresAt: Date | null;
  registrar: string | null;
}> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return { expiresAt: null, registrar: null };

    const data = (await res.json()) as {
      events?: Array<{ eventAction: string; eventDate: string }>;
      entities?: Array<{ roles?: string[]; vcardArray?: unknown[] }>;
    };

    // Extract expiry date
    let expiresAt: Date | null = null;
    if (Array.isArray(data.events)) {
      const expEvent = data.events.find((e) => e.eventAction === 'expiration');
      if (expEvent?.eventDate) {
        const d = new Date(expEvent.eventDate);
        if (!isNaN(d.getTime())) expiresAt = d;
      }
    }

    // Extract registrar name from entities
    let registrar: string | null = null;
    if (Array.isArray(data.entities)) {
      const registrarEntity = data.entities.find(
        (e) => Array.isArray(e.roles) && e.roles.includes('registrar'),
      );
      if (registrarEntity?.vcardArray) {
        const vcard = registrarEntity.vcardArray as unknown[][];
        if (Array.isArray(vcard) && Array.isArray(vcard[1])) {
          const fnEntry = (vcard[1] as unknown[][]).find(
            (entry) => Array.isArray(entry) && entry[0] === 'fn',
          );
          if (fnEntry && typeof fnEntry[3] === 'string') {
            registrar = fnEntry[3];
          }
        }
      }
    }

    return { expiresAt, registrar };
  } catch {
    return { expiresAt: null, registrar: null };
  }
}
