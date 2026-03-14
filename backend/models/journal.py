from pydantic import BaseModel


class JournalCreate(BaseModel):
    went_well: str
    went_bad: str
    reflection: str = ""
    mood: str | None = None


class NoteCreate(BaseModel):
    title: str
    content: str


class JournalEntry(BaseModel):
    """Matches frontend JournalEntry interface."""
    id: str
    entry_date: str
    entry_type: str  # "journal" or "note"
    title: str
    went_well: str
    went_bad: str
    reflection: str
    ai_insight: str
    mood: str
    created_at: str


class JournalListItem(BaseModel):
    """Lightweight entry for sidebar listing."""
    id: str
    entry_date: str
    entry_type: str
    title: str
    mood: str
