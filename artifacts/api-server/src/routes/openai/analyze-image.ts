import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { withCurrentUser } from "../../lib/session";

const router: IRouter = Router();

router.post("/ai/analyze-image", withCurrentUser, async (req, res) => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "low" },
            },
            {
              type: "text",
              text: `You are helping a buyer describe an item they want to find on a marketplace.
Look at this image and write a concise, plain-language description of the item.
Include: item type, style/era, material if visible, color, notable features.
Keep it under 20 words. Do not use markdown. Example: "Vintage oak dresser, mid-century style, 3 drawers, wooden knobs, light natural finish"`,
            },
          ],
        },
      ],
    });

    const description = response.choices[0]?.message?.content?.trim() ?? "";
    res.json({ description });
  } catch (err: any) {
    req.log.error({ err }, "Image analysis failed");
    res.status(500).json({ error: "Image analysis failed" });
  }
});

export default router;
