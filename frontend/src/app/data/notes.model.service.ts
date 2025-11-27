import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { NewNote, Note } from "./notes.types";

export class NotesModelService {
    private http = inject(HttpClient);
    private serverUrl = "http://localhost:8000/api"; //TODO should come from a config file

    public getAll(meetingId: number): Observable<Note[]> {
        return this.http.get<Note[]>(`${this.serverUrl}/meetings/${meetingId}/notes/`)
    }

    public add({meetingId, note}: {meetingId: number, note: NewNote}): Observable<void>{
        return this.http.post(`${this.serverUrl}/meetings/${meetingId}/notes/`, note).pipe(
            map(()=>undefined) //TODO: We don't aspect a result here we just want to the observable to handel error state
        );
    }
}
