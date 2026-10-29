'use client';

import React from 'react';
import { EventSinglePost } from './event-single-post';
import type { ApiEvent } from '@/lib/api';

export type WorkshopSinglePostProps = {
  event: ApiEvent;
  relatedWorkshops?: ApiEvent[];
};

export function WorkshopSinglePost({ event }: WorkshopSinglePostProps) {
  return (
    <EventSinglePost
      event={event}
      theme="light"
      breadcrumbParent={{
        label: 'Workshops · Aulas Confeitaria',
        href: '/eventos/workshops/aulas-confeitaria',
      }}
      ctaLabel="Garantir Vaga no WhatsApp"
    />
  );
}
