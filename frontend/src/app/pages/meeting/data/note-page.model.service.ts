import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { BehaviorSubject, Observable, map, switchMap, tap } from "rxjs";
import { NewNote, Note, NotePageView } from "./note-page.types";

export class NotePageModelService {
    private http = inject(HttpClient);
    private serverUrl = "http://localhost:8000/api"; //TODO should come from a config file
    private currentRoute = new BehaviorSubject<string | null>(null);
    private nextRoute: string| null = null;
    private previousRoute: string | null = null;

    public getPage(meetingId: number): Observable<NotePageView> {
        return this.currentRoute.pipe(
            map(route => route ?? this.getDefaultRoute(meetingId)),
            switchMap(route => this.http.get<NotePage>(route)),
            map(notePage => {
                this.nextRoute = notePage.next;  //TODO: I don't like this side effect should be handle differnt
                this.previousRoute = notePage.previous;
                return {
                    hasNext: notePage.next != null,
                    hasPrevious: notePage.previous != null,
                    notes: notePage.results,
                }
            })
        )
    }

    public goNextPage() {
        this.currentRoute.next(this.nextRoute);
    }

    public goPreviousPage() {
        this.currentRoute.next(this.previousRoute);
    }

    public addToMeeting({meetingId, note}: {meetingId: number, note: NewNote}): Observable<void>{
        return this.http.post(`${this.serverUrl}/meetings/${meetingId}/notes/`, note).pipe(
            map(()=>undefined), //TODO: We don't aspect a result here we just want to the observable to handel error state
            tap(()=> this.currentRoute.next(this.currentRoute.value))
        );
    }

    private getDefaultRoute(id: number): string {
        return `${this.serverUrl}/meetings/${id}/notes/`
    }
}


type NotePage = {
    count: number;
    next: string | null;
    previous: string | null;
    results: Note[]; 
}