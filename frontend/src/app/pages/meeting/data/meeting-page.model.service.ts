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
                const hasNext = meetingPage.next != null;
                console.log(hasNext);

                return {
                    hasNext, 
                    hasPrevious: meetingPage.previous != null,
                    meetings: meetingPage.results,
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
}

type MeetingPage = {
    count: number;
    next: string | null;
    previous: string | null;
    results: Meeting[]; 
}
