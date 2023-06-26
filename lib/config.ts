/*
 * Copyright 2021-2023 Jacob Juric
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

import { promises as fs } from "fs";

export interface Config {
  mavenRepo: string;
  mavenSnapshotRepo: string;
  version: string;
}

export async function getConfig(
  packageJsonPath = "./package.json"
): Promise<Config> {
  const packageJson = JSON.parse(
    (await fs.readFile(packageJsonPath)).toString()
  );
  const userSettings = packageJson.gwenWeb ?? {};

  return {
    mavenRepo: userSettings.mavenRepo ?? "https://repo1.maven.org/maven2/",
    mavenSnapshotRepo:
      userSettings.mavenSnapshotRepo ??
      "https://s01.oss.sonatype.org/content/repositories/snapshots/",
    version: userSettings.version ?? "latest",
  };
}
