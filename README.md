# :zap: CSS `<body>` Components

`<link>` in `<body>` task for faster critical content, progressive loading, and minimized re-calc'd layouts.<br>
Run the thing, get the speed.

### :warning: WIP
This project is in super WIP form and is kind of destructive so 1) don't use it yet 2) **don't** use it on anything that isn't thoroughly backed up.
I'm just messing around with this stuff to see if there are any glaring caveats in the technique right now.

In particular all **the path flags are insanely screwy right now**. I want to confirm this is a cool project (with speed tests) before putting a ton of work into making it nice/intuitive.

Check out the [example](example) folder and the package.json `example` script to see how the example folder was generated from src to dist.

### Installation
`npm install --save-dev css-body-components`

### Usage
`$ css-body-components foo.html`

This will output a modified version of `foo.html` to `markup/dist/foo.html` with duplicate `<link>`s removed and if there are 5+ stylesheets it will concatenate the rest into one fat stylesheet.

#### Options
- `--markup-dist` default: `markup/dist`
- `--css-src` default: `css/src`
- `--css-dist` default: `css/dist`
- `--max-stylesheets` default: `5`

### What?
According to Jake Archibald (some guy who works at Google and taught us how to [animate SVG lines](https://jakearchibald.com/2013/animated-line-drawing-svg/)),
we should put `<link>` tags (like stylesheets) **inside** our `<body>` tag.

### Why `<link>` in `<body>`?
Well, read his **[article on the technique](https://jakearchibald.com/2016/link-in-body)**. It's pretty good and an easy read.

TL;DR We can put stylesheets right above the areas they style for some quick/amazing performance wins:

1. This makes the browser load the style, _then_ the area it's gonna style so there aren't relayouts (research shows that people haaaate relayout).
2. This gets [critical content](https://css-tricks.com/authoring-critical-fold-css) (stuff the user is likely to see first) to people very quickly.
3. You're only loading the CSS you need to load instead of 30 `@import`'d stylesheets.
4. HTTP/2 (supported in every major browser if you set it up on your end with SSL or something) is happy to download all kinds of stuff in unison (async) instead of just 1 huge file or cache it or something. I dunno. [Sounds good though!](https://i.imgur.com/5wWLxgl.png)

### So what's the point of this task?
A bunch of people in the comments of that article mentioned some valid caveats to the approach:

> #### How do we know when to sprinkle `<link>` tags?

It's probably a good idea to preprepend all component markup with them. What you determine is a component is up to you. Components are pretty cool though and we should probably migrate that way.
Here's [a video](https://www.youtube.com/watch?v=m0oMHG6ZXvo) of Nicolas Gallagher (normalize.css) talking about that stuff. Nicolas also works on SuitCSS which will help you learn to identify components.
Personally I'm currently digging Ben Frain's [Enduring CSS](https://benfrain.com/enduring-css-writing-style-sheets-rapidly-changing-long-lived-projects/) book which actually makes CSS very maintainable.

I think a good rule of thumb is to always add a component `<link>` directly above component markup. This makes the component highly modular as you can just cut/paste it anywhere and it'll Just Work™.

> #### But what if we accidentally put a duplicate `<link>` tag in there? Won't it be parsed again?

Yeah it will. Luckily this task parses over all your markup for duplicate `<link>`s and removes the duplicates (leaving the first one it encountered so you don't lose styles).

> #### What about HTTP requests? Aren't a lot of them bad?

I dunno tbh. I think it depends on if you're on HTTP2/SPDY or old crappy HTTP. I think HTTP/2 loves requests and is happy to download tons of stuff in parallel.
I know the whole "condense all my CSS to one file and condense all my JS to one file" thing is wrong though. I know browsers have the ability to download, at least a few things, in parallel,
and by condensing everything down to 1 or 2 **huge** files, we're just throwing away that parallel download ability.

Maybe more importantly, with 1 or 2 huge downloads, we're blocking critical content from loading. I think Apple did some research on perceived speed and found out it was
just as good as real speed.

Imagine you go to a website and it just shows you a white screen for 5 seconds before it loads anything. That sucks and there's plenty of
research that says users will flat-out leave your website after a second or two. On the other hand, imagine you go to a website and within a few hundred milliseconds
you can see the top of the page in all it's glory. By the time you begin scrolling down, the rest of the page has been loaded.

I'm definitely on board for that kind of optimization.

Oh, but yeah, this task takes care of that too. If you care about how many http requests your CSS is making, you can set `--max-stylesheets` to something like `3` and you're good.

It will do its thing where it makes sure there are no duplicates, then for the last stylesheet it will combine all the remaining non-duplicate stylesheets into a fat stylesheet.

It also alphabetically orders the fat stylesheet's filename. Why? So that it gets cached, and if that particular combination of components ends up being a fat stylesheet, the browser will be able to fetch the cached one.

Sound unlikely? Imagine you have a simple website and only have a dozen components you're working with. Now imagine you're typically only grouping 2-3 components into a fat stylesheet. Not too crazy.

### Huge Takeaways
- This makes your critical content load faster.
- This eliminates relayout.
- This adheres to the modular component philosophy the best CSS minds are rapidly flocking to.
- This task solves the valid complaints with it.

### Project Wishlist
- Confirm it's a good idea/tool with real speed tests on a plethora of types of sites.
- Convert to ES6
- Pretty up the CLI
- Fix path flags omg...
- Testing/coverage
- Make a little/simple website to put the README ramblings and other educational resources on.
- Once it's thoroughly tested, add a `--fix` flag to operate on src markup directly. This kinda screws with the modularity of components, but I'm sure a lot of people would like it.
- Figure out how to expose as a Node module.
- Figure out how to stdout single files so people can pipe them and such. I hear people love that kinda stuff.
- Get some :zzz:...
