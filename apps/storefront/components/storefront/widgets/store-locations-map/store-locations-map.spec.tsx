/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StoreLocationsMapWidget, isStoreOpenNow } from './store-locations-map';
import type { StoreLocationItem } from '@/lib/storefront/widget-types';

const mockLocations: StoreLocationItem[] = [
  {
    id: 'loja-jurunas',
    name: 'Comercial do Norte — Jurunas',
    eyebrow: 'Comercial do Norte',
    displayTitle: 'Jurunas',
    subtitle: 'Loja de Embalagens e Descartáveis',
    ratingText: '4,8 (1.240)',
    imageUrl: '/assets/loja-jurunas.webp',
    badge: 'Aberto',
    isFeatured: true,
    address: 'Av. Bernardo Sayão, 2450 — Jurunas, Belém - PA',
    hoursWeekdays: 'Fecha às 18:00',
    hoursSaturday: 'Sáb: 07h30 às 14h00',
    phone: '(91) 98344-0880',
    whatsappUrl: 'https://wa.me/5591983440880',
    mapQueryUrl: 'https://www.google.com/maps/search/?api=1&query=Comercial+do+Norte+Bernardo+Sayao+Belem',
    mapEmbedUrl: 'https://www.google.com/maps?q=Comercial+do+Norte+Jurunas&output=embed',
  },
  {
    id: 'loja-sao-bras',
    name: 'Comercial do Norte — Matriz São Brás',
    eyebrow: 'Comercial do Norte (Matriz)',
    displayTitle: 'São Brás',
    subtitle: 'Embalagens e Descartáveis',
    ratingText: '4,8 (950)',
    imageUrl: '/assets/loja-sao-bras.webp',
    badge: 'Aberto',
    isFeatured: false,
    address: 'Av. Rômulo Maiorana, 115 — São Brás, Belém - PA',
    hoursWeekdays: '06h30 às 18h00',
    hoursSaturday: 'Sáb: 06h30 às 12h30',
    phone: '(91) 4042-0513',
    whatsappUrl: 'https://wa.me/5591983440880',
    mapQueryUrl: 'https://www.google.com/maps/search/?api=1&query=Comercial+do+Norte+Sao+Bras',
    mapEmbedUrl: 'https://www.google.com/maps?q=Comercial+do+Norte+Sao+Bras&output=embed',
  },
  {
    id: 'loja-pedreira',
    name: 'Comercial do Norte — Pedreira',
    eyebrow: 'Comercial do Norte',
    displayTitle: 'Pedreira',
    subtitle: 'Loja de Embalagens e Artigos para Festa',
    ratingText: '4,9 (890)',
    imageUrl: '/assets/loja-pedreira.webp',
    badge: 'Fechado',
    isFeatured: false,
    address: 'Av. Pedro Miranda, 1180 — Pedreira, Belém - PA',
    hoursWeekdays: 'Abre às 08:00',
    hoursSaturday: 'Sáb: 08h00 às 13h00',
    phone: '(91) 98344-0880',
    whatsappUrl: 'https://wa.me/5591983440880',
    mapQueryUrl: 'https://www.google.com/maps/search/?api=1&query=Comercial+do+Norte+Pedreira+Belem',
    mapEmbedUrl: 'https://www.google.com/maps?q=Comercial+do+Norte+Pedreira&output=embed',
  },
];

