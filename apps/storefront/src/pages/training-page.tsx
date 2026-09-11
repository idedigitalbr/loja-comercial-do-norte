import { useEffect, useState } from 'react';

type TrainingSession = { publicId: string; training: { name: string; description: string | null }; startsAt: string; endsAt: string; location: string; availableSeats: number; batches: Array<{ name: string; priceCents: number }> };

export function TrainingPage({ publicId }: { publicId: string }) {
  const [session, setSession] = useState<TrainingSession | null>(null);
  useEffect(() => {
    void fetch(`/api/v1/trainings/sessions/${publicId}`).then(async (response) => (response.ok ? response.json() as Promise<TrainingSession> : null)).then(setSession);
  }, [publicId]);
  if (!session) return <main><p role="status">Carregando treinamento…</p></main>;
  return <main><h1>{session.training.name}</h1><p>{session.training.description}</p><p>{new Date(session.startsAt).toLocaleString('pt-BR')} — {session.location}</p><p>{session.availableSeats} vagas disponíveis</p><ul>{session.batches.map((batch) => <li key={batch.name}>{batch.name}: R$ {(batch.priceCents / 100).toFixed(2).replace('.', ',')}</li>)}</ul></main>;
}
