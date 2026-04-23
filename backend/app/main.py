import os
import uuid
import shutil
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.parser    import extract_text_from_pdf, chunk_pages
from app.embedder  import embed_chunks, delete_collection
from app.retriever import retrieve_relevant_chunks
from app.generator import generate_answer

load_dotenv()

app = FastAPI(
    title="Document Intelligence API",
    description="Upload any PDF → ask questions → get answers with page citations.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})

UPLOAD_DIR = Path("./uploads")
VECTOR_DIR = "./vectorstore"
UPLOAD_DIR.mkdir(exist_ok=True)
Path(VECTOR_DIR).mkdir(exist_ok=True)

documents: dict = {}


class AskRequest(BaseModel):
    doc_id: str
    question: str

class AskResponse(BaseModel):
    answer: str
    sources: list[str]
    source_chunks: list[dict]
    model: str
    chunks_used: int


@app.get("/")
def root():
    return {
        "status": "running",
        "endpoints": ["POST /upload", "POST /ask", "GET /documents", "DELETE /document/{doc_id}"]
    }


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    doc_id    = str(uuid.uuid4())[:8]
    save_path = UPLOAD_DIR / f"{doc_id}.pdf"

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    pages  = extract_text_from_pdf(str(save_path))
    if not pages:
        raise HTTPException(422, "Could not extract text from this PDF.")

    chunks = chunk_pages(pages)
    embed_chunks(chunks, doc_id=doc_id, persist_dir=VECTOR_DIR)

    documents[doc_id] = {
        "doc_id":   doc_id,
        "filename": file.filename,
        "pages_extracted": len(pages),
        "chunks_created":  len(chunks)
    }

    return documents[doc_id] | {"message": "Ready. Use doc_id to ask questions."}


@app.post("/ask", response_model=AskResponse)
def ask_question(req: AskRequest):
    if req.doc_id not in documents:
        raise HTTPException(404, f"Document '{req.doc_id}' not found.")
    if not req.question.strip():
        raise HTTPException(400, "Question cannot be empty.")

    chunks = retrieve_relevant_chunks(req.question, req.doc_id, top_k=5, persist_dir=VECTOR_DIR)
    if not chunks:
        raise HTTPException(500, "Could not retrieve relevant context.")

    return generate_answer(req.question, chunks)


@app.get("/documents")
def list_documents():
    return {"documents": list(documents.values())}


@app.delete("/document/{doc_id}")
def delete_document(doc_id: str):
    if doc_id not in documents:
        raise HTTPException(404, "Document not found.")
    delete_collection(doc_id, persist_dir=VECTOR_DIR)
    pdf = UPLOAD_DIR / f"{doc_id}.pdf"
    if pdf.exists():
        pdf.unlink()
    del documents[doc_id]
    return {"message": f"Document '{doc_id}' deleted."}
