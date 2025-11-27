import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Meeting, MeetingPage } from "./meeting.types";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class MeetingModelService {
    private http = inject(HttpClient);
    private serverUrl = "http://localhost:8000/api"; //TODO should come from a config file

    public getAll(): Observable<Meeting[]> {
        return this.http.get<MeetingPage>(`${this.serverUrl}/meetings`).pipe(
            map(({results})=> results)
        );
    }

    public getById(id: number): Observable<Meeting> {
        return this.http.get<Meeting>(`${this.serverUrl}/meetings/${id}/`).pipe(
        );
    }
}

