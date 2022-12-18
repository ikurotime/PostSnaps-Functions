import { ImageResponse } from "https://deno.land/x/og_edge@0.0.4/mod.ts";
import React from "https://esm.sh/react@18.2.0&deno-std=0.132.0?target=deno&no-check";

export async function handler(req: Request) {
  const UNILIST = ["", "K", "M", "G"];

  const urlParams = new URL(req.url);
  const statusID = urlParams.searchParams.get("tweetId") || "";
  const formatnumber = (number: number) => {
    const sign = Math.sign(number);
    let unit = 0;

    while (Math.abs(number) > 1000) {
      unit = unit + 1;
      number = Math.floor(Math.abs(number) / 100) / 10;
    }
    return sign * Math.abs(number) + UNILIST[unit];
  };

  const tweetContent = await fetch(
    `https://api.twitter.com/2/tweets?ids=${statusID}&tweet.fields=created_at%2Cpublic_metrics%2Cattachments&expansions=attachments.media_keys%2Cauthor_id&media.fields=preview_image_url%2Curl&user.fields=created_at%2Cprofile_image_url`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${Deno.env.get("TWITTER_BEARER_TOKEN")}`,
      },
    },
  ).then((res) => res.json());
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1f2937",
        gap: "10px",
      }}
    >
      <img src="https://i.postimg.cc/zDSGx18D/Screenshot-2022-12-13-at-15-21-28.png" />
      {tweetContent.includes && (
        <div
          style={{
            display: "flex",
            width: "90%",
            padding: "10px",
            flexDirection: "row",
            justifyContent: "space-around",
            backgroundColor: "#fff",
            alignItems: "center",
            gap: "10px",
            borderRadius: "10px",
          }}
        >
          <img
            style={{
              margin: "10px",
              width: "300px",
              height: "300px",
              borderRadius: "10%",
            }}
            src={tweetContent.includes.users[0].profile_image_url.replace(
              "_normal",
              "",
            )}
          />

          <div
            style={{
              display: "flex",
              width: "600px",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <strong
              style={{
                fontSize: "50px",
                fontWeight: "bold",
                fontFamily: "sans-serif",
              }}
            >
              {tweetContent.includes.users[0].name}
            </strong>
            <span
              style={{
                fontSize: "50px",
                fontWeight: "bold",
                fontFamily: "sans-serif",
                color: "gray",
                marginBottom: "10px",
              }}
            >
              @{tweetContent.includes.users[0].username}
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                height: "100px",
                width: "100%",
                justifyContent: "space-around",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "30px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span>
                  {formatnumber(
                    tweetContent.data[0].public_metrics.like_count,
                  )}
                </span>
                <span>&nbsp; Likes &nbsp;</span>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span>
                  {formatnumber(
                    tweetContent.data[0].public_metrics.retweet_count,
                  )}
                </span>
                <span>&nbsp; Retweets &nbsp;</span>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span>
                  {formatnumber(
                    tweetContent.data[0].public_metrics.reply_count,
                  )}
                </span>
                <span>&nbsp; Replies &nbsp;</span>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span>
                  {formatnumber(
                    tweetContent.data[0].public_metrics.quote_count,
                  )}
                </span>
                <span>&nbsp; Quotes &nbsp;</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    {
      width: 1200,
      height: 630,
      // Supported options: 'twemoji', 'blobmoji', 'noto', 'openmoji', 'fluent', 'fluentFlat'
      // Default to 'twemoji'
      emoji: "twemoji",
    },
  );
}
