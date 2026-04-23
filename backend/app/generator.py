import os
from groq import Groq

def generate_answer(question: str, chunks: list[dict]) -> dict:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    context = "\n\n".join(f"[Page {c['page_num']}]: {c['text']}" for c in chunks)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a precise document analysis assistant. Answer using ONLY the provided context. Always cite page numbers. If the answer isn't in the context, say so clearly."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
        ],
        temperature=0.1,
        max_tokens=1024
    )

    # Build rich sources with chunk text for frontend highlighting
    seen = {}
    for c in chunks:
        p = c["page_num"]
        if p not in seen:
            seen[p] = {"page": p, "text": c["text"], "score": c["score"]}

    return {
        "answer": response.choices[0].message.content,
        "sources": [f"Page {p}" for p in sorted(seen.keys())],
        "source_chunks": list(seen.values()),
        "model": "llama-3.3-70b-versatile",
        "chunks_used": len(chunks)
    }
