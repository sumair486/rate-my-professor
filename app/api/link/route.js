import { Pinecone } from "@pinecone-database/pinecone";
import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const link = searchParams.get("url"); // Extract the URL query parameter

  if (!link) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    const response = await axios.get(link); // Fetch the HTML from the link
    const html = response.data;
    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Parse the professor's name and department
    const professorName = $('div[class*="NameTitle__Name"]').text().trim();
    const department = $('div[class*="NameTitle__Title"] b').text().trim();
    const school = $('div[class*="NameTitle__Title"] a').last().text().trim();
    const reviews = [];

    // Iterate over each review
    $(".Rating__RatingBody-sc-1rhvpxz-0").each((index, element) => {
      const reviewElement = $(element);

      const className = reviewElement
        .find(".RatingHeader__StyledClass-sc-1dlkqw1-3")
        .first()
        .text()
        .trim();
      const quality = parseFloat(
        reviewElement
          .find(".CardNumRating__CardNumRatingNumber-sc-17t4b9u-2")
          .first()
          .text()
          .trim()
      );
      const difficulty = parseFloat(
        reviewElement
          .find(".CardNumRating__CardNumRatingNumber-sc-17t4b9u-2")
          .last()
          .text()
          .trim()
      );
      const reviewText = reviewElement
        .find(".Comments__StyledComments-dzzyvm-0")
        .text()
        .trim();
      const timestamp = reviewElement
        .find(".TimeStamp__StyledTimeStamp-sc-9q2r30-0")
        .first()
        .text()
        .trim();

      reviews.push({
        professor: professorName,
        school: school,
        department: department,
        class: className,
        quality: quality,
        difficulty: difficulty,
        timestamp: timestamp,
        review: reviewText,
      });
    });

    // Return the parsed data as JSON
    return NextResponse.json({ reviews });
  } catch (error) {
    // Return the axios error status code if it exists, otherwise return 500
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response
      ? error.response.data
      : "Failed to fetch the URL";

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export async function POST(req) {
  // Initialize Pinecone and other configurations inside the POST function
  const MODEL = "sentence-transformers/all-mpnet-base-v2";
  const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index("rag").namespace("ns1");

  const api_url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${MODEL}`;
  const headers = { Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}` };

  try {
    const body = await req.json(); // Parse the incoming JSON request
    const processedData = [];

    // Iterate over each review in the request body
    for (const review of body.reviews) {
      // Request embedding for the review content from Hugging Face API
      const response = await axios.post(
        api_url,
        { inputs: review.review, options: { wait_for_model: true } },
        { headers }
      );
      const embedding = response.data;

      // Generate a unique ID using UUID for each review to avoid overwriting in Pinecone
      const unique_id = uuidv4();

      // Append the processed data with the new structure
      processedData.push({
        id: unique_id, // Unique ID for each review
        values: embedding, // Embedding returned by Hugging Face
        metadata: {
          professor: review.professor,
          school: review.school,
          department: review.department,
          class: review.class,
          quality: review.quality,
          difficulty: review.difficulty,
          timestamp: review.timestamp,
          review: review.review,
        },
      });
    }

    // Insert the embeddings into Pinecone
    const upsertResponse = await index.upsert(processedData);

    // Return the upsert response as JSON
    return NextResponse.json({ upsertResponse });
  } catch (error) {
    console.error("Error processing reviews:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
