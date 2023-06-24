import { MessageFlags } from "@discordjs/core";

import { generateSliceImages } from "./generateSliceImages.js";
import { generateMap } from "./generateMap.js";

export async function generateFinalMap({ data: interaction, api }, store) {
  await api.interactions.reply(interaction.id, interaction.token, {
    content: "Generating Final Map...",
    flags: MessageFlags.Ephemeral,
  });

  const { unslicedCanvases } = await generateSliceImages(store.mapSlices);

  const playerNamesResults = await Promise.allSettled(
    store.players.map((playerId) => api.users.get(playerId))
  );
  const playerNames = playerNamesResults.map((result) => result.value.username);

  const generatedMap = await generateMap(store, unslicedCanvases, playerNames);

  const finalMapText = `__**Final Map**__`;

  const buffer = await generatedMap.encode("png");

  await api.channels.createMessage(interaction.channel.id, {
    content: finalMapText,
    files: [{ data: buffer, name: "finalMap.png" }],
  });

  await collection.deleteOne({ _id: store._id });

  return;
}
