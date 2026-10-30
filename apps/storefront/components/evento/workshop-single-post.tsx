'use client';

import React from 'react';
import { ConfeitariaWorkshopSingle } from './confeitaria-workshop-single';
import type { ApiEvent } from '@/lib/api';
import type { EventItem } from '@/lib/events-data';

export type WorkshopSinglePostProps = {
  event: ApiEvent | EventItem;
  relatedWorkshops?: (ApiEvent | EventItem)[];
};

export function WorkshopSinglePost({ event }: WorkshopSinglePostProps) {
  return (
    <ConfeitariaWorkshopSingle
      event={event as EventItem}
      breadcrumbParent={{
        label: 'Workshops · Aulas Confeitaria',
        href: '/eventos/workshops/aulas-confeitaria',
      }}
    />
  );
}
