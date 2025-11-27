import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { of, switchMap } from "rxjs";
import { MeetingModelService } from "src/app/data/meeting.model.service";

@Component({
    selector: 'app-meeting-overview',
    templateUrl: 'meeting-detail.component.html',
    styleUrl: 'meeting-detail.component.scss',
    standalone: true,
    imports: [
    CommonModule,
],
    providers: [
        MeetingModelService
     ]
})
export class MeetingDetailComponent {
    private activeRoute = inject(ActivatedRoute);
    private meetingModelService = inject(MeetingModelService);

    public meeting$ = this.activeRoute.paramMap.pipe(
        switchMap(paramsMap=> {
            const id = Number(paramsMap.get('id'))
            if(id == null || isNaN(id)) return of(null);
            return this.meetingModelService.getById(id)
        })
    )

}