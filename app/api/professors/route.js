import { Pinecone } from "@pinecone-database/pinecone";
import fetch from "node-fetch";
import { NextResponse } from "next/server";

const MODEL = "sentence-transformers/all-mpnet-base-v2";
const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;


const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index("rag").namespace("ns1");


// Credit: @preciousmbaekwe at Medium
async function fetchEmbeddingsWithRetry(text, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/pipeline/feature-extraction/${MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        if (response.status === 503) {
          console.warn(`Model is loading, retrying (${attempt}/${retries})...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.error("Error response body:", errorBody);
          throw new Error(`Failed to fetch embeddings: ${response.statusText}`);
        }
      } else {
        return await response.json();
      }
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
    }
  }
}

// POST function to handle incoming requests
export async function GET() {
  // Encode the text using the sentence-transformers model
  const queryEmbedding = await fetchEmbeddingsWithRetry('Dr. U');

  // Query Pinecone with the generated embedding
  const results = await index.query({
    topK: 5,
    includeMetadata: true,
    vector: queryEmbedding,
  });
  
  console.log(results.matches);
  const professors = results.matches.map(match => ({
    name: match.metadata.professor,
    school: match.metadata.school,
    department: match.metadata.department,
    rating: `${match.metadata.quality}/5`,
    review: match.metadata.review,
  }));

  return NextResponse.json(professors);
}