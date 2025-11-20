'use client'

import {useCallback, useState} from 'react'
import {Button} from "../../../../../../WebstormProjects/ats_captive_portal/src/components/ui/button"
import {Copy} from 'lucide-react'

// A lightweight, drop-in component for rendering and copying manual metadata.
// Usage example:
// <ManualMetadataView metadata={manualDetails.metadata} t={t} />

interface ManualMetadataViewProps {
    metadata?: string | null
    label?: string
    /** Optional wrapper className to further style or position the view. */
    className?: string
}

export default function ManualMetadataView({
                                               metadata = '',
                                               label,
                                               className,
                                           }: ManualMetadataViewProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(String(metadata ?? ''))
            setCopied(true)
            const timer = setTimeout(() => setCopied(false), 1500)
            return () => clearTimeout(timer)
        } catch (err) {
            console.error('Copy failed', err)
        }
    }, [metadata])

    return (
        <div className={className}>
            <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">
            {label}
            </span>
                <Button
                    type="button"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                    onClick={handleCopy}
                >
                    <Copy className="mr-1 h-3 w-3"/>
                    {copied ? 'Kopiert!' : 'Kopieren'}
                </Button>
            </div>

            <pre
                className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded bg-muted p-2 font-mono text-[10px] leading-snug">
        {String(metadata ?? '')}
    </pre>
        </div>
    )
}
