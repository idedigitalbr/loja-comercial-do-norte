import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { slugify } from './posts.service';

export type CreateEventInput = {
  title: string;
  slug?: string;
  subtitle?: string;
  description: string;
  posterUrl?: string;
  eventDate?: Date | string;
  eventDateText?: string;
  eventTime?: string;
  location?: string;
  locationAddress?: string;
  instructor?: string;
  badge?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  status?: RecordStatus;
  sortOrder?: number;
};

export type UpdateEventInput = Partial<CreateEventInput>;

@Injectable()
export class EventsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listEvents(query: { status?: RecordStatus; search?: string } = {}) {
    const where: Prisma.EventWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { subtitle: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
        { instructor: { contains: term, mode: 'insensitive' } },
      ];
    }

    return this.prisma.event.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getEventBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      throw new NotFoundException(`Evento "${slug}" não encontrado`);
    }

    return event;
  }

  async getEventById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Evento id "${id}" não encontrado`);
    }

    return event;
  }

  async createEvent(input: CreateEventInput) {
    const slug = (input.slug?.trim() ? slugify(input.slug) : slugify(input.title)) || `evento-${Date.now()}`;
    return this.prisma.event.create({
      data: {
        title: input.title.trim(),
        slug,
        subtitle: input.subtitle?.trim() || null,
        description: input.description,
        posterUrl: input.posterUrl?.trim() || null,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        eventDateText: input.eventDateText?.trim() || null,
        eventTime: input.eventTime?.trim() || null,
        location: input.location?.trim() || null,
        locationAddress: input.locationAddress?.trim() || null,
        instructor: input.instructor?.trim() || null,
        badge: input.badge?.trim() || null,
        ctaLabel: input.ctaLabel?.trim() || 'Inscreva-se Já!',
        ctaUrl: input.ctaUrl?.trim() || null,
        status: input.status ?? RecordStatus.ACTIVE,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  async updateEvent(id: string, input: UpdateEventInput) {
    await this.getEventById(id);
    const data: Prisma.EventUpdateInput = {};

    if (input.title !== undefined) data.title = input.title.trim();
    if (input.slug !== undefined) data.slug = slugify(input.slug) || slugify(input.title ?? id);
    if (input.subtitle !== undefined) data.subtitle = input.subtitle?.trim() || null;
    if (input.description !== undefined) data.description = input.description;
    if (input.posterUrl !== undefined) data.posterUrl = input.posterUrl?.trim() || null;
    if (input.eventDate !== undefined) data.eventDate = input.eventDate ? new Date(input.eventDate) : null;
    if (input.eventDateText !== undefined) data.eventDateText = input.eventDateText?.trim() || null;
    if (input.eventTime !== undefined) data.eventTime = input.eventTime?.trim() || null;
    if (input.location !== undefined) data.location = input.location?.trim() || null;
    if (input.locationAddress !== undefined) data.locationAddress = input.locationAddress?.trim() || null;
    if (input.instructor !== undefined) data.instructor = input.instructor?.trim() || null;
    if (input.badge !== undefined) data.badge = input.badge?.trim() || null;
    if (input.ctaLabel !== undefined) data.ctaLabel = input.ctaLabel?.trim() || null;
    if (input.ctaUrl !== undefined) data.ctaUrl = input.ctaUrl?.trim() || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async archiveEvent(id: string) {
    await this.getEventById(id);
    return this.prisma.event.update({
      where: { id },
      data: { status: RecordStatus.ARCHIVED },
    });
  }

  async deleteEvent(id: string) {
    await this.getEventById(id);
    return this.prisma.event.delete({ where: { id } });
  }
}
