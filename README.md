# DocIntel - Document Intelligence API

A production RAG (Retrieval-Augmented Generation) pipeline that lets you upload any PDF and ask natural language questions - getting precise answers with exact page citations.

**[Live Demo](https://doc-intel-eta.vercel.app) · [Backend API](https://docintel-api-8r20.onrender.com/docs)**

---

## What It Does

Upload any PDF - a research paper, financial report, legal contract, earnings call transcript and ask questions in plain English. DocIntel retrieves the most relevant sections from the document and uses a large language model to generate a precise answer with page citations.

- **Multi-document support** - upload multiple PDFs and switch between them
- **Auto-summary** - generates a 2-3 sentence summary the moment a document is uploaded
- **Page citations** - every answer includes which pages were used
- **Source chunk expansion** - click any citation to see the exact text that was retrieved
- **Confidence scores** - each source chunk shows a relevance score (0–100%)
- **Copy to clipboard** - one-click copy on every answer
- **Chat history** - full conversation history per document

---

## How It Works

```
User uploads PDF
        ↓
PyMuPDF extracts text page by page
        ↓
Text split into overlapping 500-word chunks
(each chunk tagged with its page number)
        ↓
ONNX MiniLM-L6-v2 embeds each chunk → 384-dim vectors
        ↓
Vectors stored in ChromaDB (cosine similarity index)
        ↓
User asks a question
        ↓
Question embedded → top 5 most similar chunks retrieved
        ↓
Question + chunks sent to Llama 3.3 70B via Groq API
        ↓
Answer returned with page citations
```

---

## Architecture

```
Frontend (React + Vite)        Backend (FastAPI)
─────────────────────          ──────────────────────────
Upload PDF        ──────────→  POST /upload
                               ├── PyMuPDF extracts text
                               ├── Chunks with page tags
                               ├── ONNX MiniLM embeds
                               └── ChromaDB stores vectors

Ask question      ──────────→  POST /ask
                               ├── Embed question (ONNX)
                               ├── ChromaDB similarity search
                               ├── Top 5 chunks retrieved
                               └── Groq (Llama 3.3 70B) generates answer

Response          ←──────────  { answer, sources, source_chunks, confidence }
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| PDF parsing | PyMuPDF | Best-in-class, handles messy PDFs |
| Chunking | Custom sliding window | 500 words, 50-word overlap |
| Embeddings | ONNX MiniLM-L6-v2 | Fast, no PyTorch needed, 384-dim |
| Vector store | ChromaDB | Local persistent vector DB |
| LLM | Llama 3.3 70B via Groq | Free API, fast inference |
| API | FastAPI | Async, auto-docs |
| Frontend | React + Vite | Component-based UI |
| Deploy | Render + Vercel | Free tier, auto-deploy |

---

## Project Structure

```
docintel/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI endpoints
│   │   ├── parser.py      # PDF extraction + chunking
│   │   ├── embedder.py    # ONNX MiniLM + ChromaDB
│   │   ├── retriever.py   # Semantic search
│   │   └── generator.py   # Groq LLM generation
│   ├── uploads/           # Uploaded PDFs
│   ├── vectorstore/       # ChromaDB persistence
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        ├── hooks/useApi.js
        └── components/
            ├── Sidebar.jsx
            ├── ChatArea.jsx
            ├── InputBar.jsx
            ├── UploadModal.jsx
            ├── SummaryBanner.jsx
            └── Topbar.jsx
```

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Free Groq API key from [console.groq.com](https://console.groq.com)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Groq API key to .env
echo "GROQ_API_KEY=your_key_here" > .env

# Start the API
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload a PDF → returns `doc_id` |
| POST | `/ask` | Ask a question about a document |
| GET | `/documents` | List all uploaded documents |
| DELETE | `/document/{doc_id}` | Delete a document |

### Example

```bash
# Upload a PDF
curl -X POST http://localhost:8000/upload \
  -F "file=@report.pdf"
# Returns: { "doc_id": "a1b2c3d4", ... }

# Ask a question
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"doc_id": "a1b2c3d4", "question": "What are the main risks?"}'
```

### Response format

```json
{
  "answer": "The main risks identified are... (Page 3, Page 7)",
  "sources": ["Page 3", "Page 7"],
  "source_chunks": [
    { "page": 3, "text": "...exact text from page 3...", "score": 0.89 },
    { "page": 7, "text": "...exact text from page 7...", "score": 0.76 }
  ],
  "model": "llama-3.3-70b-versatile",
  "chunks_used": 5
}
```

---

## Key Design Decisions

**Overlapping chunks** - each chunk overlaps 50 words with the previous one so context isn't lost at chunk boundaries. A sentence that spans two chunks will be captured in at least one.

**ONNX embeddings** - using ChromaDB's built-in ONNX runtime for MiniLM means no PyTorch dependency, smaller footprint, and faster cold starts on free-tier hosting.

**Page-tagged chunks** - every chunk stores its source page number at embedding time, so citations are exact rather than approximate.

**Low temperature generation** - Groq requests use `temperature=0.1` to keep answers factual and grounded in the retrieved context rather than hallucinating.

---

## Deployment

- Backend deployed on **Render** (free tier)
- Frontend deployed on **Vercel** (free tier)
- Set `VITE_API_URL` in Vercel environment variables to your Render URL

---

## References

- Lewis et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. NeurIPS.
- Reimers & Gurevych (2019). *Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks*. EMNLP.
