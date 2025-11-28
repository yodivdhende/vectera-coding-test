import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { combineLatest, map, Observable, shareReplay, switchMap } from "rxjs";
import { MeetingPageModelService } from "src/app/pages/meeting/data/meeting-page.model.service";
import { Meeting } from "../data/meeting.types";
import { SummaryService } from "src/app/services/summary.service";
import { SummaryModelService } from "../data/summary.model.service";

@Component({
    selector: 'app-meeting-overview',
    templateUrl: 'meeting-overview.component.html',
    styleUrl: 'meeting-overview.component.scss',
    standalone: true,
    imports: [
    CommonModule,
    RouterLink
],
    providers: [
        MeetingPageModelService, //TODO: this okay for now, if we want storage we should move this to the routes or module.
        SummaryModelService,
        SummaryService,
    ]
})
export class MeetingOverviewComponent{
    private meetingModelService = inject(MeetingPageModelService);
    private summaryService = inject(SummaryService);

    public meetingPage$ = this.meetingModelService.getPage().pipe(
        shareReplay({bufferSize: 1, refCount: true})
    );

    public meetings$: Observable<MeetingView[]> = this.meetingPage$.pipe(
        switchMap(({meetings})=>{
            return combineLatest(meetings.map((meeting)=>this.summaryService.getStatus(meeting.id))).pipe(
                map(status => status.map((status, statusIndex) => {
                    return {
                        ...meetings[statusIndex],
                        summaryStatus: status,
                    }
                }))
            )
        }),
    );

    public goNextPage() {
        this.meetingModelService.goNextPage();
    }

    public goPreviousPage(){
        this.meetingModelService.goPreviousPage();
    }

 }

 type MeetingView = Meeting & {
    summaryStatus: string;
 }
