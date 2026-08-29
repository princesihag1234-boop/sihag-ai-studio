export async function onRequestGet() {
  return Response.json({
    status: "ok",
    service: "sihag-ai-studio-ai",
    version: "0.1.0",
    utc_time: new Date().toISOString(),
  });
}
