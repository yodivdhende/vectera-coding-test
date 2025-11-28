import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Meeting } from "./meeting.types";

@Injectable()
export class MeetingModelService{
    private http = inject(HttpClient);
    private serverUrl = "http://localhost:8000/api"; //TODO should come from a config file

    public getById(id: number): Observable<Meeting> { 
        return this.http.get<Meeting>(`${this.serverUrl}/meetings/${id}/`).pipe(
        );
    }
}
