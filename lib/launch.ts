/*
 * Copyright 2021 Jacob Juric
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from "path";
import cachedir from "cachedir";
import spawn from "cross-spawn";
import { getConfig } from "./config";
import downloadGwenWeb from "./download";
import { fileExists } from "./files";
import getDesiredVersion from "./version";

export async function run(): Promise<void> {
  try {
    const config = await getConfig();

    const scriptName = process.platform === "win32" ? "gwen.bat" : "gwen";
    const version = await getDesiredVersion(config);
    const gwenArgs = process.argv.splice(2);

    const majorVersion = parseInt(version.charAt(0));
    if (gwenArgs.includes("init") && majorVersion < 3) {
      console.log(
        'The "init" command is only supported on Gwen-Web v3.0.0 and higher.'
      );
      process.exit(1);
    }

    const pathToScript = path.join(
      cachedir("gwen-web"),
      `gwen-web-${version}`,
      "bin",
      scriptName
    );

    if (!(await fileExists(pathToScript))) {
      const repo = version.includes("SNAPSHOT")
        ? config.mavenSnapshotRepo
        : config.mavenRepo;
      await downloadGwenWeb(version, repo);
    }

    const result = spawn.sync(pathToScript, gwenArgs, {
      stdio: "inherit",
    });

    process.exit(result.status ?? 0);
  } catch (e) {
    if (e instanceof Error) console.log(e.message);
    process.exit(1);
  }
}
