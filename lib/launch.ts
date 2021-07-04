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

import childProcess from "child_process";
import path from "path";
import cachedir from "cachedir";
import downloadGwenWeb from "./download";
import { fileExists } from "./files";
import getDesiredVersion from "./version";

export async function run(): Promise<void> {
  try {
    const scriptName =
      process.platform === "win32" ? "gwen-web.bat" : "gwen-web";
    const version = await getDesiredVersion();

    const pathToScript = path.join(
      cachedir("gwen-web"),
      `gwen-web-${version}`,
      "bin",
      scriptName
    );

    if (!(await fileExists(pathToScript))) {
      await downloadGwenWeb(version);
    }

    const gwenProcess = childProcess.spawn(
      pathToScript,
      process.argv.splice(2),
      {
        shell: true,
      }
    );

    gwenProcess.stdout.pipe(process.stdout);
    gwenProcess.stderr.pipe(process.stderr);
    process.stdin.pipe(gwenProcess.stdin);
  } catch (e) {
    if (e.message) console.log(e.message);
    process.exit(1);
  }
}
