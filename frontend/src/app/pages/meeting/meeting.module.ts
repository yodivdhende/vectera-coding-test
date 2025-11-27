import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MeetingOverviewComponent } from "./meeting-overview/meeting-overview.component";

const ROUTES: Routes = [
    { path: '', component: MeetingOverviewComponent},
    // {path: ':id', component: MeetingDetailComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(ROUTES)]
})
export class MeetingModule {}