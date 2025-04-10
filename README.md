# JuliJS
The first [Julk](https://github.com/sufremoak/julk) Framework

## Features

### Additional Julk syntax

```jlk
call("$npmPath/node_modules/julijs/@.jlk")
jinit main

jimport "julijs/subprocess.js"

subprocess.run("echo", "'Hello from JuliJS!'")
jexit 0
```
### JavaScript companion!
```javascript
// mymodule.julk.js
import { module, init, jscript, exportJulk } from "julijs";

function mod() {
    module(new Module);
    module.function sayhi() {
        module.nativeFn(println("Hi from myModule!"\n));
        jscript.export(this);
    }
    init(module) {
        jscript() => { const script = `
        call("$npmPath/node_modules/julijs/@.jlk")
        jinit __module__ : module++

        jdef module():
            def module alias(module Initializer *javascript)
            jcall sayhi()
        
        jinit if name++ == "__main__":
            call(self -:> module())
        ` }
    }
}

module.init(script);
exportJulk(mod as "myModule")
```