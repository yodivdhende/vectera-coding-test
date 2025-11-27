import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { filter, map, shareReplay, switchMap, take } from "rxjs";
import { MeetingModelService } from "src/app/data/meeting.model.service";
import { NotesModelService } from "src/app/data/notes.model.service";

@Component({
  selector: "app-meeting-overview",
  templateUrl: "meeting-detail.component.html",
  styleUrl: "meeting-detail.component.scss",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [MeetingModelService, NotesModelService],
})
export class MeetingDetailComponent {
  private activeRoute = inject(ActivatedRoute);
  private meetingModelService = inject(MeetingModelService);
  private noteModelService = inject(NotesModelService);

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

  public notes$ = this.meetingId$.pipe(
    switchMap((id) => this.noteModelService.getAll(id))
  );

  public noteFormGroup = new FormGroup({
    author: new FormControl<string | null>(null, {
      validators: [Validators.nullValidator, Validators.minLength(1)],//TODO: create and add validator for white spaces
    }), 
    text: new FormControl<string | null>(null, {
      validators: [Validators.nullValidator, Validators.minLength(1)],//TODO: create and add validator for white spaces
    }), 
  });

  public addNote = () => {
    console.log('adding note');
    const noteForm = this.noteFormGroup.value;
    this.meetingId$.pipe(
        take(1),
        switchMap((id)=> this.noteModelService.add({
            meetingId: id,
            note: { 
                author: noteForm.author,
                text: noteForm.text
            }
        }))
    ).subscribe({
        error: (error) => console.error(error), //TODO: best to implement banner here or show it in the template
        complete: () => {}, //TODO: refresh notes
    })
  };
}
