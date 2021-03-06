/*
**  ComponentJS-MVC -- Model-View-Controller Component Roles
**  Copyright (c) 2016-2018 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export default function (MVC) {
    /*  abstract class for components of role View  */
    return class View extends MVC.Component {
        /*  expose convenience reference to jQuery  */
        $ (...args) {
            if (typeof MVC.jQuery !== "function")
                throw new Error("$: requires jQuery")
            return MVC.jQuery(...args)
        }

        /*  create a view mask with Vue  */
        mask (id, options = {}) {
            /*  sanity check run-time  */
            if (!MVC.ComponentJS.plugin("vue"))
                throw new Error("mask: requires ComponentJS Vue plugin")

            /*  allow convenient passing the result object of Vue.compile()  */
            if (   typeof options.render === "object"
                && typeof options.render.render === "function"
                && typeof options.render.staticRenderFns === "object"
                && options.render.staticRenderFns instanceof Array   ) {
                let { render, staticRenderFns } = options.render
                options.render          = render
                options.staticRenderFns = staticRenderFns
            }

            /*  provide a template fallback via jQuery Markup  */
            if (   options.template === undefined
                && options.render   === undefined) {
                if (typeof MVC.jQuery !== "function")
                    throw new Error("mask: template-by-id requires jQuery")
                if (typeof MVC.jQuery.markup !== "function")
                    throw new Error("mask: template-by-id requires jQuery Markup")
                options.template = MVC.jQuery.markup.render(id)
            }

            /*  allow others to hook into our processing initially  */
            MVC.hook("mask:vue-options", "none", { comp: MVC.ComponentJS(this), id: id, options: options })

            /*  pass-through options to ComponentJS-Vue plugin  */
            let spool = MVC.ComponentJS(this).state()
            let mask  = MVC.ComponentJS(this).vue(options, spool)

            /*  allow others to hook into our processing finally  */
            MVC.hook("mask:vue-result", "none", { comp: MVC.ComponentJS(this), id: id, mask: mask })

            /*  return the Vue mask object  */
            return mask
        }

        /*  wrap socket-related methods  */
        socket (...args) {
            if (   args.length === 3
                && typeof args[0] === "object"
                && typeof args[1] === "function"
                && typeof args[2] === "function")
                args = { ctx: args[0], plug: args[1], unplug: args[2] }
            else if (args.length === 1 && typeof args[0] === "object")
                args = args[0]
            else
                throw new Error("socket: invalid arguments")
            if (args.spool === undefined)
                args.spool = MVC.ComponentJS(this).state()
            return MVC.ComponentJS(this).socket(args)
        }
        link (...args) {
            if (   args.length === 2
                && typeof args[0] === "object"
                && typeof args[1] === "string")
                args = { target: args[0], socket: args[1] }
            else if (args.length === 1 && typeof args[0] === "object")
                args = args[0]
            else
                throw new Error("link: invalid arguments")
            if (args.spool === undefined)
                args.spool = MVC.ComponentJS(this).state()
            return MVC.ComponentJS(this).link(args)
        }
        plug (...args) {
            if (!(   args.length === 1
                  && typeof args[0] === "object"
                  && args[0].object !== undefined))
                args = { object: args[0] }
            else if (args.length === 1 && typeof args[0] === "object")
                args = args[0]
            else
                throw new Error("plug: invalid arguments")
            if (args.spool === undefined)
                args.spool = MVC.ComponentJS(this).state()
            return MVC.ComponentJS(this).plug(args)
        }
    }
}

