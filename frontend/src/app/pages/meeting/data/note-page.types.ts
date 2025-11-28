export type NotePageView = {
    hasNext: boolean;
    hasPrevious: boolean;
    notes: Note[];
}
export type Note = {
    id: number;
    author: string;
    text: string;
    created_at: Date;
}

export type NewNote = Omit<Note, 'id' | 'created_at'>;