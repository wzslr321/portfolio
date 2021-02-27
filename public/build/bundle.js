
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Main/MainHeader.svelte generated by Svelte v3.32.3 */

    const file = "src/Main/MainHeader.svelte";

    function create_fragment(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let h2;
    	let t3;
    	let link0;
    	let link1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Wiktor Zając";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Programming Enthusiast who loves to learn new things.";
    			t3 = space();
    			link0 = element("link");
    			link1 = element("link");
    			attr_dev(h1, "class", "svelte-1p7b9j8");
    			add_location(h1, file, 2, 4, 14);
    			attr_dev(h2, "class", "svelte-1p7b9j8");
    			add_location(h2, file, 4, 4, 43);
    			attr_dev(header, "class", "svelte-1p7b9j8");
    			add_location(header, file, 0, 0, 0);
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.gstatic.com");
    			add_location(link0, file, 9, 4, 138);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css2?family=Roboto:wght@100;300&display=swap");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file, 10, 4, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, h2);
    			insert_dev(target, t3, anchor);
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t3);
    			detach_dev(link0);
    			detach_dev(link1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MainHeader", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MainHeader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MainHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainHeader",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Main/About.svelte generated by Svelte v3.32.3 */

    const file$1 = "src/Main/About.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let section;
    	let p0;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let t4;
    	let t5;
    	let p1;
    	let t6;
    	let span2;
    	let t8;
    	let span3;
    	let t10;
    	let span4;
    	let t12;
    	let span5;
    	let t14;
    	let span6;
    	let t16;
    	let span7;
    	let t18;
    	let span8;
    	let t20;
    	let aside;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			p0 = element("p");
    			t0 = text("I am a High School student, in the past I have mostly focused\n        on getting knowledge and experience in Web Development, using\n        ");
    			span0 = element("span");
    			span0.textContent = "HTML, CSS";
    			t2 = text("\n        and\n        ");
    			span1 = element("span");
    			span1.textContent = "Javascript";
    			t4 = text(".");
    			t5 = space();
    			p1 = element("p");
    			t6 = text("Currently my main goal is Mobile Development with\n        ");
    			span2 = element("span");
    			span2.textContent = "Flutter";
    			t8 = text("\n        and\n        ");
    			span3 = element("span");
    			span3.textContent = "Golang";
    			t10 = text(".\n        I also enjoy\n        ");
    			span4 = element("span");
    			span4.textContent = "Assembly";
    			t12 = text(",\n        after which I am going to learn the\n        ");
    			span5 = element("span");
    			span5.textContent = "C";
    			t14 = text("\n        language. As database I use\n        ");
    			span6 = element("span");
    			span6.textContent = "MongoDB";
    			t16 = text("\n        or\n        ");
    			span7 = element("span");
    			span7.textContent = "PostgreSQL";
    			t18 = text("\n        and I containerize it all with\n        ");
    			span8 = element("span");
    			span8.textContent = "Docker";
    			t20 = space();
    			aside = element("aside");
    			img = element("img");
    			attr_dev(span0, "class", "highlighted-text");
    			add_location(span0, file$1, 5, 8, 179);
    			attr_dev(span1, "class", "highlighted-text");
    			add_location(span1, file$1, 7, 8, 249);
    			add_location(p0, file$1, 2, 6, 27);
    			attr_dev(span2, "class", "highlighted-text");
    			add_location(span2, file$1, 11, 8, 387);
    			attr_dev(span3, "class", "highlighted-text");
    			add_location(span3, file$1, 13, 8, 455);
    			attr_dev(span4, "class", "highlighted-text");
    			add_location(span4, file$1, 15, 8, 531);
    			attr_dev(span5, "class", "highlighted-text");
    			add_location(span5, file$1, 17, 8, 632);
    			attr_dev(span6, "class", "highlighted-text");
    			add_location(span6, file$1, 19, 8, 717);
    			attr_dev(span7, "class", "highlighted-text");
    			add_location(span7, file$1, 21, 8, 783);
    			attr_dev(span8, "class", "highlighted-text");
    			add_location(span8, file$1, 23, 8, 880);
    			add_location(p1, file$1, 9, 6, 317);
    			attr_dev(section, "class", "svelte-f809rk");
    			add_location(section, file$1, 1, 4, 11);
    			if (img.src !== (img_src_value = "images/myself.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "myself");
    			attr_dev(img, "class", "svelte-f809rk");
    			add_location(img, file$1, 28, 8, 974);
    			attr_dev(aside, "class", "svelte-f809rk");
    			add_location(aside, file$1, 27, 4, 958);
    			attr_dev(main, "class", "svelte-f809rk");
    			add_location(main, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, p0);
    			append_dev(p0, t0);
    			append_dev(p0, span0);
    			append_dev(p0, t2);
    			append_dev(p0, span1);
    			append_dev(p0, t4);
    			append_dev(section, t5);
    			append_dev(section, p1);
    			append_dev(p1, t6);
    			append_dev(p1, span2);
    			append_dev(p1, t8);
    			append_dev(p1, span3);
    			append_dev(p1, t10);
    			append_dev(p1, span4);
    			append_dev(p1, t12);
    			append_dev(p1, span5);
    			append_dev(p1, t14);
    			append_dev(p1, span6);
    			append_dev(p1, t16);
    			append_dev(p1, span7);
    			append_dev(p1, t18);
    			append_dev(p1, span8);
    			append_dev(main, t20);
    			append_dev(main, aside);
    			append_dev(aside, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Curiosities/Donut.svelte generated by Svelte v3.32.3 */
    const file$2 = "src/Curiosities/Donut.svelte";

    function create_fragment$2(ctx) {
    	let section1;
    	let header;
    	let h3;
    	let t1;
    	let p;
    	let t3;
    	let section0;
    	let article0;
    	let img;
    	let img_src_value;
    	let t4;
    	let article1;
    	let pre;

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			header = element("header");
    			h3 = element("h3");
    			h3.textContent = "I try to look on programming from a more interesting side.";
    			t1 = space();
    			p = element("p");
    			p.textContent = "For example, look at this cool donut shaped code which generates spinning donut!";
    			t3 = space();
    			section0 = element("section");
    			article0 = element("article");
    			img = element("img");
    			t4 = space();
    			article1 = element("article");
    			pre = element("pre");
    			attr_dev(h3, "class", "svelte-yqyc86");
    			add_location(h3, file$2, 38, 8, 1408);
    			attr_dev(p, "class", "svelte-yqyc86");
    			add_location(p, file$2, 39, 8, 1484);
    			attr_dev(header, "class", "svelte-yqyc86");
    			add_location(header, file$2, 37, 4, 1391);
    			if (img.src !== (img_src_value = "images/donut.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "donut");
    			add_location(img, file$2, 43, 12, 1630);
    			attr_dev(article0, "class", "svelte-yqyc86");
    			add_location(article0, file$2, 42, 8, 1608);
    			attr_dev(pre, "class", "center");
    			attr_dev(pre, "id", "d");
    			add_location(pre, file$2, 46, 12, 1740);
    			attr_dev(article1, "class", "container svelte-yqyc86");
    			add_location(article1, file$2, 45, 8, 1700);
    			attr_dev(section0, "class", "svelte-yqyc86");
    			add_location(section0, file$2, 41, 4, 1590);
    			attr_dev(section1, "class", "svelte-yqyc86");
    			add_location(section1, file$2, 36, 0, 1377);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, header);
    			append_dev(header, h3);
    			append_dev(header, t1);
    			append_dev(header, p);
    			append_dev(section1, t3);
    			append_dev(section1, section0);
    			append_dev(section0, article0);
    			append_dev(article0, img);
    			append_dev(section0, t4);
    			append_dev(section0, article1);
    			append_dev(article1, pre);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Donut", slots, []);

    	onMount(() => {
    		const preTag = document.querySelector("pre");
    		let A = 1, B = 1;

    		const asciiFrame = () => {
    			let b = [];
    			let z = [];
    			A += 0.07;
    			B += 0.03;
    			let cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);

    			for (let k = 0; k < 1760; k++) {
    				b[k] = k % 80 == 79 ? "\n" : " ";
    				z[k] = 0;
    			}

    			for (let j = 0; j < 6.28; j += 0.07) {
    				let ct = Math.cos(j), st = Math.sin(j);

    				for (let i = 0; i < 6.28; i += 0.02) {
    					let sp = Math.sin(i),
    						cp = Math.cos(i),
    						h = ct + 2,
    						D = 1 / (sp * h * sA + st * cA + 5),
    						t = sp * h * cA - st * sA;

    					let x = 0 | 40 + 30 * D * (cp * h * cB - t * sB),
    						y = 0 | 12 + 15 * D * (cp * h * sB + t * cB),
    						o = x + 80 * y,
    						N = 0 | 8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB);

    					if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
    						z[o] = D;
    						b[o] = (".,-~:;=!*#$@")[N > 0 ? N : 0];
    					}
    				}
    			}

    			preTag.innerHTML = b.join("");
    		};

    		setInterval(asciiFrame, 50);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Donut> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount });
    	return [];
    }

    class Donut extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Donut",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Curiosities/Overflow.svelte generated by Svelte v3.32.3 */

    const file$3 = "src/Curiosities/Overflow.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let a;
    	let p;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let t4;

    	const block = {
    		c: function create() {
    			section = element("section");
    			a = element("a");
    			p = element("p");
    			t0 = text("Or did you know that computer can return number\n            ");
    			span0 = element("span");
    			span0.textContent = "127";
    			t2 = text("\n            as result of calculation\n            ");
    			span1 = element("span");
    			span1.textContent = "-128 - 1";
    			t4 = text(" ?");
    			attr_dev(span0, "class", "highlighted-text");
    			add_location(span0, file$3, 3, 12, 160);
    			attr_dev(span1, "class", "highlighted-text");
    			add_location(span1, file$3, 5, 12, 253);
    			attr_dev(p, "class", "svelte-1xprfje");
    			add_location(p, file$3, 2, 8, 96);
    			attr_dev(a, "href", "https://en.wikipedia.org/wiki/Integer_overflow");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1xprfje");
    			add_location(a, file$3, 1, 4, 14);
    			attr_dev(section, "class", "svelte-1xprfje");
    			add_location(section, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, a);
    			append_dev(a, p);
    			append_dev(p, t0);
    			append_dev(p, span0);
    			append_dev(p, t2);
    			append_dev(p, span1);
    			append_dev(p, t4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Overflow", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Overflow> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Overflow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overflow",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Main/SectionHeader.svelte generated by Svelte v3.32.3 */

    const file$4 = "src/Main/SectionHeader.svelte";

    function create_fragment$4(ctx) {
    	let header;
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h2 = element("h2");
    			t = text(/*textContent*/ ctx[0]);
    			attr_dev(h2, "class", "svelte-pvejqo");
    			add_location(h2, file$4, 4, 4, 66);
    			attr_dev(header, "class", "svelte-pvejqo");
    			add_location(header, file$4, 3, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h2);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textContent*/ 1) set_data_dev(t, /*textContent*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SectionHeader", slots, []);
    	let { textContent } = $$props;
    	const writable_props = ["textContent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("textContent" in $$props) $$invalidate(0, textContent = $$props.textContent);
    	};

    	$$self.$capture_state = () => ({ textContent });

    	$$self.$inject_state = $$props => {
    		if ("textContent" in $$props) $$invalidate(0, textContent = $$props.textContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [textContent];
    }

    class SectionHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { textContent: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionHeader",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*textContent*/ ctx[0] === undefined && !("textContent" in props)) {
    			console.warn("<SectionHeader> was created without expected prop 'textContent'");
    		}
    	}

    	get textContent() {
    		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textContent(value) {
    		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Experience/Github.svelte generated by Svelte v3.32.3 */
    const file$5 = "src/Experience/Github.svelte";

    function create_fragment$5(ctx) {
    	let section1;
    	let sectionheader;
    	let t0;
    	let section0;
    	let a;
    	let img;
    	let img_src_value;
    	let t1;
    	let article;
    	let t2;
    	let span;
    	let t4;
    	let current;

    	sectionheader = new SectionHeader({
    			props: { textContent: "My Experience" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			create_component(sectionheader.$$.fragment);
    			t0 = space();
    			section0 = element("section");
    			a = element("a");
    			img = element("img");
    			t1 = space();
    			article = element("article");
    			t2 = text("I don't have projects that run live in the web. I've focused\n            only on personal projects to learn new things, till now. The icon on the left redirects\n            to my\n            ");
    			span = element("span");
    			span.textContent = "Github Profile";
    			t4 = text("\n            with all the public code I wrote so far!");
    			if (img.src !== (img_src_value = "images/github-icon.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Github Icon");
    			add_location(img, file$5, 9, 12, 228);
    			attr_dev(a, "href", "https://github.com/wzslr321");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 8, 8, 161);
    			attr_dev(span, "class", "highlighted-text");
    			add_location(span, file$5, 16, 12, 518);
    			attr_dev(article, "class", "svelte-fvvkal");
    			add_location(article, file$5, 12, 8, 305);
    			attr_dev(section0, "class", "svelte-fvvkal");
    			add_location(section0, file$5, 7, 4, 143);
    			attr_dev(section1, "class", "svelte-fvvkal");
    			add_location(section1, file$5, 4, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			mount_component(sectionheader, section1, null);
    			append_dev(section1, t0);
    			append_dev(section1, section0);
    			append_dev(section0, a);
    			append_dev(a, img);
    			append_dev(section0, t1);
    			append_dev(section0, article);
    			append_dev(article, t2);
    			append_dev(article, span);
    			append_dev(article, t4);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			destroy_component(sectionheader);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Github", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Github> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SectionHeader });
    	return [];
    }

    class Github extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Github",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Contact/Contact.svelte generated by Svelte v3.32.3 */
    const file$6 = "src/Contact/Contact.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let sectionheader;
    	let t0;
    	let article;
    	let p0;
    	let t1;
    	let span0;
    	let t3;
    	let p1;
    	let t4;
    	let a;
    	let span1;
    	let current;

    	sectionheader = new SectionHeader({
    			props: { textContent: "Contact Me" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(sectionheader.$$.fragment);
    			t0 = space();
    			article = element("article");
    			p0 = element("p");
    			t1 = text("Reach me via e-mail:\n            ");
    			span0 = element("span");
    			span0.textContent = "wiktor.zajac888@gmail.com";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Or through the Facebook:\n            ");
    			a = element("a");
    			span1 = element("span");
    			span1.textContent = "Wiktor Zając";
    			attr_dev(span0, "class", "highlighted-text");
    			add_location(span0, file$6, 9, 12, 206);
    			add_location(p0, file$6, 7, 8, 157);
    			attr_dev(span1, "class", "highlighted-text");
    			add_location(span1, file$6, 16, 12, 436);
    			attr_dev(a, "href", "https://www.facebook.com/wiktor.zajac.96/");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-rjzjr8");
    			add_location(a, file$6, 15, 12, 355);
    			add_location(p1, file$6, 14, 8, 314);
    			attr_dev(article, "class", "svelte-rjzjr8");
    			add_location(article, file$6, 6, 4, 139);
    			attr_dev(section, "class", "svelte-rjzjr8");
    			add_location(section, file$6, 4, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(sectionheader, section, null);
    			append_dev(section, t0);
    			append_dev(section, article);
    			append_dev(article, p0);
    			append_dev(p0, t1);
    			append_dev(p0, span0);
    			append_dev(article, t3);
    			append_dev(article, p1);
    			append_dev(p1, t4);
    			append_dev(p1, a);
    			append_dev(a, span1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheader);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SectionHeader });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Footer/Footer.svelte generated by Svelte v3.32.3 */

    const file$7 = "src/Footer/Footer.svelte";

    function create_fragment$7(ctx) {
    	let footer;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			t0 = text("Copyright 2021 ©\n    ");
    			span = element("span");
    			span.textContent = "Wiktor Zając";
    			attr_dev(span, "class", "highlighted-text");
    			add_location(span, file$7, 2, 4, 38);
    			attr_dev(footer, "class", "svelte-1rxrx6d");
    			add_location(footer, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, t0);
    			append_dev(footer, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */

    function create_fragment$8(ctx) {
    	let header;
    	let t0;
    	let about;
    	let t1;
    	let donut;
    	let t2;
    	let overflow;
    	let t3;
    	let github;
    	let t4;
    	let contact;
    	let t5;
    	let footer;
    	let current;
    	header = new MainHeader({ $$inline: true });
    	about = new About({ $$inline: true });
    	donut = new Donut({ $$inline: true });
    	overflow = new Overflow({ $$inline: true });
    	github = new Github({ $$inline: true });
    	contact = new Contact({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			create_component(donut.$$.fragment);
    			t2 = space();
    			create_component(overflow.$$.fragment);
    			t3 = space();
    			create_component(github.$$.fragment);
    			t4 = space();
    			create_component(contact.$$.fragment);
    			t5 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(about, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(donut, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(overflow, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(github, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(contact, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(donut.$$.fragment, local);
    			transition_in(overflow.$$.fragment, local);
    			transition_in(github.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(donut.$$.fragment, local);
    			transition_out(overflow.$$.fragment, local);
    			transition_out(github.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(about, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(donut, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(overflow, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(github, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(contact, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header: MainHeader,
    		About,
    		Donut,
    		Overflow,
    		Github,
    		Contact,
    		Footer
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
