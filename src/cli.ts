const mode = Deno.args[0] ?? "init";

function runCommand(command: string) {
  const c = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "./app.ts", command],
    stdout: "piped",
  });
  const p = c.spawn();
  p.stdout?.pipeTo(Deno.stdout.writable);
  return p;
}

try {
  const config = JSON.parse(await Deno.readTextFile("deno.jsonc"));
  config.imports["#ultra"] = "./ultra";
  config.imports["#ultra/"] = "./ultra/";
	config.lock = false;
	config.tasks ??= {}
	config.tasks.dev = "deno run -A ../src/cli.ts dev"
  await Deno.writeTextFile("deno.jsonc", JSON.stringify(config, null, 2));
} catch {
  await Deno.writeTextFile(
    "deno.jsonc",
    JSON.stringify({
      imports: {
        "#ultra": "./ultra",
        "#ultra/": "./ultra/",
      },
			"tasks": {
				"dev": "deno run -A ../src/cli.ts dev"
			},
			"lock": false
    }, null, 2),
  );
}

runCommand(mode);
