import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { MeetingPageView } from "./meeting-page.types";
import { HttpClient } from "@angular/common/http";
import { Meeting } from "./meeting.types";

@Injectable()
export class MeetingPageModelService {
    private http = inject(HttpClient);
    private serverUrl = "http://localhost:8000/api"; //TODO should come from a config file
    private currentRoute = new BehaviorSubject<string>(`${this.serverUrl}/meetings`);
    private nextRoute: string| null = null;
    private previousRoute: string | null = null;

    public getPage(): Observable<MeetingPageView> {
        return this.currentRoute.pipe(
            switchMap(route => this.http.get<MeetingPage>(route)),
            map(meetingPage => {
                this.nextRoute = meetingPage.next;  //TODO: I don't like this side effect should be handle differnt
                this.previousRoute = meetingPage.previous;
                return {
                    hasNext:meetingPage.next != null, 
                    hasPrevious: meetingPage.previous != null,
                    meetings: this.mapMeetingPageResultsToMeetings(meetingPage.results),
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

    private mapMeetingPageResultsToMeetings(results: MeetingPage['results']): Meeting[] {
        return results.map(({id, title, started_at, created_at, note_count}) => {
            return {
                id,
                title,
                noteCount: note_count,
                startedAt: new Date(started_at),
                createdAt: new Date(created_at),
            }  
        })
    }
}

type MeetingPage = {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
        id: number;
        title: string;
        started_at: string;
        created_at: string;
        note_count: number;
    }[]; 
}
