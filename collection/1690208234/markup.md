## Writing a save editor for a unity game.
Reverse engineering tends to be a very tedious process that can sometimes take years, luckily C# gives us a bunch of data to work with.

The game: [Burriedbornes, Dungeon RPG](https://store.steampowered.com/app/2153310/Buriedbornes__Dungeon_RPG/)

## Step 1, find save file.

The first thing we need to is actually find the location of the save file, this might sound simple but can actually be quite difficult.
Devlopers tend to choose predictable directories to save data, so lets think. <br> Off the top of my head I can think of 3 spots I would save data for a game.

1. Local file, just put the save in the place the game is located/installed, /game/saves or similar.
2. The user directory, %AppData% on Windows and ~/.local/share/ on Linux.
3. On Windows, the registry.

So, let's use the process of elimination. For context, I am running this game with wine on Linux.

#### Before running
```
$ ls
baselib.dll	   Buriedbornes.exe  UnityCrashHandler64.exe
Buriedbornes_Data  GameAssembly.dll  UnityPlayer.dll
```

#### After running and creating a profile
```
$ ls
baselib.dll	   Buriedbornes.exe  UnityCrashHandler64.exe
Buriedbornes_Data  GameAssembly.dll  UnityPlayer.dll
```

No file changes, not stored here, Let's check the user directory (%AppData% in this case).
```
$ ls
com.unity.addressables	Player-prev.log		Svg9jyLr
Player.log		RemoteConfigCache.json	Unity
```

There's this suspicious file, "Svg9jyLr", which is about 4kb. <br> But this must be some kind of backup, deleting it doesn't delete my save, and it gets regenerated after running the game, so let's continue.

That leaves one option, the registry. Wine has a regedit program, so we will use that.


![image](collection/1690208234/pictures/image1.png)

There we go! This seems like actual (hidden) data. Looking at the data sizes there's one element that's about 9kb of information, about what we would expect for a game like this (but it seems inflated from the backup I thought I found?).

## Step 2, understanding the save file.
Converting this hex to string, we would expect a bunch of unprintable characters.
Instead we see this pattern:
```
6fjOzmlzzyqP0I8I7?emlpfpJZ5garqMk3
28mi3Zkpk?avv5SN8mwvx8gM8yMLP5BHcd
I?q9zoWqKNcjYg7hYElU9jKroOk?m62h1Y
L7UyjHB+dW638AJmMwL?xzEaD2fwzosMH2
xGskIp+TrRG?NSoJN6sWSpB88x0+DkAYiy
lS4?DGVnKvabuPmNlVxfhG3qtu2Cs?+uRh
WWDp1WMvBpByVG/API8PY?PZvPp18glIGQ
5EBfGrf8HvIsN?+WhOKZFAjF4Thd5Cd...
```
This looks like normal text, this is actually base64! We can tell by the limited character set and the fact it's only text instead of the raw data we would expect. This is a weird choice as the registry key is designed to store raw data and would be completely fine with storing it without this base64 encoding.

Since base64 splits all bytes into 6 bits, it will waste 2 bits of storage for every byte that it stores. (9kb * 6/8) = 6.7kb, much closer to the correctly stored data from the backup. Deleting it does remove my profile in the game!

So what now? Decoding the Base64 leads to garbage bytes with no readable strings, this implies it's encrypted, are we now stuck?

The next step is the lengthy one, we are going to have to read some assemblies. Since this Unity game uses the feature Il2cpp, we will need to use [Il2cppdumper](https://github.com/Perfare/Il2CppDumper). Once we have dumped the DLLs by selecting the executable and the metadata, we now have a "DummyDil" directory containing .dll files we can explore with [ILSpy](https://github.com/icsharpcode/AvaloniaILSpy) (Linux build)

![Image](collection/1690208234/pictures/image2.png)

Now we can explore the internal data structures and objects. 
Eventually after searching random keywords and exploring random assemblies I found a very interesting file. It was from an assembly named AvoEx AesEncryptor, not a builtin library.

![Image](collection/1690208234/pictures/image3.png)

We now know the keysize, and the IV size, even the key! The issue now is, we don't know how the data is stored. With this information I decided to google the name, turns out it's a [free unity addon](https://assetstore.unity.com/packages/tools/aesencryptor-39501) for developers to use.
 
![Image](collection/1690208234/pictures/image4.png)

This tells us the keysize (32 bytes, 256 bits) and the IV size, 16 bytes. Since it's free, we can just download it. Doing so gives me a single .cs file. <br>Here is the decryption function
```
public static byte[] Decrypt(byte[] buffer)
{
    byte[] iv = buffer.Take(IvLength).ToArray();
    using (ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, iv))
    {
        return decryptor.TransformFinalBlock(buffer, IvLength, buffer.Length - IvLength);
    }
}
```


We know this library uses [AesManaged](https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.aesmanaged?view=net-7.0), which uses AES in the cbc mode.


This is the last we needed to decrypt, we now know that the first 16 bytes are the iv, followed by the ciphertext. Since the keysize is 32 bytes, we know we are dealing with AES-256, (32 bytes * 8 bits).

I don't really know c#, or even like it, but since AES CBC is a standard algorithm that has a specific implementation we can use any language that implements it. Including, my favorite, Rust.

## Step 3, writing the editor

We can write a function that implements the 256 bit cbc cipher.
```
fn decrypt(cipher_bytes: &[u8], iv: &[u8]) -> Result<String, Box<dyn error::Error>> {
    let mut encrypted_data = cipher_bytes.to_owned();
    let cipher = Aes256Cbc::new_from_slices(SAVE_KEY, iv)?;
    cipher.decrypt(&mut encrypted_data).unwrap().to_vec();
    Ok(String::from_utf8(encrypted_data)?)
}
```
Now it's simple to extract the IV.
```  
let (iv, cipher_bytes) = decoded.split_at(IV_SIZE);
let decrypted = decrypt(cipher_bytes, iv).unwrap();
```
Now we can print it.
```
println!("{}", decrypted)
```



```
$ wine dump_save.exe
{"UserID":"q2nsb-jd3237-qq395","UserPS":null,"Soulstone":{"paid":0.0,"gain":0.0,"used":0.0},"GoldenShard":{"paid":0.0,"gain":0.0,"used":0.0},"FlagOfDeath":{"gain":0.0,"used":0.0},"DarkStudy":{"gain":0.0,"used":0.0},"SeasonPoint":{"SE00000
1":{"gain":0.0,"used":0.0},"SE0...
```

Annnnnd tada! 🎉🎉🎉

Raw json data, very wasteful but useful for us! We can simply write parse the json and write values.

I'm not going bore you with the implementation, I used the serde_json crate and just wrote to the json dump, lets write 999999999 to our Soulstone[gain] value.

We can simply do what we did to decrypt in reverse.
```
fn encrypt(plain_text: &[u8], iv: &[u8]) -> Result<Vec<u8>, Box<dyn error::Error>> {
    let bytes = plain_text.to_owned();
    let cipher = Aes256Cbc::new_from_slices(SAVE_KEY, iv)?;
    Ok(cipher.encrypt_vec(&bytes))
}
```

![Image](collection/1690208234/pictures/image5.png)

And there we have it, we have all we need for building a save editor. Actually, I already made one, available on my [GitHub](https://github.com/CredibleOpossum/buriedbournes-save-editor)

For the most part, I got really lucky. But this would've still been possible without the C# and open source library, just more inspection and headaches. This game is really fun, I recommend it if you like rougelites.
