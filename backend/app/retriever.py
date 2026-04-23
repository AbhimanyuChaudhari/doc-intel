from app.embedder import get_or_create_collection


def retrieve_relevant_chunks(
    question: str,
    doc_id: str,
    top_k: int = 5,
    persist_dir: str = "./vectorstore"
) -> list[dict]:
    """
    Embed the question, find top_k most similar chunks.
    Returns [{ text, page_num, score }]
    """
    _, collection = get_or_create_collection(doc_id, persist_dir)

    results = collection.query(
        query_texts=[question],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    chunks = []
    for i in range(len(results["documents"][0])):
        chunks.append({
            "text":     results["documents"][0][i],
            "page_num": results["metadatas"][0][i]["page_num"],
            "score":    round(1 - results["distances"][0][i], 4)
        })

    return sorted(chunks, key=lambda x: x["score"], reverse=True)
