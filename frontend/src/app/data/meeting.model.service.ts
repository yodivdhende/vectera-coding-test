import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Meeting } from "./meeting.types";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class MeetingModelService {
    private http = inject(HttpClient);
    public getAll(): Observable<Meeting[]> {
        return this.http.get<Meeting[]>(`http://localhost:8000/api/meetings`);
    }
}