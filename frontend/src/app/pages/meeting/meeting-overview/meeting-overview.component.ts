import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MeetingModelService } from "src/app/data/meeting.model.service";
import { RouterLink } from "@angular/router";

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
        MeetingModelService, //TODO: this okay for now, if we want storage we should move this to the routes or module.
    ]
})
export class MeetingOverviewComponent{
    private meetingModelService = inject(MeetingModelService);

    public meetings$ = this.meetingModelService.getAll();
 }
