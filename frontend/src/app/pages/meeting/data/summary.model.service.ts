import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Summary } from "./summary.types";

@Injectable()
export class SummaryModelService{
    private http = inject(HttpClient);
    private serverUrl = "http://localhost:8000/api"; //TODO should come from a config file

    public getByMeetingId(meetingId: number): Observable<Summary> {
        return this.http.get<Summary>(`${this.serverUrl}/meetings/${meetingId}/summary/`);
    }
    
    public generateForMeeting(meetingId): Observable<void>{
        return this.http.post(`${this.serverUrl}/meetings/${meetingId}/summarize/`, {}).pipe(
            map(()=> undefined)
        );
    }
}

