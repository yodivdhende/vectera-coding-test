import logging
from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response


from .models import Meeting, Note, Summary
from .serializers import MeetingSerializer, NoteSerializer, SummarySerializer
from meetings import serializers

log = logging.getLogger(__name__)

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)

class MeetingViewSet(viewsets.ModelViewSet):
    """
    TODO: Implement:
    - list with pagination (newest first)
    - retrieve (include latest summary if any)
    - create
    """
    
    queryset = Meeting.objects.all().annotate(note_count=Count("notes"))
    serializer_class = MeetingSerializer


    @action(detail=True, methods=["get", "post"], url_path="notes", )
    def notes(self, request, pk=None):
        meeting = self.get_object()

        if request.method == "GET":
            notes = meeting.notes.all().order_by("created_at")
            page = self.paginate_queryset(notes)
            if page is not None:
                serializer = NoteSerializer(notes, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = NoteSerializer(notes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # POST -> create a new Note attached to this meeting
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(meeting=meeting)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="summarize")
    def summarize(self, request, pk=None):
        """
        Create or update a Summary with status 'pending', then run summarization in a background thread.
        """
        import threading
        meeting = self.get_object()
        note_qs = meeting.notes.all()
        note_count = note_qs.count()
        notes_text = "\n".join([n.text for n in note_qs])
        summary, created = Summary.objects.get_or_create(meeting=meeting, defaults={"status": Summary.PENDING})
        if not created:
            summary.status = Summary.PENDING
            summary.save(update_fields=["status", "updated_at"])
        log.info("summarize_requested", extra={"meeting_id": pk, "note_count": note_count})

        def run_summarization(summary_id, notes_text, meeting_id):
            from meetings.services.ai import summarize as ai_summarize
            from meetings.models import Summary
            import logging
            log = logging.getLogger(__name__)
            try:
                summary = Summary.objects.get(id=summary_id)
                summary_text = ai_summarize(notes_text)
                summary.content = summary_text
                summary.status = Summary.READY
                summary.save(update_fields=["content", "status", "updated_at"])
                log.info("summarize_completed", extra={"meeting_id": meeting_id, "summary_id": summary_id})
            except Exception as e:
                try:
                    summary = Summary.objects.get(id=summary_id)
                    summary.status = Summary.FAILED
                    summary.save(update_fields=["status", "updated_at"])
                except Exception:
                    pass
                log.error("summarize_failed", extra={"meeting_id": meeting_id, "error": str(e)})

        thread = threading.Thread(target=run_summarization, args=(summary.id, notes_text, pk))
        thread.daemon = True
        thread.start()
        return Response({"detail": "Summary job started.", "summary_id": summary.id}, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=["get"], url_path="summary")
    def get_summary(self, request, pk=None):
        """
        Return the summary for the meeting or 404 if none.
        """
        meeting = self.get_object()
        try:
            summary = meeting.summary
        except Summary.DoesNotExist:
            return Response({"detail": "Summary not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = SummarySerializer(summary)
        return Response(serializer.data, status=status.HTTP_200_OK)
