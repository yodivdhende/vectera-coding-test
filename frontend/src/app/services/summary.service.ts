import { inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  timer,
} from "rxjs";
import { Summary, SummaryStatus } from "../pages/meeting/data/summary.types";
import { SummaryModelService } from "../pages/meeting/data/summary.model.service";

@Injectable()
export class SummaryService {
  private summaryModelService = inject(SummaryModelService);
  private refreshSummary$$ = new BehaviorSubject<void>(undefined);

  public getSummaryContentForMeeting(meetingId: number): Observable<string> {
    return this.refreshSummary$$.pipe(
      switchMap(() => this.pollingForSummary(meetingId)),
      map(({content}) => content),
      catchError((error) => {
        if(error.status === 404) return of('No summary yet');
        throw new Error(error);
      })
    );
  }

  public generateNewSummary(meetingId: number): Observable<void> {
    return this.summaryModelService.generateForMeeting(meetingId).pipe(
      tap(() => {
        console.log("nexting refresh");
        this.refreshSummary$$.next(undefined);
      })
    );
  }

  private pollingForSummary(meetingId: number): Observable<Summary> { 
    return timer(0, 500).pipe(
      switchMap(() => this.summaryModelService.getByMeetingId(meetingId)),
      filter(({ status }) => status !== SummaryStatus.pending),
      take(1),
    )
  }
}
