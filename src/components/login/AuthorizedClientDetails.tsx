'use client';

import {useMemo, useState} from 'react';

import type {AuthorizedClientStatusResponse} from '@/lib/api';

import {Button} from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

type AuthorizedClientDetailsProps = {
    status: AuthorizedClientStatusResponse;
    translateString: (key: string, fallback: string) => string;
};

type DetailEntry = {
    label: string;
    value: string;
};

function formatSessionStart(timestamp: number): string | null {
    if (!timestamp) {
        return null;
    }

    const milliseconds = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
    const date = new Date(milliseconds);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleString();
}

export function AuthorizedClientDetails({status, translateString}: AuthorizedClientDetailsProps) {
    const notAvailableLabel = useMemo(
        () => translateString('authorizedDetails.notAvailable', 'Not available'),
        [translateString],
    );

    const importantDetails = useMemo<DetailEntry[]>(
        () => [
            {
                label: translateString('authorizedDetails.username', 'Username'),
                value: status.userName?.trim() || notAvailableLabel,
            },
            {
                label: translateString('authorizedDetails.ipAddress', 'IP address'),
                value: status.ipAddress?.trim() || notAvailableLabel,
            },
        ],
        [notAvailableLabel, status.ipAddress, status.userName, translateString],
    );
    const renderDetail = ({label, value}: DetailEntry) => (
        <div key={label} className="space-y-1 wrap-break-word">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold text-foreground wrap-break-word">{value}</dd>
        </div>
    );

    return (
        <section aria-label={translateString('authorizedDetails.heading', 'Connection details')} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
                {translateString('authorizedDetails.title', 'Active connection')}
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">{importantDetails.map(renderDetail)}</dl>
        </section>
    );
}

