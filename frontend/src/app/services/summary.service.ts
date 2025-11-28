import { inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer,
} from "rxjs";
import { Summary, SummaryStatus } from "../pages/meeting/data/summary.types";
import { SummaryModelService } from "../pages/meeting/data/summary.model.service";

@Injectable()
export class SummaryService {
  private summaryModelService = inject(SummaryModelService);
  private refreshSummary$$ = new BehaviorSubject<void>(undefined);

  public getContent(meetingId: number): Observable<string> {
    return this.refreshSummary$$.pipe(
      switchMap(() => this.pollingForSummary(meetingId)),
      map(({content, status}) => {
        if(status === SummaryStatus.pending) return 'Pending';
        return content;
      }),
      catchError((error) => {
        if(error.status === 404) return of('No summary yet');
        throw new Error(error);
      })
    );
  }

  public getStatus(meetingId: number): Observable<string> {
      return this.pollingForSummary(meetingId).pipe(
        map(({status}) => status),
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
    const stopPolling$$ = new Subject<void>();
    return timer(0, 500).pipe(
      takeUntil(stopPolling$$),
      switchMap(() => this.summaryModelService.getByMeetingId(meetingId)),
      tap(({status})=>{
        if(status !== SummaryStatus.pending) {
          stopPolling$$.next()
        }
      })
    )
  }
}
