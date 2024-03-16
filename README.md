# Oblivion Mod File Case Fixer for Linux

## What is this?
This is a terminal application powered by [Deno](https://deno.com/) that fixes the issue with filename case on Linux when trying to mod the game The Elder Scrolls IV: Oblivion.

## Why is this useful?
Let me tell you a story. You're a lover of penguins, games, and most importantly, the Elder Scrolls. You fire up Oblivion on your tuxedo-box, but of course the lure of mods is ever-present. You start pulling down mod archives, extracting them, and plopping them into Oblivion's Data folder, but egad! What is this? One mod you added made the directory `Meshes/Characters/Argonian`, and there's this new mod that wants to put things in `Meshes/characters/argonian`. What kind of madness is this? This may fly on Windows, but it sure doesn't on Linux. Pretty soon you've got a broken Data folder full of files that the game isn't even looking at and your mods aren't working. At this point, you are sad.

But hop aboard the emotional rollercoaster, because you happened upon this little utilty that fixes _exactly the annoyance you just encountered_. It's like fate or something. Or maybe you spent a lot of levels getting your Luck to 100. Either way, I salute you.

Now you can pass that pesky mod and its files through this script and it'll make sure that any directories/files it's trying to put stuff in match the case that already exists in Oblivion's Data folder. After the script does its job, you can drag-n-drop without a care. That joy you're feeling is the product of an easy peasy lemon squeezy experience that's notably better than the difficult difficult lemon difficult experience you had before.

## How do I use this?

### With Deno
This script is powered by Deno, so if you have [Deno](https://deno.com/) installed you can simply `deno run main.ts`.

### Without Deno
Pull down the executable in the `dist` folder and run it in a terminal. The script will guide you through the process.

## Flags
The script supports a few flags, and two of them are required:

### oblivionDataFolder
The path to your Oblivion installation's Data folder. An example might be `--oblivionDataFolder=/home/user/Games/Oblivion/Data`. Don't use that, though. That's very unlikely to be where your Data folder actually is. But I'm sure you knew that. I'm sure you know where your Data folder is. Go get 'em, tiger.

### modDataFolder
The path to the data folder of the mod you'd like to analyze. Some mods just put everything at their root and don't actually include a folder named `Data`, so don't stress if you don't see one. In that case, just point this path at the root of the mod. An example might be `--modDataFolder="/home/user/Downloads/Oblivion Character Overhaul v203-44676-2-03/Data/"`.

### maxAnalysisWorkers
(Optional, defaults to 4) If the mod you're analyzing is chunkier than me after the Holidays, it can be a lot of work to figure out for every single one of those files where it wants to go in your Data folder. The analysis portion of the script is by far the most process-intensive. If your name is Ricky and/or you wanna go fast, you can specify how many workers you want to let the analysis process use. Typically, the more workers you have the faster it'll go, but your mileage will vary based on your machine's specs, and more workers means the script hogs more of your CPU while it's running.

## Full run command example
```
./oblivion-mod-file-case-fixer --oblivionDataFolder=/home/user/Steam/steamapps/common/Oblivion/Data --modDataFolder="/home/user/Downloads/Oblivion Character Overhaul v203-44676-2-03/Data/" --maxAnalysisWorkers=10
```

And don't forget that case matters on those paths. That's the whole reason you're here.

## Where's the output?
The output will be put in a new folder within the mod's folder. Once the script has performed the fix, it will output the path where you can find the fixed files. The shape of the fixed directory is the same as the mod's data folder, so once the fix is complete you can treat that folder as the mod's folder and drop its contents into Oblivion's Data folder.

## Dev things

#### How to compile the executable
```
deno compile --allow-read --allow-write --include analyze-paths.worker.ts --output ./dist/oblivion-mod-file-case-fixer main.ts
```

#### How to run the tests
```
deno test --allow-read
```
