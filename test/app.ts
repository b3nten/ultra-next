import { main } from "../src/entry.ts"; 
import { defineModule } from "../src/modules.ts";

const solid = defineModule({
	name: "solid",
	setup: async (ultra) => {
		ultra.vfs.add({
			path: "/static/index.html",
			contents: () => "<body><script src='/client/test.tsx'></script></body>",
			write: false,
		})
	}
})

main({
	modules: [
		solid
	],
})