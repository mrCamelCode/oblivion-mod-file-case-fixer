# 1.0.1
## Changes
- Tweaked some wording to reduce confusion and increase clarity of intended use.
- Tweaked path analysis to reduce confusion. Before, paths were marked as badly-cased and the proposed change appeared to be doing nothing. This happens because part of the path _does_ exist in Oblivion's Data folder, but the particular file the mod adds does not. Paths that fall into this situation are now marked as OK paths, which is less confusing.
- When opting-in to view the results of path analysis, if the number of paths exceeds 200, the script will now send the output to a file instead of blowing up your terminal window with an excess of output.

## Bugfixes
- Fixed bug where files that had an exact match in Oblivion's Data folder would be excluded from the output. Now _all_ files are included in the output and you can truly treat the OMFCF_FIXED folder as a sanitized version of the mod.