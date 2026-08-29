export async function onRequestGet() {
  return Response.json({
    backend_ready: true,
    tools: {
      remove_background: false,
      generative_fill: false,
      generative_replace: false,
      enhance: false,
      upscale: false,
      restore_photo: false,
    },
  });
}
