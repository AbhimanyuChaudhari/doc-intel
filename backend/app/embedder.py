import chromadb
from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2

# ONNX MiniLM — fast, no PyTorch needed
DEFAULT_EF = ONNXMiniLM_L6_V2()


def get_or_create_collection(doc_id: str, persist_dir: str = "./vectorstore"):
    client = chromadb.PersistentClient(path=persist_dir)
    collection = client.get_or_create_collection(
        name=doc_id,
        embedding_function=DEFAULT_EF,
        metadata={"hnsw:space": "cosine"}
    )
    return client, collection


def embed_chunks(chunks: list[dict], doc_id: str, persist_dir: str = "./vectorstore"):
    """Embed all chunks and store in ChromaDB."""
    client, collection = get_or_create_collection(doc_id, persist_dir)

    ids       = [c["chunk_id"] for c in chunks]
    documents = [c["text"]     for c in chunks]
    metadatas = [{"page_num": c["page_num"]} for c in chunks]

    # Upsert in batches of 100
    for i in range(0, len(chunks), 100):
        collection.upsert(
            ids=ids[i:i+100],
            documents=documents[i:i+100],
            metadatas=metadatas[i:i+100]
        )

    print(f"✓ Embedded {len(chunks)} chunks → collection '{doc_id}'")
    return collection


def delete_collection(doc_id: str, persist_dir: str = "./vectorstore"):
    client = chromadb.PersistentClient(path=persist_dir)
    client.delete_collection(name=doc_id)
