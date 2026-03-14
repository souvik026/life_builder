from fastapi import APIRouter, Depends, HTTPException
from models.journal import JournalCreate, NoteCreate, JournalEntry, JournalListItem
from dependencies import get_journal_repo
from repositories.journal_repo import JournalRepository

router = APIRouter(tags=["journals"])


@router.get("/journals", response_model=list[JournalListItem])
async def list_journals(
    repo: JournalRepository = Depends(get_journal_repo),
):
    return await repo.list_entries()


@router.get("/journals/{entry_date}", response_model=JournalEntry)
async def get_journal(
    entry_date: str,
    repo: JournalRepository = Depends(get_journal_repo),
):
    entry = await repo.get_by_date(entry_date)
    if not entry:
        raise HTTPException(status_code=404, detail="No journal entry for this date.")
    return entry


@router.get("/journals/entry/{entry_id}", response_model=JournalEntry)
async def get_journal_by_id(
    entry_id: str,
    repo: JournalRepository = Depends(get_journal_repo),
):
    entry = await repo.get_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")
    return entry


@router.post("/journals", response_model=JournalEntry)
async def create_journal(
    data: JournalCreate,
    repo: JournalRepository = Depends(get_journal_repo),
):
    return await repo.upsert(data.went_well, data.went_bad, data.reflection, data.mood)


@router.post("/journals/note", response_model=JournalEntry)
async def create_note(
    data: NoteCreate,
    repo: JournalRepository = Depends(get_journal_repo),
):
    return await repo.create_note(data.title, data.content)
