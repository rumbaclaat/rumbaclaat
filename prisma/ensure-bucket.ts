/** Ensures a public Supabase Storage bucket "media" exists. */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) throw error;
  if (!buckets?.find((b) => b.name === "media")) {
    const { error: createErr } = await admin.storage.createBucket("media", {
      public: true,
      fileSizeLimit: "10MB",
    });
    if (createErr) throw createErr;
    console.log("Created public 'media' bucket");
  } else {
    console.log("'media' bucket already exists");
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
