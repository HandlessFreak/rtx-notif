# RTX Lookout
I wanted to get a 3070, but as we all know that's a bit challenging right now. I found the big notification apps like HotStock to be a bit slow, and their notifications would sometimes repeat several times, even after I asked to no longer be notified of a certain product. So I wrote a Discord bot that would DM me when they restocked. After getting my own card, I decided to expand on the idea so others would be able to use it as well.

## Quick Start
Please note, this bot **only works with Best Buy's website**. I may end up adding support for other vendors, but for now it's only Best Buy.

Here is the [link](https://discord.com/api/oauth2/authorize?client_id=794431055721267212&permissions=84992&scope=bot) to invite the bot your Discord server. Here is a [link](https://discord.gg/gUSxkDSA4S) to a Discord server I already have with the bot in it.

Once you have access to the bot in a server, use `!RTXHelp` to see a list of commands. Here is a quick overview.

- `!addPage [URL]` -> The bot will check the stock status of the provided `[URL]` every 15 seconds. If the item is in stock, you will be DM'd.
- `!myPages` -> Displays a list of all pages the bot is currently watching for you. Each URL is assigned a number. To stop being notified of this product, see `!removePage`.
- `!removePage [x]` -> Removes you from the list of people being notified about the selected page. The number `[x]` corresponds to a URL returned by `!myPages`.

When an item restocks, everyone on the list watching said item will be DM'd. After being DM'd, the bot will stop notifying users for 6 hours. This is to prevent you from being needlessly spammed with notifications.

It's a fairly simple system. If you have any questions, feel free to join my [Discord server](https://discord.gg/gUSxkDSA4S) and @ me there. Good luck, and happy RTX hunting!

## Support Me
I wrote this bot in my spare time while I should've been studying for finals. If you end up using this bot to snag yourself an RTX card, consider buying me a coffee or helping me pay for college! :)

Venmo: @pb4000