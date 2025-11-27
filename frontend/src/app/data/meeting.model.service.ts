import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Meeting, MeetingPage } from "./meeting.types";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class MeetingModelService {
    private http = inject(HttpClient);

    public getAll(): Observable<Meeting[]> {
        return this.http.get<MeetingPage>(`http://localhost:8000/api/meetings`).pipe(
            map(({results})=> results)
        );
    }
    
    private mapToMeeting(
        {id, title, started_at, created_at}:
        {id: number, title: string, started_at: string, created_at: string}
    ): Meeting {
        return {
            id,
            title,
            started_at: new Date(started_at),
            created_at: new Date(created_at),
        }
    }
}

