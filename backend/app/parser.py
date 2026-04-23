import fitz  # PyMuPDF
import re


def extract_text_from_pdf(pdf_path: str) -> list[dict]:
    """Extract text page by page. Returns [{ page_num, text }]"""
    doc = fitz.open(pdf_path)
    pages = []

    for i in range(len(doc)):
        text = doc[i].get_text()
        text = _clean(text)
        if text.strip():
            pages.append({"page_num": i + 1, "text": text})

    doc.close()
    return pages


def _clean(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    return text.strip()


def chunk_pages(pages: list[dict], chunk_size: int = 500, overlap: int = 50) -> list[dict]:
    """
    Split pages into overlapping word chunks.
    Each chunk keeps its page_num for citations.
    Returns [{ chunk_id, page_num, text }]
    """
    chunks = []
    chunk_id = 0

    for page in pages:
        words = page["text"].split()
        start = 0

        while start < len(words):
            chunk_text = " ".join(words[start: start + chunk_size])
            chunks.append({
                "chunk_id": f"chunk_{chunk_id}",
                "page_num": page["page_num"],
                "text": chunk_text
            })
            chunk_id += 1
            start += chunk_size - overlap

    return chunks
