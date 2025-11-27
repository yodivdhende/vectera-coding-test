export type MeetingPage = {
    count: number;
    next: string | null;
    previous: string | null;
    results: Meeting[]; 
}
export type Meeting = {
    id: number
    title: string;
    started_at: Date;
    created_at: Date;
}