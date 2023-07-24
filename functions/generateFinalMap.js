import { MessageFlags } from "@discordjs/core";

import { generateMap } from "./generateMap.js";
import { dbClient } from "../db.js";

export async function generateFinalMap({ data: interaction, api }, store) {
  await api.interactions.reply(interaction.id, interaction.token, {
    content: "Generating Final Map...",
    flags: MessageFlags.Ephemeral,
  });

  const playerNamesResults = await Promise.allSettled(
    store.players.map((playerId) => api.users.get(playerId))
  );

  const playerNamesMap = playerNamesResults.reduce((acc, result, index) => {
    acc[store.players[index]] = result.value.username;
    return acc;
  }, {});

  const generatedMap = await generateMap(store, playerNamesMap);

  const finalMapText = `__**Final Map**__`;

  const buffer = await generatedMap.encode("png");

  await api.channels.createMessage(interaction.channel.id, {
    content: finalMapText,
    files: [{ data: buffer, name: "finalMap.png" }],
  });

  // const collection = dbClient.db("milty-draft").collection("draft");
  // await collection.deleteOne({ _id: store._id });

  return;
}
