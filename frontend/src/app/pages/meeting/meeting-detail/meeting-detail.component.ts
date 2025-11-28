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
import { SummaryModelService } from "src/app/pages/meeting/data/summary.model.service";
import { SummaryService } from "src/app/services/summary.service";
import { MeetingModelService } from "../data/meeting.model.service";
import { NotePageModelService } from "../data/note-page.model.service";

@Component({
  selector: "app-meeting-overview",
  templateUrl: "meeting-detail.component.html",
  styleUrl: "meeting-detail.component.scss",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [MeetingModelService, NotePageModelService, SummaryModelService, SummaryService],
})
export class MeetingDetailComponent {
  private activeRoute = inject(ActivatedRoute);
  private meetingModelService = inject(MeetingModelService);
  private noteService = inject(NotePageModelService);
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
  public summaryView$ = this.meetingId$.pipe(
    switchMap((id) => this.summaryService.getContent(id)),
    tap(() => this.summaryIsLoading$.next(false)),
  )

  public notePage$ = this.meetingId$.pipe(
    switchMap((id) => this.noteService.getPage(id))
  );

  public getPreviousNotes() {
    this.noteService.goPreviousPage();
  }

  public getNextNotes() {
    this.noteService.goNextPage();
  }

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
