import json
from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from ..models import Meeting, Summary


@pytest.mark.django_db
def test_meetings_list_pagination_and_ordering():
    """List should be paginated (page size 20) and ordered newest -> oldest."""
    now = timezone.now()

    # create 25 meetings with increasing started_at (newer has larger datetime)
    for i in range(25):
        Meeting.objects.create(title=f"m{i}", started_at=now + timedelta(days=i))

    client = APIClient()
    resp = client.get("/api/meetings/")
    assert resp.status_code == 200
    data = resp.json()

    # Default pagination from settings is page size 20
    assert "results" in data
    assert len(data["results"]) == 20

    # first result should be the newest (largest started_at)
    first_started = data["results"][0]["started_at"]
    last_started = data["results"][-1]["started_at"]
    assert first_started > last_started

    # second page contains remaining 5
    resp2 = client.get("/api/meetings/?page=2")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert len(data2["results"]) == 5


@pytest.mark.django_db
def test_meeting_retrieve_includes_latest_summary():
    m = Meeting.objects.create(title="with-summary", started_at=timezone.now())
    Summary.objects.create(meeting=m, content="sum up", status=Summary.READY)

    client = APIClient()
    resp = client.get(f"/api/meetings/{m.id}/")
    assert resp.status_code == 200
    body = resp.json()

    assert body["id"] == m.id
    assert body.get("latest_summary") is not None
    assert body["latest_summary"]["content"] == "sum up"


@pytest.mark.django_db
def test_meeting_create():
    client = APIClient()
    payload = {
        "title": "created",
        "started_at": timezone.now().isoformat(),
    }

    resp = client.post("/api/meetings/", data=json.dumps(payload), content_type="application/json")
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "created"
    assert body["note_count"] == 0
    # no summary yet
    assert body.get("latest_summary") is None
