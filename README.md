# DIMWishlistBuilder

DIM Wishlist Builder is a Chrome extension that works on D2 Gunsmith. The extension adds a sidebar that allows you to add the currently selected weapon and perks to the list, along with the type of roll you are adding (PvE, PvP, GM). After you have added all the rolls you wish (heh), you can either copy the list into your clipboard and paste that into your own text file, or you can use the "Save to File" button to automatically save and download the list.

When adding a new roll, the extension knows if you've previously added this weapon/type of roll and will had the new roll to the appropriate place.

Example of newly generated roll:

```
// Fractethyst (PvP)
//notes:PvP-{add notes here}
dimwishlist:item=3184681056&perks=1047830412,3142289711,706527188,47981717
```

## Features

- **Keyboard shortcut** - Use the `INSERT` key to automatically add the currently selected roll into the wishlist. (There will be a feature to set a custom keyboard shortcut in the future.)
- **Persistence** - If you accidentally reload the page, all your previously saved rolls will be saved in local storage of the browser.

- **Notes** - You also have the ability to type notes for each weapon you add. Whenever you are done typing, the extension will wait a few seconds before saving that new note.

- **Different Types of Rolls** - Choose between PvP, PvE, and GM (Grandmaster nightfalls) for different types of rolls for each weapon.

## Upcoming Features

- Ability to change the keyboard shortcut for adding a roll
- Help modal or popup
- Undo the previous roll
- Highlight the previously inserted roll
