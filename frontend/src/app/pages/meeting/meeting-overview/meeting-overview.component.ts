import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { map, shareReplay } from "rxjs";
import { MeetingPageModelService } from "src/app/pages/meeting/data/meeting-page.model.service";

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
    ]
})
export class MeetingOverviewComponent{
    private meetingModelService = inject(MeetingPageModelService);

    public meetingPage$ = this.meetingModelService.getPage().pipe(
        shareReplay({bufferSize: 1, refCount: true})
    );

    public meetings$ = this.meetingPage$.pipe(
        map(({meetings})=> meetings)
    );

    public goNextPage() {
        this.meetingModelService.goNextPage();
    }

    public goPreviousPage(){
        this.meetingModelService.goPreviousPage();
    }

 }
