## Creating a shared library in BrainFuck.

I was having a conversion with a friend when the concept of obfuscation game up (we are normal I swear), my friend made a joke that he would simply just write his libraries in brainfuck. This made me wonder if it would be even possible to make a usable binding, and if so, would it be hard to reverse engineer?

### Goals
- Keep the majority possible in brainfuck.
- Export a symbol that does some recognizable action (adding, factorial, etc)

### Enviroment
Now, I've [already written a (somewhat) optimised brainfuck interpreter](https://crates.io/crates/bf-fast), because of course I have. So I'll use it.

First we need to create a library
```
cargo new brainfucklib --lib
```

This is what I came up with for a start.

```
use bf_fast::evaluate;

pub fn hi_from_bf() -> [u8; 30_000] {
    let mut memory = [0; 30_000];
    evaluate(&mut memory, "-[------->+<]>-.>--[----->+<]>-.>+[------->++<]>--.>+[------->++<]>--.>+[------->++<]>+.>++++[->++++++++<]>.>+[--->++<]>+.>+[------->++<]>+.>+[--------->++<]>.>+[------->++<]>--.>--[----->+<]>--.>++++[->++++++++<]>+.", false);
    memory
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let buf = hi_from_bf();
        let output = String::from_utf8_lossy(&buf);
        assert_eq!(output.replace("\0", ""), "Hello World!")
    }
}
```
Now it's tricky, we aren't just pushing a string, we are building the array of bytes

```
$ cargo test
    Finished test [unoptimized + debuginfo] target(s) in 0.00s
     Running unittests src/lib.rs (target/debug/deps/brainfucklib-5c76c44670196fe6)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests brainfucklib

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```
It worked!


Now lets try to do something useful, something with arguments. A simple add will work.

```
pub fn add_bf(num1: u8, num2: u8) -> [u8; 30_000] {
    let mut memory = [0; 30_000];
    memory[0] = num1;
    memory[1] = num2;
    evaluate(&mut memory, "[>>+>+<<<-]>[>+>>+<<<-]>", false);
    memory
}
```
Once we add a test
```
    #[test]
    fn add() {
        let buf = add_bf(5, 7);
        assert_eq!(buf[2], 12);
    }
```

```
running 2 tests
test tests::add ... ok
test tests::hello_world ... ok
```
There we go!

To test the ability to reverse engineer, I decided to make a simple crackme using brainfuck and transpiled to Rust. <br>
Decompiling it and reading the password was trivially easy, it would likely be much harder with more logic heavy situations, but I don't want to put myself through that pain.

Decompilation
![Image](collection/1690227128/decomp.png)

The hex numbers being the characters in the password.
