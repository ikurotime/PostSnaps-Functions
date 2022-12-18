// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { decode } from "https://esm.sh/base64-arraybuffer@1.0.2";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
serve(async (req) => {
  console.log("Saving image to storage!");
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const body = await req.json();
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") as string,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string,
  );
  //check if user has already liked the post, if not, insert into liked_posts table otherwise delete from liked_posts table
  const { data: likedData, error: likedError } = await supabaseClient
    .from("liked_posts")
    .select("*")
    .eq("user_id", body.user_id)
    .eq("post_id", body.tweet_id);
  if (likedError) {
    return new Response(JSON.stringify({ message: likedError.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
  if (likedData.length > 0) {
    const { data: deleteData, error: deleteError } = await supabaseClient
      .from("liked_posts")
      .delete()
      .eq("user_id", body.user_id)
      .eq("post_id", body.tweet_id);
    if (deleteError) {
      return new Response(JSON.stringify({ message: deleteError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    return new Response(JSON.stringify({ deleteData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
  //convert image from base64 to file png
  const image = body.image.replace(/^data:image\/\w+;base64,/, "");
  //upload image to storage
  await supabaseClient
    .storage
    .from("images")
    .upload(`images/${body.tweet_id}.png`, decode(image), {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: false,
    });

  // get url from path
  const { data: urlData } = supabaseClient
    .storage
    .from("images")
    .getPublicUrl(`images/${body.tweet_id}.png`);

  //insert into posts table
  await supabaseClient.from("posts").insert([{
    post_id: body.tweet_id,
    image: urlData.publicUrl,
    link: body.link,
  }]);
  const { data, error } = await supabaseClient.from("liked_posts").insert([{
    user_id: body.user_id,
    post_id: body.tweet_id,
    link: body.link,
  }]);

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});

// To invoke:
/*  curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
   --header 'Content-Type: application/json' \
   --data '{"name":"Functions"}'
 */