describe('StoreLocationsMapWidget', () => {
  it('renderiza as lojas e atualiza o mapa ao clicar em outra unidade', () => {
    const { container } = render(
      <StoreLocationsMapWidget
        locations={mockLocations}
        mapEmbedUrl="https://www.google.com/maps?q=Belem&output=embed"
        searchPlaceholder="Buscar unidade"
        subtitle="Lojas mais perto de você"
        title="Encontre nossas unidades"
      />,
    );

    // Initial check: iframe should point to Jurunas
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toBe('https://www.google.com/maps?q=Comercial+do+Norte+Jurunas&output=embed');

    // Click on Pedreira
    const pedreiraCard = screen.getByText('Pedreira');
    fireEvent.click(pedreiraCard);

    // After click, iframe should update to Pedreira
    const updatedIframe = container.querySelector('iframe');
    expect(updatedIframe?.getAttribute('src')).toBe('https://www.google.com/maps?q=Comercial+do+Norte+Pedreira&output=embed');

    // "Como chegar" button should update to Pedreira URL
    const directionsLink = screen.getByTitle('Abrir rota no Google Maps');
    expect(directionsLink.getAttribute('href')).toBe('https://www.google.com/maps/search/?api=1&query=Comercial+do+Norte+Pedreira+Belem');
  });

  it('exibe eyebrow "Comercial do Norte" e nome limpo do local como título sem subtítulo descritivo', () => {
    render(
      <StoreLocationsMapWidget
        locations={mockLocations}
        mapEmbedUrl="https://www.google.com/maps?q=Belem&output=embed"
        searchPlaceholder="Buscar unidade"
        subtitle="Lojas mais perto de você"
        title="Encontre nossas unidades"
      />,
    );

    // Eyebrows
    expect(screen.getAllByText('Comercial do Norte').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Comercial do Norte (Matriz)')[0]).not.toBeNull();

    // Main location titles
    expect(screen.getAllByText('Jurunas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('São Brás').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pedreira').length).toBeGreaterThanOrEqual(1);

    // Redundant subtitles must NOT be rendered
    expect(screen.queryByText('Loja de Embalagens e Descartáveis')).toBeNull();
    expect(screen.queryByText('Loja de Embalagens e Artigos para Festa')).toBeNull();
  });

  it('não possui classes amarelas (amber) na identidade visual dark mode', () => {
    const { container } = render(
      <StoreLocationsMapWidget
        locations={mockLocations}
        mapEmbedUrl="https://www.google.com/maps?q=Belem&output=embed"
        searchPlaceholder="Buscar unidade"
        subtitle="Lojas mais perto de você"
        title="Encontre nossas unidades"
      />,
    );

    const html = container.innerHTML;
    expect(html).not.toContain('amber');
    expect(html).not.toContain('yellow');
  });

  it('exibe badge "Aberto" em verde e "Fechado" em vermelho dinamicamente', () => {
    const customLocations: StoreLocationItem[] = [
      {
        ...mockLocations[0],
        hoursWeekdays: '00h00 às 23h59', // Sempre aberto
      },
      {
        ...mockLocations[1],
        hoursWeekdays: '01h00 às 02h00', // Fechado agora
      },
    ];

    render(
      <StoreLocationsMapWidget
        locations={customLocations}
        mapEmbedUrl="https://www.google.com/maps?q=Belem&output=embed"
        searchPlaceholder="Buscar unidade"
        subtitle="Lojas mais perto de você"
        title="Encontre nossas unidades"
      />,
    );

    const abertoElement = screen.getAllByText('Aberto')[0];
    expect(abertoElement.className).toContain('text-emerald-400');

    const fechadoElement = screen.getAllByText('Fechado')[0];
    expect(fechadoElement.className).toContain('text-rose-400');
  });

  it('detecta corretamente loja fechada após as 18h00', () => {
    const nightDate = new Date('2026-10-27T19:30:00-03:00');
    expect(isStoreOpenNow({ hoursWeekdays: '06h30 às 18h00' }, nightDate)).toBe(false);
    expect(isStoreOpenNow({ hoursWeekdays: '07h00 às 18h00' }, nightDate)).toBe(false);
    expect(isStoreOpenNow({ hoursWeekdays: '07h00 às 19h00' }, nightDate)).toBe(false);
    expect(isStoreOpenNow({ hoursWeekdays: '07h00 às 21h00' }, nightDate)).toBe(true);
  });
});
