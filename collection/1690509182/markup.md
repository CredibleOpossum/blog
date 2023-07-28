# How this website works
This is static website, but still does some interesting stuff (in my opinion). Because the website is static, I can't just lookup the files to find my articles for listing them, I actually use a JSON file for this.
Example
```
{
	"1690208234": "Writing a save editor for a unity game",
	"1690227128": "Creating a shared library in brainfuck",
	"1690509182": "How this website works"
}
```
Where the ID refers to the location of the page in the /collection/ directory.

This website isn't actually written in HTML, it uses a technology called showdown to convert markup to HTML which is then rendered by the browser. It also sadly requires JavaScript but what websites don't. Once showdown is loaded it uses a package called HighlightJS to make the code blocks have highlighting.

Example
```
fn main() {
    let vaild_words: HashSet<&str> = include_str!("../possible_words.txt").lines().collect();
    let possible_answers: Vec<&str> = include_str!("../possible_answers.txt").lines().collect();

    let mut rng = rand::thread_rng();

    'outer: loop {
        let word: String = possible_answers.choose(&mut rng).unwrap().to_string();
        let mut guesses = 0;
        let mut previous_guesses: Vec<(String, [KeyResult; 5])> = Vec::new();

        clear();
        print_title();
        instructions();

        loop {
            for entry in &previous_guesses {
                print_guess(&entry.0, entry.1)
            }
            let guess: String = read!("{}\n");
            if !get_guess(&guess, &vaild_words, &previous_guesses, &word) {
                continue;
            }

            guesses += 1;
            if guess == word {
                loop {
                    clear();
                    for entry in &previous_guesses {
                        print_guess(&entry.0, entry.1)
                    }
                    print_guess(&guess, [KeyResult::CorrectPosition; 5]);
                    println!("You've won! Guesses: {}!", guesses);
                    println!("Press enter to continue");
                    println!();
                    choice_text();
                    let choice: String = read!("{}\n");
                    match choice.as_str() {
                        "1" => continue / Vaild words, you must guess a word in this list'outer,templating 
                        "2" => {
                            clear();
                            instructions();

                            println!("Press enter to continue");
                            let _: String = read!("{}\n");
                        }
                        "3" => break 'outer,
                        _ => {}
                    }
                }
            }

            previous_guesses.push((guess.clone(), compare(&guess, &word)));
        }
    }
}
```
Another interesting effect of this is the fact this website doesn't actually load a HTML file when you link to a specific blog, for example the blog <br>
https://credibleopossum.github.io/blog/?id=1690208234 <br>
it just has a URL parameter to specify the specific id.
## Benefits?

The best benefit to me is simplicity, it's very easy to write and format these documents, compared to HTML, it's also much easier for me to read the raw markup and understand what it will look like when rendered. Because markup is also much more concise than HTML, it is also much smaller, once showdown and 

## Issues?

I haven't encountered many issues with this approach. <br> The biggest problem so far is looking for resources, when I add images, I cannot use relative directories such as "./photos/image.png" and must use "/collection/{id}/photos/image.png" but this is pretty minor and I may decide to use some form of templates to make this functionality.

## Software?

I use [ghostwriter](https://ghostwriter.kde.org/) to write the markup, letting me preview it and I use VSCode for all of the HTML and JavaScript of the website. I test the website by simply using the python web server by running
```
python3 -m http.server
```
which is enough to run it.

## Plans?
I don't have too many ideas to expand it, I like the simplicity and lack of constant maintenance. I would like to make it look better, mostly by just adding CSS and maybe a bit of HTML, I would like to make the most possible still stay in markdown however. If I feel it would benefit the site, I might implement a templating system (like mentioned before) to give myself more options when working with the markup, but this would come at the cost of needing to maintain it. 
