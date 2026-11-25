'use client';

import { useEffect } from 'react';

/**
 * Renders nothing until a publisher id and slot id are set.
 * Turning ads on is a dashboard change, not a code change.
 */
export default function AdSlot({ slot }: { slot?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  useEffect(() => {
    if (!client || !slot) return;
    const ads = (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || [];
    (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle = ads;
    try {
      ads.push({});
    } catch {
      // The unit stays empty until AdSense approves the site.
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <aside className="my-6 flex justify-center" aria-label="Advertisement">
      <ins
        className="adsbygoogle block w-full max-w-3xl"
        style={{ display: 'block', minHeight: 90 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
