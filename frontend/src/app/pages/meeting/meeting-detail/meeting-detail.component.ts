import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, combineLatest, filter, map, shareReplay, switchMap, take, tap } from "rxjs";
import { MeetingPageModelService } from "src/app/pages/meeting/data/meeting-page.model.service";
import { NotesModelService } from "src/app/pages/meeting/data/notes.model.service";
import { SummaryModelService } from "src/app/pages/meeting/data/summary.model.service";
import { NoteStoreService } from "src/app/services/note-store.service";
import { SummaryService } from "src/app/services/summary.service";
import { MeetingModelService } from "../data/meeting.model.service";

@Component({
  selector: "app-meeting-overview",
  templateUrl: "meeting-detail.component.html",
  styleUrl: "meeting-detail.component.scss",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [MeetingPageModelService, NotesModelService,NoteStoreService, SummaryModelService, SummaryService],
})
export class MeetingDetailComponent {
  private activeRoute = inject(ActivatedRoute);
  private meetingModelService = inject(MeetingModelService);
  private noteService = inject(NoteStoreService);
  private summaryService = inject(SummaryService);

  private meetingId$ = this.activeRoute.paramMap.pipe(
    map((paramsMap) => {
      const id = Number(paramsMap.get("id"));
      if (id == null || isNaN(id)) return null; //TODO: catch and renavigate  or show error
      return id;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public meeting$ = this.meetingId$.pipe(
    filter((id) => id != null),
    switchMap((id) => this.meetingModelService.getById(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );


  private summaryIsLoading$ = new BehaviorSubject<boolean>(true);
  private summary$ = this.meetingId$.pipe(
    switchMap((id) => this.summaryService.getLatestSummaryForMeeting(id)),
    tap(() => this.summaryIsLoading$.next(false)),
  );
  public summaryView$ = combineLatest([
    this.summaryIsLoading$,
    this.summary$,
  ]).pipe(
    map(([loading, summary]) => loading ? null : summary),
  )

  public notes$ = this.meetingId$.pipe(
    switchMap((id) => this.noteService.getAllForMeeting(id))
  );

  public noteFormGroup = new FormGroup({
    author: new FormControl<string | null>(null, {
      validators: [Validators.nullValidator, Validators.minLength(1)], //TODO: create and add validator for white spaces
    }),
    text: new FormControl<string | null>(null, {
      validators: [Validators.nullValidator, Validators.minLength(1)], //TODO: create and add validator for white spaces
    }),
  });

  public addNote() {
    const noteForm = this.noteFormGroup.value;
    this.meetingId$
      .pipe(
        take(1),
        switchMap((id) =>
          this.noteService.addToMeeting({
            meetingId: id,
            note: {
              author: noteForm.author,
              text: noteForm.text,
            },
          })
        )
      )
      .subscribe({
        error: (error) => console.error(error), //TODO: best to implement banner here or show it in the template
        complete: () => {}, //TODO: refresh notes
      });
  }

  public generateSummary() {
    this.meetingId$
      .pipe(
        take(1),
        switchMap((id) => this.summaryService.generateNewSummary(id))
      )
      .subscribe({
        complete: () => this.summaryIsLoading$.next(true),
      });
  }
}
