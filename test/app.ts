import { main } from "../src/entry.ts"; 
import { defineModule } from "../src/modules.ts";

const solid = defineModule({
	name: "solid",
	setup: async (ultra) => {
		ultra.vfs.add({
			path: "/static/index.html",
			contents: () => "<h1>Hello World</h1>"
		})
	}
})

main({
	modules: [
		solid
	],
})