import { inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  filter,
  Observable,
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

  public getLatestSummaryForMeeting(meetingId: number): Observable<Summary> {
    return this.refreshSummary$$.pipe(
      switchMap(() => this.pollingForSummary(meetingId))
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
