**1.2.0 - June 17, 2022**
- Rollback to use the `Copy to Wishlist` button on D2Gunsmith
- Updated importing method when bringing in an existing list

**1.1.5 - March 11, 2022**
- Fix more mapping errors.
- Add multiple rolls whenever a perk has an enhanced version. This will remain until D2Gunsmith can explicitly select between the two.

**1.1.4 - March 9, 2022**
- Fix various weapon mapping errors by only getting weapons from manifest. Was previously mapping dummy items incorrectly.

**1.1.3 - February 26, 2022**
- Fixed import errors by trimming input when parsing the textarea

**1.1.2 - February 24, 2022**
- Fixed choosing the enhanced perk id over the regular perk id. There isn't a good way to distinguish between the two just yet. We'll have to see how D2Gunsmith is going to display them.

**1.1.1 - February 23, 2022**
- Fixed initial shortcut being "Insert" rather than "insert". Casing matters.

**1.1.0 - February 23, 2022**
- Added ability to customize shortcut
- Fixed compatibility with D2Gunsmith

**1.0.5 - October 25, 2021**
- Adding a new item to the wishlist will highlight the new roll in the textarea

**1.0.0 - October 22, 2021**
- Selecting perks and pressing `Add to Wishlist` button will add the currently selected roll to the wishlist.
- Clicking `Copy to Clipboard` will copy the current wishlist to your clipboard, which you can then copy to another program.
- Clicking `Save to File` will initiate saving the current wishlist to a file.
- Customize the `notes` section by selecting from the radio buttons PvE, PvP, GM.
