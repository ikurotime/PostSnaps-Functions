// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

console.log("Hello from Functions!");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Getting tweet data!");
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  const { statusID } = await req.json();
  try {
    const response = await fetch(
      `https://api.twitter.com/2/tweets?ids=${statusID}&tweet.fields=created_at%2Cpublic_metrics%2Cattachments&expansions=attachments.media_keys%2Cauthor_id&media.fields=preview_image_url%2Curl&user.fields=created_at%2Cprofile_image_url`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Deno.env.get("TWITTER_BEARER_TOKEN")}`,
        },
      },
    );

    if (response.ok) {
      const result = await response.json();
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ error: "Something went wrong" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
