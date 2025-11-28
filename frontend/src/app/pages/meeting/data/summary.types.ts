export type Summary = {
    id: number;
    content: string;
    status: SummaryStatus;
    created_at: Date;
    updated_at: Date;
}

export const SummaryStatus = { 
    ready: 'ready',
    pending: 'pending',
    failed: 'failed',
} as const 
export type SummaryStatus = typeof SummaryStatus[keyof typeof SummaryStatus]