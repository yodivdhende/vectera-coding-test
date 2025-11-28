import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, switchMap, tap } from "rxjs";
import { NotesModelService } from "../pages/meeting/data/notes.model.service";
import { NewNote, Note } from "../pages/meeting/data/notes.types";

@Injectable()
export class NoteStoreService extends NotesModelService { 
   private notesModelService = inject(NotesModelService);
   private refreshSummary$$ = new BehaviorSubject<void>(undefined);

   public override getAllForMeeting(meetingId: number): Observable<Note[]>{
    return this.refreshSummary$$.pipe(switchMap(()=> this.notesModelService.getAllForMeeting(meetingId)))
   }

   public override addToMeeting({ meetingId, note }: { meetingId: number; note: NewNote; }): Observable<void> {
    return this.notesModelService.addToMeeting({meetingId, note}).pipe(
        tap(()=> this.refreshSummary$$.next(undefined))
    )
   }
}