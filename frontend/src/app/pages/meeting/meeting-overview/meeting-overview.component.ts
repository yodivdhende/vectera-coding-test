import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MeetingModelService } from "src/app/data/meeting.model.service";

@Component({
    selector: 'app-meeting-overview',
    templateUrl: 'meeting-overview.component.html',
    styleUrl: 'meeting-overview.component.html',
    standalone: true,
    imports: [
        CommonModule,
    ],
    providers: [
        MeetingModelService,
    ]
})
export class MeetingOverviewComponent{
    private meetingModelService = inject(MeetingModelService);

    public meetings$ = this.meetingModelService.getAll();
 }
